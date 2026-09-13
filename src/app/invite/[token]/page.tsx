import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { CalendarOff, Clock, LogIn, MapPin, ShieldCheck, User, Users } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { InviteShare } from './invite-share';
import { resolveInvite } from '@/lib/data/public-schedule';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/labels';
import {
  addDays,
  dayKey,
  formatHebrewDate,
  formatTime,
  gymWeekStart,
  now,
  parseISO,
} from '@/lib/time';
import { APP_URL } from '@/lib/env';
import { getCurrentUser } from '@/lib/auth';
import type { Difficulty, TrainingCategory } from '@/lib/domain/types';

export const metadata: Metadata = {
  title: 'הזמנה למועדון GLoW',
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, { title: string; description: string }> = {
  invalid: {
    title: 'ההזמנה לא נמצאה',
    description: 'הקישור שגוי או שכבר אינו בשימוש. בקשו מבעל המועדון קישור חדש.',
  },
  expired: {
    title: 'תוקף ההזמנה פג',
    description: 'הקישור הזה כבר לא בתוקף. בקשו מבעל המועדון קישור מעודכן.',
  },
  revoked: {
    title: 'ההזמנה בוטלה',
    description: 'בעל המועדון ביטל את הקישור הזה.',
  },
  exhausted: {
    title: 'ההזמנה נוצלה במלואה',
    description: 'מספר השימושים בקישור הזה הסתיים.',
  },
  rate_limited: {
    title: 'יותר מדי בקשות',
    description: 'נסו שוב בעוד דקה.',
  },
};

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const headerList = await headers();
  const clientKey =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerList.get('x-real-ip') ?? 'anon';

  const reference = now();
  const weekStart = gymWeekStart(reference);
  const state = await resolveInvite(
    token,
    weekStart.toISOString(),
    addDays(weekStart, 14).toISOString(),
    clientKey,
  );

  if (state.status !== 'valid') {
    const error = ERRORS[state.status];
    return (
      <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-5 py-10">
        <Logo size="lg" stacked className="justify-center" />
        <EmptyState icon={CalendarOff} title={error.title} description={error.description} />
        <Button variant="secondary" block asChild>
          <Link href="/auth/sign-in">כניסה לחשבון קיים</Link>
        </Button>
      </main>
    );
  }

  const user = await getCurrentUser();
  const byDay = new Map<string, typeof state.classes>();
  for (const gymClass of state.classes) {
    const key = dayKey(gymClass.starts_at);
    byDay.set(key, [...(byDay.get(key) ?? []), gymClass]);
  }
  const days = [...byDay.keys()].sort();
  const inviteUrl = `${APP_URL}/invite/${token}`;

  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="text-center">
        <Logo size="xl" stacked className="justify-center" />
        <p className="mt-3 text-sm text-muted">{state.label}</p>
        <h1 className="mt-1 display text-2xl tracking-tight">
          הוזמנתם ללוח האימונים של {state.organizationName}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          אלה השיעורים הקרובים. כדי להירשם לשיעור צריך להתחבר - לוקח פחות מדקה.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {user ? (
            <Button size="lg" asChild>
              <Link href="/schedule">ללוח השבועי שלי</Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href={`/auth/sign-in?returnTo=${encodeURIComponent('/schedule')}`}>
                <LogIn className="size-4" aria-hidden />
                הצטרפות והרשמה לשיעורים
              </Link>
            </Button>
          )}
        </div>
      </header>

      <section className="mt-8 space-y-5">
        {days.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="אין שיעורים מפורסמים כרגע"
            description="בעל המועדון עדיין לא פרסם את הלוח הקרוב. שווה לבדוק שוב בקרוב."
          />
        ) : (
          days.map((day) => (
            <div key={day}>
              <h2 className="section-label mb-2 block">
                {formatHebrewDate(parseISO(`${day}T12:00:00`))}
              </h2>
              <ul className="space-y-2">
                {(byDay.get(day) ?? []).map((gymClass) => (
                  <li key={gymClass.id} className="surface p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold">{gymClass.title}</h3>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden />
                            <span className="num">
                              {formatTime(gymClass.starts_at)}–{formatTime(gymClass.ends_at)}
                            </span>
                          </span>
                          {gymClass.trainer_name && (
                            <span className="inline-flex items-center gap-1">
                              <User className="size-3.5" aria-hidden />
                              {gymClass.trainer_name}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5" aria-hidden />
                            {gymClass.location}
                          </span>
                        </p>
                      </div>
                      <Badge tone={gymClass.spots_left > 0 ? 'success' : 'danger'}>
                        {gymClass.spots_left > 0 ? `${gymClass.spots_left} מקומות` : 'מלא'}
                      </Badge>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone="outline">
                        {CATEGORY_LABELS[gymClass.category as TrainingCategory] ?? gymClass.category}
                      </Badge>
                      <Badge tone="neutral">
                        {DIFFICULTY_LABELS[gymClass.difficulty as Difficulty] ?? gymClass.difficulty}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Users className="size-3.5" aria-hidden />
                        <span className="num">עד {gymClass.capacity} משתתפים</span>
                      </span>
                    </div>
                    {gymClass.description && (
                      <p className="mt-2 text-xs leading-relaxed text-muted">{gymClass.description}</p>
                    )}
                    <Button variant="secondary" size="sm" className="mt-3" block asChild>
                      <Link
                        href={
                          user
                            ? `/classes/${gymClass.id}`
                            : `/auth/sign-in?returnTo=${encodeURIComponent(`/classes/${gymClass.id}`)}`
                        }
                      >
                        {user ? 'לפרטים והרשמה' : 'התחברות והרשמה לשיעור'}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-2.5 text-sm font-bold">שיתוף ההזמנה</h2>
        <InviteShare url={inviteUrl} organizationName={state.organizationName} />
      </section>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <ShieldCheck className="size-3.5" aria-hidden />
        בדף הזה מוצגים רק פרטי השיעורים. שמות המשתתפים ופרטי הקשר שלהם אינם נחשפים.
      </p>
    </main>
  );
}
