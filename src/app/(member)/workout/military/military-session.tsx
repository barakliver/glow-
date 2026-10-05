'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Flame, Pause, Play, RotateCcw, Scale, Square } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="space-y-7">
      <PageHeader title="Barak Workout Military" backHref="/workout" />

      <section className="surface p-6">
        <p className="text-sm leading-relaxed text-muted">
          <span className="num font-semibold text-ink">{ROUNDS}</span> סבבים ·{' '}
          <span className="num font-semibold text-ink">{RUN_METRES}</span> מטר הלוך וחזור ·{' '}
          <span className="num font-semibold text-ink">{CLEAN_AND_JERKS}</span> קלין וג׳רק ב־
          <span className="num font-semibold text-ink">{LOAD_KG}</span> ק״ג
        </p>
      </section>

      {/* The clock and the counter share one screen, because mid-round nobody
          is navigating anywhere. */}
      <section className="surface p-6 text-center" aria-live="off">
        <p className="label-muted block">נותר</p>
        <p
          className={cn(
            'num mt-1 text-[56px] font-medium leading-none tracking-tight tabular-nums',
            remaining <= 60 && phase === 'running' ? 'text-warning' : 'text-ink',
          )}
        >
          {clock(remaining)}
        </p>
        {added > 0 ? (
          <Badge tone="outline" className="mt-3">
            הוארך ב־<span className="num">{added}</span> דק׳ לפי הקצב שלך
          </Badge>
        ) : (
          <p className="mt-2.5 text-xs text-muted">
            מתוך <span className="num">{BASE_SECONDS / 60}</span> דקות
          </p>
        )}
      </section>

      {/* The button. Big enough to hit without looking, which is the only
          size that matters at round eleven. */}
      <button
        type="button"
        onClick={countRound}
        disabled={phase !== 'running'}
        aria-label={`סיימתי סבב. ${roundsDone} מתוך ${ROUNDS}`}
        className={cn(
          'flex min-h-[220px] w-full flex-col items-center justify-center gap-2 rounded-2xl border transition-colors',
          phase === 'running'
            ? 'border-accent/50 bg-accent/12 active:bg-accent/25'
            : 'border-line bg-surface opacity-60',
        )}
      >
        <span className="num text-[88px] font-medium leading-none tracking-tight text-ink">
          {num(roundsDone)}
          <span className="text-3xl text-muted"> / {num(ROUNDS)}</span>
        </span>
        <span className="text-sm font-semibold text-accent-ink">
          {phase === 'running' ? 'סיימתי סבב' : 'מתחילים כדי לספור'}
        </span>
      </button>

      <section className="surface p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="size-4 text-accent-ink" aria-hidden />
            אומדן קלוריות
          </h2>
          {burned !== null && (
            <span className="num text-sm font-semibold text-accent-ink">
              {num(burned)} / {num(TARGET_KCAL)}
            </span>
          )}
        </div>
        {burned === null ? <NoWeight /> : <Progress value={burnedPercent ?? 0} className="mt-3" label="התקדמות ליעד הקלוריות" />}
        {average && (
          <p className="num mt-3 text-xs text-muted">ממוצע לסבב {clock(average)}</p>
        )}
      </section>

      <div className="flex gap-3">
        {phase === 'ready' && (
          <Button block size="lg" onClick={start}>
            <Play className="size-4" aria-hidden />
            התחלה
          </Button>
        )}
        {phase === 'running' && (
          <>
            <Button variant="secondary" block size="lg" onClick={pause}>
              <Pause className="size-4" aria-hidden />
              השהיה
            </Button>
            <Button variant="secondary" block size="lg" onClick={stop}>
              <Square className="size-4" aria-hidden />
              סיום
            </Button>
          </>
        )}
        {phase === 'paused' && (
          <>
            <Button block size="lg" onClick={resume}>
              <Play className="size-4" aria-hidden />
              המשך
            </Button>
            <Button variant="secondary" block size="lg" onClick={stop}>
              <Square className="size-4" aria-hidden />
              סיום
            </Button>
          </>
        )}
      </div>
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
