import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { ProgressView } from './progress-view';
import {
  computePersonalRecords,
  movementBalance,
  sessionVolume,
  averageEffort,
} from '@/lib/domain/progress';
import { addDays, dayKey, gymWeekStart, now } from '@/lib/time';
import { MOVEMENT_LABELS } from '@/lib/labels';
import type { WorkoutSet } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'התקדמות' };

export type RangeKey = 'week' | 'month' | 'quarter';

const RANGE_DAYS: Record<RangeKey, number> = { week: 7, month: 30, quarter: 90 };

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: RangeKey }>;
}) {
  const params = await searchParams;
  const range: RangeKey = (['week', 'month', 'quarter'] as const).includes(params.range as RangeKey)
    ? (params.range as RangeKey)
    : 'month';

  const user = await requireUser('/progress');
  const repository = await getRepository();
  const reference = now();
  const since = addDays(reference, -RANGE_DAYS[range]);

  const [sessions, allSets, exercises, bookings] = await Promise.all([
    repository.listSessions(user.profile.id, 200),
    repository.listSets(user.profile.id),
    repository.listExercises(true),
    repository.listMyBookings(user.profile.id),
  ]);

  const sessionIds = new Set(sessions.map((s) => s.id));
  const setsInRange = allSets.filter(
    (set) => sessionIds.has(set.session_id) && new Date(set.completed_at).getTime() >= since.getTime(),
  );

  const completedSessions = sessions.filter(
    (s) =>
      s.status === 'completed' &&
      s.completed_at &&
      new Date(s.completed_at).getTime() >= since.getTime(),
  );

  const attendedClasses = bookings.filter(
    (row) =>
      row.booking.status === 'attended' &&
      new Date(row.gymClass.starts_at).getTime() >= since.getTime(),
  );

  const totalMinutes =
    completedSessions.reduce((sum, s) => sum + (s.total_seconds ?? 0), 0) / 60 +
    attendedClasses.reduce(
      (sum, row) =>
        sum +
        (new Date(row.gymClass.ends_at).getTime() - new Date(row.gymClass.starts_at).getTime()) /
          60000,
      0,
    );

  // Weekly buckets for the trend charts.
  const weeks: { key: string; label: string; workouts: number; minutes: number; volume: number }[] = [];
  const weekCount = range === 'week' ? 4 : range === 'month' ? 6 : 13;
  for (let i = weekCount - 1; i >= 0; i -= 1) {
    const start = gymWeekStart(addDays(reference, -i * 7));
    const end = addDays(start, 7);
    const inWeek = (iso: string) => {
      const t = new Date(iso).getTime();
      return t >= start.getTime() && t < end.getTime();
    };
    const weekSessions = sessions.filter(
      (s) => s.status === 'completed' && s.completed_at && inWeek(s.completed_at),
    );
    const weekSessionIds = new Set(weekSessions.map((s) => s.id));
    const weekSets = allSets.filter((set) => weekSessionIds.has(set.session_id));
    weeks.push({
      key: dayKey(start),
      label: dayKey(start).slice(5).split('-').reverse().join('.'),
      workouts: weekSessions.length,
      minutes: Math.round(weekSessions.reduce((sum, s) => sum + (s.total_seconds ?? 0), 0) / 60),
      volume: Math.round(sessionVolume(weekSets)),
    });
  }

  const activeWeeks = weeks.filter((w) => w.workouts > 0).length;
  const consistency = weeks.length === 0 ? 0 : Math.round((activeWeeks / weeks.length) * 100);

  const balance = movementBalance(setsInRange, exercises).map((entry) => ({
    label: MOVEMENT_LABELS[entry.category],
    value: entry.count,
  }));

  const records = computePersonalRecords(allSets).slice(0, 8);
  const exerciseNames = Object.fromEntries(exercises.map((e) => [e.id, e.name_he]));

  const exerciseHistory = buildExerciseHistory(allSets, exercises.map((e) => ({ id: e.id, name: e.name_he })));

  return (
    <ProgressView
      range={range}
      stats={{
        workouts: completedSessions.length,
        classes: attendedClasses.length,
        minutes: Math.round(totalMinutes),
        volume: Math.round(sessionVolume(setsInRange)),
        averageEffort: averageEffort(completedSessions),
        consistency,
      }}
      weeks={weeks}
      balance={balance}
      records={records.map((r) => ({
        ...r,
        exerciseName: exerciseNames[r.exercise_id] ?? 'תרגיל',
      }))}
      notes={completedSessions
        .filter((s) => s.notes)
        .slice(0, 8)
        .map((s) => ({
          id: s.id,
          title: s.title,
          date: s.completed_at as string,
          note: s.notes as string,
          effort: s.average_effort,
        }))}
      exerciseHistory={exerciseHistory}
    />
  );
}

function buildExerciseHistory(
  sets: WorkoutSet[],
  exercises: { id: string; name: string }[],
): { id: string; name: string; points: { label: string; value: number }[] }[] {
  const byExercise = new Map<string, WorkoutSet[]>();
  for (const set of sets) {
    if (!set.load_kg && !set.reps) continue;
    const list = byExercise.get(set.exercise_id) ?? [];
    list.push(set);
    byExercise.set(set.exercise_id, list);
  }

  return exercises
    .map((exercise) => {
      const list = (byExercise.get(exercise.id) ?? []).sort(
        (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime(),
      );
      if (list.length < 2) return null;
      // Best set per session day.
      const byDay = new Map<string, number>();
      for (const set of list) {
        const key = dayKey(set.completed_at);
        const value = set.load_kg ?? set.reps ?? 0;
        byDay.set(key, Math.max(byDay.get(key) ?? 0, value));
      }
      const points = [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-8)
        .map(([key, value]) => ({
          label: key.slice(5).split('-').reverse().join('.'),
          value,
        }));
      return { id: exercise.id, name: exercise.name, points };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .slice(0, 12);
}
