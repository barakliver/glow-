'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getRepository } from '@/lib/auth';
import { readinessSchema } from '@/lib/validation';
import { dayKey, now } from '@/lib/time';
import type { ActionResult } from '@/app/actions/booking';

export async function saveReadinessAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser('/');
  const parsed = readinessSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }

  const repository = await getRepository();
  await repository.upsertReadiness({
    profile_id: user.profile.id,
    log_date: dayKey(now()),
    energy: parsed.data.energy,
    soreness: parsed.data.soreness,
    sleep_quality: parsed.data.sleep_quality,
    available_minutes: parsed.data.available_minutes,
    note: parsed.data.note?.trim() || null,
  });

  revalidatePath('/');
  revalidatePath('/workout');
  revalidatePath('/progress');
  return { ok: true, message: 'הדיווח נשמר. ההמלצות שלך עודכנו.' };
}
