'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, getRepository, isOwner } from '@/lib/auth';
import { timerPresetSchema } from '@/lib/validation';
import type { TimerPreset } from '@/lib/domain/types';
import type { ActionResult } from '@/app/actions/booking';

export async function saveTimerPresetAction(
  input: unknown,
  presetId?: string,
): Promise<ActionResult<{ preset: TimerPreset }>> {
  const user = await requireUser('/timer');
  const parsed = timerPresetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הנתונים אינם תקינים.' };
  }
  // Only the owner may publish a preset to every member.
  const isPublic = parsed.data.is_public && isOwner(user);

  const repository = await getRepository();
  const preset = presetId
    ? await repository.updateTimerPreset(presetId, { ...parsed.data, is_public: isPublic })
    : await repository.createTimerPreset({
        ...parsed.data,
        is_public: isPublic,
        profile_id: isPublic ? null : user.profile.id,
      });

  revalidatePath('/timer');
  return { ok: true, message: 'התבנית נשמרה.', data: { preset } };
}

export async function deleteTimerPresetAction(presetId: string): Promise<ActionResult> {
  const user = await requireUser('/timer');
  const repository = await getRepository();
  const presets = await repository.listTimerPresets(user.profile.id);
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return { ok: false, message: 'התבנית לא נמצאה.' };
  if (preset.is_public && !isOwner(user)) {
    return { ok: false, message: 'רק בעל המועדון יכול למחוק תבנית משותפת.' };
  }
  if (!preset.is_public && preset.profile_id !== user.profile.id) {
    return { ok: false, message: 'אין לכם הרשאה למחוק את התבנית הזו.' };
  }
  await repository.deleteTimerPreset(presetId);
  revalidatePath('/timer');
  return { ok: true, message: 'התבנית נמחקה.' };
}
