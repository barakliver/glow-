'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Dumbbell, Play, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { GOAL_OPTIONS } from '@/lib/labels';
import { startWorkoutAction } from '@/app/actions/workout';
import type { Exercise, TrainingGoal, WorkoutSessionExercise } from '@/lib/domain/types';

interface DraftItem {
  exercise_id: string;
  sets: string;
  reps: string;
  load_kg: string;
  rest_seconds: string;
}

export function PersonalWorkoutBuilder({ exercises }: { exercises: Exercise[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState('אימון אישי');
  const [goal, setGoal] = useState<TrainingGoal>('general');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const add = (exercise: Exercise) => {
    setItems((current) => [
      ...current,
      { exercise_id: exercise.id, sets: '3', reps: '10', load_kg: '', rest_seconds: '60' },
    ]);
  };

  const update = (index: number, patch: Partial<DraftItem>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const start = () => {
    if (items.length === 0) {
      toast({ title: 'הוסיפו לפחות תרגיל אחד', tone: 'warning' });
      return;
    }
    const exercisesPayload: WorkoutSessionExercise[] = items.map((item, index) => ({
      exercise_id: item.exercise_id,
      position: index + 1,
      target_sets: item.sets ? Number(item.sets) : null,
      target_reps: item.reps ? Number(item.reps) : null,
      target_load_kg: item.load_kg ? Number(item.load_kg) : null,
      target_duration_seconds: null,
      target_distance_meters: null,
      rest_seconds: item.rest_seconds ? Number(item.rest_seconds) : null,
      notes: null,
    }));

    startTransition(async () => {
      const result = await startWorkoutAction({
        templateId: null,
        title: title.trim() || 'אימון אישי',
        goal,
        exercises: exercisesPayload,
      });
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      router.push('/workout/active');
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="בניית אימון אישי"
        subtitle="בחרו תרגילים וקבעו יעדים. אפשר לשנות הכל גם תוך כדי האימון."
        backHref="/workout"
      />

      <section className="surface space-y-3 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="workout-title">שם האימון</Label>
          <Input
            id="workout-title"
            value={title}
            maxLength={60}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="workout-goal">מטרה</Label>
          <Select value={goal} onValueChange={(value) => setGoal(value as TrainingGoal)}>
            <SelectTrigger id="workout-goal">
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
      </section>

      <section className="space-y-2" aria-labelledby="exercises-title">
        <div className="flex items-center justify-between">
          <h2 id="exercises-title" className="text-sm font-bold">
            תרגילים ({items.length})
          </h2>
          <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="size-4" aria-hidden />
            הוספה
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="האימון עדיין ריק"
            description="הוסיפו תרגילים מספריית GLoW כדי לבנות את האימון שלכם."
            action={
              <Button size="sm" onClick={() => setPickerOpen(true)}>
                בחירת תרגיל ראשון
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item, index) => {
              const exercise = exerciseMap.get(item.exercise_id);
              return (
                <li key={`${item.exercise_id}-${index}`} className="surface p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{exercise?.name_he ?? 'תרגיל'}</p>
                      <p className="text-[11px] text-muted" dir="ltr">
                        {exercise?.name_en}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="הזזה למעלה"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      >
                        <ArrowUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="הזזה למטה"
                        disabled={index === items.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="הסרת תרגיל"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2.5 grid grid-cols-4 gap-2">
                    <MiniField
                      id={`sets-${index}`}
                      label="סטים"
                      value={item.sets}
                      onChange={(v) => update(index, { sets: v })}
                    />
                    <MiniField
                      id={`reps-${index}`}
                      label="חזרות"
                      value={item.reps}
                      onChange={(v) => update(index, { reps: v })}
                    />
                    <MiniField
                      id={`load-${index}`}
                      label='ק"ג'
                      value={item.load_kg}
                      onChange={(v) => update(index, { load_kg: v })}
                    />
                    <MiniField
                      id={`rest-${index}`}
                      label="מנוחה"
                      value={item.rest_seconds}
                      onChange={(v) => update(index, { rest_seconds: v })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Button block size="lg" onClick={start} loading={pending} disabled={items.length === 0}>
        <Play className="size-4" aria-hidden />
        התחלת האימון
      </Button>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        exercises={exercises}
        onSelect={add}
        title="הוספת תרגיל"
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
      <Label htmlFor={id} className="text-[10px] font-semibold text-muted">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min="0"
        value={value}
        dir="ltr"
        className="num h-10 px-1.5 text-center text-sm font-bold"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
