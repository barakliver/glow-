import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { MilitarySession } from './military-session';

export const metadata: Metadata = { title: 'Barak Workout Military' };

export default async function MilitaryPage() {
  const user = await requireUser('/workout/military');
  const repository = await getRepository();

  /*
   * The burn estimate is arithmetic on body weight, so it is read here rather
   * than asked for on the screen: the member has usually already recorded it
   * under tracking, and asking again mid-warm-up is the sort of friction that
   * stops a workout being started.
   */
  const latest = await repository.latestBodyMetric(user.profile.id);

  return <MilitarySession weightKg={latest?.weight_kg ?? null} />;
}
