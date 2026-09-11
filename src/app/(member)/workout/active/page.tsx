import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser, getRepository } from '@/lib/auth';
import { ActiveWorkout } from './active-workout';

export const metadata: Metadata = { title: 'אימון פעיל' };

export default async function ActiveWorkoutPage() {
  const user = await requireUser('/workout/active');
  const repository = await getRepository();

  const session = await repository.getActiveSession(user.profile.id);
  if (!session) redirect('/workout');

  const [sets, exercises, history] = await Promise.all([
    repository.listSessionSets(session.id),
    repository.listExercises(),
    repository.listSets(user.profile.id),
  ]);

  return (
    <ActiveWorkout
      session={session}
      initialSets={sets}
      exercises={exercises}
      previousSets={history.filter((s) => s.session_id !== session.id)}
    />
  );
}
