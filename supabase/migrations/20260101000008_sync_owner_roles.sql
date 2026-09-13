-- Make the owner allowlist self-healing.
--
-- Until now the allowlist only took effect at two moments: when an address was
-- inserted into it, and when someone signed up. That leaves a gap that is easy
-- to fall into and impossible to see:
--
--   insert into owner_emails (email) values ('me@example.com')
--   on conflict (email) do nothing;
--
-- If the address is already there from an earlier attempt, the insert does
-- nothing, the after-insert trigger never fires, and the select that follows
-- still returns the row - so it looks like it worked. Anyone who had already
-- signed in before that first insert stays a plain member, in an app whose
-- admin area quietly shows fewer buttons.
--
-- This turns the promotion into something that can be run on demand, and runs
-- it at the end of every setup.sql. Re-pasting that file now fixes the case
-- above by itself.

create or replace function public.sync_owner_roles()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.memberships m
  set role = 'owner',
      status = 'active',
      approved_at = coalesce(m.approved_at, now()),
      updated_at = now()
  from public.profiles p
  where m.profile_id = p.id
    and lower(p.email) in (select lower(o.email) from public.owner_emails o)
    and (m.role <> 'owner' or m.status <> 'active' or m.approved_at is null);

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.sync_owner_roles() from public;

-- Anyone on the allowlist who is not already an owner becomes one now.
select public.sync_owner_roles();
