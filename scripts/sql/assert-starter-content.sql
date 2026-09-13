-- setup.sql must give a new club a usable library and nothing else: no demo
-- people, no demo classes, no bookings.
\set ON_ERROR_STOP on
\set QUIET on

do $$
declare v_count integer;
begin
  select count(*) into v_count from exercises where not archived;
  if v_count < 20 then raise exception 'expected the exercise library, found %', v_count; end if;

  select count(*) into v_count from workout_templates where approved and suggestable and not archived;
  if v_count < 6 then raise exception 'expected 6 suggestable templates, found %', v_count; end if;

  select count(*) into v_count from workout_template_exercises;
  if v_count < 26 then raise exception 'templates are missing their exercises (%)', v_count; end if;

  select count(*) into v_count from timer_presets where is_public;
  if v_count < 3 then raise exception 'expected 3 public timer presets, found %', v_count; end if;

  select count(*) into v_count from organizations;
  if v_count <> 1 then raise exception 'expected exactly one club, found %', v_count; end if;

  raise notice 'starter library present';
end $$;

do $$
declare v_count integer;
begin
  select count(*) into v_count from profiles;
  if v_count <> 0 then raise exception 'starter content must not create demo people'; end if;
  select count(*) into v_count from classes;
  if v_count <> 0 then raise exception 'starter content must not create demo classes'; end if;
  select count(*) into v_count from bookings;
  if v_count <> 0 then raise exception 'starter content must not create bookings'; end if;
  raise notice 'no demo data leaked into starter content';
end $$;

do $$
declare v_open text;
begin
  select string_agg(t.tablename, ', ') into v_open
  from pg_tables t
  join pg_class c on c.relname = t.tablename and c.relnamespace = 'public'::regnamespace
  where t.schemaname = 'public' and not c.relrowsecurity;
  if v_open is not null then raise exception 'tables without row level security: %', v_open; end if;
  raise notice 'row level security enabled on every table';
end $$;

-- The workout library ships with the club, installed by the trigger that fires
-- when the organization row is created.
do $$
declare
  v_total integer;
  v_crossfit integer;
  v_incomplete text;
begin
  select count(*) into v_total from workouts;
  if v_total < 100 then
    raise exception 'the workout library installed only % workouts', v_total;
  end if;

  select count(*) into v_crossfit from workouts where category = 'crossfit';
  if v_crossfit < 30 then
    raise exception 'only % crossfit workouts installed', v_crossfit;
  end if;

  -- A workout with no structure or no scaling cannot actually be run.
  select string_agg(slug, ', ') into v_incomplete
  from workouts
  where jsonb_array_length(structure) = 0
     or jsonb_array_length(scaling) <> 3
     or jsonb_array_length(warmup) = 0;
  if v_incomplete is not null then
    raise exception 'incomplete workouts: %', v_incomplete;
  end if;

  raise notice 'the workout library is installed (% workouts)', v_total;
end $$;

-- Nothing is planned for a class yet, and nobody has a result: the starter
-- content is a library, not somebody's training history.
do $$
declare
  v_links integer;
  v_logs integer;
begin
  select count(*) into v_links from class_workouts;
  select count(*) into v_logs from workout_logs;
  if v_links <> 0 or v_logs <> 0 then
    raise exception 'starter content carried % class links and % results', v_links, v_logs;
  end if;
  raise notice 'no class assignments or results leaked into starter content';
end $$;
