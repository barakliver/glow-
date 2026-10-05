-- Puts Barak Workout Military on the board at 17:00, every day.
--
-- It claims the 17:00 slot the hourly timetable already builds, so no class is
-- duplicated and nothing else on the schedule moves: the slot keeps its id,
-- which means anybody already booked into 17:00 stays booked. Re-running it is
-- safe and does nothing new.
--
-- Run supabase/setup.sql first - the workout has to exist in the library
-- before it can be put on a board. This script says so rather than failing
-- somewhere confusing if it does not.

do $$
declare
  v_weeks   constant integer := 8;
  v_hour    constant integer := 17;
  v_org     uuid;
  v_workout uuid;
  v_day     date;
  v_class   uuid;
  v_start   timestamptz;
  v_count   integer := 0;
begin
  if to_regclass('public.workouts') is null then
    raise exception 'The workout tables are missing. Run supabase/setup.sql first.';
  end if;

  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is null then
    raise exception 'No organization yet. Run supabase/setup.sql first.';
  end if;

  select id into v_workout
  from public.workouts
  where organization_id = v_org and slug = 'barak-military';

  if v_workout is null then
    raise exception
      'Barak Workout Military is not in the library yet. Run supabase/setup.sql, then this.';
  end if;

  for v_day in
    select generate_series(current_date, current_date + (v_weeks * 7 - 1), interval '1 day')::date
  loop
    -- The same deterministic id the hourly timetable uses, so this takes over
    -- that slot rather than creating a second class at the same hour.
    v_class := md5('glow-hourly-' || v_day::text || '-' || v_hour::text)::uuid;
    v_start := (v_day + make_interval(hours => v_hour)) at time zone 'Asia/Jerusalem';

    insert into public.classes (
      id, organization_id, series_id, title, description, category, difficulty,
      trainer_id, location, capacity, starts_at, ends_at, equipment,
      status, published, registration_closed, notes
    )
    values (
      v_class, v_org, null,
      'Barak Workout Military',
      '16 סבבים של 140 מטר הלוך וחזור וארבעה קלין וג׳רק. מכסת זמן 30 דקות, ובמסך האימון יש מונה סבבים, שעון שמאריך את עצמו לפי הקצב, ואומדן קלוריות.',
      'conditioning', 'advanced',
      null, 'אולם GLoW', 5,
      v_start, v_start + make_interval(mins => 60),
      array['barbell', 'treadmill']::text[],
      'scheduled', true, false, 'generated:barak-military'
    )
    on conflict (id) do update set
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      difficulty = excluded.difficulty,
      equipment = excluded.equipment,
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      published = true,
      status = 'scheduled',
      notes = excluded.notes;

    insert into public.class_workouts (class_id, organization_id, workout_id)
    values (v_class, v_org, v_workout)
    on conflict (class_id) do update set workout_id = excluded.workout_id;

    v_count := v_count + 1;
  end loop;

  raise notice 'Barak Workout Military is on the board at 17:00 for % days', v_count;
end $$;

-- The next week of it, so you can see it landed without opening the app.
select
  to_char(c.starts_at at time zone 'Asia/Jerusalem', 'YYYY-MM-DD HH24:MI') as when_local,
  c.title,
  w.title as workout
from public.classes c
join public.class_workouts cw on cw.class_id = c.id
join public.workouts w on w.id = cw.workout_id
where c.notes = 'generated:barak-military'
  and c.starts_at >= now()
order by c.starts_at
limit 7;
