-- =============================================================================
-- GLoW - complete database setup
--
-- GENERATED FILE - do not edit by hand.
-- Rebuild with: node scripts/build-setup-sql.mjs
--
-- Paste the whole file into the Supabase SQL editor and run it once. It
-- creates the schema, the booking functions, every Row Level Security policy,
-- and the starter content (exercise library, workout templates, timer presets).
--
-- Safe to run on a fresh project. Running it twice will fail on the enum
-- definitions, which is intentional: re-running a schema migration is a
-- mistake, not a routine operation.
-- =============================================================================

-- >>> migrations/20260101000000_initial_schema.sql <<<

-- =============================================================================
-- GLoW - initial schema
-- All timestamps are stored in UTC (timestamptz). The gym timezone
-- (Asia/Jerusalem) is applied at display time by the application.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --- enums -------------------------------------------------------------------
do $$ begin
  create type public.member_role as enum ('owner', 'trainer', 'member');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.membership_status as enum ('active', 'suspended');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.booking_status as enum ('confirmed', 'waitlisted', 'cancelled', 'attended', 'absent');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.class_status as enum ('scheduled', 'cancelled');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.difficulty_level as enum ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.training_category as enum ('strength', 'functional', 'tabata', 'mobility', 'open', 'conditioning');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.movement_category as enum ('squat', 'hinge', 'push', 'pull', 'carry', 'core', 'conditioning', 'mobility');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.training_goal as enum ('general', 'strength', 'conditioning', 'mobility', 'technique');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.workout_status as enum ('active', 'completed', 'abandoned');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.template_block as enum ('warmup', 'main', 'finisher', 'cooldown');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.notification_type as enum (
    'booking_confirmed', 'waitlist_promoted', 'class_cancelled',
    'class_time_changed', 'class_reminder', 'schedule_published', 'announcement'
  );
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.delivery_status as enum ('pending', 'sent', 'failed', 'skipped_no_provider');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.attendance_method as enum ('manual', 'qr');
exception when duplicate_object then null;
end $$;

-- --- shared trigger ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --- organizations -----------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'Asia/Jerusalem',
  week_starts_on smallint not null default 0 check (week_starts_on between 0 and 6),
  booking_cutoff_minutes integer not null default 30 check (booking_cutoff_minutes >= 0),
  cancel_cutoff_minutes integer not null default 120 check (cancel_cutoff_minutes >= 0),
  waitlist_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

-- --- profiles ----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text,
  avatar_url text,
  experience_level public.difficulty_level not null default 'beginner',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_email_key on public.profiles (lower(email));
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- --- memberships -------------------------------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'member',
  status public.membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);
create index if not exists memberships_profile_idx on public.memberships (profile_id);
create index if not exists memberships_org_role_idx on public.memberships (organization_id, role);
drop trigger if exists memberships_updated_at on public.memberships;
create trigger memberships_updated_at before update on public.memberships
  for each row execute function public.set_updated_at();

-- --- trainers ----------------------------------------------------------------
create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  bio text,
  specialties public.training_category[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);
drop trigger if exists trainers_updated_at on public.trainers;
create trigger trainers_updated_at before update on public.trainers
  for each row execute function public.set_updated_at();

-- --- class series ------------------------------------------------------------
create table if not exists public.class_series (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  category public.training_category not null default 'functional',
  difficulty public.difficulty_level not null default 'beginner',
  trainer_id uuid references public.trainers (id) on delete set null,
  location text not null default '',
  capacity integer not null check (capacity > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  equipment text[] not null default '{}',
  recurrence jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists class_series_org_idx on public.class_series (organization_id);
drop trigger if exists class_series_updated_at on public.class_series;
create trigger class_series_updated_at before update on public.class_series
  for each row execute function public.set_updated_at();

-- --- classes -----------------------------------------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  series_id uuid references public.class_series (id) on delete set null,
  title text not null,
  description text,
  category public.training_category not null default 'functional',
  difficulty public.difficulty_level not null default 'beginner',
  trainer_id uuid references public.trainers (id) on delete set null,
  location text not null default '',
  capacity integer not null check (capacity > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  equipment text[] not null default '{}',
  status public.class_status not null default 'scheduled',
  published boolean not null default true,
  registration_closed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_time_order check (ends_at > starts_at)
);
create index if not exists classes_org_start_idx on public.classes (organization_id, starts_at);
create index if not exists classes_series_idx on public.classes (series_id);
create index if not exists classes_published_idx on public.classes (organization_id, published, starts_at);
drop trigger if exists classes_updated_at on public.classes;
create trigger classes_updated_at before update on public.classes
  for each row execute function public.set_updated_at();

-- --- bookings ----------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.booking_status not null default 'confirmed',
  waitlist_position integer,
  booked_at timestamptz not null default now(),
  cancelled_at timestamptz,
  promoted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One booking record per member per class; re-booking reuses the row.
  constraint bookings_one_per_class unique (class_id, profile_id),
  constraint bookings_waitlist_position_valid
    check ((status = 'waitlisted' and waitlist_position is not null)
        or (status <> 'waitlisted' and waitlist_position is null))
);
create index if not exists bookings_class_status_idx on public.bookings (class_id, status);
create index if not exists bookings_profile_idx on public.bookings (profile_id, status);
create unique index if not exists bookings_waitlist_order_idx
  on public.bookings (class_id, waitlist_position)
  where status = 'waitlisted';
drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- --- invite links ------------------------------------------------------------
create table if not exists public.invite_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token text not null unique,
  label text not null default '',
  created_by uuid not null references public.profiles (id) on delete cascade,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  uses integer not null default 0,
  revoked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invite_links_org_idx on public.invite_links (organization_id);
drop trigger if exists invite_links_updated_at on public.invite_links;
create trigger invite_links_updated_at before update on public.invite_links
  for each row execute function public.set_updated_at();

-- --- attendance --------------------------------------------------------------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  present boolean not null default false,
  checked_in_at timestamptz,
  marked_by uuid references public.profiles (id) on delete set null,
  method public.attendance_method not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, profile_id)
);
create index if not exists attendance_profile_idx on public.attendance (profile_id);
drop trigger if exists attendance_updated_at on public.attendance;
create trigger attendance_updated_at before update on public.attendance
  for each row execute function public.set_updated_at();

-- --- exercises ---------------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name_he text not null,
  name_en text not null,
  movement_category public.movement_category not null,
  target_areas text[] not null default '{}',
  equipment text[] not null default '{}',
  difficulty public.difficulty_level not null default 'beginner',
  instructions text not null default '',
  safety_cues text not null default '',
  media_url text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name_en)
);
create index if not exists exercises_org_idx on public.exercises (organization_id, archived);
drop trigger if exists exercises_updated_at on public.exercises;
create trigger exercises_updated_at before update on public.exercises
  for each row execute function public.set_updated_at();

-- --- workout templates -------------------------------------------------------
create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  goal public.training_goal not null default 'general',
  difficulty public.difficulty_level not null default 'beginner',
  duration_minutes integer not null check (duration_minutes > 0),
  equipment text[] not null default '{}',
  focus_areas text[] not null default '{}',
  movement_categories text[] not null default '{}',
  created_by uuid references public.profiles (id) on delete set null,
  approved boolean not null default false,
  suggestable boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_templates_org_idx on public.workout_templates (organization_id, approved, archived);
drop trigger if exists workout_templates_updated_at on public.workout_templates;
create trigger workout_templates_updated_at before update on public.workout_templates
  for each row execute function public.set_updated_at();

create table if not exists public.workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workout_templates (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  block public.template_block not null default 'main',
  position integer not null,
  sets integer check (sets is null or sets > 0),
  reps integer check (reps is null or reps > 0),
  load_kg numeric(6, 2) check (load_kg is null or load_kg >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds > 0),
  distance_meters integer check (distance_meters is null or distance_meters > 0),
  rest_seconds integer check (rest_seconds is null or rest_seconds >= 0),
  trainer_notes text,
  alternative_exercise_ids uuid[] not null default '{}',
  unique (template_id, position)
);
create index if not exists workout_template_exercises_template_idx on public.workout_template_exercises (template_id);

-- --- workout sessions --------------------------------------------------------
create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.workout_templates (id) on delete set null,
  title text not null default 'אימון',
  goal public.training_goal not null default 'general',
  status public.workout_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_seconds integer check (total_seconds is null or total_seconds >= 0),
  average_effort numeric(3, 1) check (average_effort is null or (average_effort >= 1 and average_effort <= 10)),
  notes text,
  exercises jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workout_sessions_profile_idx on public.workout_sessions (profile_id, started_at desc);
-- At most one active session per member.
create unique index if not exists workout_sessions_single_active_idx
  on public.workout_sessions (profile_id)
  where status = 'active';
drop trigger if exists workout_sessions_updated_at on public.workout_sessions;
create trigger workout_sessions_updated_at before update on public.workout_sessions
  for each row execute function public.set_updated_at();

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  position integer not null default 1,
  set_index integer not null check (set_index > 0),
  reps integer check (reps is null or reps >= 0),
  load_kg numeric(6, 2) check (load_kg is null or load_kg >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  distance_meters integer check (distance_meters is null or distance_meters >= 0),
  effort smallint check (effort is null or (effort between 1 and 10)),
  notes text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists workout_sets_session_idx on public.workout_sets (session_id);
create index if not exists workout_sets_exercise_idx on public.workout_sets (exercise_id, completed_at desc);

-- --- readiness ---------------------------------------------------------------
create table if not exists public.readiness_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  energy smallint not null check (energy between 1 and 5),
  soreness smallint not null check (soreness between 1 and 5),
  sleep_quality smallint not null check (sleep_quality between 1 and 5),
  available_minutes integer not null check (available_minutes > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, log_date)
);
drop trigger if exists readiness_logs_updated_at on public.readiness_logs;
create trigger readiness_logs_updated_at before update on public.readiness_logs
  for each row execute function public.set_updated_at();

-- --- timer presets -----------------------------------------------------------
create table if not exists public.timer_presets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  prepare_seconds integer not null default 10 check (prepare_seconds >= 0),
  work_seconds integer not null default 20 check (work_seconds > 0),
  rest_seconds integer not null default 10 check (rest_seconds >= 0),
  rounds integer not null default 8 check (rounds > 0),
  sets integer not null default 1 check (sets > 0),
  rest_between_sets_seconds integer not null default 60 check (rest_between_sets_seconds >= 0),
  cooldown_seconds integer not null default 0 check (cooldown_seconds >= 0),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint timer_presets_owner_check check (is_public or profile_id is not null)
);
create index if not exists timer_presets_scope_idx on public.timer_presets (organization_id, profile_id, is_public);
drop trigger if exists timer_presets_updated_at on public.timer_presets;
create trigger timer_presets_updated_at before update on public.timer_presets
  for each row execute function public.set_updated_at();

-- --- notifications -----------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  delivery_status public.delivery_status not null default 'skipped_no_provider',
  delivery_error text,
  created_at timestamptz not null default now()
);
create index if not exists notifications_profile_idx on public.notifications (profile_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (profile_id) where read_at is null;

-- --- app settings ------------------------------------------------------------
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  key text not null,
  value jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists app_settings_scope_key_idx
  on public.app_settings (organization_id, coalesce(profile_id, '00000000-0000-0000-0000-000000000000'::uuid), key);
drop trigger if exists app_settings_updated_at on public.app_settings;
create trigger app_settings_updated_at before update on public.app_settings
  for each row execute function public.set_updated_at();


-- >>> migrations/20260101000001_functions.sql <<<

-- =============================================================================
-- GLoW - security-definer helpers and atomic booking transactions
-- =============================================================================

-- --- permission helpers ------------------------------------------------------
create or replace function public.current_role_in(org uuid)
returns public.member_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.memberships m
  where m.organization_id = org
    and m.profile_id = auth.uid()
    and m.status = 'active'
  limit 1;
$$;

create or replace function public.is_member_of(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org
      and m.profile_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.is_owner_of(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_in(org) = 'owner', false);
$$;

create or replace function public.is_staff_of(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_in(org) in ('owner', 'trainer'), false);
$$;

-- True when the caller is the trainer assigned to this class (or the owner).
create or replace function public.can_manage_class(class_row_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    left join public.trainers t on t.id = c.trainer_id
    where c.id = class_row_id
      and (
        public.is_owner_of(c.organization_id)
        or (public.current_role_in(c.organization_id) = 'trainer' and t.profile_id = auth.uid())
      )
  );
$$;

-- --- booking transaction -----------------------------------------------------
-- Books a class atomically. Locks the class row so two concurrent callers can
-- never exceed capacity; overflow goes to the ordered waiting list.
-- Returns jsonb: {ok, status, position, code}
create or replace function public.book_class(p_class_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes%rowtype;
  v_org public.organizations%rowtype;
  v_uid uuid := auth.uid();
  v_confirmed integer;
  v_position integer;
  v_existing public.bookings%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;

  -- Row lock: serialises every concurrent booking for this class.
  select * into v_class from public.classes where id = p_class_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'class_not_found');
  end if;

  if not public.is_member_of(v_class.organization_id) then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;

  select * into v_org from public.organizations where id = v_class.organization_id;

  if v_class.status = 'cancelled' then
    return jsonb_build_object('ok', false, 'code', 'class_cancelled');
  end if;
  if not v_class.published then
    return jsonb_build_object('ok', false, 'code', 'class_unpublished');
  end if;
  if v_class.registration_closed then
    return jsonb_build_object('ok', false, 'code', 'registration_closed');
  end if;
  if v_class.starts_at <= now() then
    return jsonb_build_object('ok', false, 'code', 'class_started');
  end if;
  if now() > v_class.starts_at - make_interval(mins => v_org.booking_cutoff_minutes) then
    return jsonb_build_object('ok', false, 'code', 'cutoff_passed');
  end if;

  select * into v_existing
  from public.bookings
  where class_id = p_class_id and profile_id = v_uid;

  if found and v_existing.status in ('confirmed', 'waitlisted', 'attended') then
    return jsonb_build_object('ok', false, 'code', 'already_booked');
  end if;

  select count(*) into v_confirmed
  from public.bookings
  where class_id = p_class_id and status in ('confirmed', 'attended');

  if v_confirmed < v_class.capacity then
    insert into public.bookings (organization_id, class_id, profile_id, status, waitlist_position, booked_at, cancelled_at, promoted_at)
    values (v_class.organization_id, p_class_id, v_uid, 'confirmed', null, now(), null, null)
    on conflict (class_id, profile_id) do update
      set status = 'confirmed', waitlist_position = null, booked_at = now(),
          cancelled_at = null, promoted_at = null;
    return jsonb_build_object('ok', true, 'status', 'confirmed');
  end if;

  if not v_org.waitlist_enabled then
    return jsonb_build_object('ok', false, 'code', 'waitlist_disabled');
  end if;

  select coalesce(max(waitlist_position), 0) + 1 into v_position
  from public.bookings
  where class_id = p_class_id and status = 'waitlisted';

  insert into public.bookings (organization_id, class_id, profile_id, status, waitlist_position, booked_at, cancelled_at, promoted_at)
  values (v_class.organization_id, p_class_id, v_uid, 'waitlisted', v_position, now(), null, null)
  on conflict (class_id, profile_id) do update
    set status = 'waitlisted', waitlist_position = v_position, booked_at = now(),
        cancelled_at = null, promoted_at = null;

  return jsonb_build_object('ok', true, 'status', 'waitlisted', 'position', v_position);
end;
$$;

-- --- cancellation + promotion ------------------------------------------------
-- Cancels the caller's booking and promotes the first eligible waiting member.
-- Returns jsonb: {ok, promoted_profile_id, code}
create or replace function public.cancel_booking(p_class_id uuid, p_profile_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes%rowtype;
  v_org public.organizations%rowtype;
  v_uid uuid := auth.uid();
  v_target uuid;
  v_booking public.bookings%rowtype;
  v_confirmed integer;
  v_promoted public.bookings%rowtype;
  v_staff boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;

  select * into v_class from public.classes where id = p_class_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'class_not_found');
  end if;

  v_staff := public.is_staff_of(v_class.organization_id);
  v_target := coalesce(p_profile_id, v_uid);
  if v_target <> v_uid and not v_staff then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;

  select * into v_org from public.organizations where id = v_class.organization_id;

  select * into v_booking
  from public.bookings
  where class_id = p_class_id and profile_id = v_target
    and status in ('confirmed', 'waitlisted', 'attended');
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_booked');
  end if;

  -- Members are bound by the cancellation cutoff; staff are not.
  if not v_staff and v_class.status <> 'cancelled'
     and now() > v_class.starts_at - make_interval(mins => v_org.cancel_cutoff_minutes) then
    return jsonb_build_object('ok', false, 'code', 'cancel_cutoff_passed');
  end if;

  update public.bookings
  set status = 'cancelled', waitlist_position = null, cancelled_at = now()
  where id = v_booking.id;

  -- Renumber the remaining queue so positions stay contiguous.
  with ordered as (
    select id, row_number() over (order by waitlist_position, booked_at) as rn
    from public.bookings
    where class_id = p_class_id and status = 'waitlisted'
  )
  update public.bookings b
  set waitlist_position = ordered.rn
  from ordered
  where b.id = ordered.id and b.waitlist_position is distinct from ordered.rn;

  select count(*) into v_confirmed
  from public.bookings
  where class_id = p_class_id and status in ('confirmed', 'attended');

  if v_confirmed < v_class.capacity then
    select * into v_promoted
    from public.bookings
    where class_id = p_class_id and status = 'waitlisted'
    order by waitlist_position, booked_at
    limit 1;

    if found then
      update public.bookings
      set status = 'confirmed', waitlist_position = null, promoted_at = now()
      where id = v_promoted.id;

      with ordered as (
        select id, row_number() over (order by waitlist_position, booked_at) as rn
        from public.bookings
        where class_id = p_class_id and status = 'waitlisted'
      )
      update public.bookings b
      set waitlist_position = ordered.rn
      from ordered
      where b.id = ordered.id and b.waitlist_position is distinct from ordered.rn;

      insert into public.notifications (organization_id, profile_id, type, title, body, link)
      values (v_class.organization_id, v_promoted.profile_id, 'waitlist_promoted',
              'התפנה לך מקום',
              'קודמת מרשימת ההמתנה ל' || v_class.title,
              '/classes/' || p_class_id::text);

      return jsonb_build_object('ok', true, 'promoted_profile_id', v_promoted.profile_id);
    end if;
  end if;

  return jsonb_build_object('ok', true, 'promoted_profile_id', null);
end;
$$;

-- --- staff move between confirmed and waiting list ---------------------------
create or replace function public.set_booking_status(p_booking_id uuid, p_status public.booking_status)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings%rowtype;
  v_position integer;
begin
  select * into v_booking from public.bookings where id = p_booking_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'not_booked');
  end if;
  if not public.can_manage_class(v_booking.class_id) then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;

  if p_status = 'waitlisted' then
    select coalesce(max(waitlist_position), 0) + 1 into v_position
    from public.bookings
    where class_id = v_booking.class_id and status = 'waitlisted' and id <> p_booking_id;
    update public.bookings
    set status = 'waitlisted', waitlist_position = v_position
    where id = p_booking_id;
  else
    update public.bookings
    set status = p_status,
        waitlist_position = null,
        cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
        promoted_at = case when p_status = 'confirmed' and v_booking.status = 'waitlisted' then now() else promoted_at end
    where id = p_booking_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- --- public invitation view ---------------------------------------------------
-- Limited, read-only projection of the published schedule for an unauthenticated
-- visitor holding a valid invitation token. Deliberately exposes NO member data.
create or replace function public.public_schedule(p_token text, p_from timestamptz, p_to timestamptz)
returns table (
  id uuid,
  title text,
  description text,
  category public.training_category,
  difficulty public.difficulty_level,
  trainer_name text,
  location text,
  capacity integer,
  starts_at timestamptz,
  ends_at timestamptz,
  spots_left integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invite_links%rowtype;
begin
  select * into v_invite from public.invite_links where token = p_token;
  if not found or v_invite.revoked then
    return;
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    return;
  end if;
  if v_invite.max_uses is not null and v_invite.uses >= v_invite.max_uses then
    return;
  end if;

  return query
    select c.id, c.title, c.description, c.category, c.difficulty,
           t.display_name, c.location, c.capacity, c.starts_at, c.ends_at,
           greatest(0, c.capacity - (
             select count(*)::integer from public.bookings b
             where b.class_id = c.id and b.status in ('confirmed', 'attended')
           ))
    from public.classes c
    left join public.trainers t on t.id = c.trainer_id
    where c.organization_id = v_invite.organization_id
      and c.published
      and c.status = 'scheduled'
      and c.starts_at >= p_from
      and c.starts_at < p_to
    order by c.starts_at;
end;
$$;

revoke all on function public.book_class(uuid) from public;
revoke all on function public.cancel_booking(uuid, uuid) from public;
revoke all on function public.set_booking_status(uuid, public.booking_status) from public;
grant execute on function public.book_class(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid, uuid) to authenticated;
grant execute on function public.set_booking_status(uuid, public.booking_status) to authenticated;
grant execute on function public.public_schedule(text, timestamptz, timestamptz) to anon, authenticated;

-- --- auth bootstrap ----------------------------------------------------------
-- Every new auth user gets a profile and a member seat in the single GLoW org.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is not null then
    insert into public.memberships (organization_id, profile_id, role)
    values (v_org, new.id, 'member')
    on conflict (organization_id, profile_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- >>> migrations/20260101000002_rls.sql <<<

-- =============================================================================
-- GLoW - Row Level Security
-- Every private table is protected. Authorization is never implied by the UI.
-- =============================================================================

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.trainers enable row level security;
alter table public.class_series enable row level security;
alter table public.classes enable row level security;
alter table public.bookings enable row level security;
alter table public.invite_links enable row level security;
alter table public.attendance enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workout_template_exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;
alter table public.readiness_logs enable row level security;
alter table public.timer_presets enable row level security;
alter table public.notifications enable row level security;
alter table public.app_settings enable row level security;

-- --- organizations -----------------------------------------------------------
drop policy if exists organizations_read on public.organizations;
create policy organizations_read on public.organizations
  for select to authenticated using (public.is_member_of(id));
drop policy if exists organizations_update on public.organizations;
create policy organizations_update on public.organizations
  for update to authenticated using (public.is_owner_of(id)) with check (public.is_owner_of(id));

-- --- profiles ----------------------------------------------------------------
-- A member sees their own profile. Staff see profiles of their organization's
-- members so the member directory and attendance lists work.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists profiles_staff_read on public.profiles;
create policy profiles_staff_read on public.profiles
  for select to authenticated using (
    exists (
      select 1 from public.memberships m
      where m.profile_id = public.profiles.id and public.is_staff_of(m.organization_id)
    )
  );
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- --- memberships -------------------------------------------------------------
drop policy if exists memberships_self_read on public.memberships;
create policy memberships_self_read on public.memberships
  for select to authenticated using (profile_id = auth.uid());
drop policy if exists memberships_staff_read on public.memberships;
create policy memberships_staff_read on public.memberships
  for select to authenticated using (public.is_staff_of(organization_id));
drop policy if exists memberships_owner_write on public.memberships;
create policy memberships_owner_write on public.memberships
  for all to authenticated
  using (public.is_owner_of(organization_id))
  with check (public.is_owner_of(organization_id));

-- --- trainers ----------------------------------------------------------------
drop policy if exists trainers_member_read on public.trainers;
create policy trainers_member_read on public.trainers
  for select to authenticated using (public.is_member_of(organization_id));
drop policy if exists trainers_owner_write on public.trainers;
create policy trainers_owner_write on public.trainers
  for all to authenticated
  using (public.is_owner_of(organization_id))
  with check (public.is_owner_of(organization_id));

-- --- class series ------------------------------------------------------------
drop policy if exists class_series_member_read on public.class_series;
create policy class_series_member_read on public.class_series
  for select to authenticated using (public.is_member_of(organization_id));
drop policy if exists class_series_staff_write on public.class_series;
create policy class_series_staff_write on public.class_series
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

-- --- classes -----------------------------------------------------------------
-- Members only ever see published classes; staff see drafts too.
drop policy if exists classes_member_read on public.classes;
create policy classes_member_read on public.classes
  for select to authenticated using (
    public.is_member_of(organization_id) and (published or public.is_staff_of(organization_id))
  );
drop policy if exists classes_owner_write on public.classes;
create policy classes_owner_write on public.classes
  for all to authenticated
  using (public.is_owner_of(organization_id))
  with check (public.is_owner_of(organization_id));
-- A trainer may manage only the classes assigned to them.
drop policy if exists classes_trainer_update on public.classes;
create policy classes_trainer_update on public.classes
  for update to authenticated
  using (
    public.current_role_in(organization_id) = 'trainer'
    and exists (select 1 from public.trainers t where t.id = classes.trainer_id and t.profile_id = auth.uid())
  )
  with check (
    public.current_role_in(organization_id) = 'trainer'
    and exists (select 1 from public.trainers t where t.id = classes.trainer_id and t.profile_id = auth.uid())
  );

-- --- bookings ----------------------------------------------------------------
drop policy if exists bookings_self_read on public.bookings;
create policy bookings_self_read on public.bookings
  for select to authenticated using (profile_id = auth.uid());
drop policy if exists bookings_staff_read on public.bookings;
create policy bookings_staff_read on public.bookings
  for select to authenticated using (public.is_staff_of(organization_id));
-- Writes go through book_class / cancel_booking / set_booking_status, which run
-- as security definer. Direct writes are limited to staff only.
drop policy if exists bookings_staff_write on public.bookings;
create policy bookings_staff_write on public.bookings
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

-- --- invite links ------------------------------------------------------------
-- Never readable by members: the public invitation page uses public_schedule().
drop policy if exists invite_links_owner_all on public.invite_links;
create policy invite_links_owner_all on public.invite_links
  for all to authenticated
  using (public.is_owner_of(organization_id))
  with check (public.is_owner_of(organization_id));

-- --- attendance --------------------------------------------------------------
drop policy if exists attendance_self_read on public.attendance;
create policy attendance_self_read on public.attendance
  for select to authenticated using (profile_id = auth.uid());
drop policy if exists attendance_staff_all on public.attendance;
create policy attendance_staff_all on public.attendance
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

-- --- exercises ---------------------------------------------------------------
drop policy if exists exercises_member_read on public.exercises;
create policy exercises_member_read on public.exercises
  for select to authenticated using (public.is_member_of(organization_id));
drop policy if exists exercises_staff_write on public.exercises;
create policy exercises_staff_write on public.exercises
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

-- --- workout templates -------------------------------------------------------
drop policy if exists workout_templates_read on public.workout_templates;
create policy workout_templates_read on public.workout_templates
  for select to authenticated using (
    public.is_member_of(organization_id)
    and (
      (approved and not archived)
      or created_by = auth.uid()
      or public.is_staff_of(organization_id)
    )
  );
drop policy if exists workout_templates_staff_write on public.workout_templates;
create policy workout_templates_staff_write on public.workout_templates
  for all to authenticated
  using (public.is_staff_of(organization_id))
  with check (public.is_staff_of(organization_id));

drop policy if exists workout_template_exercises_read on public.workout_template_exercises;
create policy workout_template_exercises_read on public.workout_template_exercises
  for select to authenticated using (
    exists (
      select 1 from public.workout_templates t
      where t.id = template_id and public.is_member_of(t.organization_id)
    )
  );
drop policy if exists workout_template_exercises_staff_write on public.workout_template_exercises;
create policy workout_template_exercises_staff_write on public.workout_template_exercises
  for all to authenticated
  using (
    exists (select 1 from public.workout_templates t where t.id = template_id and public.is_staff_of(t.organization_id))
  )
  with check (
    exists (select 1 from public.workout_templates t where t.id = template_id and public.is_staff_of(t.organization_id))
  );

-- --- workout sessions & sets (private to the member) -------------------------
drop policy if exists workout_sessions_self_all on public.workout_sessions;
create policy workout_sessions_self_all on public.workout_sessions
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists workout_sets_self_all on public.workout_sets;
create policy workout_sets_self_all on public.workout_sets
  for all to authenticated
  using (exists (select 1 from public.workout_sessions s where s.id = session_id and s.profile_id = auth.uid()))
  with check (exists (select 1 from public.workout_sessions s where s.id = session_id and s.profile_id = auth.uid()));

-- --- readiness (private) -----------------------------------------------------
drop policy if exists readiness_self_all on public.readiness_logs;
create policy readiness_self_all on public.readiness_logs
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- --- timer presets -----------------------------------------------------------
drop policy if exists timer_presets_read on public.timer_presets;
create policy timer_presets_read on public.timer_presets
  for select to authenticated using (
    public.is_member_of(organization_id) and (is_public or profile_id = auth.uid())
  );
drop policy if exists timer_presets_self_write on public.timer_presets;
create policy timer_presets_self_write on public.timer_presets
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and not is_public);
drop policy if exists timer_presets_owner_write on public.timer_presets;
create policy timer_presets_owner_write on public.timer_presets
  for all to authenticated
  using (public.is_owner_of(organization_id))
  with check (public.is_owner_of(organization_id));

-- --- notifications -----------------------------------------------------------
drop policy if exists notifications_self_read on public.notifications;
create policy notifications_self_read on public.notifications
  for select to authenticated using (profile_id = auth.uid());
drop policy if exists notifications_self_update on public.notifications;
create policy notifications_self_update on public.notifications
  for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists notifications_staff_insert on public.notifications;
create policy notifications_staff_insert on public.notifications
  for insert to authenticated with check (public.is_staff_of(organization_id));

-- --- app settings ------------------------------------------------------------
drop policy if exists app_settings_self on public.app_settings;
create policy app_settings_self on public.app_settings
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
drop policy if exists app_settings_org_read on public.app_settings;
create policy app_settings_org_read on public.app_settings
  for select to authenticated using (profile_id is null and public.is_member_of(organization_id));
drop policy if exists app_settings_owner_write on public.app_settings;
create policy app_settings_owner_write on public.app_settings
  for all to authenticated
  using (public.is_owner_of(organization_id) and profile_id is null)
  with check (public.is_owner_of(organization_id) and profile_id is null);

-- --- realtime ----------------------------------------------------------------
-- Capacity updates stream to the schedule in real time.
do $$
declare
  t text;
begin
  foreach t in array array['bookings', 'classes', 'notifications'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;


-- >>> migrations/20260101000003_public_invite_status.sql <<<

-- =============================================================================
-- GLoW - invitation status for unauthenticated visitors
--
-- The public invitation page previously read `invite_links` with the service
-- role key, purely to tell an expired link from a revoked one and to show the
-- club name. Moving that into a security-definer function means the deployment
-- no longer needs a key that bypasses Row Level Security at all.
--
-- The function deliberately returns no token, no counts and nothing about
-- members: only the label, the club name and one status word.
-- =============================================================================

create or replace function public.public_invite_status(p_token text)
returns table (
  status text,
  label text,
  organization_name text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_invite public.invite_links%rowtype;
  v_org_name text;
begin
  select * into v_invite from public.invite_links where token = p_token;

  if not found then
    return query select 'invalid'::text, ''::text, ''::text;
    return;
  end if;

  select o.name into v_org_name
  from public.organizations o
  where o.id = v_invite.organization_id;

  if v_invite.revoked then
    return query select 'revoked'::text, ''::text, coalesce(v_org_name, '')::text;
    return;
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    return query select 'expired'::text, ''::text, coalesce(v_org_name, '')::text;
    return;
  end if;

  if v_invite.max_uses is not null and v_invite.uses >= v_invite.max_uses then
    return query select 'exhausted'::text, ''::text, coalesce(v_org_name, '')::text;
    return;
  end if;

  return query select 'valid'::text, v_invite.label, coalesce(v_org_name, 'GLoW')::text;
end;
$$;

revoke all on function public.public_invite_status(text) from public;
grant execute on function public.public_invite_status(text) to anon, authenticated;


-- >>> migrations/20260101000004_owner_allowlist_and_approval.sql <<<

-- Owner allowlist and joining approval.
--
-- Two problems this solves:
--   1. Bootstrapping. Every sign-up became a plain member, so the first person
--      to sign in had no way to reach the admin area and no one could promote
--      them. Addresses listed in `owner_emails` become owners automatically.
--   2. Anyone who knows the URL could sign in and immediately be an active
--      member of a private club. New people now wait for an owner to approve
--      them and to say whether they are a member or a trainer.
--
-- The allowlist lives in the database, not in the repository, so real addresses
-- never reach source control.

-- --- owner allowlist ---------------------------------------------------------
create table if not exists public.owner_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.owner_emails enable row level security;

drop policy if exists owner_emails_owner_all on public.owner_emails;
create policy owner_emails_owner_all on public.owner_emails
  for all to authenticated
  using (
    exists (
      select 1 from public.memberships m
      where m.profile_id = auth.uid() and public.is_owner_of(m.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.memberships m
      where m.profile_id = auth.uid() and public.is_owner_of(m.organization_id)
    )
  );

-- --- approval ----------------------------------------------------------------
alter table public.memberships
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles (id) on delete set null;

-- Anyone already in the club keeps the access they have today.
update public.memberships set approved_at = joined_at where approved_at is null;

-- A membership that is not yet approved carries no role at all, so a person
-- waiting at the door cannot reach anything an RLS policy guards.
create or replace function public.current_role_in(org uuid)
returns public.member_role
language sql
stable
security definer
set search_path = public
as $$
  select m.role
  from public.memberships m
  where m.organization_id = org
    and m.profile_id = auth.uid()
    and m.status = 'active'
    and m.approved_at is not null
  limit 1;
$$;

-- --- sign-up -----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_is_owner boolean;
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  select exists (
    select 1 from public.owner_emails o where lower(o.email) = lower(new.email)
  ) into v_is_owner;

  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is not null then
    insert into public.memberships (organization_id, profile_id, role, approved_at)
    values (
      v_org,
      new.id,
      case when v_is_owner then 'owner' else 'member' end::public.member_role,
      case when v_is_owner then now() else null end
    )
    on conflict (organization_id, profile_id) do nothing;
  end if;

  return new;
end;
$$;

-- --- allowlist takes effect immediately --------------------------------------
-- An address can be added after that person has already signed up, so adding it
-- promotes them on the spot rather than only on a sign-up that already happened.
create or replace function public.apply_owner_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.memberships m
  set role = 'owner',
      status = 'active',
      approved_at = coalesce(m.approved_at, now()),
      updated_at = now()
  from public.profiles p
  where m.profile_id = p.id
    and lower(p.email) = lower(new.email);
  return new;
end;
$$;

drop trigger if exists owner_emails_apply on public.owner_emails;
create trigger owner_emails_apply
  after insert on public.owner_emails
  for each row execute function public.apply_owner_email();


-- >>> starter-content.sql <<<

-- =============================================================================
-- GLoW starter content
--
-- Everything a real club needs on day one, and nothing it does not: the club
-- record, the exercise library, six workout templates and three timer presets.
--
-- No demo people, classes or bookings are created here - the owner builds the
-- schedule from the app. For a fully populated demo instead, run seed.sql.
-- =============================================================================

set search_path = public;

-- --- organization ------------------------------------------------------------
-- A single club. Rename it later from the app: Admin -> Settings.
insert into public.organizations (id, name, slug, timezone, week_starts_on,
                                  booking_cutoff_minutes, cancel_cutoff_minutes, waitlist_enabled)
values ('00000000-0000-4000-8000-000000000001', 'GLoW', 'glow', 'Asia/Jerusalem', 0, 30, 120, true)
on conflict (id) do nothing;

-- --- exercise library --------------------------------------------------------
insert into public.exercises (organization_id, name_he, name_en, movement_category, target_areas, equipment, difficulty, instructions, safety_cues)
values
  ('00000000-0000-4000-8000-000000000001','סקוואט גבי','Back Squat','squat','{legs,glutes,core}','{barbell}','intermediate','עמידה ברוחב אגן, המוט על הגב העליון. יורדים באגן אחורה ומטה ועולים בדחיפה דרך כל כף הרגל.','שומרים על גב ניטרלי והברכיים בכיוון האצבעות.'),
  ('00000000-0000-4000-8000-000000000001','דדליפט','Deadlift','hinge','{back,glutes,legs}','{barbell}','advanced','המוט קרוב לשוקיים, דוחפים את הרצפה ומיישרים אגן וברכיים יחד.','ליבה נעולה, המוט צמוד לגוף.'),
  ('00000000-0000-4000-8000-000000000001','לחיצת חזה במוט','Bench Press','push','{chest,shoulders,arms}','{barbell}','intermediate','מורידים לאזור החזה התחתון ודוחפים למעלה.','שורשי כף יד ישרים, מרפקים ב-45 מעלות.'),
  ('00000000-0000-4000-8000-000000000001','מתח','Pull Up','pull','{back,arms,core}','{pullup_bar}','advanced','תלייה מלאה, מושכים את עצם החזה לכיוון המוט.','מתחילים מכתפיים פעילות.'),
  ('00000000-0000-4000-8000-000000000001','שכיבות סמיכה','Push Up','push','{chest,shoulders,core}','{none}','beginner','פלאנק גבוה, יורדים עד שהחזה קרוב לרצפה ודוחפים חזרה.','הגוף בקו אחד, אגן לא צונח.'),
  ('00000000-0000-4000-8000-000000000001','סוויינג קטלבל','Kettlebell Swing','hinge','{glutes,back,core}','{kettlebell}','intermediate','כפיפת ירך, מניפים את הקטלבל לגובה החזה בדחיפת אגן חדה.','התנועה מהאגן ולא מהידיים.'),
  ('00000000-0000-4000-8000-000000000001','גובלט סקוואט','Goblet Squat','squat','{legs,glutes}','{dumbbell}','beginner','מחזיקים משקולת מול החזה ויורדים לסקוואט עמוק.','חזה פתוח, עקבים על הרצפה.'),
  ('00000000-0000-4000-8000-000000000001','מכרעים בהליכה','Walking Lunge','squat','{legs,glutes,core}','{none}','beginner','צעד קדימה, יורדים עד שהברך האחורית קרובה לרצפה.','הברך הקדמית מעל כף הרגל.'),
  ('00000000-0000-4000-8000-000000000001','חתירה בהרכנה','Bent Over Row','pull','{back,arms}','{barbell}','intermediate','כפיפת ירך ל-45 מעלות, מושכים את המוט לבטן התחתונה.','בלי לזרוק את הגוף.'),
  ('00000000-0000-4000-8000-000000000001','פלאנק','Plank','core','{core,shoulders}','{mat}','beginner','נשענים על אמות וכפות רגליים בקו ישר.','אגן באמצע, נושמים ברציפות.'),
  ('00000000-0000-4000-8000-000000000001','הליכת חקלאי','Farmer Carry','carry','{core,shoulders,back}','{kettlebell}','beginner','אוחזים משקל כבד בשתי הידיים והולכים במסלול ישר.','כתפיים אחורה, צעדים יציבים.'),
  ('00000000-0000-4000-8000-000000000001','ברפי','Burpee','conditioning','{full_body}','{none}','intermediate','יורדים לשכיבת סמיכה, קופצים חזרה לעמידה וקפיצה קלה.','נחיתה רכה, נשימה יציבה.'),
  ('00000000-0000-4000-8000-000000000001','קפיצה על קופסה','Box Jump','conditioning','{legs,glutes}','{box}','intermediate','קפיצה דו-רגלית לקופסה ונחיתה מלאה.','נוחתים עם ברכיים רכות.'),
  ('00000000-0000-4000-8000-000000000001','חתירה במכשיר','Rowing Machine','conditioning','{back,legs,core}','{rower}','beginner','דחיפה מהרגליים, פתיחת אגן ולבסוף משיכת ידיים.','לא מושכים לפני שהרגליים סיימו.'),
  ('00000000-0000-4000-8000-000000000001','מתיחת מכופפי ירך','Hip Flexor Stretch','mobility','{hips,legs}','{mat}','beginner','עמידת אבירים, דוחפים אגן קדימה.','בלי לקשת את הגב התחתון.'),
  ('00000000-0000-4000-8000-000000000001','סיבוב גב עליון','Thoracic Rotation','mobility','{thoracic,shoulders}','{mat}','beginner','שכיבה על הצד, פותחים את היד העליונה לצד השני.','התנועה מהגב העליון.'),
  ('00000000-0000-4000-8000-000000000001','חתול פרה','Cat Cow','mobility','{thoracic,core}','{mat}','beginner','בשש, מתחלפים בין קימור לקישות עם הנשימה.','תנועה איטית וללא כאב.'),
  ('00000000-0000-4000-8000-000000000001','לחיצת כתפיים','Overhead Press','push','{shoulders,arms,core}','{barbell}','intermediate','דוחפים מעל הראש עד יישור מרפקים.','צלעות סגורות, בלי לקשת את הגב.'),
  ('00000000-0000-4000-8000-000000000001','מאונטן קלימברס','Mountain Climbers','conditioning','{core,shoulders}','{none}','beginner','מפלאנק גבוה, מביאים ברכיים לחזה לסירוגין.','אגן לא עולה.'),
  ('00000000-0000-4000-8000-000000000001','משיכת גומייה','Band Pull Apart','pull','{shoulders,back}','{bands}','beginner','פותחים גומייה לצדדים וסוגרים שכמות.','בלי להרים כתפיים לאוזניים.')
on conflict (organization_id, name_en) do nothing;

-- --- workout templates -------------------------------------------------------
insert into public.workout_templates (id, organization_id, title, description, goal, difficulty,
                                      duration_minutes, equipment, focus_areas, movement_categories,
                                      created_by, approved, suggestable)
values
  ('00000000-0000-4000-8000-900000000001','00000000-0000-4000-8000-000000000001','בסיס כוח - פלג גוף תחתון','בלוק כוח קלאסי סביב סקוואט ודדליפט.','strength','intermediate',60,'{barbell,kettlebell,mat}','{legs,glutes,core}','{squat,hinge,core}',null,true,true),
  ('00000000-0000-4000-8000-900000000002','00000000-0000-4000-8000-000000000001','דחיפה ומשיכה - 45 דקות','עבודת פלג גוף עליון מאוזנת.','strength','intermediate',45,'{barbell,dumbbell,pullup_bar}','{chest,back,shoulders}','{push,pull}',null,true,true),
  ('00000000-0000-4000-8000-900000000003','00000000-0000-4000-8000-000000000001','סיבולת מהירה - 20 דקות','מעגל קצר בעצימות גבוהה עם משקל גוף.','conditioning','intermediate',20,'{none}','{full_body,core}','{conditioning,core}',null,true,true),
  ('00000000-0000-4000-8000-900000000004','00000000-0000-4000-8000-000000000001','מוביליטי והתאוששות','רצף שחרור לאגן, גב עליון וכתפיים.','mobility','beginner',20,'{mat,bands}','{hips,thoracic,shoulders}','{mobility}',null,true,true),
  ('00000000-0000-4000-8000-900000000005','00000000-0000-4000-8000-000000000001','טכניקה - תרגילי יסוד','עבודה במשקלים קלים על איכות תנועה.','technique','beginner',30,'{dumbbell,mat}','{full_body}','{squat,hinge,push}',null,true,true),
  ('00000000-0000-4000-8000-900000000006','00000000-0000-4000-8000-000000000001','כושר כללי - 30 דקות','שילוב של כוח וסיבולת בזמן קצר.','general','beginner',30,'{dumbbell,kettlebell}','{full_body,legs}','{squat,push,conditioning}',null,true,true)
on conflict (id) do nothing;

do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_items jsonb := '[
    ["00000000-0000-4000-8000-900000000001","Cat Cow","warmup",1,1,null,null,90,null,null],
    ["00000000-0000-4000-8000-900000000001","Back Squat","main",2,5,5,60,null,null,150],
    ["00000000-0000-4000-8000-900000000001","Deadlift","main",3,3,5,80,null,null,180],
    ["00000000-0000-4000-8000-900000000001","Walking Lunge","main",4,3,20,null,null,null,90],
    ["00000000-0000-4000-8000-900000000001","Plank","cooldown",5,3,null,null,45,null,45],
    ["00000000-0000-4000-8000-900000000002","Band Pull Apart","warmup",1,2,15,null,null,null,null],
    ["00000000-0000-4000-8000-900000000002","Bench Press","main",2,4,6,50,null,null,150],
    ["00000000-0000-4000-8000-900000000002","Pull Up","main",3,4,6,null,null,null,150],
    ["00000000-0000-4000-8000-900000000002","Overhead Press","main",4,3,8,30,null,null,120],
    ["00000000-0000-4000-8000-900000000002","Farmer Carry","finisher",5,3,null,null,null,40,60],
    ["00000000-0000-4000-8000-900000000003","Mountain Climbers","warmup",1,1,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000003","Burpee","main",2,4,null,null,40,null,20],
    ["00000000-0000-4000-8000-900000000003","Box Jump","main",3,4,10,null,null,null,40],
    ["00000000-0000-4000-8000-900000000003","Push Up","main",4,4,12,null,null,null,40],
    ["00000000-0000-4000-8000-900000000004","Cat Cow","warmup",1,2,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000004","Hip Flexor Stretch","main",2,2,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000004","Thoracic Rotation","main",3,2,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000004","Band Pull Apart","cooldown",4,2,20,null,null,null,null],
    ["00000000-0000-4000-8000-900000000005","Goblet Squat","main",1,3,8,12,null,null,90],
    ["00000000-0000-4000-8000-900000000005","Kettlebell Swing","main",2,3,12,16,null,null,90],
    ["00000000-0000-4000-8000-900000000005","Push Up","main",3,3,8,null,null,null,60],
    ["00000000-0000-4000-8000-900000000005","Plank","cooldown",4,2,null,null,40,null,null],
    ["00000000-0000-4000-8000-900000000006","Goblet Squat","main",1,3,12,16,null,null,60],
    ["00000000-0000-4000-8000-900000000006","Push Up","main",2,3,10,null,null,null,60],
    ["00000000-0000-4000-8000-900000000006","Kettlebell Swing","main",3,3,15,16,null,null,60],
    ["00000000-0000-4000-8000-900000000006","Mountain Climbers","finisher",4,3,null,null,40,null,30]
  ]'::jsonb;
  v_item jsonb;
  v_exercise uuid;
begin
  for v_item in select * from jsonb_array_elements(v_items) loop
    select id into v_exercise from public.exercises
    where organization_id = v_org and name_en = (v_item ->> 1);
    if v_exercise is not null then
      insert into public.workout_template_exercises
        (template_id, exercise_id, block, position, sets, reps, load_kg, duration_seconds, distance_meters, rest_seconds)
      values (
        (v_item ->> 0)::uuid, v_exercise, (v_item ->> 2)::public.template_block, (v_item ->> 3)::int,
        (v_item ->> 4)::int, (v_item ->> 5)::int, (v_item ->> 6)::numeric,
        (v_item ->> 7)::int, (v_item ->> 8)::int, (v_item ->> 9)::int
      )
      on conflict (template_id, position) do nothing;
    end if;
  end loop;
end $$;

-- --- public timer presets ----------------------------------------------------
insert into public.timer_presets (organization_id, profile_id, name, prepare_seconds, work_seconds,
                                  rest_seconds, rounds, sets, rest_between_sets_seconds, cooldown_seconds, is_public)
values
  ('00000000-0000-4000-8000-000000000001', null, 'טבאטה קלאסי', 10, 20, 10, 8, 1, 60, 0, true),
  ('00000000-0000-4000-8000-000000000001', null, 'EMOM 10 דקות', 15, 45, 15, 10, 1, 0, 60, true),
  ('00000000-0000-4000-8000-000000000001', null, 'אינטרוולים 40/20', 10, 40, 20, 6, 3, 90, 120, true)
on conflict do nothing;
