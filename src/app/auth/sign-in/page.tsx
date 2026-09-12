import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, getRepository } from '@/lib/auth';
import { isDemoMode } from '@/lib/env';
import { DEMO_ACCOUNTS } from '@/lib/data/seed';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'כניסה' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(params.returnTo ?? '/');

  const demo = isDemoMode();
  let accounts: { id: string; name: string; role: string; email: string }[] = [];
  // The picker shows a waiting applicant too, so the approval screen is
  // reachable in the demo. 'pending' stands in for the role label.
  if (demo) {
    const repository = await getRepository();
    const members = await repository.listMembers();
    accounts = members.map((row) => ({
      id: row.profile.id,
      name: row.profile.full_name,
      role: row.membership.approved_at === null ? 'pending' : row.membership.role,
      email: row.profile.email,
    }));
    if (accounts.length === 0) {
      accounts = DEMO_ACCOUNTS.map((a) => ({ id: a.id, name: a.name, role: a.role, email: a.email }));
    }
  }

  return (
    <SignInForm
      demoMode={demo}
      accounts={accounts}
      returnTo={params.returnTo ?? null}
    />
  );
}
