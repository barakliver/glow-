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
