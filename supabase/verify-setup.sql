-- =============================================================================
-- GLoW - post-setup check
--
-- Paste into the Supabase SQL editor and run after setup.sql.
-- Every row should read "תקין". Anything else points at what is missing.
-- =============================================================================

select
  bodeq.name        as "בדיקה",
  bodeq.found       as "נמצא",
  bodeq.expected    as "נדרש",
  case when bodeq.ok then 'תקין' else 'חסר' end as "סטטוס"
from (
  select 'מועדון' as name,
         (select count(*) from public.organizations)::text as found,
         '1' as expected,
         (select count(*) from public.organizations) = 1 as ok, 1 as sort
  union all
  select 'טבלאות',
         (select count(*)::text from pg_tables where schemaname = 'public'),
         '18',
         (select count(*) from pg_tables where schemaname = 'public') >= 18, 2
  union all
  select 'אבטחת שורות (RLS)',
         (select count(*) filter (where c.relrowsecurity)::text
            from pg_tables t
            join pg_class c on c.relname = t.tablename
                           and c.relnamespace = 'public'::regnamespace
           where t.schemaname = 'public'),
         '18',
         not exists (
           select 1 from pg_tables t
           join pg_class c on c.relname = t.tablename
                          and c.relnamespace = 'public'::regnamespace
           where t.schemaname = 'public' and not c.relrowsecurity
         ), 3
  union all
  select 'פונקציות הרשמה',
         (select count(*)::text from pg_proc
           where pronamespace = 'public'::regnamespace
             and proname in ('book_class','cancel_booking','set_booking_status',
                             'public_schedule','handle_new_user')),
         '5',
         (select count(*) from pg_proc
           where pronamespace = 'public'::regnamespace
             and proname in ('book_class','cancel_booking','set_booking_status',
                             'public_schedule','handle_new_user')) = 5, 4
  union all
  select 'טריגר משתמש חדש',
         (select count(*)::text from pg_trigger where tgname = 'on_auth_user_created'),
         '1',
         exists (select 1 from pg_trigger where tgname = 'on_auth_user_created'), 5
  union all
  select 'ספריית תרגילים',
         (select count(*)::text from public.exercises),
         '20',
         (select count(*) from public.exercises) >= 20, 6
  union all
  select 'תבניות אימון',
         (select count(*)::text from public.workout_templates where approved),
         '6',
         (select count(*) from public.workout_templates where approved) >= 6, 7
  union all
  select 'תרגילים בתבניות',
         (select count(*)::text from public.workout_template_exercises),
         '26',
         (select count(*) from public.workout_template_exercises) >= 26, 8
  union all
  select 'תבניות טיימר',
         (select count(*)::text from public.timer_presets where is_public),
         '3',
         (select count(*) from public.timer_presets where is_public) >= 3, 9
) as bodeq
order by bodeq.sort;
