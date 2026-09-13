import type { ScoreType, WorkoutFormat, WorkoutLog } from '@/lib/domain/types';

/**
 * Turning a workout result into something a member can read, compare against
 * their own past, and get wrong in as few ways as possible.
 *
 * The only comparison this module makes is a member against themselves. GLoW
 * has no leaderboard and never ranks one member against another.
 */

/** The score a format implies when a workout does not say otherwise. */
export const DEFAULT_SCORE_TYPE: Record<WorkoutFormat, ScoreType> = {
  amrap: 'rounds_and_reps',
  for_time: 'time',
  emom: 'completion',
  tabata: 'reps',
  chipper: 'time',
  intervals: 'completion',
  strength: 'weight',
  circuit: 'rounds_and_reps',
  flow: 'completion',
};

/** Which fields a score type actually uses. Everything else stays null. */
export const SCORE_FIELDS: Record<
  ScoreType,
  { minutes?: true; seconds?: true; rounds?: true; reps?: true; weight?: true; completed?: true }
> = {
  time: { minutes: true, seconds: true },
  rounds_and_reps: { rounds: true, reps: true },
  reps: { reps: true },
  weight: { weight: true, reps: true },
  completion: { completed: true },
};

/** What the member is asked for, in Hebrew, above the fields. */
export const SCORE_PROMPTS: Record<ScoreType, string> = {
  time: 'כמה זמן לקח לסיים?',
  rounds_and_reps: 'כמה סבבים מלאים השלמת, וכמה חזרות נוספות?',
  reps: 'כמה חזרות בסך הכל?',
  weight: 'באיזה משקל סיימת, ובכמה חזרות?',
  completion: 'סיימת את האימון כפי שתוכנן?',
};

export type ScoreDraft = {
  minutes?: number | null;
  seconds?: number | null;
  rounds?: number | null;
  reps?: number | null;
  weightKg?: number | null;
  completed?: boolean | null;
};

/** The score columns of a log row. */
export type ScoreColumns = Pick<
  WorkoutLog,
  'result_seconds' | 'result_rounds' | 'result_reps' | 'result_weight_kg' | 'completed'
>;

export const EMPTY_SCORE: ScoreColumns = {
  result_seconds: null,
  result_rounds: null,
  result_reps: null,
  result_weight_kg: null,
  completed: null,
};

/**
 * Flattens the form draft into the columns for one score type, discarding
 * anything the type does not use. Without this a member who switches a workout
 * from For Time to AMRAP would carry a stale finishing time into the new row.
 */
export function scoreColumns(scoreType: ScoreType, draft: ScoreDraft): ScoreColumns {
  const fields = SCORE_FIELDS[scoreType];
  const seconds =
    fields.minutes || fields.seconds
      ? Math.max(0, (draft.minutes ?? 0) * 60 + (draft.seconds ?? 0))
      : null;
  return {
    result_seconds: seconds,
    result_rounds: fields.rounds ? (draft.rounds ?? 0) : null,
    result_reps: fields.reps ? (draft.reps ?? 0) : null,
    result_weight_kg: fields.weight ? (draft.weightKg ?? 0) : null,
    completed: fields.completed ? (draft.completed ?? false) : null,
  };
}

/** True when the row carries an actual result rather than an empty form. */
export function hasScore(scoreType: ScoreType, columns: ScoreColumns): boolean {
  switch (scoreType) {
    case 'time':
      return (columns.result_seconds ?? 0) > 0;
    case 'rounds_and_reps':
      return (columns.result_rounds ?? 0) > 0 || (columns.result_reps ?? 0) > 0;
    case 'reps':
      return (columns.result_reps ?? 0) > 0;
    case 'weight':
      return (columns.result_weight_kg ?? 0) > 0;
    case 'completion':
      return columns.completed !== null;
  }
}

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** mm:ss, or h:mm:ss once a workout runs past the hour (Murph does). */
export function formatSeconds(total: number): string {
  const safe = Math.max(0, Math.round(total));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours > 0) return `${hours}:${twoDigits(minutes)}:${twoDigits(seconds)}`;
  return `${minutes}:${twoDigits(seconds)}`;
}

/** The result as one short string, for a card or a history row. */
export function formatScore(scoreType: ScoreType, columns: ScoreColumns): string {
  switch (scoreType) {
    case 'time':
      return formatSeconds(columns.result_seconds ?? 0);
    case 'rounds_and_reps': {
      const rounds = columns.result_rounds ?? 0;
      const reps = columns.result_reps ?? 0;
      return reps > 0 ? `${rounds} + ${reps}` : String(rounds);
    }
    case 'reps':
      return `${columns.result_reps ?? 0}`;
    case 'weight': {
      const weight = columns.result_weight_kg ?? 0;
      const reps = columns.result_reps ?? 0;
      const kg = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
      return reps > 0 ? `${kg} ק״ג × ${reps}` : `${kg} ק״ג`;
    }
    case 'completion':
      return columns.completed ? 'הושלם' : 'לא הושלם';
  }
}

/** The unit that belongs beside the number. Empty where the value says it. */
export function scoreUnit(scoreType: ScoreType): string {
  switch (scoreType) {
    case 'rounds_and_reps':
      return 'סבבים + חזרות';
    case 'reps':
      return 'חזרות';
    default:
      return '';
  }
}

/** Higher is better for volume and load; lower is better for a finishing time. */
export function lowerIsBetter(scoreType: ScoreType): boolean {
  return scoreType === 'time';
}

/**
 * Ranks a result against the member's own earlier attempts at the same workout.
 * `null` when there is nothing to compare - the first attempt is not a setback.
 */
export function comparableValue(scoreType: ScoreType, columns: ScoreColumns): number | null {
  switch (scoreType) {
    case 'time':
      return columns.result_seconds ?? null;
    case 'rounds_and_reps':
      return (columns.result_rounds ?? 0) * 1000 + (columns.result_reps ?? 0);
    case 'reps':
      return columns.result_reps ?? null;
    case 'weight':
      return columns.result_weight_kg ?? null;
    case 'completion':
      return null;
  }
}

export type ProgressNote =
  | { kind: 'first' }
  | { kind: 'best' }
  | { kind: 'improved'; previous: string }
  | { kind: 'steady' };

/**
 * How this attempt sits against the member's own history of the same workout.
 * `history` is every earlier log for that workout, in any order.
 *
 * Rx and scaled attempts are compared separately: a scaled AMRAP with easier
 * movements will out-score an Rx one, and calling that a personal best would be
 * a lie the member has to untangle.
 */
export function progressNote(
  scoreType: ScoreType,
  current: Pick<WorkoutLog, 'rx'> & ScoreColumns,
  history: (Pick<WorkoutLog, 'rx'> & ScoreColumns)[],
): ProgressNote {
  const value = comparableValue(scoreType, current);
  const comparable = history
    .filter((entry) => entry.rx === current.rx)
    .map((entry) => ({ entry, value: comparableValue(scoreType, entry) }))
    .filter((entry): entry is { entry: ScoreColumns & { rx: boolean }; value: number } =>
      entry.value !== null,
    );

  if (value === null || comparable.length === 0) return { kind: 'first' };

  const better = lowerIsBetter(scoreType)
    ? Math.min(...comparable.map((e) => e.value))
    : Math.max(...comparable.map((e) => e.value));

  const isBest = lowerIsBetter(scoreType) ? value < better : value > better;
  if (isBest) {
    const previousEntry = comparable.find((e) => e.value === better);
    return previousEntry
      ? { kind: 'improved', previous: formatScore(scoreType, previousEntry.entry) }
      : { kind: 'best' };
  }
  return { kind: 'steady' };
}

export const PROGRESS_NOTE_TEXT: Record<ProgressNote['kind'], string> = {
  first: 'הפעם הראשונה שלך באימון הזה. מכאן יש למה להשוות.',
  best: 'התוצאה הטובה שלך באימון הזה.',
  improved: 'שיפרת את התוצאה הקודמת שלך.',
  steady: 'נרשם. לא כל אימון צריך להיות שיא.',
};
