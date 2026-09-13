'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, CalendarCheck, Dumbbell, Gauge, NotebookPen, Timer, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AccessibleChart } from '@/components/charts/accessible-chart';
import {
  BalanceRadarChart,
  TrendLineChart,
  VolumeBarChart,
} from '@/components/charts/progress-charts';
import { PR_LABELS, type PersonalRecord } from '@/lib/domain/progress';
import { formatHebrewFullDate } from '@/lib/time';
import { cn, num } from '@/lib/utils';
import { RipenessDetail } from '@/components/score/ripeness-detail';
import type { ScoreSummary } from '@/lib/domain/score';
import type { RangeKey } from './page';

const RANGE_LABELS: Record<RangeKey, string> = {
  week: 'שבוע',
  month: 'חודש',
  quarter: '3 חודשים',
};

interface Props {
  score: ScoreSummary;
  range: RangeKey;
  stats: {
    workouts: number;
    classes: number;
    minutes: number;
    volume: number;
    averageEffort: number | null;
    consistency: number;
  };
  weeks: { key: string; label: string; workouts: number; minutes: number; volume: number }[];
  balance: { label: string; value: number }[];
  records: (PersonalRecord & { exerciseName: string })[];
  notes: { id: string; title: string; date: string; note: string; effort: number | null }[];
  exerciseHistory: { id: string; name: string; points: { label: string; value: number }[] }[];
}

export function ProgressView({
  score,
  range,
  stats,
  weeks,
  balance,
  records,
  notes,
  exerciseHistory,
}: Props) {
  const [selectedExercise, setSelectedExercise] = useState(exerciseHistory[0]?.id ?? '');
  const exercise = exerciseHistory.find((e) => e.id === selectedExercise) ?? null;

  const totalWorkoutsInWeeks = weeks.reduce((sum, w) => sum + w.workouts, 0);
  const bestWeek = weeks.reduce(
    (best, week) => (week.workouts > best.workouts ? week : best),
    weeks[0] ?? { label: '-', workouts: 0, minutes: 0, volume: 0, key: '' },
  );
  const topMovement = balance[0];

  return (
    <div className="space-y-4">
      <PageHeader title="ההתקדמות שלך" subtitle="ביצועים, עקביות והתאוששות" backHref="/" />

      <RipenessDetail score={score} />

      <nav aria-label="טווח זמן" className="flex gap-1.5">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
          <Link
            key={key}
            href={`/progress?range=${key}`}
            aria-current={range === key ? 'page' : undefined}
            className={cn(
              'flex-1 rounded-md border px-3 py-2.5 text-center text-sm font-bold transition-all',
              range === key
                ? 'border-accent bg-accent/12 text-accent-ink shadow-glow-soft'
                : 'border-line bg-surface text-muted hover:text-ink',
            )}
          >
            {RANGE_LABELS[key]}
          </Link>
        ))}
      </nav>

      <section className="grid grid-cols-2 gap-2" aria-label="סיכום מספרי">
        <StatCard icon={Dumbbell} label="אימונים שהושלמו" value={num(stats.workouts)} />
        <StatCard icon={CalendarCheck} label="שיעורים שהשתתפת" value={num(stats.classes)} />
        <StatCard icon={Timer} label="דקות אימון" value={num(stats.minutes)} />
        <StatCard icon={TrendingUp} label='נפח אימון (ק"ג)' value={num(stats.volume)} />
        <StatCard
          icon={Gauge}
          label="מאמץ ממוצע"
          value={stats.averageEffort !== null ? `${stats.averageEffort}/10` : '—'}
        />
        <StatCard icon={Award} label="שיאים אישיים" value={num(records.length)} />
      </section>

      <section className="surface p-4" aria-labelledby="consistency-title">
        <div className="flex items-center justify-between">
          <h2 id="consistency-title" className="section-label">
            עקביות
          </h2>
          <span className="num text-sm font-extrabold text-accent-ink">{stats.consistency}%</span>
        </div>
        <Progress
          value={stats.consistency}
          className="mt-2"
          tone={stats.consistency >= 70 ? 'success' : stats.consistency >= 40 ? 'accent' : 'warning'}
          label="אחוז השבועות עם לפחות אימון אחד"
        />
        <p className="mt-2 text-xs text-muted">
          התאמנת לפחות פעם אחת ב־{Math.round((stats.consistency / 100) * weeks.length)} מתוך{' '}
          {weeks.length} השבועות האחרונים.
        </p>
      </section>

      {totalWorkoutsInWeeks === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="עוד אין נתוני אימון בטווח הזה"
          description="אחרי האימון הראשון תראו כאן גרפים של נפח, עקביות ואיזון תנועה."
        />
      ) : (
        <>
          <AccessibleChart
            title="אימונים לפי שבוע"
            summary={`בסך הכול ${totalWorkoutsInWeeks} אימונים ב־${weeks.length} שבועות. השבוע החזק ביותר היה ${bestWeek.label} עם ${bestWeek.workouts} אימונים.`}
            table={{
              caption: 'אימונים לפי שבוע',
              head: ['שבוע', 'אימונים', 'דקות'],
              rows: weeks.map((w) => [w.label, w.workouts, w.minutes]),
            }}
          >
            <VolumeBarChart data={weeks.map((w) => ({ label: w.label, value: w.workouts }))} />
          </AccessibleChart>

          <AccessibleChart
            title="נפח אימון לפי שבוע"
            summary={`הנפח מחושב כמכפלה של חזרות במשקל. בטווח הנוכחי הצטברו ${num(stats.volume)} ק"ג.`}
            table={{
              caption: 'נפח אימון לפי שבוע',
              head: ['שבוע', 'נפח (ק"ג)'],
              rows: weeks.map((w) => [w.label, w.volume]),
            }}
          >
            <TrendLineChart data={weeks.map((w) => ({ label: w.label, value: w.volume }))} />
          </AccessibleChart>

          {balance.length > 0 && (
            <AccessibleChart
              title="איזון דפוסי תנועה"
              summary={
                topMovement
                  ? `דפוס התנועה הדומיננטי שלך הוא ${topMovement.label}. איזון טוב אומר עבודה על כמה דפוסים ולא רק על אחד.`
                  : 'אין עדיין מספיק נתונים.'
              }
              table={{
                caption: 'סטים לפי דפוס תנועה',
                head: ['דפוס', 'סטים'],
                rows: balance.map((b) => [b.label, b.value]),
              }}
            >
              <BalanceRadarChart data={balance} />
            </AccessibleChart>
          )}
        </>
      )}

      {exerciseHistory.length > 0 && (
        <section className="surface p-4" aria-labelledby="exercise-compare-title">
          <h2 id="exercise-compare-title" className="section-label">
            השוואה לתוצאות הקודמות שלך
          </h2>
          <p className="mt-1 text-xs text-muted">
            ההשוואה תמיד מול עצמך בלבד. אין כאן דירוג בין מתאמנים.
          </p>
          <div className="mt-3">
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger aria-label="בחירת תרגיל להשוואה">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exerciseHistory.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {exercise && (
            <div className="mt-3">
              <TrendLineChart data={exercise.points} />
              <p className="mt-2 text-xs text-muted">
                {exercise.name}: מהתוצאה הטובה ביותר של{' '}
                <span className="num font-bold text-ink">{exercise.points[0]?.value}</span> ועד{' '}
                <span className="num font-bold text-ink">
                  {exercise.points[exercise.points.length - 1]?.value}
                </span>{' '}
                באימון האחרון.
              </p>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="records-title" className="space-y-2">
        <h2 id="records-title" className="section-label">
          שיאים אישיים
        </h2>
        {records.length === 0 ? (
          <EmptyState icon={Award} title="עוד אין שיאים" description="כל סט שתרשמו יכול להפוך לשיא." />
        ) : (
          <ul className="space-y-1.5">
            {records.map((record) => (
              <li
                key={`${record.exercise_id}-${record.kind}`}
                className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{record.exerciseName}</p>
                  <p className="text-[11px] text-muted">
                    {formatHebrewFullDate(record.achieved_at)}
                  </p>
                </div>
                <Badge tone="accent">
                  {PR_LABELS[record.kind]} <span className="num">{record.value}</span>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="notes-title" className="space-y-2">
        <h2 id="notes-title" className="section-label">
          הערות מאימונים קודמים
        </h2>
        {notes.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title="אין עדיין הערות"
            description="בסיום אימון אפשר לכתוב לעצמכם מה לשנות בפעם הבאה."
          />
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id} className="surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-bold">{note.title}</p>
                  {note.effort !== null && (
                    <Badge tone="neutral">
                      מאמץ <span className="num">{note.effort}</span>
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-muted">{formatHebrewFullDate(note.date)}</p>
                <p className="mt-2 text-xs leading-relaxed">{note.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="surface p-3">
      <Icon className="size-4 text-muted" aria-hidden />
      <p className="stat-value mt-1.5">{value}</p>
      <p className="label-muted">{label}</p>
    </div>
  );
}
