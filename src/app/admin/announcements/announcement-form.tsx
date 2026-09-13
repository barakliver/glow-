'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Megaphone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { sendAnnouncementAction } from '@/app/actions/notifications';
import { relativeHebrew } from '@/lib/time';

export function AnnouncementForm({
  recipientCount,
  provider,
  recent,
}: {
  recipientCount: number;
  provider: string;
  recent: { id: string; title: string; body: string; createdAt: string }[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendAnnouncementAction(formData);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="display text-2xl tracking-tight">הודעה לכל המתאמנים</h1>
        <p className="text-sm text-muted">
          ההודעה תופיע במרכז ההתראות של {Math.max(0, recipientCount)} מתאמנים פעילים.
        </p>
      </div>

      {provider === 'לא מוגדר' && (
        <p className="flex items-start gap-2 rounded-md border border-warning/35 bg-warning/8 p-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          שירות האימייל לא מוגדר. ההודעה תישמר במרכז ההתראות באפליקציה, וסטטוס המשלוח יירשם
          כ&quot;לא נשלח בדוא&quot;ל&quot;.
        </p>
      )}

      <form ref={formRef} action={submit} className="surface space-y-4 p-4">
        <div className="space-y-1.5">
          <Label htmlFor="ann-title">כותרת</Label>
          <Input
            id="ann-title"
            name="title"
            maxLength={80}
            placeholder="למשל: שינוי בשעות הפתיחה בשישי"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ann-body">תוכן ההודעה</Label>
          <Textarea
            id="ann-body"
            name="body"
            maxLength={600}
            placeholder="כתבו כאן את ההודעה. שמרו על קצר וברור."
            required
          />
        </div>
        <Button type="submit" block size="lg" loading={pending}>
          <Send className="size-4" aria-hidden />
          שליחת ההודעה
        </Button>
      </form>

      {recent.length > 0 && (
        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="section-label mb-2 block">
            הודעות אחרונות
          </h2>
          <ul className="space-y-2">
            {recent.map((item) => (
              <li key={item.id} className="surface p-3.5">
                <div className="flex items-start gap-2">
                  <Megaphone className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{item.body}</p>
                    <p className="mt-1 text-[11px] text-muted">{relativeHebrew(item.createdAt)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
