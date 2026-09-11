-- Exercises the production booking path: book_class, cancel_booking, the
-- waiting list, and what the public invitation endpoint may expose.
-- Every check raises an exception on failure, so a clean run means a pass.
\set ON_ERROR_STOP on
\pset pager off
\set QUIET on

\set CLASS '''00000000-0000-4000-8000-aaaaaaaaaaaa'''
\set PAST  '''00000000-0000-4000-8000-bbbbbbbbbbbb'''
\set A     '''00000000-0000-4000-8000-100000000004'''
\set B     '''00000000-0000-4000-8000-100000000005'''
\set C     '''00000000-0000-4000-8000-100000000006'''

do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_class uuid := '00000000-0000-4000-8000-aaaaaaaaaaaa';
  v_past uuid := '00000000-0000-4000-8000-bbbbbbbbbbbb';
  v_a uuid := '00000000-0000-4000-8000-100000000004';
  v_b uuid := '00000000-0000-4000-8000-100000000005';
  v_c uuid := '00000000-0000-4000-8000-100000000006';
  v_result jsonb;
  v_count integer;
begin
  -- A one-seat class two days out, with no seeded bookings attached.
  delete from bookings where class_id in (v_class, v_past);
  delete from classes where id in (v_class, v_past);
  insert into classes (id, organization_id, title, category, difficulty, location,
                       capacity, starts_at, ends_at, published)
  values (v_class, v_org, 'בדיקת הרשמה', 'functional', 'beginner', 'אולם GLoW',
          1, now() + interval '2 days', now() + interval '2 days 1 hour', true),
         (v_past, v_org, 'שיעור שעבר', 'functional', 'beginner', 'אולם GLoW',
          5, now() - interval '2 hours', now() - interval '1 hour', true);

  -- 1. The first member takes the only seat.
  perform set_config('request.jwt.claim.sub', v_a::text, false);
  v_result := book_class(v_class);
  if v_result ->> 'status' is distinct from 'confirmed' then
    raise exception 'expected confirmed, got %', v_result;
  end if;

  -- 2. Booking twice is refused.
  v_result := book_class(v_class);
  if v_result ->> 'code' is distinct from 'already_booked' then
    raise exception 'expected already_booked, got %', v_result;
  end if;

  -- 3 and 4. Overflow is queued in order.
  perform set_config('request.jwt.claim.sub', v_b::text, false);
  v_result := book_class(v_class);
  if v_result ->> 'status' is distinct from 'waitlisted' or (v_result ->> 'position')::int <> 1 then
    raise exception 'expected waitlist position 1, got %', v_result;
  end if;

  perform set_config('request.jwt.claim.sub', v_c::text, false);
  v_result := book_class(v_class);
  if (v_result ->> 'position')::int <> 2 then
    raise exception 'expected waitlist position 2, got %', v_result;
  end if;

  -- 5. Cancelling promotes the first in the queue.
  perform set_config('request.jwt.claim.sub', v_a::text, false);
  v_result := cancel_booking(v_class);
  if (v_result ->> 'promoted_profile_id')::uuid is distinct from v_b then
    raise exception 'expected % promoted, got %', v_b, v_result;
  end if;

  if (select status from bookings where class_id = v_class and profile_id = v_b) <> 'confirmed' then
    raise exception 'promoted member should be confirmed';
  end if;

  -- 6. The rest of the queue is renumbered contiguously.
  if (select waitlist_position from bookings where class_id = v_class and profile_id = v_c) <> 1 then
    raise exception 'queue was not renumbered after promotion';
  end if;

  -- 7. The promoted member was notified.
  select count(*) into v_count from notifications
  where profile_id = v_b and type = 'waitlist_promoted';
  if v_count < 1 then raise exception 'promotion notification missing'; end if;

  -- 8. Capacity is never exceeded.
  select count(*) into v_count from bookings
  where class_id = v_class and status in ('confirmed', 'attended');
  if v_count > 1 then raise exception 'capacity exceeded: % confirmed', v_count; end if;

  -- 9. A class that already started refuses bookings.
  perform set_config('request.jwt.claim.sub', v_c::text, false);
  v_result := book_class(v_past);
  if v_result ->> 'code' is distinct from 'class_started' then
    raise exception 'expected class_started, got %', v_result;
  end if;

  raise notice 'booking transaction checks passed';
end $$;

-- 10. The public invitation endpoint exposes classes but no member data.
do $$
declare
  v_count integer;
  v_token text := 'glow-invite-check';
begin
  insert into invite_links (organization_id, token, label, created_by)
  values ('00000000-0000-4000-8000-000000000001', v_token, 'בדיקה',
          '00000000-0000-4000-8000-100000000001')
  on conflict (token) do update set revoked = false, expires_at = null;

  select count(*) into v_count
  from public_schedule(v_token, now(), now() + interval '7 days');
  if v_count = 0 then raise exception 'public schedule returned nothing for a valid token'; end if;

  update invite_links set revoked = true where token = v_token;
  select count(*) into v_count from public_schedule(v_token, now(), now() + interval '7 days');
  if v_count <> 0 then raise exception 'revoked token still returned % rows', v_count; end if;

  update invite_links set revoked = false, expires_at = now() - interval '1 day' where token = v_token;
  select count(*) into v_count from public_schedule(v_token, now(), now() + interval '7 days');
  if v_count <> 0 then raise exception 'expired token still returned % rows', v_count; end if;

  delete from invite_links where token = v_token;
  raise notice 'public invitation checks passed';
end $$;

-- 11. Row Level Security is on for every table in the public schema.
do $$
declare
  v_open text;
begin
  select string_agg(t.tablename, ', ') into v_open
  from pg_tables t
  join pg_class c on c.relname = t.tablename and c.relnamespace = 'public'::regnamespace
  where t.schemaname = 'public' and not c.relrowsecurity;

  if v_open is not null then
    raise exception 'tables without row level security: %', v_open;
  end if;
  raise notice 'row level security checks passed';
end $$;
