'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  History,
  Info,
  Plus,
  Repeat,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RestTimer } from '@/components/workout/rest-timer';
import { ExercisePicker } from '@/components/workout/exercise-picker';
import { REPLACE_REASONS, type ReplaceReason } from '@/lib/domain/recommend';
import {
  abandonWorkoutAction,
  deleteSetAction,
  finishWorkoutAction,
  logSetAction,
  updateSessionExercisesAction,
} from '@/app/actions/workout';
import { enqueue } from '@/lib/offline/queue';
import { formatClock } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Exercise, WorkoutSession, WorkoutSessionExercise, WorkoutSet } from '@/lib/domain/types';

interface DraftSet {
  reps: string;
  load_kg: string;
  duration_seconds: string;
  distance_meters: string;
  effort: string;
  notes: string;
}

const EMPTY_DRAFT: DraftSet = {
  reps: '',
  load_kg: '',
  duration_seconds: '',
  distance_meters: '',
  effort: '7',
  notes: '',
};

export function ActiveWorkout({
  session,
  initialSets,
  exercises,
  previousSets,
}: {
  session: WorkoutSession;
  initialSets: WorkoutSet[];
  exercises: Exercise[];
  previousSets: WorkoutSet[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [, startTransition] = useTransition();

  const [plan, setPlan] = useState<WorkoutSessionExercise[]>(
    [...session.exercises].sort((a, b) => a.position - b.position),
  );
  const [sets, setSets] = useState<WorkoutSet[]>(initialSets);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState<DraftSet>(EMPTY_DRAFT);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [replacePickerOpen, setReplacePickerOpen] = useState(false);
  const [replaceReason, setReplaceReason] = useState<ReplaceReason>('equipment');
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const exerciseMap = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const current = plan[index] ?? null;
  const currentExercise = current ? exerciseMap.get(current.exercise_id) ?? null : null;
  const currentSets = current ? sets.filter((s) => s.exercise_id === current.exercise_id) : [];

  // Session clock, derived from the start timestamp so refreshes are harmless.
  useEffect(() => {
    const tick = () =>
      setElapsed(Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [session.started_at]);

  // Restore the draft of an in-progress set after a refresh.
  useEffect(() => {
    if (!current) return;
    const key = `glow:draft:${session.id}:${current.exercise_id}`;
    try {
      const raw = window.localStorage.getItem(key);
      setDraft(raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : prefillDraft(current));
    } catch {
      setDraft(prefillDraft(current));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.exercise_id, session.id]);

  useEffect(() => {
    if (!current) return;
    const key = `glow:draft:${session.id}:${current.exercise_id}`;
    try {
      window.localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      // Storage unavailable: the in-memory draft still works.
    }
  }, [draft, current, session.id]);

  const persistPlan = useCallback(
    (next: WorkoutSessionExercise[]) => {
      setPlan(next);
      startTransition(async () => {
        const result = await updateSessionExercisesAction(session.id, next);
        if (!result.ok) {
          enqueue({ kind: 'update_session', sessionId: session.id, payload: { exercises: next } });
        }
      });
    },
    [session.id],
  );

  const bestPrevious = useMemo(() => {
    if (!current) return null;
    const relevant = previousSets
      .filter((s) => s.exercise_id === current.exercise_id)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
    return relevant[0] ?? null;
  }, [previousSets, current]);

  const logSet = async () => {
    if (!current) return;
    const hasValue =
      draft.reps.trim() !== '' ||
      draft.load_kg.trim() !== '' ||
      draft.duration_seconds.trim() !== '' ||
      draft.distance_meters.trim() !== '';
    if (!hasValue) {
      toast({
        title: 'לא נרשם ערך',
        description: 'מלאו לפחות חזרות, משקל, זמן או מרחק לפני שמירת הסט.',
        tone: 'warning',
      });
      return;
    }

    setSaving(true);
    const payload = {
      session_id: session.id,
      exercise_id: current.exercise_id,
      position: current.position,
      set_index: currentSets.length + 1,
      reps: draft.reps.trim() === '' ? null : Number(draft.reps),
      load_kg: draft.load_kg.trim() === '' ? null : Number(draft.load_kg),
      duration_seconds:
        draft.duration_seconds.trim() === '' ? null : Number(draft.duration_seconds),
      distance_meters: draft.distance_meters.trim() === '' ? null : Number(draft.distance_meters),
      effort: draft.effort.trim() === '' ? null : Number(draft.effort),
      notes: draft.notes.trim() || null,
      completed_at: new Date().toISOString(),
    };

    // Optimistic local record so the UI never waits on the network.
    const optimistic: WorkoutSet = {
      ...payload,
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
    } as WorkoutSet;
    setSets((existing) => [...existing, optimistic]);

    const result = await logSetAction(payload);
    if (result.ok && result.data) {
      setSets((existing) =>
        existing.map((s) => (s.id === optimistic.id ? { ...s, id: result.data!.setId } : s)),
      );
    } else {
      // Offline or transient failure: keep the row and queue it for sync.
      enqueue({ kind: 'add_set', sessionId: session.id, payload });
      toast({
        title: 'נשמר במכשיר',
        description: 'הסט יסונכרן אוטומטית כשהחיבור יחזור.',
        tone: 'warning',
      });
    }

    setDraft((d) => ({ ...prefillDraft(current), effort: d.effort }));
    setSaving(false);
    if (current.rest_seconds && current.rest_seconds > 0) setRestSeconds(current.rest_seconds);
  };

  const removeSet = (setId: string) => {
    setSets((existing) => existing.filter((s) => s.id !== setId));
    startTransition(async () => {
      await deleteSetAction(session.id, setId);
    });
  };

  const addExercise = (exercise: Exercise) => {
    const next = [
      ...plan,
      {
        exercise_id: exercise.id,
        position: plan.length + 1,
        target_sets: 3,
        target_reps: 10,
        target_load_kg: null,
        target_duration_seconds: null,
        target_distance_meters: null,
        rest_seconds: 60,
        notes: null,
      },
    ];
    persistPlan(renumber(next));
    setIndex(next.length - 1);
    toast({ title: `${exercise.name_he} נוסף לאימון`, tone: 'success' });
  };

  const replaceExercise = (exercise: Exercise) => {
    if (!current) return;
    const next = plan.map((item, i) =>
      i === index
        ? {
            ...item,
            exercise_id: exercise.id,
            replaced_from_exercise_id: item.exercise_id,
            replace_reason: replaceReason,
          }
        : item,
    );
    persistPlan(next);
    toast({ title: `הוחלף ל${exercise.name_he}`, tone: 'success' });
  };

  const removeExercise = () => {
    if (!current) return;
    const next = renumber(plan.filter((_, i) => i !== index));
    persistPlan(next);
    setIndex((i) => Math.max(0, Math.min(i, next.length - 1)));
  };

  const move = (direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= plan.length) return;
    const next = [...plan];
    [next[index], next[target]] = [next[target], next[index]];
    persistPlan(renumber(next));
    setIndex(target);
  };

  const finish = async () => {
    setSaving(true);
    const result = await finishWorkoutAction(session.id, finishNotes);
    if (!result.ok) {
      setSaving(false);
      toast({ title: result.message, tone: 'error' });
      return;
    }
    // Clear the per-exercise drafts for this session.
    plan.forEach((item) => {
      try {
        window.localStorage.removeItem(`glow:draft:${session.id}:${item.exercise_id}`);
      } catch {
        /* storage unavailable */
      }
    });
    setFinishOpen(false);
    // The summary lives on its own route so revalidation of the active session
    // cannot redirect the member away from their records.
    router.replace(`/workout/summary/${session.id}`);
  };

  const abandon = () => {
    startTransition(async () => {
      await abandonWorkoutAction(session.id);
      router.push('/workout');
      router.refresh();
    });
  };

  const totalSets = sets.length;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent-ink">אימון פעיל</p>
          <h1 className="truncate display text-xl tracking-tight">{session.title}</h1>
          <p className="num mt-0.5 text-xs text-muted">
            {formatClock(elapsed)} · {totalSets} סטים נרשמו
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="ביטול האימון">
              <X className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>לבטל את האימון?</AlertDialogTitle>
              <AlertDialogDescription>
                הסטים שכבר נרשמו יישמרו, אבל האימון לא ייספר כאימון שהושלם.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={abandon}>כן, בטלו</AlertDialogAction>
              <AlertDialogCancel>חזרה לאימון</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>

      {restSeconds !== null && (
        <RestTimer
          seconds={restSeconds}
          onDismiss={() => setRestSeconds(null)}
          onDone={() => toast({ title: 'המנוחה הסתיימה', tone: 'success' })}
        />
      )}

      {plan.length === 0 || !current || !currentExercise ? (
        <section className="surface space-y-3 p-5 text-center">
          <p className="text-sm font-bold">האימון ריק</p>
          <p className="text-xs text-muted">הוסיפו תרגיל כדי להתחיל לרשום סטים.</p>
          <Button block onClick={() => setPickerOpen(true)}>
            <Plus className="size-4" aria-hidden />
            הוספת תרגיל
          </Button>
        </section>
      ) : (
        <>
          {/* Exercise navigator */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="secondary"
              size="icon"
              aria-label="התרגיל הקודם"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
            <p className="num text-xs font-semibold text-muted">
              תרגיל {index + 1} מתוך {plan.length}
            </p>
            <Button
              variant="secondary"
              size="icon"
              aria-label="התרגיל הבא"
              disabled={index >= plan.length - 1}
              onClick={() => setIndex((i) => Math.min(plan.length - 1, i + 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>

          <section className="surface p-4" aria-labelledby="current-exercise">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 id="current-exercise" className="text-lg font-extrabold leading-tight">
                  {currentExercise.name_he}
                </h2>
                <p className="text-xs text-muted" dir="ltr">
                  {currentExercise.name_en}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="הזזת התרגיל למעלה"
                  disabled={index === 0}
                  onClick={() => move(-1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="הזזת התרגיל למטה"
                  disabled={index >= plan.length - 1}
                  onClick={() => move(1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            </div>

            <p className="num mt-2 text-xs font-semibold text-accent-ink">
              {[
                current.target_sets && `${current.target_sets} סטים`,
                current.target_reps && `${current.target_reps} חזרות`,
                current.target_load_kg && `${current.target_load_kg} ק"ג`,
                current.target_duration_seconds && `${current.target_duration_seconds} שניות`,
                current.target_distance_meters && `${current.target_distance_meters} מטר`,
                current.rest_seconds && `מנוחה ${current.rest_seconds}׳׳`,
              ]
                .filter(Boolean)
                .join(' · ') || 'ללא יעד מוגדר'}
            </p>

            {current.notes && (
              <p className="mt-2 flex items-start gap-1.5 rounded-md border border-line bg-raised p-2.5 text-xs text-muted">
                <Info className="mt-0.5 size-3.5 shrink-0 text-accent-ink" aria-hidden />
                {current.notes}
              </p>
            )}

            {bestPrevious && (
              <p className="num mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                <History className="size-3.5" aria-hidden />
                בפעם הקודמת:{' '}
                {[
                  bestPrevious.reps && `${bestPrevious.reps} חזרות`,
                  bestPrevious.load_kg && `${bestPrevious.load_kg} ק"ג`,
                  bestPrevious.duration_seconds && `${bestPrevious.duration_seconds} שניות`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}

            <details className="mt-3 rounded-md border border-line bg-raised p-2.5">
              <summary className="cursor-pointer text-xs font-bold">הוראות ביצוע ודגשים</summary>
              <p className="mt-2 text-xs leading-relaxed text-muted">{currentExercise.instructions}</p>
              {currentExercise.safety_cues && (
                <p className="mt-2 text-xs leading-relaxed text-warning">
                  בטיחות: {currentExercise.safety_cues}
                </p>
              )}
            </details>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setReplaceOpen(true)}>
                <Repeat className="size-4" aria-hidden />
                החלפת תרגיל
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                <Plus className="size-4" aria-hidden />
                הוספת תרגיל
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="danger" size="sm">
                    <Trash2 className="size-4" aria-hidden />
                    הסרה
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>להסיר את התרגיל מהאימון?</AlertDialogTitle>
                    <AlertDialogDescription>
                      הסטים שכבר נרשמו לתרגיל הזה יישארו שמורים בהיסטוריה.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction onClick={removeExercise}>כן, הסירו</AlertDialogAction>
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>

          {/* Set logging */}
          <section className="surface p-4" aria-labelledby="log-set-title">
            <h2 id="log-set-title" className="section-label">
              רישום סט {currentSets.length + 1}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <Field
                id="reps"
                label="חזרות"
                value={draft.reps}
                onChange={(v) => setDraft((d) => ({ ...d, reps: v }))}
              />
              <Field
                id="load"
                label='משקל (ק"ג)'
                value={draft.load_kg}
                step="0.5"
                onChange={(v) => setDraft((d) => ({ ...d, load_kg: v }))}
              />
              <Field
                id="duration"
                label="זמן (שניות)"
                value={draft.duration_seconds}
                onChange={(v) => setDraft((d) => ({ ...d, duration_seconds: v }))}
              />
              <Field
                id="distance"
                label="מרחק (מטר)"
                value={draft.distance_meters}
                onChange={(v) => setDraft((d) => ({ ...d, distance_meters: v }))}
              />
            </div>

            <fieldset className="mt-3">
              <legend className="mb-1.5 text-xs font-semibold text-muted">
                מאמץ נתפס ({draft.effort} מתוך 10)
              </legend>
              <div className="hide-scrollbar flex gap-1 overflow-x-auto pb-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={draft.effort === String(value)}
                    aria-label={`מאמץ ${value} מתוך 10`}
                    onClick={() => setDraft((d) => ({ ...d, effort: String(value) }))}
                    className={cn(
                      'num size-9 shrink-0 rounded-md border text-xs font-bold transition-all',
                      draft.effort === String(value)
                        ? 'border-accent bg-accent/12 text-accent-ink'
                        : 'border-line bg-raised text-muted',
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-3 space-y-1.5">
              <Label htmlFor="set-notes" className="text-xs font-semibold text-muted">
                הערה לסט (לא חובה)
              </Label>
              <Input
                id="set-notes"
                value={draft.notes}
                maxLength={300}
                placeholder="למשל: הרגשתי טוב, אפשר להעלות משקל"
                onChange={(event) => setDraft((d) => ({ ...d, notes: event.target.value }))}
              />
            </div>

            <Button block size="lg" className="mt-3.5" onClick={logSet} loading={saving}>
              <Check className="size-4" aria-hidden />
              שמירת הסט
            </Button>
          </section>

          {currentSets.length > 0 && (
            <section className="surface p-4" aria-labelledby="logged-sets-title">
              <h2 id="logged-sets-title" className="section-label mb-2 block">
                הסטים שנרשמו
              </h2>
              <ul className="space-y-1.5">
                {currentSets.map((set, i) => (
                  <li
                    key={set.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-line bg-raised px-3 py-2"
                  >
                    <span className="num text-xs font-semibold">
                      <span className="text-accent-ink">#{i + 1}</span>{' '}
                      {[
                        set.reps && `${set.reps} חזרות`,
                        set.load_kg && `${set.load_kg} ק"ג`,
                        set.duration_seconds && `${set.duration_seconds}׳׳`,
                        set.distance_meters && `${set.distance_meters} מ׳`,
                        set.effort && `מאמץ ${set.effort}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`מחיקת סט ${i + 1}`}
                      onClick={() => removeSet(set.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <Button
        block
        size="lg"
        variant={totalSets > 0 ? 'primary' : 'secondary'}
        onClick={() => setFinishOpen(true)}
      >
        <Flag className="size-4" aria-hidden />
        סיום האימון
      </Button>

      <ExercisePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        exercises={exercises}
        onSelect={addExercise}
        title="הוספת תרגיל לאימון"
        excludeIds={plan.map((item) => item.exercise_id)}
      />

      <Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>למה מחליפים את התרגיל?</DialogTitle>
            <DialogDescription>
              הסיבה נשמרת עם האימון ומשפרת את ההמלצות העתידיות שלכם.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5" role="radiogroup" aria-label="סיבת ההחלפה">
            {REPLACE_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                role="radio"
                aria-checked={replaceReason === reason.value}
                onClick={() => setReplaceReason(reason.value)}
                className={cn(
                  'w-full rounded-md border px-3 py-3 text-start text-sm font-semibold transition-colors',
                  replaceReason === reason.value
                    ? 'border-accent bg-accent/12 text-accent-ink'
                    : 'border-line bg-raised text-muted',
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>
          <Button
            block
            className="mt-4"
            onClick={() => {
              setReplaceOpen(false);
              setReplacePickerOpen(true);
            }}
          >
            בחירת תרגיל חלופי
          </Button>
        </DialogContent>
      </Dialog>

      <ExercisePicker
        open={replacePickerOpen}
        onOpenChange={setReplacePickerOpen}
        exercises={exercises}
        onSelect={replaceExercise}
        title="בחירת תרגיל חלופי"
        description="בחרו תרגיל שעובד על אותו דפוס תנועה."
        excludeIds={current ? [current.exercise_id] : []}
      />

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>סיום האימון</DialogTitle>
            <DialogDescription>
              {totalSets === 0
                ? 'עוד לא נרשם אף סט. רשמו לפחות סט אחד כדי שהאימון ייספר.'
                : `נרשמו ${totalSets} סטים במהלך ${formatClock(elapsed)}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="finish-notes">איך היה האימון? (לא חובה)</Label>
            <Textarea
              id="finish-notes"
              value={finishNotes}
              maxLength={600}
              placeholder="הערות לעצמכם לפעם הבאה"
              onChange={(event) => setFinishNotes(event.target.value)}
            />
          </div>
          <Button block size="lg" className="mt-4" onClick={finish} loading={saving}>
            סיימתי את האימון
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  step,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs font-semibold text-muted">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min="0"
        step={step ?? '1'}
        value={value}
        dir="ltr"
        className="num text-center text-lg font-bold"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function renumber(items: WorkoutSessionExercise[]): WorkoutSessionExercise[] {
  return items.map((item, index) => ({ ...item, position: index + 1 }));
}

function prefillDraft(item: WorkoutSessionExercise): DraftSet {
  return {
    ...EMPTY_DRAFT,
    reps: item.target_reps ? String(item.target_reps) : '',
    load_kg: item.target_load_kg ? String(item.target_load_kg) : '',
    duration_seconds: item.target_duration_seconds ? String(item.target_duration_seconds) : '',
    distance_meters: item.target_distance_meters ? String(item.target_distance_meters) : '',
  };
}
