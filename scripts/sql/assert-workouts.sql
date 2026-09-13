-- The workout of the day: who can see it, and when.
--
-- These run as the `authenticated` role under Row Level Security, which is the
-- only way to prove the gate. Every check in the application layer can be
-- bypassed by anyone holding the anon key and a REST client; the policy cannot.
-- 0. There has to be an approved member to test with. Without this guard every
-- assertion below would pass against a null uid, which proves nothing.
do $$
declare
  v_member uuid;
begin
  select profile_id into v_member
  from memberships where role = 'member' and approved_at is not null limit 1;
  if v_member is null then
    raise exception 'no approved member in the seed - the assertions below would be vacuous';
  end if;
  raise notice 'the seeded club has approved members to test with';
end $$;

-- 1. The library itself is shared reference material every member may browse.
do $$
declare
  v_member uuid;
  v_count integer;
begin
  select profile_id into v_member
  from memberships where role = 'member' and approved_at is not null limit 1;

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  set local role authenticated;
  select count(*) into v_count from workouts;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_count < 100 then
    raise exception 'a member could only see % workouts in the library', v_count;
  end if;

  raise notice 'the workout library is open to members (% workouts)', v_count;
end $$;

-- 2. The workout planned for a class is invisible to a member who has not
-- booked it, and visible the moment they do.
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_member uuid;
  v_class uuid;
  v_workout uuid;
  v_count integer;
begin
  select profile_id into v_member
  from memberships where role = 'member' and approved_at is not null limit 1;
  select id into v_workout from workouts where slug = 'fran';

  -- A future class this member is definitely not in.
  insert into classes (organization_id, title, category, difficulty, location,
                       capacity, starts_at, ends_at, published)
  values (v_org, 'בדיקת חשיפה', 'functional', 'intermediate', 'אולם GLoW',
          5, now() + interval '2 days', now() + interval '2 days 1 hour', true)
  returning id into v_class;

  insert into class_workouts (class_id, organization_id, workout_id)
  values (v_class, v_org, v_workout);

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  set local role authenticated;
  select count(*) into v_count from class_workouts where class_id = v_class;
  reset role;

  if v_count <> 0 then
    raise exception 'an unbooked member could read the class workout';
  end if;

  -- Book, and the same query now returns the row.
  set local role authenticated;
  perform book_class(v_class);
  select count(*) into v_count from class_workouts where class_id = v_class;
  reset role;

  if v_count <> 1 then
    raise exception 'a booked member could not read the class workout (% rows)', v_count;
  end if;

  -- Cancel, and it closes again.
  set local role authenticated;
  perform cancel_booking(v_class);
  select count(*) into v_count from class_workouts where class_id = v_class;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_count <> 0 then
    raise exception 'the class workout stayed visible after cancelling';
  end if;

  delete from classes where id = v_class;
  raise notice 'a class workout is revealed only to a member holding a place';
end $$;

-- 3. The teaser function tells a member the shape of the session and nothing
-- else. It is what the schedule shows before booking, so it must not be a hole.
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_member uuid;
  v_class uuid;
  v_row record;
  v_columns text;
begin
  select profile_id into v_member
  from memberships where role = 'member' and approved_at is not null limit 1;

  insert into classes (organization_id, title, category, difficulty, location,
                       capacity, starts_at, ends_at, published)
  values (v_org, 'בדיקת תקציר', 'functional', 'intermediate', 'אולם GLoW',
          5, now() + interval '3 days', now() + interval '3 days 1 hour', true)
  returning id into v_class;

  insert into class_workouts (class_id, organization_id, workout_id)
  values (v_class, v_org, (select id from workouts where slug = 'fran'));

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  set local role authenticated;
  select * into v_row
  from class_workout_teasers(now(), now() + interval '30 days')
  where class_id = v_class;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_row is null then
    raise exception 'the teaser hid a class that has a workout planned';
  end if;
  if v_row.category is distinct from 'crossfit' or v_row.format is distinct from 'for_time' then
    raise exception 'the teaser reported the wrong shape';
  end if;

  -- The function must expose the shape only. A movement column here would mean
  -- the whole gate is decorative.
  select string_agg(p.proargnames[i], ', ') into v_columns
  from pg_proc p,
       lateral generate_subscripts(p.proargnames, 1) i
  where p.proname = 'class_workout_teasers'
    and p.proargnames[i] not in (
      'p_from', 'p_to', 'class_id', 'category', 'format', 'duration_minutes', 'difficulty'
    );
  if v_columns is not null then
    raise exception 'the teaser function exposes unexpected columns: %', v_columns;
  end if;

  delete from classes where id = v_class;
  raise notice 'the teaser exposes the shape of the session and nothing more';
end $$;

-- 4. Results belong to the member who recorded them.
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_mine uuid;
  v_theirs uuid;
  v_workout uuid;
  v_count integer;
begin
  select id into v_workout from workouts where slug = 'cindy';
  select profile_id into v_mine
  from memberships where role = 'member' and approved_at is not null order by profile_id limit 1;
  select profile_id into v_theirs
  from memberships where role = 'member' and approved_at is not null and profile_id <> v_mine
  order by profile_id limit 1;

  insert into workout_logs (organization_id, profile_id, workout_id, performed_on,
                            score_type, result_rounds, result_reps, rx)
  values (v_org, v_theirs, v_workout, current_date, 'rounds_and_reps', 20, 5, true);

  perform set_config('request.jwt.claim.sub', v_mine::text, true);
  set local role authenticated;
  select count(*) into v_count from workout_logs where profile_id = v_theirs;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_count <> 0 then
    raise exception 'a member could read % results belonging to someone else', v_count;
  end if;

  delete from workout_logs where profile_id = v_theirs and workout_id = v_workout;
  raise notice 'a member sees only their own results';
end $$;

-- 5. Five to a class is the shipped default, in the database and not only in
-- the form that happens to call it.
do $$
declare
  v_class integer;
  v_series integer;
begin
  select (column_default)::integer into v_class
  from information_schema.columns
  where table_schema = 'public' and table_name = 'classes' and column_name = 'capacity';

  select (column_default)::integer into v_series
  from information_schema.columns
  where table_schema = 'public' and table_name = 'class_series' and column_name = 'capacity';

  if v_class is distinct from 5 or v_series is distinct from 5 then
    raise exception 'default capacity is class=%, series=%', v_class, v_series;
  end if;

  raise notice 'a class holds five people unless an owner says otherwise';
end $$;

-- 6. A member who is still waiting for approval reads nothing at all - not the
-- workout library, and not the club's schedule either.
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_waiting uuid := gen_random_uuid();
  v_workouts integer;
  v_classes integer;
begin
  insert into auth.users (id, email) values (v_waiting, 'atthedoor@example.test');

  perform set_config('request.jwt.claim.sub', v_waiting::text, true);
  set local role authenticated;
  select count(*) into v_workouts from workouts;
  select count(*) into v_classes from classes;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_workouts <> 0 or v_classes <> 0 then
    raise exception 'a member waiting for approval read % workouts and % classes',
      v_workouts, v_classes;
  end if;

  raise notice 'a member waiting for approval reads nothing';
end $$;
