-- Who gets in, as what, and when.
--
-- These run against the migrated schema with seed.sql applied, so an
-- organization already exists for handle_new_user to attach people to.

-- 1. An address that is not on the allowlist joins as a member and waits.
do $$
declare
  v_id uuid := gen_random_uuid();
  v_role public.member_role;
  v_approved timestamptz;
begin
  insert into auth.users (id, email) values (v_id, 'newcomer@example.test');

  select role, approved_at into v_role, v_approved
  from memberships where profile_id = v_id;

  if v_role is distinct from 'member' then
    raise exception 'an uninvited sign-up joined as %', v_role;
  end if;
  if v_approved is not null then
    raise exception 'an uninvited sign-up was let in without approval';
  end if;

  raise notice 'a new sign-up waits for approval as a member';
end $$;

-- 2. A membership that is still waiting carries no role at all, so every RLS
-- policy built on current_role_in refuses it.
do $$
declare
  v_id uuid;
  v_org uuid;
  v_role public.member_role;
begin
  select id into v_id from profiles where email = 'newcomer@example.test';
  select organization_id into v_org from memberships where profile_id = v_id;

  perform set_config('request.jwt.claim.sub', v_id::text, true);
  v_role := current_role_in(v_org);
  perform set_config('request.jwt.claim.sub', '', true);

  if v_role is not null then
    raise exception 'a member waiting for approval already acts as %', v_role;
  end if;

  raise notice 'an unapproved membership carries no role';
end $$;

-- 3. An allowlisted address becomes an owner on sign-up, already approved.
do $$
declare
  v_id uuid := gen_random_uuid();
  v_role public.member_role;
  v_approved timestamptz;
begin
  insert into owner_emails (email) values ('boss@example.test');
  insert into auth.users (id, email) values (v_id, 'BOSS@example.test');

  select role, approved_at into v_role, v_approved
  from memberships where profile_id = v_id;

  if v_role is distinct from 'owner' then
    raise exception 'an allowlisted address joined as % instead of owner', v_role;
  end if;
  if v_approved is null then
    raise exception 'an owner was left waiting for approval';
  end if;

  raise notice 'an allowlisted address becomes an owner on sign-up';
end $$;

-- 4. Allowlisting someone who already signed up promotes them on the spot.
-- This is the path that rescues an owner who signed in before their address was
-- added, which is exactly what happens the first time a club is set up.
do $$
declare
  v_id uuid;
  v_role public.member_role;
  v_approved timestamptz;
begin
  select id into v_id from profiles where email = 'newcomer@example.test';

  insert into owner_emails (email) values ('newcomer@example.test');

  select role, approved_at into v_role, v_approved
  from memberships where profile_id = v_id;

  if v_role is distinct from 'owner' then
    raise exception 'allowlisting an existing profile left them as %', v_role;
  end if;
  if v_approved is null then
    raise exception 'allowlisting an existing profile left them unapproved';
  end if;

  raise notice 'allowlisting an existing profile promotes them immediately';
end $$;

-- 5. The allowlist is not readable by a member, so the club's owners are not
-- discoverable from the app.
do $$
declare
  v_member uuid;
  v_count integer;
begin
  select profile_id into v_member
  from memberships where role = 'member' and approved_at is not null limit 1;

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  set local role authenticated;
  select count(*) into v_count from owner_emails;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_count <> 0 then
    raise exception 'a member could read % rows of the owner allowlist', v_count;
  end if;

  raise notice 'the owner allowlist is hidden from members';
end $$;
