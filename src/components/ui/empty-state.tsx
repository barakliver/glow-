import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-surface/50 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-raised">
        <Icon className="size-6 text-muted" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-ink">{title}</p>
        {description && <p className="mx-auto max-w-xs text-xs text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
