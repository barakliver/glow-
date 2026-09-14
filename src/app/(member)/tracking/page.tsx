import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, Gauge, Plus, Route, Timer, TrendingUp, Trophy } from 'lucide-react';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { AccessibleChart } from '@/components/charts/accessible-chart';
import { TrendLineChart } from '@/components/charts/progress-charts';
import { BodyMetricForm } from './body-metric-form';
import { ACTIVITY_KIND_LABELS } from '@/lib/labels';
import { formatShortDate } from '@/lib/time';
import { formatSeconds } from '@/lib/domain/workout-score';
import { num } from '@/lib/utils';

export const metadata: Metadata = { title: 'המעקב שלי' };

/** mm:ss per kilometre, the unit a runner actually thinks in. */
function pace(distanceMeters: number, seconds: number): string {
  if (distanceMeters <= 0 || seconds <= 0) return '—';
  return `${formatSeconds(Math.round(seconds / (distanceMeters / 1000)))} לק״מ`;
}

export default async function TrackingPage() {
  const user = await requireUser('/tracking');
  const repository = await getRepository();

  const [metrics, latest, activities, records] = await Promise.all([
    repository.listBodyMetrics(user.profile.id, 60),
    repository.latestBodyMetric(user.profile.id),
    repository.listActivities(user.profile.id, 30),
    repository.listLiftRecords(user.profile.id),
  ]);

  const weighIns = metrics
    .filter((row) => row.weight_kg !== null)
    .slice()
    .reverse()
    .map((row) => ({ label: formatShortDate(row.measured_on), value: Number(row.weight_kg) }));

  return (
    <div className="space-y-9">
      <PageHeader
        title="המעקב שלי"
        subtitle="הכול במקום אחד, ורק שלך"
        action={
          <Button size="sm" asChild>
            <Link href="/tracking/new">
              <Plus className="size-4" aria-hidden />
              רישום
            </Link>
          </Button>
        }
      />

      <BodyMetricForm latest={latest} />

      {weighIns.length >= 2 && (
        <section className="surface p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="size-4 text-accent-ink" aria-hidden />
            המשקל לאורך זמן
          </h2>
          <div className="mt-4">
            <AccessibleChart
              title="משקל לפי תאריך"
              summary={`${weighIns.length} מדידות, מ-${weighIns[0].label} עד ${weighIns[weighIns.length - 1].label}`}
              table={{
                caption: 'משקל לפי תאריך',
                head: ['תאריך', 'משקל בק״ג'],
                rows: weighIns.map((row) => [row.label, row.value]),
              }}
            >
              <TrendLineChart data={weighIns} fitToData />
            </AccessibleChart>
          </div>
        </section>
      )}

      <section aria-labelledby="records-title">
        <h2 id="records-title" className="section-label mb-3 block">
          השיאים שלך
        </h2>
        {records.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="עוד אין שיאים"
            description="כל משקל שתרשמו ברישום אימון נכנס לכאן אוטומטית."
          />
        ) : (
          <ul className="space-y-2.5">
            {records.map((record) => (
              <li
                key={record.exercise_name}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{record.exercise_name}</p>
                  <p className="num mt-1 text-xs text-muted">
                    {formatShortDate(record.performed_on)} · {num(record.sessions)} אימונים
                  </p>
                </div>
                <p className="num display shrink-0 text-xl leading-none text-accent-ink">
                  {record.weight_kg} ק״ג
                  {record.reps ? <span className="text-muted"> × {record.reps}</span> : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="activities-title">
        <h2 id="activities-title" className="section-label mb-3 block">
          מה עשית לאחרונה
        </h2>
        {activities.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="עוד לא רשמת כלום"
            description="כל אימון, ריצה או מתיחה - רשמו אותם איך שבא לכם."
            action={
              <Button size="sm" asChild>
                <Link href="/tracking/new">רישום ראשון</Link>
              </Button>
            }
          />
        ) : (
          <ul className="space-y-3">
            {activities.map(({ activity, lifts }) => (
              <li key={activity.id} className="surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{activity.title}</h3>
                    <p className="num mt-1 text-xs text-muted">
                      {formatShortDate(activity.performed_on)}
                    </p>
                  </div>
                  <Badge tone="outline">{ACTIVITY_KIND_LABELS[activity.kind]}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                  {activity.duration_seconds !== null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Timer className="size-3.5" aria-hidden />
                      <span className="num">{formatSeconds(activity.duration_seconds)}</span>
                    </span>
                  )}
                  {activity.distance_meters !== null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Route className="size-3.5" aria-hidden />
                      <span className="num">
                        {(activity.distance_meters / 1000).toFixed(1)} ק״מ
                      </span>
                      {activity.duration_seconds ? (
                        <span className="num">
                          · {pace(activity.distance_meters, activity.duration_seconds)}
                        </span>
                      ) : null}
                    </span>
                  )}
                  {activity.incline_percent !== null && activity.incline_percent > 0 && (
                    <span className="num">שיפוע {activity.incline_percent}%</span>
                  )}
                  {activity.rpe !== null && (
                    <span className="inline-flex items-center gap-1.5">
                      <Gauge className="size-3.5" aria-hidden />
                      <span className="num">RPE {activity.rpe}</span>
                    </span>
                  )}
                </div>

                {lifts.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                    {lifts.map((lift) => (
                      <li key={lift.id} className="flex justify-between gap-3 text-xs">
                        <span className="truncate font-medium">{lift.exercise_name}</span>
                        <span className="num shrink-0 text-muted">
                          {lift.sets} × {lift.reps ?? '—'}
                          {lift.weight_kg !== null && ` · ${lift.weight_kg} ק״ג`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {activity.notes && (
                  <p className="mt-3 whitespace-pre-line border-t border-line pt-3 text-xs leading-relaxed text-muted">
                    {activity.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
