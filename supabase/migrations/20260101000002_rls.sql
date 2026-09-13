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
