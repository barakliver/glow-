-- Nicknames, faces, and who is coming to a class.
--
-- Two things at once, because they are the same feature: a member gets to
-- choose how they appear, and everyone booked into the same class gets to see
-- who else is in the room.
--
-- What a member sees of another member is deliberately thin: the name they
-- chose for themselves and the avocado they picked. Never a full legal name,
-- never a phone number, never an email, never anything they have trained or
-- recorded. A roster answers "who is in the room on Tuesday", and nothing else
-- about the person is any of its business.

-- --- the nickname and the face ----------------------------------------------

alter table public.profiles
  add column if not exists display_name text;

comment on column public.profiles.display_name is
  'What this member is called in the club. Shown to other members instead of full_name; full_name stays for the owner''s records.';

alter table public.profiles
  add column if not exists avatar_preset text;

comment on column public.profiles.avatar_preset is
  'Key of a drawn avocado from src/lib/domain/avatars.ts. Not an upload: no storage bucket, no moderation queue, nothing to leak.';

do $$
begin
  alter table public.profiles
    add constraint profiles_display_name_length
    check (display_name is null or char_length(btrim(display_name)) between 1 and 24);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles
    add constraint profiles_avatar_preset_shape
    check (avatar_preset is null or avatar_preset ~ '^[a-z][a-z0-9_-]{0,31}$');
exception
  when duplicate_object then null;
end $$;

-- --- who is coming -----------------------------------------------------------

-- The name to show for a member, in one place so nothing can accidentally
-- print a legal name. A chosen name wins; otherwise the first name only.
create or replace function public.member_public_name(p_profile_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(btrim(p.display_name), ''),
    nullif(split_part(btrim(p.full_name), ' ', 1), ''),
    'מתאמן'
  )
  from public.profiles p
  where p.id = p_profile_id;
$$;

/*
 * The roster of a class.
 *
 * Security definer because the caller must NOT be able to read the profiles
 * table directly - the whole point is that this returns four columns and no
 * others. RLS protects rows; it does not protect columns, which is why this
 * is a function and not a view over a join.
 *
 * Staff see the roster of any class in their club. A member sees it only for
 * a class in a club they are an approved member of. Nobody else sees anything,
 * including through an invite link, because an invite carries no session.
 */
create or replace function public.class_roster(p_class_id uuid)
returns table (
  profile_id uuid,
  name text,
  avatar_preset text,
  status public.booking_status,
  waitlist_position integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.profile_id,
    public.member_public_name(b.profile_id) as name,
    p.avatar_preset,
    b.status,
    b.waitlist_position
  from public.bookings b
  join public.classes c on c.id = b.class_id
  join public.profiles p on p.id = b.profile_id
  where b.class_id = p_class_id
    and b.status in ('confirmed', 'waitlisted', 'attended')
    and (public.is_staff_of(c.organization_id) or public.is_member_of(c.organization_id))
  order by
    case b.status when 'waitlisted' then 1 else 0 end,
    b.waitlist_position nulls first,
    b.created_at;
$$;

revoke all on function public.class_roster(uuid) from public;
grant execute on function public.class_roster(uuid) to authenticated;

revoke all on function public.member_public_name(uuid) from public;
grant execute on function public.member_public_name(uuid) to authenticated;
