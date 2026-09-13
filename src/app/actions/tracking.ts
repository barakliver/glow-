'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getRepository } from '@/lib/auth';
import { activityLogSchema, bodyMetricSchema } from '@/lib/validation';
import { dayKey, now } from '@/lib/time';
import type { ActionResult } from '@/app/actions/booking';

export async function saveBodyMetricAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/tracking');
  const parsed = bodyMetricSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }

  const repository = await getRepository();
  await repository.upsertBodyMetric({
    profileId: user.profile.id,
    measuredOn: dayKey(now()),
    heightCm: parsed.data.height_cm ?? null,
    weightKg: parsed.data.weight_kg ?? null,
    note: parsed.data.note?.trim() || null,
  });

  revalidatePath('/tracking');
  revalidatePath('/progress');
  return { ok: true, message: 'נשמר.' };
}

/**
 * Records anything the member did.
 *
 * The lift rows are filtered rather than rejected: someone who adds a row and
 * leaves it blank meant to add a row and changed their mind, and losing the
 * whole form over it would be the wrong answer.
 */
export async function logActivityAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/tracking');
  const parsed = activityLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  const data = parsed.data;
  const repository = await getRepository();

  await repository.logActivity({
    profileId: user.profile.id,
    performedOn: data.performed_on,
    kind: data.kind,
    title: data.title.trim(),
    notes: data.notes?.trim() || null,
    durationSeconds: data.duration_minutes ? data.duration_minutes * 60 : null,
    rpe: data.rpe ?? null,
    distanceMeters: data.kind === 'run' && data.distance_km
      ? Math.round(data.distance_km * 1000)
      : null,
    inclinePercent: data.kind === 'run' ? (data.incline_percent ?? null) : null,
    classId: data.class_id?.trim() || null,
    lifts: data.lifts
      .filter((lift) => lift.exercise_name.trim().length > 0)
      .map((lift) => ({
        exerciseId: lift.exercise_id?.trim() || null,
        exerciseName: lift.exercise_name.trim(),
        sets: lift.sets,
        reps: lift.reps ?? null,
        weightKg: lift.weight_kg ?? null,
      })),
  });

  revalidatePath('/tracking');
  revalidatePath('/progress');
  revalidatePath('/');
  return { ok: true, message: 'האימון נרשם.' };
}

export async function deleteActivityAction(activityId: string): Promise<ActionResult> {
  const user = await requireUser('/tracking');
  const repository = await getRepository();
  await repository.deleteActivity(activityId, user.profile.id);
  revalidatePath('/tracking');
  revalidatePath('/progress');
  return { ok: true, message: 'הרישום נמחק.' };
}
