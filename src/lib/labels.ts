import type {
  BodyArea,
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

/** Hebrew plural helper for small counts. */
export function pluralHe(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}
