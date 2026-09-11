import { NextResponse, type NextRequest } from 'next/server';
import { getRepository } from '@/lib/auth';
import { addMinutes, formatTime, now } from '@/lib/time';

/**
 * Sends reminders for classes starting soon.
 *
 * Designed to be called on a schedule (Vercel Cron, GitHub Actions, any cron).
 * It is idempotent within a window: a member who already has a reminder for a
 * class is skipped, so overlapping runs cannot double-notify.
 *
 * Protect it with CRON_SECRET and call it as:
 *   GET /api/cron/reminders?minutes=120
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get('authorization');
    if (header !== `Bearer ${secret}`) {
      return new NextResponse('unauthorized', { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const minutes = Math.min(
    1440,
    Math.max(15, Number.parseInt(searchParams.get('minutes') ?? '120', 10) || 120),
  );

  const repository = await getRepository();
  const reference = now();
  const classes = await repository.listClasses({
    fromIso: reference.toISOString(),
    toIso: addMinutes(reference, minutes).toISOString(),
    profileId: null,
  });

  let sent = 0;
  for (const gymClass of classes) {
    if (gymClass.status !== 'scheduled') continue;
    const bookings = await repository.listClassBookings(gymClass.id);

    for (const row of bookings) {
      if (row.booking.status !== 'confirmed') continue;

      const existing = await repository.listNotifications(row.profile.id);
      const alreadySent = existing.some(
        (notification) =>
          notification.type === 'class_reminder' &&
          notification.link === `/classes/${gymClass.id}`,
      );
      if (alreadySent) continue;

      await repository.createNotification({
        profile_id: row.profile.id,
        type: 'class_reminder',
        title: 'תזכורת לשיעור',
        body: `${gymClass.title} מתחיל בשעה ${formatTime(gymClass.starts_at)} ב${gymClass.location}.`,
        link: `/classes/${gymClass.id}`,
      });
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, window_minutes: minutes, classes: classes.length, sent });
}
