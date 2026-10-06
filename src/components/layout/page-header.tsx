import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Hebrew, as opposed to a title that happens to be written in English. */
const HEBREW = /[\u0590-\u05FF]/;

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2">
        {backHref && (
          <Link
            href={backHref}
            aria-label="חזרה"
            className="-me-1 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <ChevronRight className="size-5" aria-hidden />
          </Link>
        )}
        <div className="min-w-0">
          {/*
            * The serif names the page - but only in Hebrew.
            *
            * Frank Ruhl Libre has a full Latin set, and it is a formal
            * bookish one: "Barak Workout Military" set in it did not read as
            * this app's heading, it read as a heading borrowed from somewhere
            * else entirely. An English title therefore takes the same face as
            * the numbers, which is the one Latin voice the app already has.
            */}
          <h1
            className={cn(
              'truncate text-xl tracking-tight',
              HEBREW.test(title) ? 'display' : 'font-num font-semibold',
            )}
          >
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
