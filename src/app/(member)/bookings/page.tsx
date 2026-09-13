import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarCheck, CalendarPlus, CalendarX, History } from 'lucide-react';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { BookingButton } from '@/components/classes/booking-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { classAvailability } from '@/lib/domain/booking-rules';
import { BOOKING_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/labels';
import { formatHebrewDate, formatTime, now, relativeHebrew } from '@/lib/time';
import type { Booking, GymClass } from '@/lib/domain/types';

export const metadata: Metadata = { title: 'ההזמנות שלי' };

type Row = { booking: Booking; gymClass: GymClass };

export default async function BookingsPage() {
  const user = await requireUser('/bookings');
  const repository = await getRepository();
  const [bookings, attendance] = await Promise.all([
    repository.listMyBookings(user.profile.id),
    repository.listAttendance(user.profile.id),
  ]);
  const reference = now();

  const upcoming = bookings
    .filter(
      (row) =>
        ['confirmed', 'waitlisted'].includes(row.booking.status) &&
        new Date(row.gymClass.starts_at).getTime() > reference.getTime(),
    )
    .sort(
      (a, b) => new Date(a.gymClass.starts_at).getTime() - new Date(b.gymClass.starts_at).getTime(),
    );

  const completed = bookings.filter((row) => ['attended', 'absent'].includes(row.booking.status));
  const cancelled = bookings.filter(
    (row) =>
      row.booking.status === 'cancelled' ||
      (['confirmed', 'waitlisted'].includes(row.booking.status) &&
        new Date(row.gymClass.starts_at).getTime() <= reference.getTime()),
  );

  const attended = attendance.filter((a) => a.present).length;
  const attendanceRate =
    attendance.length === 0 ? 0 : Math.round((attended / attendance.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader title="ההזמנות שלי" subtitle="הרישומים, ההיסטוריה והנוכחות שלך" backHref="/" />

      <section className="surface grid grid-cols-3 gap-2 p-3" aria-label="סיכום נוכחות">
        <Stat label="קרובים" value={upcoming.length} />
        <Stat label="שיעורים שהושלמו" value={completed.length} />
        <Stat label="אחוז הגעה" value={`${attendanceRate}%`} />
      </section>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">קרובים</TabsTrigger>
          <TabsTrigger value="completed">הושלמו</TabsTrigger>
          <TabsTrigger value="cancelled">בוטלו</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="אין לך רישומים קרובים"
              description="בחרו שיעור מהלוח השבועי ונשמור לכם מקום."
              action={
                <Button size="sm" asChild>
                  <Link href="/schedule">ללוח השבועי</Link>
                </Button>
              }
            />
          ) : (
            upcoming.map((row) => <UpcomingRow key={row.booking.id} row={row} reference={reference} />)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completed.length === 0 ? (
            <EmptyState
              icon={History}
              title="עוד אין היסטוריה"
              description="אחרי שתשתתפו בשיעור הראשון הוא יופיע כאן."
            />
          ) : (
            completed
              .sort(
                (a, b) =>
                  new Date(b.gymClass.starts_at).getTime() -
                  new Date(a.gymClass.starts_at).getTime(),
              )
              .map((row) => <HistoryRow key={row.booking.id} row={row} />)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-3">
          {cancelled.length === 0 ? (
            <EmptyState icon={CalendarX} title="לא ביטלתם אף רישום" />
          ) : (
            cancelled
              .sort(
                (a, b) =>
                  new Date(b.gymClass.starts_at).getTime() -
                  new Date(a.gymClass.starts_at).getTime(),
              )
              .map((row) => <HistoryRow key={row.booking.id} row={row} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <p className="stat-value">{value}</p>
      <p className="label-muted">{label}</p>
    </div>
  );
}

function UpcomingRow({ row, reference }: { row: Row; reference: Date }) {
  const waitlisted = row.booking.status === 'waitlisted';
  return (
    <article className="rounded-lg border border-accent/40 bg-surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent-ink">
            {relativeHebrew(row.gymClass.starts_at, reference)}
          </p>
          <h3 className="mt-0.5 truncate text-base font-bold">{row.gymClass.title}</h3>
          <p className="mt-1 text-xs text-muted">
            {formatHebrewDate(row.gymClass.starts_at)} ·{' '}
            <span className="num">{formatTime(row.gymClass.starts_at)}</span> · {row.gymClass.location}
          </p>
        </div>
        <Badge tone={waitlisted ? 'warning' : 'accent'}>
          {waitlisted ? `המתנה ${row.booking.waitlist_position}` : 'רשום'}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        <BookingButton
          classId={row.gymClass.id}
          availability={classAvailability(
            row.gymClass,
            // The member already holds this booking, so their own status - not
            // the remaining capacity - decides what the button offers.
            [],
            row.booking,
            reference,
          )}
          waitlistPosition={row.booking.waitlist_position}
          size="sm"
          block={false}
        />
        <Button variant="secondary" size="sm" asChild>
          <a href={`/api/classes/${row.gymClass.id}/ics`}>
            <CalendarPlus className="size-4" aria-hidden />
            ליומן
          </a>
        </Button>
      </div>
    </article>
  );
}

function HistoryRow({ row }: { row: Row }) {
  const tone =
    row.booking.status === 'attended'
      ? 'success'
      : row.booking.status === 'absent'
        ? 'danger'
        : 'neutral';
  return (
    <Link
      href={`/classes/${row.gymClass.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-accent/30"
    >
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold">{row.gymClass.title}</h3>
        <p className="mt-0.5 text-xs text-muted">
          {formatHebrewDate(row.gymClass.starts_at)} ·{' '}
          <span className="num">{formatTime(row.gymClass.starts_at)}</span> ·{' '}
          {CATEGORY_LABELS[row.gymClass.category]}
        </p>
      </div>
      <Badge tone={tone}>{BOOKING_STATUS_LABELS[row.booking.status]}</Badge>
    </Link>
  );
}
