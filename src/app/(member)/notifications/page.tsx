import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { NotificationCenter } from './notification-center';
import { emailProviderName } from '@/lib/notifications/email';

export const metadata: Metadata = { title: 'התראות' };

export default async function NotificationsPage() {
  const user = await requireUser('/notifications');
  const repository = await getRepository();
  const notifications = await repository.listNotifications(user.profile.id);
  return <NotificationCenter notifications={notifications} provider={emailProviderName()} />;
}
