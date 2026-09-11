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
import { DIFFICULTY_OPTIONS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Difficulty } from '@/lib/domain/types';

export function ProfileForm({
  fullName,
  phone,
  email,
  level,
}: {
  fullName: string;
  phone: string;
  email: string;
  level: Difficulty;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedLevel, setSelectedLevel] = useState<Difficulty>(level);

  const submit = (formData: FormData) => {
    const parsed = onboardingSchema.safeParse({
      full_name: String(formData.get('full_name') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      experience_level: selectedLevel,
    });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    formData.set('experience_level', selectedLevel);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="הפרטים שלי" backHref="/more" />

      <form action={submit} className="surface space-y-5 p-4" noValidate>
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
            <p role="alert" className="text-xs font-semibold text-danger">
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
            dir="ltr"
            defaultValue={phone}
            aria-invalid={Boolean(errors.phone)}
            required
          />
          {errors.phone && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {errors.phone}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">רמת ניסיון</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedLevel(option.value)}
                aria-pressed={selectedLevel === option.value}
                className={cn(
                  'min-h-[48px] rounded-md border px-2 text-sm font-semibold transition-all',
                  selectedLevel === option.value
                    ? 'border-accent bg-accent/12 text-accent shadow-glow-soft'
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
