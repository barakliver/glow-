import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireStaff, getRepository, isOwner } from '@/lib/auth';
import { ClassRoster } from './class-roster';
import { APP_URL } from '@/lib/env';

export const metadata: Metadata = { title: 'ניהול שיעור' };

export default async function AdminClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  const repository = await getRepository();

  const gymClass = await repository.getClass(id, null);
  if (!gymClass) notFound();

  const canManage = isOwner(user) || (user.trainer && gymClass.trainer_id === user.trainer.id);
  const [bookings, attendance] = await Promise.all([
    repository.listClassBookings(id),
    repository.listAttendance(''),
  ]);

  return (
    <ClassRoster
      gymClass={gymClass}
      rows={bookings.map((row) => ({
        bookingId: row.booking.id,
        profileId: row.profile.id,
        name: row.profile.full_name,
        phone: row.profile.phone,
        status: row.booking.status,
        waitlistPosition: row.booking.waitlist_position,
      }))}
      canManage={Boolean(canManage)}
      checkinUrl={`${APP_URL}/checkin/${gymClass.id}`}
      attendanceCount={attendance.length}
    />
  );
}
