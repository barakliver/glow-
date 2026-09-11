import type { Metadata } from 'next';
import { requireStaff, getRepository } from '@/lib/auth';
import { emailProviderName } from '@/lib/notifications/email';
import { AnnouncementForm } from './announcement-form';

export const metadata: Metadata = { title: 'הודעות' };

export default async function AnnouncementsPage() {
  const user = await requireStaff();
  const repository = await getRepository();
  const [members, sent] = await Promise.all([
    repository.listMembers(),
    repository.listNotifications(user.profile.id),
  ]);

  return (
    <AnnouncementForm
      recipientCount={members.filter((m) => m.membership.status === 'active').length - 1}
      provider={emailProviderName()}
      recent={sent
        .filter((n) => n.type === 'announcement')
        .slice(0, 5)
        .map((n) => ({ id: n.id, title: n.title, body: n.body, createdAt: n.created_at }))}
    />
  );
}
