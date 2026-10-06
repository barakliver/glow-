-- Adds just Barak Workout Military to the library.
--
-- The rest of the 135 workouts are already installed, so pasting the whole of
-- setup.sql again would rewrite everything to add one row. This is that row,
-- lifted verbatim from the generated migration so it cannot drift, with the
-- same deterministic id - which makes it safe to run twice.
do $$
declare
  v_org uuid;
begin
  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is null then
    raise exception 'No organization yet. Run supabase/setup.sql first.';
  end if;

  insert into public.workouts (
    id, organization_id, slug, title, subtitle, category, format, difficulty,
    duration_minutes, time_cap_minutes, equipment, description,
    warmup, structure, cooldown, scaling, score_type, score_label
  )
  select
    v.id, v_org, v.slug, v.title, v.subtitle, v.category, v.format, v.difficulty,
    v.duration_minutes, v.time_cap_minutes, v.equipment, v.description,
    v.warmup, v.structure, v.cooldown, v.scaling, v.score_type, v.score_label
  from (values
  (
    '272162a2-cbc4-4c20-beb1-b59c92c7700e'::uuid, 'barak-military', 'Barak Workout Military',
    'שישה עשר סבבים. ריצה, מוט, ושוב.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 30,
    array['barbell', 'treadmill']::text[], 'שישה עשר סבבים של 140 מטר הלוך וחזור וארבעה קלין וג׳רק. הקצב הוא כל האימון: 16 סבבים בחצי שעה זה סבב כל דקה ושמונה שניות, וכמעט כולם יוצאים מהר מדי בסבב הראשון. למסך החי יש מונה סבבים גדול, שעון, והוא מאריך את עצמו אם הקצב אומר שחצי שעה לא תספיק.',
    '[{"label":"הליכון","detail":"5 דקות, עולים בקצב בהדרגה"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עד משקל העבודה"}]'::jsonb, '[{"label":"כוח","detail":"חימום הקלין עד משקל העבודה, בלי לעייף","items":[{"label":"Clean and Jerk","detail":"3 סטים של 2, עולים"}]},{"label":"מטקון","detail":"16 סבבים, למהירות. מכסת זמן 30 דקות","items":[{"label":"הליכון","detail":"140 מטר הלוך וחזור"},{"label":"Clean and Jerk","detail":"4 חזרות, 40 ק״ג"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"10 סבבים, 100 מטר, מוט במשקל נוח שמאפשר 4 חזרות נקיות."},{"level":"intermediate","detail":"לפי הפרוטוקול: 16 סבבים, 140 מטר, 40 ק״ג."},{"level":"advanced","detail":"20 סבבים, או אותם 16 במכסת זמן של 25 דקות."}]'::jsonb,
    'time'::public.score_type, null
  )
  ) as v (
    id, slug, title, subtitle, category, format, difficulty,
    duration_minutes, time_cap_minutes, equipment, description,
    warmup, structure, cooldown, scaling, score_type, score_label
  )
  on conflict (id) do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    category = excluded.category,
    format = excluded.format,
    difficulty = excluded.difficulty,
    duration_minutes = excluded.duration_minutes,
    time_cap_minutes = excluded.time_cap_minutes,
    equipment = excluded.equipment,
    description = excluded.description,
    warmup = excluded.warmup,
    structure = excluded.structure,
    cooldown = excluded.cooldown,
    scaling = excluded.scaling,
    score_type = excluded.score_type,
    score_label = excluded.score_label,
    archived = false;

  raise notice 'Barak Workout Military is in the library';
end $$;
