import type { Metadata } from 'next';
import { requireStaff, getRepository } from '@/lib/auth';
import { addDays, gymWeekDays, gymWeekStart, now } from '@/lib/time';
import { AdminSchedule } from './admin-schedule';

export const metadata: Metadata = { title: 'ניהול לוח שבועי' };

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const user = await requireStaff();
  const repository = await getRepository();

  const weekOffset = Number.parseInt(params.week ?? '0', 10) || 0;
  const anchor = addDays(now(), weekOffset * 7);
  const weekStart = gymWeekStart(anchor);

  const [classes, trainers, series] = await Promise.all([
    repository.listClasses({
      fromIso: weekStart.toISOString(),
      toIso: addDays(weekStart, 7).toISOString(),
      profileId: null,
      includeUnpublished: true,
    }),
    repository.listTrainers(),
    repository.listSeries(),
  ]);

  return (
    <AdminSchedule
      classes={classes}
      trainers={trainers.map((t) => ({ id: t.id, name: t.display_name }))}
      series={series.map((s) => ({ id: s.id, title: s.title }))}
      weekOffset={weekOffset}
      weekDays={gymWeekDays(anchor)}
      isOwner={user.membership.role === 'owner'}
      myTrainerId={user.trainer?.id ?? null}
      weekRange={{
        fromIso: weekStart.toISOString(),
        toIso: addDays(weekStart, 7).toISOString(),
      }}
    />
  );
}
