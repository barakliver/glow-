'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dices, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DIFFICULTY_LABELS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/domain/types';

/** How many reps or seconds each drawn exercise gets. */
const DOSES = ['30 שניות', '45 שניות', '60 שניות', '12 חזרות', '15 חזרות', '20 חזרות'];

type Slot = { exercise: Exercise; dose: string };

const REEL_COUNT = 3;
/** Each reel stops a beat after the one before it, the way a real one does. */
const STAGGER_MS = 420;
const SPIN_MS = 900;

function draw(pool: Exercise[]): Slot[] {
  // Three different exercises. A machine that can land the same one twice is a
  // machine nobody trusts.
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, REEL_COUNT);
  return shuffled.map((exercise) => ({
    exercise,
    dose: DOSES[Math.floor(Math.random() * DOSES.length)],
  }));
}

/**
 * The ab jackpot.
 *
 * Pull once, get three core exercises and a dose for each. It exists because
 * deciding what to do is the part people skip, and a machine that decides for
 * you is more fun than a list.
 */
export function AbJackpot({ pool }: { pool: Exercise[] }) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [spinningUntil, setSpinningUntil] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [tick, setTick] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timerList = timers.current;
    return () => timerList.forEach(clearTimeout);
  }, []);

  // While a reel spins it flicks through the pool, so there is something to
  // watch rather than a frozen box.
  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => setTick((value) => value + 1), 70);
    return () => clearInterval(id);
  }, [rolling]);

  const pull = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const next = draw(pool);
    setSlots(next);
    setRolling(true);
    setSpinningUntil([0, 1, 2]);

    for (let reel = 0; reel < REEL_COUNT; reel += 1) {
      timers.current.push(
        setTimeout(
          () => {
            setSpinningUntil((current) => current.filter((index) => index !== reel));
            if (reel === REEL_COUNT - 1) setRolling(false);
          },
          SPIN_MS + reel * STAGGER_MS,
        ),
      );
    }
  }, [pool]);

  if (pool.length < REEL_COUNT) {
    return (
      <p className="surface p-5 text-sm text-muted">
        צריך לפחות שלושה תרגילי ליבה בספרייה כדי להפעיל את המכונה.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface overflow-hidden">
        <ul className="divide-y divide-line">
          {Array.from({ length: REEL_COUNT }, (_, reel) => {
            const spinning = spinningUntil.includes(reel);
            const settled = slots?.[reel];
            const flicker = pool[(tick + reel * 3) % pool.length];
            const shown = spinning ? flicker : settled?.exercise;

            return (
              <li
                key={reel}
                className={cn(
                  'flex min-h-[92px] items-center gap-4 px-5 py-4 transition-colors',
                  spinning && 'bg-raised',
                )}
              >
                <span
                  className={cn(
                    'num flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold',
                    settled && !spinning
                      ? 'border-accent/40 bg-accent/12 text-accent-ink'
                      : 'border-line text-muted',
                  )}
                  aria-hidden
                >
                  {reel + 1}
                </span>

                <div className="min-w-0 flex-1">
                  {shown ? (
                    <>
                      <p
                        className={cn(
                          'truncate text-base font-bold transition-opacity',
                          spinning ? 'opacity-50' : 'opacity-100',
                        )}
                      >
                        {shown.name_he}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {spinning ? '…' : (settled?.dose ?? '')}
                        {!spinning && settled && ` · ${DIFFICULTY_LABELS[settled.exercise.difficulty]}`}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted">משוך את הידית</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Button block size="lg" onClick={pull} disabled={rolling}>
        {slots ? <RotateCcw className="size-4" aria-hidden /> : <Dices className="size-4" aria-hidden />}
        {rolling ? 'מסתובב…' : slots ? 'עוד סיבוב' : 'משיכה'}
      </Button>

      {slots && !rolling && (
        <section className="surface p-5" aria-live="polite">
          <h2 className="text-sm font-bold">הסבב שלך</h2>
          <p className="mt-1.5 text-xs text-muted">
            שלושה סבבים של שלושת התרגילים, מנוחה של 30 שניות בין סבב לסבב.
          </p>
          <ol className="mt-4 space-y-3">
            {slots.map((slot, index) => (
              <li key={slot.exercise.id} className="rounded-xl border border-line bg-raised p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold">{slot.exercise.name_he}</p>
                  <Badge tone="accent">{slot.dose}</Badge>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {slot.exercise.instructions}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-champagne">
                  {slot.exercise.safety_cues}
                </p>
                <span className="sr-only">תרגיל {index + 1}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
