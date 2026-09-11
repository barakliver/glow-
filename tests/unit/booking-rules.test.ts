import { describe, expect, it } from 'vitest';
import {
  BOOKING_ERRORS,
  availabilityForClass,
  classAvailability,
  countConfirmed,
  decideBooking,
  decideCancellation,
  nextWaitlistPosition,
  orderedWaitlist,
  promoteFromWaitlist,
  spotsLeft,
  type BookingContext,
  type WaitlistEntry,
} from '@/lib/domain/booking-rules';
import type { Booking, GymClass } from '@/lib/domain/types';

const NOW = new Date('2026-03-10T08:00:00.000Z');

function makeClass(overrides: Partial<GymClass> = {}) {
  return {
    id: 'class-1',
    capacity: 3,
    // Two hours ahead of NOW.
    starts_at: '2026-03-10T10:00:00.000Z',
    status: 'scheduled' as const,
    published: true,
    registration_closed: false,
    ...overrides,
  };
}

function makeBooking(
  profileId: string,
  status: Booking['status'],
  position: number | null = null,
  bookedAt = '2026-03-09T08:00:00.000Z',
): Pick<Booking, 'profile_id' | 'status' | 'waitlist_position' | 'booked_at'> {
  return { profile_id: profileId, status, waitlist_position: position, booked_at: bookedAt };
}

function context(overrides: Partial<BookingContext> = {}): BookingContext {
  return {
    gymClass: makeClass(),
    bookings: [],
    profileId: 'member-new',
    bookingCutoffMinutes: 30,
    cancelCutoffMinutes: 120,
    waitlistEnabled: true,
    now: NOW,
    ...overrides,
  };
}

describe('capacity rules', () => {
  it('confirms while places remain', () => {
    const result = decideBooking(
      context({ bookings: [makeBooking('a', 'confirmed'), makeBooking('b', 'confirmed')] }),
    );
    expect(result).toEqual({ ok: true, status: 'confirmed' });
  });

  it('counts attended bookings against capacity', () => {
    const bookings = [
      makeBooking('a', 'confirmed'),
      makeBooking('b', 'attended'),
      makeBooking('c', 'confirmed'),
    ];
    expect(countConfirmed(bookings)).toBe(3);
    expect(spotsLeft(3, bookings)).toBe(0);
  });

  it('ignores cancelled bookings when counting capacity', () => {
    const bookings = [makeBooking('a', 'cancelled'), makeBooking('b', 'confirmed')];
    expect(countConfirmed(bookings)).toBe(1);
    expect(spotsLeft(3, bookings)).toBe(2);
  });

  it('moves to the waiting list once capacity is reached', () => {
    const bookings = [
      makeBooking('a', 'confirmed'),
      makeBooking('b', 'confirmed'),
      makeBooking('c', 'confirmed'),
    ];
    expect(decideBooking(context({ bookings }))).toEqual({
      ok: true,
      status: 'waitlisted',
      position: 1,
    });
  });

  it('refuses the waiting list when the owner disabled it', () => {
    const bookings = Array.from({ length: 3 }, (_, i) => makeBooking(`m${i}`, 'confirmed'));
    expect(decideBooking(context({ bookings, waitlistEnabled: false }))).toEqual({
      ok: false,
      code: BOOKING_ERRORS.WAITLIST_DISABLED,
    });
  });

  it('never exceeds capacity even with a larger capacity value', () => {
    const bookings = Array.from({ length: 8 }, (_, i) => makeBooking(`m${i}`, 'confirmed'));
    const result = decideBooking(
      context({ gymClass: makeClass({ capacity: 8 }), bookings }),
    );
    expect(result.ok && result.status).toBe('waitlisted');
  });
});

describe('duplicate booking prevention', () => {
  it('blocks a second booking for a confirmed member', () => {
    const result = decideBooking(
      context({ profileId: 'a', bookings: [makeBooking('a', 'confirmed')] }),
    );
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.ALREADY_BOOKED });
  });

  it('blocks a second booking for a waitlisted member', () => {
    const result = decideBooking(
      context({ profileId: 'a', bookings: [makeBooking('a', 'waitlisted', 1)] }),
    );
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.ALREADY_BOOKED });
  });

  it('allows re-booking after cancelling', () => {
    const result = decideBooking(
      context({ profileId: 'a', bookings: [makeBooking('a', 'cancelled')] }),
    );
    expect(result).toEqual({ ok: true, status: 'confirmed' });
  });
});

describe('booking cutoff rules', () => {
  it('blocks booking after the cutoff has passed', () => {
    const result = decideBooking(
      context({ now: new Date('2026-03-10T09:45:00.000Z'), bookingCutoffMinutes: 30 }),
    );
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.CUTOFF_PASSED });
  });

  it('allows booking exactly at the cutoff moment', () => {
    const result = decideBooking(
      context({ now: new Date('2026-03-10T09:30:00.000Z'), bookingCutoffMinutes: 30 }),
    );
    expect(result).toEqual({ ok: true, status: 'confirmed' });
  });

  it('blocks booking once the class has started', () => {
    const result = decideBooking(
      context({ now: new Date('2026-03-10T10:00:00.000Z'), bookingCutoffMinutes: 0 }),
    );
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.CLASS_STARTED });
  });

  it('blocks booking a cancelled or unpublished class', () => {
    expect(decideBooking(context({ gymClass: makeClass({ status: 'cancelled' }) }))).toEqual({
      ok: false,
      code: BOOKING_ERRORS.CLASS_CANCELLED,
    });
    expect(decideBooking(context({ gymClass: makeClass({ published: false }) }))).toEqual({
      ok: false,
      code: BOOKING_ERRORS.CLASS_UNPUBLISHED,
    });
    expect(
      decideBooking(context({ gymClass: makeClass({ registration_closed: true }) })),
    ).toEqual({ ok: false, code: BOOKING_ERRORS.REGISTRATION_CLOSED });
  });
});

describe('cancellation cutoff rules', () => {
  it('allows cancelling before the cutoff', () => {
    const result = decideCancellation(
      context({ profileId: 'a', bookings: [makeBooking('a', 'confirmed')] }),
    );
    expect(result).toEqual({ ok: true, wasConfirmed: true });
  });

  it('blocks cancelling inside the cutoff window', () => {
    const result = decideCancellation(
      context({
        profileId: 'a',
        bookings: [makeBooking('a', 'confirmed')],
        now: new Date('2026-03-10T09:00:00.000Z'),
        cancelCutoffMinutes: 120,
      }),
    );
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.CANCEL_CUTOFF_PASSED });
  });

  it('always allows leaving a cancelled class', () => {
    const result = decideCancellation(
      context({
        profileId: 'a',
        gymClass: makeClass({ status: 'cancelled' }),
        bookings: [makeBooking('a', 'confirmed')],
        now: new Date('2026-03-10T09:59:00.000Z'),
      }),
    );
    expect(result).toEqual({ ok: true, wasConfirmed: true });
  });

  it('reports when there is nothing to cancel', () => {
    expect(decideCancellation(context({ profileId: 'ghost' }))).toEqual({
      ok: false,
      code: BOOKING_ERRORS.NOT_BOOKED,
    });
  });
});

describe('waiting list order', () => {
  const entries: WaitlistEntry[] = [
    { id: 'w3', profile_id: 'c', status: 'waitlisted' as const, waitlist_position: 3, booked_at: '2026-03-03T08:00:00.000Z' },
    { id: 'w1', profile_id: 'a', status: 'waitlisted' as const, waitlist_position: 1, booked_at: '2026-03-01T08:00:00.000Z' },
    { id: 'w2', profile_id: 'b', status: 'waitlisted' as const, waitlist_position: 2, booked_at: '2026-03-02T08:00:00.000Z' },
  ];

  it('orders by explicit position', () => {
    expect(orderedWaitlist(entries).map((e) => e.id)).toEqual(['w1', 'w2', 'w3']);
  });

  it('falls back to booking time when positions tie', () => {
    const tied = entries.map((entry) => ({ ...entry, waitlist_position: 1 }));
    expect(orderedWaitlist(tied).map((e) => e.id)).toEqual(['w1', 'w2', 'w3']);
  });

  it('assigns the next free position', () => {
    expect(nextWaitlistPosition(entries)).toBe(4);
    expect(nextWaitlistPosition([])).toBe(1);
  });

  it('excludes cancelled entries from the queue', () => {
    const withCancelled = [
      ...entries,
      { id: 'w4', profile_id: 'd', status: 'cancelled' as const, waitlist_position: null, booked_at: '2026-03-04T08:00:00.000Z' },
    ];
    expect(orderedWaitlist(withCancelled)).toHaveLength(3);
  });
});

describe('waiting list promotion', () => {
  const queue: WaitlistEntry[] = [
    { id: 'c1', profile_id: 'a', status: 'confirmed' as const, waitlist_position: null, booked_at: '2026-03-01T08:00:00.000Z' },
    { id: 'w1', profile_id: 'b', status: 'waitlisted' as const, waitlist_position: 1, booked_at: '2026-03-02T08:00:00.000Z' },
    { id: 'w2', profile_id: 'c', status: 'waitlisted' as const, waitlist_position: 2, booked_at: '2026-03-03T08:00:00.000Z' },
    { id: 'w3', profile_id: 'd', status: 'waitlisted' as const, waitlist_position: 3, booked_at: '2026-03-04T08:00:00.000Z' },
  ];

  it('promotes the first member in the queue', () => {
    const { promoted } = promoteFromWaitlist(queue, 2);
    expect(promoted?.id).toBe('w1');
  });

  it('renumbers the remaining queue contiguously', () => {
    const { reordered } = promoteFromWaitlist(queue, 2);
    expect(reordered).toEqual([
      { id: 'w2', waitlist_position: 1 },
      { id: 'w3', waitlist_position: 2 },
    ]);
  });

  it('promotes nobody when the class is still full', () => {
    const full = [
      { ...queue[0] },
      { ...queue[0], id: 'c2', profile_id: 'z' },
      ...queue.slice(1),
    ];
    const { promoted, reordered } = promoteFromWaitlist(full, 2);
    expect(promoted).toBeNull();
    expect(reordered).toEqual([
      { id: 'w1', waitlist_position: 1 },
      { id: 'w2', waitlist_position: 2 },
      { id: 'w3', waitlist_position: 3 },
    ]);
  });

  it('promotes nobody when the queue is empty', () => {
    expect(promoteFromWaitlist([queue[0]], 5).promoted).toBeNull();
  });

  it('repeated promotions drain the queue in order', () => {
    let current = [...queue];
    const promotedIds: string[] = [];
    for (let i = 0; i < 3; i += 1) {
      const { promoted, reordered } = promoteFromWaitlist(current, 10);
      if (!promoted) break;
      promotedIds.push(promoted.id);
      current = current.map((entry) => {
        if (entry.id === promoted.id) return { ...entry, status: 'confirmed' as const, waitlist_position: null };
        const renumbered = reordered.find((r) => r.id === entry.id);
        return renumbered ? { ...entry, waitlist_position: renumbered.waitlist_position } : entry;
      });
    }
    expect(promotedIds).toEqual(['w1', 'w2', 'w3']);
  });
});

describe('class availability states', () => {
  it('reports booked for the current member', () => {
    expect(
      classAvailability(makeClass(), [], { status: 'confirmed' }, NOW),
    ).toBe('booked');
  });

  it('reports waitlisted for a queued member', () => {
    expect(classAvailability(makeClass(), [], { status: 'waitlisted' }, NOW)).toBe('waitlisted');
  });

  it('reports almost_full near the capacity limit', () => {
    const bookings = [
      { status: 'confirmed' as const },
      { status: 'confirmed' as const },
    ];
    expect(classAvailability(makeClass({ capacity: 3 }), bookings, null, NOW)).toBe('almost_full');
  });

  it('reports full at capacity', () => {
    const bookings = Array.from({ length: 3 }, () => ({ status: 'confirmed' as const }));
    expect(classAvailability(makeClass({ capacity: 3 }), bookings, null, NOW)).toBe('full');
  });

  it('reports cancelled, closed and past correctly', () => {
    expect(classAvailability(makeClass({ status: 'cancelled' }), [], null, NOW)).toBe('cancelled');
    expect(classAvailability(makeClass({ registration_closed: true }), [], null, NOW)).toBe('closed');
    expect(
      classAvailability(makeClass(), [], null, new Date('2026-03-10T11:00:00.000Z')),
    ).toBe('past');
  });
});

describe('availabilityForClass', () => {
  const base = {
    capacity: 1,
    starts_at: '2026-03-10T10:00:00.000Z',
    status: 'scheduled' as const,
    registration_closed: false,
  };

  it('reports a class at capacity as full', () => {
    expect(
      availabilityForClass({ ...base, confirmed_count: 1, my_booking: null }, NOW),
    ).toBe('full');
  });

  it('reports free places as available', () => {
    expect(
      availabilityForClass({ ...base, capacity: 10, confirmed_count: 2, my_booking: null }, NOW),
    ).toBe('available');
  });

  it('reports the last places as almost full', () => {
    expect(
      availabilityForClass({ ...base, capacity: 8, confirmed_count: 6, my_booking: null }, NOW),
    ).toBe('almost_full');
  });

  it('prefers the member own booking over capacity', () => {
    expect(
      availabilityForClass(
        { ...base, confirmed_count: 1, my_booking: makeBooking('me', 'waitlisted', 2) as never },
        NOW,
      ),
    ).toBe('waitlisted');
  });
});
