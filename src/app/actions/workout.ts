'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getRepository } from '@/lib/auth';
import { setLogSchema } from '@/lib/validation';
import { detectNewRecords, type PersonalRecord } from '@/lib/domain/progress';
import type { WorkoutSession, WorkoutSessionExercise } from '@/lib/domain/types';
import type { ActionResult } from '@/app/actions/booking';

export async function startWorkoutAction(input: {
  templateId: string | null;
  title: string;
  goal: WorkoutSession['goal'];
  exercises: WorkoutSessionExercise[];
}): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requireUser('/workout');
  const repository = await getRepository();
  if (input.exercises.length === 0) {
    return { ok: false, message: 'צריך לבחור לפחות תרגיל אחד כדי להתחיל אימון.' };
  }
  const session = await repository.startSession({
    profileId: user.profile.id,
    templateId: input.templateId,
    title: input.title,
    goal: input.goal,
    exercises: input.exercises,
  });
  revalidatePath('/workout');
  return { ok: true, message: 'האימון התחיל.', data: { sessionId: session.id } };
}

export async function updateSessionExercisesAction(
  sessionId: string,
  exercises: WorkoutSessionExercise[],
): Promise<ActionResult> {
  const user = await requireUser('/workout');
  const repository = await getRepository();
  const session = await repository.getSession(sessionId);
  if (!session || session.profile_id !== user.profile.id) {
    return { ok: false, message: 'האימון לא נמצא.' };
  }
  await repository.updateSession(sessionId, { exercises });
  return { ok: true, message: 'נשמר.' };
}

export async function logSetAction(input: unknown): Promise<ActionResult<{ setId: string }>> {
  const user = await requireUser('/workout');
  const parsed = setLogSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'נתוני הסט אינם תקינים.' };
  }
  const repository = await getRepository();
  const session = await repository.getSession(parsed.data.session_id);
  if (!session || session.profile_id !== user.profile.id) {
    return { ok: false, message: 'האימון לא נמצא.' };
  }
  const set = await repository.addSet({
    session_id: parsed.data.session_id,
    exercise_id: parsed.data.exercise_id,
    position: parsed.data.position,
    set_index: parsed.data.set_index,
    reps: parsed.data.reps ?? null,
    load_kg: parsed.data.load_kg ?? null,
    duration_seconds: parsed.data.duration_seconds ?? null,
    distance_meters: parsed.data.distance_meters ?? null,
    effort: parsed.data.effort ?? null,
    notes: parsed.data.notes ?? null,
    completed_at: parsed.data.completed_at ?? new Date().toISOString(),
  });
  return { ok: true, message: 'הסט נשמר.', data: { setId: set.id } };
}

export async function deleteSetAction(sessionId: string, setId: string): Promise<ActionResult> {
  const user = await requireUser('/workout');
  const repository = await getRepository();
  const session = await repository.getSession(sessionId);
  if (!session || session.profile_id !== user.profile.id) {
    return { ok: false, message: 'האימון לא נמצא.' };
  }
  await repository.deleteSet(setId);
  return { ok: true, message: 'הסט נמחק.' };
}

export async function finishWorkoutAction(
  sessionId: string,
  notes: string,
): Promise<ActionResult<{ records: PersonalRecord[]; totalSeconds: number; setCount: number }>> {
  const user = await requireUser('/workout');
  const repository = await getRepository();
  const session = await repository.getSession(sessionId);
  if (!session || session.profile_id !== user.profile.id) {
    return { ok: false, message: 'האימון לא נמצא.' };
  }
  const sessionSets = await repository.listSessionSets(sessionId);
  if (sessionSets.length === 0) {
    return { ok: false, message: 'לא נרשם אף סט. אפשר לרשום סט אחד לפחות או לבטל את האימון.' };
  }

  const finished = await repository.finishSession(sessionId, { notes: notes.trim() || null });
  const allSets = await repository.listSets(user.profile.id);
  const records = detectNewRecords(allSets, sessionId);

  revalidatePath('/workout');
  revalidatePath('/progress');
  revalidatePath('/');

  return {
    ok: true,
    message: 'האימון הושלם.',
    data: {
      records,
      totalSeconds: finished.total_seconds ?? 0,
      setCount: sessionSets.length,
    },
  };
}

export async function abandonWorkoutAction(sessionId: string): Promise<ActionResult> {
  const user = await requireUser('/workout');
  const repository = await getRepository();
  const session = await repository.getSession(sessionId);
  if (!session || session.profile_id !== user.profile.id) {
    return { ok: false, message: 'האימון לא נמצא.' };
  }
  await repository.updateSession(sessionId, { status: 'abandoned' });
  revalidatePath('/workout');
  return { ok: true, message: 'האימון בוטל.' };
}
