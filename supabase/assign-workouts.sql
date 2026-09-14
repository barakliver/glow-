-- Re-deals the workout of the day across the timetable that is already there.
--
-- Run this after the library grows. It touches nothing but the class-to-workout
-- link: no class is created, moved, renamed or cancelled, and no booking is
-- affected - so it is safe to run on a live schedule in the middle of a week.
--
-- Why it is needed at all: supabase/fill-schedule.sql assigns a workout while
-- it builds the timetable, so workouts added to the library afterwards are
-- never dealt out until the whole timetable is rebuilt. This is the small
-- version of that.

do $$
declare
  v_org      uuid;
  v_class    record;
  v_family   public.workout_category;
  v_workout  uuid;
  v_index    integer := 0;
  v_linked   integer := 0;
  v_total    integer;
begin
  if to_regclass('public.workouts') is null or to_regclass('public.class_workouts') is null then
    raise exception 'The workout tables are missing. Run supabase/setup.sql first.';
  end if;

  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is null then
    raise exception 'No organization yet. Run supabase/setup.sql first.';
  end if;

  select count(*) into v_total
  from public.workouts
  where organization_id = v_org and not archived;

  raise notice 'library holds % workouts', v_total;

  for v_class in
    select id, category
    from public.classes
    where organization_id = v_org
      and status = 'scheduled'
      and starts_at >= now()
    order by starts_at, id
  loop
    v_index := v_index + 1;

    v_family := case v_class.category
      when 'strength' then 'functional'
      when 'functional' then 'functional'
      when 'tabata' then 'crossfit'
      when 'conditioning' then 'crossfit'
      when 'open' then 'crossfit'
      when 'mobility' then case when mod(v_index, 2) = 0 then 'yoga' else 'pilates' end
    end::public.workout_category;

    /*
     * Walk the family in slug order and step one along per class. Over a
     * timetable of hundreds of classes that deals every workout in the family
     * out several times over, which is the point: a session added to the
     * library today turns up on the board this week rather than never.
     */
    select pick.id into v_workout
    from (
      select w.id,
             row_number() over (order by w.slug) - 1 as position,
             count(*) over () as total
      from public.workouts w
      where w.organization_id = v_org
        and w.category = v_family
        and not w.archived
    ) as pick
    where pick.position = mod(v_index, pick.total);

    if v_workout is not null then
      insert into public.class_workouts (class_id, organization_id, workout_id)
      values (v_class.id, v_org, v_workout)
      on conflict (class_id) do update set workout_id = excluded.workout_id;
      v_linked := v_linked + 1;
    end if;
  end loop;

  raise notice 'dealt a workout to % upcoming classes', v_linked;
end $$;

-- What landed, so you can see the new names on the board without opening the app.
select w.title, w.category, count(*) as classes
from public.class_workouts cw
join public.workouts w on w.id = cw.workout_id
join public.classes c on c.id = cw.class_id
where c.starts_at >= now()
group by w.title, w.category
order by classes desc, w.title;
