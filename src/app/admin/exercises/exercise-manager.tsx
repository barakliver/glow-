'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, Pencil, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { archiveExerciseAction, saveExerciseAction } from '@/app/actions/admin';
import { exerciseFormSchema, zodFieldErrors } from '@/lib/validation';
import {
  AREA_OPTIONS,
  DIFFICULTY_LABELS,
  DIFFICULTY_OPTIONS,
  EQUIPMENT_LABELS,
  EQUIPMENT_OPTIONS,
  MOVEMENT_LABELS,
  MOVEMENT_OPTIONS,
} from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Difficulty, Exercise, MovementCategory } from '@/lib/domain/types';

interface FormValues {
  name_he: string;
  name_en: string;
  movement_category: MovementCategory;
  target_areas: string[];
  equipment: string[];
  difficulty: Difficulty;
  instructions: string;
  safety_cues: string;
  media_url: string;
}

const EMPTY: FormValues = {
  name_he: '',
  name_en: '',
  movement_category: 'squat',
  target_areas: [],
  equipment: [],
  difficulty: 'beginner',
  instructions: '',
  safety_cues: '',
  media_url: '',
};

export function ExerciseManager({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return exercises
      .filter((exercise) => showArchived || !exercise.archived)
      .filter(
        (exercise) =>
          needle === '' ||
          exercise.name_he.toLowerCase().includes(needle) ||
          exercise.name_en.toLowerCase().includes(needle),
      );
  }, [exercises, query, showArchived]);

  const openCreate = () => {
    setEditingId(null);
    setValues(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setValues({
      name_he: exercise.name_he,
      name_en: exercise.name_en,
      movement_category: exercise.movement_category,
      target_areas: exercise.target_areas,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      safety_cues: exercise.safety_cues,
      media_url: exercise.media_url ?? '',
    });
    setErrors({});
    setOpen(true);
  };

  const submit = () => {
    const parsed = exerciseFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveExerciseAction(values, editingId ?? undefined);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  const toggleArchive = (exercise: Exercise) => {
    startTransition(async () => {
      const result = await archiveExerciseAction(exercise.id, !exercise.archived);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const toggle = (key: 'target_areas' | 'equipment', value: string) => {
    setValues((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl tracking-tight">ספריית תרגילים</h1>
          <p className="text-sm text-muted">
            {exercises.filter((e) => !e.archived).length} תרגילים פעילים
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          תרגיל חדש
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש תרגיל"
            aria-label="חיפוש תרגיל"
            className="pe-9"
          />
        </div>
        <Button
          variant={showArchived ? 'primary' : 'secondary'}
          onClick={() => setShowArchived((value) => !value)}
          aria-pressed={showArchived}
        >
          <Archive className="size-4" aria-hidden />
          הצגת ארכיון
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="לא נמצאו תרגילים" description="נסו מילת חיפוש אחרת." />
      ) : (
        <ul className="space-y-2">
          {filtered.map((exercise) => (
            <li
              key={exercise.id}
              className={cn('surface p-3.5', exercise.archived && 'opacity-60')}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-bold">{exercise.name_he}</h2>
                    {exercise.archived && <Badge tone="neutral">בארכיון</Badge>}
                  </div>
                  <p className="text-[11px] text-muted" dir="ltr">
                    {exercise.name_en}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge tone="outline">{MOVEMENT_LABELS[exercise.movement_category]}</Badge>
                    <Badge tone="neutral">{DIFFICULTY_LABELS[exercise.difficulty]}</Badge>
                    {exercise.equipment.slice(0, 3).map((item) => (
                      <Badge key={item} tone="neutral">
                        {EQUIPMENT_LABELS[item]}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(exercise)}>
                    <Pencil className="size-4" aria-hidden />
                    עריכה
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => toggleArchive(exercise)}
                  >
                    {exercise.archived ? (
                      <ArchiveRestore className="size-4" aria-hidden />
                    ) : (
                      <Archive className="size-4" aria-hidden />
                    )}
                    {exercise.archived ? 'שחזור' : 'ארכיון'}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'עריכת תרגיל' : 'תרגיל חדש'}</DialogTitle>
            <DialogDescription>
              התרגיל יהיה זמין לכל המתאמנים בספרייה ובבניית אימונים.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="שם בעברית" htmlFor="ex-he" error={errors.name_he}>
                <Input
                  id="ex-he"
                  value={values.name_he}
                  onChange={(event) => setValues((v) => ({ ...v, name_he: event.target.value }))}
                />
              </Field>
              <Field label="שם באנגלית" htmlFor="ex-en" error={errors.name_en}>
                <Input
                  id="ex-en"
                  dir="ltr"
                  value={values.name_en}
                  onChange={(event) => setValues((v) => ({ ...v, name_en: event.target.value }))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="דפוס תנועה" htmlFor="ex-movement">
                <Select
                  value={values.movement_category}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, movement_category: value as MovementCategory }))
                  }
                >
                  <SelectTrigger id="ex-movement">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="רמה" htmlFor="ex-difficulty">
                <Select
                  value={values.difficulty}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, difficulty: value as Difficulty }))
                  }
                >
                  <SelectTrigger id="ex-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <ChipGroup
              legend="אזורי עבודה"
              options={AREA_OPTIONS}
              selected={values.target_areas}
              onToggle={(value) => toggle('target_areas', value)}
              error={errors.target_areas}
            />

            <ChipGroup
              legend="ציוד נדרש"
              options={EQUIPMENT_OPTIONS}
              selected={values.equipment}
              onToggle={(value) => toggle('equipment', value)}
              error={errors.equipment}
            />

            <Field label="הוראות ביצוע" htmlFor="ex-instructions" error={errors.instructions}>
              <Textarea
                id="ex-instructions"
                value={values.instructions}
                onChange={(event) =>
                  setValues((v) => ({ ...v, instructions: event.target.value }))
                }
              />
            </Field>

            <Field label="דגשי בטיחות" htmlFor="ex-safety" error={errors.safety_cues}>
              <Textarea
                id="ex-safety"
                value={values.safety_cues}
                onChange={(event) => setValues((v) => ({ ...v, safety_cues: event.target.value }))}
              />
            </Field>

            <Field label="קישור להדגמה (לא חובה)" htmlFor="ex-media" error={errors.media_url}>
              <Input
                id="ex-media"
                dir="ltr"
                placeholder="https://"
                value={values.media_url}
                onChange={(event) => setValues((v) => ({ ...v, media_url: event.target.value }))}
              />
            </Field>
          </div>

          <Button block size="lg" className="mt-4" onClick={submit} loading={pending}>
            שמירה
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function ChipGroup({
  legend,
  options,
  selected,
  onToggle,
  error,
}: {
  legend: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected.includes(option.value)}
            onClick={() => onToggle(option.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              selected.includes(option.value)
                ? 'border-accent bg-accent/12 text-accent-ink'
                : 'border-line bg-raised text-muted',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
