import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, getRepository } from '@/lib/auth';
import { isDemoMode } from '@/lib/env';
import { DEMO_ACCOUNTS } from '@/lib/data/seed';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'כניסה' };

/**
 * Turns whatever came back on the URL into something a person can act on.
 *
 * A failed sign-in used to bounce silently back to this screen, which leaves
 * the member - and whoever is setting the club up - with nothing to go on.
 */
function signInError(code?: string, description?: string): string | null {
  if (!code) return null;
  if (code === 'missing_code') {
    return 'ההתחברות בוטלה או שהקישור פג. נסו שוב.';
  }
  if (code === 'exchange_failed') {
    return 'ההתחברות נכשלה בשלב האחרון. אם זה חוזר, בדקו שכתובת החזרה של המועדון מוגדרת נכון.';
  }
  // Anything else is Google's or Supabase's own wording; showing it beats
  // hiding it, because it names the actual problem.
  return description ? decodeURIComponent(description.replace(/\+/g, ' ')) : `ההתחברות נכשלה (${code}).`;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string; error_description?: string }>;
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
      error={signInError(params.error, params.error_description)}
    />
  );
}
