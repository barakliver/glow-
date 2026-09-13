-- =============================================================================
-- GLoW - workout library content
--
-- GENERATED FILE - do not edit by hand.
-- Source: src/lib/data/workouts/*.ts
-- Rebuild with: npm run build:workout-sql
--
-- 103 workouts: 33 crossfit, 33 functional, 20 pilates, 17 yoga.
--
-- The library is installed per club rather than inline, because this migration
-- runs before any organization exists: on a fresh database the schema is
-- created first and the club is created by the seed that follows. The trigger
-- below installs the library whenever a club is created, and the call at the
-- end covers a database that already had one.
--
-- Ids are derived from the workout slug so the in-memory demo adapter and
-- PostgreSQL agree on what "fran" is. That derivation has room for exactly one
-- club, which is what GLoW is; hosting a second one means moving to per-club
-- ids, and this comment is the place to start.
-- =============================================================================

create or replace function public.install_workout_library()
returns integer
language plpgsql
security definer
set search_path = public
as $install$
declare
  v_org uuid;
  v_count integer;
begin
  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is null then
    return 0;
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
    '92aae97a-881a-4a94-915f-18e072088a26'::uuid, 'fran', 'Fran',
    'הבנצ׳מרק הקצר והכן ביותר שיש.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    20, 10,
    array['barbell', 'pullup_bar']::text[], 'שלושה סבבים יורדים של תראסטרים ומתח. האימון נמשך דקות ספורות ולכן הפיתוי לצאת חזק מדי אמיתי. חלקו את הסט הראשון לשניים מראש - מי שמסיים 21 תראסטרים ברצף משלם על זה בכל השאר.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"}]'::jsonb, '[{"label":"האימון","detail":"21-15-9 חזרות, למהירות","items":[{"label":"Thrusters","detail":"43/30 ק״ג"},{"label":"Pull-ups","detail":"משיכות מתח"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"תראסטר עם משקולות יד קלות או מוט ריק, משיכות בגומייה. 15-12-9 חזרות."},{"level":"intermediate","detail":"35/25 ק״ג, משיכות בקפיצה. שמרו על סטים רצופים."},{"level":"advanced","detail":"לפי הפרוטוקול. היעד: מתחת ל-5 דקות, בלי לרדת מהמוט בסט של 21."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '59d34626-9536-4258-9cb6-7d7c0692b7ba'::uuid, 'cindy', 'Cindy',
    'עשרים דקות של משקל גוף בקצב שאפשר להחזיק.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['pullup_bar']::text[], 'סבב פשוט שחוזר על עצמו עשרים דקות. הניצחון כאן הוא בקצב: מי שמוצא מקצב יציב בדקה השלישית מסיים עם עוד ארבעה סבבים ממי שיצא מהר.',
    '[{"label":"קפיצה בחבל","detail":"2 דקות ברצף"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"},{"label":"מתיחות דינמיות לכתף ולגב עליון","detail":"90 שניות"}]'::jsonb, '[{"label":"AMRAP 20 דקות","detail":"כמה שיותר סבבים מלאים","items":[{"label":"Pull-ups","detail":"5 חזרות"},{"label":"Push-ups","detail":"10 חזרות"},{"label":"Air Squats","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משיכות בגומייה, שכיבות סמיכה בהטיה על מוט. אפשר 15 דקות."},{"level":"intermediate","detail":"משיכות בקפיצה או 3 משיכות נקיות בסבב."},{"level":"advanced","detail":"לפי הפרוטוקול. 20 סבבים ומעלה זו תוצאה מצוינת."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '70b6b9ed-1a66-4563-86b4-46475cd2fd91'::uuid, 'helen', 'Helen',
    'ריצה, קטלבל ומתח - שלושה סבבים שמלמדים לנשום.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, 15,
    array['kettlebell', 'pullup_bar']::text[], 'המבחן האמיתי הוא המעבר מהריצה לקטלבל. תכננו מראש: להגיע מהריצה, לקחת אוויר שתי שניות, ולעשות 21 סווינג ברצף אחד.',
    '[{"label":"ריצה קלה","detail":"400 מטר"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת ירך בכריעה","detail":"45 שניות לכל צד"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"3 סבבים למהירות","detail":null,"items":[{"label":"ריצה","detail":"400 מטר"},{"label":"Kettlebell Swings","detail":"21 חזרות, 24/16 ק״ג"},{"label":"Pull-ups","detail":"12 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"300 מטר ריצה, קטלבל 12/8 ק״ג, משיכות בגומייה."},{"level":"intermediate","detail":"קטלבל 20/12 ק״ג, משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-9 דקות זה סף מתקדם."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '9c487a6b-8f91-4ee9-87f3-fc3d9caf0d9f'::uuid, 'grace', 'Grace',
    'שלושים קלין אנד ג׳רק. כלום להסתתר מאחוריו.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    20, 12,
    array['barbell']::text[], 'תרגיל אחד, שלושים פעם. בחרו אסטרטגיה לפני שמתחילים: סטים קטנים עם מנוחה קצובה כמעט תמיד מנצחים ניסיון לרוץ ברצף.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"}]'::jsonb, '[{"label":"האימון","detail":"30 חזרות, למהירות","items":[{"label":"Clean and Jerk","detail":"61/43 ק״ג"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"40/30 ק״ג או משקולות יד. התמקדו בטכניקה, לא בשעון."},{"level":"intermediate","detail":"50/35 ק״ג. סטים של 3 עם 10 שניות מנוחה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-3 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '2b0cebd3-c016-4979-8ac1-e5d5f152856f'::uuid, 'isabel', 'Isabel',
    'שלושים סנאץ׳. מהירות מול טכניקה.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    20, 10,
    array['barbell']::text[], 'סנאץ׳ הוא התרגיל שהכי מהר מאבד צורה בעייפות. אם המוט מתחיל לעלות קדימה במקום צמוד לגוף - עצרו, נשמו, והתחילו סט חדש.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"},{"label":"סנאץ׳ עם מוט ריק","detail":"5 חזרות, 3 סבבים"}]'::jsonb, '[{"label":"האימון","detail":"30 חזרות, למהירות","items":[{"label":"Snatch","detail":"61/43 ק״ג"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"Power snatch עם מוט ריק או 30/20 ק״ג."},{"level":"intermediate","detail":"43/30 ק״ג, סטים של 3."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '1361fe04-b98a-4b62-85cf-dc0e0e357980'::uuid, 'diane', 'Diane',
    'דדליפט וכפיפות ידיים בעמידת ידיים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    20, 12,
    array['barbell']::text[], 'שילוב של משיכה כבדה ודחיפה הפוכה. הדדליפט מתיש את הגב התחתון בדיוק לפני שצריך להחזיק את הגוף הפוך - שמרו על ליבה נעולה בשני התרגילים.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"עמידת ידיים בקיר","detail":"30 שניות החזקה, 3 סבבים"},{"label":"כפיפות ידיים בפייק","detail":"8 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"21-15-9 חזרות","detail":"למהירות","items":[{"label":"Deadlift","detail":"102/70 ק״ג"},{"label":"Handstand Push-ups","detail":"כפיפות ידיים בעמידת ידיים"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"דדליפט 60/40 ק״ג, דחיקות פייק מהרצפה. 15-12-9."},{"level":"intermediate","detail":"80/55 ק״ג, כפיפות ידיים בעמידת ידיים עם מדרגה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-5 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '3e69cc7b-f8d0-4065-867f-9ae9ac0671ef'::uuid, 'elizabeth', 'Elizabeth',
    'קלין וטבילות בטבעות.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    20, 15,
    array['barbell', 'rings']::text[], 'הקלין מעייף את הרגליים והכתפיים, והטבעות דורשות בדיוק את הכתפיים האלה. שמרו על סטים קטנים בטבעות מהסבב הראשון.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"},{"label":"תמיכה בטבעות","detail":"20 שניות, 3 סבבים"}]'::jsonb, '[{"label":"21-15-9 חזרות","detail":"למהירות","items":[{"label":"Squat Clean","detail":"61/43 ק״ג"},{"label":"Ring Dips","detail":"טבילות בטבעות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"קלין 40/30 ק״ג, טבילות על ספסל. 15-12-9."},{"level":"intermediate","detail":"50/35 ק״ג, טבילות בטבעות עם גומייה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '9b7421f2-a24d-4f4c-a9be-dfe8d9cb7f9e'::uuid, 'annie', 'Annie',
    'חבל ובטן. מהיר, פשוט, שורף.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, 12,
    array['jump_rope', 'mat']::text[], 'סבבים יורדים של דאבל אנדרס וכפיפות בטן. מי שנכשל בחבל משלם פעמיים - בזמן ובדופק. אם הקפיצות מתחילות להיתקל, עצרו שתי שניות ותתחילו מחדש במקום להילחם.',
    '[{"label":"קפיצה בחבל בודדת","detail":"100 קפיצות"},{"label":"ניסיונות דאבל אנדר","detail":"3 סבבים של 10 שניות"},{"label":"כפיפות בטן איטיות","detail":"15 חזרות"},{"label":"פתיחת גב עליון בשכיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"50-40-30-20-10 חזרות","detail":"למהירות","items":[{"label":"Double-Unders","detail":"דאבל אנדרס"},{"label":"Sit-ups","detail":"כפיפות בטן"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קפיצות בודדות במספר כפול, כפיפות בטן על מזרן."},{"level":"intermediate","detail":"דאבל אנדרס עם מכסה של 60 שניות לכל סט."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-8 דקות זה סף טוב."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '841f512e-f653-42dc-93de-9e803d19f9d2'::uuid, 'karen', 'Karen',
    'מאה וול בולס. זהו. זה כל האימון.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, 15,
    array['medicine_ball']::text[], 'האימון שנשבר בראש לפני שהוא נשבר ברגליים. חלקו מראש לעשרה סטים של עשר עם חמש שניות מנוחה - זה כמעט תמיד מהיר יותר מלנסות סט של 40 בהתחלה.',
    '[{"label":"אופניים או חתירה","detail":"3 דקות"},{"label":"סקוואט משקל גוף","detail":"20 חזרות"},{"label":"וול בול קל","detail":"10 חזרות, 3 סבבים"},{"label":"פתיחת קרסול בקיר","detail":"45 שניות לכל צד"}]'::jsonb, '[{"label":"האימון","detail":"150 חזרות, למהירות","items":[{"label":"Wall Balls","detail":"9/6 ק״ג למטרה בגובה 3 מטר"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"100 חזרות עם כדור 4 ק״ג למטרה נמוכה."},{"level":"intermediate","detail":"150 חזרות, 6/4 ק״ג."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-8 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'f685e88e-4494-42b8-898f-234c64410112'::uuid, 'barbara', 'Barbara',
    'חמישה סבבים עם שלוש דקות מנוחה מלאות בין סבב לסבב.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['pullup_bar', 'mat']::text[], 'האימון היחיד ברשימה שבו המנוחה כתובה בפרוטוקול. רשמו את זמן כל סבב בנפרד - הפער בין הסבב הראשון לחמישי הוא המדד האמיתי כאן.',
    '[{"label":"קפיצה בחבל","detail":"2 דקות ברצף"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"},{"label":"מתיחות דינמיות לכתף ולגב עליון","detail":"90 שניות"}]'::jsonb, '[{"label":"5 סבבים","detail":"שלוש דקות מנוחה מלאות אחרי כל סבב","items":[{"label":"Pull-ups","detail":"20 חזרות"},{"label":"Push-ups","detail":"30 חזרות"},{"label":"Sit-ups","detail":"40 חזרות"},{"label":"Air Squats","detail":"50 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, חצי מהחזרות, משיכות בגומייה."},{"level":"intermediate","detail":"5 סבבים, 10 משיכות במקום 20."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, 'זמן כולל כולל מנוחות'
  ),
  (
    'b1491171-a59e-4ddb-9fb0-e8f7acce23bd'::uuid, 'angie', 'Angie',
    'מאה מכל דבר. סבלנות לפני מהירות.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    35, 30,
    array['pullup_bar', 'mat']::text[], 'מסיימים כל תרגיל לגמרי לפני שעוברים לבא. מאה משיכות זה החלק שמכריע - חלקו אותן לעשרים סטים של חמש מהרגע הראשון.',
    '[{"label":"קפיצה בחבל","detail":"2 דקות ברצף"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"},{"label":"מתיחות דינמיות לכתף ולגב עליון","detail":"90 שניות"}]'::jsonb, '[{"label":"לפי הסדר, למהירות","detail":null,"items":[{"label":"Pull-ups","detail":"100 חזרות"},{"label":"Push-ups","detail":"100 חזרות"},{"label":"Sit-ups","detail":"100 חזרות"},{"label":"Air Squats","detail":"100 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"50 מכל תרגיל, משיכות בגומייה."},{"level":"intermediate","detail":"75 מכל תרגיל."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '55d6fdc6-c82b-4124-b0b9-9998181ec2da'::uuid, 'nancy', 'Nancy',
    'ריצה וסקוואט מעל הראש. איזון תחת עייפות.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, 20,
    array['barbell']::text[], 'אוברהד סקוואט אחרי 400 מטר ריצה הוא מבחן ניידות כתף וקרסול לפני שהוא מבחן כוח. אם הידיים נופלות קדימה, הורידו משקל.',
    '[{"label":"ריצה קלה","detail":"400 מטר"},{"label":"מוט ריק: סנאץ׳ בלאנס","detail":"5 חזרות, 3 סבבים"},{"label":"אוברהד סקוואט עם מקל","detail":"10 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון וכתף","detail":"2 דקות"}]'::jsonb, '[{"label":"5 סבבים למהירות","detail":null,"items":[{"label":"ריצה","detail":"400 מטר"},{"label":"Overhead Squat","detail":"15 חזרות, 43/30 ק״ג"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"200 מטר ריצה, אוברהד סקוואט עם מוט ריק או מקל."},{"level":"intermediate","detail":"400 מטר, 30/20 ק״ג."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'fef17984-ae72-4306-ba75-d71a42de4018'::uuid, 'jackie', 'Jackie',
    'חתירה, מוט ריק ומשיכות. מבחן קצב קלאסי.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, 15,
    array['rower', 'barbell', 'pullup_bar']::text[], 'החתירה צריכה להיות מהירה אבל לא על חשבון הידיים - מי שמושך 1000 מטר בכל הכוח מגיע למוט בלי אחיזה. כוונו לקצב שאפשר לדבר בו בקושי.',
    '[{"label":"חתירה","detail":"500 מטר בקצב קל"},{"label":"מוט ריק: דחיקות מעל הראש","detail":"10 חזרות, 3 סבבים"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"לפי הסדר, למהירות","detail":null,"items":[{"label":"חתירה","detail":"1000 מטר"},{"label":"Thrusters","detail":"50 חזרות, מוט ריק 20/15 ק״ג"},{"label":"Pull-ups","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"750 מטר חתירה, 35 תראסטרים, משיכות בגומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול עם משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-7 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'ab320c6c-21be-4b2a-bb89-0316e2e61a58'::uuid, 'kelly', 'Kelly',
    'חמישה סבבים ארוכים. אימון סבולת אמיתי.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    45, 35,
    array['box', 'medicine_ball']::text[], 'אימון ארוך שדורש קצב אחיד. אל תרוצו את ה-400 הראשון מהר - הפער יתגלה בסבב השלישי, לא בראשון.',
    '[{"label":"ריצה קלה","detail":"400 מטר"},{"label":"עליות על קופסה נמוכה","detail":"10 חזרות, 2 סבבים"},{"label":"וול בול קל","detail":"10 חזרות, 2 סבבים"},{"label":"פתיחת קרסול וירך","detail":"2 דקות"}]'::jsonb, '[{"label":"5 סבבים למהירות","detail":null,"items":[{"label":"ריצה","detail":"400 מטר"},{"label":"Box Jumps","detail":"30 חזרות, 60/50 ס״מ"},{"label":"Wall Balls","detail":"30 חזרות, 9/6 ק״ג"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, 200 מטר, 20 חזרות מכל תרגיל, קופסה נמוכה."},{"level":"intermediate","detail":"4 סבבים לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'd97b00f6-3d74-45b0-86de-96c4c561747a'::uuid, 'mary', 'Mary',
    'עשרים דקות של ג׳ימנסטיקס טהור.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'advanced'::public.difficulty_level,
    25, null,
    array['pullup_bar']::text[], 'אימון מיומנות לפני שהוא אימון כושר. אם אחד משלושת התרגילים עדיין לא בידיים - זה בדיוק האימון שבו כדאי לתרגל אותו בגרסה מותאמת.',
    '[{"label":"עמידת ידיים בקיר","detail":"30 שניות, 3 סבבים"},{"label":"סקוואט על רגל אחת לספסל","detail":"5 לכל צד, 2 סבבים"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"AMRAP 20 דקות","detail":null,"items":[{"label":"Handstand Push-ups","detail":"5 חזרות"},{"label":"Pistols","detail":"10 חזרות, 5 לכל רגל"},{"label":"Pull-ups","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"דחיקות פייק, סקוואט לספסל על רגל אחת, משיכות בגומייה."},{"level":"intermediate","detail":"עמידת ידיים עם מדרגה, פיסטול עם תמיכה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '2dbf55ce-f27e-41d8-b3c1-90443ba6ec9a'::uuid, 'chelsea', 'Chelsea',
    'סבב בתחילת כל דקה, שלושים דקות.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, null,
    array['pullup_bar']::text[], 'Cindy בפורמט EMOM. הקושי הוא שהמנוחה מתקצרת מעצמה ככל שהחזרות מאטות. רשמו כמה דקות השלמתם - לרדת מהקצב בדקה 22 זו תוצאה טובה, לא כישלון.',
    '[{"label":"קפיצה בחבל","detail":"2 דקות ברצף"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"},{"label":"מתיחות דינמיות לכתף ולגב עליון","detail":"90 שניות"}]'::jsonb, '[{"label":"EMOM 30 דקות","detail":"בתחילת כל דקה, סבב שלם","items":[{"label":"Pull-ups","detail":"5 חזרות"},{"label":"Push-ups","detail":"10 חזרות"},{"label":"Air Squats","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"20 דקות, 3 משיכות בגומייה, 6 שכיבות, 9 סקוואטים."},{"level":"intermediate","detail":"30 דקות עם משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'completion'::public.score_type, 'כמה דקות הושלמו במלואן'
  ),
  (
    '036be40f-4e78-48ed-88ee-7151a05cbaa3'::uuid, 'murph', 'Murph',
    'האימון הארוך ביותר ברשימה. בונים אליו.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    70, 60,
    array['pullup_bar']::text[], 'אימון Hero קלאסי. החלוקה המקובלת של החלק האמצעי היא עשרים סבבים של 5 משיכות, 10 שכיבות ו-15 סקוואטים - היא כמעט תמיד מהירה ובטוחה יותר מלעשות כל תרגיל ברצף. אל תנסו אותו בלי בסיס של כמה חודשי אימון.',
    '[{"label":"הליכה או ריצה קלה","detail":"5 דקות"},{"label":"מתיחות דינמיות לירך ולכתף","detail":"3 דקות"},{"label":"סבב חימום: 5 משיכות, 10 שכיבות, 15 סקוואטים","detail":"2 סבבים בקצב קל"}]'::jsonb, '[{"label":"פתיחה","detail":null,"items":[{"label":"ריצה","detail":"1600 מטר"}]},{"label":"החלק האמצעי","detail":"מומלץ בחלוקה של 20 סבבים: 5 / 10 / 15","items":[{"label":"Pull-ups","detail":"100 חזרות"},{"label":"Push-ups","detail":"200 חזרות"},{"label":"Air Squats","detail":"300 חזרות"}]},{"label":"סיום","detail":null,"items":[{"label":"ריצה","detail":"1600 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"חצי Murph: 800 מטר, 50/100/150, משיכות בגומייה."},{"level":"intermediate","detail":"Murph מלא בחלוקה של 20 סבבים."},{"level":"advanced","detail":"לפי הפרוטוקול, ברצף ובווסט 9/6 ק״ג למי שמורגל."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '4d1cb705-e3de-4273-9b0c-c3ffb095f8e1'::uuid, 'dt', 'DT',
    'חמישה סבבים עם מוט אחד ושלושה תרגילים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    25, 15,
    array['barbell']::text[], 'לא מורידים את המוט בין התרגילים אם אפשר. הטריק הוא לעבור מדדליפט להאנג קלין בלי להניח - זה חוסך שניות יקרות בכל סבב.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"},{"label":"האנג קלין עם מוט ריק","detail":"5 חזרות, 3 סבבים"}]'::jsonb, '[{"label":"5 סבבים למהירות","detail":"70/47 ק״ג לאורך כל האימון","items":[{"label":"Deadlift","detail":"12 חזרות"},{"label":"Hang Power Clean","detail":"9 חזרות"},{"label":"Push Jerk","detail":"6 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"40/30 ק״ג או משקולות יד."},{"level":"intermediate","detail":"55/40 ק״ג."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '16de777d-5d15-4da7-9bc0-b28b9220c421'::uuid, 'randy', 'Randy',
    '75 פאוור סנאץ׳ ברצף אחד.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    15, 10,
    array['barbell']::text[], 'משקל קל, הרבה חזרות. האויב הוא האחיזה והנשימה, לא הרגליים. סטים של 15 עם 10 שניות מנוחה עובדים טוב לרוב האנשים.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"},{"label":"פאוור סנאץ׳ עם מוט ריק","detail":"10 חזרות, 3 סבבים"}]'::jsonb, '[{"label":"האימון","detail":"75 חזרות, למהירות","items":[{"label":"Power Snatch","detail":"34/24 ק״ג"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"50 חזרות עם מוט ריק."},{"level":"intermediate","detail":"75 חזרות, 25/15 ק״ג."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-5 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'b24c12db-0b6a-489d-9279-b021cecd05df'::uuid, 'chad', 'Chad',
    'אלף עליות על קופסה. אימון ראש.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    75, 90,
    array['box']::text[], 'תרגיל אחד, אלף פעם, בקצב הליכה. זה אימון סבולת ארוך - שתו מים, אכלו משהו קטן באמצע, ורדו מהקופסה במקום לקפוץ ממנה כדי לשמור על הברכיים.',
    '[{"label":"הליכה","detail":"5 דקות"},{"label":"עליות על קופסה נמוכה","detail":"20 חזרות, 2 סבבים"},{"label":"מתיחת שוקיים וארבע ראשי","detail":"2 דקות"}]'::jsonb, '[{"label":"האימון","detail":"1000 חזרות, למהירות","items":[{"label":"Step-ups","detail":"קופסה 50 ס״מ"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"300 עליות על קופסה נמוכה."},{"level":"intermediate","detail":"500 עליות, קופסה 40 ס״מ."},{"level":"advanced","detail":"לפי הפרוטוקול, ובווסט למי שמורגל."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '593f5c2b-f7e2-4f1d-aefd-d8f19ca4e3ef'::uuid, 'jt', 'JT',
    'שלוש וריאציות דחיפה בסבבים יורדים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    25, 20,
    array['rings']::text[], 'אימון דחיפה טהור בלי שום משקל. הכתפיים נגמרות מהר, ולכן מומלץ להתחיל בסטים קטנים מדי מאשר לגלות באמצע שנתקעתם.',
    '[{"label":"תמיכה בטבעות","detail":"20 שניות, 3 סבבים"},{"label":"עמידת ידיים בקיר","detail":"30 שניות, 3 סבבים"},{"label":"שכיבות סמיכה איטיות","detail":"10 חזרות, 2 סבבים"},{"label":"פתיחת חזה וכתף","detail":"2 דקות"}]'::jsonb, '[{"label":"21-15-9 חזרות","detail":"למהירות","items":[{"label":"Handstand Push-ups","detail":"כפיפות ידיים בעמידת ידיים"},{"label":"Ring Dips","detail":"טבילות בטבעות"},{"label":"Push-ups","detail":"שכיבות סמיכה"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"12-9-6, דחיקות פייק, טבילות על ספסל, שכיבות בהטיה."},{"level":"intermediate","detail":"15-12-9 עם מדרגה וגומייה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'da70b7f7-e815-48a5-887a-90912c6da8b3'::uuid, 'jerry', 'Jerry',
    'ריצה, חתירה, ריצה. שלושה מקטעים ארוכים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, 30,
    array['rower']::text[], 'אימון סבולת נקי בלי משקולות. המקטע האמצעי מפתה לדחוף - החזיקו קצב שמאפשר לרוץ את הקילומטר האחרון בלי לקרוס.',
    '[{"label":"ריצה קלה","detail":"800 מטר"},{"label":"חתירה","detail":"500 מטר בקצב קל"},{"label":"מתיחות דינמיות","detail":"2 דקות"}]'::jsonb, '[{"label":"לפי הסדר, למהירות","detail":null,"items":[{"label":"ריצה","detail":"1600 מטר"},{"label":"חתירה","detail":"2000 מטר"},{"label":"ריצה","detail":"1600 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"800 מטר / 1000 מטר / 800 מטר."},{"level":"intermediate","detail":"1200 / 1500 / 1200."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '82a503f4-5c4f-4f96-b34f-0f12468fd390'::uuid, 'open-ladder-thruster-burpee', 'סולם עולה: תראסטר ובורפי',
    'פורמט Open קלאסי - העבודה גדלה בכל סבב.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, 12,
    array['barbell']::text[], 'בכל סבב מוסיפים 3 חזרות לכל תרגיל. הסבבים הראשונים קלים מדי ומפתים לרוץ - החזיקו קצב, כי הסבב של 15 הוא זה שקובע את התוצאה.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"}]'::jsonb, '[{"label":"AMRAP 12 דקות","detail":"סולם עולה: 3-6-9-12-15... מכל תרגיל","items":[{"label":"Thrusters","detail":"43/30 ק״ג"},{"label":"Burpees over Bar","detail":"בורפי מעל המוט"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק או משקולות יד, בורפי לצד המוט בלי קפיצה."},{"level":"intermediate","detail":"35/25 ק״ג."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'reps'::public.score_type, 'סך החזרות שהושלמו'
  ),
  (
    'cfe97dbc-484c-4f0a-87bc-ddae8d046bd0'::uuid, 'open-couplet-snatch-box', 'סנאץ׳ וקופסה',
    'שני תרגילים, עשר דקות, דופק גבוה.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'advanced'::public.difficulty_level,
    18, 10,
    array['barbell', 'box']::text[], 'קופלט מהיר בסגנון Open. הסנאץ׳ קל יחסית, ולכן כל הפער נוצר בקצב המעבר בין התחנות. אל תעצרו ליד הקופסה - עלו וירדו ברצף.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"},{"label":"עליות על קופסה","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"AMRAP 10 דקות","detail":null,"items":[{"label":"Power Snatch","detail":"10 חזרות, 34/24 ק״ג"},{"label":"Box Jump Overs","detail":"15 חזרות, 60/50 ס״מ"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק, עלייה והורדה מקופסה נמוכה."},{"level":"intermediate","detail":"25/15 ק״ג, קופסה 50/40 ס״מ."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'e9855c95-e654-4b9f-840b-d06351228e49'::uuid, 'open-triplet-row-du-lunge', 'חתירה, חבל וצעדים',
    'שלוש תחנות שלא מרשות לדופק לרדת.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    22, 15,
    array['rower', 'jump_rope', 'dumbbell']::text[], 'אימון קצב. החתירה היא ההזדמנות היחידה לנשום - משכו אותה חזק אבל אחיד, ושמרו כוח ברגליים לצעדים.',
    '[{"label":"חתירה","detail":"500 מטר קל"},{"label":"קפיצה בחבל","detail":"2 דקות"},{"label":"צעדי לאנג׳","detail":"20 חזרות"},{"label":"פתיחת ירך","detail":"90 שניות לכל צד"}]'::jsonb, '[{"label":"AMRAP 15 דקות","detail":null,"items":[{"label":"חתירה","detail":"250 מטר"},{"label":"Double-Unders","detail":"40 חזרות"},{"label":"Walking Lunges","detail":"20 צעדים עם משקולת יד 2×15/10 ק״ג"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"200 מטר, 80 קפיצות בודדות, 20 צעדים ללא משקל."},{"level":"intermediate","detail":"250 מטר, דאבל אנדרס, משקולות 2×10/7.5 ק״ג."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '86ae7c1e-4a9d-42cc-93ae-f150765c1f52'::uuid, 'emom-24-four-station', 'EMOM 24: ארבע תחנות',
    'שישה סבבים של ארבע דקות, בלי מקום להתחבא.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    24, null,
    array['rower', 'kettlebell', 'box', 'barbell']::text[], 'כל דקה תרגיל אחר. בחרו נפח שמשאיר לפחות 15 שניות מנוחה בדקה הראשונה - אם אין מנוחה בהתחלה, לא תסיימו את הסבב הרביעי.',
    '[{"label":"חתירה","detail":"500 מטר קל"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"עליות על קופסה","detail":"10 חזרות"},{"label":"מוט ריק: דחיקות","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"EMOM 24 דקות","detail":"מחזור של ארבע דקות, שש פעמים","items":[{"label":"דקה 1","detail":"חתירה 15 קלוריות"},{"label":"דקה 2","detail":"15 סווינג קטלבל 24/16 ק״ג"},{"label":"דקה 3","detail":"12 עליות על קופסה"},{"label":"דקה 4","detail":"10 דחיקות מוט מעל הראש 43/30 ק״ג"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"10 קלוריות, 10 סווינג קל, 8 עליות, 8 דחיקות במוט ריק."},{"level":"intermediate","detail":"12 קלוריות ונפח ביניים."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'completion'::public.score_type, 'כמה דקות הושלמו בזמן'
  ),
  (
    'ef8ad092-8a68-4048-86c8-4f84996d846e'::uuid, 'emom-20-strength-skill', 'EMOM 20: כוח ומיומנות',
    'דקות מתחלפות בין משקל כבד לתרגיל טכני.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, null,
    array['barbell', 'pullup_bar']::text[], 'אימון בנייה, לא אימון שריפה. המשקל צריך להיות כבד מספיק כדי שהחזרה החמישית תדרוש ריכוז, וקל מספיק כדי שהצורה לא תשתנה בדקה 19.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"}]'::jsonb, '[{"label":"EMOM 20 דקות","detail":"דקות אי-זוגיות וזוגיות לסירוגין","items":[{"label":"דקות אי-זוגיות","detail":"5 Front Squats, 70-75% ממקסימום"},{"label":"דקות זוגיות","detail":"5 Strict Pull-ups"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"סקוואט גובלט, משיכות בגומייה."},{"level":"intermediate","detail":"60% ממקסימום, 3 משיכות נקיות."},{"level":"advanced","detail":"לפי הפרוטוקול, משיכות עם משקל נוסף."}]'::jsonb,
    'weight'::public.score_type, 'המשקל שבו עבדתם'
  ),
  (
    '8e4d2835-0fac-4ce7-9ea8-44e38f669ba1'::uuid, 'chipper-150', 'צ''יפר 150',
    'חמש תחנות, שלושים חזרות בכל אחת, פעם אחת.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, 25,
    array['kettlebell', 'box', 'medicine_ball', 'mat', 'jump_rope']::text[], 'עוברים תחנה אחרי תחנה בלי לחזור. זה אימון של החלטות: איפה לעצור, כמה זמן, ובאיזו תחנה כדאי לקחת סטים קטנים מראש.',
    '[{"label":"קפיצה בחבל","detail":"2 דקות"},{"label":"סווינג קטלבל קל","detail":"15 חזרות"},{"label":"וול בול קל","detail":"10 חזרות"},{"label":"מתיחות דינמיות","detail":"2 דקות"}]'::jsonb, '[{"label":"לפי הסדר, למהירות","detail":null,"items":[{"label":"Kettlebell Swings","detail":"30 חזרות, 24/16 ק״ג"},{"label":"Box Jumps","detail":"30 חזרות, 60/50 ס״מ"},{"label":"Wall Balls","detail":"30 חזרות, 9/6 ק״ג"},{"label":"Sit-ups","detail":"30 חזרות"},{"label":"Burpees","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"20 חזרות בכל תחנה, משקלים קלים, קופסה נמוכה."},{"level":"intermediate","detail":"25 חזרות בכל תחנה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'e99e3586-62bd-49c8-bee4-1a6c9919978a'::uuid, 'chipper-descending-ladder', 'צ''יפר יורד',
    'העבודה מתקצרת בכל תחנה, אבל מתקשה.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, 24,
    array['rower', 'barbell', 'pullup_bar']::text[], 'מבנה יורד: 50 קלוריות, 40 חזרות, 30, 20, 10. ככל שהמספר קטן, התרגיל קשה יותר - כך שהתחושה נשארת אחידה מהתחלה ועד הסוף.',
    '[{"label":"חתירה או אופניים","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים וסיבובי ירך","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאת משקל הדרגתית","detail":"3 סטים של 3 עד משקל האימון"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכות בגומייה","detail":"8 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"לפי הסדר, למהירות","detail":null,"items":[{"label":"חתירה","detail":"50 קלוריות"},{"label":"Air Squats","detail":"40 חזרות"},{"label":"Hang Power Clean","detail":"30 חזרות, 43/30 ק״ג"},{"label":"Pull-ups","detail":"20 חזרות"},{"label":"Bar Muscle-ups","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"30 קלוריות, מוט ריק, משיכות בגומייה, 10 משיכות נוספות במקום מאסל אפ."},{"level":"intermediate","detail":"40 קלוריות, 35/25 ק״ג, משיכות בקפיצה, 10 chest-to-bar."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'ca2d8d9f-e499-4671-a6f6-276534414423'::uuid, 'tabata-this', 'Tabata This',
    'חמישה תרגילים בפורמט טבאטה, אחד אחרי השני.', 'crossfit'::public.workout_category,
    'tabata'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['rower', 'pullup_bar', 'mat']::text[], 'שמונה סבבים של 20 שניות עבודה ו-10 מנוחה בכל תרגיל, עם דקה מנוחה בין תרגיל לתרגיל. הניקוד הוא סכום החזרות הנמוכות ביותר בכל תרגיל - מה שמעניש התחלה מהירה מדי.',
    '[{"label":"חתירה","detail":"3 דקות קל"},{"label":"מתיחות דינמיות","detail":"2 דקות"},{"label":"סבב ניסיון קצר בכל תרגיל","detail":"5 חזרות"}]'::jsonb, '[{"label":"טבאטה × 5","detail":"8 סבבים של 20 שניות עבודה / 10 מנוחה בכל תרגיל, דקה בין תרגילים","items":[{"label":"חתירה","detail":"קלוריות"},{"label":"Air Squats","detail":null},{"label":"Pull-ups","detail":null},{"label":"Push-ups","detail":null},{"label":"Sit-ups","detail":null}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"שלושה תרגילים בלבד, משיכות בגומייה."},{"level":"intermediate","detail":"חמישה תרגילים, משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול, ניקוד לפי הסבב החלש ביותר."}]'::jsonb,
    'reps'::public.score_type, 'סכום הסבבים הנמוכים'
  ),
  (
    '45b39a35-f221-4133-9025-fe1766204ad9'::uuid, 'death-by-burpee', 'Death by Burpee',
    'חזרה אחת נוספת בכל דקה, עד שנגמר.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'beginner'::public.difficulty_level,
    20, null,
    array['none']::text[], 'בדקה הראשונה בורפי אחד, בשנייה שניים, וכן הלאה. ממשיכים עד שלא מצליחים להשלים את המכסה בתוך הדקה. אימון שאפשר לעשות בלי שום ציוד ושמדרג את עצמו אוטומטית.',
    '[{"label":"הליכה מהירה או ריצה קלה","detail":"3 דקות"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"שכיבות סמיכה","detail":"10 חזרות"},{"label":"מתיחות דינמיות","detail":"90 שניות"}]'::jsonb, '[{"label":"EMOM עד כישלון","detail":"דקה 1: בורפי אחד. דקה 2: שניים. וכן הלאה.","items":[{"label":"Burpees","detail":"חזרה נוספת בכל דקה"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"בורפי בלי קפיצה, עצירה בדקה 10."},{"level":"intermediate","detail":"בורפי מלא."},{"level":"advanced","detail":"בורפי עם קפיצה וטפיחה, ממשיכים עד כישלון אמיתי."}]'::jsonb,
    'reps'::public.score_type, 'הדקה האחרונה שהושלמה'
  ),
  (
    'bba8b366-ee48-4ae0-8491-8accf8bd3292'::uuid, 'heavy-day-back-squat', 'יום כבד: בק סקוואט',
    'חמישה סטים, חמש חזרות, משקל עולה.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    40, null,
    array['barbell']::text[], 'אימון כוח נקי. עולים במשקל בכל סט, ומפסיקים בסט שבו החזרה האחרונה עדיין נראית כמו הראשונה. רשמו את הסט הכבד ביותר שביצעתם בצורה נקייה.',
    '[{"label":"אופניים או חתירה","detail":"3 דקות"},{"label":"סקוואט משקל גוף","detail":"20 חזרות"},{"label":"פתיחת קרסול וירך","detail":"3 דקות"},{"label":"מוט ריק: 10 סקוואטים, 2 סבבים","detail":null}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, עלייה במשקל בכל סט, 2-3 דקות מנוחה","items":[{"label":"Back Squat","detail":"סט 1-2 חימום, סט 3-5 עבודה"}]},{"label":"סיום","detail":"3 סבבים, קצב נוח","items":[{"label":"Romanian Deadlift","detail":"10 חזרות"},{"label":"Plank","detail":"45 שניות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"סקוואט גובלט עם קטלבל או סקוואט לכיסא."},{"level":"intermediate","detail":"5 סטים של 5 במשקל בינוני."},{"level":"advanced","detail":"עלייה עד סט כבד של 5 חזרות."}]'::jsonb,
    'weight'::public.score_type, 'הסט הכבד ביותר × 5'
  ),
  (
    '1061aaef-a4c3-4649-a7be-118ded318ce3'::uuid, 'heavy-day-deadlift-press', 'יום כבד: דדליפט ולחיצה',
    'משיכה כבדה, דחיפה כבדה, וסיום קצר.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['barbell']::text[], 'שני תרגילי כוח בסיסיים ואחריהם חמש דקות קצרות. שמרו על גב ניטרלי בדדליפט - אם הוא מתעגל בחזרה השלישית, זה המשקל שמפסיקים בו.',
    '[{"label":"חתירה","detail":"500 מטר"},{"label":"סיבובי ירך וכתף","detail":"2 דקות"},{"label":"מוט ריק: דדליפט ולחיצה","detail":"8 מכל תרגיל, 2 סבבים"}]'::jsonb, '[{"label":"כוח א׳","detail":"5 סטים של 3, מנוחה 2 דקות","items":[{"label":"Deadlift","detail":"80-85% ממקסימום"}]},{"label":"כוח ב׳","detail":"4 סטים של 5, מנוחה 90 שניות","items":[{"label":"Strict Press","detail":"לחיצה נקייה מעל הראש"}]},{"label":"סיום","detail":"AMRAP 5 דקות","items":[{"label":"Kettlebell Swings","detail":"10 חזרות"},{"label":"Burpees","detail":"5 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"דדליפט מגובה, לחיצה עם משקולות יד."},{"level":"intermediate","detail":"70% ממקסימום בדדליפט."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'weight'::public.score_type, 'הדדליפט הכבד ביותר × 3'
  ),
  (
    '4726f77e-1144-4738-8c66-7d2c97d5f1b2'::uuid, 'hiit-30-30-full-body', 'HIIT 30/30 גוף מלא',
    'שלושים שניות עבודה, שלושים מנוחה, שמונה תחנות.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['dumbbell', 'mat']::text[], 'אינטרוולים קצרים בחלוקה שווה. ביחס של 1:1 אפשר לעבוד חזק בכל מקטע בלי לקרוס - אם בסבב השלישי אתם כבר לא מסוגלים לשמור על אותו מספר חזרות, הורידו משקל ולא קצב.',
    '[{"label":"הליכה מהירה או אופניים","detail":"3 דקות"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":"30 שניות עבודה / 30 שניות מנוחה בכל תחנה, דקה בין סבבים","items":[{"label":"Goblet Squat","detail":"סקוואט גובלט"},{"label":"Push-ups","detail":"שכיבות סמיכה"},{"label":"Dumbbell Row","detail":"חתירה עם משקולת, מתחלף בין הצדדים"},{"label":"Reverse Lunges","detail":"לאנג׳ לאחור"},{"label":"Dumbbell Press","detail":"לחיצה מעל הראש"},{"label":"Mountain Climbers","detail":"טיפוס הרים"},{"label":"Dead Bug","detail":"באג מת"},{"label":"Plank","detail":"פלאנק"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"20 שניות עבודה / 40 מנוחה, בלי משקל."},{"level":"intermediate","detail":"30/30 עם משקולות בינוניות."},{"level":"advanced","detail":"40 שניות עבודה / 20 מנוחה, משקולות כבדות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '67fc5d4a-a6c2-4e80-aa54-a6dcb0193ea6'::uuid, 'hiit-tabata-four', 'טבאטה ארבע תחנות',
    'שש עשרה דקות שמרגישות כמו ארבעים.', 'functional'::public.workout_category,
    'tabata'::public.workout_format,
    'intermediate'::public.difficulty_level,
    22, null,
    array['kettlebell', 'mat']::text[], 'ארבעה בלוקים של טבאטה עם דקה מנוחה ביניהם. הניקוד הוא סך החזרות - מה שמתגמל קצב אחיד ולא התפרצות בסבב הראשון.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"טבאטה × 4","detail":"8 סבבים של 20 שניות עבודה / 10 מנוחה, דקה בין בלוקים","items":[{"label":"בלוק 1","detail":"Kettlebell Swings"},{"label":"בלוק 2","detail":"Air Squats"},{"label":"בלוק 3","detail":"Push-ups"},{"label":"בלוק 4","detail":"Sit-ups"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"שני בלוקים, קטלבל קל, שכיבות בהטיה."},{"level":"intermediate","detail":"ארבעה בלוקים, קטלבל 16/12 ק״ג."},{"level":"advanced","detail":"ארבעה בלוקים, קטלבל 24/16 ק״ג."}]'::jsonb,
    'reps'::public.score_type, null
  ),
  (
    'c10aabc5-0ea4-41b7-a67f-3c53f2c9fd31'::uuid, 'hiit-40-20-conditioning', 'HIIT 40/20',
    'יחס עבודה גבוה. לא לפעם הראשונה.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, null,
    array['dumbbell', 'box', 'jump_rope']::text[], 'ארבעים שניות עבודה מול עשרים מנוחה. היחס הזה לא מאפשר התאוששות מלאה, ולכן בחירת המשקל קובעת הכל - בחרו משקל שתוכלו לעבוד איתו ברצף ארבעים שניות גם בסבב האחרון.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"},{"label":"קפיצה בחבל","detail":"2 דקות"}]'::jsonb, '[{"label":"4 סבבים","detail":"40 שניות עבודה / 20 מנוחה, 90 שניות בין סבבים","items":[{"label":"Dumbbell Thrusters","detail":"תראסטר עם משקולות"},{"label":"Box Step-overs","detail":"עליות מעל הקופסה"},{"label":"Renegade Rows","detail":"חתירה בפלאנק"},{"label":"Double-Unders","detail":"דאבל אנדרס או קפיצות מהירות"},{"label":"Burpees","detail":"בורפי"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"30/30, משקולות קלות, קופסה נמוכה."},{"level":"intermediate","detail":"40/20 עם משקולות בינוניות."},{"level":"advanced","detail":"לפי הפרוטוקול, משקולות 2×20/12.5 ק״ג."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '2db8c1fc-321c-496e-a1e1-edaad8dd4e78'::uuid, 'strength-endurance-circuit-a', 'מעגל כוח-סבולת א׳',
    'חמש תחנות, ארבעה סבבים, קצב עבודה.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    40, null,
    array['barbell', 'dumbbell', 'box']::text[], 'מעגל קלאסי של דחיפה, משיכה, רגליים וליבה. הכוונה היא עומס ולא מהירות - המנוחה בין התחנות קצרה, אבל הצורה קודמת לשעון.',
    '[{"label":"הליכה מהירה או אופניים","detail":"3 דקות"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"}]'::jsonb, '[{"label":"4 סבבים","detail":"45 שניות מנוחה בין תחנות, 2 דקות בין סבבים","items":[{"label":"Front Squat","detail":"10 חזרות"},{"label":"Bench Press או שכיבות סמיכה","detail":"10 חזרות"},{"label":"Bent-over Row","detail":"12 חזרות"},{"label":"Step-ups","detail":"12 חזרות לכל רגל"},{"label":"Hollow Hold","detail":"30 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק או משקולות קלות, 3 סבבים."},{"level":"intermediate","detail":"משקל בינוני, 4 סבבים."},{"level":"advanced","detail":"משקל כבד, 5 סבבים."}]'::jsonb,
    'weight'::public.score_type, 'המשקל בתחנה הכבדה'
  ),
  (
    '30b8c6b5-311c-47db-a0e1-ec17dbdd5331'::uuid, 'strength-endurance-circuit-b', 'מעגל כוח-סבולת ב׳',
    'דגש על שרשרת אחורית ואחיזה.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    40, null,
    array['kettlebell', 'barbell', 'pullup_bar']::text[], 'מעגל שמתמקד בגב, בישבן ובאחיזה - שלושת הדברים שהכי מהר נשארים מאחור אצל מי שמתאמן בעיקר בדחיפה.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"4 סבבים","detail":"60 שניות מנוחה בין תחנות","items":[{"label":"Romanian Deadlift","detail":"10 חזרות"},{"label":"Strict Pull-ups או משיכות בגומייה","detail":"8 חזרות"},{"label":"Kettlebell Swings","detail":"20 חזרות"},{"label":"Farmer Carry","detail":"40 מטר"},{"label":"Side Plank","detail":"30 שניות לכל צד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, משיכות בגומייה, נשיאה 20 מטר."},{"level":"intermediate","detail":"משקל בינוני, 3 משיכות נקיות."},{"level":"advanced","detail":"משקל כבד, משיכות עם משקל נוסף."}]'::jsonb,
    'weight'::public.score_type, 'המשקל בדדליפט'
  ),
  (
    '5e0e8c72-0136-4404-8c1c-9590282d62de'::uuid, 'dumbbell-complex-devil', 'קומפלקס משקולות: דבל פרס',
    'חמישה תרגילים עם אותו זוג משקולות, בלי להניח.', 'functional'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    25, 18,
    array['dumbbell']::text[], 'קומפלקס הוא רצף תרגילים שמבצעים בלי להניח את המשקולות. זה מבחן אחיזה וכתפיים לפני הכל - אם הן נופלות באמצע הסבב, המשקל גדול מדי.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"5 סבבים למהירות","detail":"לא מניחים את המשקולות בתוך סבב","items":[{"label":"Deadlift","detail":"8 חזרות"},{"label":"Hang Clean","detail":"6 חזרות"},{"label":"Front Squat","detail":"6 חזרות"},{"label":"Push Press","detail":"6 חזרות"},{"label":"Bent-over Row","detail":"8 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, 2×7.5/5 ק״ג."},{"level":"intermediate","detail":"4 סבבים, 2×12.5/10 ק״ג."},{"level":"advanced","detail":"5 סבבים, 2×20/15 ק״ג."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '4264377d-adb2-4fa3-a41c-74df2f5147c9'::uuid, 'dumbbell-amrap-push-pull', 'משקולות: דחיפה ומשיכה',
    'AMRAP 18 עם זוג משקולות אחד.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['dumbbell', 'mat']::text[], 'אימון גוף מלא עם ציוד מינימלי. המבנה מאזן דחיפה ומשיכה בכל סבב, כך שאף קבוצת שרירים לא נשברת לפני האחרות.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"AMRAP 18 דקות","detail":null,"items":[{"label":"Dumbbell Snatch","detail":"10 חזרות, 5 לכל יד"},{"label":"Push-ups","detail":"10 חזרות"},{"label":"Dumbbell Row","detail":"10 חזרות, 5 לכל יד"},{"label":"Goblet Squat","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקולת 7.5/5 ק״ג, שכיבות בהטיה."},{"level":"intermediate","detail":"12.5/10 ק״ג."},{"level":"advanced","detail":"22.5/15 ק״ג."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '9c3d956e-aff1-49dc-8ca1-e160dfd12cc2'::uuid, 'dumbbell-emom-24', 'משקולות EMOM 24',
    'ארבע תחנות מתחלפות, שישה סבבים.', 'functional'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    24, null,
    array['dumbbell']::text[], 'פורמט EMOM נותן מנוחה מובנית, ולכן אפשר לעבוד עם משקל כבד יותר מהרגיל. כוונו לסיים כל דקה בתוך 40 שניות.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"EMOM 24 דקות","detail":"מחזור של ארבע דקות, שש פעמים","items":[{"label":"דקה 1","detail":"12 Goblet Squats"},{"label":"דקה 2","detail":"10 Dumbbell Push Press"},{"label":"דקה 3","detail":"12 Romanian Deadlifts"},{"label":"דקה 4","detail":"40 שניות Plank"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"8-10 חזרות עם משקולות קלות."},{"level":"intermediate","detail":"לפי הפרוטוקול, משקל בינוני."},{"level":"advanced","detail":"לפי הפרוטוקול, משקל כבד."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'ddf9d46e-14f1-4d28-8bc2-68c42278dbba'::uuid, 'kettlebell-circuit-simple', 'מעגל קטלבל בסיסי',
    'ארבעה תרגילים, קטלבל אחד, עשרים דקות.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'beginner'::public.difficulty_level,
    25, null,
    array['kettlebell']::text[], 'נקודת הכניסה לעבודה עם קטלבל. הסווינג הוא תנועת ירך ולא תנועת ידיים - הכוח בא מדחיפת האגן קדימה, והידיים רק מלוות.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"AMRAP 20 דקות","detail":"קצב נוח, מנוחה לפי הצורך","items":[{"label":"Kettlebell Swings","detail":"15 חזרות"},{"label":"Goblet Squat","detail":"10 חזרות"},{"label":"Kettlebell Row","detail":"10 חזרות לכל צד"},{"label":"Farmer Carry","detail":"30 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל 8/6 ק״ג, 15 דקות."},{"level":"intermediate","detail":"קטלבל 16/12 ק״ג."},{"level":"advanced","detail":"קטלבל 24/16 ק״ג."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '98bda534-4e0a-4fa6-ae49-321a7ce38618'::uuid, 'kettlebell-complex-clean-press', 'קומפלקס קטלבל: קלין ולחיצה',
    'צד אחד בכל פעם. כוח חד-צדדי.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['kettlebell']::text[], 'עבודה חד-צדדית חושפת פערים בין הצדדים שאימון עם מוט מסתיר. עשו את הצד החלש קודם ותנו לו לקבוע את מספר החזרות.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"5 סבבים","detail":"משלימים צד אחד לגמרי, מחליפים, ואז 90 שניות מנוחה","items":[{"label":"Kettlebell Clean","detail":"5 חזרות"},{"label":"Strict Press","detail":"5 חזרות"},{"label":"Front Squat","detail":"5 חזרות"},{"label":"Suitcase Carry","detail":"20 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל 8/6 ק״ג, 3 סבבים."},{"level":"intermediate","detail":"קטלבל 16/12 ק״ג."},{"level":"advanced","detail":"קטלבל 24/16 ק״ג."}]'::jsonb,
    'weight'::public.score_type, null
  ),
  (
    '2cc5b9dd-1e69-4583-a5ad-1bef487ed1d9'::uuid, 'kettlebell-turkish-getup-ladder', 'טרקיש גט-אפ',
    'תרגיל אחד, איטי, מדויק.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, null,
    array['kettlebell', 'mat']::text[], 'התרגיל האיטי ביותר בחדר, ואחד היעילים ביותר לכתף יציבה ולליבה. כל חזרה אורכת בערך 40 שניות. אם הזרוע רועדת - הורידו משקל, לא חזרות.',
    '[{"label":"גלגול על הצד","detail":"8 חזרות לכל צד"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"החזקת נעל מעל הראש בשכיבה","detail":"30 שניות לכל צד"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"מיומנות","detail":"5 סבבים, חזרה אחת לכל צד, מנוחה מלאה","items":[{"label":"Turkish Get-up","detail":"חזרה אחת לכל צד"}]},{"label":"סיום","detail":"3 סבבים בקצב נוח","items":[{"label":"Kettlebell Swings","detail":"15 חזרות"},{"label":"Dead Bug","detail":"10 חזרות לכל צד"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"ללא משקל או עם נעל על היד."},{"level":"intermediate","detail":"קטלבל 12/8 ק״ג."},{"level":"advanced","detail":"קטלבל 24/16 ק״ג."}]'::jsonb,
    'weight'::public.score_type, null
  ),
  (
    '26154e9b-bd15-46dd-8d63-6a49699e1607'::uuid, 'calisthenics-pull-strength', 'משקל גוף: משיכה',
    'בניית משיכה נקייה, שלב אחרי שלב.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['pullup_bar', 'bands', 'rings']::text[], 'משיכה היא המיומנות שהכי הרבה אנשים נתקעים בה. האימון הזה בונה אותה בשלושה שלבים: תלייה, משיכה אופקית, ומשיכה אנכית עם עזרה שמצטמצמת.',
    '[{"label":"תלייה פסיבית","detail":"30 שניות, 3 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"חתירה בגומייה","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה","detail":"60 שניות"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים, 2 דקות מנוחה","items":[{"label":"Strict Pull-ups או משיכות בגומייה","detail":"3-5 חזרות נקיות"}]},{"label":"נפח","detail":"4 סבבים","items":[{"label":"Ring Rows","detail":"10 חזרות"},{"label":"Hollow Hold","detail":"30 שניות"},{"label":"Scapular Pull-ups","detail":"8 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"חתירה בטבעות בזווית נוחה, תלייה מסייעת."},{"level":"intermediate","detail":"משיכות בגומייה דקה."},{"level":"advanced","detail":"משיכות עם משקל נוסף."}]'::jsonb,
    'reps'::public.score_type, 'משיכות נקיות בסט הטוב'
  ),
  (
    '0a0780da-4fc1-4510-bc7f-707c039e1846'::uuid, 'calisthenics-push-strength', 'משקל גוף: דחיפה',
    'משכיבות סמיכה לעמידת ידיים.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['none', 'mat']::text[], 'בניית דחיפה בלי משקולות. שלושת השלבים - הטיה, מישור, פייק - מאפשרים לכל אחד למצוא את הגובה הנכון ולעלות משם.',
    '[{"label":"סיבובי כתפיים","detail":"10 לכל כיוון"},{"label":"פלאנק","detail":"30 שניות, 2 סבבים"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים, 90 שניות מנוחה","items":[{"label":"Push-ups בגובה שמאפשר 5-8 חזרות נקיות","detail":null}]},{"label":"נפח","detail":"4 סבבים","items":[{"label":"Pike Push-ups","detail":"8 חזרות"},{"label":"Dips על ספסל","detail":"10 חזרות"},{"label":"Plank Shoulder Taps","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"שכיבות מהקיר או מספסל גבוה."},{"level":"intermediate","detail":"שכיבות מהרצפה."},{"level":"advanced","detail":"שכיבות עם רגליים מוגבהות ופייק בקיר."}]'::jsonb,
    'reps'::public.score_type, null
  ),
  (
    '68d34cbc-3b72-4466-af3e-dfe227ff6c78'::uuid, 'calisthenics-full-body-amrap', 'משקל גוף: גוף מלא',
    'בלי ציוד בכלל. אפשר גם בבית.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'beginner'::public.difficulty_level,
    22, null,
    array['none']::text[], 'אימון שלא דורש שום דבר מלבד רצפה. שימושי בנסיעות, בימי עומס או כשהאולם מלא. שמרו על קצב שמאפשר לדבר משפט קצר.',
    '[{"label":"הליכה במקום","detail":"2 דקות"},{"label":"סיבובי מפרקים","detail":"90 שניות"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"AMRAP 18 דקות","detail":null,"items":[{"label":"Air Squats","detail":"15 חזרות"},{"label":"Push-ups","detail":"10 חזרות"},{"label":"Reverse Lunges","detail":"10 חזרות לכל רגל"},{"label":"Sit-ups","detail":"15 חזרות"},{"label":"Burpees","detail":"5 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"12 דקות, שכיבות מהברכיים, בורפי בלי קפיצה."},{"level":"intermediate","detail":"18 דקות לפי הפרוטוקול."},{"level":"advanced","detail":"18 דקות, בורפי עם קפיצה, שכיבות עם מחיאת כף."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '229f7813-d4d9-4c55-a495-d1519419245f'::uuid, 'engine-builder-rower', 'בניית מנוע: חתירה',
    'מקטעים ארוכים בקצב מדוד.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['rower']::text[], 'אימון סבולת אירובית. המטרה היא קצב אחיד - הפרש של יותר מ-5 שניות בין המקטע הראשון לאחרון אומר שיצאתם מהר מדי.',
    '[{"label":"חתירה","detail":"500 מטר קל"},{"label":"מתיחות דינמיות לגב ולירך","detail":"2 דקות"},{"label":"חתירה","detail":"3 מקטעים של 20 שניות בקצב עולה"}]'::jsonb, '[{"label":"6 × 500 מטר","detail":"90 שניות מנוחה בין מקטעים","items":[{"label":"חתירה","detail":"500 מטר בקצב אחיד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"4 מקטעים של 300 מטר."},{"level":"intermediate","detail":"5 מקטעים של 500 מטר."},{"level":"advanced","detail":"6 מקטעים של 500 מטר, קצב מרוץ."}]'::jsonb,
    'time'::public.score_type, 'ממוצע המקטעים'
  ),
  (
    '94cd7fc5-d0af-4ee3-b4c3-e3f7feba09e9'::uuid, 'engine-builder-bike', 'בניית מנוע: אופניים',
    'מקטעים קצרים וחדים.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, null,
    array['bike']::text[], 'אינטרוולים קצרים בעצימות גבוהה. במקטע של 30 שניות אין קצב לשמור - נותנים הכל, ואז מנוחה מלאה עד המקטע הבא.',
    '[{"label":"אופניים","detail":"5 דקות בקצב עולה"},{"label":"שלושה מקטעים של 15 שניות חזק","detail":"דקה מנוחה ביניהם"}]'::jsonb, '[{"label":"10 × 30 שניות","detail":"90 שניות מנוחה מלאה בין מקטעים","items":[{"label":"אופניים","detail":"30 שניות בעצימות מרבית"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"6 מקטעים של 20 שניות."},{"level":"intermediate","detail":"8 מקטעים של 30 שניות."},{"level":"advanced","detail":"10 מקטעים לפי הפרוטוקול."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '086d3190-6843-47aa-b491-676e4351f484'::uuid, 'partner-workout-split-work', 'אימון זוגות: עבודה מחולקת',
    'אחד עובד, אחד נח. הקצב נקבע ביחד.', 'functional'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, 25,
    array['rower', 'kettlebell', 'medicine_ball']::text[], 'מחלקים את החזרות בין שני מתאמנים איך שרוצים, כל עוד רק אחד עובד בכל רגע. אימון טוב לימים שבהם יש פער רמות בקבוצה - כל אחד לוקח כמה שהוא יכול.',
    '[{"label":"הליכה מהירה או אופניים","detail":"3 דקות"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"},{"label":"סווינג קטלבל קל","detail":"15 חזרות"}]'::jsonb, '[{"label":"בזוג, למהירות","detail":"מחלקים את החזרות חופשי, רק אחד עובד בכל פעם","items":[{"label":"חתירה","detail":"100 קלוריות"},{"label":"Kettlebell Swings","detail":"150 חזרות, 24/16 ק״ג"},{"label":"Wall Balls","detail":"150 חזרות, 9/6 ק״ג"},{"label":"Burpees","detail":"100 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"חצי מהחזרות, משקלים קלים."},{"level":"intermediate","detail":"שלושה רבעים מהחזרות."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '086fb645-553e-48a3-b9ed-a11fef4b7c51'::uuid, 'partner-workout-you-go-i-go', 'אימון זוגות: סבב מתחלף',
    'סבב שלם לכל אחד, לסירוגין, עשרים דקות.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['dumbbell', 'box']::text[], 'כל אחד עושה סבב שלם והשני נח. המנוחה המובנית מאפשרת לעבוד חזק בכל סבב, והאחריות ההדדית עושה את השאר.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"AMRAP 20 דקות, לסירוגין","detail":"הניקוד הוא סך הסבבים של שניכם","items":[{"label":"Dumbbell Thrusters","detail":"10 חזרות"},{"label":"Box Jumps","detail":"10 חזרות"},{"label":"Burpees","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקולות קלות, קופסה נמוכה, בורפי בלי קפיצה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקולות 2×22.5/15 ק״ג."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '987628f8-0f6e-4fd2-baaf-ee4e99f58aa4'::uuid, 'core-and-carry', 'ליבה ונשיאה',
    'עשרים דקות של יציבות תחת עומס.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    28, null,
    array['kettlebell', 'mat']::text[], 'נשיאה היא תרגיל הליבה הכי מתפספס. כשהמשקל ביד אחת, הגוף חייב להתנגד להטיה לצד - וזה בדיוק מה שהגב התחתון צריך.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"4 סבבים","detail":"60 שניות מנוחה בין סבבים","items":[{"label":"Suitcase Carry","detail":"30 מטר לכל צד"},{"label":"Dead Bug","detail":"10 חזרות לכל צד"},{"label":"Side Plank","detail":"30 שניות לכל צד"},{"label":"Bird Dog","detail":"10 חזרות לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"משקל קל, 20 מטר, 3 סבבים."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקל כבד, 40 מטר."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '958b2896-48c0-4ed4-b319-1ab0a6d1a112'::uuid, 'lower-body-strength-day', 'יום רגליים',
    'סקוואט, ציר ירך, וחד-צדדי.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['barbell', 'dumbbell']::text[], 'שלושה דפוסי תנועה שמכסים את כל הרגל. החלק החד-צדדי בסוף חשוב במיוחד למי שרץ או משחק ספורט - הוא חושף חוסר איזון שסקוואט מסתיר.',
    '[{"label":"הליכה מהירה או אופניים","detail":"3 דקות"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"},{"label":"פתיחת קרסול בקיר","detail":"45 שניות לכל צד"}]'::jsonb, '[{"label":"כוח א׳","detail":"4 סטים של 6, מנוחה 2 דקות","items":[{"label":"Back Squat","detail":"משקל בינוני-כבד"}]},{"label":"כוח ב׳","detail":"3 סטים של 8, מנוחה 90 שניות","items":[{"label":"Romanian Deadlift","detail":null}]},{"label":"חד-צדדי","detail":"3 סבבים","items":[{"label":"Bulgarian Split Squat","detail":"10 חזרות לכל רגל"},{"label":"Calf Raises","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"סקוואט לכיסא, דדליפט עם משקולות קלות."},{"level":"intermediate","detail":"לפי הפרוטוקול, משקל בינוני."},{"level":"advanced","detail":"לפי הפרוטוקול, משקל כבד."}]'::jsonb,
    'weight'::public.score_type, 'הסקוואט הכבד ביותר × 6'
  ),
  (
    'cc5fbc4b-ca0a-4541-8cea-ca5dd43906a7'::uuid, 'upper-body-strength-day', 'יום פלג גוף עליון',
    'דחיפה, משיכה, ואיזון בין השתיים.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['barbell', 'dumbbell', 'pullup_bar']::text[], 'יחס של שתי משיכות לכל דחיפה. זה המבנה שמחזיק כתפיים בריאות לאורך שנים, גם אם הוא פחות מספק מיום חזה קלאסי.',
    '[{"label":"חתירה","detail":"500 מטר"},{"label":"סיבובי כתף עם גומייה","detail":"15 לכל כיוון"},{"label":"חתירה בגומייה","detail":"15 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה","detail":"10 חזרות"}]'::jsonb, '[{"label":"כוח א׳","detail":"4 סטים של 6, מנוחה 2 דקות","items":[{"label":"Strict Press","detail":"לחיצה נקייה מעל הראש"}]},{"label":"כוח ב׳","detail":"4 סטים של 8","items":[{"label":"Bent-over Row","detail":"חתירה בכפיפה"}]},{"label":"נפח","detail":"3 סבבים","items":[{"label":"Pull-ups או משיכות בגומייה","detail":"מקסימום פחות 2"},{"label":"Dumbbell Bench Press","detail":"12 חזרות"},{"label":"Face Pulls בגומייה","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"לחיצה עם משקולות יד, חתירה בטבעות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול, משקל כבד."}]'::jsonb,
    'weight'::public.score_type, 'הלחיצה הכבדה ביותר × 6'
  ),
  (
    '22e49b10-9b35-48e2-89ee-943e9206f12c'::uuid, 'conditioning-ladder-down', 'סולם יורד',
    'החזרות יורדות, הקצב עולה.', 'functional'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, 18,
    array['kettlebell', 'jump_rope']::text[], 'מבנה יורד נותן תחושת התקדמות: כל סבב קצר מהקודם. זה מאפשר לדחוף בסוף בלי לחשוש שיישאר עוד הרבה.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"},{"label":"קפיצה בחבל","detail":"2 דקות"}]'::jsonb, '[{"label":"סבבים של 10-8-6-4-2","detail":"למהירות","items":[{"label":"Kettlebell Swings","detail":"24/16 ק״ג"},{"label":"Burpees","detail":null},{"label":"קפיצה בחבל","detail":"פי 10 מהמספר בסבב"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, בורפי בלי קפיצה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"דאבל אנדרס במקום קפיצות בודדות."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'a7715a2c-3c75-4f62-a3a8-25f65b15c6a0'::uuid, 'conditioning-every-3-minutes', 'כל שלוש דקות',
    'חמישה מקטעים עם מנוחה שמשתנה לפי הביצוע.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    25, null,
    array['rower', 'dumbbell']::text[], 'מה שנשאר מהשלוש דקות אחרי שסיימתם - זו המנוחה. מבנה שמתגמל מאמץ אמיתי בכל מקטע במקום קצב בינוני לאורך כל האימון.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"},{"label":"חתירה","detail":"500 מטר"}]'::jsonb, '[{"label":"5 מקטעים, כל 3 דקות","detail":"רשמו את זמן כל מקטע בנפרד","items":[{"label":"חתירה","detail":"20 קלוריות"},{"label":"Dumbbell Thrusters","detail":"15 חזרות, 2×15/10 ק״ג"},{"label":"Burpees","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"כל 4 דקות, 12 קלוריות, משקולות קלות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"כל 3 דקות, משקולות 2×22.5/15 ק״ג."}]'::jsonb,
    'time'::public.score_type, 'המקטע האיטי ביותר'
  ),
  (
    'ac643744-3eb9-4cf6-9e54-674ade54a788'::uuid, 'conditioning-death-by-complex', 'קומפלקס עולה',
    'חזרה נוספת בכל דקה, עד שנגמר.', 'functional'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['dumbbell']::text[], 'מתחילים בחזרה אחת מכל תרגיל ומוסיפים חזרה בכל דקה. האימון מדרג את עצמו - כל אחד מפסיק במקום אחר, וזה בסדר.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"EMOM עד כישלון","detail":"דקה 1: חזרה אחת מכל תרגיל. דקה 2: שתיים. וכן הלאה.","items":[{"label":"Dumbbell Clean","detail":null},{"label":"Dumbbell Front Squat","detail":null},{"label":"Dumbbell Push Press","detail":null}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משקולות 2×5 ק״ג."},{"level":"intermediate","detail":"משקולות 2×12.5/10 ק״ג."},{"level":"advanced","detail":"משקולות 2×20/15 ק״ג."}]'::jsonb,
    'reps'::public.score_type, 'הדקה האחרונה שהושלמה'
  ),
  (
    '37c46dcd-7609-479f-a637-66bb0bb5b199'::uuid, 'beginner-first-session', 'אימון ראשון',
    'הכניסה לחדר. בלי שעון, בלי משקל.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    40, null,
    array['none', 'mat', 'bands']::text[], 'האימון שמתחילים בו. המטרה היחידה היא ללמוד את חמשת דפוסי התנועה בצורה נכונה: סקוואט, ציר ירך, דחיפה, משיכה ונשיאה. אין שעון ואין ניקוד - רק חזרות נקיות.',
    '[{"label":"הליכה","detail":"5 דקות"},{"label":"סיבובי מפרקים","detail":"2 דקות"},{"label":"גשר ירך","detail":"12 חזרות"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"3 סבבים","detail":"מנוחה מלאה בין תרגילים. הצורה קודמת למספר.","items":[{"label":"סקוואט לכיסא","detail":"10 חזרות"},{"label":"גשר ירך","detail":"12 חזרות"},{"label":"שכיבות סמיכה מהקיר","detail":"10 חזרות"},{"label":"חתירה בגומייה","detail":"12 חזרות"},{"label":"הליכה עם משקל","detail":"20 מטר"},{"label":"פלאנק","detail":"20 שניות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים, 8 חזרות בכל תרגיל."},{"level":"intermediate","detail":"3 סבבים לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים עם משקל קל."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '1b50cc74-f22f-4c76-8563-fa02fd70ec20'::uuid, 'beginner-build-up', 'בונים בסיס',
    'השלב שאחרי האימון הראשון.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    40, null,
    array['dumbbell', 'box', 'mat']::text[], 'אותם דפוסי תנועה, עכשיו עם קצת משקל ועם מנוחה קצרה יותר. אם השלמתם את שלושת הסבבים בלי לאבד צורה, בפעם הבאה עלו במשקל ולא בחזרות.',
    '[{"label":"הליכה מהירה או אופניים","detail":"3 דקות"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":"45 שניות מנוחה בין תחנות","items":[{"label":"Goblet Squat","detail":"12 חזרות"},{"label":"Romanian Deadlift","detail":"12 חזרות"},{"label":"Push-ups בהטיה","detail":"10 חזרות"},{"label":"Dumbbell Row","detail":"12 חזרות לכל צד"},{"label":"Step-ups","detail":"10 חזרות לכל רגל"},{"label":"Plank","detail":"30 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"בלי משקל, 2 סבבים."},{"level":"intermediate","detail":"משקולות 7.5/5 ק״ג."},{"level":"advanced","detail":"משקולות 15/10 ק״ג, 4 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'f2312aca-6bb5-4d54-a482-f270393d2986'::uuid, 'grip-and-carry-medley', 'אחיזה ונשיאה',
    'האימון שחושף כמה חלשה האחיזה.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, null,
    array['kettlebell', 'dumbbell', 'pullup_bar']::text[], 'אחיזה היא לרוב החוליה החלשה בדדליפט ובמשיכות. עשרים דקות ממוקדות בה משנות את זה מהר יותר מכל תרגיל אחר.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"}]'::jsonb, '[{"label":"5 סבבים","detail":"90 שניות מנוחה בין סבבים","items":[{"label":"Farmer Carry","detail":"40 מטר כבד"},{"label":"Dead Hang","detail":"מקסימום זמן"},{"label":"Kettlebell Swings","detail":"15 חזרות"},{"label":"Plate Pinch Hold","detail":"30 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משקל קל, 20 מטר, תלייה 15 שניות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקל כבד, נשיאה 60 מטר."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'ea5d5ef8-deb1-410e-b4d8-562a2b581194'::uuid, 'sprint-intervals-running', 'ספרינטים',
    'עשרה מקטעים קצרים, מנוחה מלאה.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, null,
    array['none']::text[], 'ריצה מהירה היא מיומנות, לא רק כושר. חממו ביסודיות - ספרינט על שרירים קרים הוא הדרך המהירה ביותר לפציעת מיתר ברך.',
    '[{"label":"ריצה קלה","detail":"800 מטר"},{"label":"מתיחות דינמיות: בעיטות ישבן, הרמות ברך, צעד פתוח","detail":"3 סבבים של 20 מטר"},{"label":"האצות","detail":"4 × 40 מטר בקצב עולה"}]'::jsonb, '[{"label":"10 × 100 מטר","detail":"מנוחה מלאה - הליכה חזרה להתחלה, לפחות 90 שניות","items":[{"label":"ספרינט","detail":"100 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"6 מקטעים של 60 מטר בקצב מהיר ולא מרבי."},{"level":"intermediate","detail":"8 מקטעים של 100 מטר."},{"level":"advanced","detail":"10 מקטעים לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, 'המקטע המהיר ביותר'
  ),
  (
    '6f89fcc6-eab9-4788-bb0c-0334553ee412'::uuid, 'bodyweight-hotel-room', 'אימון חדר מלון',
    'שני מטר רבוע, עשרים דקות, בלי כלום.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'beginner'::public.difficulty_level,
    22, null,
    array['none']::text[], 'אימון לנסיעות. אין קפיצות ואין רעש - אפשר לעשות אותו בשקט מעל שכנים ישנים.',
    '[{"label":"צעדה במקום","detail":"2 דקות"},{"label":"סיבובי מפרקים","detail":"90 שניות"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"}]'::jsonb, '[{"label":"AMRAP 20 דקות","detail":"בלי קפיצות","items":[{"label":"Air Squats","detail":"20 חזרות"},{"label":"Push-ups","detail":"12 חזרות"},{"label":"Reverse Lunges","detail":"12 חזרות לכל רגל"},{"label":"Plank","detail":"45 שניות"},{"label":"Glute Bridge","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"15 דקות, שכיבות מהברכיים."},{"level":"intermediate","detail":"20 דקות לפי הפרוטוקול."},{"level":"advanced","detail":"שכיבות עם רגליים מוגבהות, סקוואט על רגל אחת."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '0958641c-7a34-4bda-93f6-fb4e683ae1e0'::uuid, 'active-recovery-flow', 'התאוששות פעילה',
    'יום בין אימונים קשים.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['bike', 'bands', 'mat']::text[], 'עצימות נמוכה בכוונה. המטרה היא להזרים דם לשרירים כואבים ולשמור על טווחי תנועה, לא לייצר עוד עייפות. אם הדופק עולה מעל שיחה נוחה - האטו.',
    '[{"label":"אופניים","detail":"5 דקות בקצב קל"}]'::jsonb, '[{"label":"3 סבבים, קצב נוח","detail":null,"items":[{"label":"אופניים","detail":"3 דקות קל"},{"label":"Band Pull-aparts","detail":"15 חזרות"},{"label":"Glute Bridge","detail":"15 חזרות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"Worlds Greatest Stretch","detail":"5 חזרות לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים."},{"level":"intermediate","detail":"3 סבבים."},{"level":"advanced","detail":"4 סבבים עם הליכה ארוכה בסוף."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'a4995a92-eada-49f8-9446-298c0b753d36'::uuid, 'metcon-fifteen-minute', 'מטקון 15 דקות',
    'קצר, פשוט, ובלי חימום ארוך.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, null,
    array['kettlebell', 'box']::text[], 'האימון לימים שבהם יש רבע שעה ולא יותר. שלושה תרגילים, מבנה פשוט, ואפשר לתת בו הכל בלי לתכנן.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"עליות על קופסה","detail":"10 חזרות"}]'::jsonb, '[{"label":"AMRAP 15 דקות","detail":null,"items":[{"label":"Kettlebell Swings","detail":"20 חזרות, 24/16 ק״ג"},{"label":"Box Jumps","detail":"15 חזרות"},{"label":"Push-ups","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, עלייה במקום קפיצה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"קטלבל 32/24 ק״ג."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'e2b0994b-7dbf-4f9d-8fcb-de898e8c7827'::uuid, 'metcon-the-long-one', 'המטקון הארוך',
    'ארבעים דקות בקצב אחיד.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['rower', 'dumbbell', 'jump_rope']::text[], 'אימון סבולת ארוך. בארבעים דקות אין מקום להתפרצות - מצאו קצב שתוכלו להחזיק בדקה 38, והתחילו בו כבר בדקה הראשונה.',
    '[{"label":"הליכה מהירה או אופניים","detail":"3 דקות"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"},{"label":"חתירה","detail":"500 מטר"}]'::jsonb, '[{"label":"AMRAP 40 דקות","detail":"קצב שיחה. שתו מים באמצע.","items":[{"label":"חתירה","detail":"400 מטר"},{"label":"Dumbbell Snatch","detail":"20 חזרות, 10 לכל יד"},{"label":"קפיצה בחבל","detail":"100 חזרות"},{"label":"Walking Lunges","detail":"20 צעדים"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"25 דקות, 300 מטר, משקולת קלה."},{"level":"intermediate","detail":"40 דקות לפי הפרוטוקול."},{"level":"advanced","detail":"40 דקות, משקולת 22.5/15 ק״ג, דאבל אנדרס."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'f86988df-3733-4c2d-987e-a1693507fd3b'::uuid, 'mobility-strength-hybrid', 'ניידות וכוח',
    'טווח תנועה תחת עומס.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['dumbbell', 'bands', 'mat']::text[], 'מתיחה בלי כוח בטווח החדש לא נשארת. האימון הזה עובד בקצוות הטווח עם משקל קל, וזה מה שהופך ניידות זמנית ליכולת קבועה.',
    '[{"label":"אופניים או הליכה","detail":"3 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"Worlds Greatest Stretch","detail":"5 לכל צד"},{"label":"סיבובי כתף עם גומייה","detail":"15 לכל כיוון"}]'::jsonb, '[{"label":"3 סבבים","detail":"איטי ומבוקר. 3 שניות בירידה בכל תרגיל.","items":[{"label":"Deep Goblet Squat Hold","detail":"45 שניות"},{"label":"Cossack Squat","detail":"8 חזרות לכל צד"},{"label":"Overhead Squat עם מקל","detail":"10 חזרות"},{"label":"Jefferson Curl עם משקל קל","detail":"8 חזרות"},{"label":"Dumbbell Windmill","detail":"6 חזרות לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"בלי משקל, טווח חלקי."},{"level":"intermediate","detail":"משקל קל לפי הפרוטוקול."},{"level":"advanced","detail":"משקל בינוני בטווח מלא."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'aa970d1c-4b3b-44e2-8db1-96de7542c788'::uuid, 'pilates-classical-mat', 'פילאטיס מזרן קלאסי',
    'הרצף המקורי, לפי הסדר.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['mat']::text[], 'הרצף הקלאסי בסדר המסורתי שלו. כל תרגיל מכין את הבא אחריו, ולכן הסדר חשוב לא פחות מהתרגילים עצמם. נשימה מלווה כל תנועה: שאיפה בהתארכות, נשיפה במאמץ.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"פתיחה","detail":"איטי, מוצא את החיבור לליבה","items":[{"label":"The Hundred","detail":"100 פעימות, 10 נשימות"},{"label":"Roll Up","detail":"6 חזרות"},{"label":"Roll Over","detail":"5 חזרות"},{"label":"Single Leg Circles","detail":"5 לכל כיוון, לכל רגל"}]},{"label":"הרצף המרכזי","detail":null,"items":[{"label":"Rolling Like a Ball","detail":"8 חזרות"},{"label":"Single Leg Stretch","detail":"10 לכל צד"},{"label":"Double Leg Stretch","detail":"10 חזרות"},{"label":"Scissors","detail":"10 לכל צד"},{"label":"Lower Lift","detail":"8 חזרות"},{"label":"Criss Cross","detail":"10 לכל צד"}]},{"label":"עמוד שדרה וירך","detail":null,"items":[{"label":"Spine Stretch Forward","detail":"5 חזרות"},{"label":"Open Leg Rocker","detail":"6 חזרות"},{"label":"Corkscrew","detail":"4 לכל כיוון"},{"label":"Saw","detail":"6 לכל צד"}]},{"label":"שרשרת אחורית וסיום","detail":null,"items":[{"label":"Swan Dive","detail":"6 חזרות"},{"label":"Single Leg Kick","detail":"8 לכל צד"},{"label":"Double Leg Kick","detail":"6 חזרות"},{"label":"Neck Pull","detail":"6 חזרות"},{"label":"Side Kick Series","detail":"10 מכל תרגיל, לכל צד"},{"label":"Teaser","detail":"3 חזרות"},{"label":"Seal","detail":"8 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"ברכיים כפופות ב-Roll Up ו-Teaser, דילוג על Roll Over ו-Open Leg Rocker."},{"level":"intermediate","detail":"הרצף המלא עם ידיים מאחורי הירך בתרגילים הקשים."},{"level":"advanced","detail":"הרצף המלא בקצב רציף בלי הפסקות בין תרגילים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '4b0d85c2-2bdb-4370-9ac8-35942fd05336'::uuid, 'pilates-core-foundations', 'יסודות הליבה',
    'חמישה עקרונות, חצי שעה, בלי מהירות.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['mat']::text[], 'שיעור הפתיחה. לומדים למצוא את המצב הניטרלי של האגן, לנשום לצדדים, ולהפעיל את הליבה בלי לתפוס את הצוואר. זה הבסיס לכל שאר התרגילים בקטגוריה.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"חיבור","detail":"איטי מאוד, 5 נשימות בכל תרגיל","items":[{"label":"אגן ניטרלי ונשימה","detail":"10 נשימות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Toe Taps","detail":"10 לכל צד"}]},{"label":"ליבה","detail":"2 סבבים","items":[{"label":"Dead Bug","detail":"8 לכל צד"},{"label":"Single Leg Stretch","detail":"8 לכל צד"},{"label":"The Hundred","detail":"50 פעימות"},{"label":"Bridge","detail":"10 חזרות"}]},{"label":"גב","detail":null,"items":[{"label":"Swimming","detail":"30 שניות"},{"label":"Bird Dog","detail":"8 לכל צד"},{"label":"Child’s Pose","detail":"60 שניות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"ראש על המזרן בכל התרגילים בשכיבה."},{"level":"intermediate","detail":"הרמת ראש וכתפיים לפי הפרוטוקול."},{"level":"advanced","detail":"רגליים ישרות וזווית נמוכה יותר."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '84b5d17c-578d-4296-9db2-f04a3a15d950'::uuid, 'pilates-power-mat', 'פילאטיס כוח',
    'אותם עקרונות, יותר עומס.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'advanced'::public.difficulty_level,
    45, null,
    array['mat', 'bands', 'dumbbell']::text[], 'שיעור פילאטיס שמוסיף התנגדות. הגומייה והמשקולות הקלות לא משנות את איכות התנועה - הן רק מאריכות את הזמן שבו השריר עובד.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"3 סבבים","detail":"איטי ומבוקר, 3 שניות בירידה","items":[{"label":"Teaser","detail":"5 חזרות"},{"label":"Single Leg Bridge","detail":"10 לכל צד"},{"label":"Side Plank with Leg Lift","detail":"10 לכל צד"},{"label":"Band Pull-aparts","detail":"15 חזרות"},{"label":"Swan with Arm Reach","detail":"8 חזרות"},{"label":"Roll Up עם משקולת קלה","detail":"8 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"בלי התנגדות, 2 סבבים."},{"level":"intermediate","detail":"גומייה קלה, 3 סבבים."},{"level":"advanced","detail":"גומייה חזקה ומשקולות 2-3 ק״ג."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '04dee49c-a62b-4946-af12-600a27d4d050'::uuid, 'pilates-core-stability-deep', 'יציבות ליבה עמוקה',
    'שרירים שלא רואים במראה.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['mat']::text[], 'עבודה על השכבה העמוקה - רוחבי הבטן, רצפת האגן והמייצבים של עמוד השדרה. אין כאן תחושת שריפה גדולה, וזה בסדר: העבודה נמדדת ביציבות ולא בכאב.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"3 סבבים","detail":"30 שניות מנוחה בין סבבים","items":[{"label":"Dead Bug","detail":"10 לכל צד, איטי"},{"label":"Bird Dog","detail":"10 לכל צד"},{"label":"Side Plank","detail":"30 שניות לכל צד"},{"label":"Hollow Hold","detail":"30 שניות"},{"label":"Glute Bridge March","detail":"10 לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"פלאנק צד מהברכיים, 20 שניות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"פלאנק צד עם הרמת רגל, 45 שניות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '0cf85054-5b0c-4582-b328-bff6c3df16f8'::uuid, 'pilates-posture-desk', 'יציבה אחרי יום מול מסך',
    'פותחים את מה שהתקצר.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    25, null,
    array['mat', 'bands']::text[], 'שיעור קצר למי שיושב שמונה שעות ביום. הרעיון פשוט: לפתוח את החזה וכופפי הירך שהתקצרו, ולחזק את הגב העליון והישבן שנרדמו.',
    '[{"label":"הליכה במקום","detail":"2 דקות"},{"label":"גלגול עמוד שדרה מעמידה","detail":"5 חזרות איטיות"},{"label":"סיבובי כתף","detail":"10 לכל כיוון"},{"label":"הטיית אגן בעמידה","detail":"10 חזרות"}]'::jsonb, '[{"label":"פתיחה","detail":null,"items":[{"label":"פתיחת חזה במשקוף","detail":"45 שניות"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"Thread the Needle","detail":"45 שניות לכל צד"}]},{"label":"חיזוק","detail":"3 סבבים","items":[{"label":"Band Pull-aparts","detail":"15 חזרות"},{"label":"Prone Y-T-W","detail":"8 מכל אות"},{"label":"Glute Bridge","detail":"15 חזרות"},{"label":"Wall Angels","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים עם גומייה חזקה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '28c60b0b-6a11-41cd-8c72-15b17ae737cf'::uuid, 'pilates-posterior-chain', 'שרשרת אחורית',
    'גב, ישבן ומיתרי ברך.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['mat', 'bands']::text[], 'כל מה שנמצא בגב הגוף. אצל רוב האנשים זה הצד החלש, והחיזוק שלו הוא מה שמוריד כאבי גב תחתון יותר מכל מתיחה.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"3 סבבים","detail":null,"items":[{"label":"Single Leg Bridge","detail":"12 לכל צד"},{"label":"Swimming","detail":"45 שניות"},{"label":"Prone Leg Lifts","detail":"12 לכל צד"},{"label":"Clamshells עם גומייה","detail":"15 לכל צד"},{"label":"Hamstring Curl בגלגול","detail":"12 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"גשר דו-רגלי, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"גשר על רגל אחת עם משקל, 4 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '18450850-90ca-44be-875b-733a63f24fbc'::uuid, 'pilates-flexibility-flow', 'גמישות מודרכת',
    'טווחי תנועה, לאט.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['mat', 'bands']::text[], 'שיעור שמוקדש כולו לטווח תנועה. אחזקות ארוכות עם נשימה - לא מתיחות קפיציות. אם אתם מרגישים חדות ולא מתיחה, צאו מהטווח.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"רצף מתיחות","detail":"60-90 שניות בכל תנוחה, נשימה עמוקה","items":[{"label":"Spine Stretch Forward","detail":"8 חזרות איטיות"},{"label":"Saw","detail":"8 לכל צד"},{"label":"מתיחת מיתרי ברך עם גומייה","detail":"90 שניות לכל צד"},{"label":"Figure Four","detail":"90 שניות לכל צד"},{"label":"Spinal Twist בשכיבה","detail":"90 שניות לכל צד"},{"label":"Mermaid","detail":"60 שניות לכל צד"},{"label":"Child’s Pose","detail":"2 דקות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"טווח חלקי, ברכיים כפופות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"טווח מלא, אחזקות של 2 דקות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '53cfb123-11cd-4a69-8167-a69ddadcdd67'::uuid, 'pilates-abs-focus', 'בטן ממוקד',
    'עשרים דקות, ליבה בלבד.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['mat']::text[], 'שיעור קצר וממוקד. שמרו על הגב התחתון צמוד למזרן לאורך כל התרגילים - ברגע שהוא מתרומם, הורידו את הרגליים גבוה יותר.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"3 סבבים","detail":"45 שניות מנוחה בין סבבים","items":[{"label":"The Hundred","detail":"100 פעימות"},{"label":"Single Leg Stretch","detail":"15 לכל צד"},{"label":"Double Leg Stretch","detail":"12 חזרות"},{"label":"Criss Cross","detail":"15 לכל צד"},{"label":"Lower Lift","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"ראש על המזרן, ברכיים ב-90 מעלות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"רגליים ישרות ונמוכות, 4 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '4a6d055f-28d9-469d-a6a4-e6b1d22d2853'::uuid, 'pilates-standing-balance', 'פילאטיס בעמידה',
    'שיווי משקל ויציבה, בלי מזרן.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['none', 'bands']::text[], 'כל השיעור בעמידה. שימושי למי שקשה לו לרדת ולעלות מהרצפה, ולכל מי שרוצה לעבוד על שיווי משקל - יכולת שיורדת מהר יותר מכוח.',
    '[{"label":"הליכה במקום","detail":"2 דקות"},{"label":"גלגול עמוד שדרה מעמידה","detail":"5 חזרות איטיות"},{"label":"סיבובי כתף","detail":"10 לכל כיוון"},{"label":"הטיית אגן בעמידה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":null,"items":[{"label":"עמידה על רגל אחת","detail":"45 שניות לכל צד"},{"label":"Standing Leg Circles","detail":"10 לכל כיוון, לכל רגל"},{"label":"Roll Down","detail":"6 חזרות"},{"label":"Standing Side Bend","detail":"10 לכל צד"},{"label":"Heel Raises","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"יד על הקיר לתמיכה."},{"level":"intermediate","detail":"בלי תמיכה."},{"level":"advanced","detail":"עיניים עצומות בעמידה על רגל אחת."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '9a11cc45-28dd-4573-ae46-e6bf0aa5e571'::uuid, 'pilates-lower-back-care', 'טיפוח גב תחתון',
    'לימים שהגב מזכיר את עצמו.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    25, null,
    array['mat']::text[], 'שיעור עדין לגב רגיש. אין בו כיפוף קדימה בעומס ואין סיבובים חדים. אם משהו מכאיב - דלגו עליו. כאב חד הוא לא חלק מהתרגיל.',
    '[{"label":"נשימה בשכיבה עם ברכיים כפופות","detail":"10 נשימות"},{"label":"הטיית אגן","detail":"12 חזרות"},{"label":"ברך לחזה לסירוגין","detail":"10 לכל צד"}]'::jsonb, '[{"label":"רצף עדין","detail":"איטי, בלי להגיע לקצה הטווח","items":[{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"Bird Dog","detail":"8 לכל צד"},{"label":"Glute Bridge","detail":"12 חזרות"},{"label":"Dead Bug","detail":"8 לכל צד"},{"label":"Side Plank מהברכיים","detail":"20 שניות לכל צד"},{"label":"Knee Rolls","detail":"10 לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת ילד","detail":"2 דקות"},{"label":"שכיבה עם רגליים על כיסא","detail":"3 דקות"},{"label":"נשימת סרעפת","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"טווח קטן, 6 חזרות בכל תרגיל."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת של Swimming ו-Prone Leg Lifts."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '7fd9b659-b19e-4a6f-92f8-ba0bcda13975'::uuid, 'pilates-hips-and-glutes', 'אגן וישבן',
    'סדרת הצד הקלאסית, מלאה.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, null,
    array['mat', 'bands']::text[], 'סדרת השכיבה על הצד במלואה. השריר שעובד כאן - הישבן האמצעי - הוא זה שמייצב את האגן בהליכה ובריצה, ולכן יש לזה השפעה מעבר לשיעור.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"לכל צד, סבב שלם","detail":"2 סבבים לכל צד","items":[{"label":"Side Kick Front-Back","detail":"15 חזרות"},{"label":"Side Kick Up-Down","detail":"15 חזרות"},{"label":"Small Circles","detail":"15 לכל כיוון"},{"label":"Clamshell","detail":"20 חזרות"},{"label":"Inner Thigh Lift","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"סבב אחד לכל צד, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"גומייה חזקה, 3 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '21c431e7-2d4a-4e95-982d-1829ae1e5c2b'::uuid, 'pilates-full-body-express', 'פילאטיס אקספרס',
    'עשרים דקות שמכסות הכל.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    22, null,
    array['mat']::text[], 'גרסה מקוצרת לימים עמוסים. עשרים דקות בקצב רציף שנוגעות בליבה, בגב, בישבן ובגמישות.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"}]'::jsonb, '[{"label":"רצף רציף","detail":"2 סבבים בלי מנוחה בין תרגילים","items":[{"label":"The Hundred","detail":"50 פעימות"},{"label":"Roll Up","detail":"5 חזרות"},{"label":"Single Leg Stretch","detail":"10 לכל צד"},{"label":"Bridge","detail":"12 חזרות"},{"label":"Swimming","detail":"30 שניות"},{"label":"Side Plank","detail":"20 שניות לכל צד"},{"label":"Spine Stretch Forward","detail":"5 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"סבב אחד."},{"level":"intermediate","detail":"2 סבבים."},{"level":"advanced","detail":"3 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '669cd800-aad4-40ca-854e-940e8de263a4'::uuid, 'pilates-teaser-progression', 'הדרך אל ה-Teaser',
    'שיעור שבונה תרגיל אחד.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'advanced'::public.difficulty_level,
    35, null,
    array['mat']::text[], 'ה-Teaser הוא תרגיל הסימן של פילאטיס, והוא דורש שילוב של כוח ליבה, גמישות מיתרי ברך ושליטה בגלגול עמוד השדרה. השיעור מפרק אותו לשלבים ובונה אותו מחדש.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"שלב 1 - גלגול","detail":null,"items":[{"label":"Roll Up","detail":"8 חזרות איטיות"},{"label":"Rolling Like a Ball","detail":"10 חזרות"}]},{"label":"שלב 2 - חלקים","detail":null,"items":[{"label":"Teaser עם רגל אחת","detail":"6 לכל צד"},{"label":"Teaser עם ברכיים כפופות","detail":"6 חזרות"},{"label":"Half Teaser מהרצפה","detail":"8 חזרות"}]},{"label":"שלב 3 - התרגיל","detail":"3 סטים, מנוחה מלאה","items":[{"label":"Teaser מלא","detail":"3-5 חזרות"}]},{"label":"תמיכה","detail":null,"items":[{"label":"Hollow Hold","detail":"30 שניות, 3 סבבים"},{"label":"מתיחת מיתרי ברך","detail":"90 שניות לכל צד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"עצירה בשלב 2, ידיים על הירך."},{"level":"intermediate","detail":"Teaser עם ברכיים כפופות."},{"level":"advanced","detail":"Teaser מלא, רגליים ישרות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '97147a68-6962-443e-8e42-bb1a82519b94'::uuid, 'pilates-breath-and-ribcage', 'נשימה ובית חזה',
    'המיומנות שכל השאר נשען עליה.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    25, null,
    array['mat', 'bands']::text[], 'שיעור שמוקדש לנשימה. רוב האנשים נושמים לתוך הבטן או לתוך הכתפיים ומדלגים על הצלעות. זה משנה את תפקוד הליבה בכל תרגיל אחר - ולכן זה שווה שיעור שלם.',
    '[{"label":"שכיבה עם ברכיים כפופות, ידיים על הצלעות","detail":"2 דקות"}]'::jsonb, '[{"label":"לימוד","detail":"10 נשימות בכל תנוחה","items":[{"label":"נשימה צידית בשכיבה","detail":"ידיים על הצלעות"},{"label":"נשימה צידית עם גומייה סביב הצלעות","detail":null},{"label":"נשימה בישיבה מזרחית","detail":null},{"label":"נשימה בתנוחת ילד","detail":null}]},{"label":"יישום","detail":"מלווים כל תנועה בנשיפה במאמץ","items":[{"label":"Bridge","detail":"10 חזרות"},{"label":"Dead Bug","detail":"8 לכל צד"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"The Hundred","detail":"100 פעימות"}]}]'::jsonb,
    '[{"label":"הליכה קלה","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"רק חלק הלימוד."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת של אחזקות ארוכות בנשיפה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '01d9a44b-1537-481d-86d0-82a967275fe7'::uuid, 'pilates-athlete-support', 'פילאטיס לספורטאי',
    'משלים אימונים כבדים, לא מחליף אותם.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['mat', 'bands']::text[], 'שיעור שנבנה כיום משלים למי שמתאמן כבד בשאר השבוע. הדגש הוא על מייצבי הכתף והאגן - המקומות שמתעייפים ראשונים תחת עומס ומובילים לפציעות.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"3 סבבים","detail":null,"items":[{"label":"Prone Y-T-W","detail":"8 מכל אות"},{"label":"Side Plank with Rotation","detail":"10 לכל צד"},{"label":"Single Leg Bridge","detail":"12 לכל צד"},{"label":"Clamshell עם גומייה","detail":"20 לכל צד"},{"label":"Bird Dog","detail":"10 לכל צד"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים עם גומייה חזקה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '6c5ea137-b08b-4ef5-993e-f081a4df6d63'::uuid, 'pilates-prenatal-safe', 'פילאטיס עדין',
    'בלי שכיבה על הבטן ובלי כיפוף בטן.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['mat', 'bands']::text[], 'גרסה שמוותרת על שכיבה על הבטן ועל תרגילי כיפוף בטן. מתאימה למי שחוזר מפציעה, למי שהבטן רגישה, ולכל מי שמעדיף עומס נמוך. אם יש מצב רפואי - התייעצו קודם עם מי שמטפל בכם.',
    '[{"label":"הליכה במקום","detail":"2 דקות"},{"label":"גלגול עמוד שדרה מעמידה","detail":"5 חזרות איטיות"},{"label":"סיבובי כתף","detail":"10 לכל כיוון"},{"label":"הטיית אגן בעמידה","detail":"10 חזרות"}]'::jsonb, '[{"label":"רצף","detail":"איטי, נשימה מלאה בכל תנועה","items":[{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"Bird Dog","detail":"10 לכל צד"},{"label":"Side-Lying Leg Series","detail":"12 מכל תרגיל, לכל צד"},{"label":"Glute Bridge","detail":"15 חזרות"},{"label":"Wall Squat Hold","detail":"30 שניות, 3 סבבים"},{"label":"Standing Roll Down","detail":"6 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"טווח קטן, תמיכה ביד."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת גומייה בכל תרגיל."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '377d9a61-c674-4feb-bbfd-299fe2b80c85'::uuid, 'pilates-spine-mobility', 'ניידות עמוד שדרה',
    'כיפוף, יישור, סיבוב, הטיה.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, null,
    array['mat']::text[], 'עמוד השדרה נע בארבעה כיוונים, ורוב הימים הוא נע רק באחד. השיעור עובר על כל הארבעה בסדר מסודר, מהעדין אל העמוק.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"}]'::jsonb, '[{"label":"כיפוף","detail":null,"items":[{"label":"Roll Up","detail":"8 חזרות"},{"label":"Spine Stretch Forward","detail":"8 חזרות"}]},{"label":"יישור","detail":null,"items":[{"label":"Swan","detail":"8 חזרות"},{"label":"Swimming","detail":"45 שניות"}]},{"label":"סיבוב","detail":null,"items":[{"label":"Saw","detail":"8 לכל צד"},{"label":"Spine Twist בישיבה","detail":"10 לכל צד"}]},{"label":"הטיה","detail":null,"items":[{"label":"Mermaid","detail":"8 לכל צד"},{"label":"Side Bend בעמידה","detail":"10 לכל צד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"טווח חלקי, ברכיים כפופות בישיבה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"טווח מלא, אחזקה של 3 שניות בקצה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'e659e751-a755-4ef7-922d-1f036094633d'::uuid, 'pilates-arms-and-shoulders', 'ידיים וכתפיים',
    'עומס קל, הרבה חזרות, שליטה מלאה.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    28, null,
    array['mat', 'bands', 'dumbbell']::text[], 'עבודה על הכתף עם משקל קל מאוד. המטרה היא סבולת ובקרה ולא היפרטרופיה - ולכן משקולת של שניים-שלושה קילו מספיקה לחלוטין כאן.',
    '[{"label":"הליכה במקום","detail":"2 דקות"},{"label":"גלגול עמוד שדרה מעמידה","detail":"5 חזרות איטיות"},{"label":"סיבובי כתף","detail":"10 לכל כיוון"},{"label":"הטיית אגן בעמידה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":"משקולות 1-3 ק״ג, קצב איטי","items":[{"label":"Arm Circles","detail":"20 לכל כיוון"},{"label":"Front Raise","detail":"15 חזרות"},{"label":"Lateral Raise","detail":"15 חזרות"},{"label":"Band Pull-aparts","detail":"20 חזרות"},{"label":"Tricep Extension","detail":"15 חזרות"},{"label":"Prone Y-T-W","detail":"8 מכל אות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"בלי משקל."},{"level":"intermediate","detail":"משקולות 2 ק״ג."},{"level":"advanced","detail":"משקולות 4 ק״ג, 4 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'd3e2c06c-291a-43da-a898-b706bac05088'::uuid, 'pilates-evening-unwind', 'פילאטיס ערב',
    'להוריד הילוך לפני השינה.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    25, null,
    array['mat']::text[], 'שיעור שמסתיים נמוך יותר ממה שהתחיל. בלי עבודה מאומצת ובלי דופק גבוה - רצף שמרפה את מה שנתפס במהלך היום ומכין לשינה.',
    '[{"label":"נשימת סרעפת בשכיבה","detail":"2 דקות"}]'::jsonb, '[{"label":"רצף יורד","detail":"60-90 שניות בכל תנוחה","items":[{"label":"Cat-Cow","detail":"10 חזרות איטיות"},{"label":"Thread the Needle","detail":"60 שניות לכל צד"},{"label":"Child’s Pose","detail":"90 שניות"},{"label":"Knee Rolls","detail":"10 לכל צד"},{"label":"Figure Four","detail":"90 שניות לכל צד"},{"label":"רגליים על הקיר","detail":"3 דקות"}]}]'::jsonb,
    '[{"label":"נשימה 4-7-8","detail":"8 סבבים"},{"label":"שכיבה שקטה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"אחזקות של 45 שניות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"אחזקות של 2 דקות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '54db9a5f-1749-434d-95fd-91a1d8f4c823'::uuid, 'pilates-fifty-minute-full', 'שיעור מלא 50 דקות',
    'השיעור השלם, בלי קיצורים.', 'pilates'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    50, null,
    array['mat', 'bands']::text[], 'השיעור הארוך של הקטגוריה. חימום מלא, רצף מרכזי, עבודת צד, עבודת גב וסיום ארוך. זה השיעור להביא אליו את הבוקר של יום ראשון.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות, יד על הצלעות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"},{"label":"מתיחת ברך לחזה לסירוגין","detail":"8 לכל צד"},{"label":"Roll Down בעמידה","detail":"6 חזרות"}]'::jsonb, '[{"label":"ליבה","detail":null,"items":[{"label":"The Hundred","detail":"100 פעימות"},{"label":"Roll Up","detail":"8 חזרות"},{"label":"Single Leg Circles","detail":"8 לכל כיוון"},{"label":"Rolling Like a Ball","detail":"10 חזרות"}]},{"label":"סדרת הבטן","detail":null,"items":[{"label":"Single Leg Stretch","detail":"12 לכל צד"},{"label":"Double Leg Stretch","detail":"12 חזרות"},{"label":"Scissors","detail":"12 לכל צד"},{"label":"Lower Lift","detail":"10 חזרות"},{"label":"Criss Cross","detail":"12 לכל צד"}]},{"label":"צד וגב","detail":null,"items":[{"label":"Side Kick Series","detail":"12 מכל תרגיל, לכל צד"},{"label":"Swan","detail":"8 חזרות"},{"label":"Swimming","detail":"60 שניות"},{"label":"Single Leg Kick","detail":"10 לכל צד"}]},{"label":"סיום","detail":null,"items":[{"label":"Teaser","detail":"5 חזרות"},{"label":"Spine Stretch Forward","detail":"8 חזרות"},{"label":"Seal","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"חצי מהחזרות, דילוג על Teaser."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול ברצף בלי מנוחות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'ea2a395c-0163-4aee-928f-58f28948aea0'::uuid, 'vinyasa-morning-flow', 'ויניאסה בוקר',
    'לפתוח את הגוף לפני שהיום מתחיל.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['mat']::text[], 'רצף זורם שמתחיל לאט ומתחמם בהדרגה. הנשימה מובילה - כל תנועה מתחילה בשאיפה או בנשיפה, ולא להפך. אם הנשימה מתקצרת, האטו.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"}]'::jsonb, '[{"label":"ברכת שמש א׳","detail":"5 סבבים","items":[{"label":"Tadasana","detail":"הר, 3 נשימות"},{"label":"Urdhva Hastasana","detail":"הושטה מעלה"},{"label":"Uttanasana","detail":"כיפוף קדימה"},{"label":"Ardha Uttanasana","detail":"חצי הרמה"},{"label":"Chaturanga","detail":"הנמכה מבוקרת"},{"label":"Urdhva Mukha Svanasana","detail":"כלב מביט מעלה"},{"label":"Adho Mukha Svanasana","detail":"כלב מביט מטה, 5 נשימות"}]},{"label":"רצף עמידה","detail":"2 סבבים לכל צד, 5 נשימות בכל תנוחה","items":[{"label":"Virabhadrasana I","detail":"לוחם א׳"},{"label":"Virabhadrasana II","detail":"לוחם ב׳"},{"label":"Utthita Trikonasana","detail":"משולש"},{"label":"Parsvakonasana","detail":"זווית צידית"}]},{"label":"סיום","detail":null,"items":[{"label":"Malasana","detail":"כריעה עמוקה, 60 שניות"},{"label":"Paschimottanasana","detail":"כיפוף קדימה בישיבה, 90 שניות"},{"label":"Supta Matsyendrasana","detail":"פיתול בשכיבה, 60 שניות לכל צד"}]}]'::jsonb,
    '[{"label":"Savasana","detail":"שכיבת מנוחה, 4 דקות"}]'::jsonb, '[{"level":"beginner","detail":"3 ברכות שמש, ברכיים על המזרן ב-Chaturanga."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"8 ברכות שמש וקצב רציף."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'ce9cd62d-9e8d-435b-9e5d-bc5f59e0c781'::uuid, 'vinyasa-full-flow', 'ויניאסה מלא',
    'שישים דקות של תנועה רציפה.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['mat']::text[], 'שיעור מלא עם רצף עמידה ארוך, שיווי משקל וסיום שקט. הדופק עולה יותר משנדמה - זה שיעור שאפשר לספור אותו כאימון.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"},{"label":"ברכת שמש א׳","detail":"3 סבבים איטיים"}]'::jsonb, '[{"label":"חימום זורם","detail":"5 סבבים","items":[{"label":"Tadasana","detail":"הר, 3 נשימות"},{"label":"Urdhva Hastasana","detail":"הושטה מעלה"},{"label":"Uttanasana","detail":"כיפוף קדימה"},{"label":"Ardha Uttanasana","detail":"חצי הרמה"},{"label":"Chaturanga","detail":"הנמכה מבוקרת"},{"label":"Urdhva Mukha Svanasana","detail":"כלב מביט מעלה"},{"label":"Adho Mukha Svanasana","detail":"כלב מביט מטה, 5 נשימות"}]},{"label":"רצף עמידה","detail":"3 סבבים לכל צד","items":[{"label":"Virabhadrasana I","detail":"לוחם א׳"},{"label":"Virabhadrasana III","detail":"לוחם ג׳"},{"label":"Ardha Chandrasana","detail":"חצי ירח"},{"label":"Parivrtta Trikonasana","detail":"משולש מסובב"},{"label":"Utkatasana","detail":"כיסא"}]},{"label":"שיווי משקל","detail":"5 נשימות בכל תנוחה, לכל צד","items":[{"label":"Vrksasana","detail":"עץ"},{"label":"Garudasana","detail":"נשר"},{"label":"Natarajasana","detail":"רקדן"}]},{"label":"רצפה","detail":null,"items":[{"label":"Bhujangasana","detail":"קוברה, 5 נשימות"},{"label":"Dhanurasana","detail":"קשת, 3 סבבים של 5 נשימות"},{"label":"Setu Bandha","detail":"גשר, 60 שניות"},{"label":"Halasana","detail":"מחרשה, 60 שניות"}]}]'::jsonb,
    '[{"label":"Supta Matsyendrasana","detail":"פיתול, 90 שניות לכל צד"},{"label":"Savasana","detail":"5 דקות"}]'::jsonb, '[{"level":"beginner","detail":"רצף עמידה אחד לכל צד, דילוג על חצי ירח ומחרשה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת של עמידת ידיים בקיר ו-Chaturanga מלא בכל מעבר."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '08712629-3e4a-428f-971f-ef5305d6db3d'::uuid, 'power-yoga-strength', 'פאוור יוגה',
    'יוגה שנחשבת אימון כוח.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'advanced'::public.difficulty_level,
    45, null,
    array['mat']::text[], 'אחזקות ארוכות ומעברים דרך Chaturanga. אין כאן מנוחה בין תנוחות - הרגליים והכתפיים עובדות ברצף, וזה מרגיש בדיוק כמו מעגל כוח.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"},{"label":"ברכת שמש א׳","detail":"3 סבבים"}]'::jsonb, '[{"label":"חימום","detail":"5 סבבים בקצב","items":[{"label":"Tadasana","detail":"הר, 3 נשימות"},{"label":"Urdhva Hastasana","detail":"הושטה מעלה"},{"label":"Uttanasana","detail":"כיפוף קדימה"},{"label":"Ardha Uttanasana","detail":"חצי הרמה"},{"label":"Chaturanga","detail":"הנמכה מבוקרת"},{"label":"Urdhva Mukha Svanasana","detail":"כלב מביט מעלה"},{"label":"Adho Mukha Svanasana","detail":"כלב מביט מטה, 5 נשימות"}]},{"label":"בלוק כוח","detail":"3 סבבים לכל צד, אחזקה של 8 נשימות בכל תנוחה","items":[{"label":"Utkatasana","detail":"כיסא"},{"label":"Virabhadrasana III","detail":"לוחם ג׳"},{"label":"Chaturanga Hold","detail":"אחזקה נמוכה, 20 שניות"},{"label":"Phalakasana","detail":"פלאנק, 45 שניות"},{"label":"Vasisthasana","detail":"פלאנק צד, 30 שניות"}]},{"label":"שיאים","detail":"3 ניסיונות בכל תנוחה","items":[{"label":"Bakasana","detail":"עורב"},{"label":"Adho Mukha Vrksasana","detail":"עמידת ידיים בקיר, 30 שניות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"ברכיים ב-Chaturanga, דילוג על העורב."},{"level":"intermediate","detail":"לפי הפרוטוקול, עורב עם מדרגה."},{"level":"advanced","detail":"לפי הפרוטוקול, אחזקות ארוכות יותר."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '6d447107-662f-4199-9b9b-c625d69aa483'::uuid, 'power-yoga-core', 'פאוור יוגה: ליבה',
    'רצף שמתמקד במרכז.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    40, null,
    array['mat']::text[], 'הליבה עובדת בכל תנוחה, אבל כאן היא במרכז. מעברים איטיים בכוונה - מעבר איטי דורש פי כמה יותר בקרה ממעבר מהיר.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"}]'::jsonb, '[{"label":"חימום","detail":"4 סבבים","items":[{"label":"Tadasana","detail":"הר, 3 נשימות"},{"label":"Urdhva Hastasana","detail":"הושטה מעלה"},{"label":"Uttanasana","detail":"כיפוף קדימה"},{"label":"Ardha Uttanasana","detail":"חצי הרמה"},{"label":"Chaturanga","detail":"הנמכה מבוקרת"},{"label":"Urdhva Mukha Svanasana","detail":"כלב מביט מעלה"},{"label":"Adho Mukha Svanasana","detail":"כלב מביט מטה, 5 נשימות"}]},{"label":"ליבה","detail":"3 סבבים","items":[{"label":"Phalakasana","detail":"פלאנק, 45 שניות"},{"label":"Vasisthasana","detail":"פלאנק צד, 30 שניות לכל צד"},{"label":"Navasana","detail":"סירה, 45 שניות"},{"label":"Ardha Navasana","detail":"חצי סירה, 30 שניות"},{"label":"Knee-to-Nose מכלב מביט מטה","detail":"10 לכל צד"}]},{"label":"איזון","detail":"5 נשימות בכל תנוחה","items":[{"label":"Vrksasana","detail":"עץ"},{"label":"Virabhadrasana III","detail":"לוחם ג׳"}]}]'::jsonb,
    '[{"label":"Balasana","detail":"תנוחת ילד, 2 דקות"},{"label":"Supta Matsyendrasana","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"פלאנק מהברכיים, סירה עם ברכיים כפופות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים ואחזקות של דקה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '9516071f-d4e9-4949-81c8-f9651cf38f0b'::uuid, 'yin-yoga-hips', 'יין יוגה: אגן',
    'תנוחות ארוכות. בלי לזוז.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    50, null,
    array['mat']::text[], 'יין הוא ההפך מכל השאר בלוח: נשארים בכל תנוחה שלוש עד חמש דקות בשריר רפוי, ונותנים לרקמות העמוקות זמן להשתנות. אי-נוחות עמומה זה בסדר. חדות זה לא.',
    '[{"label":"ישיבה ונשימה","detail":"3 דקות"},{"label":"Cat-Cow איטי","detail":"10 חזרות"}]'::jsonb, '[{"label":"רצף יין","detail":"3-5 דקות בכל תנוחה, גוף רפוי","items":[{"label":"Butterfly","detail":"פרפר"},{"label":"Dragon","detail":"דרקון, לכל צד"},{"label":"Pigeon","detail":"יונה, לכל צד"},{"label":"Frog","detail":"צפרדע"},{"label":"Sleeping Swan","detail":"ברבור ישן, לכל צד"},{"label":"Supported Bridge","detail":"גשר נתמך"}]}]'::jsonb,
    '[{"label":"רגליים על הקיר","detail":"4 דקות"},{"label":"Savasana","detail":"5 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 דקות בכל תנוחה עם תמיכת כריות."},{"level":"intermediate","detail":"3 דקות בכל תנוחה."},{"level":"advanced","detail":"5 דקות בכל תנוחה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '438d4f6c-7e94-4b06-8728-d88a6a7bb8e0'::uuid, 'yin-yoga-spine', 'יין יוגה: גב',
    'שחרור עמוק לגב ולגב עליון.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    45, null,
    array['mat']::text[], 'רצף יין שממוקד בעמוד השדרה. מתאים במיוחד לימים שאחרי אימון כבד או אחרי יום ארוך של ישיבה.',
    '[{"label":"נשימת סרעפת בשכיבה","detail":"3 דקות"}]'::jsonb, '[{"label":"רצף יין","detail":"3-4 דקות בכל תנוחה","items":[{"label":"Caterpillar","detail":"זחל"},{"label":"Sphinx","detail":"ספינקס"},{"label":"Seal","detail":"כלב ים"},{"label":"Melting Heart","detail":"לב נמס"},{"label":"Supine Twist","detail":"פיתול בשכיבה, לכל צד"},{"label":"Child’s Pose","detail":"תנוחת ילד"}]}]'::jsonb,
    '[{"label":"Savasana","detail":"5 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 דקות בכל תנוחה, תמיכת כריות מלאה."},{"level":"intermediate","detail":"3 דקות בכל תנוחה."},{"level":"advanced","detail":"4-5 דקות בכל תנוחה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'bc328e92-6838-46bc-b350-ba70abf1ea56'::uuid, 'mobility-hips-deep', 'מוביליטי: אגן',
    'טווח תנועה פעיל, לא רק מתיחה.', 'yoga'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['mat', 'bands']::text[], 'ההבדל בין גמישות לניידות הוא שליטה. כאן לא רק נכנסים לטווח - גם מפעילים בו שרירים, וזה מה שגורם לטווח החדש להישאר.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"}]'::jsonb, '[{"label":"3 סבבים","detail":null,"items":[{"label":"90/90 Hip Switch","detail":"10 חזרות"},{"label":"Cossack Squat","detail":"8 לכל צד"},{"label":"Deep Squat Hold","detail":"60 שניות"},{"label":"Couch Stretch","detail":"90 שניות לכל צד"},{"label":"Active Pigeon Lift","detail":"8 לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"טווח חלקי עם תמיכה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת עומס קל בכל תנוחה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '88668b36-5b61-4148-be76-371448974cf2'::uuid, 'mobility-shoulders-thoracic', 'מוביליטי: כתפיים וגב עליון',
    'הכנה לעבודה מעל הראש.', 'yoga'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, null,
    array['mat', 'bands']::text[], 'מי שלא מצליח להחזיק מוט מעל הראש בלי לקשת את הגב התחתון - זה השיעור. הבעיה כמעט תמיד בגב העליון ולא בכתף עצמה.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"}]'::jsonb, '[{"label":"3 סבבים","detail":null,"items":[{"label":"Thread the Needle","detail":"45 שניות לכל צד"},{"label":"Thoracic Extension על גליל","detail":"60 שניות"},{"label":"Band Dislocates","detail":"10 חזרות איטיות"},{"label":"Wall Slides","detail":"12 חזרות"},{"label":"Prone Y-T-W","detail":"8 מכל אות"},{"label":"Puppy Pose","detail":"60 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"גומייה רחבה, טווח קטן."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"גומייה צרה וטווח מלא."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '1bb313ae-8733-4b70-a9e3-394cff417aaa'::uuid, 'mobility-ankles-and-feet', 'מוביליטי: קרסוליים',
    'החוליה שמגבילה את הסקוואט.', 'yoga'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    25, null,
    array['mat', 'bands']::text[], 'קרסול נוקשה מוציא את העקבים מהרצפה בסקוואט ומעביר את העומס לברך ולגב. עשרים דקות בשבוע כאן משנות את הסקוואט יותר מכל תיקון טכני.',
    '[{"label":"הליכה על קצות האצבעות ועל העקבים","detail":"2 דקות"},{"label":"סיבובי קרסול","detail":"15 לכל כיוון"}]'::jsonb, '[{"label":"3 סבבים","detail":null,"items":[{"label":"Knee-to-Wall","detail":"15 חזרות לכל צד"},{"label":"Deep Squat Hold עם עקבים על הרצפה","detail":"60 שניות"},{"label":"Calf Raise איטי","detail":"15 חזרות"},{"label":"Tibialis Raise","detail":"15 חזרות"},{"label":"Toe Splay ו-Short Foot","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת שוקיים בקיר","detail":"90 שניות לכל צד"},{"label":"ישיבה על העקבים","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"עקבים על צלחת, טווח קטן."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"טווח מלא עם עומס קל."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '6ffa98d7-4d8d-415d-a35c-04c9aac3a733'::uuid, 'recovery-after-leg-day', 'התאוששות אחרי יום רגליים',
    'למחרת בבוקר.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['mat']::text[], 'רצף עדין ליום שאחרי. תנועה קלה מזרימה דם לשרירים כואבים ומקצרת את זמן ההתאוששות יותר ממנוחה מוחלטת - כל עוד היא באמת קלה.',
    '[{"label":"הליכה","detail":"5 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"}]'::jsonb, '[{"label":"רצף עדין","detail":"90 שניות בכל תנוחה","items":[{"label":"Low Lunge","detail":"לאנג׳ נמוך, לכל צד"},{"label":"Half Split","detail":"חצי שפגט, לכל צד"},{"label":"Pigeon","detail":"יונה, לכל צד"},{"label":"Figure Four בשכיבה","detail":"לכל צד"},{"label":"Legs up the Wall","detail":"רגליים על הקיר, 3 דקות"},{"label":"Supine Twist","detail":"פיתול, לכל צד"}]}]'::jsonb,
    '[{"label":"Savasana","detail":"4 דקות"}]'::jsonb, '[{"level":"beginner","detail":"תמיכת כריות בכל תנוחה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"אחזקות של 2 דקות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '1e7ab6e2-2e6c-47ac-8aa0-c6f86cbff4ee'::uuid, 'recovery-breath-and-nervous-system', 'נשימה והרגעה',
    'עשרים דקות להוריד הילוך.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    20, null,
    array['mat']::text[], 'שיעור בלי כמעט תנועה. נשימה ארוכה ומווסתת מורידה דופק ולחץ - וזה משפיע גם על איכות האימון למחרת, לא רק על איך שמרגישים עכשיו.',
    '[{"label":"ישיבה נוחה, עיניים עצומות","detail":"2 דקות"}]'::jsonb, '[{"label":"תרגול נשימה","detail":"כל תרגיל 3-4 דקות","items":[{"label":"נשימת סרעפת","detail":"יד על הבטן"},{"label":"נשימת קופסה","detail":"4-4-4-4"},{"label":"נשימה 4-7-8","detail":"נשיפה ארוכה"},{"label":"Nadi Shodhana","detail":"נשימה מתחלפת"}]},{"label":"תנוחות תמיכה","detail":null,"items":[{"label":"Supported Child’s Pose","detail":"3 דקות"},{"label":"Legs up the Wall","detail":"4 דקות"}]}]'::jsonb,
    '[{"label":"Savasana","detail":"5 דקות"}]'::jsonb, '[{"level":"beginner","detail":"רק נשימת סרעפת ונשימת קופסה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת של 5 דקות ישיבה שקטה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '933c5989-d50d-4f47-9ec3-d1bbcf39a51d'::uuid, 'yoga-balance-and-focus', 'שיווי משקל וריכוז',
    'עומדים על רגל אחת ונשארים שם.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['mat']::text[], 'שיווי משקל הוא מיומנות שנשחקת מהר כשלא מתרגלים אותה. השיעור בונה אותה בשלבים, מעמידה יציבה ועד תנוחות שדורשות ריכוז מלא.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"},{"label":"ברכת שמש א׳","detail":"3 סבבים"}]'::jsonb, '[{"label":"בסיס","detail":"5 נשימות בכל תנוחה, לכל צד","items":[{"label":"Vrksasana","detail":"עץ"},{"label":"Utkatasana","detail":"כיסא"},{"label":"Garudasana","detail":"נשר"}]},{"label":"מתקדם","detail":"5 נשימות, לכל צד","items":[{"label":"Virabhadrasana III","detail":"לוחם ג׳"},{"label":"Ardha Chandrasana","detail":"חצי ירח"},{"label":"Natarajasana","detail":"רקדן"},{"label":"Utthita Hasta Padangusthasana","detail":"אחיזת בוהן בעמידה"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"יד על הקיר, כף רגל על השוק ולא על הירך."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"עיניים עצומות בתנוחות הבסיס."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '10abef65-8dec-40f7-80f1-ee43b9fcd471'::uuid, 'yoga-backbends-gentle', 'פתיחת חזה',
    'כיפופים לאחור, בהדרגה.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['mat']::text[], 'כיפוף לאחור מתחיל בגב העליון, לא בגב התחתון. אם מרגישים לחץ בגב התחתון - הגב העליון לא פתוח מספיק, וכדאי לחזור לתנוחה קודמת.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"},{"label":"Thoracic Extension על גליל","detail":"90 שניות"}]'::jsonb, '[{"label":"הדרגה","detail":"5 נשימות בכל תנוחה, 2 סבבים","items":[{"label":"Sphinx","detail":"ספינקס"},{"label":"Bhujangasana","detail":"קוברה"},{"label":"Salabhasana","detail":"ארבה"},{"label":"Dhanurasana","detail":"קשת"},{"label":"Ustrasana","detail":"גמל"},{"label":"Setu Bandha","detail":"גשר"}]},{"label":"נטרול","detail":null,"items":[{"label":"Balasana","detail":"תנוחת ילד, 2 דקות"},{"label":"Apanasana","detail":"ברכיים לחזה, 60 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על גליל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"ספינקס וקוברה בלבד."},{"level":"intermediate","detail":"עד גמל עם ידיים על האגן."},{"level":"advanced","detail":"כולל Urdhva Dhanurasana לגלגל מלא."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '47421d8b-d0d7-4435-9d29-fb69be89e66f'::uuid, 'yoga-twists-and-digestion', 'פיתולים',
    'סיבוב מבוקר לעמוד השדרה.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['mat']::text[], 'פיתול טוב מתחיל בהתארכות. שאפו והתארכו, ורק בנשיפה תסתובבו - אחרת הסיבוב יוצא מהגב התחתון במקום מהחלק האמצעי.',
    '[{"label":"ישיבה ונשימה","detail":"2 דקות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"סיבובי כתף ופרק כף יד","detail":"10 לכל כיוון"},{"label":"כלב מביט מטה, כיפוף ברכיים לסירוגין","detail":"60 שניות"}]'::jsonb, '[{"label":"רצף פיתולים","detail":"60-90 שניות בכל תנוחה, לכל צד","items":[{"label":"Ardha Matsyendrasana","detail":"חצי מלך הדגים"},{"label":"Parivrtta Utkatasana","detail":"כיסא מסובב"},{"label":"Parivrtta Trikonasana","detail":"משולש מסובב"},{"label":"Thread the Needle","detail":"חוט המחט"},{"label":"Supta Matsyendrasana","detail":"פיתול בשכיבה"}]}]'::jsonb,
    '[{"label":"Balasana","detail":"2 דקות"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"טווח קטן, יד על הרצפה לתמיכה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"טווח מלא, אחזקות של 2 דקות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '1feb0d5c-78cd-43c2-bd60-95feb1ccc3c8'::uuid, 'yoga-express-fifteen', 'יוגה אקספרס',
    'חמש עשרה דקות, בלי תירוצים.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    15, null,
    array['mat']::text[], 'הרצף הקצר ביותר בלוח. מספיק כדי לפתוח את הגוף בבוקר או להוריד מתח בערב, וקצר מספיק כדי שלא תדלגו עליו.',
    '[{"label":"Cat-Cow","detail":"8 חזרות"}]'::jsonb, '[{"label":"ברכת שמש","detail":"3 סבבים","items":[{"label":"Tadasana","detail":"הר, 3 נשימות"},{"label":"Urdhva Hastasana","detail":"הושטה מעלה"},{"label":"Uttanasana","detail":"כיפוף קדימה"},{"label":"Ardha Uttanasana","detail":"חצי הרמה"},{"label":"Chaturanga","detail":"הנמכה מבוקרת"},{"label":"Urdhva Mukha Svanasana","detail":"כלב מביט מעלה"},{"label":"Adho Mukha Svanasana","detail":"כלב מביט מטה, 5 נשימות"}]},{"label":"סיום","detail":"60 שניות בכל תנוחה","items":[{"label":"Low Lunge","detail":"לכל צד"},{"label":"Uttanasana","detail":"כיפוף קדימה"},{"label":"Supine Twist","detail":"לכל צד"}]}]'::jsonb,
    '[{"label":"Savasana","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 ברכות שמש, ברכיים על המזרן."},{"level":"intermediate","detail":"3 ברכות שמש."},{"level":"advanced","detail":"5 ברכות שמש בקצב."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'b019c285-a38e-4b33-908e-31ef1b164ce1'::uuid, 'yoga-for-runners', 'יוגה לרצים',
    'כל מה שהריצה מקצרת.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    35, null,
    array['mat']::text[], 'ריצה מקצרת כופפי ירך, מיתרי ברך ושוקיים ומחלישה את הישבן. השיעור נוגע בדיוק בארבעה האלה, בסדר הזה.',
    '[{"label":"הליכה","detail":"3 דקות"},{"label":"סיבובי ירך וקרסול","detail":"2 דקות"}]'::jsonb, '[{"label":"פתיחה","detail":"90 שניות בכל תנוחה, לכל צד","items":[{"label":"Low Lunge","detail":"כופפי ירך"},{"label":"Half Split","detail":"מיתרי ברך"},{"label":"Downward Dog עם כיפוף ברכיים לסירוגין","detail":"שוקיים"},{"label":"Figure Four","detail":"ישבן"}]},{"label":"חיזוק","detail":"2 סבבים","items":[{"label":"Glute Bridge","detail":"15 חזרות"},{"label":"Single Leg Balance","detail":"45 שניות לכל צד"},{"label":"Calf Raise","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"גלגול פוליה בגב עליון","detail":"60 שניות"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"תמיכת כריות, 60 שניות בכל תנוחה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"2 דקות בכל תנוחה, 3 סבבי חיזוק."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'd67952f1-5dcb-4253-ad50-3d27b5ac16a5'::uuid, 'yoga-restorative-long', 'יוגה משקמת',
    'התנוחות עושות את העבודה, לא אתם.', 'yoga'::public.workout_category,
    'flow'::public.workout_format,
    'beginner'::public.difficulty_level,
    55, null,
    array['mat']::text[], 'השיעור הכי קל בלוח, ולפעמים הכי חשוב. כל תנוחה נתמכת בכריות או בשמיכות כך שאפשר להישאר בה חמש דקות בלי שום מאמץ שרירי. מתאים לשבוע עמוס או לימי מחלה קלים.',
    '[{"label":"שכיבה ונשימה שקטה","detail":"3 דקות"}]'::jsonb, '[{"label":"רצף נתמך","detail":"5 דקות בכל תנוחה, עם כרית או שמיכה מקופלת","items":[{"label":"Supported Child’s Pose","detail":"תנוחת ילד נתמכת"},{"label":"Supported Bridge","detail":"גשר נתמך"},{"label":"Reclined Butterfly","detail":"פרפר בשכיבה"},{"label":"Supported Twist","detail":"פיתול נתמך, לכל צד"},{"label":"Legs up the Wall","detail":"רגליים על הקיר"}]}]'::jsonb,
    '[{"label":"Savasana עם שמיכה","detail":"8 דקות"}]'::jsonb, '[{"level":"beginner","detail":"3 דקות בכל תנוחה."},{"level":"intermediate","detail":"5 דקות בכל תנוחה."},{"level":"advanced","detail":"7 דקות בכל תנוחה."}]'::jsonb,
    'completion'::public.score_type, null
  )
  ) as v (
    id, slug, title, subtitle, category, format, difficulty,
    duration_minutes, time_cap_minutes, equipment, description,
    warmup, structure, cooldown, scaling, score_type, score_label
  )
  on conflict (id) do update set
    slug = excluded.slug,
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
    score_label = excluded.score_label;

  get diagnostics v_count = row_count;
  return v_count;
end;
$install$;

revoke all on function public.install_workout_library() from public;

create or replace function public.install_workout_library_on_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $trigger$
begin
  perform public.install_workout_library();
  return new;
end;
$trigger$;

drop trigger if exists organizations_install_workouts on public.organizations;
create trigger organizations_install_workouts
  after insert on public.organizations
  for each row execute function public.install_workout_library_on_org();

-- Covers a database that already had a club before this migration ran.
select public.install_workout_library();
