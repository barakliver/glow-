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
