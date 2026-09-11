'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser, getRepository } from '@/lib/auth';
import {
  BOOKING_ERRORS,
  BOOKING_ERROR_MESSAGES,
  type BookingErrorCode,
} from '@/lib/domain/booking-rules';

export interface ActionResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}

function failure<T = undefined>(code: BookingErrorCode): ActionResult<T> {
  return { ok: false, message: BOOKING_ERROR_MESSAGES[code] };
}

export async function bookClassAction(
  classId: string,
): Promise<ActionResult<{ status: 'confirmed' | 'waitlisted'; position?: number }>> {
  const user = await getCurrentUser();
  if (!user) return failure(BOOKING_ERRORS.NOT_AUTHENTICATED);

  const repository = await getRepository();
  const result = await repository.bookClass(classId, user.profile.id);
  if (!result.ok) return failure(result.code);

  revalidatePath('/schedule');
  revalidatePath('/bookings');
  revalidatePath(`/classes/${classId}`);
  revalidatePath('/');

  return result.status === 'confirmed'
    ? { ok: true, message: 'הרישום אושר. נתראה באימון.', data: { status: 'confirmed' } }
    : {
        ok: true,
        message: `נוספת לרשימת ההמתנה במקום ${result.position}.`,
        data: { status: 'waitlisted', position: result.position },
      };
}

export async function cancelBookingAction(classId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return failure(BOOKING_ERRORS.NOT_AUTHENTICATED);

  const repository = await getRepository();
  const result = await repository.cancelBooking(classId, user.profile.id);
  if (!result.ok) return failure(result.code);

  revalidatePath('/schedule');
  revalidatePath('/bookings');
  revalidatePath(`/classes/${classId}`);
  revalidatePath('/');

  return {
    ok: true,
    message: result.promotedProfileId
      ? 'הרישום בוטל. המתאמן הבא ברשימת ההמתנה קודם אוטומטית.'
      : 'הרישום בוטל.',
  };
}

/** Live capacity for optimistic reconciliation on the schedule. */
export async function getClassCapacityAction(
  classId: string,
): Promise<ActionResult<{ spotsLeft: number; confirmed: number; waitlist: number }>> {
  const user = await getCurrentUser();
  const repository = await getRepository();
  const gymClass = await repository.getClass(classId, user?.profile.id ?? null);
  if (!gymClass) return failure(BOOKING_ERRORS.CLASS_NOT_FOUND);
  return {
    ok: true,
    message: '',
    data: {
      spotsLeft: gymClass.spots_left,
      confirmed: gymClass.confirmed_count,
      waitlist: gymClass.waitlist_count,
    },
  };
}

/**
 * QR check-in. A member may only check themselves in, and only when they hold a
 * confirmed booking for that class inside the check-in window.
 */
export async function checkInAction(classId: string): Promise<ActionResult<{ title: string }>> {
  const user = await getCurrentUser();
  if (!user) return failure(BOOKING_ERRORS.NOT_AUTHENTICATED);

  const { getRepository: repo } = await import('@/lib/auth');
  const repository = await repo();
  const gymClass = await repository.getClass(classId, user.profile.id);
  if (!gymClass) return failure(BOOKING_ERRORS.CLASS_NOT_FOUND);
  if (gymClass.status === 'cancelled') return failure(BOOKING_ERRORS.CLASS_CANCELLED);

  const booking = gymClass.my_booking;
  if (!booking || (booking.status !== 'confirmed' && booking.status !== 'attended')) {
    return {
      ok: false,
      message:
        booking?.status === 'waitlisted'
          ? 'אתם ברשימת ההמתנה ולכן עדיין אי אפשר לבצע צ׳ק-אין.'
          : 'אין לכם רישום מאושר לשיעור הזה.',
    };
  }

  // Window: from 45 minutes before the start until the class ends.
  const start = new Date(gymClass.starts_at).getTime();
  const end = new Date(gymClass.ends_at).getTime();
  const now = Date.now();
  if (now < start - 45 * 60_000) {
    return { ok: false, message: 'הצ׳ק-אין נפתח 45 דקות לפני תחילת השיעור.' };
  }
  if (now > end) {
    return { ok: false, message: 'השיעור כבר הסתיים.' };
  }

  await repository.markAttendance(classId, user.profile.id, true, user.profile.id, 'qr');
  revalidatePath('/bookings');
  revalidatePath(`/admin/classes/${classId}`);
  return { ok: true, message: 'הצ׳ק-אין בוצע. אימון מוצלח!', data: { title: gymClass.title } };
}
