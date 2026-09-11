'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { saveNotificationPreferencesAction } from '@/app/actions/notifications';
import { NOTIFICATION_LABELS } from '@/lib/labels';
import type { NotificationPreferences, NotificationType } from '@/lib/domain/types';

const TYPES: { key: NotificationType; description: string }[] = [
  { key: 'booking_confirmed', description: 'כשנרשמתם לשיעור או נוספתם לרשימת המתנה' },
  { key: 'waitlist_promoted', description: 'כשהתפנה מקום וקודמתם מרשימת ההמתנה' },
  { key: 'class_cancelled', description: 'כששיעור שנרשמתם אליו בוטל' },
  { key: 'class_time_changed', description: 'כשהשעה של שיעור השתנתה' },
  { key: 'class_reminder', description: 'תזכורת לפני תחילת השיעור' },
  { key: 'schedule_published', description: 'כשפורסם לוח שבועי חדש' },
  { key: 'announcement', description: 'הודעות מהמאמנים ומהמועדון' },
];

export function NotificationPreferencesForm({
  preferences,
  provider,
}: {
  preferences: NotificationPreferences;
  provider: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<NotificationPreferences>(preferences);

  const save = () => {
    startTransition(async () => {
      const result = await saveNotificationPreferencesAction(values);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="העדפות התראות"
        subtitle="בחרו אילו עדכונים יגיעו אליכם"
        backHref="/more"
      />

      <section className="surface divide-y divide-line">
        {TYPES.map((type) => (
          <div key={type.key} className="flex items-center justify-between gap-3 p-3.5">
            <div className="min-w-0">
              <p className="text-sm font-bold">{NOTIFICATION_LABELS[type.key]}</p>
              <p className="text-xs text-muted">{type.description}</p>
            </div>
            <Switch
              checked={values[type.key]}
              onCheckedChange={(checked) => setValues((v) => ({ ...v, [type.key]: checked }))}
              aria-label={NOTIFICATION_LABELS[type.key]}
            />
          </div>
        ))}
      </section>

      <section className="surface p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <Mail className="size-4 text-muted" aria-hidden />
              קבלת התראות גם באימייל
            </p>
            <p className="text-xs text-muted">
              {provider === 'לא מוגדר'
                ? 'שירות האימייל עדיין לא מוגדר. ההתראות יישמרו במרכז ההתראות בלבד.'
                : `ההתראות יישלחו דרך ${provider}.`}
            </p>
          </div>
          <Switch
            checked={values.email_enabled}
            onCheckedChange={(checked) => setValues((v) => ({ ...v, email_enabled: checked }))}
            aria-label="קבלת התראות באימייל"
          />
        </div>
      </section>

      <Button block size="lg" onClick={save} loading={pending}>
        שמירת ההעדפות
      </Button>
    </div>
  );
}
