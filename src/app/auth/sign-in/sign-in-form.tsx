'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { ROLE_LABELS } from '@/lib/labels';
import {
  signInAsDemoAccountAction,
  signInWithEmailAction,
  signInWithGoogleAction,
} from '@/app/actions/auth';
import type { Role } from '@/lib/domain/types';

interface DemoAccount {
  id: string;
  name: string;
  role: string;
  email: string;
}

export function SignInForm({
  demoMode,
  googleEnabled,
  accounts,
  returnTo,
}: {
  demoMode: boolean;
  googleEnabled: boolean;
  accounts: DemoAccount[];
  returnTo: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const go = () => {
    router.replace(returnTo && returnTo.startsWith('/') ? returnTo : '/');
    router.refresh();
  };

  const submitEmail = (formData: FormData) => {
    setEmailError(null);
    startTransition(async () => {
      const result = await signInWithEmailAction(formData);
      if (!result.ok) {
        setEmailError(result.message);
        return;
      }
      if (demoMode) {
        toast({ title: result.message, tone: 'success' });
        go();
      } else {
        setSent(true);
        toast({ title: result.message, tone: 'success' });
      }
    });
  };

  const signInAs = (profileId: string, name: string) => {
    startTransition(async () => {
      const result = await signInAsDemoAccountAction(profileId);
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      toast({ title: `ברוך שובך, ${name}`, tone: 'success' });
      go();
    });
  };

  const signInGoogle = () => {
    startTransition(async () => {
      const result = await signInWithGoogleAction(returnTo ?? undefined);
      if (!result.ok || !result.data) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      window.location.href = result.data.url;
    });
  };

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8 text-center">
        <Logo size="xl" className="justify-center" />
        <p className="mt-3 text-sm text-muted">מועדון אימונים פרטי · בהזמנה בלבד</p>
      </div>

      {sent ? (
        <div className="surface space-y-3 p-6 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/12">
            <Mail className="size-6 text-accent" aria-hidden />
          </div>
          <h1 className="text-lg font-bold">שלחנו לכם קישור כניסה</h1>
          <p className="text-sm text-muted">
            בדקו את תיבת הדואר של <span className="num">{email}</span> ולחצו על הקישור כדי להיכנס.
            הקישור תקף ל-60 דקות.
          </p>
          <Button variant="ghost" block onClick={() => setSent(false)}>
            שליחה לכתובת אחרת
          </Button>
        </div>
      ) : (
        <form action={submitEmail} className="surface space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">כתובת אימייל</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              dir="ltr"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'email-error' : 'email-hint'}
              required
            />
            {emailError ? (
              <p id="email-error" role="alert" className="text-xs font-semibold text-danger">
                {emailError}
              </p>
            ) : (
              <p id="email-hint" className="text-xs text-muted">
                {demoMode
                  ? 'במצב הדגמה הכניסה מיידית, ללא סיסמה וללא אימייל.'
                  : 'נשלח אליכם קישור כניסה חד-פעמי. אין צורך בסיסמה.'}
              </p>
            )}
          </div>
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

          <Button type="submit" block size="lg" loading={pending}>
            {demoMode ? 'כניסה' : 'שליחת קישור כניסה'}
            <ArrowLeft className="size-4" aria-hidden />
          </Button>

          {googleEnabled && (
            <>
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-muted">או</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <Button type="button" variant="secondary" block size="lg" onClick={signInGoogle} loading={pending}>
                המשך עם Google
              </Button>
            </>
          )}
        </form>
      )}

      {demoMode && accounts.length > 0 && (
        <section className="mt-6" aria-labelledby="demo-heading">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden />
            <h2 id="demo-heading" className="text-sm font-bold">
              כניסה מהירה להדגמה
            </h2>
          </div>
          <p className="mb-3 text-xs text-muted">
            אין הגדרות Supabase, לכן האפליקציה פועלת על נתוני הדגמה מקומיים. בחרו משתמש כדי לנסות את
            כל המסכים.
          </p>
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li key={account.id}>
                <button
                  type="button"
                  onClick={() => signInAs(account.id, account.name)}
                  disabled={pending}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-3 text-start transition-colors hover:border-accent/40 hover:bg-raised disabled:opacity-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">{account.name}</span>
                    <span className="block truncate font-num text-xs text-muted" dir="ltr">
                      {account.email}
                    </span>
                  </span>
                  <Badge
                    tone={
                      account.role === 'owner'
                        ? 'accent'
                        : account.role === 'trainer'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {account.role === 'pending'
                      ? 'ממתין לאישור'
                      : (ROLE_LABELS[account.role as Role] ?? account.role)}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <ShieldCheck className="size-3.5" aria-hidden />
        פרטי הקשר ונתוני האימון שלכם אינם נחשפים בקישורים ציבוריים.
      </p>
    </main>
  );
}
