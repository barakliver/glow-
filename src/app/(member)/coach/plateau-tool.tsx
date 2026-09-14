'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AREA_LABEL,
  breakthroughPlan,
  diagnose,
  type CalorieState,
  type StressLevel,
} from '@/lib/domain/coach/plateau';
import { cn } from '@/lib/utils';

function Scale({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={label}>{label}</Label>
        <span className="num text-sm font-semibold text-accent-ink">
          {value} {suffix}
        </span>
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      <input
        id={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-raised accent-accent"
      />
    </div>
  );
}

function Choice<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={cn(
              'h-11 rounded-full border px-4 text-sm font-medium transition-colors',
              value === option.value
                ? 'border-accent bg-accent text-primary-foreground'
                : 'border-line bg-surface text-muted hover:bg-raised',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function PlateauTool() {
  const [weeksStuck, setWeeksStuck] = useState(6);
  const [sleepHours, setSleepHours] = useState(7);
  const [stress, setStress] = useState<StressLevel>('moderate');
  const [calories, setCalories] = useState<CalorieState>('maintenance');
  const [protein, setProtein] = useState(1.6);
  const [tracksProtein, setTracksProtein] = useState(true);
  const [weeksSinceDeload, setWeeksSinceDeload] = useState(8);
  const [weeksOnProgramme, setWeeksOnProgramme] = useState(12);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [yearsTraining, setYearsTraining] = useState(2);
  const [ran, setRan] = useState(false);

  const causes = useMemo(
    () =>
      diagnose({
        weeksStuck,
        sleepHours,
        stress,
        proteinPerKg: tracksProtein ? protein : null,
        calories,
        weeksSinceDeload,
        weeksOnProgramme,
        sessionsPerWeek,
        yearsTraining,
      }),
    [
      weeksStuck,
      sleepHours,
      stress,
      protein,
      tracksProtein,
      calories,
      weeksSinceDeload,
      weeksOnProgramme,
      sessionsPerWeek,
      yearsTraining,
    ],
  );

  const plan = useMemo(() => breakthroughPlan(causes), [causes]);

  return (
    <div className="space-y-7">
      <section className="surface space-y-6 p-6">
        <Scale label="כמה שבועות תקוע" value={weeksStuck} onChange={setWeeksStuck} min={1} max={26} suffix="שבועות" />
        <Scale
          label="שעות שינה בלילה"
          hint="הממוצע האמיתי, לא זה שאתה מתכוון להגיע אליו."
          value={sleepHours}
          onChange={setSleepHours}
          min={4}
          max={10}
          step={0.5}
          suffix="שעות"
        />
        <Scale label="שבועות מאז ריקון" value={weeksSinceDeload} onChange={setWeeksSinceDeload} min={0} max={30} suffix="שבועות" />
        <Scale label="שבועות על אותה תוכנית" value={weeksOnProgramme} onChange={setWeeksOnProgramme} min={1} max={40} suffix="שבועות" />
        <Scale label="אימונים בשבוע" value={sessionsPerWeek} onChange={setSessionsPerWeek} min={1} max={7} suffix="אימונים" />
        <Scale label="שנות אימון" value={yearsTraining} onChange={setYearsTraining} min={0} max={20} suffix="שנים" />

        <Choice
          legend="עומס נפשי בתקופה הזאת"
          value={stress}
          onChange={setStress}
          options={[
            { value: 'low', label: 'נמוך' },
            { value: 'moderate', label: 'בינוני' },
            { value: 'high', label: 'גבוה' },
          ]}
        />
        <Choice
          legend="איפה אתה תזונתית"
          value={calories}
          onChange={setCalories}
          options={[
            { value: 'deficit', label: 'גירעון' },
            { value: 'maintenance', label: 'תחזוקה' },
            { value: 'surplus', label: 'עודף' },
            { value: 'unknown', label: 'לא יודע' },
          ]}
        />

        <div className="space-y-2">
          <Choice
            legend="חלבון"
            value={tracksProtein ? 'yes' : 'no'}
            onChange={(value) => setTracksProtein(value === 'yes')}
            options={[
              { value: 'yes', label: 'עוקב' },
              { value: 'no', label: 'לא עוקב' },
            ]}
          />
          {tracksProtein && (
            <Scale
              label="גרם חלבון לקילו משקל גוף"
              value={protein}
              onChange={setProtein}
              min={0.5}
              max={3}
              step={0.1}
              suffix="ג׳/ק״ג"
            />
          )}
        </div>

        <Button block size="lg" onClick={() => setRan(true)}>
          מה עוצר אותי
        </Button>
      </section>

      {ran && (
        <>
          <section className="space-y-3">
            <h2 className="section-label">לפי סדר הסבירות</h2>
            {causes.map((cause, index) => (
              <article key={cause.id} className="surface p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="num flex size-7 items-center justify-center rounded-full bg-raised text-xs font-semibold text-accent-ink">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-semibold">{cause.title}</h3>
                  <Badge tone="outline">{AREA_LABEL[cause.area]}</Badge>
                </div>
                <p className="mt-2.5 text-xs text-muted">{cause.evidence}</p>
                <p className="mt-2 text-sm leading-relaxed">{cause.fix}</p>
              </article>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="section-label">שמונה שבועות לשבור את זה</h2>
            <ol className="space-y-2.5">
              {plan.map((week) => (
                <li key={week.index} className="surface p-5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="num text-sm font-semibold text-accent-ink">
                      {week.index}
                    </span>
                    <p className="text-sm font-semibold">{week.headline}</p>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {week.actions.map((action) => (
                      <li key={action} className="flex gap-2 text-xs leading-relaxed text-muted">
                        <span aria-hidden className="text-accent-ink">
                          ·
                        </span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
