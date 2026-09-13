import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Clock3, ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { getAccessState, getCurrentUser } from '@/lib/auth';
import { signOutAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'ממתין לאישור' };

/**
 * Where someone lands after signing in to a club that has not let them in yet.
 *
 * Without this they would be bounced back to a sign-in form they have already
 * completed, with nothing explaining why.
 */
export default async function WaitingPage() {
  const user = await getCurrentUser();
  if (user) redirect('/');

  const state = await getAccessState();
  if (state !== 'pending' && state !== 'suspended') redirect('/auth/sign-in');

  const pending = state === 'pending';

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Logo size="lg" className="justify-center" />

      <div className="surface space-y-3 p-5 text-center">
        <span
          className={
            pending
              ? 'mx-auto flex size-12 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent-ink'
              : 'mx-auto flex size-12 items-center justify-center rounded-full border border-warning/40 bg-warning/10 text-warning'
          }
        >
          {pending ? <Clock3 className="size-6" aria-hidden /> : <ShieldAlert className="size-6" aria-hidden />}
        </span>

        <h1 className="display text-xl tracking-tight">
          {pending ? 'הבקשה שלך נשלחה' : 'החשבון שלך מושהה'}
        </h1>
        <p className="text-sm text-muted">
          {pending
            ? 'מנהלי המועדון צריכים לאשר אותך לפני הכניסה. ברגע שתאושר, ההתחברות הבאה תיכנס ישר פנימה.'
            : 'פנה למנהלי המועדון כדי להפעיל את החשבון מחדש.'}
        </p>
      </div>

      <form action={signOutAction} className="text-center">
        <Button type="submit" variant="ghost" size="sm">
          יציאה מהחשבון
        </Button>
      </form>
    </main>
  );
}
