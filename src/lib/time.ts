import { format, formatISO, parseISO, startOfWeek, addDays, addMinutes, isSameDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

export const GYM_TIMEZONE = 'Asia/Jerusalem';
/** Sunday. date-fns weekStartsOn uses 0 = Sunday. */
export const WEEK_STARTS_ON = 0 as const;

export const HEBREW_WEEKDAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
export const HEBREW_WEEKDAYS_LONG = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
];

/** Current instant. Isolated so tests can freeze it. */
export function now(): Date {
  return new Date();
}

/** Converts a UTC instant into a Date shifted to gym-local wall clock. */
export function toGymTime(value: string | Date): Date {
  return toZonedTime(typeof value === 'string' ? parseISO(value) : value, GYM_TIMEZONE);
}

/** Builds a UTC instant from a gym-local date + time. */
export function fromGymTime(dateStr: string, timeStr: string): Date {
  return fromZonedTime(`${dateStr}T${timeStr}:00`, GYM_TIMEZONE);
}

export function toUtcIso(value: Date): string {
  return formatISO(value, { representation: 'complete' });
}

/** HH:mm in gym timezone, always 24h. */
export function formatTime(value: string | Date): string {
  return formatInTimeZone(typeof value === 'string' ? parseISO(value) : value, GYM_TIMEZONE, 'HH:mm');
}

/** yyyy-MM-dd key in gym timezone. */
export function dayKey(value: string | Date): string {
  return formatInTimeZone(
    typeof value === 'string' ? parseISO(value) : value,
    GYM_TIMEZONE,
    'yyyy-MM-dd',
  );
}

/** "יום ראשון, 12 בינואר" */
export function formatHebrewDate(value: string | Date): string {
  const zoned = toGymTime(value);
  return `יום ${HEBREW_WEEKDAYS_LONG[zoned.getDay()]}, ${format(zoned, 'd', { locale: he })} ב${format(zoned, 'MMMM', { locale: he })}`;
}

/** "12 בינואר 2026" */
export function formatHebrewFullDate(value: string | Date): string {
  const zoned = toGymTime(value);
  return `${format(zoned, 'd', { locale: he })} ב${format(zoned, 'MMMM', { locale: he })} ${format(zoned, 'yyyy')}`;
}

/** "12.01" */
export function formatShortDate(value: string | Date): string {
  return formatInTimeZone(
    typeof value === 'string' ? parseISO(value) : value,
    GYM_TIMEZONE,
    'dd.MM',
  );
}

export function formatDateTime(value: string | Date): string {
  return `${formatHebrewDate(value)} · ${formatTime(value)}`;
}

export function hebrewWeekdayShort(value: string | Date): string {
  return HEBREW_WEEKDAYS_SHORT[toGymTime(value).getDay()];
}

/** Sunday 00:00 gym-local of the week containing `value`, returned as UTC instant. */
export function gymWeekStart(value: string | Date): Date {
  const zoned = toGymTime(value);
  const start = startOfWeek(zoned, { weekStartsOn: WEEK_STARTS_ON });
  return fromGymTime(format(start, 'yyyy-MM-dd'), '00:00');
}

/** The 7 gym-local day keys of the week containing `value`. */
export function gymWeekDays(value: string | Date): string[] {
  const start = toGymTime(gymWeekStart(value));
  return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), 'yyyy-MM-dd'));
}

export function addWeeks(value: Date, weeks: number): Date {
  return addDays(value, weeks * 7);
}

export function isToday(value: string | Date): boolean {
  return isSameDay(toGymTime(value), toGymTime(now()));
}

export function minutesUntil(value: string | Date, from: Date = now()): number {
  const target = typeof value === 'string' ? parseISO(value) : value;
  return Math.round((target.getTime() - from.getTime()) / 60000);
}

/** "בעוד 3 שעות" / "לפני 20 דקות" */
export function relativeHebrew(value: string | Date, from: Date = now()): string {
  const diff = minutesUntil(value, from);
  const abs = Math.abs(diff);
  const future = diff >= 0;
  let text: string;
  if (abs < 1) return 'עכשיו';
  if (abs < 60) text = abs === 1 ? 'דקה' : `${abs} דקות`;
  else if (abs < 60 * 24) {
    const h = Math.round(abs / 60);
    text = h === 1 ? 'שעה' : `${h} שעות`;
  } else {
    const d = Math.round(abs / (60 * 24));
    text = d === 1 ? 'יום' : `${d} ימים`;
  }
  return future ? `בעוד ${text}` : `לפני ${text}`;
}

/** "45 דק׳" or "1:15 שעות" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} דק׳`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} שעות` : `${h}:${String(m).padStart(2, '0')} שעות`;
}

/** mm:ss for timers. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export { addDays, addMinutes, parseISO, format };
