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
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server only, never NEXT_PUBLIC_
   ```

   The app leaves demo mode automatically once the URL and anon key are present.
   Set `NEXT_PUBLIC_DEMO_MODE=true` to force demo mode anyway.

3. **Apply the migrations**, in order:

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

4. **Seed demo content** (local stack only — it creates `auth.users` rows):

   ```bash
   npx supabase db reset     # runs migrations, then supabase/seed.sql
   ```

5. **Auth configuration** in the Supabase dashboard:
   - Email → enable magic links, add `http://localhost:3000/auth/callback` and
     your production callback to the redirect allow list.
   - Google → optional. Configure the provider, then set
     `NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true` to show the button.

6. **Promote yourself to owner** after your first sign-in:

   ```sql
   update public.memberships set role = 'owner'
   where profile_id = (select id from public.profiles where email = 'you@example.com');
   ```

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

npm run test:e2e       # Playwright — 13 tests × mobile and desktop
```

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

Any Node host that runs Next.js 15 works; Vercel needs no extra configuration.

1. Set the environment variables from `.env.example`. `NEXT_PUBLIC_APP_URL` must
   be the real public origin — invitation links, ICS files and QR codes are
   built from it.
2. Add `<origin>/auth/callback` to the Supabase redirect allow list.
3. Deploy. `npm run build` runs typecheck and lint as part of the Next build.
4. The service worker is served from `/sw.js` with `no-store`, so a new
   deployment replaces the cached shell on the next visit.

The app is an installable PWA: manifest at `/manifest.webmanifest`, icons under
`/public/icons`. The Tabata timer and an active workout keep working offline,
and pending workout records sync when the connection returns.

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
                       progress — all unit tested, no I/O
    data/              repository contract + demo and Supabase adapters, seed
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

## Product boundaries

The progress and recommendation features deliberately track **performance,
consistency and recovery only**. There are no calorie targets, appearance
ratings, body comparisons or weight-loss plans, and members are never compared
against each other — only against their own previous results.
