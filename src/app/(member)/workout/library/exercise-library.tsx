'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Search, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  AREA_LABELS,
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MOVEMENT_LABELS,
  MOVEMENT_OPTIONS,
} from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { BodyArea, Exercise, MovementCategory } from '@/lib/domain/types';

export function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MovementCategory | 'all'>('all');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return exercises
      .filter((exercise) => category === 'all' || exercise.movement_category === category)
      .filter(
        (exercise) =>
          needle === '' ||
          exercise.name_he.toLowerCase().includes(needle) ||
          exercise.name_en.toLowerCase().includes(needle) ||
          exercise.instructions.toLowerCase().includes(needle),
      );
  }, [exercises, query, category]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="ספריית תרגילים"
        subtitle={`${exercises.length} תרגילים עם הוראות ביצוע ודגשי בטיחות`}
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
          placeholder="חיפוש תרגיל"
          aria-label="חיפוש תרגיל"
          className="pe-9"
        />
      </div>

      <div className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        <Chip active={category === 'all'} onClick={() => setCategory('all')}>
          הכל
        </Chip>
        {MOVEMENT_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            active={category === option.value}
            onClick={() => setCategory(option.value)}
          >
            {option.label}
          </Chip>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="לא נמצאו תרגילים"
          description="נסו מילה אחרת או בחרו קטגוריית תנועה שונה."
        />
      ) : (
        <ul className="space-y-2">
          {results.map((exercise) => (
            <li key={exercise.id}>
              <details className="surface group p-3.5">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">{exercise.name_he}</h2>
                      <p className="text-[11px] text-muted" dir="ltr">
                        {exercise.name_en}
                      </p>
                    </div>
                    <Badge tone="outline">{MOVEMENT_LABELS[exercise.movement_category]}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge tone="neutral">{DIFFICULTY_LABELS[exercise.difficulty]}</Badge>
                    {exercise.equipment.map((item) => (
                      <Badge key={item} tone="neutral">
                        {EQUIPMENT_LABELS[item]}
                      </Badge>
                    ))}
                  </div>
                </summary>

                <div className="mt-3 space-y-2 border-t border-line pt-3">
                  <div>
                    <h3 className="text-xs font-semibold text-muted">אזורי עבודה</h3>
                    <p className="mt-1 text-xs">
                      {exercise.target_areas.map((area) => AREA_LABELS[area as BodyArea]).join(' · ')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted">הוראות ביצוע</h3>
                    <p className="mt-1 text-xs leading-relaxed">{exercise.instructions}</p>
                  </div>
                  {exercise.safety_cues && (
                    <div className="rounded-md border border-warning/35 bg-warning/8 p-2.5">
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                        <ShieldAlert className="size-3.5" aria-hidden />
                        דגשי בטיחות
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-warning/90">
                        {exercise.safety_cues}
                      </p>
                    </div>
                  )}
                  {exercise.media_url && (
                    <a
                      href={exercise.media_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-block text-xs font-semibold text-ink/80 transition-colors hover:text-ink"
                    >
                      צפייה בהדגמה
                    </a>
                  )}
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'border-accent bg-accent/12 text-accent-ink' : 'border-line bg-raised text-muted',
      )}
    >
      {children}
    </button>
  );
}
