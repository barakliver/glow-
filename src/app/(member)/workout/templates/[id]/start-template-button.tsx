'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { startWorkoutAction } from '@/app/actions/workout';
import type { TrainingGoal, WorkoutSessionExercise } from '@/lib/domain/types';

export function StartTemplateButton({
  templateId,
  title,
  goal,
  exercises,
}: {
  templateId: string;
  title: string;
  goal: TrainingGoal;
  exercises: WorkoutSessionExercise[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const start = () => {
    startTransition(async () => {
      const result = await startWorkoutAction({ templateId, title, goal, exercises });
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      router.push('/workout/active');
    });
  };

  return (
    <Button block size="lg" onClick={start} loading={pending}>
      <Play className="size-4" aria-hidden />
      התחלת האימון
    </Button>
  );
}
