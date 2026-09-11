import type { Metadata } from 'next';
import { requireOwner, getRepository } from '@/lib/auth';
import { InviteManager } from './invite-manager';
import { APP_URL } from '@/lib/env';

export const metadata: Metadata = { title: 'הזמנות' };

export default async function InvitesPage() {
  await requireOwner();
  const repository = await getRepository();
  const invites = await repository.listInvites();
  return <InviteManager invites={invites} appUrl={APP_URL} />;
}
