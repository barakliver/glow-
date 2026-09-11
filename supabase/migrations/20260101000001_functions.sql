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
