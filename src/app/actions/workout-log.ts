'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getRepository } from '@/lib/auth';
import { classWorkoutSchema, customWorkoutSchema, workoutLogSchema } from '@/lib/validation';
import { dayKey, now } from '@/lib/time';
import { hasScore, scoreColumns } from '@/lib/domain/workout-score';
import type { ActionResult } from '@/app/actions/booking';
import type { Workout } from '@/lib/domain/types';

/**
 * Records the member's result for a workout.
 *
 * Two things are checked here rather than trusted from the form: that the score
 * type matches the workout the result is filed against, and that the member was
 * actually in the class they claim to have done it in. Neither is enforceable
 * from the client, and the second is what keeps a workout that has not been
 * revealed from being logged as if it had.
 */
export async function logWorkoutResultAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/workout');
  const parsed = workoutLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const data = parsed.data;
  const repository = await getRepository();

  const workout = await repository.getWorkout(data.workout_id);
  if (!workout) return { ok: false, message: 'האימון לא נמצא.' };

  // The form says what it thinks it is scoring; the library is the authority.
  const scoreType = workout.score_type;
  const columns = scoreColumns(scoreType, {
    minutes: data.minutes ?? null,
    seconds: data.seconds ?? null,
    rounds: data.rounds ?? null,
    reps: data.reps ?? null,
    weightKg: data.weight_kg ?? null,
    completed: data.completed ?? null,
  });
  if (!hasScore(scoreType, columns)) {
    return { ok: false, message: 'לא הוזנה תוצאה.' };
  }

  const classId = data.class_id?.trim() || null;
  if (classId) {
    const reveal = await repository.getClassWorkout(classId, user.profile.id);
    if (reveal.state !== 'revealed' || reveal.workout.id !== workout.id) {
      return { ok: false, message: 'אין לך רישום לשיעור הזה.' };
    }
  }

  await repository.logWorkoutResult({
    profileId: user.profile.id,
    workoutId: workout.id,
    classId,
    performedOn: dayKey(now()),
    scoreType,
    resultSeconds: columns.result_seconds,
    resultRounds: columns.result_rounds,
    resultReps: columns.result_reps,
    resultWeightKg: columns.result_weight_kg,
    completed: columns.completed,
    rx: data.rx,
    rpe: data.rpe ?? null,
    notes: data.notes?.trim() || null,
  });

  revalidatePath('/progress');
  revalidatePath('/workout');
  revalidatePath('/workout/results');
  if (classId) revalidatePath(`/classes/${classId}`);
  return { ok: true, message: 'התוצאה נשמרה.' };
}

export async function deleteWorkoutLogAction(logId: string): Promise<ActionResult> {
  const user = await requireUser('/workout/results');
  const repository = await getRepository();
  await repository.deleteWorkoutLog(logId, user.profile.id);
  revalidatePath('/workout/results');
  revalidatePath('/progress');
  return { ok: true, message: 'התוצאה נמחקה.' };
}

/** Staff only: attaches a workout to a class, or detaches it. */
export async function setClassWorkoutAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/admin/schedule');
  if (user.membership.role === 'member') {
    return { ok: false, message: 'רק מאמן או מנהל יכולים לשבץ אימון לשיעור.' };
  }
  const parsed = classWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }

  const repository = await getRepository();
  const workoutId = parsed.data.workout_id?.trim() || null;
  if (workoutId && !(await repository.getWorkout(workoutId))) {
    return { ok: false, message: 'האימון לא נמצא בספרייה.' };
  }

  await repository.setClassWorkout(parsed.data.class_id, workoutId, {
    notes: parsed.data.notes?.trim() || null,
    assignedBy: user.profile.id,
  });

  revalidatePath('/admin/schedule');
  revalidatePath(`/admin/classes/${parsed.data.class_id}`);
  revalidatePath(`/classes/${parsed.data.class_id}`);
  revalidatePath('/schedule');
  return {
    ok: true,
    message: workoutId ? 'האימון שובץ לשיעור.' : 'שיבוץ האימון הוסר.',
  };
}

/** One movement per line; an empty line is skipped rather than stored. */
function toLines(value: string | undefined): { label: string; detail: string | null }[] {
  return (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const index = line.indexOf(' | ');
      if (index === -1) return { label: line, detail: null };
      return { label: line.slice(0, index).trim(), detail: line.slice(index + 3).trim() };
    });
}

/** A URL-safe handle. Hebrew titles leave nothing behind, so fall back to time. */
function toSlug(title: string, id: string | undefined): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length >= 3) return `club-${base}`;
  return `club-${id?.slice(0, 8) ?? Date.now().toString(36)}`;
}

/** Staff only: writes a workout of the club's own into the library. */
export async function saveCustomWorkoutAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/admin/workouts');
  if (user.membership.role === 'member') {
    return { ok: false, message: 'רק מאמן או מנהל יכולים לכתוב אימון.' };
  }
  const parsed = customWorkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const data = parsed.data;
  const repository = await getRepository();

  const structure = [
    { label: 'כוח', detail: data.strength_detail?.trim() || null, items: toLines(data.strength) },
    { label: 'מטקון', detail: data.metcon_detail?.trim() || null, items: toLines(data.metcon) },
  ].filter((block) => block.items.length > 0);

  await repository.saveWorkout({
    id: data.id?.trim() || undefined,
    slug: toSlug(data.title, data.id?.trim()),
    title: data.title.trim(),
    subtitle: data.subtitle?.trim() || null,
    category: data.category,
    format: data.format,
    difficulty: data.difficulty,
    durationMinutes: data.duration_minutes,
    timeCapMinutes: data.time_cap_minutes ?? null,
    equipment: data.equipment as Workout['equipment'],
    description: data.description?.trim() || '',
    warmup: toLines(data.warmup),
    structure,
    cooldown: toLines(data.cooldown),
    // A level left blank says so, rather than repeating the line above it.
    scaling: [
      { level: 'beginner' as const, detail: data.scaling_beginner?.trim() || 'לא צוינה התאמה.' },
      { level: 'intermediate' as const, detail: data.scaling_intermediate?.trim() || 'לפי הכתוב.' },
      { level: 'advanced' as const, detail: data.scaling_advanced?.trim() || 'לפי הכתוב.' },
    ],
    scoreType: data.score_type,
    scoreLabel: null,
  });

  revalidatePath('/admin/workouts');
  revalidatePath('/workout/wods');
  return { ok: true, message: 'האימון נשמר בספרייה.' };
}
