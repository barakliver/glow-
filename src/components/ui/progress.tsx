import * as React from 'react';
import { cn } from '@/lib/utils';

export function Progress({
  value,
  className,
  tone = 'accent',
  label,
}: {
  value: number;
  className?: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const bar = {
    accent: 'bg-accent/85',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-line/80', className)}
    >
      <div className={cn('h-full rounded-full transition-all duration-500', bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}
