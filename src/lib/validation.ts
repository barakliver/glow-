import { z } from 'zod';

/** Israeli mobile format, tolerant of spaces and dashes. */
const PHONE_REGEX = /^0(5\d|[2-4]|[8-9]|7\d)[-\s]?\d{3}[-\s]?\d{4}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(9, 'מספר טלפון קצר מדי')
  .max(15, 'מספר טלפון ארוך מדי')
  .regex(PHONE_REGEX, 'מספר טלפון לא תקין. לדוגמה 050-1234567');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'נדרשת כתובת אימייל')
  .email('כתובת האימייל אינה תקינה');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'נדרש שם מלא')
  .max(60, 'השם ארוך מדי');

export const onboardingSchema = z.object({
  full_name: fullNameSchema,
  phone: phoneSchema,
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  returnTo: z.string().optional(),
});

export const readinessSchema = z.object({
  energy: z.coerce.number().int().min(1).max(5),
  soreness: z.coerce.number().int().min(1).max(5),
  sleep_quality: z.coerce.number().int().min(1).max(5),
  available_minutes: z.coerce.number().int().min(5, 'לפחות 5 דקות').max(240, 'עד 4 שעות'),
  note: z.string().trim().max(280, 'ההערה ארוכה מדי').optional().or(z.literal('')),
});
export type ReadinessInput = z.infer<typeof readinessSchema>;

export const classFormSchema = z
  .object({
    title: z.string().trim().min(2, 'נדרשת כותרת לשיעור').max(60),
    description: z.string().trim().max(600).optional().or(z.literal('')),
    category: z.enum(['strength', 'functional', 'tabata', 'mobility', 'open', 'conditioning']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    trainer_id: z.string().optional().or(z.literal('')),
    location: z.string().trim().min(1, 'נדרש מיקום').max(60),
    capacity: z.coerce.number().int().min(1, 'לפחות משתתף אחד').max(100, 'עד 100 משתתפים'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך לא תקין'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'שעה לא תקינה'),
    duration_minutes: z.coerce.number().int().min(10, 'לפחות 10 דקות').max(240, 'עד 4 שעות'),
    equipment: z.array(z.string()).default([]),
    published: z.boolean().default(true),
  })
  .strict();
export type ClassFormInput = z.infer<typeof classFormSchema>;

export const seriesFormSchema = classFormSchema
  .omit({ date: true })
  .extend({
    weekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'בחרו לפחות יום אחד'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך התחלה לא תקין'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'תאריך סיום לא תקין'),
  })
  .refine((value) => value.end_date >= value.start_date, {
    message: 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה',
    path: ['end_date'],
  });
export type SeriesFormInput = z.infer<typeof seriesFormSchema>;

export const exerciseFormSchema = z.object({
  name_he: z.string().trim().min(2, 'נדרש שם בעברית').max(60),
  name_en: z.string().trim().min(2, 'נדרש שם באנגלית').max(60),
  movement_category: z.enum(['squat', 'hinge', 'push', 'pull', 'carry', 'core', 'conditioning', 'mobility']),
  target_areas: z.array(z.string()).min(1, 'בחרו לפחות אזור אחד'),
  equipment: z.array(z.string()).min(1, 'בחרו ציוד או "ללא ציוד"'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.string().trim().min(5, 'נדרשות הוראות ביצוע').max(1200),
  safety_cues: z.string().trim().max(600).optional().or(z.literal('')),
  media_url: z.string().trim().url('כתובת לא תקינה').optional().or(z.literal('')),
});
export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;

export const templateItemSchema = z.object({
  exercise_id: z.string().min(1),
  block: z.enum(['warmup', 'main', 'finisher', 'cooldown']),
  sets: z.coerce.number().int().min(1).max(20).nullable().optional(),
  reps: z.coerce.number().int().min(1).max(200).nullable().optional(),
  load_kg: z.coerce.number().min(0).max(500).nullable().optional(),
  duration_seconds: z.coerce.number().int().min(1).max(3600).nullable().optional(),
  distance_meters: z.coerce.number().int().min(1).max(50000).nullable().optional(),
  rest_seconds: z.coerce.number().int().min(0).max(900).nullable().optional(),
  trainer_notes: z.string().trim().max(300).nullable().optional(),
  alternative_exercise_ids: z.array(z.string()).default([]),
});

export const templateFormSchema = z.object({
  title: z.string().trim().min(2, 'נדרשת כותרת').max(80),
  description: z.string().trim().max(600).optional().or(z.literal('')),
  goal: z.enum(['general', 'strength', 'conditioning', 'mobility', 'technique']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration_minutes: z.coerce.number().int().min(10).max(180),
  approved: z.boolean().default(true),
  suggestable: z.boolean().default(true),
  items: z.array(templateItemSchema).min(1, 'הוסיפו לפחות תרגיל אחד'),
});
export type TemplateFormInput = z.infer<typeof templateFormSchema>;

export const setLogSchema = z.object({
  session_id: z.string().min(1),
  exercise_id: z.string().min(1),
  position: z.coerce.number().int().min(1),
  set_index: z.coerce.number().int().min(1).max(50),
  reps: z.coerce.number().int().min(0).max(500).nullable().optional(),
  load_kg: z.coerce.number().min(0).max(500).nullable().optional(),
  duration_seconds: z.coerce.number().int().min(0).max(7200).nullable().optional(),
  distance_meters: z.coerce.number().int().min(0).max(50000).nullable().optional(),
  effort: z.coerce.number().int().min(1, 'בחרו מאמץ בין 1 ל-10').max(10).nullable().optional(),
  notes: z.string().trim().max(300).nullable().optional(),
  completed_at: z.string().optional(),
});
export type SetLogInput = z.infer<typeof setLogSchema>;

export const timerPresetSchema = z.object({
  name: z.string().trim().min(1, 'נדרש שם לתבנית').max(40),
  prepare_seconds: z.coerce.number().int().min(0).max(600),
  work_seconds: z.coerce.number().int().min(1, 'זמן עבודה חייב להיות לפחות שנייה').max(3600),
  rest_seconds: z.coerce.number().int().min(0).max(3600),
  rounds: z.coerce.number().int().min(1).max(99),
  sets: z.coerce.number().int().min(1).max(99),
  rest_between_sets_seconds: z.coerce.number().int().min(0).max(3600),
  cooldown_seconds: z.coerce.number().int().min(0).max(3600),
  is_public: z.boolean().default(false),
});
export type TimerPresetInput = z.infer<typeof timerPresetSchema>;

export const inviteFormSchema = z.object({
  label: z.string().trim().min(2, 'נדרשת כותרת להזמנה').max(60),
  expires_at: z.string().optional().or(z.literal('')),
  max_uses: z.coerce.number().int().min(1).max(1000).optional().nullable(),
});
export type InviteFormInput = z.infer<typeof inviteFormSchema>;

export const announcementSchema = z.object({
  title: z.string().trim().min(2, 'נדרשת כותרת').max(80),
  body: z.string().trim().min(2, 'נדרש תוכן להודעה').max(600),
});

export const gymSettingsSchema = z.object({
  name: z.string().trim().min(1).max(40),
  booking_cutoff_minutes: z.coerce.number().int().min(0).max(10080),
  cancel_cutoff_minutes: z.coerce.number().int().min(0).max(10080),
  waitlist_enabled: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  booking_confirmed: z.boolean(),
  waitlist_promoted: z.boolean(),
  class_cancelled: z.boolean(),
  class_time_changed: z.boolean(),
  class_reminder: z.boolean(),
  schedule_published: z.boolean(),
  announcement: z.boolean(),
  email_enabled: z.boolean(),
});

/** Turns a ZodError into a field -> Hebrew message map for React Hook Form. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
