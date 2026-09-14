import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Download,
  Link2,
  Percent,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { requireStaff, getRepository } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AccessibleChart } from '@/components/charts/accessible-chart';
import { VolumeBarChart } from '@/components/charts/progress-charts';
import { ROLE_LABELS } from '@/lib/labels';
import { addDays, gymWeekStart, now } from '@/lib/time';
import { num } from '@/lib/utils';

export const metadata: Metadata = { title: 'סקירת ניהול' };

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const user = await requireStaff();
  const repository = await getRepository();

  const days = Number.parseInt(params.range ?? '30', 10) || 30;
  const reference = now();
  const from = addDays(reference, -days);
  const to = addDays(reference, 14);

  const [stats, members, invites] = await Promise.all([
    repository.getAdminStats(from.toISOString(), to.toISOString()),
    repository.listMembers(),
    repository.listInvites().catch(() => []),
  ]);

  const weekStart = gymWeekStart(reference);
  const upcoming = await repository.listClasses({
    fromIso: weekStart.toISOString(),
    toIso: addDays(weekStart, 7).toISOString(),
    profileId: null,
    includeUnpublished: true,
  });

  const activeInvites = invites.filter(
    (invite) =>
      !invite.revoked &&
      (!invite.expires_at || new Date(invite.expires_at).getTime() > reference.getTime()),
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl tracking-tight">סקירת המועדון</h1>
          <p className="text-sm text-muted">נתוני {days} הימים האחרונים והשבועיים הקרובים</p>
          {/*
            Which buttons this area shows depends entirely on this one word, so
            it is written down rather than left to be inferred from what is
            missing.
          */}
          <p className="mt-1 text-xs text-muted">
            מחובר כ<span className="font-semibold text-accent-ink">{ROLE_LABELS[user.membership.role]}</span>
            {user.membership.role !== 'owner' && ' · יצירת שיעורים שמורה למנהל'}
          </p>
        </div>
        <nav aria-label="טווח" className="flex gap-1.5">
          {[7, 30, 90].map((value) => (
            <Link
              key={value}
              href={`/admin?range=${value}`}
              aria-current={days === value ? 'page' : undefined}
              className={`num rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                days === value
                  ? 'border-accent bg-accent/12 text-accent-ink'
                  : 'border-line bg-surface text-muted hover:text-ink'
              }`}
            >
              {value} ימים
            </Link>
          ))}
        </nav>
      </div>

      <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4" aria-label="מדדים ראשיים">
        <Metric icon={Percent} label="תפוסה" value={`${stats.occupancyRate}%`} />
        <Metric icon={UserCheck} label="אחוז הגעה" value={`${stats.attendanceRate}%`} />
        <Metric icon={Clock} label="ברשימת המתנה" value={num(stats.waitlistDemand)} />
        <Metric icon={CalendarDays} label="שיעורים" value={num(stats.totalClasses)} />
        <Metric icon={TrendingUp} label="רישומים" value={num(stats.totalBookings)} />
        <Metric icon={Users} label="מתאמנים" value={num(members.length)} />
        <Metric icon={Link2} label="הזמנות פעילות" value={num(activeInvites.length)} />
        <Metric icon={CalendarDays} label="שיעורי השבוע" value={num(upcoming.length)} />
      </section>

      {stats.weeklyTrend.length > 0 ? (
        <AccessibleChart
          title="רישומים לפי יום"
          summary={`בטווח הנבחר נרשמו ${num(stats.totalBookings)} רישומים מתוך ${num(
            stats.weeklyTrend.reduce((sum, d) => sum + d.capacity, 0),
          )} מקומות אפשריים, כלומר תפוסה של ${stats.occupancyRate} אחוז.`}
          table={{
            caption: 'רישומים ותפוסה לפי יום',
            head: ['יום', 'רישומים', 'קיבולת'],
            rows: stats.weeklyTrend.map((d) => [d.label, d.bookings, d.capacity]),
          }}
        >
          <VolumeBarChart
            data={stats.weeklyTrend.map((d) => ({ label: d.label, value: d.bookings }))}
          />
        </AccessibleChart>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="אין עדיין נתונים בטווח הזה"
          description="אחרי שייפתחו שיעורים ויתקבלו רישומים יופיעו כאן מדדי תפוסה ונוכחות."
          action={
            <Button size="sm" asChild>
              <Link href="/admin/schedule">ניהול הלוח השבועי</Link>
            </Button>
          }
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="surface p-4">
          <h2 className="section-label mb-3 block">השעות המבוקשות</h2>
          {stats.popularTimes.length === 0 ? (
            <p className="text-sm text-muted">אין עדיין מספיק נתונים.</p>
          ) : (
            <ul className="space-y-2">
              {stats.popularTimes.map((entry) => (
                <li key={entry.time} className="flex items-center justify-between gap-2">
                  <span className="num text-sm font-semibold">{entry.time}</span>
                  <span className="num text-xs text-muted">{entry.bookings} רישומים</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface p-4">
          <h2 className="section-label mb-3 block">השיעורים הפופולריים</h2>
          {stats.popularClasses.length === 0 ? (
            <p className="text-sm text-muted">אין עדיין מספיק נתונים.</p>
          ) : (
            <ul className="space-y-2">
              {stats.popularClasses.map((entry) => (
                <li key={entry.title} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{entry.title}</span>
                  <span className="num shrink-0 text-xs text-muted">{entry.bookings} רישומים</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="surface p-4">
        <h2 className="mb-1 text-sm font-semibold">ייצוא נתונים</h2>
        <p className="mb-3 text-xs text-muted">קובצי CSV בקידוד UTF-8, מוכנים לפתיחה באקסל.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { type: 'classes', label: 'שיעורים' },
            { type: 'bookings', label: 'רישומים' },
            { type: 'attendance', label: 'נוכחות' },
            { type: 'workouts', label: 'סיכומי אימונים' },
          ].map((item) => (
            <Button key={item.type} variant="secondary" asChild block>
              <a href={`/api/admin/export?type=${item.type}&days=${days}`}>
                <Download className="size-4" aria-hidden />
                {item.label}
              </a>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="surface p-3.5">
      <Icon className="size-4 text-muted" aria-hidden />
      <p className="stat-value mt-1.5">{value}</p>
      <p className="label-muted">{label}</p>
    </div>
  );
}
