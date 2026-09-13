-- Workout of the Day: a library of prescribed workouts, the link from a class
-- to the one it will run, and the result a member records afterwards.
--
-- The link lives in its own table rather than as a column on `classes` for one
-- reason: the workout is meant to stay hidden until a member has a place in the
-- class. Row Level Security protects rows, not columns, so a `classes.workout_id`
-- column would be readable by anyone who can read the class row - which is every
-- member of the club. A separate table gets its own policy.

-- --- enums -------------------------------------------------------------------
do $$ begin
  create type public.workout_category as enum ('crossfit', 'functional', 'pilates', 'yoga');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.workout_format as enum (
    'amrap', 'for_time', 'emom', 'tabata', 'chipper',
    'intervals', 'strength', 'circuit', 'flow'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.score_type as enum (
    'time', 'rounds_and_reps', 'reps', 'weight', 'completion'
  );
exception when duplicate_object then null;
end $$;

-- --- the library -------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  -- Stable handle used by the generated library seed, so re-running it updates
  -- a workout in place instead of creating a duplicate.
  slug text not null,
  title text not null,
  subtitle text,
  category public.workout_category not null,
  format public.workout_format not null,
  difficulty public.difficulty_level not null default 'intermediate',
  duration_minutes integer not null check (duration_minutes > 0),
  time_cap_minutes integer check (time_cap_minutes > 0),
  equipment text[] not null default '{}',
  description text not null default '',
  -- [{ label, detail }]
  warmup jsonb not null default '[]'::jsonb,
  -- [{ label, detail, items: [{ label, detail }] }]
  structure jsonb not null default '[]'::jsonb,
  cooldown jsonb not null default '[]'::jsonb,
  -- [{ level, detail }]
  scaling jsonb not null default '[]'::jsonb,
  score_type public.score_type not null,
  score_label text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);
create index if not exists workouts_org_category_idx
  on public.workouts (organization_id, category, archived);
drop trigger if exists workouts_updated_at on public.workouts;
create trigger workouts_updated_at before update on public.workouts
  for each row execute function public.set_updated_at();

-- --- the class link ----------------------------------------------------------
create table if not exists public.class_workouts (
  class_id uuid primary key references public.classes (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  -- Coach notes for this run of the workout, hidden with it.
  notes text,
  assigned_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists class_workouts_workout_idx on public.class_workouts (workout_id);
drop trigger if exists class_workouts_updated_at on public.class_workouts;
create trigger class_workouts_updated_at before update on public.class_workouts
  for each row execute function public.set_updated_at();

-- --- results -----------------------------------------------------------------
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  workout_id uuid not null references public.workouts (id) on delete cascade,
  class_id uuid references public.classes (id) on delete set null,
  -- Date in gym time, so "today's result" survives a UTC midnight rollover.
  performed_on date not null,
  score_type public.score_type not null,
  result_seconds integer check (result_seconds >= 0),
  result_rounds integer check (result_rounds >= 0),
  result_reps integer check (result_reps >= 0),
  result_weight_kg numeric(6, 2) check (result_weight_kg >= 0),
  completed boolean,
  rx boolean not null default false,
  rpe integer check (rpe between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One result per person per workout per day. Logging again corrects the first.
  unique (profile_id, workout_id, performed_on)
);
create index if not exists workout_logs_profile_idx
  on public.workout_logs (profile_id, performed_on desc);
create index if not exists workout_logs_workout_idx on public.workout_logs (workout_id);
drop trigger if exists workout_logs_updated_at on public.workout_logs;
create trigger workout_logs_updated_at before update on public.workout_logs
  for each row execute function public.set_updated_at();

-- --- who may see a class's workout -------------------------------------------
-- Security definer so the policy on `class_workouts` can read `bookings`
-- without recursing through that table's own policies.
create or replace function public.has_active_booking(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.bookings b
    where b.class_id = p_class_id
      and b.profile_id = auth.uid()
      and b.status in ('confirmed', 'waitlisted', 'attended')
  );
$$;

revoke all on function public.has_active_booking(uuid) from public;
grant execute on function public.has_active_booking(uuid) to authenticated;

-- The shape of the session without its content: family, format, length, level.
-- This is what a member sees before booking, and it is deliberately not enough
-- to identify which of the hundred-odd library workouts is waiting for them.
create or replace function public.class_workout_teasers(p_from timestamptz, p_to timestamptz)
returns table (
  class_id uuid,
  category public.workout_category,
  format public.workout_format,
  duration_minutes integer,
  difficulty public.difficulty_level
)
language sql
stable
security definer
set search_path = public
as $$
  select cw.class_id, w.category, w.format, w.duration_minutes, w.difficulty
  from public.class_workouts cw
  join public.workouts w on w.id = cw.workout_id
  join public.classes c on c.id = cw.class_id
  where public.is_member_of(cw.organization_id)
    and c.starts_at >= p_from
    and c.starts_at < p_to
    and (c.published or public.is_staff_of(cw.organization_id));
$$;

revoke all on function public.class_workout_teasers(timestamptz, timestamptz) from public;
grant execute on function public.class_workout_teasers(timestamptz, timestamptz) to authenticated;

-- --- row level security ------------------------------------------------------
alter table public.workouts enable row level security;
alter table public.class_workouts enable row level security;
alter table public.workout_logs enable row level security;

-- The library itself is shared reference material: any member may browse it.
-- What stays private is which workout a given class will run.
drop policy if exists workouts_member_read on public.workouts;
create policy workouts_member_read on public.workouts
  for select to authenticated using (public.is_member_of(organization_id));

drop policy if exists workouts_staff_write on public.workouts;
create policy workouts_staff_write on public.workouts
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

-- The reveal. Staff always see it; a member sees it once they hold a place.
-- A waitlisted member counts: they may be promoted minutes before the class.
drop policy if exists class_workouts_booked_read on public.class_workouts;
create policy class_workouts_booked_read on public.class_workouts
  for select to authenticated
  using (
    public.is_staff_of(organization_id)
    or (public.is_member_of(organization_id) and public.has_active_booking(class_id))
  );

drop policy if exists class_workouts_staff_write on public.class_workouts;
create policy class_workouts_staff_write on public.class_workouts
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

-- A member's results are their own. Staff may read them to coach, never to rank:
-- the app has no leaderboard and compares a member only against themselves.
drop policy if exists workout_logs_self_all on public.workout_logs;
create policy workout_logs_self_all on public.workout_logs
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_member_of(organization_id));

drop policy if exists workout_logs_staff_read on public.workout_logs;
create policy workout_logs_staff_read on public.workout_logs
  for select to authenticated using (public.is_staff_of(organization_id));

-- --- five to a class ---------------------------------------------------------
-- A private gym with one floor. Five is the working default; an owner can still
-- raise it on a specific class.
alter table public.classes alter column capacity set default 5;
alter table public.class_series alter column capacity set default 5;
