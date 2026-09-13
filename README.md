# GLoW

Private training club platform — Hebrew interface, RTL layout, mobile first.

GLoW lets a gym owner publish a weekly schedule and share an invitation link
with friends. Members book classes, join waiting lists, record workouts, track
performance and run interval timers. Trainers manage the classes they are
assigned to; the owner manages everything.

- **Language**: complete Hebrew UI, RTL throughout. Code, database fields and
  documentation are in English.
- **Timezone**: `Asia/Jerusalem`. Timestamps are stored in UTC, displayed local.
- **Week**: starts on Sunday. Times are 24-hour.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # optional — see "Demo mode" below
npm run dev                    # http://localhost:3000
```

With no Supabase credentials the app boots straight into **demo mode**: a full
in-memory dataset with one owner, two trainers, five members and a complete
sample week. Every flow works — booking, waiting lists, workouts, timers,
admin. Nothing external is required.

### Demo access

Open `/auth/sign-in` and pick an account from the quick-access list:

| Account | Email | Role |
| --- | --- | --- |
| נועה ברק | `owner@glow.fit` | owner |
| עידן כהן | `idan@glow.fit` | trainer |
| מאיה לוי | `maya@glow.fit` | trainer |
| יובל אדרי | `yuval@glow.fit` | member (has workout history) |
| טל שרון | `tal@glow.fit` | member |
| רוני גל · עומר נחום · שירה פלד | … | members |

A ready-made public invitation is seeded at **`/invite/glow-demo-invite`**.

Demo data lives in the server process only. Restarting the dev server resets it,
and it never touches a production database.

---

## Supabase setup

1. **Create a project** at [supabase.com](https://supabase.com).

2. **Fill in `.env.local`**:

   ```dotenv
   APP_URL=http://localhost:3000
   SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_ANON_KEY=<publishable or anon key>
   ```

   There is no service-role key: the public invitation page reads through
   security-definer functions that `anon` may execute, so nothing in the
   deployment can bypass Row Level Security. None of these reach the browser: the app talks to Supabase only from server
   components, server actions and route handlers, so no `NEXT_PUBLIC_` prefix is
   needed. On a host that inlines public variables at build time (Vercel among
   them) this also avoids having to mark them as non-secret. The old
   `NEXT_PUBLIC_*` names are still read, so existing deployments keep working.

   The app leaves demo mode automatically once the URL and anon key are present.
   Set `DEMO_MODE=true` to force demo mode anyway.

3. **Create the schema.** Easiest path: open the Supabase SQL editor and paste
   **`supabase/setup.sql`** — one generated file containing every migration
   plus the starter content (exercise library, workout library, workout
   templates, timer presets) and no demo people. It is safe to paste again
   later: every statement is guarded, so a second run updates what changed.
   Rebuild it with `npm run build:setup-sql` after changing a migration or the
   workout library.

   Or apply the migrations individually, in order:

   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

   Or run them by hand in the SQL editor:

   | File | Contents |
   | --- | --- |
   | `supabase/migrations/20260101000000_initial_schema.sql` | tables, enums, indexes, constraints |
   | `supabase/migrations/20260101000001_functions.sql` | permission helpers, `book_class`, `cancel_booking`, `set_booking_status`, `public_schedule`, new-user trigger |
   | `supabase/migrations/20260101000002_rls.sql` | Row Level Security for every private table + realtime |
   | `supabase/migrations/20260101000003_public_invite_status.sql` | public invitation status function |
   | `supabase/migrations/20260101000004_owner_allowlist_and_approval.sql` | owner allowlist, joining approval |
   | `supabase/migrations/20260101000005_workouts.sql` | workout library, the class link and its reveal gate, results |
   | `supabase/migrations/20260101000006_workout_library_content.sql` | the 103 shipped workouts (generated) |
   | `supabase/migrations/20260101000007_member_access_requires_approval.sql` | member reads require an approved membership |

4. **Seed demo content** (local stack only — it creates `auth.users` rows):

   ```bash
   npx supabase db reset     # runs migrations, then supabase/seed.sql
   ```

5. **Auth configuration** in the Supabase dashboard. The club signs in with
   Google and nothing else, so this step is required, not optional:
   - Authentication → Providers → Google → enable it and fill in the client id
     and secret from a Google Cloud OAuth client.
   - Authentication → URL Configuration → set the Site URL to the deployment
     and add `<deployment>/auth/callback` plus
     `http://localhost:3000/auth/callback` to the redirect allow list.

   Demo mode is the exception: with no Supabase credentials the app signs in by
   email address against its own in-memory data, so it runs with no provider
   configured at all.

6. **Name the owners.** Addresses listed in `public.owner_emails` become owners
   automatically, whether they have signed up already or do so later. The table
   ships empty so that real addresses never reach source control:

   ```sql
   insert into public.owner_emails (email) values
     ('you@example.com'),
     ('cofounder@example.com')
   on conflict (email) do nothing;
   ```

   Everyone else who signs up joins as a member and waits: an owner lets them in
   from **ניהול → מתאמנים**, choosing there whether they are a member or a
   trainer. Until then they see a "waiting for approval" screen and
   `current_role_in` returns nothing for them, so no policy will let them read
   anything. Bootstrapping is the reason the allowlist exists at all - without
   it the first person to sign up is a plain member with no way to reach the
   admin area and nobody able to promote them.

### Email notifications

Notifications always land in the in-app notification center. Email is an
optional adapter on top:

```dotenv
EMAIL_FROM=GLoW <no-reply@your-domain.com>
RESEND_API_KEY=...
```

Without credentials nothing is lost — each notification is stored with
`delivery_status = 'skipped_no_provider'`, and the admin UI says the provider is
not configured. The SMTP branch in `src/lib/notifications/email.ts` is the hook
for a different transport.

### Class reminders

Reminders are sent by a scheduled call, so any cron works:

```
GET /api/cron/reminders?minutes=120
Authorization: Bearer $CRON_SECRET
```

It notifies every confirmed member of a class starting inside the window, skips
anyone already reminded for that class, and is safe to run on overlapping
schedules. On Vercel, add it to `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/reminders?minutes=120", "schedule": "0 * * * *" }] }
```

The owner sends the "new weekly schedule" notification from
**Admin → לוח שבועי → פרסום הלוח**, which also publishes any draft classes in
that week.

---

## Testing

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run test           # vitest — 111 unit tests
npm run build          # production build
npm run verify         # all four, in order

npm run test:e2e       # Playwright — mobile and desktop
npm run verify:sql     # migrations + booking RPCs against a throwaway Postgres
```

`verify:sql` spins up a local PostgreSQL, stubs the handful of Supabase objects
the migrations depend on (`auth.users`, `auth.uid()`, the API roles, the
realtime publication) and then applies every migration, the seed and
`setup.sql`. It asserts the production SQL path directly: capacity is never
exceeded, duplicate bookings are refused, the waiting list promotes in order and
renumbers, a started class refuses bookings, a revoked or expired invitation
token returns nothing, and Row Level Security is on for every table. It needs
PostgreSQL server binaries but no Supabase account.

Unit tests cover capacity rules, duplicate-booking prevention, waiting-list
order and promotion, booking and cancellation cutoffs, the recommendation rules,
Tabata phase calculation, personal records and the demo repository transactions.

End-to-end tests cover opening an invitation and booking, joining a waiting list
for a full class, cancelling and promoting the next member, creating a recurring
series as the owner, recording and completing a workout, and starting/pausing
the timer. They run against a production build in demo mode.

If the environment ships its own Chromium, point Playwright at it:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

---

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbarakliver%2Fglow-&project-name=glow&repository-name=glow)

> **Hebrew step-by-step guide: [`docs/DEPLOY.md`](docs/DEPLOY.md)** — getting a
> live URL, connecting Supabase, and inviting members.

Any Node host that runs Next.js 15 works; Vercel needs no extra configuration —
`vercel.json` already sets the reminder cron and the service-worker headers.

**Demo mode is not suitable for a deployed instance.** Its data lives in the
server process, so on a serverless host it resets between invocations and is not
shared across instances. Connect Supabase before inviting real members.

1. Set the environment variables from `.env.example`. `APP_URL` should be the
   real public origin — invitation links, ICS files and QR codes are built from
   it. On Vercel it is detected automatically and may be left unset.
2. Add `<origin>/auth/callback` to the Supabase redirect allow list.
3. Deploy. `npm run build` runs typecheck and lint as part of the Next build.
4. The service worker is served from `/sw.js` with `no-store`, so a new
   deployment replaces the cached shell on the next visit.

### Installing as an app

GLoW is an installable PWA — no App Store, no Google Play. Once deployed over
HTTPS, members install it from **עוד → האפליקציה במכשיר שלך**:

- **Android / desktop Chrome** — one tap, using `beforeinstallprompt`.
- **iOS Safari** — Apple exposes no install API, so the button opens the
  Share → Add to Home Screen steps instead of failing silently.

Manifest at `/manifest.webmanifest`, icons under `/public/icons`. The Tabata
timer and an active workout keep working offline, and pending workout records
sync when the connection returns.

---

## Project layout

```
src/
  app/
    (member)/          member area — home, schedule, classes, bookings,
                       workout, progress, timer, notifications, more
    admin/             owner and trainer area
    auth/              sign-in, onboarding, OAuth callback
    invite/[token]/    public invitation page
    checkin/[classId]/ QR check-in
    api/               ICS export, CSV export
    actions/           server actions (booking, workout, admin, auth, …)
  components/          UI primitives, class cards, charts, workout, share
  lib/
    domain/            pure logic: booking rules, timer, recommendations,
                       progress, workout scoring — all unit tested, no I/O
    data/              repository contract + demo and Supabase adapters, seed
    data/workouts/     the workout library, authored in TypeScript and
                       generated into a migration by npm run build:workout-sql
    supabase/          browser, server and middleware clients
    offline/           pending-workout queue
supabase/
  migrations/          schema, functions, RLS
  seed.sql             demo content for a local stack
tests/unit/            vitest
e2e/                   playwright
docs/ARCHITECTURE.md   permissions, booking transactions, offline sync, engine
```

---

## Design

| Token | Hex |
| --- | --- |
| Background | `#0D100F` |
| Primary surface | `#151A17` |
| Raised surface | `#1C231F` |
| Primary text | `#F6F3EB` |
| Secondary text | `#ADB7B0` |
| Primary accent | `#C7FF4A` |
| Pressed accent | `#A8DC32` |
| Success | `#70E1A3` |
| Warning | `#F4C45E` |
| Error | `#FF776D` |
| Border | `#29322D` |

Heebo carries Hebrew text; Manrope carries numbers and English. The logo is an
original typographic mark: heavy `G L W` with the lowercase `o` drawn as a
luminous ring.

---

## Filling the calendar

A new club starts with an empty week. `supabase/fill-schedule.sql` creates a
class every hour from 07:00 to 23:00, every day, for the next four weeks — 476
classes, each open for booking, holding five people, and with a workout already
assigned from the library. Classes run a full hour, matching the library. Sessions vary by hour the way a real timetable does:
strength first thing, open gym at midday, tabata in the evening, mobility last.

Paste it into the Supabase SQL editor whenever you want the window rolled
forward; it is keyed on date and hour, so a second run updates the same slots
rather than duplicating them, and bookings members have already made survive.
The file's own header carries the one statement that removes everything it
created.

It is a starting point to edit, not a fixed timetable: change a class, cancel
one, or delete the lot from **ניהול → לוח שיעורים** once the real week is known.

---

## Workout of the day

Every class can carry one workout from a library of **103**: 33 CrossFit
benchmarks and conditioning pieces, 33 functional and HIIT sessions, 20 mat
pilates classes and 17 yoga and mobility sessions. Each one carries its format,
length, warm-up, structure, cool-down, three levels of scaling and how it is
scored.

The workout is **hidden until a member holds a place in the class**. Before
booking they see the shape of the session — family, format, length, level — and
nothing that names a movement. That gate is a Row Level Security policy on
`class_workouts`, not a hidden interface element: a member who has not booked
cannot read the row at all, whatever client they use. A waitlisted member counts
as holding a place, since they can be promoted minutes before the class starts.

A class holds **five people** by default, in the database and not only in the
form that creates one. The sixth person joins the waiting list and is promoted
automatically when a place frees up. An owner can still raise the number on a
specific class.

After the class, the member records a result. The form follows the workout's
score type — a finishing time for For Time, rounds and reps for an AMRAP, weight
and reps for a lifting day, a yes or no for a flow — along with Rx or Scaled, an
RPE from 1 to 10 and a note. Results are private to the member; staff can read
them to coach, never to rank.

The library is authored in `src/lib/data/workouts/*.ts` and generated into a
migration, so the in-memory demo adapter and PostgreSQL can never disagree about
what a workout is. CI fails if the generated SQL is stale.

---

## Product boundaries

The progress and recommendation features deliberately track **performance,
consistency and recovery only**. There are no calorie targets, appearance
ratings, body comparisons or weight-loss plans, and members are never compared
against each other — only against their own previous results. There is no
leaderboard anywhere in the app, and the workout library is checked by a test
that fails if a calorie target, a weight-loss claim or a body comparison ever
finds its way into one of the 103 descriptions.
