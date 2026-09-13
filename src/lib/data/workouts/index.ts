import type { Workout, WorkoutCategory } from '@/lib/domain/types';
import { CROSSFIT_WORKOUTS } from './crossfit';
import { FUNCTIONAL_WORKOUTS } from './functional';
import { PILATES_WORKOUTS } from './pilates';
import { YOGA_WORKOUTS } from './yoga';
import { toWorkout, type LibraryWorkout } from './types';

export * from './types';

/**
 * The shipped workout library.
 *
 * One source of truth: the demo adapter builds its in-memory rows from this
 * array, and `scripts/build-workout-library-sql.mjs` generates the migration
 * that seeds the same rows into PostgreSQL. Neither can drift from the other
 * because neither is written by hand.
 */
export const WORKOUT_LIBRARY: LibraryWorkout[] = [
  ...CROSSFIT_WORKOUTS,
  ...FUNCTIONAL_WORKOUTS,
  ...PILATES_WORKOUTS,
  ...YOGA_WORKOUTS,
];

export const WORKOUTS_BY_CATEGORY: Record<WorkoutCategory, LibraryWorkout[]> = {
  crossfit: CROSSFIT_WORKOUTS,
  functional: FUNCTIONAL_WORKOUTS,
  pilates: PILATES_WORKOUTS,
  yoga: YOGA_WORKOUTS,
};

function hash32(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

/**
 * A stable UUID for a library slug.
 *
 * The id has to be the same in the demo database and in PostgreSQL, or a class
 * created in one would point at nothing in the other. Deriving it from the slug
 * rather than generating it keeps the seed migration re-runnable: a second run
 * updates the same row instead of inserting a duplicate.
 */
export function workoutLibraryId(slug: string): string {
  const hex = [0x811c9dc5, 0x01000193, 0x27d4eb2f, 0x165667b1]
    .map((seed) => hash32(slug, seed).toString(16).padStart(8, '0'))
    .join('');
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

/** The library as repository rows, for an organization. */
export function libraryWorkouts(organizationId: string, timestamp: string): Workout[] {
  return WORKOUT_LIBRARY.map((entry) =>
    toWorkout(entry, {
      id: workoutLibraryId(entry.slug),
      organizationId,
      timestamp,
    }),
  );
}
