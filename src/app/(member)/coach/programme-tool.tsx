'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { buildProgramme } from '@/lib/domain/coach/programme';
import type { LiftKey } from '@/lib/domain/coach/types';
import { cn, num } from '@/lib/utils';

const LIFTS: { key: LiftKey; label: string }[] = [
  { key: 'squat', label: 'סקוואט' },
  { key: 'bench', label: 'לחיצת חזה' },
  { key: 'deadlift', label: 'דדליפט' },
  { key: 'press', label: 'לחיצת כתפיים' },
];

const SLOT_LABEL: Record<string, string> = {
  main: 'תרגיל מרכזי',
  secondary: 'תרגיל שני',
  accessory: 'עזר',
  finisher: 'ליבה',
};

export function ProgrammeTool() {
  const [maxes, setMaxes] = useState<Record<LiftKey, string>>({
    squat: '',
    bench: '',
    deadlift: '',
    press: '',
  });
  const [days, setDays] = useState(4);
  const [minutes, setMinutes] = useState(60);
  const [built, setBuilt] = useState(false);
  const [openWeek, setOpenWeek] = useState(1);

  const programme = useMemo(
    () =>
      buildProgramme({
        oneRm: {
          squat: Number(maxes.squat) || null,
          bench: Number(maxes.bench) || null,
          deadlift: Number(maxes.deadlift) || null,
          press: Number(maxes.press) || null,
        },
        daysPerWeek: days,
        sessionMinutes: minutes,
        experience: 'intermediate',
      }),
    [maxes, days, minutes],
  );

  const week = programme.weeks.find((w) => w.index === openWeek) ?? programme.weeks[0];

  return (
    <div className="space-y-7">
      <section className="surface space-y-6 p-6">
        <div>
          <h2 className="text-sm font-semibold">השיאים שלך</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            חזרה מקסימלית אחת, בקילוגרמים. אפשר להשאיר ריק — במקום משקל תקבל מספר חזרות ורמת מאמץ.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {LIFTS.map((lift) => (
              <div key={lift.key} className="space-y-1.5">
                <Label htmlFor={`rm-${lift.key}`}>{lift.label}</Label>
                <Input
                  id={`rm-${lift.key}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="2.5"
                  dir="ltr"
                  className="num"
                  placeholder='ק"ג'
                  value={maxes[lift.key]}
                  onChange={(event) =>
                    setMaxes((rows) => ({ ...rows, [lift.key]: event.target.value }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">כמה ימים בשבוע</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[2, 3, 4, 5, 6].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDays(value)}
                aria-pressed={days === value}
                className={cn(
                  'num size-11 rounded-full border text-sm font-semibold transition-colors',
                  days === value
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-surface text-muted hover:bg-raised',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">כמה דקות לאימון</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[30, 45, 60, 75, 90].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMinutes(value)}
                aria-pressed={minutes === value}
                className={cn(
                  'num h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
                  minutes === value
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-surface text-muted hover:bg-raised',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <Button block size="lg" onClick={() => setBuilt(true)}>
          בניית התוכנית
        </Button>
      </section>

      {built && (
        <>
          <section className="surface space-y-3 p-6">
            <h2 className="display text-xl">{programme.model}</h2>
            <p className="text-sm leading-relaxed text-muted">{programme.modelWhy}</p>
            <div className="border-t border-line pt-4">
              <p className="text-sm font-semibold">{programme.splitName}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{programme.splitWhy}</p>
            </div>
            {programme.caveats.map((caveat) => (
              <p
                key={caveat}
                className="rounded-md border border-champagne/30 bg-champagne/5 p-3 text-xs leading-relaxed text-muted"
              >
                {caveat}
              </p>
            ))}
          </section>

          <nav aria-label="שבועות" className="hide-scrollbar -mx-5 overflow-x-auto px-5">
            <div className="flex w-max gap-2">
              {programme.weeks.map((entry) => (
                <button
                  key={entry.index}
                  type="button"
                  onClick={() => setOpenWeek(entry.index)}
                  aria-pressed={openWeek === entry.index}
                  className={cn(
                    'num size-11 shrink-0 rounded-full border text-sm font-semibold transition-colors',
                    openWeek === entry.index
                      ? 'border-accent bg-accent text-primary-foreground'
                      : entry.deload
                        ? 'border-line bg-raised text-champagne'
                        : 'border-line bg-surface text-muted',
                  )}
                >
                  {entry.index}
                </button>
              ))}
            </div>
          </nav>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">
                שבוע <span className="num">{week.index}</span>
              </h3>
              <Badge tone={week.deload ? 'warning' : 'accent'}>{week.blockName}</Badge>
              {week.deload && <Badge tone="outline">ריקון</Badge>}
            </div>
            <p className="text-sm leading-relaxed text-muted">{week.intent}</p>

            {week.sessions.map((session) => (
              <article key={session.day} className="surface p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h4 className="text-base font-semibold">{session.title}</h4>
                  <span className="num text-xs text-muted">≈{session.estimatedMinutes} דק׳</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{session.focus}</p>

                <ul className="mt-4 space-y-4">
                  {session.movements.map((movement) => (
                    <li key={movement.name} className="border-t border-line/70 pt-4 first:border-0 first:pt-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-semibold">{movement.name}</p>
                        <Badge tone="neutral">{SLOT_LABEL[movement.slot]}</Badge>
                      </div>
                      <p className="num mt-1.5 text-sm text-accent-ink">
                        {movement.prescription.sets} × {movement.prescription.reps}
                        {movement.prescription.kg !== null && (
                          <>
                            {' · '}
                            {num(movement.prescription.kg)} ק״ג
                            <span className="text-muted"> ({movement.prescription.percent}%)</span>
                          </>
                        )}
                        {' · '}
                        {movement.prescription.rir} ביד
                      </p>
                      <p className="num mt-0.5 text-[11px] text-muted">
                        טמפו {movement.prescription.tempo} · מנוחה {movement.prescription.restSeconds} שנ׳
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{movement.why}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
