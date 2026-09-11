-- =============================================================================
-- GLoW starter content
--
-- Everything a real club needs on day one, and nothing it does not: the club
-- record, the exercise library, six workout templates and three timer presets.
--
-- No demo people, classes or bookings are created here - the owner builds the
-- schedule from the app. For a fully populated demo instead, run seed.sql.
-- =============================================================================

set search_path = public;

-- --- organization ------------------------------------------------------------
-- A single club. Rename it later from the app: Admin -> Settings.
insert into public.organizations (id, name, slug, timezone, week_starts_on,
                                  booking_cutoff_minutes, cancel_cutoff_minutes, waitlist_enabled)
values ('00000000-0000-4000-8000-000000000001', 'GLoW', 'glow', 'Asia/Jerusalem', 0, 30, 120, true)
on conflict (id) do nothing;

-- --- exercise library --------------------------------------------------------
insert into public.exercises (organization_id, name_he, name_en, movement_category, target_areas, equipment, difficulty, instructions, safety_cues)
values
  ('00000000-0000-4000-8000-000000000001','סקוואט גבי','Back Squat','squat','{legs,glutes,core}','{barbell}','intermediate','עמידה ברוחב אגן, המוט על הגב העליון. יורדים באגן אחורה ומטה ועולים בדחיפה דרך כל כף הרגל.','שומרים על גב ניטרלי והברכיים בכיוון האצבעות.'),
  ('00000000-0000-4000-8000-000000000001','דדליפט','Deadlift','hinge','{back,glutes,legs}','{barbell}','advanced','המוט קרוב לשוקיים, דוחפים את הרצפה ומיישרים אגן וברכיים יחד.','ליבה נעולה, המוט צמוד לגוף.'),
  ('00000000-0000-4000-8000-000000000001','לחיצת חזה במוט','Bench Press','push','{chest,shoulders,arms}','{barbell}','intermediate','מורידים לאזור החזה התחתון ודוחפים למעלה.','שורשי כף יד ישרים, מרפקים ב-45 מעלות.'),
  ('00000000-0000-4000-8000-000000000001','מתח','Pull Up','pull','{back,arms,core}','{pullup_bar}','advanced','תלייה מלאה, מושכים את עצם החזה לכיוון המוט.','מתחילים מכתפיים פעילות.'),
  ('00000000-0000-4000-8000-000000000001','שכיבות סמיכה','Push Up','push','{chest,shoulders,core}','{none}','beginner','פלאנק גבוה, יורדים עד שהחזה קרוב לרצפה ודוחפים חזרה.','הגוף בקו אחד, אגן לא צונח.'),
  ('00000000-0000-4000-8000-000000000001','סוויינג קטלבל','Kettlebell Swing','hinge','{glutes,back,core}','{kettlebell}','intermediate','כפיפת ירך, מניפים את הקטלבל לגובה החזה בדחיפת אגן חדה.','התנועה מהאגן ולא מהידיים.'),
  ('00000000-0000-4000-8000-000000000001','גובלט סקוואט','Goblet Squat','squat','{legs,glutes}','{dumbbell}','beginner','מחזיקים משקולת מול החזה ויורדים לסקוואט עמוק.','חזה פתוח, עקבים על הרצפה.'),
  ('00000000-0000-4000-8000-000000000001','מכרעים בהליכה','Walking Lunge','squat','{legs,glutes,core}','{none}','beginner','צעד קדימה, יורדים עד שהברך האחורית קרובה לרצפה.','הברך הקדמית מעל כף הרגל.'),
  ('00000000-0000-4000-8000-000000000001','חתירה בהרכנה','Bent Over Row','pull','{back,arms}','{barbell}','intermediate','כפיפת ירך ל-45 מעלות, מושכים את המוט לבטן התחתונה.','בלי לזרוק את הגוף.'),
  ('00000000-0000-4000-8000-000000000001','פלאנק','Plank','core','{core,shoulders}','{mat}','beginner','נשענים על אמות וכפות רגליים בקו ישר.','אגן באמצע, נושמים ברציפות.'),
  ('00000000-0000-4000-8000-000000000001','הליכת חקלאי','Farmer Carry','carry','{core,shoulders,back}','{kettlebell}','beginner','אוחזים משקל כבד בשתי הידיים והולכים במסלול ישר.','כתפיים אחורה, צעדים יציבים.'),
  ('00000000-0000-4000-8000-000000000001','ברפי','Burpee','conditioning','{full_body}','{none}','intermediate','יורדים לשכיבת סמיכה, קופצים חזרה לעמידה וקפיצה קלה.','נחיתה רכה, נשימה יציבה.'),
  ('00000000-0000-4000-8000-000000000001','קפיצה על קופסה','Box Jump','conditioning','{legs,glutes}','{box}','intermediate','קפיצה דו-רגלית לקופסה ונחיתה מלאה.','נוחתים עם ברכיים רכות.'),
  ('00000000-0000-4000-8000-000000000001','חתירה במכשיר','Rowing Machine','conditioning','{back,legs,core}','{rower}','beginner','דחיפה מהרגליים, פתיחת אגן ולבסוף משיכת ידיים.','לא מושכים לפני שהרגליים סיימו.'),
  ('00000000-0000-4000-8000-000000000001','מתיחת מכופפי ירך','Hip Flexor Stretch','mobility','{hips,legs}','{mat}','beginner','עמידת אבירים, דוחפים אגן קדימה.','בלי לקשת את הגב התחתון.'),
  ('00000000-0000-4000-8000-000000000001','סיבוב גב עליון','Thoracic Rotation','mobility','{thoracic,shoulders}','{mat}','beginner','שכיבה על הצד, פותחים את היד העליונה לצד השני.','התנועה מהגב העליון.'),
  ('00000000-0000-4000-8000-000000000001','חתול פרה','Cat Cow','mobility','{thoracic,core}','{mat}','beginner','בשש, מתחלפים בין קימור לקישות עם הנשימה.','תנועה איטית וללא כאב.'),
  ('00000000-0000-4000-8000-000000000001','לחיצת כתפיים','Overhead Press','push','{shoulders,arms,core}','{barbell}','intermediate','דוחפים מעל הראש עד יישור מרפקים.','צלעות סגורות, בלי לקשת את הגב.'),
  ('00000000-0000-4000-8000-000000000001','מאונטן קלימברס','Mountain Climbers','conditioning','{core,shoulders}','{none}','beginner','מפלאנק גבוה, מביאים ברכיים לחזה לסירוגין.','אגן לא עולה.'),
  ('00000000-0000-4000-8000-000000000001','משיכת גומייה','Band Pull Apart','pull','{shoulders,back}','{bands}','beginner','פותחים גומייה לצדדים וסוגרים שכמות.','בלי להרים כתפיים לאוזניים.')
on conflict (organization_id, name_en) do nothing;

-- --- workout templates -------------------------------------------------------
insert into public.workout_templates (id, organization_id, title, description, goal, difficulty,
                                      duration_minutes, equipment, focus_areas, movement_categories,
                                      created_by, approved, suggestable)
values
  ('00000000-0000-4000-8000-900000000001','00000000-0000-4000-8000-000000000001','בסיס כוח - פלג גוף תחתון','בלוק כוח קלאסי סביב סקוואט ודדליפט.','strength','intermediate',60,'{barbell,kettlebell,mat}','{legs,glutes,core}','{squat,hinge,core}',null,true,true),
  ('00000000-0000-4000-8000-900000000002','00000000-0000-4000-8000-000000000001','דחיפה ומשיכה - 45 דקות','עבודת פלג גוף עליון מאוזנת.','strength','intermediate',45,'{barbell,dumbbell,pullup_bar}','{chest,back,shoulders}','{push,pull}',null,true,true),
  ('00000000-0000-4000-8000-900000000003','00000000-0000-4000-8000-000000000001','סיבולת מהירה - 20 דקות','מעגל קצר בעצימות גבוהה עם משקל גוף.','conditioning','intermediate',20,'{none}','{full_body,core}','{conditioning,core}',null,true,true),
  ('00000000-0000-4000-8000-900000000004','00000000-0000-4000-8000-000000000001','מוביליטי והתאוששות','רצף שחרור לאגן, גב עליון וכתפיים.','mobility','beginner',20,'{mat,bands}','{hips,thoracic,shoulders}','{mobility}',null,true,true),
  ('00000000-0000-4000-8000-900000000005','00000000-0000-4000-8000-000000000001','טכניקה - תרגילי יסוד','עבודה במשקלים קלים על איכות תנועה.','technique','beginner',30,'{dumbbell,mat}','{full_body}','{squat,hinge,push}',null,true,true),
  ('00000000-0000-4000-8000-900000000006','00000000-0000-4000-8000-000000000001','כושר כללי - 30 דקות','שילוב של כוח וסיבולת בזמן קצר.','general','beginner',30,'{dumbbell,kettlebell}','{full_body,legs}','{squat,push,conditioning}',null,true,true)
on conflict (id) do nothing;

do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_items jsonb := '[
    ["00000000-0000-4000-8000-900000000001","Cat Cow","warmup",1,1,null,null,90,null,null],
    ["00000000-0000-4000-8000-900000000001","Back Squat","main",2,5,5,60,null,null,150],
    ["00000000-0000-4000-8000-900000000001","Deadlift","main",3,3,5,80,null,null,180],
    ["00000000-0000-4000-8000-900000000001","Walking Lunge","main",4,3,20,null,null,null,90],
    ["00000000-0000-4000-8000-900000000001","Plank","cooldown",5,3,null,null,45,null,45],
    ["00000000-0000-4000-8000-900000000002","Band Pull Apart","warmup",1,2,15,null,null,null,null],
    ["00000000-0000-4000-8000-900000000002","Bench Press","main",2,4,6,50,null,null,150],
    ["00000000-0000-4000-8000-900000000002","Pull Up","main",3,4,6,null,null,null,150],
    ["00000000-0000-4000-8000-900000000002","Overhead Press","main",4,3,8,30,null,null,120],
    ["00000000-0000-4000-8000-900000000002","Farmer Carry","finisher",5,3,null,null,null,40,60],
    ["00000000-0000-4000-8000-900000000003","Mountain Climbers","warmup",1,1,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000003","Burpee","main",2,4,null,null,40,null,20],
    ["00000000-0000-4000-8000-900000000003","Box Jump","main",3,4,10,null,null,null,40],
    ["00000000-0000-4000-8000-900000000003","Push Up","main",4,4,12,null,null,null,40],
    ["00000000-0000-4000-8000-900000000004","Cat Cow","warmup",1,2,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000004","Hip Flexor Stretch","main",2,2,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000004","Thoracic Rotation","main",3,2,null,null,60,null,null],
    ["00000000-0000-4000-8000-900000000004","Band Pull Apart","cooldown",4,2,20,null,null,null,null],
    ["00000000-0000-4000-8000-900000000005","Goblet Squat","main",1,3,8,12,null,null,90],
    ["00000000-0000-4000-8000-900000000005","Kettlebell Swing","main",2,3,12,16,null,null,90],
    ["00000000-0000-4000-8000-900000000005","Push Up","main",3,3,8,null,null,null,60],
    ["00000000-0000-4000-8000-900000000005","Plank","cooldown",4,2,null,null,40,null,null],
    ["00000000-0000-4000-8000-900000000006","Goblet Squat","main",1,3,12,16,null,null,60],
    ["00000000-0000-4000-8000-900000000006","Push Up","main",2,3,10,null,null,null,60],
    ["00000000-0000-4000-8000-900000000006","Kettlebell Swing","main",3,3,15,16,null,null,60],
    ["00000000-0000-4000-8000-900000000006","Mountain Climbers","finisher",4,3,null,null,40,null,30]
  ]'::jsonb;
  v_item jsonb;
  v_exercise uuid;
begin
  for v_item in select * from jsonb_array_elements(v_items) loop
    select id into v_exercise from public.exercises
    where organization_id = v_org and name_en = (v_item ->> 1);
    if v_exercise is not null then
      insert into public.workout_template_exercises
        (template_id, exercise_id, block, position, sets, reps, load_kg, duration_seconds, distance_meters, rest_seconds)
      values (
        (v_item ->> 0)::uuid, v_exercise, (v_item ->> 2)::public.template_block, (v_item ->> 3)::int,
        (v_item ->> 4)::int, (v_item ->> 5)::int, (v_item ->> 6)::numeric,
        (v_item ->> 7)::int, (v_item ->> 8)::int, (v_item ->> 9)::int
      )
      on conflict (template_id, position) do nothing;
    end if;
  end loop;
end $$;

-- --- public timer presets ----------------------------------------------------
insert into public.timer_presets (organization_id, profile_id, name, prepare_seconds, work_seconds,
                                  rest_seconds, rounds, sets, rest_between_sets_seconds, cooldown_seconds, is_public)
values
  ('00000000-0000-4000-8000-000000000001', null, 'טבאטה קלאסי', 10, 20, 10, 8, 1, 60, 0, true),
  ('00000000-0000-4000-8000-000000000001', null, 'EMOM 10 דקות', 15, 45, 15, 10, 1, 0, 60, true),
  ('00000000-0000-4000-8000-000000000001', null, 'אינטרוולים 40/20', 10, 40, 20, 6, 3, 90, 120, true)
on conflict do nothing;
