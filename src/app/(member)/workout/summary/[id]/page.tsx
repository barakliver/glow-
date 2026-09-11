import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireUser, getRepository } from '@/lib/auth';
import { detectNewRecords, sessionVolume } from '@/lib/domain/progress';
import { WorkoutSummary } from './workout-summary';

export const metadata: Metadata = { title: 'סיכום אימון' };

/**
 * Dedicated route for the post-workout summary.
 * Keeping it separate from /workout/active means revalidation of the active
 * session cannot redirect the member away before they see their records, and a
 * refresh still shows the same summary.
 */
export default async function WorkoutSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/workout/summary/${id}`);
  const repository = await getRepository();

  const session = await repository.getSession(id);
  if (!session || session.profile_id !== user.profile.id) notFound();
  if (session.status === 'active') redirect('/workout/active');

  const [sessionSets, allSets, exercises] = await Promise.all([
    repository.listSessionSets(id),
    repository.listSets(user.profile.id),
    repository.listExercises(true),
  ]);

  const names = Object.fromEntries(exercises.map((e) => [e.id, e.name_he]));
  const records = detectNewRecords(allSets, id).map((record) => ({
    ...record,
    exerciseName: names[record.exercise_id] ?? 'תרגיל',
  }));

  return (
    <WorkoutSummary
      title={session.title}
      totalSeconds={session.total_seconds ?? 0}
      setCount={sessionSets.length}
      volume={Math.round(sessionVolume(sessionSets))}
      averageEffort={session.average_effort}
      notes={session.notes}
      records={records}
    />
  );
}
