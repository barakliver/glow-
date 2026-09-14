'use client';

import { useState } from 'react';
import { ExternalLink, Info, PlayCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { demonstrationUrl, matchMovement } from '@/lib/domain/movement-guide';
import { cn } from '@/lib/utils';
import type { WorkoutMovement } from '@/lib/domain/types';

/**
 * One line of a workout, and what is behind it.
 *
 * Every movement opens: the ones we have written up show their cues, and the
 * ones we have not still open a demonstration. Lines that are not movements at
 * all - a block heading, a minute marker - stay as plain text, because a
 * button that leads somewhere useless teaches people to stop pressing.
 */
export function MovementLine({ item }: { item: WorkoutMovement }) {
  const [open, setOpen] = useState(false);
  const match = matchMovement(item.label);

  if (!match) {
    return (
      <li className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-sm font-medium text-muted">{item.label}</span>
        {item.detail && <span className="text-xs text-muted">{item.detail}</span>}
      </li>
    );
  }

  const { guide } = match;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group -mx-2 flex w-[calc(100%+1rem)] flex-wrap items-baseline gap-x-2 rounded-md px-2 py-1.5',
          'text-start transition-colors hover:bg-raised active:bg-raised',
        )}
      >
        <span className="text-sm font-medium underline decoration-line decoration-dotted underline-offset-4 group-hover:decoration-accent-ink">
          {item.label}
        </span>
        {item.detail && <span className="text-xs text-muted">{item.detail}</span>}
        <Info
          className="ms-auto size-3.5 shrink-0 self-center text-muted/50 group-hover:text-accent-ink"
          aria-hidden
        />
        <span className="sr-only">הסבר והדגמה</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">{guide ? guide.he : item.label}</DialogTitle>
            <DialogDescription dir="ltr" className="text-start">
              {guide ? guide.en : 'עוד לא כתבנו על התרגיל הזה - אבל יש הדגמות.'}
            </DialogDescription>
          </DialogHeader>

          {guide && (
            <ol className="mt-4 space-y-2.5">
              {guide.cues.map((cue, index) => (
                <li key={cue} className="flex gap-3">
                  <span className="num mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-raised text-[11px] font-semibold text-accent-ink">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{cue}</span>
                </li>
              ))}
            </ol>
          )}

          {guide?.watch && (
            <p className="mt-4 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed">
              <span className="font-semibold">שימו לב · </span>
              {guide.watch}
            </p>
          )}

          <Button className="mt-5" block size="lg" asChild>
            <a href={demonstrationUrl(match.query)} target="_blank" rel="noopener noreferrer">
              <PlayCircle className="size-4" aria-hidden />
              צפייה בהדגמה
              <ExternalLink className="size-3.5 opacity-70" aria-hidden />
            </a>
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted/70">
            נפתח ביוטיוב עם חיפוש על שם התרגיל
          </p>
        </DialogContent>
      </Dialog>
    </li>
  );
}
