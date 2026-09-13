'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { AVOCADO_STYLE_OPTIONS, DIFFICULTY_OPTIONS } from '@/lib/labels';
import { RipenessMark } from '@/components/brand/ripeness-mark';
import { completeOnboardingAction } from '@/app/actions/auth';
import { onboardingSchema, zodFieldErrors } from '@/lib/validation';
import type { AvocadoStyle, Difficulty } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

export function OnboardingForm({
  defaultName,
  defaultPhone,
  defaultLevel,
  defaultStyle,
  defaultWeeklyGoal,
}: {
  defaultName: string;
  defaultPhone: string;
  defaultLevel: Difficulty;
  defaultStyle: AvocadoStyle | null;
  defaultWeeklyGoal: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [level, setLevel] = useState<Difficulty>(defaultLevel);
  const [style, setStyle] = useState<AvocadoStyle>(defaultStyle ?? 'lean');
  const [weeklyGoal, setWeeklyGoal] = useState(defaultWeeklyGoal);

  const submit = (formData: FormData) => {
    const values = {
      full_name: String(formData.get('full_name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      experience_level: level,
      avocado_style: style,
      weekly_goal_sessions: weeklyGoal,
    };
    const parsed = onboardingSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    formData.set('experience_level', level);
    formData.set('avocado_style', style);
    formData.set('weekly_goal_sessions', String(weeklyGoal));
    startTransition(async () => {
      const result = await completeOnboardingAction(formData);
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      toast({ title: 'ברוכים הבאים ל-GLoW', tone: 'success' });
      router.replace('/');
      router.refresh();
    });
  };

  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-7 text-center">
        <Logo size="lg" stacked className="justify-center" />
        <h1 className="mt-4 text-xl font-extrabold">כמה פרטים ונתחיל</h1>
        <p className="mt-1 text-sm text-muted">
          השם והטלפון משמשים את המאמן בלבד ואינם מוצגים במקומות ציבוריים.
        </p>
      </div>

      <form action={submit} className="surface space-y-5 p-5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="full_name">שם מלא</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={defaultName}
            autoComplete="name"
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? 'name-error' : undefined}
            required
          />
          {errors.full_name && (
            <p id="name-error" role="alert" className="text-xs font-semibold text-danger">
              {errors.full_name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">טלפון נייד</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="050-1234567"
            defaultValue={defaultPhone}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            required
          />
          {errors.phone && (
            <p id="phone-error" role="alert" className="text-xs font-semibold text-danger">
              {errors.phone}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">רמת ניסיון באימונים</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLevel(option.value)}
                aria-pressed={level === option.value}
                className={cn(
                  'min-h-[48px] rounded-md border px-2 py-2 text-sm font-semibold transition-all',
                  level === option.value
                    ? 'border-accent bg-accent/12 text-accent-ink shadow-glow-soft'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">איזה אבוקדו אתם?</legend>
          <p className="text-xs text-muted">
            זה קובע מה נמליץ לכם ואיך נספור את ההתקדמות. אפשר לשנות מתי שרוצים.
          </p>
          <div className="space-y-2.5">
            {AVOCADO_STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStyle(option.value)}
                aria-pressed={style === option.value}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-start transition-all',
                  style === option.value
                    ? 'border-accent bg-accent/12'
                    : 'border-line bg-raised hover:border-accent/30',
                )}
              >
                <RipenessMark
                  ripeness={style === option.value ? 0.85 : 0.25}
                  size={44}
                  title=""
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm font-bold',
                      style === option.value ? 'text-accent-ink' : 'text-ink',
                    )}
                  >
                    {option.name}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">
                    {option.blurb}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">
            כמה אימונים בשבוע? <span className="num text-accent-ink">{weeklyGoal}</span>
          </legend>
          <p className="text-xs text-muted">
            יעד ולא מכסה. הוא נספר בדף הבית, ואף אחד לא ננזף על שבוע חלש.
          </p>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setWeeklyGoal(value)}
                aria-pressed={weeklyGoal === value}
                aria-label={`${value} אימונים בשבוע`}
                className={cn(
                  'num min-h-[48px] rounded-xl border text-sm font-bold transition-all',
                  weeklyGoal === value
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-raised text-muted hover:text-ink',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <Button type="submit" block size="lg" loading={pending}>
          סיימתי, קחו אותי פנימה
          <ArrowLeft className="size-4" aria-hidden />
        </Button>
      </form>
    </main>
  );
}
