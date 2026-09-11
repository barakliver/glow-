/**
 * Performance analytics.
 * Everything here is about output, consistency and recovery - never about
 * body appearance, calories or comparison between members.
 */
import type { Exercise, MovementCategory, WorkoutSession, WorkoutSet } from '@/lib/domain/types';

export interface PersonalRecord {
  exercise_id: string;
  kind: 'max_load' | 'max_reps' | 'max_volume' | 'max_duration' | 'max_distance';
  value: number;
  achieved_at: string;
  session_id: string;
}

export const PR_LABELS: Record<PersonalRecord['kind'], string> = {
  max_load: 'משקל שיא',
  max_reps: 'חזרות שיא',
  max_volume: 'נפח שיא בסט',
  max_duration: 'זמן שיא',
  max_distance: 'מרחק שיא',
};

export function setVolume(set: Pick<WorkoutSet, 'reps' | 'load_kg'>): number {
  return (set.reps ?? 0) * (set.load_kg ?? 0);
}

export function sessionVolume(sets: Pick<WorkoutSet, 'reps' | 'load_kg'>[]): number {
  return sets.reduce((sum, s) => sum + setVolume(s), 0);
}

/** Best value per exercise/kind across all recorded sets. */
export function computePersonalRecords(sets: WorkoutSet[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();

  const consider = (record: PersonalRecord) => {
    const key = `${record.exercise_id}:${record.kind}`;
    const current = best.get(key);
    if (!current || record.value > current.value) best.set(key, record);
  };

  for (const set of sets) {
    const base = {
      exercise_id: set.exercise_id,
      achieved_at: set.completed_at,
      session_id: set.session_id,
    };
    if (set.load_kg && set.load_kg > 0) consider({ ...base, kind: 'max_load', value: set.load_kg });
    if (set.reps && set.reps > 0) consider({ ...base, kind: 'max_reps', value: set.reps });
    const volume = setVolume(set);
    if (volume > 0) consider({ ...base, kind: 'max_volume', value: volume });
    if (set.duration_seconds && set.duration_seconds > 0)
      consider({ ...base, kind: 'max_duration', value: set.duration_seconds });
    if (set.distance_meters && set.distance_meters > 0)
      consider({ ...base, kind: 'max_distance', value: set.distance_meters });
  }

  return [...best.values()].sort(
    (a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime(),
  );
}

/**
 * Records achieved inside `sessionId`, comparing against everything recorded
 * before that session started.
 */
export function detectNewRecords(allSets: WorkoutSet[], sessionId: string): PersonalRecord[] {
  const sessionSets = allSets.filter((s) => s.session_id === sessionId);
  if (sessionSets.length === 0) return [];
  const earliest = Math.min(...sessionSets.map((s) => new Date(s.completed_at).getTime()));
  const historical = allSets.filter(
    (s) => s.session_id !== sessionId && new Date(s.completed_at).getTime() < earliest,
  );

  const historicalBest = new Map<string, number>();
  for (const record of computePersonalRecords(historical)) {
    historicalBest.set(`${record.exercise_id}:${record.kind}`, record.value);
  }

  const sessionRecords = computePersonalRecords(sessionSets);
  return sessionRecords.filter((record) => {
    const previous = historicalBest.get(`${record.exercise_id}:${record.kind}`);
    return previous === undefined || record.value > previous;
  });
}

export interface ProgressSummary {
  completedWorkouts: number;
  attendedClasses: number;
  totalMinutes: number;
  totalVolume: number;
  averageEffort: number | null;
  categoryBalance: { category: MovementCategory; count: number }[];
  weekly: { label: string; workouts: number; minutes: number; volume: number }[];
  consistencyPercent: number;
}

export function movementBalance(
  sets: WorkoutSet[],
  exercises: Exercise[],
): { category: MovementCategory; count: number }[] {
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const counts = new Map<MovementCategory, number>();
  for (const set of sets) {
    const exercise = byId.get(set.exercise_id);
    if (!exercise) continue;
    counts.set(exercise.movement_category, (counts.get(exercise.movement_category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function averageEffort(sessions: WorkoutSession[]): number | null {
  const values = sessions.map((s) => s.average_effort).filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

/** Share of weeks in the window that contain at least one completed workout. */
export function consistencyPercent(
  sessions: WorkoutSession[],
  weekKeys: string[],
  weekKeyOf: (iso: string) => string,
): number {
  if (weekKeys.length === 0) return 0;
  const active = new Set(
    sessions
      .filter((s) => s.status === 'completed' && s.completed_at)
      .map((s) => weekKeyOf(s.completed_at as string)),
  );
  const hit = weekKeys.filter((k) => active.has(k)).length;
  return Math.round((hit / weekKeys.length) * 100);
}
