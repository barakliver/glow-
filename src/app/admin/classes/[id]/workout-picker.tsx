'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Save, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { setClassWorkoutAction } from '@/app/actions/workout-log';
import {
  DIFFICULTY_LABELS,
  WORKOUT_CATEGORY_LABELS,
  WORKOUT_CATEGORY_OPTIONS,
  WORKOUT_FORMAT_LABELS,
} from '@/lib/labels';
import { formatDuration } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Workout, WorkoutCategory } from '@/lib/domain/types';

/**
 * Attaches one workout from the library to this class.
 *
 * Whoever is assigned here is hidden from members until they hold a place, so
 * the picker says so plainly - a coach should know that publishing the class
 * does not publish the workout.
 */
export function WorkoutPicker({
  classId,
  workouts,
  current,
  currentNotes,
}: {
  classId: string;
  workouts: Workout[];
  current: Workout | null;
  currentNotes: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string>(current?.id ?? '');
  const [notes, setNotes] = useState(currentNotes ?? '');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<WorkoutCategory | 'all'>(current?.category ?? 'all');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return workouts
      .filter((workout) => category === 'all' || workout.category === category)
      .filter(
        (workout) =>
          needle === '' ||
          workout.title.toLowerCase().includes(needle) ||
          (workout.subtitle ?? '').toLowerCase().includes(needle),
      )
      .slice(0, 40);
  }, [workouts, query, category]);

  const save = (workoutId: string) => {
    startTransition(async () => {
      const result = await setClassWorkoutAction({
        class_id: classId,
        workout_id: workoutId,
        notes,
      });
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <section className="surface p-4">
      <h2 className="text-sm font-semibold">אימון השיעור</h2>
      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        המתאמנים יראו את התוכנית המלאה רק אחרי שנרשמו לשיעור. לפני זה מוצגים להם רק סוג האימון,
        הפורמט, המשך והרמה.
      </p>

      {current && (
        <div className="mt-3 rounded-md border border-accent/40 bg-accent/8 p-3">
          <p className="text-sm font-semibold text-accent-ink">{current.title}</p>
          {current.subtitle && <p className="mt-0.5 text-xs text-muted">{current.subtitle}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="accent">{WORKOUT_CATEGORY_LABELS[current.category]}</Badge>
            <Badge tone="outline">{WORKOUT_FORMAT_LABELS[current.format]}</Badge>
            <Badge tone="neutral">{formatDuration(current.duration_minutes)}</Badge>
          </div>
        </div>
      )}

      <div className="mt-3">
        <Label htmlFor="workout-notes">הערה למתאמנים שנרשמו</Label>
        <Textarea
          id="workout-notes"
          className="mt-1.5"
          maxLength={500}
          placeholder="למשל: מי שחוזר מפציעת כתף - נעשה גרסה מותאמת"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חיפוש אימון במאגר"
          aria-label="חיפוש אימון"
          className="pe-10"
        />
      </div>

      <div className="-mx-4 mt-2 overflow-x-auto px-4">
        <div className="flex w-max gap-1.5">
          {[{ value: 'all' as const, label: 'הכל' }, ...WORKOUT_CATEGORY_OPTIONS].map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={category === option.value}
              onClick={() => setCategory(option.value as WorkoutCategory | 'all')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                category === option.value
                  ? 'border-accent bg-accent/12 text-accent-ink'
                  : 'border-line bg-raised text-muted hover:text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
        {results.map((workout) => (
          <li key={workout.id}>
            <button
              type="button"
              aria-pressed={selected === workout.id}
              onClick={() => setSelected(workout.id)}
              className={cn(
                'w-full rounded-md border p-2.5 text-start transition-colors',
                selected === workout.id
                  ? 'border-accent bg-accent/12'
                  : 'border-line bg-raised hover:border-accent/30',
              )}
            >
              <span className="block text-sm font-medium">{workout.title}</span>
              <span className="mt-0.5 block text-[11px] text-muted">
                {WORKOUT_FORMAT_LABELS[workout.format]} · {formatDuration(workout.duration_minutes)}{' '}
                · {DIFFICULTY_LABELS[workout.difficulty]}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button
          onClick={() => save(selected)}
          disabled={pending || !selected || (selected === current?.id && notes === (currentNotes ?? ''))}
        >
          <Save className="size-4" aria-hidden />
          {pending ? 'שומר…' : 'שיבוץ לשיעור'}
        </Button>
        {current && (
          <Button variant="secondary" onClick={() => save('')} disabled={pending}>
            <Trash2 className="size-4" aria-hidden />
            הסרת השיבוץ
          </Button>
        )}
      </div>
    </section>
  );
}
