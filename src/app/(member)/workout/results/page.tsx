import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { WorkoutHistoryList } from '@/components/workout/workout-history';

export const metadata: Metadata = { title: 'התוצאות שלי' };

export default async function WorkoutResultsPage() {
  const user = await requireUser('/workout/results');
  const repository = await getRepository();
  const entries = await repository.listWorkoutLogs(user.profile.id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="התוצאות שלי"
        subtitle="כל אימון שרשמת, מהחדש לישן"
        backHref="/workout"
      />
      {entries.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="עוד לא רשמת תוצאות"
          description="אחרי שיעור שנרשמת אליו, טופס רישום התוצאה מופיע בעמוד השיעור."
          action={
            <Button asChild variant="secondary">
              <Link href="/schedule">ללוח השיעורים</Link>
            </Button>
          }
        />
      ) : (
        <WorkoutHistoryList title={`${entries.length} תוצאות`} entries={entries} />
      )}
    </div>
  );
}
