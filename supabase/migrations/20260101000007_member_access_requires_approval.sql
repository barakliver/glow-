-- Approval was only half-enforced.
--
-- 20260101000004 added the approval gate and put it in `current_role_in`, which
-- `is_owner_of` and `is_staff_of` are built on. `is_member_of` was left as it
-- was: active membership, no approval. Every member-level read policy - the
-- schedule, the trainer list, the class series, and now the workout library -
-- hangs off that function, so anyone who signed in and was still waiting at the
-- door could read the club's week.
--
-- The application never showed them any of it, because `getSessionUser` returns
-- nothing for an unapproved membership. That is exactly the kind of protection
-- the product is not allowed to rely on: anyone holding the anon key and a REST
-- client skips the application entirely.

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
      and m.approved_at is not null
  );
$$;
