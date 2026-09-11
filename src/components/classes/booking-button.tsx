'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock3, Hourglass, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/components/ui/toast';
import { bookClassAction, cancelBookingAction, getClassCapacityAction } from '@/app/actions/booking';
import type { ClassAvailability } from '@/lib/domain/types';

type LocalState = 'idle' | 'booked' | 'waitlisted';

export function BookingButton({
  classId,
  availability,
  waitlistPosition,
  size = 'md',
  block = true,
}: {
  classId: string;
  availability: ClassAvailability;
  waitlistPosition?: number | null;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const initial: LocalState =
    availability === 'booked' ? 'booked' : availability === 'waitlisted' ? 'waitlisted' : 'idle';
  const [state, setState] = useState<LocalState>(initial);
  // Optimistic state is reconciled against the server response below.
  const [optimistic, setOptimistic] = useOptimistic<LocalState, LocalState>(
    state,
    (_current, next) => next,
  );

  const disabled =
    availability === 'cancelled' || availability === 'past' || availability === 'closed';

  const book = () => {
    const predicted: LocalState = availability === 'full' ? 'waitlisted' : 'booked';
    startTransition(async () => {
      setOptimistic(predicted);
      const result = await bookClassAction(classId);
      if (!result.ok) {
        // Reconcile: drop the optimistic value and show why it failed.
        setState(initial);
        toast({ title: 'הרישום לא בוצע', description: result.message, tone: 'error' });
        router.refresh();
        return;
      }
      const actual: LocalState = result.data?.status === 'waitlisted' ? 'waitlisted' : 'booked';
      setState(actual);
      toast({
        title: actual === 'booked' ? 'נרשמת לשיעור' : 'נוספת לרשימת ההמתנה',
        description: result.message,
        tone: 'success',
      });
      // Pull the authoritative capacity so the card never drifts.
      await getClassCapacityAction(classId);
      router.refresh();
    });
  };

  const cancel = () => {
    startTransition(async () => {
      setOptimistic('idle');
      const result = await cancelBookingAction(classId);
      if (!result.ok) {
        setState(initial);
        toast({ title: 'הביטול לא בוצע', description: result.message, tone: 'error' });
        router.refresh();
        return;
      }
      setState('idle');
      toast({ title: 'הרישום בוטל', description: result.message, tone: 'success' });
      router.refresh();
    });
  };

  if (disabled) {
    return (
      <Button variant="secondary" size={size} block={block} disabled>
        {availability === 'cancelled'
          ? 'השיעור בוטל'
          : availability === 'closed'
            ? 'ההרשמה סגורה'
            : 'השיעור הסתיים'}
      </Button>
    );
  }

  if (optimistic === 'booked' || optimistic === 'waitlisted') {
    const label =
      optimistic === 'booked'
        ? 'רשום לשיעור'
        : `ברשימת המתנה${waitlistPosition ? ` · מקום ${waitlistPosition}` : ''}`;
    return (
      <div className="flex items-center gap-2">
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-2.5 text-sm font-bold text-accent">
          {optimistic === 'booked' ? (
            <Check className="size-4" aria-hidden />
          ) : (
            <Hourglass className="size-4" aria-hidden />
          )}
          {label}
        </span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="danger" size="icon" aria-label="ביטול הרישום" disabled={pending}>
              <X className="size-4" aria-hidden />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>לבטל את הרישום?</AlertDialogTitle>
              <AlertDialogDescription>
                {optimistic === 'booked'
                  ? 'המקום שלכם ישוחרר והמתאמן הראשון ברשימת ההמתנה יקודם אוטומטית.'
                  : 'תוסרו מרשימת ההמתנה ותאבדו את המקום בתור.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={cancel}>כן, בטלו את הרישום</AlertDialogAction>
              <AlertDialogCancel>השאירו אותי רשום</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  const isFull = availability === 'full';
  return (
    <Button
      variant={isFull ? 'secondary' : 'primary'}
      size={size}
      block={block}
      loading={pending}
      onClick={book}
    >
      {isFull ? (
        <>
          <Clock3 className="size-4" aria-hidden />
          הצטרפות לרשימת המתנה
        </>
      ) : (
        'הרשמה לשיעור'
      )}
    </Button>
  );
}
