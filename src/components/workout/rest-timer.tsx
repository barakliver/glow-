'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward, TimerReset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatClock } from '@/lib/time';
import { cn } from '@/lib/utils';

/**
 * Rest timer between sets.
 * Elapsed time is derived from timestamps, so a backgrounded tab stays accurate.
 */
export function RestTimer({
  seconds,
  onDone,
  onDismiss,
}: {
  seconds: number;
  onDone?: () => void;
  onDismiss: () => void;
}) {
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [remaining, setRemaining] = useState(seconds);
  const doneRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const reference = pausedAt ?? Date.now();
      const elapsed = (reference - startedAt - offset) / 1000;
      const left = Math.max(0, Math.ceil(seconds - elapsed));
      setRemaining(left);
      if (left === 0 && !doneRef.current) {
        doneRef.current = true;
        onDone?.();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate?.([120, 60, 120]);
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [startedAt, pausedAt, offset, seconds, onDone]);

  const toggle = () => {
    if (pausedAt) {
      setOffset((current) => current + (Date.now() - pausedAt));
      setPausedAt(null);
    } else {
      setPausedAt(Date.now());
    }
  };

  const restart = () => {
    doneRef.current = false;
    setStartedAt(Date.now());
    setOffset(0);
    setPausedAt(null);
  };

  const progress = seconds === 0 ? 100 : ((seconds - remaining) / seconds) * 100;
  const finished = remaining === 0;

  return (
    <div
      role="timer"
      aria-live="off"
      className={cn(
        'rounded-lg border bg-surface p-3.5 transition-all',
        finished ? 'border-success/50' : 'border-accent/45 shadow-glow-soft',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-muted">
            {finished ? 'המנוחה הסתיימה' : 'מנוחה בין סטים'}
          </p>
          <p
            className={cn(
              'num text-3xl font-extrabold tabular-nums',
              finished ? 'text-success' : 'text-accent',
            )}
          >
            {formatClock(remaining)}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="secondary" size="icon" onClick={restart} aria-label="אתחול המנוחה">
            <TimerReset className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={toggle}
            aria-label={pausedAt ? 'המשך' : 'השהיה'}
            disabled={finished}
          >
            {pausedAt ? <Play className="size-4" /> : <Pause className="size-4" />}
          </Button>
          <Button variant="primary" size="icon" onClick={onDismiss} aria-label="דילוג על המנוחה">
            <SkipForward className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-raised">
        <div
          className={cn('h-full rounded-full transition-all', finished ? 'bg-success' : 'bg-accent')}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
