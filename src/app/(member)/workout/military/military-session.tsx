'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Flame, Pause, Play, RotateCcw, Scale, Square } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AvocadoGlyph } from '@/components/brand/avocado-glyph';
import { playCue, unlockAudio } from '@/lib/timer-feedback';
import {
  BASE_SECONDS,
  CLEAN_AND_JERKS,
  LOAD_KG,
  ROUNDS,
  RUN_METRES,
  TARGET_KCAL,
  allowanceSeconds,
  averageRoundSeconds,
  caloriesBurned,
  calorieProgress,
  extraMinutes,
  summarise,
} from '@/lib/domain/military';
import { cn, num } from '@/lib/utils';

type Phase = 'ready' | 'running' | 'paused' | 'done';

function clock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
}

/**
 * The live screen for Barak Workout Military.
 *
 * Counter and clock on one screen, because mid-round nobody is navigating
 * anywhere. The clock counts down from thirty minutes and quietly gives itself
 * more time when the pace says sixteen rounds were never going to fit - the
 * alternative is a timer that expires on somebody who is still working, which
 * teaches them to ignore it.
 *
 * Elapsed time is measured against a wall-clock stamp rather than counted up
 * by the interval, so a phone that sleeps mid-workout comes back with the
 * right number instead of however many ticks the browser felt like running.
 */
export function MilitarySession({ weightKg }: { weightKg: number | null }) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [roundsDone, setRoundsDone] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  /** Wall-clock anchor: when the current run started, minus what came before. */
  const startedAt = useRef<number | null>(null);
  const banked = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const tick = () => {
      if (startedAt.current === null) return;
      setElapsed(banked.current + (Date.now() - startedAt.current) / 1000);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [phase]);

  const allowance = allowanceSeconds(roundsDone, elapsed);
  const remaining = allowance - elapsed;
  const added = extraMinutes(roundsDone, elapsed);
  const burned = caloriesBurned(weightKg, elapsed);
  const burnedPercent = calorieProgress(weightKg, elapsed);
  const average = averageRoundSeconds(roundsDone, elapsed);

  const start = () => {
    unlockAudio();
    startedAt.current = Date.now();
    setPhase('running');
  };

  const pause = () => {
    if (startedAt.current !== null) banked.current += (Date.now() - startedAt.current) / 1000;
    startedAt.current = null;
    setPhase('paused');
  };

  const resume = () => {
    unlockAudio();
    startedAt.current = Date.now();
    setPhase('running');
  };

  const stop = () => {
    if (startedAt.current !== null) banked.current += (Date.now() - startedAt.current) / 1000;
    startedAt.current = null;
    setElapsed(banked.current);
    setPhase('done');
  };

  const reset = () => {
    startedAt.current = null;
    banked.current = 0;
    setElapsed(0);
    setRoundsDone(0);
    setPhase('ready');
  };

  const countRound = useCallback(() => {
    if (phase !== 'running') return;
    setRoundsDone((done) => {
      const next = Math.min(ROUNDS, done + 1);
      playCue(next >= ROUNDS ? 'complete' : 'work', false);
      if (navigator.vibrate) navigator.vibrate(next >= ROUNDS ? [60, 40, 120] : 40);
      if (next >= ROUNDS) {
        if (startedAt.current !== null) banked.current += (Date.now() - startedAt.current) / 1000;
        startedAt.current = null;
        setElapsed(banked.current);
        setPhase('done');
      }
      return next;
    });
  }, [phase]);

  if (phase === 'done') {
    const result = summarise(roundsDone, elapsed, weightKg);
    return (
      <div className="space-y-8">
        <PageHeader title="סיכום" backHref="/workout" />

        <section className="surface relative overflow-hidden p-6 text-center">
          <AvocadoGlyph
            size={140}
            className="pointer-events-none absolute -bottom-10 start-1/2 -translate-x-1/2 text-ink/[0.035] rtl:translate-x-1/2"
          />
          <p className="relative text-sm text-muted">
            {result.finished ? 'סיימת את כל הסבבים.' : 'עצרת כאן. זה נספר.'}
          </p>
          <p className="num relative mt-3 text-[64px] font-medium leading-none tracking-tight">
            {num(result.roundsDone)}
            <span className="text-2xl text-muted"> / {num(result.rounds)}</span>
          </p>
          <p className="relative mt-1 text-xs text-muted">סבבים</p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <div className="surface p-5">
            <p className="label-muted block">זמן</p>
            <p className="num mt-1.5 text-2xl font-medium">{clock(result.elapsedSeconds)}</p>
          </div>
          <div className="surface p-5">
            <p className="label-muted block">ממוצע לסבב</p>
            <p className="num mt-1.5 text-2xl font-medium">
              {result.averageRoundSeconds ? clock(result.averageRoundSeconds) : '—'}
            </p>
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="size-4 text-accent-ink" aria-hidden />
            אומדן קלוריות
          </h2>
          {result.caloriesBurned === null ? (
            <NoWeight />
          ) : (
            <>
              <p className="num mt-3 text-3xl font-medium">
                {num(result.caloriesBurned)}
                <span className="text-base text-muted"> / {num(TARGET_KCAL)}</span>
              </p>
              <Progress value={result.calorieProgress ?? 0} className="mt-3" label="התקדמות ליעד" />
              <p className="mt-2.5 text-xs leading-relaxed text-muted">
                אומדן בלבד, מחושב מהמשקל שרשום לך ומזמן העבודה בפועל.
              </p>
            </>
          )}
        </section>

        {result.extraMinutes > 0 && (
          <p className="text-xs leading-relaxed text-muted">
            השעון הוארך ב־<span className="num">{result.extraMinutes}</span> דקות לפי הקצב שלך.
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" block onClick={reset}>
            <RotateCcw className="size-4" aria-hidden />
            שוב
          </Button>
          <Button block asChild>
            <Link href="/tracking/new">רישום האימון</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tapCounter = () => {
    if (phase === 'ready') return start();
    if (phase === 'paused') return resume();
    countRound();
  };

  /*
   * One screen, no scrolling.
   *
   * Everything here is read mid-round, by somebody out of breath who is not
   * going to scroll for it: the clock, the count and the burn have to be on
   * the same 844 points as each other. So the prescription is a line rather
   * than a card, the clock and the burn share a row, and what is left over
   * goes to the counter - which is the only thing anybody actually touches.
   */
  return (
    <div className="flex min-h-[calc(100dvh-13rem)] flex-col gap-4">
      <PageHeader title="Barak Workout Military" backHref="/workout" />

      <p className="text-center text-xs leading-relaxed text-muted">
        <span className="num font-semibold text-ink">{ROUNDS}</span> סבבים ·{' '}
        <span className="num font-semibold text-ink">{RUN_METRES}</span> מ׳ הלוך וחזור ·{' '}
        <span className="num font-semibold text-ink">{CLEAN_AND_JERKS}</span> קלין וג׳רק ב־
        <span className="num font-semibold text-ink">{LOAD_KG}</span> ק״ג
      </p>

      <section className="grid grid-cols-2 gap-3">
        <div className="surface px-4 py-3.5 text-center">
          <p className="label-muted block">נותר</p>
          <p
            className={cn(
              'num mt-1 text-[34px] font-medium leading-none tracking-tight tabular-nums',
              remaining <= 60 && phase === 'running' ? 'text-warning' : 'text-ink',
            )}
          >
            {clock(remaining)}
          </p>
          {added > 0 ? (
            <p className="mt-1.5 text-[11px] leading-tight text-accent-ink">
              הוארך ב־<span className="num">{added}</span> דק׳
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] leading-tight text-muted">
              מתוך <span className="num">{BASE_SECONDS / 60}</span> דקות
            </p>
          )}
        </div>

        <div className="surface px-4 py-3.5 text-center">
          <p className="label-muted flex items-center justify-center gap-1">
            <Flame className="size-3 text-accent-ink" aria-hidden />
            קלוריות
          </p>
          <p className="num mt-1 text-[34px] font-medium leading-none tracking-tight">
            {burned === null ? '—' : num(burned)}
            {burned !== null && <span className="text-sm text-muted"> / {num(TARGET_KCAL)}</span>}
          </p>
          {burned === null ? (
            <Link href="/tracking" className="mt-1.5 block text-[11px] text-accent-ink underline">
              רישום משקל
            </Link>
          ) : (
            <Progress value={burnedPercent ?? 0} className="mt-2" label="התקדמות ליעד הקלוריות" />
          )}
        </div>
      </section>

      {/*
        * The button, and it has to look like one from the moment the screen
        * opens.
        *
        * It used to render disabled and half-faded until the separate start
        * control was pressed, so the largest thing on the page looked broken
        * on arrival. It is now live in every phase: the first tap starts the
        * clock, each tap after it counts a round. Nothing is dimmed, because
        * nothing here is unavailable.
        */}
      <button
        type="button"
        onClick={tapCounter}
        /* The visible label changes with the phase by design, so the tests
         * hold onto this instead of onto whatever it currently says. */
        data-testid="round-counter"
        aria-label={
          phase === 'ready'
            ? 'התחלת האימון'
            : `סיימתי סבב. ${roundsDone} מתוך ${ROUNDS}`
        }
        className={cn(
          'group relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl',
          /* Generous, but not a whole screen of empty gold: past about 340px
           * the number stops reading as big and starts reading as lost. */
          'min-h-[240px] max-h-[340px]',
          'border border-accent/45 bg-gradient-to-b from-accent/[0.16] to-accent/[0.05]',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_50px_-32px_rgba(0,0,0,0.95)]',
          'transition-[transform,background-color] duration-150 ease-out',
          'active:scale-[0.985] active:bg-accent/25',
          phase === 'running' && 'border-accent/70',
        )}
      >
        {/*
          * The button fills like a vessel as the rounds land.
          *
          * Ripeness is already this app's word for progress, so the first go
          * at this ripened an avocado behind the number - and the fruit's
          * stone punched a dark hole straight through the label under it. A
          * watermark centred behind a column of text will always fight the
          * text. The gold rising from the bottom edge cannot: it is behind
          * everything, it reads from across the room, and the waterline is
          * the one thing here you can take in without reading. The number
          * above is still the source of truth; this only ever agrees with it.
          */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent/[0.22] to-accent/[0.06] transition-[height] duration-500 ease-out"
          style={{ height: `${(roundsDone / ROUNDS) * 100}%` }}
        >
          {roundsDone > 0 && (
            <span className="absolute inset-x-0 top-0 h-px bg-accent/40" />
          )}
        </span>
        <AvocadoGlyph
          size={132}
          aria-hidden
          className="pointer-events-none absolute -bottom-8 start-1/2 -translate-x-1/2 text-ink/[0.04] rtl:translate-x-1/2"
        />
        <span className="num relative text-[92px] font-medium leading-none tracking-tight text-ink">
          {num(roundsDone)}
          <span className="text-3xl text-muted"> / {num(ROUNDS)}</span>
        </span>
        <span className="relative text-sm font-semibold text-accent-ink">
          {phase === 'ready'
            ? 'לחיצה להתחלה'
            : phase === 'paused'
              ? 'מושהה · לחיצה להמשך'
              : 'סיימתי סבב'}
        </span>
        {average !== null && (
          <span className="num relative text-[11px] text-muted">ממוצע לסבב {clock(average)}</span>
        )}
      </button>

      {phase !== 'ready' && (
        <div className="flex gap-3">
          {phase === 'running' ? (
            <Button variant="secondary" block size="lg" onClick={pause}>
              <Pause className="size-4" aria-hidden />
              השהיה
            </Button>
          ) : (
            <Button variant="secondary" block size="lg" onClick={resume}>
              <Play className="size-4" aria-hidden />
              המשך
            </Button>
          )}
          <Button variant="secondary" block size="lg" onClick={stop}>
            <Square className="size-4" aria-hidden />
            סיום
          </Button>
        </div>
      )}
    </div>
  );
}

/** Said plainly rather than filled in with a guess. */
function NoWeight() {
  return (
    <div className="mt-3 rounded-md border border-line bg-raised p-4">
      <p className="text-xs leading-relaxed text-muted">
        אין משקל גוף רשום, ובלעדיו אומדן קלוריות הוא ניחוש ולא אומדן. רישום אחד מספיק והמספר יופיע
        מכאן והלאה.
      </p>
      <Button variant="secondary" size="sm" className="mt-3" asChild>
        <Link href="/tracking">
          <Scale className="size-4" aria-hidden />
          רישום משקל
        </Link>
      </Button>
    </div>
  );
}
