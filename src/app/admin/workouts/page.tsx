import type { Metadata } from 'next';
import { requireStaff } from '@/lib/auth';
import { WorkoutWriter } from './workout-writer';

export const metadata: Metadata = { title: 'כתיבת אימון' };

export default async function WriteWorkoutPage() {
  await requireStaff();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-2xl tracking-tight">כתיבת אימון</h1>
        <p className="mt-1.5 text-sm text-muted">
          האימון נשמר במאגר וזמין לשיבוץ לכל שיעור, בדיוק כמו 111 האימונים שמגיעים עם האפליקציה.
        </p>
      </div>
      <WorkoutWriter />
    </div>
  );
}
