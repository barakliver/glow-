import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { addDays, gymWeekStart, gymWeekDays, now } from '@/lib/time';
import { WeeklySchedule } from './weekly-schedule';

export const metadata: Metadata = { title: 'לוח שבועי' };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser('/schedule');
  const repository = await getRepository();

  const weekOffset = Number.parseInt(params.week ?? '0', 10) || 0;
  const anchor = addDays(now(), weekOffset * 7);
  const weekStart = gymWeekStart(anchor);
  const weekEnd = addDays(weekStart, 7);

  const [classes, trainers] = await Promise.all([
    repository.listClasses({
      fromIso: weekStart.toISOString(),
      toIso: weekEnd.toISOString(),
      profileId: user.profile.id,
    }),
    repository.listTrainers(),
  ]);

  return (
    <WeeklySchedule
      classes={classes}
      trainers={trainers.map((t) => ({ id: t.id, name: t.display_name }))}
      weekOffset={weekOffset}
      weekDays={gymWeekDays(anchor)}
      initialDay={params.day ?? null}
    />
  );
}
