import type { Metadata } from 'next';
import { requireUser, getRepository } from '@/lib/auth';
import { emailProviderName } from '@/lib/notifications/email';
import { NotificationPreferencesForm } from './preferences-form';

export const metadata: Metadata = { title: 'העדפות התראות' };

export default async function NotificationPreferencesPage() {
  const user = await requireUser('/more/notifications');
  const repository = await getRepository();
  const preferences = await repository.getNotificationPreferences(user.profile.id);
  return <NotificationPreferencesForm preferences={preferences} provider={emailProviderName()} />;
}
