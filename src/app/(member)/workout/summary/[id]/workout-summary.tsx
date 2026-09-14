'use client';

import Link from 'next/link';
import { Award, Check, Dumbbell, Gauge, Timer, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PR_LABELS, type PersonalRecord } from '@/lib/domain/progress';
import { formatClock } from '@/lib/time';
import { num } from '@/lib/utils';

export function WorkoutSummary({
  title,
  totalSeconds,
  setCount,
  volume,
  averageEffort,
  notes,
  records,
}: {
  title: string;
  totalSeconds: number;
  setCount: number;
  volume: number;
  averageEffort: number | null;
  notes: string | null;
  records: (PersonalRecord & { exerciseName: string })[];
}) {
  return (
    <div className="space-y-4 py-4">
      <header className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/15 shadow-glow-soft">
          <Check className="size-8 text-accent-ink" aria-hidden />
        </div>
        <h1 className="mt-3 text-2xl font-semibold">האימון הושלם</h1>
        <p className="mt-1 text-sm text-muted">{title}</p>
      </header>

      <section className="grid grid-cols-2 gap-2" aria-label="סיכום האימון">
        <Stat icon={Timer} label="משך" value={formatClock(totalSeconds)} />
        <Stat icon={Dumbbell} label="סטים" value={num(setCount)} />
        <Stat icon={TrendingUp} label='נפח (ק"ג)' value={num(volume)} />
        <Stat
          icon={Gauge}
          label="מאמץ ממוצע"
          value={averageEffort !== null ? `${averageEffort}/10` : '—'}
        />
      </section>

      {records.length > 0 && (
        <section className="surface p-4" aria-labelledby="records-title">
          <h2 id="records-title" className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
            <Award className="size-4" aria-hidden />
            שיאים אישיים חדשים
          </h2>
          <ul className="space-y-1.5">
            {records.map((record) => (
              <li
                key={`${record.exercise_id}-${record.kind}`}
                className="flex items-center justify-between gap-2 rounded-md border border-accent/35 bg-accent/8 px-3 py-2"
              >
                <span className="truncate text-sm font-medium">{record.exerciseName}</span>
                <Badge tone="accent">
                  {PR_LABELS[record.kind]} <span className="num">{record.value}</span>
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}

      {notes && (
        <section className="surface p-4">
          <h2 className="text-sm font-semibold">ההערה שלך</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{notes}</p>
        </section>
      )}

      <div className="flex flex-col gap-2">
        <Button block size="lg" asChild>
          <Link href="/progress">לצפייה בהתקדמות</Link>
        </Button>
        <Button variant="secondary" block asChild>
          <Link href="/workout">חזרה לאימונים</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="surface p-3 text-center">
      <Icon className="mx-auto size-4 text-muted" aria-hidden />
      <p className="stat-value mt-1">{value}</p>
      <p className="label-muted">{label}</p>
    </div>
  );
}
