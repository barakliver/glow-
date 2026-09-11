'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpToLine,
  Check,
  Clock3,
  Phone,
  QrCode as QrIcon,
  UserMinus,
  UserX,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { QrCode } from '@/components/share/qr-code';
import { ShareActions } from '@/components/share/share-actions';
import {
  adminCancelBookingAction,
  markAttendanceAction,
  setBookingStatusAction,
} from '@/app/actions/admin';
import { BOOKING_STATUS_LABELS, CATEGORY_LABELS } from '@/lib/labels';
import { formatHebrewDate, formatTime } from '@/lib/time';
import type { BookingStatus, ClassWithMeta } from '@/lib/domain/types';

interface Row {
  bookingId: string;
  profileId: string;
  name: string;
  phone: string | null;
  status: BookingStatus;
  waitlistPosition: number | null;
}

export function ClassRoster({
  gymClass,
  rows,
  canManage,
  checkinUrl,
}: {
  gymClass: ClassWithMeta;
  rows: Row[];
  canManage: boolean;
  checkinUrl: string;
  attendanceCount: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [qrOpen, setQrOpen] = useState(false);

  const confirmed = rows.filter((row) => ['confirmed', 'attended', 'absent'].includes(row.status));
  const waitlisted = rows.filter((row) => row.status === 'waitlisted');

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) => {
    startTransition(async () => {
      const result = await fn();
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={gymClass.title}
        subtitle={`${formatHebrewDate(gymClass.starts_at)} · ${formatTime(gymClass.starts_at)}`}
        backHref="/admin/schedule"
        action={
          canManage ? (
            <Button variant="secondary" size="sm" onClick={() => setQrOpen(true)}>
              <QrIcon className="size-4" aria-hidden />
              קוד צ׳ק-אין
            </Button>
          ) : undefined
        }
      />

      <section className="surface grid grid-cols-3 gap-2 p-3.5" aria-label="סיכום">
        <Stat label="רשומים" value={`${gymClass.confirmed_count}/${gymClass.capacity}`} />
        <Stat label="רשימת המתנה" value={String(gymClass.waitlist_count)} />
        <Stat label="סוג" value={CATEGORY_LABELS[gymClass.category]} />
      </section>

      {!canManage && (
        <p className="rounded-md border border-warning/35 bg-warning/8 p-3 text-xs text-warning">
          אתם צופים בלבד. ניתן לנהל את הרשימה רק בשיעורים שאתם משובצים אליהם.
        </p>
      )}

      <section aria-labelledby="confirmed-title" className="space-y-2">
        <h2 id="confirmed-title" className="text-sm font-bold">
          משתתפים רשומים ({confirmed.length})
        </h2>
        {confirmed.length === 0 ? (
          <EmptyState icon={Users} title="אין עדיין רישומים לשיעור הזה" />
        ) : (
          <ul className="space-y-2">
            {confirmed.map((row) => (
              <li key={row.bookingId} className="surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{row.name}</p>
                    {row.phone && (
                      <a
                        href={`tel:${row.phone}`}
                        className="num mt-0.5 inline-flex items-center gap-1 text-xs text-muted hover:text-accent"
                        dir="ltr"
                      >
                        <Phone className="size-3" aria-hidden />
                        {row.phone}
                      </a>
                    )}
                  </div>
                  <Badge
                    tone={
                      row.status === 'attended'
                        ? 'success'
                        : row.status === 'absent'
                          ? 'danger'
                          : 'accent'
                    }
                  >
                    {BOOKING_STATUS_LABELS[row.status]}
                  </Badge>
                </div>

                {canManage && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <Button
                      variant={row.status === 'attended' ? 'success' : 'secondary'}
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(() => markAttendanceAction(gymClass.id, row.profileId, true))
                      }
                    >
                      <Check className="size-4" aria-hidden />
                      נכח
                    </Button>
                    <Button
                      variant={row.status === 'absent' ? 'danger' : 'secondary'}
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(() => markAttendanceAction(gymClass.id, row.profileId, false))
                      }
                    >
                      <UserX className="size-4" aria-hidden />
                      לא הגיע
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(() => setBookingStatusAction(gymClass.id, row.bookingId, 'waitlisted'))
                      }
                    >
                      <Clock3 className="size-4" aria-hidden />
                      העברה להמתנה
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <UserMinus className="size-4" aria-hidden />
                          הסרה
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>להסיר את {row.name} מהשיעור?</AlertDialogTitle>
                          <AlertDialogDescription>
                            המקום ישוחרר והמתאמן הראשון ברשימת ההמתנה יקודם אוטומטית.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogAction
                            onClick={() =>
                              run(() => adminCancelBookingAction(gymClass.id, row.profileId))
                            }
                          >
                            כן, הסירו
                          </AlertDialogAction>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="waitlist-title" className="space-y-2">
        <h2 id="waitlist-title" className="text-sm font-bold">
          רשימת המתנה ({waitlisted.length})
        </h2>
        {waitlisted.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-surface/50 p-4 text-center text-xs text-muted">
            אין מתאמנים ברשימת ההמתנה.
          </p>
        ) : (
          <ul className="space-y-2">
            {waitlisted.map((row) => (
              <li
                key={row.bookingId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    <span className="num text-warning">#{row.waitlistPosition}</span> {row.name}
                  </p>
                  {row.phone && (
                    <a
                      href={`tel:${row.phone}`}
                      className="num text-xs text-muted hover:text-accent"
                      dir="ltr"
                    >
                      {row.phone}
                    </a>
                  )}
                </div>
                {canManage && (
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        run(() => setBookingStatusAction(gymClass.id, row.bookingId, 'confirmed'))
                      }
                    >
                      <ArrowUpToLine className="size-4" aria-hidden />
                      קידום
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => run(() => adminCancelBookingAction(gymClass.id, row.profileId))}
                    >
                      <UserMinus className="size-4" aria-hidden />
                      הסרה
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>קוד צ׳ק-אין לשיעור</DialogTitle>
            <DialogDescription>
              המתאמנים סורקים את הקוד בכניסה. הצ׳ק-אין מתבצע רק אם יש להם רישום מאושר לשיעור הזה.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-2">
            <QrCode value={checkinUrl} size={200} />
            <p className="num break-all text-center text-[11px] text-muted" dir="ltr">
              {checkinUrl}
            </p>
          </div>
          <ShareActions
            url={checkinUrl}
            title={`צ׳ק-אין · ${gymClass.title}`}
            text={`צ׳ק-אין לשיעור ${gymClass.title}`}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="num text-lg font-extrabold">{value}</p>
      <p className="label-muted">{label}</p>
    </div>
  );
}
