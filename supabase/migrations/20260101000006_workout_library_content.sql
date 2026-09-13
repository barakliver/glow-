-- =============================================================================
-- GLoW - workout library content
--
-- GENERATED FILE - do not edit by hand.
-- Source: src/lib/data/workouts/*.ts
-- Rebuild with: npm run build:workout-sql
--
-- 127 workouts: 49 crossfit, 39 functional, 21 pilates, 18 yoga.
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
    60, 10,
    array['barbell', 'pullup_bar', 'treadmill']::text[], 'שעה שנבנית לשלוש דקות. הכוח היום הוא פרונט סקוואט כבד, והמטקון הוא תראסטרים ומתח בסבבים יורדים. הפיתוי לצאת חזק מדי במטקון אמיתי - חלקו את הסט של 21 לשניים מראש.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Front Squat","detail":"3 חזרות, עולים בכל סט"}]},{"label":"מטקון","detail":"21-15-9 חזרות, למהירות","items":[{"label":"Thrusters","detail":"מוט"},{"label":"Pull-ups","detail":"משיכות מתח"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"תראסטר עם משקולות יד או מוט ריק, משיכות בגומייה. 15-12-9 חזרות."},{"level":"intermediate","detail":"מוט במשקל שמאפשר סט רצוף של 9, משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול, בלי לרדת מהמוט בסט של 21."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '59d34626-9536-4258-9cb6-7d7c0692b7ba'::uuid, 'cindy', 'Cindy',
    'עשרים דקות של משקל גוף בקצב שאפשר להחזיק.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['pullup_bar', 'barbell', 'treadmill']::text[], 'סבב פשוט שחוזר על עצמו עשרים דקות. מי שמוצא מקצב יציב בדקה השלישית מסיים עם עוד ארבעה סבבים ממי שיצא מהר. לפניו בלוק כוח על הדדליפט, כדי שהשעה תבנה משהו ולא רק תשרוף.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Deadlift","detail":"5 חזרות"}]},{"label":"מטקון","detail":"AMRAP 20 דקות - כמה שיותר סבבים מלאים","items":[{"label":"Pull-ups","detail":"5 חזרות"},{"label":"Push-ups","detail":"10 חזרות"},{"label":"Air Squats","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משיכות בגומייה, שכיבות על הספסל. AMRAP 15 דקות."},{"level":"intermediate","detail":"משיכות בקפיצה או 3 משיכות נקיות בסבב."},{"level":"advanced","detail":"לפי הפרוטוקול. 20 סבבים ומעלה זו תוצאה מצוינת."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '70b6b9ed-1a66-4563-86b4-46475cd2fd91'::uuid, 'helen', 'Helen',
    'ריצה, קטלבל ומתח - שלושה סבבים שמלמדים לנשום.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 15,
    array['kettlebell', 'pullup_bar', 'treadmill', 'barbell']::text[], 'המבחן האמיתי הוא המעבר מההליכון לקטלבל. תכננו מראש: לרדת, לקחת אוויר שתי שניות, ולעשות 21 סווינג ברצף אחד. הכוח לפני כן הוא לחיצת כתפיים, שלא מתחרה בסווינג.',
    '[{"label":"הליכון","detail":"600 מטר קל"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת ירך בכריעה","detail":"45 שניות לכל צד"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Strict Press","detail":"לחיצה נקייה מעל הראש"}]},{"label":"מטקון","detail":"3 סבבים למהירות","items":[{"label":"הליכון","detail":"400 מטר"},{"label":"Kettlebell Swings","detail":"21 חזרות"},{"label":"Pull-ups","detail":"12 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"300 מטר, קטלבל קל, משיכות בגומייה."},{"level":"intermediate","detail":"קטלבל בינוני, משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-9 דקות זה סף מתקדם."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '9c487a6b-8f91-4ee9-87f3-fc3d9caf0d9f'::uuid, 'grace', 'Grace',
    'שלושים קלין אנד ג׳רק. כלום להסתתר מאחוריו.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 12,
    array['barbell', 'treadmill']::text[], 'תרגיל אחד, שלושים פעם. בחרו אסטרטגיה לפני שמתחילים: סטים קטנים עם מנוחה קצובה כמעט תמיד מנצחים ניסיון לרוץ ברצף. הכוח הוא עבודת טכניקה על אותה תנועה, במשקל נוח.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"EMOM 8 דקות, משקל נוח שמאפשר תנועה מהירה ונקייה","items":[{"label":"Power Clean","detail":"2 חזרות בתחילת כל דקה"}]},{"label":"מטקון","detail":"30 חזרות, למהירות. המשקל שלכם - כבד מספיק שסט של 5 מרגיש עבודה.","items":[{"label":"Clean and Jerk","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק או משקולות יד. התמקדו בטכניקה, לא בשעון."},{"level":"intermediate","detail":"משקל שמאפשר סטים של 3 עם 10 שניות מנוחה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-3 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '2b0cebd3-c016-4979-8ac1-e5d5f152856f'::uuid, 'isabel', 'Isabel',
    'שלושים סנאץ׳. מהירות מול טכניקה.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 10,
    array['barbell', 'treadmill']::text[], 'סנאץ׳ הוא התרגיל שהכי מהר מאבד צורה בעייפות. אם המוט מתחיל לעלות קדימה במקום צמוד לגוף - עצרו, נשמו, והתחילו סט חדש. הכוח לפניו הוא אוברהד סקוואט, שמכין בדיוק את הקבלה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"},{"label":"סנאץ׳ עם מוט ריק","detail":"5 חזרות, 3 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Overhead Squat","detail":"3 חזרות"}]},{"label":"מטקון","detail":"30 חזרות, למהירות","items":[{"label":"Snatch","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"Power snatch עם מוט ריק, אוברהד סקוואט עם מקל."},{"level":"intermediate","detail":"משקל שמאפשר סטים של 3."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '1361fe04-b98a-4b62-85cf-dc0e0e357980'::uuid, 'diane', 'Diane',
    'דדליפט וכפיפות ידיים בעמידת ידיים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 12,
    array['barbell', 'treadmill', 'mat']::text[], 'שילוב של משיכה כבדה ודחיפה הפוכה. הדדליפט מתיש את הגב התחתון בדיוק לפני שצריך להחזיק את הגוף הפוך - שמרו על ליבה נעולה בשני התרגילים.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט","detail":"8 חזרות, 2 סבבים"},{"label":"עמידת ידיים בקיר","detail":"30 שניות החזקה, 3 סבבים"},{"label":"כפיפות ידיים בפייק","detail":"8 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 6, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Deadlift","detail":"6 חזרות"}]},{"label":"מטקון","detail":"21-15-9 חזרות, למהירות","items":[{"label":"Deadlift","detail":"משקל בינוני שמאפשר סט של 9"},{"label":"Handstand Push-ups","detail":null}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"דדליפט קל, דחיקות פייק מהרצפה. 15-12-9."},{"level":"intermediate","detail":"כפיפות ידיים בעמידת ידיים עם מדרגה או ספסל."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-5 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '3e69cc7b-f8d0-4065-867f-9ae9ac0671ef'::uuid, 'elizabeth', 'Elizabeth',
    'קלין וטבילות. כתפיים שעובדות פעמיים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 15,
    array['barbell', 'bench', 'treadmill']::text[], 'הקלין מעייף את הרגליים והכתפיים, והטבילות דורשות בדיוק את הכתפיים האלה. שמרו על סטים קטנים בטבילות מהסבב הראשון.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"},{"label":"טבילות על הספסל","detail":"8 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Squat Clean","detail":"3 חזרות"}]},{"label":"מטקון","detail":"21-15-9 חזרות, למהירות","items":[{"label":"Squat Clean","detail":"משקל שמאפשר סט רצוף של 9"},{"label":"Bench Dips","detail":"טבילות על הספסל"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"קלין עם משקולות יד, טבילות עם רגליים על הרצפה. 15-12-9."},{"level":"intermediate","detail":"לפי הפרוטוקול, טבילות עם רגליים מכופפות."},{"level":"advanced","detail":"לפי הפרוטוקול, רגליים מורמות על ספסל שני."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '9b7421f2-a24d-4f4c-a9be-dfe8d9cb7f9e'::uuid, 'annie', 'Annie',
    'בטן ורגליים. מהיר, פשוט, שורף.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 14,
    array['mat', 'treadmill', 'hip_thrust', 'barbell']::text[], 'סבבים יורדים של קפיצות פיצול וכפיפות בטן. אין כאן ציוד ואין לאן לברוח - רק קצב. הכוח לפני כן הוא היפ תראסט, שנותן לישבן את מה שהמטקון לא ייתן לו.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"קפיצות פיצול קלות","detail":"20 חזרות"},{"label":"כפיפות בטן איטיות","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 8, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Hip Thrust","detail":"8 חזרות, עצירה של שנייה למעלה"}]},{"label":"מטקון","detail":"50-40-30-20-10 חזרות, למהירות","items":[{"label":"Split Jumps","detail":"קפיצות פיצול"},{"label":"Sit-ups","detail":"כפיפות בטן"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"מכרעים לסירוגין בלי קפיצה, 30-25-20-15-10."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-8 דקות זה סף טוב."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '841f512e-f653-42dc-93de-9e803d19f9d2'::uuid, 'karen', 'Karen',
    'מאה וחמישים תראסטרים. זהו. זה כל המטקון.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 18,
    array['dumbbell', 'treadmill', 'barbell']::text[], 'האימון שנשבר בראש לפני שהוא נשבר ברגליים. חלקו מראש לעשרה סטים של חמישה עשר עם חמש שניות מנוחה - זה כמעט תמיד מהיר יותר מלנסות סט של 40 בהתחלה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תראסטר עם משקולות קלות","detail":"10 חזרות, 3 סבבים"},{"label":"פתיחת קרסול בקיר","detail":"45 שניות לכל צד"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Back Squat","detail":"5 חזרות"}]},{"label":"מטקון","detail":"150 חזרות, למהירות. משקולות קלות שאפשר להחזיק סט של 20.","items":[{"label":"Dumbbell Thrusters","detail":"150 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"100 חזרות עם משקולות קלות מאוד."},{"level":"intermediate","detail":"150 חזרות, משקולות בינוניות."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-8 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'f685e88e-4494-42b8-898f-234c64410112'::uuid, 'barbara', 'Barbara',
    'חמישה סבבים עם שלוש דקות מנוחה מלאות ביניהם.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['pullup_bar', 'mat', 'treadmill']::text[], 'האימון היחיד ברשימה שבו המנוחה כתובה בפרוטוקול. רשמו את זמן כל סבב בנפרד - הפער בין הסבב הראשון לחמישי הוא המדד האמיתי כאן. אין בלוק כוח: חמישה סבבים כאלה הם השעה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"נכלל במטקון - הנפח עצמו הוא העבודה","items":[{"label":"אין בלוק כוח נפרד היום","detail":null}]},{"label":"מטקון","detail":"5 סבבים, שלוש דקות מנוחה מלאות אחרי כל סבב","items":[{"label":"Pull-ups","detail":"20 חזרות"},{"label":"Push-ups","detail":"30 חזרות"},{"label":"Sit-ups","detail":"40 חזרות"},{"label":"Air Squats","detail":"50 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, חצי מהחזרות, משיכות בגומייה."},{"level":"intermediate","detail":"5 סבבים, 10 משיכות במקום 20."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, 'זמן כולל כולל מנוחות'
  ),
  (
    'b1491171-a59e-4ddb-9fb0-e8f7acce23bd'::uuid, 'angie', 'Angie',
    'מאה מכל דבר. סבלנות לפני מהירות.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 30,
    array['pullup_bar', 'mat', 'treadmill']::text[], 'מסיימים כל תרגיל לגמרי לפני שעוברים לבא. מאה משיכות זה החלק שמכריע - חלקו אותן לעשרים סטים של חמש מהרגע הראשון.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"3 סטים, מנוחה מלאה. עבודת מתח נקייה לפני הנפח.","items":[{"label":"Strict Pull-ups","detail":"מקסימום חזרות פחות שתיים"}]},{"label":"מטקון","detail":"לפי הסדר, למהירות","items":[{"label":"Pull-ups","detail":"100 חזרות"},{"label":"Push-ups","detail":"100 חזרות"},{"label":"Sit-ups","detail":"100 חזרות"},{"label":"Air Squats","detail":"100 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"50 מכל תרגיל, משיכות בגומייה."},{"level":"intermediate","detail":"75 מכל תרגיל."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '55d6fdc6-c82b-4124-b0b9-9998181ec2da'::uuid, 'nancy', 'Nancy',
    'ריצה וסקוואט מעל הראש. איזון תחת עייפות.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 20,
    array['barbell', 'treadmill']::text[], 'אוברהד סקוואט אחרי 400 מטר הוא מבחן ניידות כתף וקרסול לפני שהוא מבחן כוח. אם הידיים נופלות קדימה, הורידו משקל - כאן זה לא פשרה, זה בטיחות.',
    '[{"label":"הליכון","detail":"600 מטר קל"},{"label":"מוט ריק: סנאץ׳ בלאנס","detail":"5 חזרות, 3 סבבים"},{"label":"אוברהד סקוואט עם מקל","detail":"10 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון וכתף","detail":"2 דקות"}]'::jsonb, '[{"label":"כוח","detail":"בניית טכניקה: 5 סטים של 5, משקל שמאפשר ידיים נעולות לכל אורך הסט","items":[{"label":"Overhead Squat","detail":"5 חזרות"}]},{"label":"מטקון","detail":"5 סבבים למהירות","items":[{"label":"הליכון","detail":"400 מטר"},{"label":"Overhead Squat","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"200 מטר, אוברהד סקוואט עם מוט ריק או מקל."},{"level":"intermediate","detail":"400 מטר, משקל קל."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'fef17984-ae72-4306-ba75-d71a42de4018'::uuid, 'jackie', 'Jackie',
    'ריצה, מוט ריק ומשיכות. מבחן קצב קלאסי.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 15,
    array['treadmill', 'barbell', 'pullup_bar']::text[], 'הריצה צריכה להיות מהירה אבל לא על חשבון הידיים - מי שרץ את הקילומטר בכל הכוח מגיע למוט בלי אחיזה. כוונו לקצב שאפשר לדבר בו בקושי.',
    '[{"label":"הליכון","detail":"800 מטר בקצב עולה"},{"label":"מוט ריק: תראסטרים","detail":"10 חזרות, 3 סבבים"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 8, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Bent-over Row","detail":"8 חזרות"}]},{"label":"מטקון","detail":"לפי הסדר, למהירות","items":[{"label":"הליכון","detail":"1000 מטר"},{"label":"Thrusters","detail":"50 חזרות, מוט ריק"},{"label":"Pull-ups","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"750 מטר, 35 תראסטרים, משיכות בגומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול עם משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-7 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'ab320c6c-21be-4b2a-bb89-0316e2e61a58'::uuid, 'kelly', 'Kelly',
    'חמישה סבבים ארוכים. אימון סבולת אמיתי.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 35,
    array['bench', 'dumbbell', 'treadmill', 'barbell']::text[], 'אימון ארוך שדורש קצב אחיד. אל תרוצו את ה-400 הראשון מהר - הפער יתגלה בסבב השלישי, לא בראשון. בלוק כוח קצר לפני, כדי שהרגליים יגיעו חמות ולא שרופות.',
    '[{"label":"הליכון","detail":"600 מטר קל"},{"label":"עליות על הספסל","detail":"10 חזרות לכל רגל, 2 סבבים"},{"label":"תראסטר קל","detail":"10 חזרות, 2 סבבים"},{"label":"פתיחת קרסול וירך","detail":"2 דקות"}]'::jsonb, '[{"label":"כוח","detail":"3 סטים של 10 לכל רגל, משקל שמאפשר עלייה מבוקרת בלי דחיפה מהרגל האחורית","items":[{"label":"Bench Step-ups","detail":"10 חזרות לכל רגל"}]},{"label":"מטקון","detail":"5 סבבים למהירות","items":[{"label":"הליכון","detail":"400 מטר"},{"label":"Bench Step-ups","detail":"30 חזרות"},{"label":"Dumbbell Thrusters","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, 200 מטר, 20 חזרות מכל תרגיל."},{"level":"intermediate","detail":"4 סבבים לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'd97b00f6-3d74-45b0-86de-96c4c561747a'::uuid, 'mary', 'Mary',
    'עשרים דקות של ג׳ימנסטיקס טהור.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, null,
    array['pullup_bar', 'bench', 'treadmill']::text[], 'אימון מיומנות לפני שהוא אימון כושר. אם אחד משלושת התרגילים עדיין לא בידיים - זה בדיוק האימון שבו כדאי לתרגל אותו בגרסה מותאמת, ולא לדלג עליו.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"עמידת ידיים בקיר","detail":"30 שניות, 3 סבבים"},{"label":"סקוואט על רגל אחת לספסל","detail":"5 לכל צד, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"מיומנות: 5 סטים, מנוחה מלאה בין סטים","items":[{"label":"Handstand Hold","detail":"45 שניות בקיר"},{"label":"Strict Pull-ups","detail":"3-5 חזרות נקיות"}]},{"label":"מטקון","detail":"AMRAP 20 דקות","items":[{"label":"Handstand Push-ups","detail":"5 חזרות"},{"label":"Pistols","detail":"10 חזרות, 5 לכל רגל"},{"label":"Pull-ups","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"דחיקות פייק, סקוואט לספסל על רגל אחת, משיכות בגומייה."},{"level":"intermediate","detail":"עמידת ידיים עם מדרגה, פיסטול עם תמיכה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '2dbf55ce-f27e-41d8-b3c1-90443ba6ec9a'::uuid, 'chelsea', 'Chelsea',
    'סבב בתחילת כל דקה, שלושים דקות.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, null,
    array['pullup_bar', 'treadmill', 'barbell']::text[], 'Cindy בפורמט EMOM. הקושי הוא שהמנוחה מתקצרת מעצמה ככל שהחזרות מאטות. רשמו כמה דקות השלמתם - לרדת מהקצב בדקה 22 זו תוצאה טובה, לא כישלון.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Push Press","detail":"5 חזרות"}]},{"label":"מטקון","detail":"EMOM 30 דקות - בתחילת כל דקה, סבב שלם","items":[{"label":"Pull-ups","detail":"5 חזרות"},{"label":"Push-ups","detail":"10 חזרות"},{"label":"Air Squats","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"20 דקות, 3 משיכות בגומייה, 6 שכיבות, 9 סקוואטים."},{"level":"intermediate","detail":"30 דקות עם משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'completion'::public.score_type, 'כמה דקות הושלמו במלואן'
  ),
  (
    '036be40f-4e78-48ed-88ee-7151a05cbaa3'::uuid, 'murph', 'Murph',
    'האימון הארוך ביותר ברשימה. בונים אליו.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 50,
    array['pullup_bar', 'treadmill', 'mat']::text[], 'אימון Hero קלאסי, בגרסה שנכנסת לשעה. החלוקה המקובלת של החלק האמצעי היא עשרים סבבים של 5 משיכות, 10 שכיבות ו-15 סקוואטים - היא כמעט תמיד מהירה ובטוחה יותר מלעשות כל תרגיל ברצף. אל תנסו אותו בלי בסיס של כמה חודשי אימון.',
    '[{"label":"הליכון","detail":"5 דקות בקצב עולה"},{"label":"מתיחות דינמיות לירך ולכתף","detail":"3 דקות"},{"label":"סבב חימום: 5 משיכות, 10 שכיבות, 15 סקוואטים","detail":"2 סבבים בקצב קל"}]'::jsonb, '[{"label":"כוח","detail":"אין בלוק כוח - החלק האמצעי הוא הנפח של השבוע","items":[{"label":"שומרים הכול למטקון","detail":null}]},{"label":"מטקון","detail":"לפי הסדר. החלק האמצעי בחלוקה של 20 סבבים: 5 / 10 / 15","items":[{"label":"הליכון","detail":"1600 מטר"},{"label":"Pull-ups","detail":"100 חזרות"},{"label":"Push-ups","detail":"200 חזרות"},{"label":"Air Squats","detail":"300 חזרות"},{"label":"הליכון","detail":"1600 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"חצי Murph: 800 מטר, 50/100/150, משיכות בגומייה."},{"level":"intermediate","detail":"Murph מלא בחלוקה של 20 סבבים."},{"level":"advanced","detail":"לפי הפרוטוקול, ברצף."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '4d1cb705-e3de-4273-9b0c-c3ffb095f8e1'::uuid, 'dt', 'DT',
    'חמישה סבבים עם מוט אחד ושלושה תרגילים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 15,
    array['barbell', 'treadmill']::text[], 'לא מורידים את המוט בין התרגילים אם אפשר. הטריק הוא לעבור מדדליפט להאנג קלין בלי להניח - זה חוסך שניות יקרות בכל סבב. בחרו משקל שמאפשר את זה, לא את המקסימום.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"},{"label":"האנג קלין עם מוט ריק","detail":"5 חזרות, 3 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Push Jerk","detail":"3 חזרות"}]},{"label":"מטקון","detail":"5 סבבים למהירות, אותו משקל לאורך כל האימון","items":[{"label":"Deadlift","detail":"12 חזרות"},{"label":"Hang Power Clean","detail":"9 חזרות"},{"label":"Push Jerk","detail":"6 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקולות יד או מוט ריק."},{"level":"intermediate","detail":"משקל שמאפשר את 9 הקלינים ברצף בסבב הראשון."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '16de777d-5d15-4da7-9bc0-b28b9220c421'::uuid, 'randy', 'Randy',
    '75 פאוור סנאץ׳ ברצף אחד.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 10,
    array['barbell', 'treadmill']::text[], 'משקל קל, הרבה חזרות. האויב הוא האחיזה והנשימה, לא הרגליים. סטים של 15 עם 10 שניות מנוחה עובדים טוב לרוב האנשים.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"},{"label":"פאוור סנאץ׳ עם מוט ריק","detail":"10 חזרות, 3 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Sumo Deadlift High Pull","detail":"5 חזרות"}]},{"label":"מטקון","detail":"75 חזרות, למהירות. קל - כזה שאפשר לעשות בו 20 ברצף בסט הראשון.","items":[{"label":"Power Snatch","detail":"75 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"50 חזרות עם מוט ריק."},{"level":"intermediate","detail":"75 חזרות במשקל קל."},{"level":"advanced","detail":"לפי הפרוטוקול. מתחת ל-5 דקות זה סף גבוה."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'b24c12db-0b6a-489d-9279-b021cecd05df'::uuid, 'chad', 'Chad',
    'אלף עליות על הספסל. אימון ראש.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 55,
    array['bench', 'treadmill']::text[], 'תרגיל אחד, אלף פעם, בקצב הליכה. זה אימון סבולת ארוך - שתו מים, ורדו מהספסל במקום לקפוץ ממנו כדי לשמור על הברכיים. אם לא נכנסים בשעה, עוצרים איפה שהגעתם ורושמים כמה עשיתם.',
    '[{"label":"הליכון","detail":"5 דקות"},{"label":"עליות על הספסל","detail":"20 חזרות, 2 סבבים"},{"label":"מתיחת שוקיים וארבע ראשי","detail":"2 דקות"}]'::jsonb, '[{"label":"כוח","detail":"אין בלוק כוח - אלף חזרות הן הנפח","items":[{"label":"שומרים הכול למטקון","detail":null}]},{"label":"מטקון","detail":"1000 חזרות, למהירות","items":[{"label":"Bench Step-ups","detail":"1000 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"300 עליות, בקצב הליכה."},{"level":"intermediate","detail":"500 עליות. שתו מים באמצע."},{"level":"advanced","detail":"1000 עליות, ובתרמיל למי שמורגל."}]'::jsonb,
    'reps'::public.score_type, 'כמה חזרות הושלמו'
  ),
  (
    '593f5c2b-f7e2-4f1d-aefd-d8f19ca4e3ef'::uuid, 'jt', 'JT',
    'שלוש וריאציות דחיפה בסבבים יורדים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 20,
    array['bench', 'treadmill', 'barbell', 'mat']::text[], 'אימון דחיפה טהור בלי שום משקל במטקון. הכתפיים נגמרות מהר, ולכן מומלץ להתחיל בסטים קטנים מדי מאשר לגלות באמצע שנתקעתם.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"עמידת ידיים בקיר","detail":"30 שניות, 3 סבבים"},{"label":"שכיבות סמיכה איטיות","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Bench Press","detail":"5 חזרות"}]},{"label":"מטקון","detail":"21-15-9 חזרות, למהירות","items":[{"label":"Handstand Push-ups","detail":null},{"label":"Bench Dips","detail":"טבילות על הספסל"},{"label":"Push-ups","detail":"שכיבות סמיכה"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"12-9-6, דחיקות פייק, טבילות עם רגליים על הרצפה, שכיבות על הספסל."},{"level":"intermediate","detail":"15-12-9 עם מדרגה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'da70b7f7-e815-48a5-887a-90912c6da8b3'::uuid, 'jerry', 'Jerry',
    'ריצה ארוכה בשלושה מקטעים.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 32,
    array['treadmill', 'kettlebell']::text[], 'אימון סבולת נקי. המקטע האמצעי בעלייה מפתה לדחוף - החזיקו קצב שמאפשר לרוץ את הקילומטר האחרון בלי לקרוס.',
    '[{"label":"הליכון","detail":"800 מטר קל"},{"label":"מתיחות דינמיות","detail":"2 דקות"},{"label":"האצות","detail":"3 × 30 שניות בקצב עולה"}]'::jsonb, '[{"label":"כוח","detail":"3 סטים, מנוחה 90 שניות. חד-צדדי לפני ריצה ארוכה - זה מה שמייצב את האגן.","items":[{"label":"Suitcase Carry","detail":"40 מטר לכל צד"},{"label":"Single Leg Glute Bridge","detail":"12 לכל צד"}]},{"label":"מטקון","detail":"לפי הסדר, למהירות","items":[{"label":"הליכון","detail":"1600 מטר במישור"},{"label":"הליכון","detail":"1600 מטר בעלייה של 4 אחוז"},{"label":"הליכון","detail":"1600 מטר במישור"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"800 / 800 / 800, בלי עלייה."},{"level":"intermediate","detail":"1200 / 1200 / 1200, עלייה 2 אחוז."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'd29125d9-4ae0-4ecf-9b82-f193dfb0c04d'::uuid, 'ladder-thruster-burpee', 'סולם עולה: תראסטר ובורפי',
    'פורמט Open קלאסי - העבודה גדלה בכל סבב.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 12,
    array['barbell', 'treadmill']::text[], 'בכל סבב מוסיפים 3 חזרות לכל תרגיל. הסבבים הראשונים קלים מדי ומפתים לרוץ - החזיקו קצב, כי הסבב של 15 הוא זה שקובע את התוצאה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 6, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Front Squat","detail":"6 חזרות"}]},{"label":"מטקון","detail":"AMRAP 12 דקות - סולם עולה: 3-6-9-12-15... מכל תרגיל","items":[{"label":"Thrusters","detail":"מוט"},{"label":"Burpees over Bar","detail":"בורפי מעל המוט"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק או משקולות יד, בורפי לצד המוט בלי קפיצה."},{"level":"intermediate","detail":"משקל שמאפשר סט רצוף של 12."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'reps'::public.score_type, 'סך החזרות שהושלמו'
  ),
  (
    '73c9274b-0422-44ed-b12a-b221f2e55e8f'::uuid, 'couplet-snatch-stepup', 'סנאץ׳ וספסל',
    'שני תרגילים, עשר דקות, דופק גבוה.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 10,
    array['barbell', 'bench', 'treadmill']::text[], 'קופלט מהיר בסגנון Open. הסנאץ׳ קל יחסית, ולכן כל הפער נוצר בקצב המעבר בין התחנות. אל תעצרו ליד הספסל - עלו וירדו ברצף.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"},{"label":"עליות על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Power Snatch","detail":"3 חזרות"}]},{"label":"מטקון","detail":"AMRAP 10 דקות","items":[{"label":"Power Snatch","detail":"10 חזרות, קל"},{"label":"Bench Step-overs","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק, עלייה והורדה מהספסל בקצב נוח."},{"level":"intermediate","detail":"משקל קל, לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'a386193d-8ddb-409f-8ca7-c08bbb1058a9'::uuid, 'triplet-run-kb-lunge', 'ריצה, קטלבל וצעדים',
    'שלוש תחנות שלא מרשות לדופק לרדת.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 15,
    array['treadmill', 'kettlebell', 'dumbbell']::text[], 'אימון קצב. הריצה היא ההזדמנות היחידה לנשום - רוצו אותה חזק אבל אחיד, ושמרו כוח ברגליים לצעדים.',
    '[{"label":"הליכון","detail":"600 מטר קל"},{"label":"סווינג קטלבל קל","detail":"15 חזרות"},{"label":"צעדי לאנג׳","detail":"20 חזרות"},{"label":"פתיחת ירך","detail":"90 שניות לכל צד"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 8, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Hip Thrust","detail":"8 חזרות"}]},{"label":"מטקון","detail":"AMRAP 15 דקות","items":[{"label":"הליכון","detail":"300 מטר"},{"label":"Kettlebell Swings","detail":"20 חזרות"},{"label":"Walking Lunges","detail":"20 צעדים עם משקולות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"200 מטר, קטלבל קל, 20 צעדים ללא משקל."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"קטלבל כבד, צעדים עם משקולות כבדות."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '86ae7c1e-4a9d-42cc-93ae-f150765c1f52'::uuid, 'emom-24-four-station', 'EMOM 24: ארבע תחנות',
    'שישה סבבים של ארבע דקות, בלי מקום להתחבא.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['treadmill', 'kettlebell', 'bench', 'barbell']::text[], 'כל דקה תרגיל אחר. בחרו נפח שמשאיר לפחות 15 שניות מנוחה בדקה הראשונה - אם אין מנוחה בהתחלה, לא תסיימו את הסבב הרביעי.',
    '[{"label":"הליכון","detail":"600 מטר קל"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"עליות על הספסל","detail":"10 חזרות"},{"label":"מוט ריק: דחיקות","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Back Squat","detail":"5 חזרות"}]},{"label":"מטקון","detail":"EMOM 24 דקות - מחזור של ארבע דקות, שש פעמים","items":[{"label":"דקה 1","detail":"הליכון 200 מטר"},{"label":"דקה 2","detail":"15 סווינג קטלבל"},{"label":"דקה 3","detail":"12 עליות על הספסל"},{"label":"דקה 4","detail":"10 דחיקות מוט מעל הראש"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"150 מטר, 10 סווינג קל, 8 עליות, 8 דחיקות במוט ריק."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"נפח מלא עם משקלים כבדים."}]'::jsonb,
    'completion'::public.score_type, 'כמה דקות הושלמו בזמן'
  ),
  (
    'ef8ad092-8a68-4048-86c8-4f84996d846e'::uuid, 'emom-20-strength-skill', 'EMOM 20: כוח ומיומנות',
    'דקות מתחלפות בין משקל כבד לתרגיל טכני.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['barbell', 'pullup_bar']::text[], 'אימון בנייה, לא אימון שריפה. המשקל צריך להיות כבד מספיק כדי שהחזרה החמישית תדרוש ריכוז, וקל מספיק כדי שהצורה לא תשתנה בדקה 19.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"EMOM 20 דקות - דקות אי-זוגיות וזוגיות לסירוגין","items":[{"label":"דקות אי-זוגיות","detail":"5 Front Squats, כבד אבל נקי"},{"label":"דקות זוגיות","detail":"5 Strict Pull-ups"}]},{"label":"מטקון","detail":"AMRAP 8 דקות, אחרי 3 דקות מנוחה","items":[{"label":"Burpees","detail":"10 חזרות"},{"label":"Kettlebell Swings","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"סקוואט גובלט, משיכות בגומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול, 3 משיכות נקיות."},{"level":"advanced","detail":"משיכות עם משקל נוסף."}]'::jsonb,
    'weight'::public.score_type, 'המשקל שבו עבדתם בסקוואט'
  ),
  (
    '8e4d2835-0fac-4ce7-9ea8-44e38f669ba1'::uuid, 'chipper-150', 'צ''יפר 150',
    'חמש תחנות, שלושים חזרות בכל אחת, פעם אחת.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 25,
    array['kettlebell', 'bench', 'dumbbell', 'mat', 'treadmill']::text[], 'עוברים תחנה אחרי תחנה בלי לחזור. זה אימון של החלטות: איפה לעצור, כמה זמן, ובאיזו תחנה כדאי לקחת סטים קטנים מראש.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"סווינג קטלבל קל","detail":"15 חזרות"},{"label":"תראסטר קל","detail":"10 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 6, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Deadlift","detail":"6 חזרות"}]},{"label":"מטקון","detail":"לפי הסדר, למהירות","items":[{"label":"Kettlebell Swings","detail":"30 חזרות"},{"label":"Bench Step-ups","detail":"30 חזרות"},{"label":"Dumbbell Thrusters","detail":"30 חזרות"},{"label":"Sit-ups","detail":"30 חזרות"},{"label":"Burpees","detail":"30 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"20 חזרות בכל תחנה, משקלים קלים."},{"level":"intermediate","detail":"25 חזרות בכל תחנה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'e99e3586-62bd-49c8-bee4-1a6c9919978a'::uuid, 'chipper-descending-ladder', 'צ''יפר יורד',
    'העבודה מתקצרת בכל תחנה, אבל מתקשה.', 'crossfit'::public.workout_category,
    'chipper'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 24,
    array['treadmill', 'barbell', 'pullup_bar']::text[], 'מבנה יורד: 800 מטר, 40 חזרות, 30, 20, 10. ככל שהמספר קטן, התרגיל קשה יותר - כך שהתחושה נשארת אחידה מהתחלה ועד הסוף.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Deadlift","detail":"3 חזרות"}]},{"label":"מטקון","detail":"לפי הסדר, למהירות","items":[{"label":"הליכון","detail":"800 מטר"},{"label":"Air Squats","detail":"40 חזרות"},{"label":"Hang Power Clean","detail":"30 חזרות"},{"label":"Pull-ups","detail":"20 חזרות"},{"label":"Burpees","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"400 מטר, מוט ריק, משיכות בגומייה."},{"level":"intermediate","detail":"600 מטר, משקל קל, משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'ca2d8d9f-e499-4671-a6f6-276534414423'::uuid, 'tabata-this', 'Tabata This',
    'חמישה תרגילים בפורמט טבאטה, אחד אחרי השני.', 'crossfit'::public.workout_category,
    'tabata'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['treadmill', 'pullup_bar', 'mat', 'barbell']::text[], 'שמונה סבבים של 20 שניות עבודה ו-10 מנוחה בכל תרגיל, עם דקה מנוחה בין תרגיל לתרגיל. הניקוד הוא סכום החזרות הנמוכות ביותר בכל תרגיל - מה שמעניש התחלה מהירה מדי.',
    '[{"label":"הליכון","detail":"4 דקות קל"},{"label":"מתיחות דינמיות","detail":"2 דקות"},{"label":"סבב ניסיון קצר בכל תרגיל","detail":"5 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 8, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Bent-over Row","detail":"8 חזרות"}]},{"label":"מטקון","detail":"טבאטה × 5 - 8 סבבים של 20/10 בכל תרגיל, דקה בין תרגילים","items":[{"label":"Air Squats","detail":null},{"label":"Pull-ups","detail":null},{"label":"Push-ups","detail":null},{"label":"Sit-ups","detail":null},{"label":"Burpees","detail":null}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"שלושה תרגילים בלבד, משיכות בגומייה."},{"level":"intermediate","detail":"חמישה תרגילים, משיכות בקפיצה."},{"level":"advanced","detail":"לפי הפרוטוקול, ניקוד לפי הסבב החלש ביותר."}]'::jsonb,
    'reps'::public.score_type, 'סכום הסבבים הנמוכים'
  ),
  (
    '45b39a35-f221-4133-9025-fe1766204ad9'::uuid, 'death-by-burpee', 'Death by Burpee',
    'חזרה אחת נוספת בכל דקה, עד שנגמר.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['treadmill', 'kettlebell']::text[], 'בדקה הראשונה בורפי אחד, בשנייה שניים, וכן הלאה. ממשיכים עד שלא מצליחים להשלים את המכסה בתוך הדקה. אימון שמדרג את עצמו אוטומטית - כל אחד נעצר במקום אחר, וזה בסדר.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"בורפי איטי","detail":"5 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 10, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Goblet Squat","detail":"10 חזרות"},{"label":"Kettlebell Row","detail":"10 חזרות לכל צד"}]},{"label":"מטקון","detail":"EMOM עד כישלון - דקה 1: בורפי אחד. דקה 2: שניים. וכן הלאה.","items":[{"label":"Burpees","detail":"חזרה נוספת בכל דקה"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"בורפי בלי קפיצה, עוצרים בדקה 10."},{"level":"intermediate","detail":"בורפי מלא, ממשיכים עד שהדקה לא מספיקה."},{"level":"advanced","detail":"בורפי עם קפיצה וטפיחה, עד כישלון אמיתי."}]'::jsonb,
    'reps'::public.score_type, 'הדקה האחרונה שהושלמה'
  ),
  (
    'bba8b366-ee48-4ae0-8491-8accf8bd3292'::uuid, 'heavy-day-back-squat', 'יום כבד: בק סקוואט',
    'חמישה סטים, חמש חזרות, משקל עולה.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['barbell', 'hip_thrust', 'treadmill', 'mat']::text[], 'אימון כוח נקי. עולים במשקל בכל סט, ומפסיקים בסט שבו החזרה האחרונה עדיין נראית כמו הראשונה. רשמו את הסט הכבד ביותר שביצעתם בצורה נקייה.',
    '[{"label":"הליכון","detail":"4 דקות"},{"label":"סקוואט משקל גוף","detail":"20 חזרות"},{"label":"פתיחת קרסול וירך","detail":"3 דקות"},{"label":"מוט ריק: 10 סקוואטים, 2 סבבים","detail":null}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, עלייה במשקל בכל סט, 2-3 דקות מנוחה","items":[{"label":"Back Squat","detail":"סט 1-2 חימום, סט 3-5 עבודה"}]},{"label":"מטקון","detail":"3 סבבים, קצב נוח","items":[{"label":"Hip Thrust","detail":"12 חזרות"},{"label":"Romanian Deadlift","detail":"10 חזרות"},{"label":"Plank","detail":"45 שניות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"סקוואט גובלט עם קטלבל או סקוואט לספסל."},{"level":"intermediate","detail":"5 סטים של 5 במשקל בינוני."},{"level":"advanced","detail":"עלייה עד סט כבד של 5 חזרות."}]'::jsonb,
    'weight'::public.score_type, 'הסט הכבד ביותר × 5'
  ),
  (
    '1061aaef-a4c3-4649-a7be-118ded318ce3'::uuid, 'heavy-day-deadlift-press', 'יום כבד: דדליפט ולחיצה',
    'משיכה כבדה, דחיפה כבדה, וסיום קצר.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['barbell', 'kettlebell', 'treadmill']::text[], 'שני תרגילי כוח בסיסיים ואחריהם מטקון קצר. שמרו על גב ניטרלי בדדליפט - אם הוא מתעגל בחזרה השלישית, זה המשקל שמפסיקים בו.',
    '[{"label":"הליכון","detail":"4 דקות"},{"label":"סיבובי ירך וכתף","detail":"2 דקות"},{"label":"מוט ריק: דדליפט ולחיצה","detail":"8 מכל תרגיל, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"דדליפט: 5 סטים של 3, מנוחה 2 דקות. לחיצה: 4 סטים של 5, מנוחה 90 שניות.","items":[{"label":"Deadlift","detail":"3 חזרות, כבד ונקי"},{"label":"Strict Press","detail":"5 חזרות"}]},{"label":"מטקון","detail":"AMRAP 5 דקות","items":[{"label":"Kettlebell Swings","detail":"10 חזרות"},{"label":"Burpees","detail":"5 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"דדליפט מגובה, לחיצה עם משקולות יד."},{"level":"intermediate","detail":"לפי הפרוטוקול במשקל בינוני."},{"level":"advanced","detail":"לפי הפרוטוקול, כבד."}]'::jsonb,
    'weight'::public.score_type, 'הדדליפט הכבד ביותר × 3'
  ),
  (
    '75612145-4e6e-4167-8437-3aabc94f4299'::uuid, 'bench-and-bar', 'ספסל ומוט',
    'יום דחיפה עליון, עם מטקון קצר בסוף.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['bench', 'barbell', 'dumbbell', 'treadmill']::text[], 'לחיצת חזה כבדה, ואחריה נפח עם משקולות. מי שמתאמן לבד - שימו את המוט על המסילות בגובה החזה לפני הסט האחרון, זו הבטיחות היחידה שיש כאן.',
    '[{"label":"הליכון","detail":"4 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"שכיבות סמיכה","detail":"10 חזרות, 2 סבבים"},{"label":"מוט ריק על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Bench Press","detail":"5 חזרות"}]},{"label":"מטקון","detail":"4 סבבים, מנוחה 60 שניות","items":[{"label":"Dumbbell Bench Press","detail":"12 חזרות"},{"label":"Bent-over Row","detail":"12 חזרות"},{"label":"Bench Dips","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"שכיבות סמיכה במקום לחיצה, משקולות קלות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול, כבד."}]'::jsonb,
    'weight'::public.score_type, 'הלחיצה הכבדה ביותר × 5'
  ),
  (
    '2e221624-394f-473a-940d-a7a6e2b675c0'::uuid, 'hip-thrust-day', 'יום היפ תראסט',
    'הישבן הוא המנוע. היום הוא מקבל את הבמה.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['hip_thrust', 'barbell', 'kettlebell', 'treadmill', 'mat']::text[], 'היפ תראסט הוא התרגיל שהכי מהר משנה איך מרגישים בדדליפט ובריצה. עצירה של שנייה מלאה למעלה בכל חזרה - בלעדיה זה רק תנועה.',
    '[{"label":"הליכון","detail":"4 דקות"},{"label":"גשר ירך משקל גוף","detail":"20 חזרות"},{"label":"Clamshells","detail":"15 לכל צד"},{"label":"פתיחת כופפי ירך","detail":"60 שניות לכל צד"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 8, עצירה של שנייה למעלה, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Hip Thrust","detail":"8 חזרות"}]},{"label":"מטקון","detail":"3 סבבים למהירות","items":[{"label":"Kettlebell Swings","detail":"20 חזרות"},{"label":"Walking Lunges","detail":"20 צעדים"},{"label":"Single Leg Glute Bridge","detail":"12 לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"משקל גוף בלבד, 3 סטים."},{"level":"intermediate","detail":"לפי הפרוטוקול במשקל בינוני."},{"level":"advanced","detail":"לפי הפרוטוקול, כבד."}]'::jsonb,
    'weight'::public.score_type, 'ההיפ תראסט הכבד ביותר × 8'
  ),
  (
    '95041c01-07f2-452f-9261-ac735618d5d5'::uuid, 'pull-day', 'יום משיכה',
    'מתח, חתירה, ואחיזה שנגמרת אחרונה.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['pullup_bar', 'barbell', 'kettlebell', 'treadmill']::text[], 'משיכה היא המיומנות שהכי הרבה אנשים נתקעים בה. הבלוק בנוי בשלושה שלבים: משיכה נקייה, חתירה כבדה, ואחיזה - שלושתם ביחד זה מה שמזיז את המחט.',
    '[{"label":"הליכון","detail":"4 דקות"},{"label":"תלייה פסיבית","detail":"30 שניות, 3 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"חתירה עם מוט ריק","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים, מנוחה 2 דקות","items":[{"label":"Strict Pull-ups","detail":"3-5 חזרות נקיות, או בגומייה"},{"label":"Bent-over Row","detail":"6 חזרות"}]},{"label":"מטקון","detail":"4 סבבים, מנוחה 90 שניות","items":[{"label":"Kettlebell Swings","detail":"20 חזרות"},{"label":"Farmer Carry","detail":"40 מטר"},{"label":"Dead Hang","detail":"מקסימום זמן"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משיכות בגומייה, נשיאה 20 מטר, תלייה 15 שניות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משיכות עם משקל נוסף, נשיאה 60 מטר."}]'::jsonb,
    'reps'::public.score_type, 'משיכות נקיות בסט הטוב'
  ),
  (
    '2639dfe6-1fad-48f8-9111-6fc489658922'::uuid, 'sprint-intervals', 'אינטרוולים על ההליכון',
    'עשרה מקטעים קצרים, מנוחה מלאה.', 'crossfit'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, null,
    array['treadmill', 'barbell']::text[], 'ריצה מהירה היא מיומנות, לא רק כושר. חממו ביסודיות - ספרינט על שרירים קרים הוא הדרך המהירה ביותר לפציעת מיתר ברך. עלו במהירות בהדרגה בארבעת המקטעים הראשונים.',
    '[{"label":"הליכון","detail":"800 מטר קל"},{"label":"מתיחות דינמיות: בעיטות ישבן, הרמות ברך","detail":"3 סבבים של 20 מטר"},{"label":"האצות","detail":"4 × 20 שניות בקצב עולה"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 6, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Front Squat","detail":"6 חזרות"}]},{"label":"מטקון","detail":"10 × 30 שניות, שתי דקות הליכה בין מקטעים","items":[{"label":"הליכון","detail":"30 שניות בקצב מהיר"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"6 מקטעים של 20 שניות בקצב מהיר ולא מרבי."},{"level":"intermediate","detail":"8 מקטעים של 30 שניות."},{"level":"advanced","detail":"10 מקטעים, כולל עלייה של 2 אחוז."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '2dce57c6-4377-4f4c-b348-4700aa31e30a'::uuid, 'partner-split-work', 'אימון זוגות',
    'אחד עובד, אחד נח. הקצב נקבע ביחד.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 25,
    array['treadmill', 'kettlebell', 'dumbbell', 'barbell']::text[], 'מחלקים את החזרות בין שני מתאמנים איך שרוצים, כל עוד רק אחד עובד בכל רגע. אימון טוב לימים שבהם יש פער רמות בקבוצה - כל אחד לוקח כמה שהוא יכול.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"סווינג קטלבל קל","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"לסירוגין: אחד עושה סט, השני נח. 5 סטים כל אחד.","items":[{"label":"Deadlift","detail":"5 חזרות"}]},{"label":"מטקון","detail":"בזוג, למהירות. מחלקים חופשי, רק אחד עובד בכל פעם.","items":[{"label":"הליכון","detail":"1600 מטר"},{"label":"Kettlebell Swings","detail":"150 חזרות"},{"label":"Dumbbell Thrusters","detail":"100 חזרות"},{"label":"Burpees","detail":"100 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"חצי מהחזרות, משקלים קלים."},{"level":"intermediate","detail":"שלושה רבעים מהחזרות."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '59723ae2-7685-4ef4-927a-151840385bc6'::uuid, 'benchmark-open-couplet', 'קופלט Open',
    'דדליפט ובורפי. פשוט וקשה.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 12,
    array['barbell', 'treadmill']::text[], 'שני תרגילים שמתחרים על אותו גב תחתון. זה בכוונה - כאן לומדים לחלק סטים לפני שהגוף מכריח. אל תעשו את 12 הדדליפטים הראשונים ברצף.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Romanian Deadlift","detail":"5 חזרות"}]},{"label":"מטקון","detail":"AMRAP 12 דקות","items":[{"label":"Deadlift","detail":"12 חזרות, בינוני"},{"label":"Burpees over Bar","detail":"9 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקל קל, בורפי בלי קפיצה מעל המוט."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקל כבד, לפי הפרוטוקול."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '86d4f75a-6426-4220-86d2-29a4210b892e'::uuid, 'engine-builder-treadmill', 'בניית מנוע',
    'מקטעים ארוכים בקצב מדוד.', 'crossfit'::public.workout_category,
    'intervals'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['treadmill', 'kettlebell']::text[], 'אימון סבולת אירובית. המטרה היא קצב אחיד - הפרש של יותר מ-10 שניות בין המקטע הראשון לאחרון אומר שיצאתם מהר מדי.',
    '[{"label":"הליכון","detail":"800 מטר קל"},{"label":"מתיחות דינמיות לגב ולירך","detail":"2 דקות"},{"label":"האצות","detail":"3 × 20 שניות בקצב עולה"}]'::jsonb, '[{"label":"כוח","detail":"3 סבבים, מנוחה 90 שניות","items":[{"label":"Goblet Squat","detail":"12 חזרות"},{"label":"Single Leg Glute Bridge","detail":"12 לכל צד"}]},{"label":"מטקון","detail":"6 × 800 מטר, 90 שניות מנוחה בין מקטעים","items":[{"label":"הליכון","detail":"800 מטר בקצב אחיד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"4 מקטעים של 400 מטר."},{"level":"intermediate","detail":"5 מקטעים של 800 מטר."},{"level":"advanced","detail":"6 מקטעים, קצב מרוץ."}]'::jsonb,
    'time'::public.score_type, 'ממוצע המקטעים'
  ),
  (
    '25633a34-5822-4402-ac3c-f446eb9dc388'::uuid, 'core-and-carry-crossfit', 'ליבה ונשיאה',
    'יציבות תחת עומס, לא כפיפות בטן.', 'crossfit'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['kettlebell', 'mat', 'pullup_bar', 'treadmill']::text[], 'נשיאה היא תרגיל הליבה הכי מתפספס. כשהמשקל ביד אחת, הגוף חייב להתנגד להטיה לצד - וזה בדיוק מה שהגב התחתון צריך.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"Dead Bug","detail":"10 לכל צד"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Front Squat","detail":"6 חזרות"},{"label":"Suitcase Carry","detail":"40 מטר לכל צד"}]},{"label":"מטקון","detail":"4 סבבים, קצב נוח","items":[{"label":"Hollow Hold","detail":"30 שניות"},{"label":"Hanging Knee Raises","detail":"10 חזרות"},{"label":"Side Plank","detail":"30 שניות לכל צד"},{"label":"Bird Dog","detail":"10 לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"משקל קל, פלאנק צד מהברכיים, הרמות ברך בשכיבה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקל כבד, Toes to Bar במקום הרמות ברך."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '4726f77e-1144-4738-8c66-7d2c97d5f1b2'::uuid, 'hiit-30-30-full-body', 'HIIT 30/30 גוף מלא',
    'שלושים שניות עבודה, שלושים מנוחה, שמונה תחנות.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'beginner'::public.difficulty_level,
    30, null,
    array['dumbbell', 'mat']::text[], 'אינטרוולים קצרים בחלוקה שווה. ביחס של 1:1 אפשר לעבוד חזק בכל מקטע בלי לקרוס - אם בסבב השלישי אתם כבר לא מסוגלים לשמור על אותו מספר חזרות, הורידו משקל ולא קצב.',
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":"30 שניות עבודה / 30 שניות מנוחה בכל תחנה, דקה בין סבבים","items":[{"label":"Goblet Squat","detail":"סקוואט גובלט"},{"label":"Push-ups","detail":"שכיבות סמיכה"},{"label":"Dumbbell Row","detail":"חתירה עם משקולת, מתחלף בין הצדדים"},{"label":"Reverse Lunges","detail":"לאנג׳ לאחור"},{"label":"Dumbbell Press","detail":"לחיצה מעל הראש"},{"label":"Mountain Climbers","detail":"טיפוס הרים"},{"label":"Dead Bug","detail":"באג מת"},{"label":"Plank","detail":"פלאנק"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"20 שניות עבודה / 40 מנוחה, בלי משקל."},{"level":"intermediate","detail":"30/30 עם משקולות בינוניות."},{"level":"advanced","detail":"40 שניות עבודה / 20 מנוחה, משקולות כבדות."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"שני בלוקים, קטלבל קל, שכיבות סמיכה על הספסל."},{"level":"intermediate","detail":"ארבעה בלוקים, קטלבל שאפשר להחזיק איתו 20 שניות רצוף."},{"level":"advanced","detail":"ארבעה בלוקים, קטלבל כבד. הניקוד הוא הסבב החלש ביותר."}]'::jsonb,
    'reps'::public.score_type, null
  ),
  (
    'c10aabc5-0ea4-41b7-a67f-3c53f2c9fd31'::uuid, 'hiit-40-20-conditioning', 'HIIT 40/20',
    'יחס עבודה גבוה. לא לפעם הראשונה.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, null,
    array['dumbbell', 'bench', 'treadmill']::text[], 'ארבעים שניות עבודה מול עשרים מנוחה. היחס הזה לא מאפשר התאוששות מלאה, ולכן בחירת המשקל קובעת הכל - בחרו משקל שתוכלו לעבוד איתו ברצף ארבעים שניות גם בסבב האחרון.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"},{"label":"קפיצה בחבל","detail":"2 דקות"}]'::jsonb, '[{"label":"4 סבבים","detail":"40 שניות עבודה / 20 מנוחה, 90 שניות בין סבבים","items":[{"label":"Dumbbell Thrusters","detail":"תראסטר עם משקולות"},{"label":"Bench Step-overs","detail":"עליות מעל הספסל"},{"label":"Renegade Rows","detail":"חתירה בפלאנק"},{"label":"Split Jumps","detail":"קפיצות פיצול"},{"label":"Burpees","detail":"בורפי"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"30/30, משקולות קלות, עלייה על הספסל בלי קפיצה."},{"level":"intermediate","detail":"40/20 עם משקולות בינוניות."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '2db8c1fc-321c-496e-a1e1-edaad8dd4e78'::uuid, 'strength-endurance-circuit-a', 'מעגל כוח-סבולת א׳',
    'חמש תחנות, ארבעה סבבים, קצב עבודה.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    40, null,
    array['barbell', 'dumbbell', 'bench']::text[], 'מעגל קלאסי של דחיפה, משיכה, רגליים וליבה. הכוונה היא עומס ולא מהירות - המנוחה בין התחנות קצרה, אבל הצורה קודמת לשעון.',
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"}]'::jsonb, '[{"label":"4 סבבים","detail":"45 שניות מנוחה בין תחנות, 2 דקות בין סבבים","items":[{"label":"Front Squat","detail":"10 חזרות"},{"label":"Bench Press או שכיבות סמיכה","detail":"10 חזרות"},{"label":"Bent-over Row","detail":"12 חזרות"},{"label":"Step-ups","detail":"12 חזרות לכל רגל"},{"label":"Hollow Hold","detail":"30 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק או משקולות קלות, 3 סבבים."},{"level":"intermediate","detail":"משקל בינוני, 4 סבבים."},{"level":"advanced","detail":"משקל כבד, 5 סבבים."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, משיכות בגומייה, נשיאה 20 מטר."},{"level":"intermediate","detail":"משקל בינוני, 3 משיכות נקיות."},{"level":"advanced","detail":"משקל כבד, משיכות עם משקל נוסף."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, משקולות שאפשר להשלים איתן את הרצף בלי להניח."},{"level":"intermediate","detail":"4 סבבים, משקולות שהסט האחרון דורש איתן ריכוז."},{"level":"advanced","detail":"5 סבבים, כבד - האחיזה היא שנגמרת ראשונה."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקולת קלה, שכיבות סמיכה על הספסל."},{"level":"intermediate","detail":"משקולת שמאפשרת 10 סנאץ׳ רצופים לכל יד."},{"level":"advanced","detail":"משקולת כבדה, שכיבות עם רגליים מוגבהות."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"8-10 חזרות עם משקולות קלות."},{"level":"intermediate","detail":"לפי הפרוטוקול, משקל שמשאיר 15 שניות מנוחה בכל דקה."},{"level":"advanced","detail":"לפי הפרוטוקול, כבד - הדקה מנוצלת כמעט כולה."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, 15 דקות."},{"level":"intermediate","detail":"קטלבל שמאפשר 15 סווינג רצופים."},{"level":"advanced","detail":"קטלבל כבד, 25 דקות."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, 3 סבבים."},{"level":"intermediate","detail":"קטלבל שמאפשר 5 לחיצות נקיות בצד החלש."},{"level":"advanced","detail":"קטלבל כבד, 6 סבבים."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"ללא משקל, או עם נעל מאוזנת על כף היד."},{"level":"intermediate","detail":"קטלבל שאפשר להחזיק יציב מעל הראש לאורך כל החזרה."},{"level":"advanced","detail":"קטלבל כבד. אם הזרוע רועדת - זה המשקל שמפסיקים בו."}]'::jsonb,
    'weight'::public.score_type, null
  ),
  (
    '26154e9b-bd15-46dd-8d63-6a49699e1607'::uuid, 'calisthenics-pull-strength', 'משקל גוף: משיכה',
    'בניית משיכה נקייה, שלב אחרי שלב.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['pullup_bar', 'bands', 'bench']::text[], 'משיכה היא המיומנות שהכי הרבה אנשים נתקעים בה. האימון הזה בונה אותה בשלושה שלבים: תלייה, משיכה אופקית, ומשיכה אנכית עם עזרה שמצטמצמת.',
    '[{"label":"תלייה פסיבית","detail":"30 שניות, 3 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"חתירה בגומייה","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה","detail":"60 שניות"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים, 2 דקות מנוחה","items":[{"label":"Strict Pull-ups או משיכות בגומייה","detail":"3-5 חזרות נקיות"}]},{"label":"נפח","detail":"4 סבבים","items":[{"label":"Inverted Rows","detail":"10 חזרות מתחת למוט"},{"label":"Hollow Hold","detail":"30 שניות"},{"label":"Scapular Pull-ups","detail":"8 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"חתירה הפוכה מתחת למוט בזווית נוחה, תלייה מסייעת."},{"level":"intermediate","detail":"משיכות בגומייה דקה."},{"level":"advanced","detail":"משיכות עם משקל נוסף."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"שכיבות מהקיר או מספסל גבוה."},{"level":"intermediate","detail":"שכיבות מהרצפה."},{"level":"advanced","detail":"שכיבות עם רגליים מוגבהות ופייק בקיר."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"12 דקות, שכיבות מהברכיים, בורפי בלי קפיצה."},{"level":"intermediate","detail":"18 דקות לפי הפרוטוקול."},{"level":"advanced","detail":"18 דקות, בורפי עם קפיצה, שכיבות עם מחיאת כף."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '1df0b875-6329-4067-8074-4f9bbf049089'::uuid, 'engine-builder-run', 'בניית מנוע: ריצה ארוכה',
    'מקטעים ארוכים בקצב מדוד.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['treadmill']::text[], 'אימון סבולת אירובית. המטרה היא קצב אחיד - הפרש של יותר מ-5 שניות בין המקטע הראשון לאחרון אומר שיצאתם מהר מדי.',
    '[{"label":"הליכון","detail":"600 מטר קל"},{"label":"מתיחות דינמיות לגב ולירך","detail":"2 דקות"},{"label":"הליכון","detail":"3 מקטעים של 20 שניות בקצב עולה"}]'::jsonb, '[{"label":"6 × 500 מטר","detail":"90 שניות מנוחה בין מקטעים","items":[{"label":"הליכון","detail":"800 מטר בקצב אחיד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"4 מקטעים של 300 מטר."},{"level":"intermediate","detail":"5 מקטעים של 500 מטר."},{"level":"advanced","detail":"6 מקטעים של 500 מטר, קצב מרוץ."}]'::jsonb,
    'time'::public.score_type, 'ממוצע המקטעים'
  ),
  (
    'bc09a055-296f-4897-8528-e6ab4c6d3629'::uuid, 'engine-builder-sprints', 'בניית מנוע: מקטעים חדים',
    'מקטעים קצרים וחדים.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    30, null,
    array['treadmill']::text[], 'אינטרוולים קצרים בעצימות גבוהה. במקטע של 30 שניות אין קצב לשמור - נותנים הכל, ואז מנוחה מלאה עד המקטע הבא.',
    '[{"label":"הליכון","detail":"5 דקות בקצב עולה"},{"label":"שלושה מקטעים של 15 שניות חזק","detail":"דקה מנוחה ביניהם"}]'::jsonb, '[{"label":"10 × 30 שניות","detail":"90 שניות מנוחה מלאה בין מקטעים","items":[{"label":"הליכון","detail":"30 שניות בקצב מהיר"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"6 מקטעים של 20 שניות."},{"level":"intermediate","detail":"8 מקטעים של 30 שניות."},{"level":"advanced","detail":"10 מקטעים לפי הפרוטוקול."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '086d3190-6843-47aa-b491-676e4351f484'::uuid, 'partner-workout-split-work', 'אימון זוגות: עבודה מחולקת',
    'אחד עובד, אחד נח. הקצב נקבע ביחד.', 'functional'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    30, 25,
    array['treadmill', 'kettlebell', 'dumbbell']::text[], 'מחלקים את החזרות בין שני מתאמנים איך שרוצים, כל עוד רק אחד עובד בכל רגע. אימון טוב לימים שבהם יש פער רמות בקבוצה - כל אחד לוקח כמה שהוא יכול.',
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"},{"label":"סווינג קטלבל קל","detail":"15 חזרות"}]'::jsonb, '[{"label":"בזוג, למהירות","detail":"מחלקים את החזרות חופשי, רק אחד עובד בכל פעם","items":[{"label":"הליכון","detail":"2000 מטר"},{"label":"Kettlebell Swings","detail":"150 חזרות"},{"label":"Wall Balls","detail":"150 חזרות"},{"label":"Burpees","detail":"100 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"חצי מהחזרות, משקלים קלים."},{"level":"intermediate","detail":"שלושה רבעים מהחזרות."},{"level":"advanced","detail":"לפי הפרוטוקול."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '086fb645-553e-48a3-b9ed-a11fef4b7c51'::uuid, 'partner-workout-you-go-i-go', 'אימון זוגות: סבב מתחלף',
    'סבב שלם לכל אחד, לסירוגין, עשרים דקות.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, null,
    array['dumbbell', 'bench']::text[], 'כל אחד עושה סבב שלם והשני נח. המנוחה המובנית מאפשרת לעבוד חזק בכל סבב, והאחריות ההדדית עושה את השאר.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"label":"AMRAP 20 דקות, לסירוגין","detail":"הניקוד הוא סך הסבבים של שניכם","items":[{"label":"Dumbbell Thrusters","detail":"10 חזרות"},{"label":"Box Jumps","detail":"10 חזרות"},{"label":"Burpees","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקולות קלות, עלייה על הספסל, בורפי בלי קפיצה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקולות כבדות, בורפי עם קפיצה מלאה."}]'::jsonb,
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
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"},{"label":"פתיחת קרסול בקיר","detail":"45 שניות לכל צד"}]'::jsonb, '[{"label":"כוח א׳","detail":"4 סטים של 6, מנוחה 2 דקות","items":[{"label":"Back Squat","detail":"משקל בינוני-כבד"}]},{"label":"כוח ב׳","detail":"3 סטים של 8, מנוחה 90 שניות","items":[{"label":"Romanian Deadlift","detail":null}]},{"label":"חד-צדדי","detail":"3 סבבים","items":[{"label":"Bulgarian Split Squat","detail":"10 חזרות לכל רגל"},{"label":"Calf Raises","detail":"15 חזרות"}]}]'::jsonb,
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
    '[{"label":"הליכון","detail":"600 מטר"},{"label":"סיבובי כתף עם גומייה","detail":"15 לכל כיוון"},{"label":"חתירה בגומייה","detail":"15 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה","detail":"10 חזרות"}]'::jsonb, '[{"label":"כוח א׳","detail":"4 סטים של 6, מנוחה 2 דקות","items":[{"label":"Strict Press","detail":"לחיצה נקייה מעל הראש"}]},{"label":"כוח ב׳","detail":"4 סטים של 8","items":[{"label":"Bent-over Row","detail":"חתירה בכפיפה"}]},{"label":"נפח","detail":"3 סבבים","items":[{"label":"Pull-ups או משיכות בגומייה","detail":"מקסימום פחות 2"},{"label":"Dumbbell Bench Press","detail":"12 חזרות"},{"label":"Face Pulls בגומייה","detail":"15 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"לחיצה עם משקולות יד, חתירה הפוכה מתחת למוט."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"לפי הפרוטוקול, משקל כבד."}]'::jsonb,
    'weight'::public.score_type, 'הלחיצה הכבדה ביותר × 6'
  ),
  (
    '22e49b10-9b35-48e2-89ee-943e9206f12c'::uuid, 'conditioning-ladder-down', 'סולם יורד',
    'החזרות יורדות, הקצב עולה.', 'functional'::public.workout_category,
    'for_time'::public.workout_format,
    'intermediate'::public.difficulty_level,
    25, 18,
    array['kettlebell', 'treadmill']::text[], 'מבנה יורד נותן תחושת התקדמות: כל סבב קצר מהקודם. זה מאפשר לדחוף בסוף בלי לחשוש שיישאר עוד הרבה.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"סווינג קטלבל קל","detail":"15 חזרות, 2 סבבים"},{"label":"פתיחת גב עליון בישיבה","detail":"60 שניות"},{"label":"קפיצה בחבל","detail":"2 דקות"}]'::jsonb, '[{"label":"סבבים של 10-8-6-4-2","detail":"למהירות","items":[{"label":"Kettlebell Swings ","detail":null},{"label":"Burpees","detail":null},{"label":"קפיצה בחבל","detail":"פי 10 מהמספר בסבב"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, בורפי בלי קפיצה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"קפיצות פיצול מהירות במקום צעדים."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'a7715a2c-3c75-4f62-a3a8-25f65b15c6a0'::uuid, 'conditioning-every-3-minutes', 'כל שלוש דקות',
    'חמישה מקטעים עם מנוחה שמשתנה לפי הביצוע.', 'functional'::public.workout_category,
    'intervals'::public.workout_format,
    'advanced'::public.difficulty_level,
    25, null,
    array['treadmill', 'dumbbell']::text[], 'מה שנשאר מהשלוש דקות אחרי שסיימתם - זו המנוחה. מבנה שמתגמל מאמץ אמיתי בכל מקטע במקום קצב בינוני לאורך כל האימון.',
    '[{"label":"חתירה או הליכה מהירה","detail":"3 דקות"},{"label":"סיבובי כתף עם משקולת קלה","detail":"10 לכל כיוון"},{"label":"סקוואט גובלט","detail":"12 חזרות, 2 סבבים"},{"label":"חתירה בכפיפה עם משקולות","detail":"12 חזרות, 2 סבבים"},{"label":"פתיחת חזה במשקוף","detail":"45 שניות"},{"label":"הליכון","detail":"600 מטר"}]'::jsonb, '[{"label":"5 מקטעים, כל 3 דקות","detail":"רשמו את זמן כל מקטע בנפרד","items":[{"label":"הליכון","detail":"300 מטר"},{"label":"Dumbbell Thrusters","detail":"15 חזרות"},{"label":"Burpees","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"כל 4 דקות, מקטע קצר יותר, משקולות קלות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"כל 3 דקות, משקולות כבדות."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משקולות קלות - התרגיל כאן הוא הרצף, לא המשקל."},{"level":"intermediate","detail":"משקולות בינוניות שמאפשרות קלין נקי בדקה 10."},{"level":"advanced","detail":"משקולות כבדות. רוב האנשים נעצרים בין דקה 8 ל-12."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים, 8 חזרות בכל תרגיל."},{"level":"intermediate","detail":"3 סבבים לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים עם משקל קל."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '1b50cc74-f22f-4c76-8563-fa02fd70ec20'::uuid, 'beginner-build-up', 'בונים בסיס',
    'השלב שאחרי האימון הראשון.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    40, null,
    array['dumbbell', 'bench', 'mat']::text[], 'אותם דפוסי תנועה, עכשיו עם קצת משקל ועם מנוחה קצרה יותר. אם השלמתם את שלושת הסבבים בלי לאבד צורה, בפעם הבאה עלו במשקל ולא בחזרות.',
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":"45 שניות מנוחה בין תחנות","items":[{"label":"Goblet Squat","detail":"12 חזרות"},{"label":"Romanian Deadlift","detail":"12 חזרות"},{"label":"Push-ups בהטיה","detail":"10 חזרות"},{"label":"Dumbbell Row","detail":"12 חזרות לכל צד"},{"label":"Step-ups","detail":"10 חזרות לכל רגל"},{"label":"Plank","detail":"30 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"בלי משקל, 2 סבבים."},{"level":"intermediate","detail":"משקולות קלות, 3 סבבים."},{"level":"advanced","detail":"משקולות בינוניות, 4 סבבים."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משקל קל, 20 מטר, תלייה 15 שניות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקל כבד, נשיאה 60 מטר."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"6 מקטעים של 60 מטר בקצב מהיר ולא מרבי."},{"level":"intermediate","detail":"8 מקטעים של 100 מטר."},{"level":"advanced","detail":"10 מקטעים לפי הפרוטוקול."}]'::jsonb,
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
    array['treadmill', 'bands', 'mat']::text[], 'עצימות נמוכה בכוונה. המטרה היא להזרים דם לשרירים כואבים ולשמור על טווחי תנועה, לא לייצר עוד עייפות. אם הדופק עולה מעל שיחה נוחה - האטו.',
    '[{"label":"הליכון","detail":"5 דקות בקצב קל"}]'::jsonb, '[{"label":"3 סבבים, קצב נוח","detail":null,"items":[{"label":"הליכון","detail":"3 דקות קל"},{"label":"Band Pull-aparts","detail":"15 חזרות"},{"label":"Glute Bridge","detail":"15 חזרות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"Worlds Greatest Stretch","detail":"5 חזרות לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים. אם הדופק עולה מעל שיחה נוחה - האטו."},{"level":"intermediate","detail":"3 סבבים בקצב שיחה."},{"level":"advanced","detail":"4 סבבים והליכה ארוכה בסוף."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'a4995a92-eada-49f8-9446-298c0b753d36'::uuid, 'metcon-fifteen-minute', 'מטקון 15 דקות',
    'קצר, פשוט, ובלי חימום ארוך.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    20, null,
    array['kettlebell', 'bench']::text[], 'האימון לימים שבהם יש רבע שעה ולא יותר. שלושה תרגילים, מבנה פשוט, ואפשר לתת בו הכל בלי לתכנן.',
    '[{"label":"הליכה מהירה","detail":"2 דקות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"דדליפט קטלבל קל","detail":"10 חזרות, 2 סבבים"},{"label":"עליות על הספסל","detail":"10 חזרות"}]'::jsonb, '[{"label":"AMRAP 15 דקות","detail":null,"items":[{"label":"Kettlebell Swings","detail":"20 חזרות"},{"label":"Bench Step-ups","detail":"15 חזרות"},{"label":"Push-ups","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, עלייה על הספסל בקצב נוח."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"קטלבל כבד, עלייה נפיצה."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'e2b0994b-7dbf-4f9d-8fcb-de898e8c7827'::uuid, 'metcon-the-long-one', 'המטקון הארוך',
    'ארבעים דקות בקצב אחיד.', 'functional'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    45, null,
    array['treadmill', 'dumbbell', 'kettlebell']::text[], 'אימון סבולת ארוך. בארבעים דקות אין מקום להתפרצות - מצאו קצב שתוכלו להחזיק בדקה 38, והתחילו בו כבר בדקה הראשונה.',
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"שכיבות סמיכה בהטיה","detail":"10 חזרות"},{"label":"הליכון","detail":"600 מטר"}]'::jsonb, '[{"label":"AMRAP 40 דקות","detail":"קצב שיחה. שתו מים באמצע.","items":[{"label":"הליכון","detail":"400 מטר"},{"label":"Dumbbell Snatch","detail":"20 חזרות, 10 לכל יד"},{"label":"קפיצה בחבל","detail":"100 חזרות"},{"label":"Walking Lunges","detail":"20 צעדים"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"25 דקות, 300 מטר, משקולת קלה."},{"level":"intermediate","detail":"40 דקות לפי הפרוטוקול."},{"level":"advanced","detail":"40 דקות בקצב מרוץ."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'f86988df-3733-4c2d-987e-a1693507fd3b'::uuid, 'mobility-strength-hybrid', 'ניידות וכוח',
    'טווח תנועה תחת עומס.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    35, null,
    array['dumbbell', 'bands', 'mat']::text[], 'מתיחה בלי כוח בטווח החדש לא נשארת. האימון הזה עובד בקצוות הטווח עם משקל קל, וזה מה שהופך ניידות זמנית ליכולת קבועה.',
    '[{"label":"הליכון","detail":"3 דקות בקצב קל"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"Worlds Greatest Stretch","detail":"5 לכל צד"},{"label":"סיבובי כתף עם גומייה","detail":"15 לכל כיוון"}]'::jsonb, '[{"label":"3 סבבים","detail":"איטי ומבוקר. 3 שניות בירידה בכל תרגיל.","items":[{"label":"Deep Goblet Squat Hold","detail":"45 שניות"},{"label":"Cossack Squat","detail":"8 חזרות לכל צד"},{"label":"Overhead Squat עם מקל","detail":"10 חזרות"},{"label":"Jefferson Curl עם משקל קל","detail":"8 חזרות"},{"label":"Dumbbell Windmill","detail":"6 חזרות לכל צד"}]}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"ראש על המזרן בכל התרגילים בשכיבה."},{"level":"intermediate","detail":"הרמת ראש וכתפיים לפי הפרוטוקול."},{"level":"advanced","detail":"רגליים ישרות וזווית נמוכה יותר."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"בלי התנגדות, 2 סבבים."},{"level":"intermediate","detail":"גומייה קלה, 3 סבבים."},{"level":"advanced","detail":"גומייה חזקה ו."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים עם גומייה חזקה."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"גשר דו-רגלי, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"גשר על רגל אחת עם משקל, 4 סבבים."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"ראש על המזרן, ברכיים ב-90 מעלות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"רגליים ישרות ונמוכות, 4 סבבים."}]'::jsonb,
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
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"יד על הקיר לתמיכה לאורך כל התרגילים."},{"level":"intermediate","detail":"בלי תמיכה, עיניים פקוחות."},{"level":"advanced","detail":"עיניים עצומות בעמידה על רגל אחת."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"סבב אחד, בקצב נוח."},{"level":"intermediate","detail":"2 סבבים ברצף בלי מנוחה בין תרגילים."},{"level":"advanced","detail":"3 סבבים ברצף."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"עצירה בשלב 2, ידיים על הירך."},{"level":"intermediate","detail":"Teaser עם ברכיים כפופות."},{"level":"advanced","detail":"Teaser מלא, רגליים ישרות."}]'::jsonb,
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
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"רק חלק הלימוד."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"תוספת של אחזקות ארוכות בנשיפה."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 סבבים, בלי גומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"4 סבבים עם גומייה חזקה."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"טווח חלקי, ברכיים כפופות בישיבה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"טווח מלא, אחזקה של 3 שניות בקצה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'e659e751-a755-4ef7-922d-1f036094633d'::uuid, 'pilates-arms-and-shoulders', 'ידיים וכתפיים',
    'עומס קל, הרבה חזרות, שליטה מלאה.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    28, null,
    array['mat', 'bands', 'dumbbell']::text[], 'עבודה על הכתף עם משקל קל מאוד. המטרה היא סבולת ובקרה ולא היפרטרופיה - ולכן משקולת של שניים-שלושה קילו מספיקה לחלוטין כאן.',
    '[{"label":"הליכה במקום","detail":"2 דקות"},{"label":"גלגול עמוד שדרה מעמידה","detail":"5 חזרות איטיות"},{"label":"סיבובי כתף","detail":"10 לכל כיוון"},{"label":"הטיית אגן בעמידה","detail":"10 חזרות"}]'::jsonb, '[{"label":"3 סבבים","detail":", קצב איטי","items":[{"label":"Arm Circles","detail":"20 לכל כיוון"},{"label":"Front Raise","detail":"15 חזרות"},{"label":"Lateral Raise","detail":"15 חזרות"},{"label":"Band Pull-aparts","detail":"20 חזרות"},{"label":"Tricep Extension","detail":"15 חזרות"},{"label":"Prone Y-T-W","detail":"8 מכל אות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"בלי משקל. הקצב האיטי הוא העבודה."},{"level":"intermediate","detail":"משקולות קלות מאוד, 3 סבבים."},{"level":"advanced","detail":"משקולות קלות, 4 סבבים בקצב איטי יותר."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"גומייה רחבה, טווח קטן."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"גומייה צרה וטווח מלא."}]'::jsonb,
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
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"ספינקס וקוברה בלבד."},{"level":"intermediate","detail":"עד גמל עם ידיים על האגן."},{"level":"advanced","detail":"כולל Urdhva Dhanurasana לגלגל מלא."}]'::jsonb,
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
    '[{"label":"Savasana","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"2 ברכות שמש, ברכיים על המזרן במעבר."},{"level":"intermediate","detail":"3 ברכות שמש בקצב הנשימה."},{"level":"advanced","detail":"5 ברכות שמש ברצף רציף."}]'::jsonb,
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
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"},{"label":"Savasana","detail":"3 דקות"}]'::jsonb, '[{"level":"beginner","detail":"תמיכת כריות, 60 שניות בכל תנוחה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"2 דקות בכל תנוחה, 3 סבבי חיזוק."}]'::jsonb,
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
  ),
  (
    '9e8047e9-cc5f-43cb-a280-d3a750dabe55'::uuid, 'save-the-date', 'סייב דה דייט',
    'התאריך נקבע. מכאן זה רק מתקרב.', 'functional'::public.workout_category,
    'emom'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['kettlebell', 'treadmill', 'mat']::text[], 'הכול עוד רגוע, וזאת בדיוק הנקודה. EMOM של עשרים דקות שבו כל דקה מגיעה בין אם התכוננתם ובין אם לא. אל תרוצו בדקה הראשונה - יש עוד תשע עשרה, והן לא מזיזות את עצמן.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 8, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Goblet Squat","detail":"8 חזרות"},{"label":"Bent-over Row","detail":"8 חזרות"}]},{"label":"מטקון","detail":"EMOM 20 דקות, מחזור של ארבע דקות","items":[{"label":"דקה 1","detail":"Kettlebell Swings, 12 חזרות"},{"label":"דקה 2","detail":"Push-ups, 10 חזרות"},{"label":"דקה 3","detail":"Air Squats, 15 חזרות"},{"label":"דקה 4","detail":"מנוחה"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"קטלבל קל, שכיבות סמיכה מהספסל, 10 דקות בלבד."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"קטלבל כבד, 24 דקות, שכיבות סמיכה עם עצירה למטה."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'd1a8e2a1-4a89-45b7-9440-91db55b81b95'::uuid, 'seating-chart', 'סידורי הישיבה',
    'כולם צריכים מקום, ואף אחד לא ליד מי שהוא רוצה.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 18,
    array['dumbbell', 'bench', 'pullup_bar', 'treadmill']::text[], 'ארבע תחנות שצריך לסדר ביניהן, וכמו בסידורי ישיבה אמיתיים - הסדר שבחרתם בהתחלה יתפרק באמצע. תכננו איפה אתם עוצרים לפני שאתם מגיעים לשם.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Bench Press","detail":"5 חזרות"}]},{"label":"מטקון","detail":"AMRAP 18 דקות","items":[{"label":"Dumbbell Row","detail":"10 לכל יד"},{"label":"Bench Step-ups","detail":"12 לכל רגל"},{"label":"Pull-ups","detail":"6 חזרות"},{"label":"הליכון","detail":"200 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"משיכות בגומייה, מדרגה נמוכה, 12 דקות."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"משקולות כבדות, 24 דקות."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '623c05db-293d-4be1-9a45-269db5444277'::uuid, 'the-hora', 'הורה',
    'מעגל שלא נגמר, ואסור לעצור באמצע.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 20,
    array['kettlebell', 'barbell', 'treadmill', 'mat']::text[], 'חמישה סבבים במעגל אחד רצוף. אין תחנה שבה נוח - זה העניין בהורה. מי שיוצא מהר מדי בסבב הראשון מגלה את זה בסבב השלישי, וכולם בסוף שם.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3, מנוחה 2-3 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Deadlift","detail":"3 חזרות"}]},{"label":"מטקון","detail":"5 סבבים, למהירות","items":[{"label":"הליכון","detail":"400 מטר"},{"label":"Kettlebell Swings","detail":"20 חזרות"},{"label":"Burpees","detail":"12 חזרות"},{"label":"Sit-ups","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, 200 מטר בלבד, קטלבל קל."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"7 סבבים, קטלבל כבד, בלי לעצור בין תחנות."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'b7dc142b-e74a-4981-9207-2f6501cd916f'::uuid, 'first-dance', 'ריקוד ראשון',
    'איטי, כולם מסתכלים, ואי אפשר לזייף.', 'functional'::public.workout_category,
    'strength'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['barbell', 'bench', 'hip_thrust', 'treadmill']::text[], 'אימון טמפו. כל חזרה יורדת בשלוש שניות ועולה בשליטה, בלי תנופה ובלי לזייף את התחתית. זה האימון שבו מתגלה מי באמת שולט במשקל שלו - וכמו בריקוד ראשון, הכול פה במעבר בין הצעדים.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 6, טמפו 3 שניות בירידה. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Back Squat","detail":"6 חזרות"},{"label":"Romanian Deadlift","detail":"6 חזרות"}]},{"label":"מטקון","detail":"3 סבבים, לא לזמן","items":[{"label":"Hip Thrust","detail":"12 חזרות"},{"label":"Bench Press","detail":"10 חזרות"},{"label":"Plank","detail":"45 שניות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"משקל גוף בטמפו, 3 סטים."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"טמפו 4 שניות בירידה, שנייה עצירה בתחתית."}]'::jsonb,
    'weight'::public.score_type, null
  ),
  (
    '57209c15-ed33-402b-9586-99e73edbe821'::uuid, 'seven-blessings', 'שבע ברכות',
    'שבעה סבבים, ואחרי כל אחד עוד אחד.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 25,
    array['pullup_bar', 'dumbbell', 'treadmill', 'mat']::text[], 'שבעה סבבים של שבע חזרות. הכמות נראית קטנה על הדף וגדולה בסבב החמישי. המשקל צריך להיות כזה שהסבב האחרון עדיין נראה כמו הראשון.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"לעבוד עד סינגל כבד ליום, בלי לכשול. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Strict Press","detail":"סינגל כבד"}]},{"label":"מטקון","detail":"7 סבבים של 7 חזרות, למהירות","items":[{"label":"Dumbbell Thrusters","detail":"7 חזרות"},{"label":"Pull-ups","detail":"7 חזרות"},{"label":"Burpees","detail":"7 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"5 סבבים, משקולות קלות, משיכות בגומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"7 סבבים בלי לרדת מהמוט."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '53290e39-433d-482f-ba73-32db32a4e625'::uuid, 'open-bar', 'בר פתוח',
    'המוט זמין כל הערב. זאת לא בהכרח בשורה טובה.', 'crossfit'::public.workout_category,
    'strength'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, null,
    array['barbell', 'treadmill']::text[], 'הכול על המוט, מההתחלה ועד הסוף. חמישה מקטעי כוח רצופים עם מנוחות אמיתיות ביניהם. אין פה מטקון להתחבא בו - האימון הוא הטכניקה, וזה בדיוק מה שמקשה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 3 בכל תרגיל, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Power Clean","detail":"3 חזרות"},{"label":"Front Squat","detail":"3 חזרות"},{"label":"Push Press","detail":"3 חזרות"}]},{"label":"מטקון","detail":"10 דקות, קצב נוח","items":[{"label":"הליכון","detail":"10 דקות בעלייה קלה"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"מוט ריק לאורך כל האימון, עבודה על מסלול."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"לעלות במשקל בכל סט עד סינגל כבד."}]'::jsonb,
    'weight'::public.score_type, null
  ),
  (
    '4a6bfa5d-d97d-4d53-bf63-9477998e6dc1'::uuid, 'last-song', 'השיר האחרון',
    'כולם עייפים, אף אחד לא הולך.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, 12,
    array['kettlebell', 'mat', 'treadmill']::text[], 'שתים עשרה דקות אחרונות שבהן כבר אין מה לחסוך. קצב אחד לכל האורך, ומי שנשבר בדקה השמינית מסיים עם פחות סבבים ממי שיצא לאט.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"3 סטים של 10, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Goblet Squat","detail":"10 חזרות"}]},{"label":"מטקון","detail":"AMRAP 12 דקות","items":[{"label":"Kettlebell Swings","detail":"15 חזרות"},{"label":"Sit-ups","detail":"15 חזרות"},{"label":"הליכון","detail":"200 מטר"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"8 דקות, קטלבל קל, 100 מטר בהליכון."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"16 דקות, קטלבל כבד, 400 מטר בהליכון."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '3ac8f5b1-cb7c-4087-84a4-8323d403168d'::uuid, 'krantz', 'קראנצ''',
    'קלוע, מגולגל, ובסוף תמיד קצת יותר ממה שהתכוונתם.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['mat', 'pullup_bar', 'kettlebell']::text[], 'האימון של דני, ולכן כולו בטן. קראנץ׳ נקלע שכבה על שכבה, וכך גם זה: כל סבב מוסיף עוד קיפול על מה שכבר עייף. שומרים על הגב התחתון צמוד לרצפה - ברגע שהוא מתרומם, הסט נגמר.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"Dead Bug","detail":"8 לכל צד"},{"label":"Bird Dog","detail":"8 לכל צד"},{"label":"Hollow Hold","detail":"20 שניות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Farmer Carry","detail":"40 מטר"},{"label":"Suitcase Carry","detail":"20 מטר לכל צד"}]},{"label":"מטקון","detail":"5 סבבים, מנוחה דקה בין סבבים","items":[{"label":"Hanging Knee Raises","detail":"10 חזרות"},{"label":"Hollow Hold","detail":"30 שניות"},{"label":"Russian Twist","detail":"20 חזרות"},{"label":"Side Plank","detail":"30 שניות לכל צד"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"הרמות ברך בשכיבה, פלאנק צד מהברכיים, 3 סבבים."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"אצבעות למוט, הולו הולד 45 שניות, 6 סבבים."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    '93f5d17b-9704-45a5-8c21-36d1ed05b517'::uuid, 'croissant', 'קרואסון',
    'שלוש קיפולים, הרבה סבלנות, ואסור למהר.', 'pilates'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['mat', 'bands']::text[], 'בצק עלים נבנה מקיפול, מנוחה, וקיפול נוסף - וזה בדיוק המבנה כאן. כל תרגיל מגלגל את עמוד השדרה חוליה אחר חוליה, והאיטיות היא העבודה ולא ההפסקה ממנה.',
    '[{"label":"נשימה צידית בשכיבה","detail":"10 נשימות"},{"label":"הטיית אגן","detail":"10 חזרות"},{"label":"Cat-Cow","detail":"8 חזרות"},{"label":"גשר ירך איטי","detail":"10 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"3 סבבים, בשליטה מלאה","items":[{"label":"Roll Up","detail":"8 חזרות"},{"label":"Spine Stretch Forward","detail":"6 חזרות"},{"label":"Swan","detail":"8 חזרות"}]},{"label":"מטקון","detail":"3 סבבים, בלי מנוחה בין תרגילים","items":[{"label":"The Hundred","detail":"סדרה מלאה"},{"label":"Single Leg Stretch","detail":"10 לכל צד"},{"label":"Side Kick Series","detail":"10 לכל צד"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"ברכיים כפופות, סבב אחד של כל תרגיל."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"רגליים ישרות, גומייה, 4 סבבים."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '86e07269-1161-4997-acb2-44837657d815'::uuid, 'mille-feuille', 'מיל פיי',
    'אלף שכבות. נספור רק חלק מהן.', 'crossfit'::public.workout_category,
    'for_time'::public.workout_format,
    'advanced'::public.difficulty_level,
    60, 22,
    array['barbell', 'pullup_bar', 'mat', 'treadmill']::text[], 'סולם יורד: 21-15-9 על שלושה תרגילים, שכבה על שכבה. הסט של 21 הוא זה שקובע את כל השאר, אז חלקו אותו מראש ואל תחכו שהוא יחלק אתכם.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"מוט ריק: דדליפט, משיכה, דחיפה מעל הראש","detail":"5 מכל תרגיל, 2 סבבים"},{"label":"העלאה הדרגתית","detail":"3 סטים של 3, עולים עד המשקל שתעבדו בו"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Front Squat","detail":"5 חזרות"}]},{"label":"מטקון","detail":"21-15-9 חזרות, למהירות","items":[{"label":"Thrusters","detail":"מוט"},{"label":"Pull-ups","detail":"משיכות מתח"},{"label":"Sit-ups","detail":"כפיפות בטן"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"15-12-9, מוט ריק, משיכות בגומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"27-21-15, בלי לרדת מהמוט באמצע סט."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    '4726e9b6-aca3-4320-a4a2-92acb9360db2'::uuid, 'macaron', 'מקרון',
    'קטן, מדויק, ומתפרק אם ממהרים.', 'functional'::public.workout_category,
    'tabata'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['mat', 'kettlebell']::text[], 'עשרים שניות עבודה, עשר מנוחה, ארבעה בלוקים. הניקוד הוא סך החזרות - מה שמתגמל קצב אחיד ולא התפרצות בסבב הראשון. מקרון נשבר בדיוק מאותה סיבה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"3 סטים של 12, מנוחה דקה. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Goblet Squat","detail":"12 חזרות"}]},{"label":"מטקון","detail":"4 × טבאטה, 8 סבבים של 20/10, דקה בין בלוקים","items":[{"label":"בלוק 1","detail":"Kettlebell Swings"},{"label":"בלוק 2","detail":"Air Squats"},{"label":"בלוק 3","detail":"Push-ups"},{"label":"בלוק 4","detail":"Sit-ups"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"2 בלוקים, קטלבל קל, שכיבות מהספסל."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"6 בלוקים, קטלבל כבד."}]'::jsonb,
    'reps'::public.score_type, null
  ),
  (
    'd1dbc524-ad49-4382-9f99-9d3ef7cceab0'::uuid, 'proving-drawer', 'תפיחה',
    'שום דבר לא קורה, ואז הכול קורה.', 'yoga'::public.workout_category,
    'circuit'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['mat']::text[], 'שיעור ארוך ואיטי שכולו החזקות. בצק תופח כשמניחים לו, וגם ניידות. אין פה מה למהר אליו - התנוחה עושה את העבודה בדקה השנייה שלה, לא בראשונה.',
    '[{"label":"נשימת סרעפת בשכיבה","detail":"10 נשימות"},{"label":"Cat-Cow","detail":"10 חזרות"},{"label":"ברכת שמש א׳","detail":"3 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"מחזיקים 90 שניות בכל תנוחה, סבב אחד","items":[{"label":"Virabhadrasana II","detail":"90 שניות לכל צד"},{"label":"Utkatasana","detail":"90 שניות"},{"label":"Vasisthasana","detail":"60 שניות לכל צד"}]},{"label":"מטקון","detail":"מחזיקים 2-3 דקות בכל תנוחה","items":[{"label":"Pigeon","detail":"3 דקות לכל צד"},{"label":"Supta Matsyendrasana","detail":"2 דקות לכל צד"},{"label":"Uttanasana","detail":"2 דקות"}]}]'::jsonb,
    '[{"label":"Savasana","detail":"6 דקות"}]'::jsonb, '[{"level":"beginner","detail":"החזקות של 45 שניות, תמיכה בגליל או בשמיכה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"החזקות של 4 דקות בתנוחות הארוכות."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    '164ade7e-d710-4c98-908f-c3f440856b9a'::uuid, 'lemon-tart', 'טארט לימון',
    'חמוץ בהתחלה, ואחר כך עוד יותר.', 'crossfit'::public.workout_category,
    'emom'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['dumbbell', 'pullup_bar', 'treadmill']::text[], 'EMOM של 24 דקות. הדקה הראשונה תמיד מרגישה קלה מדי וזאת המלכודת - בדקה השתים עשרה המנוחה מצטמצמת לבד, בלי שאף אחד שינה את הכללים.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"},{"label":"תלייה פסיבית במתח","detail":"30 שניות, 2 סבבים"},{"label":"משיכת שכמות בתלייה","detail":"8 חזרות, 2 סבבים"},{"label":"שכיבות סמיכה על הספסל","detail":"10 חזרות, 2 סבבים"}]'::jsonb, '[{"label":"כוח","detail":"5 סטים של 5, מנוחה 2 דקות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Bent-over Row","detail":"5 חזרות"}]},{"label":"מטקון","detail":"EMOM 24 דקות, מחזור של שלוש דקות","items":[{"label":"דקה 1","detail":"Dumbbell Snatch, 12 חזרות"},{"label":"דקה 2","detail":"Pull-ups, 8 חזרות"},{"label":"דקה 3","detail":"הליכון, 200 מטר"}]}]'::jsonb,
    '[{"label":"מתיחת כתף צולבת","detail":"45 שניות לכל צד"},{"label":"מתיחת תלת ראשי מעל הראש","detail":"45 שניות לכל צד"},{"label":"פתיחת חזה בשכיבה על הספסל","detail":"90 שניות"},{"label":"נשימות עמוקות בישיבה","detail":"2 דקות"}]'::jsonb, '[{"level":"beginner","detail":"12 דקות, משקולת קלה, משיכות בגומייה."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"30 דקות, משקולת כבדה."}]'::jsonb,
    'completion'::public.score_type, null
  ),
  (
    'd2a5df76-8de9-430c-94c0-2830c62ed0fa'::uuid, 'babka', 'בבקה',
    'מגולגל פעמיים, ואז חותכים לאורך.', 'functional'::public.workout_category,
    'circuit'::public.workout_format,
    'intermediate'::public.difficulty_level,
    60, null,
    array['kettlebell', 'dumbbell', 'bench', 'mat']::text[], 'שני סבבים שנכרכים זה בזה - כל תרגיל דוחף וכל תרגיל שאחריו מושך. זה אימון שמרגיש מאוזן בסוף ולא בהתחלה, וזאת המטרה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"4 סבבים, מנוחה 90 שניות. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Dumbbell Bench Press","detail":"8 חזרות"},{"label":"Dumbbell Row","detail":"8 לכל יד"}]},{"label":"מטקון","detail":"4 סבבים, מנוחה דקה","items":[{"label":"Kettlebell Swings","detail":"15 חזרות"},{"label":"Renegade Rows","detail":"8 לכל צד"},{"label":"Bench Step-ups","detail":"10 לכל רגל"},{"label":"Plank Shoulder Taps","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"מתיחת מיתרי ברך בישיבה","detail":"60 שניות לכל צד"},{"label":"מתיחת שוקיים בקיר","detail":"45 שניות לכל צד"},{"label":"תנוחת ילד עם הושטה לצדדים","detail":"90 שניות"},{"label":"פתיחת גב עליון על הספסל","detail":"60 שניות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים, משקולות קלות, רנגייד מהברכיים."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"5 סבבים, משקולות כבדות."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
  ),
  (
    'cc604411-a788-45bf-a0e9-8deb1ff37acd'::uuid, 'eclair', 'אקלר',
    'ארוך, ישר, ובפנים זה רך.', 'functional'::public.workout_category,
    'for_time'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['treadmill', 'mat', 'bench']::text[], 'אימון אירובי ארוך עם עצירות קצרות. הקצב על ההליכון צריך להיות כזה שאפשר לדבר בו - אם אי אפשר, הורידו. האורך הוא העבודה, לא המהירות.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"3 סבבים, לא לזמן","items":[{"label":"Bench Step-ups","detail":"15 לכל רגל"},{"label":"Push-ups","detail":"12 חזרות"}]},{"label":"מטקון","detail":"4 סבבים, למהירות","items":[{"label":"הליכון","detail":"800 מטר"},{"label":"Sit-ups","detail":"20 חזרות"},{"label":"Air Squats","detail":"20 חזרות"}]}]'::jsonb,
    '[{"label":"הליכה קלה על ההליכון","detail":"3 דקות עד שהדופק יורד"},{"label":"נשימת קופסה בשכיבה","detail":"4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים"},{"label":"מתיחת ארבע ראשי בעמידה","detail":"45 שניות לכל צד"},{"label":"מתיחת חזה במשקוף","detail":"45 שניות"}]'::jsonb, '[{"level":"beginner","detail":"3 סבבים של 400 מטר."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"5 סבבים, קצב מרוץ."}]'::jsonb,
    'time'::public.score_type, null
  ),
  (
    'e0036194-4616-413e-ac0f-7d6ad96c6b50'::uuid, 'rugelach', 'רוגלך',
    'קטנים, ואי אפשר לאכול רק אחד.', 'crossfit'::public.workout_category,
    'amrap'::public.workout_format,
    'beginner'::public.difficulty_level,
    60, null,
    array['kettlebell', 'mat', 'bench']::text[], 'סבבים קצרצרים שנערמים. כל סבב לוקח פחות מדקה, ובדיוק בגלל זה קשה לעצור - וזאת בדיוק הבעיה בדקה החמש עשרה.',
    '[{"label":"הליכון","detail":"4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר"},{"label":"סיבובי כתפיים, ירך וקרסול","detail":"10 לכל כיוון"},{"label":"סקוואט משקל גוף","detail":"15 חזרות"},{"label":"גשר ירך","detail":"15 חזרות"}]'::jsonb, '[{"label":"כוח","detail":"4 סטים של 10, מנוחה דקה. המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.","items":[{"label":"Kettlebell Deadlift","detail":"10 חזרות"}]},{"label":"מטקון","detail":"AMRAP 15 דקות","items":[{"label":"Kettlebell Swings","detail":"10 חזרות"},{"label":"Push-ups","detail":"5 חזרות"},{"label":"Air Squats","detail":"10 חזרות"}]}]'::jsonb,
    '[{"label":"תנוחת יונה","detail":"90 שניות לכל צד"},{"label":"מתיחת כופפי ירך בכריעה","detail":"60 שניות לכל צד"},{"label":"פרפר בישיבה","detail":"60 שניות"},{"label":"סיבוב עמוד שדרה בשכיבה","detail":"60 שניות לכל צד"}]'::jsonb, '[{"level":"beginner","detail":"10 דקות, קטלבל קל."},{"level":"intermediate","detail":"לפי הפרוטוקול."},{"level":"advanced","detail":"20 דקות, קטלבל כבד."}]'::jsonb,
    'rounds_and_reps'::public.score_type, null
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
