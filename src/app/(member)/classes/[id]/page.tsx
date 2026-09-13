import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertTriangle, Clock, Dumbbell, MapPin, Signal, User, Users } from 'lucide-react';
import { requireUser, getRepository } from '@/lib/auth';
import { BookingButton } from '@/components/classes/booking-button';
import { AvailabilityBadge } from '@/components/classes/availability-badge';
import { ShareActions } from '@/components/share/share-actions';
import { WorkoutDetail, WorkoutLocked } from '@/components/workout/workout-detail';
import { LogResultForm } from '@/components/workout/log-result-form';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { availabilityForClass } from '@/lib/domain/booking-rules';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from '@/lib/labels';
import { dayKey, formatDuration, formatHebrewDate, formatTime, minutesUntil, now } from '@/lib/time';
import { APP_URL } from '@/lib/env';
import type { Equipment } from '@/lib/domain/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const repository = await getRepository();
  const gymClass = await repository.getClass(id, null);
  return { title: gymClass?.title ?? 'שיעור' };
}

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/classes/${id}`);
  const repository = await getRepository();

  const [gymClass, organization, reveal] = await Promise.all([
    repository.getClass(id, user.profile.id),
    repository.getOrganization(),
    repository.getClassWorkout(id, user.profile.id),
  ]);
  if (!gymClass || (!gymClass.published && user.membership.role === 'member')) notFound();

  // The result form belongs at the end of the session, not before it. A member
  // who booked can see the plan from the moment they book; they can only file a
  // score once the class has actually started.
  const started = new Date(gymClass.starts_at).getTime() <= Date.now();
  const canLog =
    started &&
    reveal.state === 'revealed' &&
    (gymClass.my_booking?.status === 'confirmed' || gymClass.my_booking?.status === 'attended');

  const [existingLog, history] =
    canLog && reveal.state === 'revealed'
      ? await Promise.all([
          repository.getWorkoutLog(user.profile.id, reveal.workout.id, dayKey(now())),
          repository.listWorkoutHistory(user.profile.id, reveal.workout.id),
        ])
      : [null, []];

  const availability = availabilityForClass(gymClass);
  const durationMinutes = Math.round(
    (new Date(gymClass.ends_at).getTime() - new Date(gymClass.starts_at).getTime()) / 60000,
  );
  const untilStart = minutesUntil(gymClass.starts_at);
  const bookingClosesIn = untilStart - organization.booking_cutoff_minutes;
  const cancelClosesIn = untilStart - organization.cancel_cutoff_minutes;
  const shareUrl = `${APP_URL}/classes/${gymClass.id}`;

  return (
    <div className="space-y-4">
      <PageHeader title={gymClass.title} backHref="/schedule" />

      <section className="surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{formatHebrewDate(gymClass.starts_at)}</p>
            <p className="num mt-0.5 display text-2xl tracking-tight text-accent-ink">
              {formatTime(gymClass.starts_at)}–{formatTime(gymClass.ends_at)}
            </p>
          </div>
          <AvailabilityBadge availability={availability} spotsLeft={gymClass.spots_left} />
        </div>

        {gymClass.status === 'cancelled' && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-danger"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            השיעור בוטל על ידי המאמן. אם הייתם רשומים, הרישום בוטל אוטומטית.
          </p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Detail icon={Clock} label="משך" value={formatDuration(durationMinutes)} />
          <Detail icon={User} label="מאמן" value={gymClass.trainer_name ?? 'טרם שובץ'} />
          <Detail icon={MapPin} label="מיקום" value={gymClass.location} />
          <Detail icon={Signal} label="רמה" value={DIFFICULTY_LABELS[gymClass.difficulty]} />
          <Detail
            icon={Users}
            label="תפוסה"
            value={`${gymClass.confirmed_count} מתוך ${gymClass.capacity}`}
          />
          <Detail
            icon={Dumbbell}
            label="סוג אימון"
            value={CATEGORY_LABELS[gymClass.category]}
          />
        </dl>

        <div className="mt-4">
          <BookingButton
            classId={gymClass.id}
            availability={availability}
            waitlistPosition={gymClass.my_booking?.waitlist_position}
            size="lg"
          />
        </div>
      </section>

      {reveal.state === 'locked' && (
        <WorkoutLocked
          category={reveal.category}
          format={reveal.format}
          durationMinutes={reveal.duration_minutes}
          difficulty={reveal.difficulty}
        />
      )}

      {reveal.state === 'revealed' && (
        <WorkoutDetail workout={reveal.workout} coachNotes={reveal.notes} />
      )}

      {canLog && reveal.state === 'revealed' && (
        <LogResultForm
          workout={reveal.workout}
          classId={gymClass.id}
          existing={existingLog}
          history={history}
        />
      )}

      {gymClass.description && (
        <section className="surface p-4">
          <h2 className="mb-1.5 text-sm font-bold">על השיעור</h2>
          <p className="text-sm leading-relaxed text-muted">{gymClass.description}</p>
        </section>
      )}

      <section className="surface p-4">
        <h2 className="section-label mb-2 block">ציוד נדרש</h2>
        {gymClass.equipment.length === 0 ? (
          <p className="text-sm text-muted">לא נדרש ציוד מיוחד. הכל מחכה באולם.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {gymClass.equipment.map((item) => (
              <li key={item}>
                <Badge tone="outline">{EQUIPMENT_LABELS[item as Equipment] ?? item}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="surface p-4">
        <h2 className="section-label mb-2 block">כללי רישום וביטול</h2>
        <ul className="space-y-1.5 text-sm text-muted">
          <li>
            ההרשמה נסגרת {formatDuration(organization.booking_cutoff_minutes)} לפני תחילת השיעור
            {untilStart > 0 && bookingClosesIn > 0 && (
              <span className="text-ink"> · נותרו {formatDuration(bookingClosesIn)}</span>
            )}
            .
          </li>
          <li>
            ביטול אפשרי עד {formatDuration(organization.cancel_cutoff_minutes)} לפני תחילת השיעור
            {untilStart > 0 && cancelClosesIn > 0 && (
              <span className="text-ink"> · נותרו {formatDuration(cancelClosesIn)}</span>
            )}
            .
          </li>
          <li>
            כשהשיעור מלא נפתחת רשימת המתנה. כשמתפנה מקום, המתאמן הראשון בתור מקודם אוטומטית ומקבל
            התראה.
          </li>
          {gymClass.waitlist_count > 0 && (
            <li className="text-ink">
              כרגע יש <span className="num">{gymClass.waitlist_count}</span> מתאמנים ברשימת ההמתנה.
            </li>
          )}
        </ul>
      </section>

      <section className="surface p-4">
        <h2 className="mb-2.5 text-sm font-bold">שיתוף והוספה ליומן</h2>
        <ShareActions
          url={shareUrl}
          title={`GLoW · ${gymClass.title}`}
          text={`${gymClass.title} · ${formatHebrewDate(gymClass.starts_at)} בשעה ${formatTime(gymClass.starts_at)}`}
          icsHref={`/api/classes/${gymClass.id}/ics`}
        />
      </section>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-line bg-raised p-2.5">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold text-muted">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-bold">{value}</dd>
    </div>
  );
}
