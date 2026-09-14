'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { updateProfileAction } from '@/app/actions/auth';
import { onboardingSchema, zodFieldErrors } from '@/lib/validation';
import { AVOCADO_STYLE_OPTIONS, DIFFICULTY_OPTIONS } from '@/lib/labels';
import { RipenessMark } from '@/components/brand/ripeness-mark';
import { AvocadoAvatar } from '@/components/brand/avocado-avatar';
import { AVATAR_PRESETS, DEFAULT_AVATAR } from '@/lib/domain/avatars';
import { cn } from '@/lib/utils';
import type { AvocadoStyle, Difficulty } from '@/lib/domain/types';

export function ProfileForm({
  profileId,
  fullName,
  displayName,
  avatarPreset,
  phone,
  email,
  level,
  style,
  weeklyGoal,
}: {
  profileId: string;
  fullName: string;
  displayName: string;
  avatarPreset: string | null;
  phone: string;
  email: string;
  level: Difficulty;
  style: AvocadoStyle | null;
  weeklyGoal: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>(level);
  const [selectedStyle, setSelectedStyle] = useState<AvocadoStyle>(style ?? 'lean');
  const [selectedGoal, setSelectedGoal] = useState(weeklyGoal);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarPreset ?? DEFAULT_AVATAR.key);

  const submit = (formData: FormData) => {
    const parsed = onboardingSchema.safeParse({
      full_name: String(formData.get('full_name') ?? ''),
      display_name: String(formData.get('display_name') ?? ''),
      avatar_preset: selectedAvatar,
      phone: String(formData.get('phone') ?? ''),
      experience_level: selectedLevel,
      avocado_style: selectedStyle,
      weekly_goal_sessions: selectedGoal,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    formData.set('avatar_preset', selectedAvatar);
    formData.set('experience_level', selectedLevel);
    formData.set('avocado_style', selectedStyle);
    formData.set('weekly_goal_sessions', String(selectedGoal));
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="הפרטים שלי" backHref="/more" />

      <form action={submit} className="surface space-y-7 p-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email-display">אימייל</Label>
          <Input id="email-display" value={email} dir="ltr" disabled className="num" />
          <p className="text-xs text-muted">האימייל משמש להתחברות ולא ניתן לשינוי כאן.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="full_name">שם מלא</Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={fullName}
            aria-invalid={Boolean(errors.full_name)}
            required
          />
          {errors.full_name && (
            <p role="alert" className="text-xs font-medium text-danger">
              {errors.full_name}
            </p>
          )}
        </div>

        {/*
          What the club calls you, as opposed to what the paperwork calls you.
          Other members only ever see this and the avocado below it - never the
          full name above, never the phone.
        */}
        <div className="space-y-1.5">
          <Label htmlFor="display_name">איך קוראים לך במועדון</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={displayName}
            maxLength={24}
            placeholder={fullName.split(' ')[0] || 'הכינוי שלך'}
            aria-invalid={Boolean(errors.display_name)}
          />
          <p className="text-xs text-muted">
            זה מה שאחרים במועדון רואים. אם תשאירו ריק נשתמש בשם הפרטי שלכם.
          </p>
          {errors.display_name && (
            <p role="alert" className="text-xs font-medium text-danger">
              {errors.display_name}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">האבוקדו שלך</legend>
          <p className="text-xs text-muted">
            מצויר, לא מצולם. אף תמונה שלכם לא נשמרת בשום מקום.
          </p>
          <div className="grid grid-cols-5 gap-2 pt-1">
            {AVATAR_PRESETS.map((preset) => {
              const chosen = selectedAvatar === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setSelectedAvatar(preset.key)}
                  aria-pressed={chosen}
                  aria-label={preset.label}
                  title={preset.label}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-lg border transition-all',
                    chosen
                      ? 'border-accent bg-accent/12 shadow-glow-soft'
                      : 'border-line bg-raised hover:border-muted/40',
                  )}
                >
                  <AvocadoAvatar profileId={profileId} preset={preset.key} size={34} />
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="phone">טלפון נייד</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            defaultValue={phone}
            aria-invalid={Boolean(errors.phone)}
            required
          />
          {errors.phone && (
            <p role="alert" className="text-xs font-medium text-danger">
              {errors.phone}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">רמת ניסיון</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedLevel(option.value)}
                aria-pressed={selectedLevel === option.value}
                className={cn(
                  'min-h-[48px] rounded-md border px-2 text-sm font-medium transition-all',
                  selectedLevel === option.value
                    ? 'border-accent bg-accent/12 text-accent-ink shadow-glow-soft'
                    : 'border-line bg-raised text-muted',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">
            רמת הניסיון משפיעה על ההמלצות שתקבלו, ואינה מוצגת למתאמנים אחרים.
          </p>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">האבוקדו שלך</legend>
          <div className="space-y-2.5">
            {AVOCADO_STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedStyle(option.value)}
                aria-pressed={selectedStyle === option.value}
                className={cn(
                  'flex w-full items-center gap-4 rounded-xl border p-4 text-start transition-all',
                  selectedStyle === option.value
                    ? 'border-accent bg-accent/12'
                    : 'border-line bg-raised',
                )}
              >
                <RipenessMark
                  ripeness={selectedStyle === option.value ? 0.85 : 0.25}
                  size={40}
                  title=""
                />
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block text-sm font-semibold',
                      selectedStyle === option.value ? 'text-accent-ink' : 'text-ink',
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
          <legend className="text-sm font-medium">
            יעד שבועי <span className="num text-accent-ink">{selectedGoal}</span> אימונים
          </legend>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedGoal(value)}
                aria-pressed={selectedGoal === value}
                aria-label={`${value} אימונים בשבוע`}
                className={cn(
                  'num min-h-[48px] rounded-xl border text-sm font-semibold transition-all',
                  selectedGoal === value
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-raised text-muted',
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        <Button type="submit" block size="lg" loading={pending}>
          שמירת השינויים
        </Button>
      </form>

      <p className="flex items-start gap-2 rounded-md border border-line bg-surface p-3 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
        מספר הטלפון ונתוני האימון שלכם גלויים לכם ולצוות GLoW בלבד, ולעולם לא נחשפים בקישורי הזמנה
        ציבוריים.
      </p>
    </div>
  );
}
