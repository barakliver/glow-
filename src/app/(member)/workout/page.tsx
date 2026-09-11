import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { buildRecommendations } from '@/lib/data/insights';
import { WorkoutHub } from './workout-hub';

export const metadata: Metadata = { title: 'אימון' };

export default async function WorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser('/workout');
  const repository = await getRepository();

  const [active, templates, exercises, { recommendations }] = await Promise.all([
    repository.getActiveSession(user.profile.id),
    repository.listTemplates(),
    repository.listExercises(),
    buildRecommendations(repository, user.profile.id, { limit: 3 }),
  ]);

  const detailed = await Promise.all(templates.map((t) => repository.getTemplate(t.id)));

  return (
    <WorkoutHub
      activeSession={active}
      templates={detailed.filter((t): t is NonNullable<typeof t> => Boolean(t))}
      exercises={exercises}
      initialRecommendations={recommendations}
      preselectedTemplateId={params.template ?? null}
    />
  );
}
