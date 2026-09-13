import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { AbJackpot } from './ab-jackpot';

export const metadata: Metadata = { title: 'ג׳קפוט הבטן' };

export default async function JackpotPage() {
  await requireUser('/jackpot');
  const repository = await getRepository();
  const exercises = await repository.listExercises();
  const core = exercises.filter((exercise) => exercise.movement_category === 'core');

  return (
    <div className="space-y-6">
      <PageHeader
        title="ג׳קפוט הבטן"
        subtitle="משיכה אחת, שלושה תרגילי ליבה"
        backHref="/workout"
      />
      <AbJackpot pool={core} />
    </div>
  );
}
