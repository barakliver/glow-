import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  Library,
  LineChart,
  CalendarCheck,
  ChevronLeft,
  ClipboardList,
  Info,
  LogOut,
  Shield,
  Timer,
  User,
} from 'lucide-react';
import { requireUser, isStaff } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { SignOutButton } from './sign-out-button';
import { InstallApp } from '@/components/pwa/install-app';
import { ROLE_LABELS } from '@/lib/labels';
import { isDemoMode } from '@/lib/env';

export const metadata: Metadata = { title: 'עוד' };

const LINKS = [
  { href: '/more/profile', label: 'הפרטים שלי', icon: User, description: 'שם, טלפון ורמת ניסיון' },
  { href: '/bookings', label: 'ההזמנות שלי', icon: CalendarCheck, description: 'רישומים, היסטוריה ונוכחות' },
  { href: '/notifications', label: 'התראות', icon: Bell, description: 'מרכז ההתראות שלך' },
  {
    href: '/more/notifications',
    label: 'העדפות התראות',
    icon: Bell,
    description: 'איזה עדכונים לקבל',
  },
  { href: '/tracking', label: 'המעקב שלי', icon: LineChart, description: 'גובה, משקל, שיאים ורישום אימונים' },
  {
    href: '/coach',
    label: 'המאמן',
    icon: ClipboardList,
    description: 'תוכנית 12 שבועות, שבירת תקרה ונקודות תורפה',
  },
  { href: '/workout/wods', label: 'מאגר האימונים', icon: Library, description: 'קרוספיט, פונקציונלי, פילאטיס ויוגה' },
  { href: '/workout/library', label: 'ספריית תרגילים', icon: BookOpen, description: 'הוראות ודגשי בטיחות' },
  { href: '/timer', label: 'טיימר אינטרוולים', icon: Timer, description: 'טבאטה, EMOM ותבניות' },
];

export default async function MorePage() {
  const user = await requireUser('/more');
  const staff = isStaff(user);

  return (
    <div className="space-y-4">
      <PageHeader title="עוד" />

      <section className="surface flex items-center gap-3 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/12 text-lg font-semibold text-accent-ink">
          {user.profile.full_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{user.profile.full_name}</p>
          <p className="num truncate text-xs text-muted" dir="ltr">
            {user.profile.email}
          </p>
        </div>
        <Badge tone={user.membership.role === 'owner' ? 'accent' : staff ? 'warning' : 'neutral'}>
          {ROLE_LABELS[user.membership.role]}
        </Badge>
      </section>

      {staff && (
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg border border-accent/45 bg-surface p-4 shadow-glow-soft transition-colors hover:bg-raised"
        >
          <Shield className="size-5 text-accent-ink" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">אזור ניהול</p>
            <p className="text-xs text-muted">לוח שבועי, מתאמנים, תבניות והזמנות</p>
          </div>
          <ChevronLeft className="size-4 text-muted" aria-hidden />
        </Link>
      )}

      <nav aria-label="הגדרות וקישורים">
        <ul className="space-y-2">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-accent/30 hover:bg-raised"
                >
                  <Icon className="size-5 shrink-0 text-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{link.label}</p>
                    <p className="truncate text-xs text-muted">{link.description}</p>
                  </div>
                  <ChevronLeft className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="space-y-2" aria-labelledby="install-title">
        <h2 id="install-title" className="section-label">
          האפליקציה במכשיר שלך
        </h2>
        <p className="text-xs text-muted">
          אפשר להתקין את GLoW כאפליקציה עצמאית. הטיימר והאימון הפעיל ימשיכו לעבוד גם בלי חיבור
          לאינטרנט.
        </p>
        <InstallApp />
      </section>

      <SignOutButton />

      <footer className="space-y-2 pb-4 pt-2 text-center">
        <Logo size="sm" className="justify-center opacity-70" />
        <p className="text-[11px] text-muted">מועדון אימונים פרטי · גרסה 1.0</p>
        {isDemoMode() && (
          <p className="mx-auto flex max-w-xs items-center justify-center gap-1.5 rounded-md border border-warning/30 bg-warning/8 px-3 py-2 text-[11px] text-warning">
            <Info className="size-3.5 shrink-0" aria-hidden />
            מצב הדגמה: הנתונים נשמרים בזיכרון השרת בלבד.
          </p>
        )}
      </footer>
    </div>
  );
}
