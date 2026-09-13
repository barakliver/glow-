'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Save, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { logWorkoutResultAction } from '@/app/actions/workout-log';
import {
  PROGRESS_NOTE_TEXT,
  SCORE_FIELDS,
  SCORE_PROMPTS,
  formatScore,
  progressNote,
  scoreColumns,
} from '@/lib/domain/workout-score';
import { SCORE_TYPE_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Workout, WorkoutLog } from '@/lib/domain/types';

const RPE_HINTS: Record<number, string> = {
  1: 'קל מאוד',
  3: 'קל',
  5: 'בינוני',
  7: 'קשה',
  9: 'קשה מאוד',
  10: 'הכל',
};

type Draft = {
  minutes: string;
  seconds: string;
  rounds: string;
  reps: string;
  weightKg: string;
  completed: boolean | null;
  rx: boolean;
  rpe: number | null;
  notes: string;
};

function draftFrom(existing: WorkoutLog | null): Draft {
  const seconds = existing?.result_seconds ?? 0;
  return {
    minutes: seconds ? String(Math.floor(seconds / 60)) : '',
    seconds: seconds ? String(seconds % 60) : '',
    rounds: existing?.result_rounds !== null && existing?.result_rounds !== undefined
      ? String(existing.result_rounds)
      : '',
    reps: existing?.result_reps !== null && existing?.result_reps !== undefined
      ? String(existing.result_reps)
      : '',
    weightKg: existing?.result_weight_kg !== null && existing?.result_weight_kg !== undefined
      ? String(existing.result_weight_kg)
      : '',
    completed: existing?.completed ?? null,
    rx: existing?.rx ?? false,
    rpe: existing?.rpe ?? null,
    notes: existing?.notes ?? '',
  };
}

const numeric = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The result form.
 *
 * Which inputs appear is decided by the workout's score type, not by the
 * member: an AMRAP asks for rounds and reps, a For Time asks for a clock, and
 * neither can be filled in with the other's numbers.
 */
export function LogResultForm({
  workout,
  classId,
  existing,
  history,
}: {
  workout: Workout;
  classId?: string | null;
  existing: WorkoutLog | null;
  history: WorkoutLog[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(existing));
  const [error, setError] = useState<string | null>(null);

  const fields = SCORE_FIELDS[workout.score_type];
  const patch = (next: Partial<Draft>) => setDraft((current) => ({ ...current, ...next }));

  const columns = scoreColumns(workout.score_type, {
    minutes: numeric(draft.minutes),
    seconds: numeric(draft.seconds),
    rounds: numeric(draft.rounds),
    reps: numeric(draft.reps),
    weightKg: numeric(draft.weightKg),
    completed: draft.completed,
  });
  // Earlier attempts only; today's own row would otherwise compare to itself.
  const earlier = history.filter((log) => log.id !== existing?.id);
  const note = progressNote(workout.score_type, { ...columns, rx: draft.rx }, earlier);

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await logWorkoutResultAction({
        workout_id: workout.id,
        class_id: classId ?? '',
        score_type: workout.score_type,
        minutes: numeric(draft.minutes) ?? undefined,
        seconds: numeric(draft.seconds) ?? undefined,
        rounds: numeric(draft.rounds) ?? undefined,
        reps: numeric(draft.reps) ?? undefined,
        weight_kg: numeric(draft.weightKg) ?? undefined,
        completed: draft.completed ?? undefined,
        rx: draft.rx,
        rpe: draft.rpe ?? undefined,
        notes: draft.notes,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({ title: result.message, tone: 'success' });
      router.refresh();
    });
  };

  return (
    <section className="surface p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Trophy className="size-4 text-champagne" aria-hidden />
        {existing ? 'עדכון התוצאה' : 'רישום תוצאה'}
      </h2>
      <p className="mt-1 text-sm text-muted">{SCORE_PROMPTS[workout.score_type]}</p>

      <div className="mt-4 space-y-4">
        {(fields.minutes || fields.seconds) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="log-minutes">דקות</Label>
              <Input
                id="log-minutes"
                type="number"
                inputMode="numeric"
                min="0"
                max="600"
                dir="ltr"
                className="num mt-1.5"
                value={draft.minutes}
                onChange={(event) => patch({ minutes: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="log-seconds">שניות</Label>
              <Input
                id="log-seconds"
                type="number"
                inputMode="numeric"
                min="0"
                max="59"
                dir="ltr"
                className="num mt-1.5"
                value={draft.seconds}
                onChange={(event) => patch({ seconds: event.target.value })}
              />
            </div>
          </div>
        )}

        {fields.rounds && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="log-rounds">סבבים מלאים</Label>
              <Input
                id="log-rounds"
                type="number"
                inputMode="numeric"
                min="0"
                dir="ltr"
                className="num mt-1.5"
                value={draft.rounds}
                onChange={(event) => patch({ rounds: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="log-extra-reps">חזרות נוספות</Label>
              <Input
                id="log-extra-reps"
                type="number"
                inputMode="numeric"
                min="0"
                dir="ltr"
                className="num mt-1.5"
                value={draft.reps}
                onChange={(event) => patch({ reps: event.target.value })}
              />
            </div>
          </div>
        )}

        {fields.weight && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="log-weight">משקל בק״ג</Label>
              <Input
                id="log-weight"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                dir="ltr"
                className="num mt-1.5"
                value={draft.weightKg}
                onChange={(event) => patch({ weightKg: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="log-weight-reps">חזרות</Label>
              <Input
                id="log-weight-reps"
                type="number"
                inputMode="numeric"
                min="0"
                dir="ltr"
                className="num mt-1.5"
                value={draft.reps}
                onChange={(event) => patch({ reps: event.target.value })}
              />
            </div>
          </div>
        )}

        {fields.reps && !fields.rounds && !fields.weight && (
          <div>
            <Label htmlFor="log-reps">סך החזרות</Label>
            <Input
              id="log-reps"
              type="number"
              inputMode="numeric"
              min="0"
              dir="ltr"
              className="num mt-1.5"
              value={draft.reps}
              onChange={(event) => patch({ reps: event.target.value })}
            />
          </div>
        )}

        {fields.completed && (
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">השלמת את האימון?</legend>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: 'כן, השלמתי' },
                { value: false, label: 'לא הספקתי' },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  aria-pressed={draft.completed === option.value}
                  onClick={() => patch({ completed: option.value })}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors',
                    draft.completed === option.value
                      ? 'border-accent bg-accent/12 text-accent-ink'
                      : 'border-line bg-raised text-muted hover:text-ink',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">איך ביצעת?</legend>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: true, label: 'Rx', hint: 'בדיוק לפי הפרוטוקול' },
              { value: false, label: 'Scaled', hint: 'בגרסה מותאמת' },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={draft.rx === option.value}
                onClick={() => patch({ rx: option.value })}
                className={cn(
                  'rounded-md border px-3 py-2 text-start transition-colors',
                  draft.rx === option.value
                    ? 'border-accent bg-accent/12'
                    : 'border-line bg-raised hover:border-line',
                )}
              >
                <span
                  className={cn(
                    'block text-sm font-bold',
                    draft.rx === option.value ? 'text-accent-ink' : 'text-ink',
                  )}
                >
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted">{option.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">
            עצימות מורגשת
            {draft.rpe !== null && (
              <span className="text-muted"> · {draft.rpe} מתוך 10</span>
            )}
          </legend>
          <div className="grid grid-cols-10 gap-1" role="radiogroup" aria-label="עצימות מורגשת">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={draft.rpe === value}
                aria-label={`${value}${RPE_HINTS[value] ? ` - ${RPE_HINTS[value]}` : ''}`}
                onClick={() => patch({ rpe: draft.rpe === value ? null : value })}
                className={cn(
                  'num h-10 rounded-md border text-sm font-bold transition-colors',
                  draft.rpe === value
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <Label htmlFor="log-notes">הערות אישיות</Label>
          <Textarea
            id="log-notes"
            className="mt-1.5"
            maxLength={500}
            placeholder="מה עבד, מה היה קשה, מה לנסות בפעם הבאה"
            value={draft.notes}
            onChange={(event) => patch({ notes: event.target.value })}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-danger/40 bg-danger/10 p-2.5 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-muted">
        {SCORE_TYPE_LABELS[workout.score_type]}: <span className="num text-ink">{formatScore(workout.score_type, columns)}</span>
        {note.kind !== 'first' && <span> · {PROGRESS_NOTE_TEXT[note.kind]}</span>}
      </p>

      <Button className="mt-3 w-full" size="lg" onClick={submit} disabled={pending}>
        {existing ? <Check className="size-4" aria-hidden /> : <Save className="size-4" aria-hidden />}
        {pending ? 'שומר…' : existing ? 'עדכון התוצאה' : 'שמירת התוצאה'}
      </Button>
    </section>
  );
}
