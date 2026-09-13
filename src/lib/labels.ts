import type {
  BodyArea,
  ScoreType,
  WorkoutCategory,
  WorkoutFormat,
  BookingStatus,
  Difficulty,
  Equipment,
  MovementCategory,
  NotificationType,
  Role,
  TrainingCategory,
  TrainingGoal,
} from '@/lib/domain/types';

export const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  strength: 'אימון כוח',
  functional: 'אימון פונקציונלי',
  tabata: 'טבאטה',
  mobility: 'מוביליטי',
  open: 'אימון פתוח',
  conditioning: 'סיבולת',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'מתחילים',
  intermediate: 'בינוני',
  advanced: 'מתקדמים',
};

export const MOVEMENT_LABELS: Record<MovementCategory, string> = {
  squat: 'סקוואט',
  hinge: 'כפיפת ירך',
  push: 'דחיפה',
  pull: 'משיכה',
  carry: 'נשיאה',
  core: 'ליבה',
  conditioning: 'סיבולת',
  mobility: 'מוביליטי',
};

export const AREA_LABELS: Record<BodyArea, string> = {
  legs: 'רגליים',
  glutes: 'ישבן',
  back: 'גב',
  chest: 'חזה',
  shoulders: 'כתפיים',
  arms: 'ידיים',
  core: 'ליבה',
  full_body: 'כל הגוף',
  hips: 'אגן',
  thoracic: 'גב עליון',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'ללא ציוד',
  barbell: 'מוט',
  dumbbell: 'משקולות יד',
  kettlebell: 'קטלבל',
  bands: 'גומיות',
  box: 'קופסה',
  rower: 'מכשיר חתירה',
  bike: 'אופני כושר',
  rings: 'טבעות',
  pullup_bar: 'מתח',
  mat: 'מזרן',
  jump_rope: 'חבל קפיצה',
  bench: 'ספסל',
  treadmill: 'הליכון',
  hip_thrust: 'היפ תראסט',
  medicine_ball: 'כדור כוח',
};

export const GOAL_LABELS: Record<TrainingGoal, string> = {
  general: 'כושר כללי',
  strength: 'כוח',
  conditioning: 'סיבולת',
  mobility: 'מוביליטי',
  technique: 'טכניקה',
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'בעלים',
  trainer: 'מאמן',
  member: 'מתאמן',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'רשום',
  waitlisted: 'רשימת המתנה',
  cancelled: 'בוטל',
  attended: 'נכח',
  absent: 'לא הגיע',
};

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  booking_confirmed: 'אישור רישום',
  waitlist_promoted: 'קידום מרשימת המתנה',
  class_cancelled: 'ביטול שיעור',
  class_time_changed: 'שינוי שעה',
  class_reminder: 'תזכורת לשיעור',
  schedule_published: 'לוח שבועי חדש',
  announcement: 'הודעת מאמן',
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value: value as TrainingCategory,
  label,
}));

export const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
  value: value as Difficulty,
  label,
}));

export const EQUIPMENT_OPTIONS = Object.entries(EQUIPMENT_LABELS).map(([value, label]) => ({
  value: value as Equipment,
  label,
}));

export const GOAL_OPTIONS = Object.entries(GOAL_LABELS).map(([value, label]) => ({
  value: value as TrainingGoal,
  label,
}));

export const MOVEMENT_OPTIONS = Object.entries(MOVEMENT_LABELS).map(([value, label]) => ({
  value: value as MovementCategory,
  label,
}));

export const AREA_OPTIONS = Object.entries(AREA_LABELS).map(([value, label]) => ({
  value: value as BodyArea,
  label,
}));

export const WORKOUT_CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  crossfit: 'קרוספיט',
  functional: 'פונקציונלי',
  pilates: 'פילאטיס',
  yoga: 'יוגה ותנועתיות',
};

export const WORKOUT_FORMAT_LABELS: Record<WorkoutFormat, string> = {
  amrap: 'AMRAP',
  for_time: 'For Time',
  emom: 'EMOM',
  tabata: 'טבאטה',
  chipper: "צ'יפר",
  intervals: 'אינטרוולים',
  strength: 'כוח',
  circuit: 'מעגל',
  flow: 'פלואו',
};

/** What the format means, in one line, for someone who has not met it before. */
export const WORKOUT_FORMAT_HINTS: Record<WorkoutFormat, string> = {
  amrap: 'כמה שיותר סבבים בזמן נתון.',
  for_time: 'לסיים את העבודה במהירות האפשרית.',
  emom: 'בתחילת כל דקה מבצעים את העבודה ונחים את שארית הדקה.',
  tabata: 'שמונה סבבים של 20 שניות עבודה ו-10 שניות מנוחה.',
  chipper: 'רשימת תרגילים ארוכה שעוברים פעם אחת, מלמעלה למטה.',
  intervals: 'מקטעי עבודה קבועים עם מנוחה מתוכננת ביניהם.',
  strength: 'סטים וחזרות עם התקדמות במשקל.',
  circuit: 'תחנות שעוברים במעגל, סבב אחרי סבב.',
  flow: 'רצף תנועה מתמשך לפי קצב הנשימה.',
};

export const SCORE_TYPE_LABELS: Record<ScoreType, string> = {
  time: 'זמן סיום',
  rounds_and_reps: 'סבבים וחזרות',
  reps: 'סך חזרות',
  weight: 'משקל',
  completion: 'השלמה',
};

export const WORKOUT_CATEGORY_OPTIONS = Object.entries(WORKOUT_CATEGORY_LABELS).map(
  ([value, label]) => ({ value: value as WorkoutCategory, label }),
);

export const WORKOUT_FORMAT_OPTIONS = Object.entries(WORKOUT_FORMAT_LABELS).map(
  ([value, label]) => ({ value: value as WorkoutFormat, label }),
);

/** Hebrew plural helper for small counts. */
export function pluralHe(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
