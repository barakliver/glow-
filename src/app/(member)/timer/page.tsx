import type { Metadata } from 'next';
import { requireUser, getRepository, isOwner } from '@/lib/auth';
import { IntervalTimer } from './interval-timer';

export const metadata: Metadata = { title: 'טיימר טבאטה' };

export default async function TimerPage() {
  const user = await requireUser('/timer');
  const repository = await getRepository();
  const presets = await repository.listTimerPresets(user.profile.id);

  return (
    <IntervalTimer
      presets={presets}
      profileId={user.profile.id}
      canPublish={isOwner(user)}
    />
  );
}
