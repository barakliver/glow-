import type {
  Booking,
  BookingStatus,
  ClassAvailability,
  ClassWithMeta,
  GymClass,
} from '@/lib/domain/types';

export const BOOKING_ERRORS = {
  CLASS_NOT_FOUND: 'class_not_found',
  CLASS_CANCELLED: 'class_cancelled',
  CLASS_UNPUBLISHED: 'class_unpublished',
  REGISTRATION_CLOSED: 'registration_closed',
  CUTOFF_PASSED: 'cutoff_passed',
  ALREADY_BOOKED: 'already_booked',
  CLASS_STARTED: 'class_started',
  NOT_BOOKED: 'not_booked',
  CANCEL_CUTOFF_PASSED: 'cancel_cutoff_passed',
  WAITLIST_DISABLED: 'waitlist_disabled',
  RATE_LIMITED: 'rate_limited',
  NOT_AUTHENTICATED: 'not_authenticated',
} as const;

export type BookingErrorCode = (typeof BOOKING_ERRORS)[keyof typeof BOOKING_ERRORS];

/** Hebrew messages shown to the member for every failure path. */
export const BOOKING_ERROR_MESSAGES: Record<BookingErrorCode, string> = {
  class_not_found: 'השיעור לא נמצא.',
  class_cancelled: 'השיעור בוטל ולא ניתן להירשם אליו.',
  class_unpublished: 'השיעור עדיין לא פורסם.',
  registration_closed: 'ההרשמה לשיעור הזה סגורה.',
  cutoff_passed: 'חלון ההרשמה לשיעור נסגר.',
  already_booked: 'כבר יש לך רישום פעיל לשיעור הזה.',
  class_started: 'השיעור כבר התחיל.',
  not_booked: 'אין לך רישום פעיל לשיעור הזה.',
  cancel_cutoff_passed: 'חלון הביטול נסגר. אפשר לפנות למאמן.',
  waitlist_disabled: 'השיעור מלא ורשימת ההמתנה סגורה.',
  rate_limited: 'יותר מדי בקשות. נסו שוב בעוד רגע.',
  not_authenticated: 'צריך להתחבר כדי לבצע את הפעולה.',
};

/** Booking statuses that occupy a place or a waitlist seat. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['confirmed', 'waitlisted', 'attended'];

export function isActiveBooking(booking: Pick<Booking, 'status'>): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(booking.status);
}

export function countConfirmed(bookings: Pick<Booking, 'status'>[]): number {
  return bookings.filter((b) => b.status === 'confirmed' || b.status === 'attended').length;
}

export function countWaitlisted(bookings: Pick<Booking, 'status'>[]): number {
  return bookings.filter((b) => b.status === 'waitlisted').length;
}

export function spotsLeft(capacity: number, bookings: Pick<Booking, 'status'>[]): number {
  return Math.max(0, capacity - countConfirmed(bookings));
}

export interface BookingContext {
  gymClass: Pick<
    GymClass,
    'id' | 'capacity' | 'starts_at' | 'status' | 'published' | 'registration_closed'
  >;
  bookings: Pick<Booking, 'profile_id' | 'status' | 'waitlist_position' | 'booked_at'>[];
  profileId: string;
  /** Minutes before class start after which booking is blocked. */
  bookingCutoffMinutes: number;
  /** Minutes before class start after which cancelling is blocked. */
  cancelCutoffMinutes: number;
  waitlistEnabled: boolean;
  now: Date;
}

export type BookingDecision =
  | { ok: true; status: 'confirmed' }
  | { ok: true; status: 'waitlisted'; position: number }
  | { ok: false; code: BookingErrorCode };

/**
 * Pure decision function used by both the demo adapter and (mirrored) by the
 * PostgreSQL `book_class` function. Returns what SHOULD happen; the caller is
 * responsible for persisting it atomically.
 */
export function decideBooking(ctx: BookingContext): BookingDecision {
  const { gymClass, bookings, profileId, now } = ctx;

  if (gymClass.status === 'cancelled') return { ok: false, code: BOOKING_ERRORS.CLASS_CANCELLED };
  if (!gymClass.published) return { ok: false, code: BOOKING_ERRORS.CLASS_UNPUBLISHED };
  if (gymClass.registration_closed)
    return { ok: false, code: BOOKING_ERRORS.REGISTRATION_CLOSED };

  const startsAt = new Date(gymClass.starts_at).getTime();
  if (startsAt <= now.getTime()) return { ok: false, code: BOOKING_ERRORS.CLASS_STARTED };

  const cutoffAt = startsAt - ctx.bookingCutoffMinutes * 60_000;
  if (now.getTime() > cutoffAt) return { ok: false, code: BOOKING_ERRORS.CUTOFF_PASSED };

  const mine = bookings.find((b) => b.profile_id === profileId && isActiveBooking(b));
  if (mine) return { ok: false, code: BOOKING_ERRORS.ALREADY_BOOKED };

  if (countConfirmed(bookings) < gymClass.capacity) {
    return { ok: true, status: 'confirmed' };
  }

  if (!ctx.waitlistEnabled) return { ok: false, code: BOOKING_ERRORS.WAITLIST_DISABLED };

  return { ok: true, status: 'waitlisted', position: nextWaitlistPosition(bookings) };
}

/** Waitlist positions are 1-based and always contiguous after normalisation. */
export function nextWaitlistPosition(
  bookings: Pick<Booking, 'status' | 'waitlist_position'>[],
): number {
  const positions = bookings
    .filter((b) => b.status === 'waitlisted')
    .map((b) => b.waitlist_position ?? 0);
  return positions.length === 0 ? 1 : Math.max(...positions) + 1;
}

export type CancelDecision =
  | { ok: true; wasConfirmed: boolean }
  | { ok: false; code: BookingErrorCode };

export function decideCancellation(ctx: BookingContext): CancelDecision {
  const mine = ctx.bookings.find((b) => b.profile_id === ctx.profileId && isActiveBooking(b));
  if (!mine) return { ok: false, code: BOOKING_ERRORS.NOT_BOOKED };

  const startsAt = new Date(ctx.gymClass.starts_at).getTime();
  // A cancelled class can always be left; nothing to protect.
  if (ctx.gymClass.status !== 'cancelled') {
    const cutoffAt = startsAt - ctx.cancelCutoffMinutes * 60_000;
    if (ctx.now.getTime() > cutoffAt) {
      return { ok: false, code: BOOKING_ERRORS.CANCEL_CUTOFF_PASSED };
    }
  }
  return { ok: true, wasConfirmed: mine.status === 'confirmed' };
}

export interface WaitlistEntry {
  id: string;
  profile_id: string;
  status: BookingStatus;
  waitlist_position: number | null;
  booked_at: string;
}

/** Ordered waiting list: by explicit position, then by booking time as tiebreak. */
export function orderedWaitlist<T extends WaitlistEntry>(bookings: T[]): T[] {
  return bookings
    .filter((b) => b.status === 'waitlisted')
    .slice()
    .sort((a, b) => {
      const pa = a.waitlist_position ?? Number.MAX_SAFE_INTEGER;
      const pb = b.waitlist_position ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return new Date(a.booked_at).getTime() - new Date(b.booked_at).getTime();
    });
}

export interface PromotionResult<T extends WaitlistEntry> {
  promoted: T | null;
  /** Remaining waitlist entries with contiguous 1-based positions. */
  reordered: { id: string; waitlist_position: number }[];
}

/**
 * Picks the first eligible waiting member when a place frees up and renumbers
 * the rest of the queue so positions stay contiguous.
 */
export function promoteFromWaitlist<T extends WaitlistEntry>(
  bookings: T[],
  capacity: number,
): PromotionResult<T> {
  const confirmed = countConfirmed(bookings);
  const queue = orderedWaitlist(bookings);

  if (confirmed >= capacity || queue.length === 0) {
    return { promoted: null, reordered: renumber(queue) };
  }
  const [first, ...rest] = queue;
  return { promoted: first, reordered: renumber(rest) };
}

function renumber<T extends WaitlistEntry>(queue: T[]): { id: string; waitlist_position: number }[] {
  return queue.map((entry, index) => ({ id: entry.id, waitlist_position: index + 1 }));
}

export function classAvailability(
  gymClass: Pick<
    GymClass,
    'capacity' | 'starts_at' | 'status' | 'registration_closed'
  >,
  bookings: Pick<Booking, 'status'>[],
  myBooking: Pick<Booking, 'status'> | null,
  at: Date = new Date(),
): ClassAvailability {
  if (gymClass.status === 'cancelled') return 'cancelled';
  if (myBooking?.status === 'confirmed' || myBooking?.status === 'attended') return 'booked';
  if (myBooking?.status === 'waitlisted') return 'waitlisted';
  if (new Date(gymClass.starts_at).getTime() <= at.getTime()) return 'past';
  if (gymClass.registration_closed) return 'closed';

  const left = spotsLeft(gymClass.capacity, bookings);
  if (left === 0) return 'full';
  if (left <= Math.max(1, Math.ceil(gymClass.capacity * 0.25))) return 'almost_full';
  return 'available';
}

/**
 * Availability for an already-decorated class row.
 *
 * Prefer this over calling `classAvailability` with a synthesised booking list:
 * `ClassWithMeta` already carries the authoritative counts, and passing an empty
 * array silently reports a full class as having places.
 */
export function availabilityForClass(
  gymClass: Pick<
    ClassWithMeta,
    'capacity' | 'starts_at' | 'status' | 'registration_closed' | 'confirmed_count' | 'my_booking'
  >,
  at: Date = new Date(),
): ClassAvailability {
  const occupied = Array.from({ length: gymClass.confirmed_count }, () => ({
    status: 'confirmed' as const,
  }));
  return classAvailability(gymClass, occupied, gymClass.my_booking, at);
}

export const AVAILABILITY_LABELS: Record<ClassAvailability, string> = {
  available: 'יש מקום',
  almost_full: 'כמעט מלא',
  full: 'מלא',
  booked: 'רשום',
  waitlisted: 'רשימת המתנה',
  cancelled: 'בוטל',
  closed: 'ההרשמה סגורה',
  past: 'הסתיים',
};
