-- The timetable filler: a class every hour, every day, bookable, with a workout.
--
-- Applied twice by verify-sql.sh before this file runs, so everything here is
-- also an assertion that a second run updates rather than duplicates.

-- 1. Seventeen classes a day, 07:00 to 23:00 in gym time, for four weeks.
do $$
declare
  v_days integer;
  v_wrong text;
  v_total integer;
begin
  select count(distinct (starts_at at time zone 'Asia/Jerusalem')::date) into v_days
  from classes where notes = 'generated:hourly-timetable';
  if v_days <> 28 then
    raise exception 'the filler covered % days, expected 28', v_days;
  end if;

  select string_agg(distinct day::text, ', ') into v_wrong
  from (
    select (starts_at at time zone 'Asia/Jerusalem')::date as day, count(*) as n
    from classes where notes = 'generated:hourly-timetable'
    group by 1
  ) per_day
  where n <> 17;
  if v_wrong is not null then
    raise exception 'days without 17 classes: %', v_wrong;
  end if;

  select count(*) into v_total
  from classes
  where notes = 'generated:hourly-timetable'
    and extract(hour from starts_at at time zone 'Asia/Jerusalem') between 7 and 23;
  if v_total <> 28 * 17 then
    raise exception 'only % classes landed on an hour between 07:00 and 23:00', v_total;
  end if;

  raise notice 'the timetable runs 07:00-23:00 every day for four weeks';
end $$;

-- 2. Every one of them is open for booking, holds five, and carries a workout.
do $$
declare
  v_closed integer;
  v_capacity integer;
  v_unplanned integer;
begin
  select count(*) into v_closed
  from classes
  where notes = 'generated:hourly-timetable'
    and (not published or registration_closed or status <> 'scheduled');
  if v_closed <> 0 then
    raise exception '% generated classes are not open for booking', v_closed;
  end if;

  select count(*) into v_capacity
  from classes where notes = 'generated:hourly-timetable' and capacity <> 5;
  if v_capacity <> 0 then
    raise exception '% generated classes do not hold five people', v_capacity;
  end if;

  select count(*) into v_unplanned
  from classes c
  where c.notes = 'generated:hourly-timetable'
    and not exists (select 1 from class_workouts cw where cw.class_id = c.id);
  if v_unplanned <> 0 then
    raise exception '% generated classes have no workout planned', v_unplanned;
  end if;

  raise notice 'every generated class is bookable, holds five and has a workout';
end $$;

-- 3. A mobility class is not handed a barbell benchmark. The mapping from the
-- kind of class to the family of workout has to hold, or the timetable reads
-- like a shuffle.
do $$
declare
  v_mismatched text;
begin
  select string_agg(distinct c.category || ' -> ' || w.category, ', ') into v_mismatched
  from classes c
  join class_workouts cw on cw.class_id = c.id
  join workouts w on w.id = cw.workout_id
  where c.notes = 'generated:hourly-timetable'
    -- Mobility draws from either soft family: it alternates, because nothing
    -- else maps to pilates and pinning it to yoga made every pilates session
    -- in the library unreachable as a class workout.
    and case c.category
      when 'mobility' then w.category not in ('yoga', 'pilates')
      when 'strength' then w.category <> 'functional'
      when 'functional' then w.category <> 'functional'
      else w.category <> 'crossfit'
    end;

  if v_mismatched is not null then
    raise exception 'class kind paired with the wrong workout family: %', v_mismatched;
  end if;

  raise notice 'each class kind draws from the right family of workouts';

  -- The point of alternating: both soft families actually get dealt out.
  if not exists (
    select 1 from classes c
    join class_workouts cw on cw.class_id = c.id
    join workouts w on w.id = cw.workout_id
    where c.notes = 'generated:hourly-timetable' and w.category = 'pilates'
  ) then
    raise exception 'no pilates workout was dealt to any class - the whole family is unreachable';
  end if;

  raise notice 'pilates reaches the timetable too';
end $$;

-- 4. A member can actually book one, and the workout opens when they do.
do $$
declare
  v_member uuid;
  v_class uuid;
  v_result jsonb;
  v_visible integer;
begin
  select profile_id into v_member
  from memberships where role = 'member' and approved_at is not null limit 1;

  -- Tomorrow morning, comfortably past the booking cutoff.
  select id into v_class
  from classes
  where notes = 'generated:hourly-timetable'
    and starts_at > now() + interval '12 hours'
  order by starts_at
  limit 1;

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  set local role authenticated;

  select count(*) into v_visible from class_workouts where class_id = v_class;
  if v_visible <> 0 then
    reset role;
    raise exception 'the workout was visible before booking';
  end if;

  v_result := book_class(v_class);
  select count(*) into v_visible from class_workouts where class_id = v_class;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);

  if v_result ->> 'status' is distinct from 'confirmed' then
    raise exception 'booking a generated class returned %', v_result;
  end if;
  if v_visible <> 1 then
    raise exception 'the workout did not open after booking';
  end if;

  delete from bookings where class_id = v_class and profile_id = v_member;
  raise notice 'a member books a generated class and the workout opens';
end $$;
