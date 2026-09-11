import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { ExerciseLibrary } from './exercise-library';

export const metadata: Metadata = { title: 'ספריית תרגילים' };

export default async function LibraryPage() {
  await requireUser('/workout/library');
  const repository = await getRepository();
  const exercises = await repository.listExercises();
  return <ExerciseLibrary exercises={exercises} />;
}
