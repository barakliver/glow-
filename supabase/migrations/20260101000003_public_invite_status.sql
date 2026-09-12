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
