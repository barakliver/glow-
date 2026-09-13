'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CalendarX,
  CheckCheck,
  Clock3,
  Megaphone,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from '@/app/actions/notifications';
import { NOTIFICATION_LABELS } from '@/lib/labels';
import { relativeHebrew } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { AppNotification, NotificationType } from '@/lib/domain/types';

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  booking_confirmed: CheckCheck,
  waitlist_promoted: Sparkles,
  class_cancelled: CalendarX,
  class_time_changed: CalendarClock,
  class_reminder: Clock3,
  schedule_published: CalendarClock,
  announcement: Megaphone,
};

export function NotificationCenter({
  notifications,
  provider,
}: {
  notifications: AppNotification[];
  provider: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const unread = notifications.filter((n) => !n.read_at);

  const markAll = () => {
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      toast({ title: result.message, tone: 'success' });
      router.refresh();
    });
  };

  const markOne = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="התראות"
        subtitle={unread.length > 0 ? `${unread.length} התראות שלא נקראו` : 'הכול מעודכן'}
        backHref="/"
        action={
          unread.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={markAll} loading={pending}>
              <CheckCheck className="size-4" aria-hidden />
              סימון הכול
            </Button>
          ) : undefined
        }
      />

      {provider === 'לא מוגדר' && (
        <p className="flex items-start gap-2 rounded-md border border-warning/35 bg-warning/8 p-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          שירות האימייל לא מוגדר, לכן ההתראות נשמרות כאן בלבד וסטטוס השליחה שלהן מסומן בהתאם.
        </p>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="אין התראות"
          description="כאן יופיעו אישורי רישום, קידום מרשימת המתנה, שינויים בשיעורים והודעות מהמאמן."
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => {
            const Icon = ICONS[notification.type];
            const unreadItem = !notification.read_at;
            const body = (
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md',
                    unreadItem ? 'bg-accent/12 text-accent-ink' : 'bg-raised text-muted',
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm', unreadItem ? 'font-bold' : 'font-semibold text-muted')}>
                      {notification.title}
                    </p>
                    {unreadItem && <Badge tone="accent">חדש</Badge>}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{notification.body}</p>
                  <p className="mt-1 text-[11px] text-muted">
                    {NOTIFICATION_LABELS[notification.type]} ·{' '}
                    {relativeHebrew(notification.created_at)}
                    {notification.delivery_status === 'sent' && ' · נשלח במייל'}
                    {notification.delivery_status === 'failed' && ' · שליחת המייל נכשלה'}
                  </p>
                </div>
              </div>
            );

            return (
              <li key={notification.id}>
                <div
                  className={cn(
                    'rounded-lg border bg-surface p-3.5 transition-colors',
                    unreadItem ? 'border-accent/35' : 'border-line',
                  )}
                >
                  {notification.link ? (
                    <Link
                      href={notification.link}
                      onClick={() => unreadItem && markOne(notification.id)}
                      className="block rounded"
                    >
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                  {unreadItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => markOne(notification.id)}
                    >
                      סימון כנקרא
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
