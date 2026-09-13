'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getRepository } from '@/lib/auth';
import { classWorkoutSchema, workoutLogSchema } from '@/lib/validation';
import { dayKey, now } from '@/lib/time';
import { hasScore, scoreColumns } from '@/lib/domain/workout-score';
import type { ActionResult } from '@/app/actions/booking';

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
