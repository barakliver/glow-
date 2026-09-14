import type { LucideIcon } from 'lucide-react';
import { AvocadoGlyph } from '@/components/brand/avocado-glyph';
import { cn } from '@/lib/utils';

/**
 * Nothing here yet.
 *
 * The fruit stands behind the icon rather than replacing it: the icon still
 * says which kind of nothing this is - no classes, no records, no notes - and
 * the avocado says whose app it is. It is drawn faint and large, the way a
 * watermark sits on a page, so twenty screens can carry it without any of them
 * turning into a sticker.
 */
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
        'relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-line/70 bg-surface/40 px-6 py-12 text-center',
        className,
      )}
    >
      <AvocadoGlyph
        size={132}
        className="pointer-events-none absolute -bottom-7 start-1/2 -translate-x-1/2 text-ink/[0.035] rtl:translate-x-1/2"
      />
      <div className="relative flex size-12 items-center justify-center rounded-full border border-line/60 bg-raised">
        <Icon className="size-[22px] text-muted" aria-hidden />
      </div>
      <div className="relative space-y-1.5">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && (
          <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
