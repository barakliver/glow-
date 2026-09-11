import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser, getRepository } from '@/lib/auth';
import { CheckInScreen } from './check-in-screen';
import { formatHebrewDate, formatTime } from '@/lib/time';

export const metadata: Metadata = {
  title: 'צ׳ק-אין לשיעור',
  robots: { index: false, follow: false },
};

export default async function CheckInPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/sign-in?returnTo=${encodeURIComponent(`/checkin/${classId}`)}`);

  const repository = await getRepository();
  const gymClass = await repository.getClass(classId, user.profile.id);
  if (!gymClass) notFound();

  return (
    <CheckInScreen
      classId={gymClass.id}
      title={gymClass.title}
      when={`${formatHebrewDate(gymClass.starts_at)} · ${formatTime(gymClass.starts_at)}`}
      location={gymClass.location}
      bookingStatus={gymClass.my_booking?.status ?? null}
      cancelled={gymClass.status === 'cancelled'}
      memberName={user.profile.full_name}
    />
  );
}
