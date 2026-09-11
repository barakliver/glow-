-- =============================================================================
-- GLoW demo seed for a local Supabase stack (`supabase db reset`).
-- Creates one owner, two trainers, five members, a full sample week of classes,
-- the exercise library, workout templates and public timer presets.
--
-- Passwordless auth is used in the app; the passwords below exist only so the
-- local stack can create auth users.
-- =============================================================================

set search_path = public;

-- --- organization ------------------------------------------------------------
insert into public.organizations (id, name, slug, timezone, week_starts_on,
                                  booking_cutoff_minutes, cancel_cutoff_minutes, waitlist_enabled)
values ('00000000-0000-4000-8000-000000000001', 'GLoW', 'glow', 'Asia/Jerusalem', 0, 30, 120, true)
on conflict (id) do nothing;

-- --- auth users + profiles ---------------------------------------------------
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_people jsonb := '[
    {"id":"00000000-0000-4000-8000-100000000001","email":"owner@glow.fit","name":"נועה ברק","phone":"050-1112233","role":"owner","level":"advanced"},
    {"id":"00000000-0000-4000-8000-100000000002","email":"idan@glow.fit","name":"עידן כהן","phone":"050-2223344","role":"trainer","level":"advanced"},
    {"id":"00000000-0000-4000-8000-100000000003","email":"maya@glow.fit","name":"מאיה לוי","phone":"050-3334455","role":"trainer","level":"advanced"},
    {"id":"00000000-0000-4000-8000-100000000004","email":"yuval@glow.fit","name":"יובל אדרי","phone":"052-4445566","role":"member","level":"intermediate"},
    {"id":"00000000-0000-4000-8000-100000000005","email":"tal@glow.fit","name":"טל שרון","phone":"052-5556677","role":"member","level":"beginner"},
    {"id":"00000000-0000-4000-8000-100000000006","email":"roni@glow.fit","name":"רוני גל","phone":"053-6667788","role":"member","level":"intermediate"},
    {"id":"00000000-0000-4000-8000-100000000007","email":"omer@glow.fit","name":"עומר נחום","phone":"054-7778899","role":"member","level":"advanced"},
    {"id":"00000000-0000-4000-8000-100000000008","email":"shira@glow.fit","name":"שירה פלד","phone":"054-8889900","role":"member","level":"beginner"}
  ]'::jsonb;
  v_person jsonb;
begin
  for v_person in select * from jsonb_array_elements(v_people) loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      (v_person ->> 'id')::uuid,
      'authenticated', 'authenticated',
      v_person ->> 'email',
      crypt('glow-demo-password', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_person ->> 'name', 'phone', v_person ->> 'phone')
    )
    on conflict (id) do nothing;

    insert into public.profiles (id, email, full_name, phone, experience_level, onboarding_completed)
    values ((v_person ->> 'id')::uuid, v_person ->> 'email', v_person ->> 'name',
            v_person ->> 'phone', (v_person ->> 'level')::public.difficulty_level, true)
    on conflict (id) do update
      set full_name = excluded.full_name, phone = excluded.phone,
          experience_level = excluded.experience_level, onboarding_completed = true;

    insert into public.memberships (organization_id, profile_id, role)
    values (v_org, (v_person ->> 'id')::uuid, (v_person ->> 'role')::public.member_role)
    on conflict (organization_id, profile_id) do update set role = excluded.role;
  end loop;
end $$;

-- --- trainers ----------------------------------------------------------------
insert into public.trainers (id, organization_id, profile_id, display_name, bio, specialties)
values
  ('00000000-0000-4000-8000-300000000001', '00000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-100000000002', 'עידן כהן',
   'מאמן כוח עם התמחות בתרגילי יסוד והתקדמות הדרגתית.',
   array['strength','functional']::public.training_category[]),
  ('00000000-0000-4000-8000-300000000002', '00000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-100000000003', 'מאיה לוי',
   'מתמחה במוביליטי, סיבולת ואימוני אינטרוולים.',
   array['mobility','tabata','conditioning']::public.training_category[])
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
  ('00000000-0000-4000-8000-900000000001','00000000-0000-4000-8000-000000000001','בסיס כוח - פלג גוף תחתון','בלוק כוח קלאסי סביב סקוואט ודדליפט.','strength','intermediate',60,'{barbell,kettlebell,mat}','{legs,glutes,core}','{squat,hinge,core}','00000000-0000-4000-8000-100000000002',true,true),
  ('00000000-0000-4000-8000-900000000002','00000000-0000-4000-8000-000000000001','דחיפה ומשיכה - 45 דקות','עבודת פלג גוף עליון מאוזנת.','strength','intermediate',45,'{barbell,dumbbell,pullup_bar}','{chest,back,shoulders}','{push,pull}','00000000-0000-4000-8000-100000000002',true,true),
  ('00000000-0000-4000-8000-900000000003','00000000-0000-4000-8000-000000000001','סיבולת מהירה - 20 דקות','מעגל קצר בעצימות גבוהה עם משקל גוף.','conditioning','intermediate',20,'{none}','{full_body,core}','{conditioning,core}','00000000-0000-4000-8000-100000000003',true,true),
  ('00000000-0000-4000-8000-900000000004','00000000-0000-4000-8000-000000000001','מוביליטי והתאוששות','רצף שחרור לאגן, גב עליון וכתפיים.','mobility','beginner',20,'{mat,bands}','{hips,thoracic,shoulders}','{mobility}','00000000-0000-4000-8000-100000000003',true,true),
  ('00000000-0000-4000-8000-900000000005','00000000-0000-4000-8000-000000000001','טכניקה - תרגילי יסוד','עבודה במשקלים קלים על איכות תנועה.','technique','beginner',30,'{dumbbell,mat}','{full_body}','{squat,hinge,push}','00000000-0000-4000-8000-100000000002',true,true),
  ('00000000-0000-4000-8000-900000000006','00000000-0000-4000-8000-000000000001','כושר כללי - 30 דקות','שילוב של כוח וסיבולת בזמן קצר.','general','beginner',30,'{dumbbell,kettlebell}','{full_body,legs}','{squat,push,conditioning}','00000000-0000-4000-8000-100000000001',true,true)
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

-- --- recurring class series + three weeks of occurrences ---------------------
do $$
declare
  v_org uuid := '00000000-0000-4000-8000-000000000001';
  v_t1 uuid := '00000000-0000-4000-8000-300000000001';
  v_t2 uuid := '00000000-0000-4000-8000-300000000002';
  -- weekday, time, title, category, difficulty, trainer, capacity, duration, equipment, description
  v_rows jsonb := '[
    [0,"07:00","אימון כוח","strength","intermediate",1,8,60,"{barbell,dumbbell}","אימון כוח מובנה סביב סקוואט, דדליפט ולחיצות."],
    [0,"18:30","אימון פונקציונלי","functional","beginner",2,10,45,"{kettlebell,box}","תחנות של דחיפה, משיכה, נשיאה וקפיצה."],
    [1,"06:30","טבאטה","tabata","intermediate",2,12,30,"{none}","שמונה סבבים של 20 שניות עבודה ו-10 שניות מנוחה."],
    [1,"19:00","אימון כוח","strength","advanced",1,6,60,"{barbell}","בלוק כוח מתקדם עם עבודה כבדה על תרגילי יסוד."],
    [2,"07:00","מוביליטי","mobility","beginner",2,12,30,"{mat,bands}","שחרור אגן, גב עליון וכתפיים."],
    [2,"18:30","אימון פונקציונלי","functional","intermediate",1,10,45,"{kettlebell,rower}","מעגלים מתמשכים עם דגש על טכניקה נקייה."],
    [3,"06:30","אימון כוח","strength","intermediate",1,8,60,"{barbell,dumbbell}","דגש על פלג גוף עליון עם עבודת ייצוב."],
    [3,"19:00","טבאטה","tabata","beginner",2,12,30,"{none}","גרסה נגישה של טבאטה עם משקל גוף בלבד."],
    [4,"07:00","אימון פתוח","open","intermediate",1,10,60,"{barbell,dumbbell,kettlebell}","מתאמנים לפי התוכנית האישית עם ליווי מהמאמן."],
    [5,"08:00","אימון פונקציונלי","functional","beginner",2,14,45,"{kettlebell,box,bands}","אימון סוף שבוע אנרגטי בקבוצה גדולה."],
    [6,"19:30","מוביליטי","mobility","beginner",2,12,30,"{mat}","פתיחת שבוע רגועה: נשימה וטווחי תנועה."]
  ]'::jsonb;
  v_row jsonb;
  v_series uuid;
  v_trainer uuid;
  v_week_start date := (date_trunc('week', (now() at time zone 'Asia/Jerusalem')::date + 1) - interval '1 day')::date;
  v_offset int;
  v_day date;
  v_starts timestamptz;
begin
  for v_row in select * from jsonb_array_elements(v_rows) loop
    v_trainer := case when (v_row ->> 5)::int = 1 then v_t1 else v_t2 end;

    insert into public.class_series (organization_id, title, description, category, difficulty,
                                     trainer_id, location, capacity, duration_minutes, equipment, recurrence)
    values (v_org, v_row ->> 2, v_row ->> 9, (v_row ->> 3)::public.training_category,
            (v_row ->> 4)::public.difficulty_level, v_trainer, 'אולם GLoW',
            (v_row ->> 6)::int, (v_row ->> 7)::int, (v_row ->> 8)::text[],
            jsonb_build_object(
              'weekdays', jsonb_build_array((v_row ->> 0)::int),
              'start_date', to_char(v_week_start - 7, 'YYYY-MM-DD'),
              'end_date', to_char(v_week_start + 21, 'YYYY-MM-DD'),
              'start_time', v_row ->> 1
            ))
    returning id into v_series;

    for v_offset in -1..1 loop
      v_day := v_week_start + (v_offset * 7) + (v_row ->> 0)::int;
      -- Build the gym-local wall clock, then interpret it in the gym timezone.
      -- The explicit ::timestamp cast is required: "at time zone" cannot take the
      -- untyped result of a string concatenation.
      v_starts := ((v_day::text || ' ' || (v_row ->> 1) || ':00')::timestamp at time zone 'Asia/Jerusalem');
      insert into public.classes (organization_id, series_id, title, description, category, difficulty,
                                  trainer_id, location, capacity, starts_at, ends_at, equipment, published)
      values (v_org, v_series, v_row ->> 2, v_row ->> 9, (v_row ->> 3)::public.training_category,
              (v_row ->> 4)::public.difficulty_level, v_trainer, 'אולם GLoW', (v_row ->> 6)::int,
              v_starts, v_starts + make_interval(mins => (v_row ->> 7)::int), (v_row ->> 8)::text[], true);
    end loop;
  end loop;
end $$;

-- --- sample bookings ---------------------------------------------------------
do $$
declare
  v_class record;
  v_member uuid;
  v_members uuid[] := array[
    '00000000-0000-4000-8000-100000000004',
    '00000000-0000-4000-8000-100000000005',
    '00000000-0000-4000-8000-100000000006',
    '00000000-0000-4000-8000-100000000007',
    '00000000-0000-4000-8000-100000000008'
  ];
  v_i int;
  v_confirmed int;
  v_wait int;
  v_class_index int := 0;
begin
  for v_class in select * from public.classes order by starts_at loop
    v_class_index := v_class_index + 1;
    v_confirmed := 0;
    v_wait := 0;
    for v_i in 1..array_length(v_members, 1) loop
      continue when (v_class_index + v_i * 3) % 4 = 0;
      v_member := v_members[v_i];
      if v_confirmed < v_class.capacity then
        v_confirmed := v_confirmed + 1;
        insert into public.bookings (organization_id, class_id, profile_id, status, booked_at)
        values (v_class.organization_id, v_class.id, v_member,
                case when v_class.starts_at < now() then 'attended'::public.booking_status
                     else 'confirmed'::public.booking_status end,
                v_class.starts_at - interval '2 days')
        on conflict (class_id, profile_id) do nothing;

        if v_class.starts_at < now() then
          insert into public.attendance (organization_id, class_id, profile_id, present, checked_in_at, method)
          values (v_class.organization_id, v_class.id, v_member, true, v_class.starts_at, 'manual')
          on conflict (class_id, profile_id) do nothing;
        end if;
      elsif v_class.starts_at > now() then
        v_wait := v_wait + 1;
        insert into public.bookings (organization_id, class_id, profile_id, status, waitlist_position, booked_at)
        values (v_class.organization_id, v_class.id, v_member, 'waitlisted', v_wait,
                v_class.starts_at - interval '1 day')
        on conflict (class_id, profile_id) do nothing;
      end if;
    end loop;
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

-- --- invitation link ---------------------------------------------------------
insert into public.invite_links (organization_id, token, label, created_by, expires_at)
values ('00000000-0000-4000-8000-000000000001', 'glow-demo-invite', 'הזמנה כללית לחברים',
        '00000000-0000-4000-8000-100000000001', now() + interval '30 days')
on conflict (token) do nothing;
