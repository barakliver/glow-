import type { Metadata } from 'next';
import { requireStaff, getRepository } from '@/lib/auth';
import { ExerciseManager } from './exercise-manager';

export const metadata: Metadata = { title: 'ספריית תרגילים' };

export default async function AdminExercisesPage() {
  await requireStaff();
  const repository = await getRepository();
  const exercises = await repository.listExercises(true);
  return <ExerciseManager exercises={exercises} />;
}
