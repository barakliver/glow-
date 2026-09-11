'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Link2, Plus, QrCode as QrIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ShareActions } from '@/components/share/share-actions';
import { QrCode } from '@/components/share/qr-code';
import { createInviteAction, revokeInviteAction } from '@/app/actions/admin';
import { inviteFormSchema, zodFieldErrors } from '@/lib/validation';
import { formatHebrewFullDate } from '@/lib/time';
import type { InviteLink } from '@/lib/domain/types';

export function InviteManager({ invites, appUrl }: { invites: InviteLink[]; appUrl: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [values, setValues] = useState({ label: '', expires_at: '', max_uses: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const urlFor = (token: string) => `${appUrl}/invite/${token}`;

  const submit = () => {
    const payload = {
      label: values.label,
      expires_at: values.expires_at,
      max_uses: values.max_uses.trim() === '' ? null : Number(values.max_uses),
    };
    const parsed = inviteFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    startTransition(async () => {
      const result = await createInviteAction(payload);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setOpen(false);
        setValues({ label: '', expires_at: '', max_uses: '' });
        router.refresh();
      }
    });
  };

  const revoke = (inviteId: string) => {
    startTransition(async () => {
      const result = await revokeInviteAction(inviteId);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const stateOf = (invite: InviteLink) => {
    if (invite.revoked) return { label: 'בוטלה', tone: 'danger' as const };
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now())
      return { label: 'פג תוקף', tone: 'neutral' as const };
    if (invite.max_uses !== null && invite.uses >= invite.max_uses)
      return { label: 'נוצלה', tone: 'neutral' as const };
    return { label: 'פעילה', tone: 'success' as const };
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">קישורי הזמנה</h1>
          <p className="text-sm text-muted">
            מי שמקבל את הקישור רואה את הלוח המפורסם. פרטי המתאמנים אינם נחשפים.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="size-4" aria-hidden />
          הזמנה חדשה
        </Button>
      </div>

      {invites.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="אין עדיין קישורי הזמנה"
          description="צרו קישור ושתפו אותו בוואטסאפ כדי לצרף חברים למועדון."
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              יצירת קישור ראשון
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {invites.map((invite) => {
            const state = stateOf(invite);
            return (
              <li key={invite.id} className="surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-bold">{invite.label}</h2>
                      <Badge tone={state.tone}>{state.label}</Badge>
                    </div>
                    <p className="num mt-1 break-all text-[11px] text-muted" dir="ltr">
                      {urlFor(invite.token)}
                    </p>
                    <p className="num mt-1 text-[11px] text-muted">
                      {invite.uses} שימושים
                      {invite.max_uses !== null && ` מתוך ${invite.max_uses}`}
                      {invite.expires_at && ` · בתוקף עד ${formatHebrewFullDate(invite.expires_at)}`}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => setQrToken(invite.token)}>
                      <QrIcon className="size-4" aria-hidden />
                      QR
                    </Button>
                    {!invite.revoked && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={pending}>
                            <Ban className="size-4" aria-hidden />
                            ביטול
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>לבטל את ההזמנה?</AlertDialogTitle>
                            <AlertDialogDescription>
                              הקישור יפסיק לעבוד מיידית. מי שכבר הצטרף יישאר חבר במועדון.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogAction onClick={() => revoke(invite.id)}>
                              כן, בטלו
                            </AlertDialogAction>
                            <AlertDialogCancel>השאירו פעיל</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                {!invite.revoked && (
                  <div className="mt-3 border-t border-line pt-3">
                    <ShareActions
                      url={urlFor(invite.token)}
                      title="הזמנה למועדון GLoW"
                      text="הוזמנת ללוח האימונים של GLoW"
                      compact
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>קישור הזמנה חדש</DialogTitle>
            <DialogDescription>
              אפשר להגביל את הקישור בתאריך תפוגה ובמספר שימושים, ולבטל אותו בכל רגע.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="invite-label">כותרת פנימית</Label>
              <Input
                id="invite-label"
                value={values.label}
                placeholder="למשל: חברים מהעבודה"
                onChange={(event) => setValues((v) => ({ ...v, label: event.target.value }))}
                aria-invalid={Boolean(errors.label)}
              />
              {errors.label && (
                <p role="alert" className="text-xs font-semibold text-danger">
                  {errors.label}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="invite-expires">תאריך תפוגה</Label>
                <Input
                  id="invite-expires"
                  type="date"
                  dir="ltr"
                  className="num"
                  value={values.expires_at}
                  onChange={(event) => setValues((v) => ({ ...v, expires_at: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-max">מספר שימושים</Label>
                <Input
                  id="invite-max"
                  type="number"
                  min="1"
                  dir="ltr"
                  className="num"
                  placeholder="ללא הגבלה"
                  value={values.max_uses}
                  onChange={(event) => setValues((v) => ({ ...v, max_uses: event.target.value }))}
                />
              </div>
            </div>
          </div>
          <Button block size="lg" className="mt-4" onClick={submit} loading={pending}>
            יצירת הקישור
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(qrToken)} onOpenChange={(value) => !value && setQrToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>קוד QR להזמנה</DialogTitle>
            <DialogDescription>
              אפשר להדפיס את הקוד או להציג אותו במכשיר כדי שיסרקו אותו.
            </DialogDescription>
          </DialogHeader>
          {qrToken && (
            <div className="flex flex-col items-center gap-3 py-2">
              <QrCode value={urlFor(qrToken)} size={220} />
              <p className="num break-all text-center text-[11px] text-muted" dir="ltr">
                {urlFor(qrToken)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
