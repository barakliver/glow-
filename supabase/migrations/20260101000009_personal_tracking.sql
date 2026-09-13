-- Personal tracking: the numbers a member keeps for themselves.
--
-- The club side of the app already records what happens in a class. This is
-- the other half: height and weight over time, whatever training someone did
-- on their own, a run with its distance and incline, and the weight moved on
-- every exercise. All of it is theirs - staff can read it to coach, and
-- nothing anywhere ranks one member against another.

do $$ begin
  create type public.activity_kind as enum ('strength', 'run', 'class', 'mobility', 'other');
exception when duplicate_object then null;
end $$;

-- --- body metrics ------------------------------------------------------------
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  -- Date in gym time, so an evening weigh-in lands on the day it happened.
  measured_on date not null,
  height_cm numeric(5, 1) check (height_cm between 80 and 260),
  weight_kg numeric(5, 1) check (weight_kg between 20 and 400),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One entry per day. Weighing again corrects the first.
  unique (profile_id, measured_on),
  -- A row with neither number is an empty form, not a measurement.
  constraint body_metrics_has_a_number check (height_cm is not null or weight_kg is not null)
);
create index if not exists body_metrics_profile_idx
  on public.body_metrics (profile_id, measured_on desc);
drop trigger if exists body_metrics_updated_at on public.body_metrics;
create trigger body_metrics_updated_at before update on public.body_metrics
  for each row execute function public.set_updated_at();

-- --- anything you did --------------------------------------------------------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  performed_on date not null,
  kind public.activity_kind not null default 'strength',
  -- Free text on purpose. "אימון כתפיים", "ריצה בפארק", whatever it was.
  title text not null,
  -- The workout itself, written however the member wants to write it.
  notes text,
  duration_seconds integer check (duration_seconds between 0 and 86400),
  rpe integer check (rpe between 1 and 10),
  -- Run details. Null on anything that was not a run.
  distance_meters integer check (distance_meters between 0 and 200000),
  incline_percent numeric(4, 1) check (incline_percent between 0 and 40),
  -- A class this was done at, when it was one.
  class_id uuid references public.classes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists activity_logs_profile_idx
  on public.activity_logs (profile_id, performed_on desc);
drop trigger if exists activity_logs_updated_at on public.activity_logs;
create trigger activity_logs_updated_at before update on public.activity_logs
  for each row execute function public.set_updated_at();

-- --- what you lifted, inside it ----------------------------------------------
create table if not exists public.activity_lifts (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activity_logs (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  position integer not null default 0,
  -- Either an exercise from the library, or a name typed on the spot. The app
  -- should never stop someone recording a lift because the list is missing it.
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_name text not null,
  sets integer not null default 1 check (sets between 1 and 50),
  reps integer check (reps between 1 and 500),
  weight_kg numeric(6, 2) check (weight_kg between 0 and 500),
  created_at timestamptz not null default now()
);
create index if not exists activity_lifts_activity_idx on public.activity_lifts (activity_id);
-- Personal records read this: heaviest weight per exercise name, per member.
create index if not exists activity_lifts_record_idx
  on public.activity_lifts (profile_id, exercise_name, weight_kg desc);

-- --- row level security ------------------------------------------------------
alter table public.body_metrics enable row level security;
alter table public.activity_logs enable row level security;
alter table public.activity_lifts enable row level security;

drop policy if exists body_metrics_self_all on public.body_metrics;
create policy body_metrics_self_all on public.body_metrics
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_member_of(organization_id));

-- Height and weight are the one thing here staff do NOT get to read. Coaching
-- needs the training log; it does not need the scale.
drop policy if exists activity_logs_self_all on public.activity_logs;
create policy activity_logs_self_all on public.activity_logs
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_member_of(organization_id));

drop policy if exists activity_logs_staff_read on public.activity_logs;
create policy activity_logs_staff_read on public.activity_logs
  for select to authenticated using (public.is_staff_of(organization_id));

drop policy if exists activity_lifts_self_all on public.activity_lifts;
create policy activity_lifts_self_all on public.activity_lifts
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists activity_lifts_staff_read on public.activity_lifts;
create policy activity_lifts_staff_read on public.activity_lifts
  for select to authenticated
  using (
    exists (
      select 1 from public.activity_logs a
      where a.id = activity_id and public.is_staff_of(a.organization_id)
    )
  );
