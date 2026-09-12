'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BatteryCharging, Check, HeartPulse, Moon, Pencil, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { saveReadinessAction } from '@/app/actions/readiness';
import { DURATION_OPTIONS } from '@/lib/domain/recommend';
import { cn } from '@/lib/utils';
import type { ReadinessLog } from '@/lib/domain/types';

const SCALES = [
  {
    key: 'energy' as const,
    label: 'אנרגיה',
    icon: BatteryCharging,
    hints: ['מותשת', 'נמוכה', 'בסדר', 'טובה', 'מצוינת'],
  },
  {
    key: 'soreness' as const,
    label: 'כאבי שרירים',
    icon: HeartPulse,
    hints: ['אין', 'קלים', 'בינוניים', 'חזקים', 'מאוד חזקים'],
  },
  {
    key: 'sleep_quality' as const,
    label: 'איכות שינה',
    icon: Moon,
    hints: ['גרועה', 'לא טובה', 'סבירה', 'טובה', 'מצוינת'],
  },
];

export function ReadinessCheck({ existing }: { existing: ReadinessLog | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(!existing);
  const [values, setValues] = useState({
    energy: existing?.energy ?? 3,
    soreness: existing?.soreness ?? 2,
    sleep_quality: existing?.sleep_quality ?? 3,
    available_minutes: existing?.available_minutes ?? 45,
    note: existing?.note ?? '',
  });

  const save = () => {
    startTransition(async () => {
      const result = await saveReadinessAction(values);
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      toast({ title: result.message, tone: 'success' });
      setEditing(false);
      router.refresh();
    });
  };

  if (!editing && existing) {
    const lowReadiness = existing.energy <= 2 || existing.soreness >= 4 || existing.sleep_quality <= 2;
    return (
      <section className="surface p-4" aria-labelledby="readiness-title">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 id="readiness-title" className="flex items-center gap-1.5 text-sm font-bold">
              <Check className="size-4 text-success" aria-hidden />
              בדיקת המוכנות היומית הושלמה
            </h2>
            <p className="mt-1 text-xs text-muted">
              אנרגיה <span className="num font-bold text-ink">{existing.energy}</span> · כאבים{' '}
              <span className="num font-bold text-ink">{existing.soreness}</span> · שינה{' '}
              <span className="num font-bold text-ink">{existing.sleep_quality}</span> · זמן פנוי{' '}
              <span className="num font-bold text-ink">{existing.available_minutes}</span> דק׳
            </p>
            {lowReadiness && (
              <p className="mt-2 rounded-md border border-warning/40 bg-warning/10 px-2.5 py-2 text-xs font-semibold text-warning">
                המוכנות שלך היום נמוכה. שווה לשקול מוביליטי, עבודת טכניקה או אימון קצר.
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="עדכון הדיווח" onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="surface p-4" aria-labelledby="readiness-form-title">
      <h2 id="readiness-form-title" className="section-label">
        איך אתם מרגישים היום?
      </h2>
      <p className="mt-0.5 text-xs text-muted">פחות מ-20 שניות, ומשפר את ההמלצות שלכם.</p>

      <div className="mt-4 space-y-4">
        {SCALES.map((scale) => {
          const Icon = scale.icon;
          const current = values[scale.key];
          return (
            <fieldset key={scale.key}>
              <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Icon className="size-3.5" aria-hidden />
                {scale.label}
                <span className="text-ink">· {scale.hints[current - 1]}</span>
              </legend>
              <div className="flex gap-1.5" role="radiogroup" aria-label={scale.label}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={current === value}
                    aria-label={`${scale.label} ${value} מתוך 5 - ${scale.hints[value - 1]}`}
                    onClick={() => setValues((v) => ({ ...v, [scale.key]: value }))}
                    className={cn(
                      'num h-11 flex-1 rounded-md border text-sm font-bold transition-all',
                      current === value
                        ? 'border-accent bg-accent/12 text-accent shadow-glow-soft'
                        : 'border-line bg-raised text-muted hover:text-ink',
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </fieldset>
          );
        })}

        <fieldset>
          <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Timer className="size-3.5" aria-hidden />
            כמה זמן יש לכם להתאמן
          </legend>
          <div className="flex gap-1.5" role="radiogroup" aria-label="זמן פנוי לאימון">
            {DURATION_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                role="radio"
                aria-checked={values.available_minutes === minutes}
                onClick={() => setValues((v) => ({ ...v, available_minutes: minutes }))}
                className={cn(
                  'num h-11 flex-1 rounded-md border text-sm font-bold transition-all',
                  values.available_minutes === minutes
                    ? 'border-accent bg-accent/12 text-accent shadow-glow-soft'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {minutes}׳
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="readiness-note" className="text-xs font-semibold text-muted">
            הערה (לא חובה)
          </Label>
          <Input
            id="readiness-note"
            value={values.note}
            maxLength={280}
            placeholder="למשל: כתף ימין רגישה"
            onChange={(event) => setValues((v) => ({ ...v, note: event.target.value }))}
          />
        </div>

        <div className="flex gap-2">
          <Button block loading={pending} onClick={save}>
            שמירת הדיווח
          </Button>
          {existing && (
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={pending}>
              ביטול
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
