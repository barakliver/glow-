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
