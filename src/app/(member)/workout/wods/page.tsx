import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { WorkoutLibraryBrowser } from './workout-library-browser';

export const metadata: Metadata = { title: 'מאגר האימונים' };

export default async function WorkoutLibraryPage() {
  await requireUser('/workout/wods');
  const repository = await getRepository();
  const workouts = await repository.listWorkouts();
  return <WorkoutLibraryBrowser workouts={workouts} />;
}
