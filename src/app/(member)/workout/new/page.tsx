import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { PersonalWorkoutBuilder } from './personal-builder';

export const metadata: Metadata = { title: 'בניית אימון אישי' };

export default async function NewWorkoutPage() {
  const user = await requireUser('/workout/new');
  const repository = await getRepository();
  const exercises = await repository.listExercises();
  return <PersonalWorkoutBuilder exercises={exercises} />;
}
