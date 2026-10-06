do $$
declare
  v_count integer;
  v_title text;
begin
  select count(*) into v_count
  from public.workouts where slug = 'barak-military' and not archived;

  if v_count <> 1 then
    raise exception 'expected exactly one barak-military workout, found %', v_count;
  end if;

  select title into v_title from public.workouts where slug = 'barak-military';
  if v_title <> 'Barak Workout Military' then
    raise exception 'the workout is there under the wrong title: %', v_title;
  end if;

  raise notice 'Barak Workout Military is in the library, exactly once';
end $$;
