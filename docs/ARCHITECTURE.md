# GLoW architecture

Four things in this codebase are worth understanding before changing anything:
how permissions are enforced, how booking stays correct under concurrency, how
an active workout survives losing the network, and how workout suggestions are
produced without an AI service.

---

## 1. Data access and the two adapters

Every read and write goes through one contract, `Repository`
(`src/lib/data/repository.ts`). Two adapters implement it:

| Adapter | File | When it is used |
| --- | --- | --- |
| `SupabaseRepository` | `src/lib/data/supabase-repository.ts` | Supabase URL + anon key present |
| `DemoRepository` | `src/lib/data/demo-repository.ts` | credentials absent, or `NEXT_PUBLIC_DEMO_MODE=true` |

`getRepository()` in `src/lib/auth.ts` picks one per request and caches it for
the render pass. Pages and server actions never talk to Supabase directly, so
demo mode is not a stub — it is a second, complete implementation of the same
behaviour, which is what lets the whole e2e suite run with no external service.

The pure decision logic lives in `src/lib/domain/` and is shared by both
adapters and by the UI: `booking-rules.ts`, `timer.ts`, `recommend.ts`,
`progress.ts`. These modules have no I/O and are where the unit tests point.

---

## 2. Permissions

There are three roles, stored on `memberships`: `owner`, `trainer`, `member`.

Authorization is enforced in three places, and the UI is never one of them.

### In the database (the authority)

Row Level Security is on for every private table
(`supabase/migrations/20260101000002_rls.sql`). Policies are written against
four `security definer` helpers so they stay readable and cannot recurse:

```sql
current_role_in(org)   -- the caller's role, or null
is_member_of(org)      -- active membership
is_owner_of(org)
is_staff_of(org)       -- owner or trainer
can_manage_class(id)   -- owner, or the trainer assigned to that class
```

The rules in one table:

| Data | Member | Trainer | Owner |
| --- | --- | --- | --- |
| Own profile | read / write | read / write | read / write |
| Other profiles | — | read (same org) | read (same org) |
| Published classes | read | read | read / write |
| Draft classes | — | read | read / write |
| Assigned classes | — | update | update |
| Own bookings | read | read | read |
| All bookings | — | read / write | read / write |
| Approved templates | read | read / write | read / write |
| Own workouts, sets, readiness, presets | full | full | full |
| Anyone else's workouts | **never** | **never** | **never** |
| Invitation links | — | — | full |

Workout sessions, sets, readiness logs and personal timer presets are private to
the member. There is no policy — for any role — that exposes another member's
training data.

### In server actions

Each action calls `requireUser`, `requireStaff` or `requireOwner` first, then
validates its input with a Zod schema from `src/lib/validation.ts`. Class-level
actions additionally call `assertCanManageClass`, which mirrors
`can_manage_class` so a trainer cannot edit a colleague's class even before the
database would refuse.

### On the public invitation page

`/invite/[token]` is reachable without authentication, so it never touches the
normal tables. `resolveInvite` (`src/lib/data/public-schedule.ts`) validates the
token — exists, not revoked, not expired, uses remaining — and then returns a
narrow projection: title, category, difficulty, trainer display name, location,
capacity, times, places left. No member names, no phone numbers, no booking
rows. Under Supabase this is the `public_schedule` security-definer function,
which applies the same token rules inside the database.

The service-role key is read only in `createServiceSupabase()`, which is
`server-only` and used by this one path.

### Rate limits

`allowRate(key, limit, windowMs)` is a fixed-window limiter applied to the
invitation endpoint (30/min per client), booking (20/min per member) and
sign-in (5/min per address).

---

## 3. Booking transactions

A booking must never exceed capacity, never duplicate, and must place overflow
in a stable queue. The decision is written once, as a pure function, and
enforced twice.

### The decision

`decideBooking(ctx)` in `src/lib/domain/booking-rules.ts` returns what *should*
happen, in this order:

1. class cancelled → refuse
2. class not published → refuse
3. registration closed by the owner → refuse
4. class already started → refuse
5. past the booking cutoff → refuse
6. caller already holds an active booking → refuse
7. confirmed count `<` capacity → **confirm**
8. waiting list disabled → refuse
9. otherwise → **queue** at `max(position) + 1`

`confirmed` and `attended` both occupy a seat; `cancelled` and `absent` do not.

### The enforcement

**Supabase** — `book_class(p_class_id)` is `security definer` and begins with

```sql
select * into v_class from public.classes where id = p_class_id for update;
```

That row lock serialises every concurrent booking for the class, so the
capacity check and the insert cannot interleave. `bookings` also carries
`unique (class_id, profile_id)` and a partial unique index on
`(class_id, waitlist_position) where status = 'waitlisted'`, so even a bug in
the function cannot produce a duplicate or two members sharing a queue position.

**Demo** — `DemoRepository.bookClass` runs the same decision against the
in-memory store inside a single synchronous block. JavaScript's single-threaded
execution gives the same guarantee the row lock gives Postgres. The
`never exceeds capacity under concurrent bookings` test fires five simultaneous
bookings at a two-seat class and asserts exactly two are confirmed.

### Cancellation and promotion

`cancel_booking(p_class_id, p_profile_id)` takes the same row lock and then:

1. checks the cancellation cutoff — members are bound by it, staff are not
2. marks the booking `cancelled`
3. renumbers the remaining queue so positions stay contiguous
4. if a seat is now free, promotes the first waiting member, ordered by
   `waitlist_position`, then `booked_at` as a tiebreak
5. renumbers again and writes a `waitlist_promoted` notification

`promoteFromWaitlist` is the pure version of steps 3–4 and is what the demo
adapter calls. Both are covered by the same expectations: first in the queue is
promoted, the rest are renumbered `1..n`, and nobody is promoted while the class
is still full.

### Optimistic updates

`BookingButton` predicts the outcome (`confirmed`, or `waitlisted` when the card
already reads full) and paints it immediately. When the server action returns it
**reconciles**: on failure it restores the previous state and shows the Hebrew
reason; on success it adopts the server's actual status — which may differ from
the prediction if someone else took the last seat first — then refreshes the
route so the capacity counters come from the server.

---

## 4. Offline synchronization

Two things must survive a dead connection: the interval timer and an active
workout.

### Service worker

`public/sw.js` uses three strategies:

- navigation requests → network first, then the cached shell, then `/offline`
- static assets → stale-while-revalidate
- everything else (POST, server actions) → straight to the network, never cached

`/timer`, `/workout` and `/offline` are precached on install.

### The pending queue

`src/lib/offline/queue.ts` holds a `localStorage` queue of workout operations:
`add_set`, `update_session`, `finish_session`.

The write path in the active workout is:

1. append the set to local React state immediately — the UI never waits
2. call the server action
3. on success, swap the optimistic id for the server id
4. on failure, `enqueue(...)` the operation and tell the member it is saved on
   the device

`OfflineSync` (mounted in the root layout) flushes the queue when the connection
returns, when the tab regains focus, and when the service worker fires a
`glow-sync-workouts` background sync. It processes entries in order and stops at
the first failure so ordering is preserved. An entry that fails six times is
dropped, and an operation rejected by validation is dropped immediately rather
than retried forever. While anything is pending, a status bar says so.

### Resuming

An unfinished session is a row with `status = 'active'`, and there can only be
one per member — enforced by a partial unique index in Postgres and by
abandoning any stale session in `startSession`. Reopening `/workout/active`
reloads it from the server, so a refresh, a crash or a new device all resume in
the same place. The half-typed set is kept separately in `localStorage` under
`glow:draft:<sessionId>:<exerciseId>` and restored on mount.

The finished-workout summary lives on its own route,
`/workout/summary/[id]`. Keeping it off `/workout/active` matters: finishing
revalidates the active-session route, which would otherwise redirect the member
away from their records before they could read them.

### Timer accuracy

`src/lib/domain/timer.ts` expands a configuration into a flat phase timeline
with absolute offsets. The running timer stores only a start timestamp and a
base offset; elapsed time is recomputed from `Date.now()` on every tick, and
`resolveState(timeline, elapsed, config)` maps it to a phase. A backgrounded
tab, a throttled interval or a sleeping device cannot cause drift — when the tab
wakes, the next tick lands on the correct phase. The unit tests assert this by
jumping elapsed time forward 100 seconds and checking the resulting round.

A screen wake lock is requested while the timer runs and re-requested when the
page becomes visible again. Cues are synthesised with the Web Audio API, so no
audio files need to be fetched.

---

## 5. The recommendation engine

`src/lib/domain/recommend.ts`. No paid service, no model — a scoring function
over explicit rules, so every suggestion can be explained.

### Inputs

Recent workouts (with hours elapsed, movement categories, focus areas, average
effort), today's readiness report, available equipment, preferred goal,
experience level, and hours until the next booked class.

### Rules

Each approved, suggestable, non-archived template is scored. Every rule
contributes points and, optionally, a candidate sentence with a priority:

| Rule | Effect |
| --- | --- |
| duration matches the time available exactly | +30, explains |
| duration within 10 minutes | +16 |
| duration far off / longer than available | −22 / −18 |
| low readiness + recovery workout | +46, explains (highest priority) |
| low readiness + demanding workout | −34 |
| high readiness + strength or conditioning | +26, explains |
| soreness ≥ 4 on a demanding workout | −26 |
| poor sleep on a strength workout | −20 |
| overlaps an area loaded inside the recovery window | −30 per area |
| all areas rested | +20, explains |
| repeats every movement category from the last 48h | −16 |
| complements recent patterns | +18, explains |
| matches the member's chosen goal | +24, explains |
| needs equipment that is not available | −70 |
| difficulty matches experience | +14, explains |
| two levels above experience | −30 |
| class within 8 hours + light session | +30, explains |
| class within 8 hours + demanding session | −28 |

Readiness is banded from energy, inverted soreness and sleep quality: ≤7 is
low, ≥12 is high. The recovery window is 44 hours; an area counts as loaded if
the session was rated 7+ or finished within 20 hours.

The winning sentence is the highest-priority rule that fired, which is why a
tired member is told *"הדיווח שלך היום מצביע על עייפות…"* rather than a generic
line. Durations snap to 20, 30, 45 or 60 minutes.

### Controls and boundaries

The owner decides what the engine may suggest, per template, with the
`approved` and `suggestable` flags in `/admin/templates`. Members can swap an
exercise mid-workout and pick a reason (equipment, pain, too hard, too easy,
preference), which is stored on the session.

The engine reasons only about performance, recovery and consistency. It has no
notion of calories, appearance or weight, and there is no code path that
compares one member to another — a unit test asserts no generated sentence
mentions those topics.

---

## 6. Time handling

All timestamps are stored in UTC. `src/lib/time.ts` is the single place that
converts to `Asia/Jerusalem` for display, formats Hebrew dates, and computes
Sunday-based week boundaries. Class creation goes the other way:
`fromGymTime(date, time)` turns a gym-local wall clock into the UTC instant
that is persisted. Nothing else in the app calls `date-fns-tz` directly.
