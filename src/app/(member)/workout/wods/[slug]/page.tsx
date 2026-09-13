import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { WorkoutDetail } from '@/components/workout/workout-detail';
import { WorkoutHistoryList } from '@/components/workout/workout-history';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const repository = await getRepository();
  const workout = await repository.getWorkout(slug);
  return { title: workout?.title ?? 'אימון' };
}

export default async function WorkoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser(`/workout/wods/${slug}`);
  const repository = await getRepository();

  const workout = await repository.getWorkout(slug);
  if (!workout) notFound();

  const history = await repository.listWorkoutHistory(user.profile.id, workout.id);

  return (
    <div className="space-y-4">
      <PageHeader title={workout.title} backHref="/workout/wods" />
      <WorkoutDetail workout={workout} />
      {history.length > 0 && (
        <WorkoutHistoryList
          title="התוצאות שלך באימון הזה"
          entries={history.map((log) => ({ log, workout }))}
          showWorkoutTitle={false}
        />
      )}
    </div>
  );
}
