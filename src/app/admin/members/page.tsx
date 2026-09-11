import type { Metadata } from 'next';
import { requireOwner, getRepository } from '@/lib/auth';
import { MemberDirectory } from './member-directory';
import { now } from '@/lib/time';

export const metadata: Metadata = { title: 'מתאמנים' };

export default async function MembersPage() {
  const user = await requireOwner();
  const repository = await getRepository();
  const members = await repository.listMembers();
  const reference = now();

  const rows = await Promise.all(
    members.map(async (row) => {
      const bookings = await repository.listMyBookings(row.profile.id);
      const attended = bookings.filter((b) => b.booking.status === 'attended').length;
      const upcoming = bookings.filter(
        (b) =>
          ['confirmed', 'waitlisted'].includes(b.booking.status) &&
          new Date(b.gymClass.starts_at).getTime() > reference.getTime(),
      ).length;
      const completedBookings = bookings.filter((b) =>
        ['attended', 'absent'].includes(b.booking.status),
      ).length;
      return {
        profileId: row.profile.id,
        name: row.profile.full_name,
        email: row.profile.email,
        phone: row.profile.phone,
        role: row.membership.role,
        status: row.membership.status,
        joinedAt: row.membership.joined_at,
        attended,
        upcoming,
        attendanceRate:
          completedBookings === 0 ? null : Math.round((attended / completedBookings) * 100),
      };
    }),
  );

  return <MemberDirectory rows={rows} currentProfileId={user.profile.id} />;
}
