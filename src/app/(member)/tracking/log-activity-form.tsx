'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { logActivityAction } from '@/app/actions/tracking';
import { ACTIVITY_KIND_OPTIONS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { ActivityKind, Exercise } from '@/lib/domain/types';

type LiftRow = { key: string; name: string; sets: string; reps: string; weight: string };

const emptyLift = (): LiftRow => ({
  key: Math.random().toString(36).slice(2),
  name: '',
  sets: '',
  reps: '',
  weight: '',
});

const numeric = (value: string): number | undefined => {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Log anything.
 *
 * Only the date, the kind and a title are required. Everything else is there
 * for the days someone wants to write it down, and out of the way on the days
 * they do not.
 */
export function LogActivityForm({
  exercises,
  today,
}: {
  exercises: Exercise[];
  today: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [kind, setKind] = useState<ActivityKind>('strength');
  const [performedOn, setPerformedOn] = useState(today);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [minutes, setMinutes] = useState('');
  const [rpe, setRpe] = useState<number | null>(null);
  const [distance, setDistance] = useState('');
  const [incline, setIncline] = useState('');
  const [lifts, setLifts] = useState<LiftRow[]>([emptyLift()]);

  const patchLift = (key: string, patch: Partial<LiftRow>) =>
    setLifts((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await logActivityAction({
        performed_on: performedOn,
        kind,
        title: title.trim() || ACTIVITY_KIND_OPTIONS.find((o) => o.value === kind)?.label || 'אימון',
        notes,
        duration_minutes: numeric(minutes),
        rpe: rpe ?? undefined,
        distance_km: numeric(distance),
        incline_percent: numeric(incline),
        lifts: lifts
          .filter((row) => row.name.trim().length > 0)
          .map((row) => ({
            // Matching by name keeps a typed-in exercise working even when the
            // library has never heard of it.
            exercise_id: exercises.find((e) => e.name_he === row.name || e.name_en === row.name)?.id ?? '',
            exercise_name: row.name.trim(),
            sets: numeric(row.sets) ?? 1,
            reps: numeric(row.reps),
            weight_kg: numeric(row.weight),
          })),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({ title: result.message, tone: 'success' });
      router.push('/tracking');
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="surface p-5">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">מה עשית?</legend>
          <div className="grid grid-cols-3 gap-2.5">
            {ACTIVITY_KIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
                className={cn(
                  'min-h-[52px] rounded-xl border px-3 text-sm font-semibold transition-colors',
                  kind === option.value
                    ? 'border-accent bg-accent/12 text-accent-ink'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="activity-title">כותרת</Label>
            <Input
              id="activity-title"
              className="mt-2"
              maxLength={80}
              placeholder="אימון כתפיים, ריצת ערב…"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="activity-date">תאריך</Label>
            <Input
              id="activity-date"
              type="date"
              dir="ltr"
              className="num mt-2"
              value={performedOn}
              onChange={(event) => setPerformedOn(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="activity-minutes">משך בדקות</Label>
            <Input
              id="activity-minutes"
              type="number"
              inputMode="numeric"
              min="0"
              dir="ltr"
              className="num mt-2"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          {kind === 'run' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity-distance">מרחק בק״מ</Label>
                <Input
                  id="activity-distance"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  dir="ltr"
                  className="num mt-2"
                  value={distance}
                  onChange={(event) => setDistance(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="activity-incline">שיפוע באחוזים</Label>
                <Input
                  id="activity-incline"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  dir="ltr"
                  className="num mt-2"
                  value={incline}
                  onChange={(event) => setIncline(event.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-semibold">
            עצימות מורגשת
            {rpe !== null && <span className="text-muted"> · {rpe} מתוך 10</span>}
          </legend>
          <div className="grid grid-cols-10 gap-1.5" role="radiogroup" aria-label="עצימות מורגשת">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rpe === value}
                aria-label={`${value} מתוך 10`}
                onClick={() => setRpe(rpe === value ? null : value)}
                className={cn(
                  'num h-11 rounded-lg border text-sm font-bold transition-colors',
                  rpe === value
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {kind !== 'run' && (
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold">מה הרמת</h2>
              <p className="mt-1 text-xs text-muted">
                אפשר להשאיר ריק. כל מה שתרשמו כאן נכנס לשיאים האישיים שלכם.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLifts((rows) => [...rows, emptyLift()])}
            >
              <Plus className="size-4" aria-hidden />
              תרגיל
            </Button>
          </div>

          <ul className="mt-5 space-y-4">
            {lifts.map((row, index) => (
              <li key={row.key} className="rounded-xl border border-line bg-raised p-4">
                <div className="flex items-center gap-3">
                  <Input
                    aria-label={`שם תרגיל ${index + 1}`}
                    list="exercise-names"
                    placeholder="שם התרגיל"
                    value={row.name}
                    onChange={(event) => patchLift(row.key, { name: event.target.value })}
                  />
                  {lifts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="הסרת תרגיל"
                      onClick={() =>
                        setLifts((rows) => rows.filter((entry) => entry.key !== row.key))
                      }
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Input
                    aria-label="סטים"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    dir="ltr"
                    className="num"
                    placeholder="סטים"
                    value={row.sets}
                    onChange={(event) => patchLift(row.key, { sets: event.target.value })}
                  />
                  <Input
                    aria-label="חזרות"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    dir="ltr"
                    className="num"
                    placeholder="חזרות"
                    value={row.reps}
                    onChange={(event) => patchLift(row.key, { reps: event.target.value })}
                  />
                  <Input
                    aria-label="משקל בק״ג"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.5"
                    dir="ltr"
                    className="num"
                    placeholder="ק״ג"
                    value={row.weight}
                    onChange={(event) => patchLift(row.key, { weight: event.target.value })}
                  />
                </div>
              </li>
            ))}
          </ul>

          <datalist id="exercise-names">
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.name_he} />
            ))}
          </datalist>
        </section>
      )}

      <section className="surface p-5">
        <Label htmlFor="activity-notes">האימון שלך, במילים שלך</Label>
        <p className="mt-1 text-xs text-muted">
          כתבו כאן מה שבא לכם - סדר התרגילים, מה הרגיש טוב, מה לנסות בפעם הבאה.
        </p>
        <Textarea
          id="activity-notes"
          className="mt-3 min-h-[160px]"
          maxLength={4000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <Button block size="lg" onClick={submit} disabled={pending}>
        <Save className="size-4" aria-hidden />
        {pending ? 'שומר…' : 'שמירת האימון'}
      </Button>
    </div>
  );
}
