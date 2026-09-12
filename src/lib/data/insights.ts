import 'server-only';
import { differenceInHours } from 'date-fns';
import type { Repository } from '@/lib/data/repository';
import {
  recommendWorkouts,
  type RecentWorkoutSummary,
  type Recommendation,
  type RecommendationInput,
} from '@/lib/domain/recommend';
import { computePersonalRecords } from '@/lib/domain/progress';
import { computeScore, type ScoreSummary } from '@/lib/domain/score';
import { dayKey, gymWeekStart, now, startOfMonth } from '@/lib/time';
import type { Equipment, Exercise, TrainingGoal, WorkoutSession } from '@/lib/domain/types';

/** Equipment that GLoW keeps in the gym; used when the member has not narrowed it. */
export const GYM_EQUIPMENT: Equipment[] = [
  'none',
  'barbell',
  'dumbbell',
  'kettlebell',
  'bands',
  'box',
  'rower',
  'bike',
  'pullup_bar',
  'mat',
  'medicine_ball',
];

function summarise(
  sessions: WorkoutSession[],
  exercises: Exercise[],
  reference: Date,
): RecentWorkoutSummary[] {
  const byId = new Map(exercises.map((e) => [e.id, e]));
  return sessions
    .filter((s) => s.status === 'completed' && s.completed_at)
    .slice(0, 12)
    .map((session) => {
      const items = session.exercises
        .map((item) => byId.get(item.exercise_id))
        .filter((e): e is Exercise => Boolean(e));
      return {
        hoursAgo: Math.max(0, differenceInHours(reference, new Date(session.completed_at as string))),
        movementCategories: [...new Set(items.map((e) => e.movement_category))],
        focusAreas: [...new Set(items.flatMap((e) => e.target_areas))],
        averageEffort: session.average_effort,
      };
    });
}

/** Assembles every input the rule engine needs and returns ranked suggestions. */
export async function buildRecommendations(
  repository: Repository,
  profileId: string,
  options: {
    preferredGoal?: TrainingGoal | null;
    availableEquipment?: Equipment[];
    availableMinutes?: number | null;
    limit?: number;
  } = {},
): Promise<{ recommendations: Recommendation[]; input: RecommendationInput }> {
  const reference = now();
  const [templates, sessions, exercises, readiness, bookings, profile] = await Promise.all([
    repository.listTemplates(),
    repository.listSessions(profileId, 12),
    repository.listExercises(),
    repository.getReadiness(profileId, dayKey(reference)),
    repository.listMyBookings(profileId),
    repository.getSessionUser(profileId),
  ]);

  const upcoming = bookings
    .filter(
      (row) =>
        (row.booking.status === 'confirmed' || row.booking.status === 'waitlisted') &&
        new Date(row.gymClass.starts_at).getTime() > reference.getTime(),
    )
    .sort(
      (a, b) => new Date(a.gymClass.starts_at).getTime() - new Date(b.gymClass.starts_at).getTime(),
    )[0];

  const input: RecommendationInput = {
    templates,
    recentWorkouts: summarise(sessions, exercises, reference),
    readiness: readiness
      ? {
          energy: readiness.energy,
          soreness: readiness.soreness,
          sleepQuality: readiness.sleep_quality,
          availableMinutes: options.availableMinutes ?? readiness.available_minutes,
        }
      : options.availableMinutes
        ? { energy: 3, soreness: 3, sleepQuality: 3, availableMinutes: options.availableMinutes }
        : null,
    availableEquipment: options.availableEquipment ?? GYM_EQUIPMENT,
    preferredGoal: options.preferredGoal ?? null,
    experienceLevel: profile?.profile.experience_level ?? 'beginner',
    upcomingClassInHours: upcoming
      ? Math.max(0, differenceInHours(new Date(upcoming.gymClass.starts_at), reference))
      : null,
    upcomingClassCategory: upcoming?.gymClass.category ?? null,
  };

  return { recommendations: recommendWorkouts(input, options.limit ?? 3), input };
}

/**
 * Assembles the ripeness score for one member.
 * Everything it counts is activity the member already generated - no new data
 * is collected for the sake of the score.
 */
export async function buildScore(
  repository: Repository,
  profileId: string,
): Promise<ScoreSummary> {
  const reference = now();
  const [sessions, bookings, readiness, sets] = await Promise.all([
    repository.listSessions(profileId, 500),
    repository.listMyBookings(profileId),
    repository.listReadiness(profileId, 400),
    repository.listSets(profileId),
  ]);

  return computeScore({
    completedWorkouts: sessions
      .filter((s) => s.status === 'completed' && s.completed_at)
      .map((s) => s.completed_at as string),
    attendedClasses: bookings
      .filter((row) => row.booking.status === 'attended')
      .map((row) => row.gymClass.starts_at),
    readinessDays: readiness.map((row) => row.log_date),
    personalRecords: computePersonalRecords(sets).length,
    now: reference,
    weekStart: gymWeekStart(reference),
    monthStart: startOfMonth(reference),
  });
}
