import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { LogActivityForm } from '../log-activity-form';
import { dayKey, now } from '@/lib/time';

export const metadata: Metadata = { title: 'רישום אימון' };

export default async function LogActivityPage() {
  await requireUser('/tracking/new');
  const repository = await getRepository();
  const exercises = await repository.listExercises();

  return (
    <div className="space-y-8">
      <PageHeader
        title="רישום אימון"
        subtitle="הכול חוץ מהכותרת והתאריך הוא רשות"
        backHref="/tracking"
      />
      <LogActivityForm exercises={exercises} today={dayKey(now())} />
    </div>
  );
}
