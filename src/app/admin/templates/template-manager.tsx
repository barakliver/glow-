'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  ListChecks,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { saveTemplateAction, setTemplateFlagsAction } from '@/app/actions/admin';
import { templateFormSchema, zodFieldErrors } from '@/lib/validation';
import { DIFFICULTY_LABELS, DIFFICULTY_OPTIONS, GOAL_LABELS, GOAL_OPTIONS } from '@/lib/labels';
import { formatDuration } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { TemplateWithExercises } from '@/lib/data/repository';
import type { Difficulty, Exercise, TrainingGoal } from '@/lib/domain/types';

type Block = 'warmup' | 'main' | 'finisher' | 'cooldown';

const BLOCK_LABELS: Record<Block, string> = {
  warmup: 'חימום',
  main: 'עיקרי',
  finisher: 'סיום',
  cooldown: 'שחרור',
};

interface DraftItem {
  exercise_id: string;
  block: Block;
  sets: string;
  reps: string;
  load_kg: string;
  duration_seconds: string;
  distance_meters: string;
  rest_seconds: string;
  trainer_notes: string;
  alternative_exercise_ids: string[];
}

interface FormValues {
  title: string;
  description: string;
  goal: TrainingGoal;
  difficulty: Difficulty;
  duration_minutes: string;
  approved: boolean;
  suggestable: boolean;
  items: DraftItem[];
}

const EMPTY: FormValues = {
  title: '',
  description: '',
  goal: 'general',
  difficulty: 'beginner',
  duration_minutes: '45',
  approved: true,
  suggestable: true,
  items: [],
};

function numberOrNull(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

export function TemplateManager({
  templates,
  exercises,
}: {
  templates: TemplateWithExercises[];
  exercises: Exercise[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const openCreate = () => {
    setEditingId(null);
    setValues(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (template: TemplateWithExercises) => {
    setEditingId(template.id);
    setValues({
      title: template.title,
      description: template.description ?? '',
      goal: template.goal,
      difficulty: template.difficulty,
      duration_minutes: String(template.duration_minutes),
      approved: template.approved,
      suggestable: template.suggestable,
      items: template.items.map((item) => ({
        exercise_id: item.exercise_id,
        block: item.block,
        sets: item.sets?.toString() ?? '',
        reps: item.reps?.toString() ?? '',
        load_kg: item.load_kg?.toString() ?? '',
        duration_seconds: item.duration_seconds?.toString() ?? '',
        distance_meters: item.distance_meters?.toString() ?? '',
        rest_seconds: item.rest_seconds?.toString() ?? '',
        trainer_notes: item.trainer_notes ?? '',
        alternative_exercise_ids: item.alternative_exercise_ids,
      })),
    });
    setErrors({});
    setOpen(true);
  };

  const submit = () => {
    const payload = {
      title: values.title,
      description: values.description,
      goal: values.goal,
      difficulty: values.difficulty,
      duration_minutes: values.duration_minutes,
      approved: values.approved,
      suggestable: values.suggestable,
      items: values.items.map((item) => ({
        exercise_id: item.exercise_id,
        block: item.block,
        sets: numberOrNull(item.sets),
        reps: numberOrNull(item.reps),
        load_kg: numberOrNull(item.load_kg),
        duration_seconds: numberOrNull(item.duration_seconds),
        distance_meters: numberOrNull(item.distance_meters),
        rest_seconds: numberOrNull(item.rest_seconds),
        trainer_notes: item.trainer_notes || null,
        alternative_exercise_ids: item.alternative_exercise_ids,
      })),
    };

    const parsed = templateFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      toast({
        title: 'לא ניתן לשמור',
        description: parsed.error.issues[0]?.message,
        tone: 'error',
      });
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveTemplateAction(payload, editingId ?? undefined);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  const setFlags = (
    templateId: string,
    flags: { approved?: boolean; suggestable?: boolean; archived?: boolean },
  ) => {
    startTransition(async () => {
      const result = await setTemplateFlagsAction(templateId, flags);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const addExercise = (exercise: Exercise) => {
    setValues((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          exercise_id: exercise.id,
          block: 'main',
          sets: '3',
          reps: '10',
          load_kg: '',
          duration_seconds: '',
          distance_meters: '',
          rest_seconds: '60',
          trainer_notes: '',
          alternative_exercise_ids: [],
        },
      ],
    }));
  };

  const updateItem = (index: number, patch: Partial<DraftItem>) => {
    setValues((current) => ({
      ...current,
      items: current.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (index: number) => {
    setValues((current) => ({
      ...current,
      items: current.items.filter((_, i) => i !== index),
    }));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.items.length) return;
    setValues((current) => {
      const items = [...current.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, items };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl tracking-tight">תבניות אימון</h1>
          <p className="text-sm text-muted">
            {templates.filter((t) => !t.archived).length} תבניות פעילות ·{' '}
            {templates.filter((t) => t.suggestable && t.approved && !t.archived).length} זמינות למנוע
            ההמלצות
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          תבנית חדשה
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="עדיין אין תבניות אימון"
          description="תבנית מגדירה תרגילים, סטים, חזרות ומנוחות. המתאמנים יכולים להתחיל ממנה בלחיצה אחת."
          action={
            <Button size="sm" onClick={openCreate}>
              יצירת התבנית הראשונה
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {templates.map((template) => (
            <li
              key={template.id}
              className={cn('surface p-3.5', template.archived && 'opacity-60')}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">{template.title}</h2>
                    <Badge tone="outline">{GOAL_LABELS[template.goal]}</Badge>
                    {!template.approved && <Badge tone="warning">לא מאושר</Badge>}
                    {template.archived && <Badge tone="neutral">בארכיון</Badge>}
                  </div>
                  <p className="num mt-1 text-xs text-muted">
                    {formatDuration(template.duration_minutes)} ·{' '}
                    {DIFFICULTY_LABELS[template.difficulty]} · {template.items.length} תרגילים
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(template)}>
                    <Pencil className="size-4" aria-hidden />
                    עריכה
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => setFlags(template.id, { archived: !template.archived })}
                  >
                    {template.archived ? (
                      <ArchiveRestore className="size-4" aria-hidden />
                    ) : (
                      <Archive className="size-4" aria-hidden />
                    )}
                    {template.archived ? 'שחזור' : 'ארכיון'}
                  </Button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-line pt-3">
                <label className="flex items-center gap-2 text-xs font-medium">
                  <Switch
                    checked={template.approved}
                    onCheckedChange={(checked) => setFlags(template.id, { approved: checked })}
                    aria-label={`אישור התבנית ${template.title}`}
                  />
                  מאושר למתאמנים
                </label>
                <label className="flex items-center gap-2 text-xs font-medium">
                  <Switch
                    checked={template.suggestable}
                    onCheckedChange={(checked) => setFlags(template.id, { suggestable: checked })}
                    aria-label={`הצעה אוטומטית של ${template.title}`}
                  />
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="size-3.5 text-accent-ink" aria-hidden />
                    זמין למנוע ההמלצות
                  </span>
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'עריכת תבנית' : 'תבנית אימון חדשה'}</DialogTitle>
            <DialogDescription>
              הציוד, אזורי העבודה ודפוסי התנועה מחושבים אוטומטית מהתרגילים שתבחרו.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-title">שם התבנית</Label>
              <Input
                id="tpl-title"
                value={values.title}
                onChange={(event) => setValues((v) => ({ ...v, title: event.target.value }))}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && (
                <p role="alert" className="text-xs font-medium text-danger">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tpl-description">תיאור</Label>
              <Textarea
                id="tpl-description"
                value={values.description}
                onChange={(event) => setValues((v) => ({ ...v, description: event.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-goal">מטרה</Label>
                <Select
                  value={values.goal}
                  onValueChange={(value) => setValues((v) => ({ ...v, goal: value as TrainingGoal }))}
                >
                  <SelectTrigger id="tpl-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOAL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-difficulty">רמה</Label>
                <Select
                  value={values.difficulty}
                  onValueChange={(value) =>
                    setValues((v) => ({ ...v, difficulty: value as Difficulty }))
                  }
                >
                  <SelectTrigger id="tpl-difficulty">
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-duration">משך (דק׳)</Label>
                <Input
                  id="tpl-duration"
                  type="number"
                  min="10"
                  max="180"
                  dir="ltr"
                  className="num text-center"
                  value={values.duration_minutes}
                  onChange={(event) =>
                    setValues((v) => ({ ...v, duration_minutes: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 rounded-md border border-line bg-raised p-3">
              <label className="flex items-center gap-2 text-xs font-medium">
                <Switch
                  checked={values.approved}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, approved: checked }))}
                  aria-label="מאושר למתאמנים"
                />
                מאושר למתאמנים
              </label>
              <label className="flex items-center gap-2 text-xs font-medium">
                <Switch
                  checked={values.suggestable}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, suggestable: checked }))}
                  aria-label="זמין למנוע ההמלצות"
                />
                זמין למנוע ההמלצות
              </label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold">תרגילים ({values.items.length})</h3>
                <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                  <Plus className="size-4" aria-hidden />
                  הוספה
                </Button>
              </div>

              {values.items.length === 0 ? (
                <p className="rounded-md border border-dashed border-line p-4 text-center text-xs text-muted">
                  הוסיפו לפחות תרגיל אחד לתבנית.
                </p>
              ) : (
                <ul className="space-y-2">
                  {values.items.map((item, index) => (
                    <li key={`${item.exercise_id}-${index}`} className="rounded-md border border-line bg-raised p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {exerciseMap.get(item.exercise_id)?.name_he ?? 'תרגיל'}
                        </p>
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="הזזה למעלה"
                            disabled={index === 0}
                            onClick={() => moveItem(index, -1)}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="הזזה למטה"
                            disabled={index === values.items.length - 1}
                            onClick={() => moveItem(index, 1)}
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="הסרה"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {(Object.keys(BLOCK_LABELS) as Block[]).map((block) => (
                          <button
                            key={block}
                            type="button"
                            aria-pressed={item.block === block}
                            onClick={() => updateItem(index, { block })}
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                              item.block === block
                                ? 'border-accent bg-accent/12 text-accent-ink'
                                : 'border-line bg-surface text-muted',
                            )}
                          >
                            {BLOCK_LABELS[block]}
                          </button>
                        ))}
                      </div>

                      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                        <MiniField
                          id={`t-sets-${index}`}
                          label="סטים"
                          value={item.sets}
                          onChange={(v) => updateItem(index, { sets: v })}
                        />
                        <MiniField
                          id={`t-reps-${index}`}
                          label="חזרות"
                          value={item.reps}
                          onChange={(v) => updateItem(index, { reps: v })}
                        />
                        <MiniField
                          id={`t-load-${index}`}
                          label='ק"ג'
                          value={item.load_kg}
                          onChange={(v) => updateItem(index, { load_kg: v })}
                        />
                        <MiniField
                          id={`t-dur-${index}`}
                          label="שניות"
                          value={item.duration_seconds}
                          onChange={(v) => updateItem(index, { duration_seconds: v })}
                        />
                        <MiniField
                          id={`t-dist-${index}`}
                          label="מטר"
                          value={item.distance_meters}
                          onChange={(v) => updateItem(index, { distance_meters: v })}
                        />
                        <MiniField
                          id={`t-rest-${index}`}
                          label="מנוחה"
                          value={item.rest_seconds}
                          onChange={(v) => updateItem(index, { rest_seconds: v })}
                        />
                      </div>

                      <Input
                        className="mt-2 h-9 text-xs"
                        placeholder="הערת מאמן לתרגיל"
                        aria-label="הערת מאמן"
                        value={item.trainer_notes}
                        onChange={(event) => updateItem(index, { trainer_notes: event.target.value })}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {errors.items && (
                <p role="alert" className="mt-1 text-xs font-medium text-danger">
                  {errors.items}
                </p>
              )}
            </div>
          </div>

          <Button block size="lg" className="mt-4" onClick={submit} loading={pending}>
            שמירת התבנית
          </Button>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        exercises={exercises}
        onSelect={addExercise}
        title="הוספת תרגיל לתבנית"
      />
    </div>
  );
}

function MiniField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[10px] font-medium text-muted">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min="0"
        dir="ltr"
        className="num h-9 px-1 text-center text-xs font-semibold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
