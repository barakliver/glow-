-- =============================================================================
-- GLoW - fill the calendar
--
-- Creates a class every hour from 07:00 to 23:00, every day, for the next four
-- weeks, each one open for booking with a workout already assigned.
--
-- This is for a club that wants a full timetable to work with rather than an
-- empty week. Paste it into the Supabase SQL editor and run it.
--
-- Safe to run again: the id of each class is derived from its date and hour, so
-- a second run updates the same rows and extends the window forward instead of
-- creating duplicates. Run it once a week and the four-week window rolls with
-- you. Bookings that members have already made are untouched.
--
-- To remove everything this created and nothing else:
--
--   delete from public.classes
--   where notes = 'generated:hourly-timetable'
--     and id not in (select class_id from public.bookings);
--
-- (The second line protects any class someone has already booked. Drop it if
-- you want those gone too - their bookings go with them.)
-- =============================================================================

-- The preconditions, checked on their own first.
--
-- The block below declares variables of types that ship with the workout
-- migration. PL/pgSQL compiles a block's declarations when it reaches it, so on
-- a database that has not had setup.sql run yet the whole thing fails with
-- `type "public.workout_category" does not exist` before any message of ours
-- gets a chance to speak. This block touches no such type, so it runs first and
-- says the useful thing.
do $$
begin
  if to_regclass('public.classes') is null then
    raise exception using
      message = 'The club schema is not installed.',
      hint = 'Run supabase/setup.sql in the SQL editor first, then this file.';
  end if;

  if to_regtype('public.workout_category') is null or to_regclass('public.workouts') is null then
    raise exception using
      message = 'The workout library is not installed.',
      hint = 'Run the current supabase/setup.sql first - it creates the workout tables and the 103 workouts - then run this file again.';
  end if;

  if not exists (select 1 from public.organizations) then
    raise exception using
      message = 'There is no club yet.',
      hint = 'Run supabase/setup.sql in the SQL editor first, then this file.';
  end if;

  if not exists (select 1 from public.workouts) then
    raise exception using
      message = 'The workout tables exist but carry no workouts.',
      hint = 'Re-run supabase/setup.sql - it installs the library into the club.';
  end if;
end $$;

do $$
declare
  -- How far ahead to fill. Four weeks is enough to plan around without burying
  -- the schedule screen.
  v_weeks    constant integer := 4;
  v_first    constant integer := 7;   -- first class of the day, 07:00
  v_last     constant integer := 23;  -- last class of the day, 23:00
  -- Classes run 55 minutes so there are five minutes to clear the floor
  -- between one group and the next.
  v_minutes  constant integer := 55;
  v_marker   constant text := 'generated:hourly-timetable';

  -- One entry per hour from 07:00 to 23:00. A gym does not run the same
  -- session at seven in the morning and eleven at night.
  v_categories constant public.training_category[] := array[
    'strength',     -- 07:00
    'functional',   -- 08:00
    'mobility',     -- 09:00
    'functional',   -- 10:00
    'conditioning', -- 11:00
    'open',         -- 12:00
    'open',         -- 13:00
    'functional',   -- 14:00
    'strength',     -- 15:00
    'functional',   -- 16:00
    'tabata',       -- 17:00
    'functional',   -- 18:00
    'strength',     -- 19:00
    'conditioning', -- 20:00
    'tabata',       -- 21:00
    'mobility',     -- 22:00
    'mobility'      -- 23:00
  ]::public.training_category[];

  v_levels constant public.difficulty_level[] := array[
    'intermediate', 'beginner', 'beginner', 'beginner', 'intermediate', 'intermediate',
    'intermediate', 'beginner', 'advanced', 'intermediate', 'intermediate', 'intermediate',
    'advanced', 'intermediate', 'beginner', 'beginner', 'beginner'
  ]::public.difficulty_level[];

  v_org      uuid;
  v_day      date;
  v_hour     integer;
  v_slot     integer;
  v_index    integer := 0;
  v_class    uuid;
  v_category public.training_category;
  v_family   public.workout_category;
  v_workout  uuid;
  v_start    timestamptz;
  v_created  integer := 0;
begin
  select id into v_org from public.organizations order by created_at limit 1;

  for v_day in
    select generate_series(current_date, current_date + (v_weeks * 7 - 1), interval '1 day')::date
  loop
    for v_hour in v_first..v_last loop
      v_slot := v_hour - v_first + 1;
      v_index := v_index + 1;
      v_category := v_categories[v_slot];

      -- Deterministic id, so re-running updates this exact slot.
      v_class := md5('glow-hourly-' || v_day::text || '-' || v_hour::text)::uuid;

      -- The class sits at this hour in gym time, whatever the server thinks.
      v_start := (v_day + make_interval(hours => v_hour)) at time zone 'Asia/Jerusalem';

      insert into public.classes (
        id, organization_id, series_id, title, description, category, difficulty,
        trainer_id, location, capacity, starts_at, ends_at, equipment,
        status, published, registration_closed, notes
      )
      values (
        v_class, v_org, null,
        case v_category
          when 'strength' then 'אימון כוח'
          when 'functional' then 'אימון פונקציונלי'
          when 'tabata' then 'טבאטה'
          when 'mobility' then 'מוביליטי'
          when 'open' then 'אימון פתוח'
          when 'conditioning' then 'סיבולת'
        end,
        case v_category
          when 'strength' then 'עבודה על תרגילי יסוד עם התקדמות בעומס, ועבודת ליבה בסיום.'
          when 'functional' then 'תחנות של דחיפה, משיכה, נשיאה וקפיצה. מתאים לכל הרמות עם התאמות אישיות.'
          when 'tabata' then 'סבבים קצרים בעצימות גבוהה עם מנוחות קצובות. חד ויעיל.'
          when 'mobility' then 'טווחי תנועה, נשימה ושחרור. מושלם ליום שאחרי אימון כבד.'
          when 'open' then 'מתאמנים לפי התוכנית האישית שלכם, עם ליווי והתאמות מהמאמן.'
          when 'conditioning' then 'עבודת סבולת מתמשכת בקצב שאפשר להחזיק.'
        end,
        v_category, v_levels[v_slot],
        null, 'אולם GLoW', 5,
        v_start, v_start + make_interval(mins => v_minutes),
        '{}'::text[],
        'scheduled', true, false, v_marker
      )
      on conflict (id) do update set
        title = excluded.title,
        description = excluded.description,
        category = excluded.category,
        difficulty = excluded.difficulty,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        published = true,
        status = 'scheduled',
        notes = excluded.notes;

      v_created := v_created + 1;

      -- Give it a workout from the family that fits, walking through the
      -- library so the same session does not come round twice in a day.
      v_family := case v_category
        when 'strength' then 'functional'
        when 'functional' then 'functional'
        when 'tabata' then 'crossfit'
        when 'conditioning' then 'crossfit'
        when 'open' then 'crossfit'
        when 'mobility' then 'yoga'
      end::public.workout_category;

      select pick.id into v_workout
      from (
        select w.id,
               row_number() over (order by w.slug) - 1 as position,
               count(*) over () as total
        from public.workouts w
        where w.organization_id = v_org and w.category = v_family and not w.archived
      ) as pick
      where pick.position = mod(v_index, pick.total);

      if v_workout is not null then
        insert into public.class_workouts (class_id, organization_id, workout_id)
        values (v_class, v_org, v_workout)
        on conflict (class_id) do update set workout_id = excluded.workout_id;
      end if;
    end loop;
  end loop;

  raise notice 'timetable filled: % classes across % weeks, 07:00-23:00 daily',
    v_created, v_weeks;
end $$;
