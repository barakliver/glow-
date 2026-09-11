'use client';

import Link from 'next/link';
import { Clock, MapPin, User, Users } from 'lucide-react';
import { AvailabilityBadge } from '@/components/classes/availability-badge';
import { Badge } from '@/components/ui/badge';
import { availabilityForClass } from '@/lib/domain/booking-rules';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/labels';
import { formatTime, formatShortDate } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { ClassWithMeta } from '@/lib/domain/types';

export function ClassCard({
  gymClass,
  showDate = false,
  action,
  className,
}: {
  gymClass: ClassWithMeta;
  showDate?: boolean;
  action?: React.ReactNode;
  className?: string;
}) {
  const availability = availabilityForClass(gymClass);
  const isMine = availability === 'booked' || availability === 'waitlisted';
  const dimmed = availability === 'cancelled' || availability === 'past';

  return (
    <article
      className={cn(
        'relative rounded-lg border bg-surface p-3.5 transition-colors',
        isMine ? 'border-accent/45 shadow-glow-soft' : 'border-line',
        dimmed && 'opacity-60',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/classes/${gymClass.id}`}
            className="rounded focus-visible:ring-2 focus-visible:ring-accent"
          >
            <h3 className="truncate text-base font-bold leading-tight">{gymClass.title}</h3>
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              <span className="num">
                {showDate && `${formatShortDate(gymClass.starts_at)} · `}
                {formatTime(gymClass.starts_at)}–{formatTime(gymClass.ends_at)}
              </span>
            </span>
            {gymClass.trainer_name && (
              <span className="inline-flex items-center gap-1">
                <User className="size-3.5" aria-hidden />
                {gymClass.trainer_name}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {gymClass.location}
            </span>
          </p>
        </div>
        <AvailabilityBadge availability={availability} spotsLeft={gymClass.spots_left} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="outline">{CATEGORY_LABELS[gymClass.category]}</Badge>
        <Badge tone="neutral">{DIFFICULTY_LABELS[gymClass.difficulty]}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <Users className="size-3.5" aria-hidden />
          <span className="num">
            {gymClass.confirmed_count}/{gymClass.capacity}
          </span>
          {gymClass.waitlist_count > 0 && (
            <span className="text-muted">· המתנה {gymClass.waitlist_count}</span>
          )}
        </span>
      </div>

      {action && <div className="mt-3">{action}</div>}
    </article>
  );
}
