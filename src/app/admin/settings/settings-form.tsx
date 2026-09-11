'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Database, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { saveGymSettingsAction } from '@/app/actions/admin';
import { gymSettingsSchema, zodFieldErrors } from '@/lib/validation';
import { formatDuration } from '@/lib/time';

export function GymSettingsForm({
  organization,
  emailProvider,
  demoMode,
}: {
  organization: {
    name: string;
    booking_cutoff_minutes: number;
    cancel_cutoff_minutes: number;
    waitlist_enabled: boolean;
    timezone: string;
  };
  emailProvider: string;
  demoMode: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: organization.name,
    booking_cutoff_minutes: String(organization.booking_cutoff_minutes),
    cancel_cutoff_minutes: String(organization.cancel_cutoff_minutes),
    waitlist_enabled: organization.waitlist_enabled,
  });

  const submit = () => {
    const payload = {
      name: values.name,
      booking_cutoff_minutes: Number(values.booking_cutoff_minutes),
      cancel_cutoff_minutes: Number(values.cancel_cutoff_minutes),
      waitlist_enabled: values.waitlist_enabled,
    };
    const parsed = gymSettingsSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await saveGymSettingsAction(payload);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">הגדרות המועדון</h1>
        <p className="text-sm text-muted">חוקי ההרשמה והביטול חלים על כל השיעורים.</p>
      </div>

      <section className="surface space-y-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="gym-name">שם המועדון</Label>
          <Input
            id="gym-name"
            value={values.name}
            maxLength={40}
            onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p role="alert" className="text-xs font-semibold text-danger">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-cutoff">סגירת הרשמה לפני תחילת השיעור (דקות)</Label>
          <Input
            id="booking-cutoff"
            type="number"
            min="0"
            max="10080"
            dir="ltr"
            className="num"
            value={values.booking_cutoff_minutes}
            onChange={(event) =>
              setValues((v) => ({ ...v, booking_cutoff_minutes: event.target.value }))
            }
          />
          <p className="text-xs text-muted">
            כרגע: {formatDuration(Number(values.booking_cutoff_minutes) || 0)} לפני תחילת השיעור.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cancel-cutoff">סגירת ביטול לפני תחילת השיעור (דקות)</Label>
          <Input
            id="cancel-cutoff"
            type="number"
            min="0"
            max="10080"
            dir="ltr"
            className="num"
            value={values.cancel_cutoff_minutes}
            onChange={(event) =>
              setValues((v) => ({ ...v, cancel_cutoff_minutes: event.target.value }))
            }
          />
          <p className="text-xs text-muted">
            כרגע: {formatDuration(Number(values.cancel_cutoff_minutes) || 0)} לפני תחילת השיעור.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-raised p-3">
          <div>
            <p className="text-sm font-semibold">רשימת המתנה</p>
            <p className="text-xs text-muted">
              כששיעור מתמלא, מתאמנים נוספים נכנסים לתור ומקודמים אוטומטית כשמתפנה מקום.
            </p>
          </div>
          <Switch
            checked={values.waitlist_enabled}
            onCheckedChange={(checked) => setValues((v) => ({ ...v, waitlist_enabled: checked }))}
            aria-label="הפעלת רשימת המתנה"
          />
        </div>

        <Button block size="lg" onClick={submit} loading={pending}>
          שמירת ההגדרות
        </Button>
      </section>

      <section className="surface space-y-3 p-4">
        <h2 className="text-sm font-bold">תצורת מערכת</h2>
        <InfoRow icon={Globe} label="אזור זמן" value={`${organization.timezone} · שבוע מתחיל ביום ראשון`} />
        <InfoRow icon={Mail} label="שירות אימייל" value={emailProvider} />
        <InfoRow
          icon={Database}
          label="מקור נתונים"
          value={demoMode ? 'מצב הדגמה (נתונים בזיכרון)' : 'Supabase'}
        />
        {demoMode && (
          <div className="space-y-2 rounded-md border border-warning/30 bg-warning/8 p-3 text-xs text-warning">
            <p>
              מצב הדגמה פעיל כי לא הוגדרו פרטי Supabase. כל השינויים נשמרים בזיכרון השרת ונמחקים
              בהפעלה מחדש.
            </p>
            <p className="font-bold">
              לפני שמזמינים מתאמנים אמיתיים חובה לחבר Supabase, אחרת הרישומים והאימונים לא יישמרו.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-raised px-3 py-2.5">
      <span className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Icon className="size-4" aria-hidden />
        {label}
      </span>
      <span className="truncate text-xs font-bold">{value}</span>
    </div>
  );
}
