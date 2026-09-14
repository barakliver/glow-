'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EQUIPMENT_LABELS, MOVEMENT_LABELS, MOVEMENT_OPTIONS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Exercise, MovementCategory } from '@/lib/domain/types';

export function ExercisePicker({
  open,
  onOpenChange,
  exercises,
  onSelect,
  title = 'בחירת תרגיל',
  description,
  excludeIds = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  title?: string;
  description?: string;
  excludeIds?: string[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MovementCategory | 'all'>('all');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return exercises
      .filter((exercise) => !excludeIds.includes(exercise.id))
      .filter((exercise) => category === 'all' || exercise.movement_category === category)
      .filter(
        (exercise) =>
          needle === '' ||
          exercise.name_he.toLowerCase().includes(needle) ||
          exercise.name_en.toLowerCase().includes(needle),
      );
  }, [exercises, query, category, excludeIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="חיפוש לפי שם בעברית או באנגלית"
            aria-label="חיפוש תרגיל"
            className="pe-9"
            autoFocus
          />
        </div>

        <div className="hide-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <FilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            הכל
          </FilterChip>
          {MOVEMENT_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              active={category === option.value}
              onClick={() => setCategory(option.value)}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>

        <ul className="mt-3 max-h-[46vh] space-y-1.5 overflow-y-auto">
          {results.length === 0 && (
            <li className="py-8 text-center text-sm text-muted">לא נמצאו תרגילים תואמים</li>
          )}
          {results.map((exercise) => (
            <li key={exercise.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(exercise);
                  onOpenChange(false);
                }}
                className="w-full rounded-md border border-line bg-raised p-3 text-start transition-colors hover:border-accent/45"
              >
                <span className="block text-sm font-semibold">{exercise.name_he}</span>
                <span className="mt-0.5 block text-[11px] text-muted" dir="ltr">
                  {exercise.name_en}
                </span>
                <span className="mt-2 flex flex-wrap gap-1">
                  <Badge tone="outline">{MOVEMENT_LABELS[exercise.movement_category]}</Badge>
                  {exercise.equipment.slice(0, 2).map((item) => (
                    <Badge key={item} tone="neutral">
                      {EQUIPMENT_LABELS[item]}
                    </Badge>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function FilterChip({
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
