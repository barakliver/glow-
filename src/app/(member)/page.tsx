import Link from 'next/link';
import { CalendarDays, CalendarPlus, Dumbbell, Flame, Sparkles, Timer, TrendingUp } from 'lucide-react';
import { requireUser, getRepository } from '@/lib/auth';
import { ReadinessCheck } from '@/components/readiness/readiness-check';
import { ClassCard } from '@/components/classes/class-card';
import { BookingButton } from '@/components/classes/booking-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { buildRecommendations, buildScore } from '@/lib/data/insights';
import { RipenessCard } from '@/components/score/ripeness-card';
import { availabilityForClass } from '@/lib/domain/booking-rules';
import { GOAL_LABELS } from '@/lib/labels';
import {
  addDays,
  dayKey,
  formatDuration,
  formatHebrewDate,
  formatTime,
  gymWeekStart,
  now,
  relativeHebrew,
} from '@/lib/time';

function greeting(date: Date): string {
  const hour = Number(
    date.toLocaleString('he-IL', { hour: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' }),
  );
  if (hour < 5) return 'לילה טוב';
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
}

export default async function HomePage() {
  const user = await requireUser('/');
  const repository = await getRepository();
  const reference = now();

  const weekStart = gymWeekStart(reference);
  const weekEnd = addDays(weekStart, 7);

  const [bookings, readiness, sessions, upcomingClasses, { recommendations }, score] =
    await Promise.all([
    repository.listMyBookings(user.profile.id),
    repository.getReadiness(user.profile.id, dayKey(reference)),
    repository.listSessions(user.profile.id, 20),
    repository.listClasses({
      fromIso: reference.toISOString(),
      toIso: addDays(reference, 7).toISOString(),
      profileId: user.profile.id,
    }),
    buildRecommendations(repository, user.profile.id, { limit: 1 }),
    buildScore(repository, user.profile.id),
  ]);

  const upcomingBookings = bookings
    .filter(
      (row) =>
        (row.booking.status === 'confirmed' || row.booking.status === 'waitlisted') &&
        row.gymClass.status === 'scheduled' &&
        new Date(row.gymClass.starts_at).getTime() > reference.getTime(),
    )
    .sort(
      (a, b) => new Date(a.gymClass.starts_at).getTime() - new Date(b.gymClass.starts_at).getTime(),
    );
  const nextBooking = upcomingBookings[0] ?? null;
  const nextClass = nextBooking
    ? (upcomingClasses.find((c) => c.id === nextBooking.gymClass.id) ?? null)
    : null;

  // Weekly activity summary
  const weekStartMs = weekStart.getTime();
  const weekEndMs = weekEnd.getTime();
  const weekSessions = sessions.filter(
    (s) =>
      s.status === 'completed' &&
      s.completed_at &&
      new Date(s.completed_at).getTime() >= weekStartMs &&
      new Date(s.completed_at).getTime() < weekEndMs,
  );
  const weekClasses = bookings.filter(
    (row) =>
      row.booking.status === 'attended' &&
      new Date(row.gymClass.starts_at).getTime() >= weekStartMs &&
      new Date(row.gymClass.starts_at).getTime() < weekEndMs,
  );
  const weekMinutes =
    weekSessions.reduce((sum, s) => sum + (s.total_seconds ?? 0), 0) / 60 +
    weekClasses.reduce(
      (sum, row) =>
        sum +
        (new Date(row.gymClass.ends_at).getTime() - new Date(row.gymClass.starts_at).getTime()) /
          60000,
      0,
    );

  const recommendation = recommendations[0] ?? null;
  const firstName = user.profile.full_name.split(' ')[0];

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-muted">{greeting(reference)},</p>
        <h1 className="text-2xl font-extrabold tracking-tight">{firstName}</h1>
      </header>

      {/* Next booked class */}
      <section aria-labelledby="next-class-title">
        <h2 id="next-class-title" className="mb-2 text-sm font-bold">
          השיעור הבא שלך
        </h2>
        {nextClass ? (
          <div className="rounded-lg border border-accent/45 bg-surface p-4 shadow-glow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-accent">
                  {relativeHebrew(nextClass.starts_at, reference)}
                </p>
                <h3 className="mt-0.5 truncate text-lg font-extrabold">{nextClass.title}</h3>
                <p className="mt-1 text-xs text-muted">
                  {formatHebrewDate(nextClass.starts_at)} ·{' '}
                  <span className="num">{formatTime(nextClass.starts_at)}</span>
                  {nextClass.trainer_name && ` · ${nextClass.trainer_name}`} · {nextClass.location}
                </p>
              </div>
              {nextBooking?.booking.status === 'waitlisted' ? (
                <Badge tone="warning">המתנה {nextBooking.booking.waitlist_position}</Badge>
              ) : (
                <Badge tone="accent">רשום</Badge>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <BookingButton
                classId={nextClass.id}
                availability={availabilityForClass(nextClass)}
                waitlistPosition={nextClass.my_booking?.waitlist_position}
                size="sm"
                block={false}
              />
              <Button variant="secondary" size="sm" asChild>
                <a href={`/api/classes/${nextClass.id}/ics`}>
                  <CalendarPlus className="size-4" aria-hidden />
                  ליומן
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="אין לך שיעור קרוב"
            description="הלוח השבועי מחכה. בחרו שיעור שמתאים לכם ונשמור לכם מקום."
            action={
              <Button size="sm" asChild>
                <Link href="/schedule">לצפייה בלוח השבועי</Link>
              </Button>
            }
          />
        )}
      </section>

      {/* Weekly summary */}
      <section aria-labelledby="week-summary-title" className="surface p-4">
        <h2 id="week-summary-title" className="mb-3 text-sm font-bold">
          הפעילות שלך השבוע
        </h2>
        <dl className="grid grid-cols-3 gap-2">
          <Stat label="אימונים" value={weekSessions.length} icon={Dumbbell} />
          <Stat label="שיעורים" value={weekClasses.length} icon={CalendarDays} />
          <Stat label="דקות" value={Math.round(weekMinutes)} icon={Flame} />
        </dl>
        <Link
          href="/progress"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
        >
          <TrendingUp className="size-3.5" aria-hidden />
          לצפייה בהתקדמות המלאה
        </Link>
      </section>

      <RipenessCard score={score} />

      <ReadinessCheck existing={readiness} />

      {/* Recommendation */}
      {recommendation && (
        <section aria-labelledby="recommendation-title" className="surface p-4">
          <h2 id="recommendation-title" className="flex items-center gap-1.5 text-sm font-bold">
            <Sparkles className="size-4 text-accent" aria-hidden />
            מומלץ עבורך היום
          </h2>
          <div className="mt-3 rounded-md border border-line bg-raised p-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold">{recommendation.template.title}</h3>
              <Badge tone="outline">{GOAL_LABELS[recommendation.template.goal]}</Badge>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{recommendation.reason}</p>
            <p className="num mt-2 text-xs font-semibold text-muted">
              {formatDuration(recommendation.template.duration_minutes)}
            </p>
            <Button size="sm" className="mt-3" asChild block>
              <Link href={`/workout?template=${recommendation.template.id}`}>
                <Dumbbell className="size-4" aria-hidden />
                התחלת האימון
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="mb-2 text-sm font-bold">
          פעולות מהירות
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <QuickAction href="/schedule" icon={CalendarDays} label="לוח שבועי" />
          <QuickAction href="/workout" icon={Dumbbell} label="התחלת אימון" />
          <QuickAction href="/timer" icon={Timer} label="טיימר טבאטה" />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-md border border-line bg-raised p-3 text-center">
      <Icon className="mx-auto size-4 text-muted" aria-hidden />
      <dd className="stat-value mt-1 block">{value}</dd>
      <dt className="label-muted block">{label}</dt>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-md border border-line bg-surface p-3 text-center text-xs font-bold transition-all hover:border-accent/45 hover:shadow-glow-soft"
    >
      <Icon className="size-5 text-accent" aria-hidden />
      {label}
    </Link>
  );
}
