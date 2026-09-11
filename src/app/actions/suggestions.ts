'use server';

import { requireUser, getRepository } from '@/lib/auth';
import { buildRecommendations } from '@/lib/data/insights';
import type { Recommendation } from '@/lib/domain/recommend';
import type { Equipment, TrainingGoal } from '@/lib/domain/types';
import type { ActionResult } from '@/app/actions/booking';

export async function getSuggestionsAction(input: {
  goal: TrainingGoal | null;
  minutes: number | null;
  equipment: Equipment[];
}): Promise<ActionResult<{ recommendations: Recommendation[] }>> {
  const user = await requireUser('/workout');
  const repository = await getRepository();
  const { recommendations } = await buildRecommendations(repository, user.profile.id, {
    preferredGoal: input.goal,
    availableMinutes: input.minutes,
    availableEquipment: input.equipment.length > 0 ? input.equipment : undefined,
    limit: 3,
  });
  return { ok: true, message: '', data: { recommendations } };
}
