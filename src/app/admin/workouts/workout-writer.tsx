'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { saveCustomWorkoutAction } from '@/app/actions/workout-log';
import {
  DIFFICULTY_OPTIONS,
  EQUIPMENT_LABELS,
  SCORE_TYPE_LABELS,
  WORKOUT_CATEGORY_OPTIONS,
  WORKOUT_FORMAT_OPTIONS,
} from '@/lib/labels';
import { ROOM_EQUIPMENT } from '@/lib/data/workouts';
import { cn } from '@/lib/utils';
import type { Equipment, ScoreType } from '@/lib/domain/types';

const SCORE_OPTIONS = Object.entries(SCORE_TYPE_LABELS).map(([value, label]) => ({
  value: value as ScoreType,
  label,
}));

/**
 * Write a workout the way it goes on the board.
 *
 * Four plain boxes, one movement per line. Adding " | " puts whatever follows
 * in grey next to the movement, which is where reps, tempo and cues go. No
 * load fields on purpose: the library never prescribes weight.
 */
export function WorkoutWriter() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    duration_minutes: '60',
    score_type: 'time' as ScoreType,
    description: '',
    warmup: '',
    strength: '',
    strength_detail: '',
    metcon: '',
    metcon_detail: '',
    cooldown: '',
    scaling_beginner: '',
    scaling_intermediate: '',
    scaling_advanced: '',
  });
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const patch = (next: Partial<typeof form>) => setForm((current) => ({ ...current, ...next }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await saveCustomWorkoutAction({ ...form, equipment });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast({ title: result.message, tone: 'success' });
      router.push('/workout/wods');
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      <section className="surface p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="w-title">שם האימון</Label>
            <Input
              id="w-title"
              className="mt-2"
              maxLength={60}
              value={form.title}
              onChange={(event) => patch({ title: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="w-subtitle">משפט אחד עליו</Label>
            <Input
              id="w-subtitle"
              className="mt-2"
              maxLength={120}
              value={form.subtitle}
              onChange={(event) => patch({ subtitle: event.target.value })}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Picker
            label="משפחה"
            value={form.category}
            options={WORKOUT_CATEGORY_OPTIONS}
            onChange={(value) => patch({ category: value })}
          />
          <Picker
            label="פורמט"
            value={form.format}
            options={WORKOUT_FORMAT_OPTIONS}
            onChange={(value) => patch({ format: value })}
          />
          <Picker
            label="רמה"
            value={form.difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(value) => patch({ difficulty: value })}
          />
          <Picker
            label="איך מנקדים"
            value={form.score_type}
            options={SCORE_OPTIONS}
            onChange={(value) => patch({ score_type: value as ScoreType })}
          />
        </div>

        <div className="mt-5">
          <Label htmlFor="w-duration">משך בדקות</Label>
          <Input
            id="w-duration"
            type="number"
            inputMode="numeric"
            min="5"
            max="240"
            dir="ltr"
            className="num mt-2"
            value={form.duration_minutes}
            onChange={(event) => patch({ duration_minutes: event.target.value })}
          />
        </div>

        <fieldset className="mt-6">
          <legend className="mb-3 text-sm font-medium">ציוד</legend>
          <div className="flex flex-wrap gap-2.5">
            {ROOM_EQUIPMENT.filter((item) => item !== 'none').map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={equipment.includes(item)}
                onClick={() =>
                  setEquipment((current) =>
                    current.includes(item)
                      ? current.filter((entry) => entry !== item)
                      : [...current, item],
                  )
                }
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-medium transition-colors',
                  equipment.includes(item)
                    ? 'border-accent bg-accent/12 text-accent-ink'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {EQUIPMENT_LABELS[item]}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="surface p-6">
        <h2 className="text-sm font-semibold">האימון</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          שורה אחת לכל תרגיל. אפשר להוסיף פירוט אחרי{' '}
          <code className="rounded bg-raised px-1.5 py-0.5 text-[11px]">|</code> - למשל{' '}
          <span dir="ltr">Back Squat | 5 סטים של 5</span>.
        </p>

        <div className="mt-5 space-y-7">
          <Block
            id="w-warmup"
            label="חימום"
            value={form.warmup}
            onChange={(value) => patch({ warmup: value })}
            placeholder={'הליכון | 4 דקות\nסקוואט משקל גוף | 15 חזרות'}
          />
          <Block
            id="w-strength"
            label="כוח"
            detail={form.strength_detail}
            onDetailChange={(value) => patch({ strength_detail: value })}
            detailPlaceholder="5 סטים של 5, מנוחה 2 דקות"
            value={form.strength}
            onChange={(value) => patch({ strength: value })}
            placeholder={'Back Squat | 5 חזרות'}
          />
          <Block
            id="w-metcon"
            label="מטקון"
            detail={form.metcon_detail}
            onDetailChange={(value) => patch({ metcon_detail: value })}
            detailPlaceholder="AMRAP 15 דקות"
            value={form.metcon}
            onChange={(value) => patch({ metcon: value })}
            placeholder={'Kettlebell Swings | 20 חזרות\nBurpees | 10 חזרות'}
          />
          <Block
            id="w-cooldown"
            label="שחרור"
            value={form.cooldown}
            onChange={(value) => patch({ cooldown: value })}
            placeholder={'מתיחת מיתרי ברך | 60 שניות לכל צד'}
          />
        </div>
      </section>

      <section className="surface p-6">
        <h2 className="text-sm font-semibold">התאמות לרמה</h2>
        <div className="mt-5 space-y-4">
          {(
            [
              ['scaling_beginner', 'מתחילים'],
              ['scaling_intermediate', 'בינוני'],
              ['scaling_advanced', 'מתקדמים'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                className="mt-2"
                maxLength={300}
                value={form[key]}
                onChange={(event) => patch({ [key]: event.target.value })}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="surface p-6">
        <Label htmlFor="w-description">הסבר כללי</Label>
        <Textarea
          id="w-description"
          className="mt-2 min-h-[120px]"
          maxLength={1200}
          placeholder="מה המטרה, איפה נשברים, מה כדאי לתכנן מראש."
          value={form.description}
          onChange={(event) => patch({ description: event.target.value })}
        />
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}

      <Button block size="lg" onClick={submit} disabled={pending}>
        <Save className="size-4" aria-hidden />
        {pending ? 'שומר…' : 'שמירה לספרייה'}
      </Button>
    </div>
  );
}

function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: T; label?: string; name?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <Label htmlFor={`picker-${label}`}>{label}</Label>
      <select
        id={`picker-${label}`}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-2 h-11 w-full rounded-md border border-line bg-raised px-3 text-sm text-ink focus-visible:border-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label ?? option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Block({
  id,
  label,
  value,
  onChange,
  placeholder,
  detail,
  onDetailChange,
  detailPlaceholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  detail?: string;
  onDetailChange?: (value: string) => void;
  detailPlaceholder?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-raised p-4">
      <Label htmlFor={id} className="text-accent-ink">
        {label}
      </Label>
      {onDetailChange && (
        <Input
          aria-label={`הוראת הרצה ל${label}`}
          className="mt-2.5"
          maxLength={160}
          placeholder={detailPlaceholder}
          value={detail ?? ''}
          onChange={(event) => onDetailChange(event.target.value)}
        />
      )}
      <Textarea
        id={id}
        className="mt-2.5 min-h-[110px]"
        maxLength={2000}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
