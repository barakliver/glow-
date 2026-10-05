-- Barak Workout Military is on the board at 17:00, every day, exactly once.
do $$
declare
  v_days      integer;
  v_distinct  integer;
  v_wrong     text;
  v_unlinked  integer;
begin
  select count(*), count(distinct c.starts_at::date)
    into v_days, v_distinct
  from public.classes c
  where c.notes = 'generated:barak-military'
    and c.starts_at >= current_date;

  if v_days = 0 then
    raise exception 'the military session reached no day at all';
  end if;

  -- One per day, not two. The script claims the hourly slot by its own
  -- deterministic id, so a second run must not add a second class.
  if v_days <> v_distinct then
    raise exception 'more than one military class on some day: % classes across % days',
      v_days, v_distinct;
  end if;

  -- Every one of them at 17:00 gym time, whatever the server's timezone is.
  select string_agg(distinct to_char(c.starts_at at time zone 'Asia/Jerusalem', 'HH24:MI'), ', ')
    into v_wrong
  from public.classes c
  where c.notes = 'generated:barak-military'
    and to_char(c.starts_at at time zone 'Asia/Jerusalem', 'HH24:MI') <> '17:00';

  if v_wrong is not null then
    raise exception 'a military class landed at the wrong hour: %', v_wrong;
  end if;

  -- And each one actually carries the workout, or the board says a name the
  -- member cannot open.
  select count(*) into v_unlinked
  from public.classes c
  left join public.class_workouts cw on cw.class_id = c.id
  left join public.workouts w on w.id = cw.workout_id and w.slug = 'barak-military'
  where c.notes = 'generated:barak-military'
    and w.id is null;

  if v_unlinked > 0 then
    raise exception '% military classes carry no workout', v_unlinked;
  end if;

  raise notice 'Barak Workout Military sits at 17:00 on % days, one each, all linked', v_days;
end $$;
