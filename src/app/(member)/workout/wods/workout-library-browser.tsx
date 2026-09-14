'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Dumbbell, Search, Timer } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  DIFFICULTY_LABELS,
  SCORE_TYPE_LABELS,
  WORKOUT_CATEGORY_LABELS,
  WORKOUT_CATEGORY_OPTIONS,
  WORKOUT_FORMAT_LABELS,
} from '@/lib/labels';
import { formatDuration } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Workout, WorkoutCategory } from '@/lib/domain/types';

export function WorkoutLibraryBrowser({ workouts }: { workouts: Workout[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<WorkoutCategory | 'all'>('all');

  const counts = useMemo(() => {
    const totals = new Map<WorkoutCategory, number>();
    for (const workout of workouts) {
      totals.set(workout.category, (totals.get(workout.category) ?? 0) + 1);
    }
    return totals;
  }, [workouts]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return workouts
      .filter((workout) => category === 'all' || workout.category === category)
      .filter(
        (workout) =>
          needle === '' ||
          workout.title.toLowerCase().includes(needle) ||
          (workout.subtitle ?? '').toLowerCase().includes(needle) ||
          workout.description.toLowerCase().includes(needle),
      );
  }, [workouts, query, category]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="מאגר האימונים"
        subtitle={`${workouts.length} אימונים מוכנים, מחולקים לארבע משפחות`}
        backHref="/workout"
      />

      <div className="relative">
        <Search
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="חיפוש לפי שם או תיאור"
          aria-label="חיפוש במאגר האימונים"
          className="pe-10"
        />
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="flex w-max gap-1.5" role="tablist" aria-label="סינון לפי משפחה">
          {[{ value: 'all' as const, label: 'הכל' }, ...WORKOUT_CATEGORY_OPTIONS].map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={category === option.value}
              onClick={() => setCategory(option.value as WorkoutCategory | 'all')}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                category === option.value
                  ? 'border-accent bg-accent/12 text-accent-ink'
                  : 'border-line bg-raised text-muted hover:text-ink',
              )}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="num ms-1 text-muted">
                  {counts.get(option.value as WorkoutCategory) ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="לא נמצאו אימונים"
          description="נסו מילה אחרת או בחרו משפחה אחרת."
        />
      ) : (
        <ul className="space-y-2">
          {results.map((workout) => (
            <li key={workout.id}>
              <Link
                href={`/workout/wods/${workout.slug}`}
                className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-semibold leading-tight">{workout.title}</h2>
                  {workout.subtitle && (
                    <p className="mt-0.5 truncate text-xs text-muted">{workout.subtitle}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="accent">{WORKOUT_CATEGORY_LABELS[workout.category]}</Badge>
                    <Badge tone="outline">{WORKOUT_FORMAT_LABELS[workout.format]}</Badge>
                    <Badge tone="neutral">{DIFFICULTY_LABELS[workout.difficulty]}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Timer className="size-3.5" aria-hidden />
                      {formatDuration(workout.duration_minutes)}
                    </span>
                    <span className="text-xs text-muted">
                      · {SCORE_TYPE_LABELS[workout.score_type]}
                    </span>
                  </div>
                </div>
                <ChevronLeft className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
