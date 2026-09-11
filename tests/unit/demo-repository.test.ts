import { beforeEach, describe, expect, it } from 'vitest';
import { DemoRepository } from '@/lib/data/demo-repository';
import { resetDemoDatabase, db } from '@/lib/data/store';
import { PROFILE_IDS } from '@/lib/data/seed';
import { BOOKING_ERRORS } from '@/lib/domain/booking-rules';

let repository: DemoRepository;

/** A future class with every seat free, so capacity behaviour is deterministic. */
async function makeEmptyClass(capacity: number) {
  const database = db();
  const gymClass = await repository.createClass({
    title: 'שיעור בדיקה',
    capacity,
    starts_at: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    ends_at: new Date(Date.now() + 25 * 3_600_000).toISOString(),
    published: true,
  });
  database.bookings = database.bookings.filter((b) => b.class_id !== gymClass.id);
  return gymClass;
}

beforeEach(() => {
  resetDemoDatabase();
  repository = new DemoRepository();
});

describe('booking transaction', () => {
  it('confirms up to capacity and then queues', async () => {
    const gymClass = await makeEmptyClass(2);
    const members = [PROFILE_IDS.member1, PROFILE_IDS.member2, PROFILE_IDS.member3];

    const results = [];
    for (const member of members) {
      results.push(await repository.bookClass(gymClass.id, member));
    }

    expect(results[0]).toEqual({ ok: true, status: 'confirmed' });
    expect(results[1]).toEqual({ ok: true, status: 'confirmed' });
    expect(results[2]).toEqual({ ok: true, status: 'waitlisted', position: 1 });
  });

  it('never exceeds capacity under concurrent bookings', async () => {
    const gymClass = await makeEmptyClass(2);
    const members = [
      PROFILE_IDS.member1,
      PROFILE_IDS.member2,
      PROFILE_IDS.member3,
      PROFILE_IDS.member4,
      PROFILE_IDS.member5,
    ];

    await Promise.all(members.map((member) => repository.bookClass(gymClass.id, member)));

    const decorated = await repository.getClass(gymClass.id, null);
    expect(decorated?.confirmed_count).toBe(2);
    expect(decorated?.waitlist_count).toBe(3);
    expect(decorated?.spots_left).toBe(0);
  });

  it('rejects a duplicate booking', async () => {
    const gymClass = await makeEmptyClass(5);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    const second = await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    expect(second).toEqual({ ok: false, code: BOOKING_ERRORS.ALREADY_BOOKED });
  });

  it('rejects booking a class that already started', async () => {
    const gymClass = await repository.createClass({
      title: 'עבר',
      capacity: 5,
      starts_at: new Date(Date.now() - 3_600_000).toISOString(),
      ends_at: new Date(Date.now() - 1_800_000).toISOString(),
      published: true,
    });
    const result = await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.CLASS_STARTED });
  });

  it('rejects booking when registration is closed', async () => {
    const gymClass = await makeEmptyClass(5);
    await repository.updateClass(gymClass.id, { registration_closed: true });
    const result = await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.REGISTRATION_CLOSED });
  });

  it('writes a confirmation notification', async () => {
    const gymClass = await makeEmptyClass(5);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member2);
    const notifications = await repository.listNotifications(PROFILE_IDS.member2);
    expect(notifications[0]?.type).toBe('booking_confirmed');
  });
});

describe('cancellation and promotion', () => {
  it('promotes the first waiting member and notifies them', async () => {
    const gymClass = await makeEmptyClass(1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member2);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member3);

    const result = await repository.cancelBooking(gymClass.id, PROFILE_IDS.member1);
    expect(result).toEqual({ ok: true, promotedProfileId: PROFILE_IDS.member2 });

    const rows = await repository.listClassBookings(gymClass.id);
    const promoted = rows.find((row) => row.profile.id === PROFILE_IDS.member2);
    expect(promoted?.booking.status).toBe('confirmed');

    const notifications = await repository.listNotifications(PROFILE_IDS.member2);
    expect(notifications.some((n) => n.type === 'waitlist_promoted')).toBe(true);
  });

  it('renumbers the queue after a promotion', async () => {
    const gymClass = await makeEmptyClass(1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member2);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member3);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member4);

    await repository.cancelBooking(gymClass.id, PROFILE_IDS.member1);

    const rows = await repository.listClassBookings(gymClass.id);
    const queue = rows
      .filter((row) => row.booking.status === 'waitlisted')
      .map((row) => row.booking.waitlist_position);
    expect(queue).toEqual([1, 2]);
  });

  it('frees the seat when nobody is waiting', async () => {
    const gymClass = await makeEmptyClass(3);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    const result = await repository.cancelBooking(gymClass.id, PROFILE_IDS.member1);
    expect(result).toEqual({ ok: true, promotedProfileId: null });

    const decorated = await repository.getClass(gymClass.id, PROFILE_IDS.member1);
    expect(decorated?.spots_left).toBe(3);
    expect(decorated?.my_booking).toBeNull();
  });

  it('blocks cancelling inside the cutoff window', async () => {
    const gymClass = await repository.createClass({
      title: 'קרוב',
      capacity: 5,
      starts_at: new Date(Date.now() + 20 * 60_000).toISOString(),
      ends_at: new Date(Date.now() + 80 * 60_000).toISOString(),
      published: true,
    });
    db().bookings = db().bookings.filter((b) => b.class_id !== gymClass.id);
    db().organization.booking_cutoff_minutes = 5;

    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    const result = await repository.cancelBooking(gymClass.id, PROFILE_IDS.member1);
    expect(result).toEqual({ ok: false, code: BOOKING_ERRORS.CANCEL_CUTOFF_PASSED });
  });

  it('staff can force a cancellation past the cutoff', async () => {
    const gymClass = await repository.createClass({
      title: 'קרוב',
      capacity: 5,
      starts_at: new Date(Date.now() + 20 * 60_000).toISOString(),
      ends_at: new Date(Date.now() + 80 * 60_000).toISOString(),
      published: true,
    });
    db().bookings = db().bookings.filter((b) => b.class_id !== gymClass.id);
    db().organization.booking_cutoff_minutes = 5;

    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    const result = await repository.cancelBooking(gymClass.id, PROFILE_IDS.member1, {
      force: true,
    });
    expect(result.ok).toBe(true);
  });

  it('cancelling a class releases every booking and notifies members', async () => {
    const gymClass = await makeEmptyClass(3);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member2);

    await repository.updateClass(gymClass.id, { status: 'cancelled' });

    const rows = await repository.listClassBookings(gymClass.id);
    expect(rows).toHaveLength(0);
    const notifications = await repository.listNotifications(PROFILE_IDS.member1);
    expect(notifications.some((n) => n.type === 'class_cancelled')).toBe(true);
  });
});

describe('staff roster moves', () => {
  it('moves a waiting member to confirmed', async () => {
    const gymClass = await makeEmptyClass(1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member2);

    const rows = await repository.listClassBookings(gymClass.id);
    const waiting = rows.find((row) => row.booking.status === 'waitlisted')!;
    await repository.setBookingStatus(waiting.booking.id, 'confirmed');

    const after = await repository.listClassBookings(gymClass.id);
    expect(after.filter((row) => row.booking.status === 'confirmed')).toHaveLength(2);
  });

  it('marks attendance and reflects it on the booking', async () => {
    const gymClass = await makeEmptyClass(3);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    await repository.markAttendance(gymClass.id, PROFILE_IDS.member1, true, PROFILE_IDS.owner);

    const rows = await repository.listClassBookings(gymClass.id);
    expect(rows[0].booking.status).toBe('attended');
    const attendance = await repository.listAttendance(PROFILE_IDS.member1);
    expect(attendance.some((a) => a.class_id === gymClass.id && a.present)).toBe(true);
  });
});

describe('recurring series generation', () => {
  it('creates one class per selected weekday inside the range', async () => {
    const { created } = await repository.createSeries({
      title: 'סדרת בדיקה',
      description: null,
      category: 'functional',
      difficulty: 'beginner',
      trainer_id: null,
      location: 'אולם GLoW',
      capacity: 10,
      duration_minutes: 45,
      equipment: [],
      recurrence: {
        weekdays: [0, 3],
        start_date: '2026-03-01',
        end_date: '2026-03-28',
        start_time: '18:00',
      },
      active: true,
    });
    // March 2026: Sundays 1,8,15,22 + Wednesdays 4,11,18,25 = 8
    expect(created).toBe(8);
  });
});

describe('workout sessions', () => {
  it('keeps only one active session per member', async () => {
    await repository.startSession({
      profileId: PROFILE_IDS.member1,
      templateId: null,
      title: 'ראשון',
      goal: 'general',
      exercises: [],
    });
    const second = await repository.startSession({
      profileId: PROFILE_IDS.member1,
      templateId: null,
      title: 'שני',
      goal: 'general',
      exercises: [],
    });
    const active = await repository.getActiveSession(PROFILE_IDS.member1);
    expect(active?.id).toBe(second.id);
  });

  it('computes average effort on finish', async () => {
    const session = await repository.startSession({
      profileId: PROFILE_IDS.member2,
      templateId: null,
      title: 'אימון',
      goal: 'strength',
      exercises: [],
    });
    const exercises = await repository.listExercises();
    for (const effort of [6, 8]) {
      await repository.addSet({
        session_id: session.id,
        exercise_id: exercises[0].id,
        position: 1,
        set_index: effort,
        reps: 10,
        load_kg: 40,
        duration_seconds: null,
        distance_meters: null,
        effort,
        notes: null,
        completed_at: new Date().toISOString(),
      });
    }
    const finished = await repository.finishSession(session.id, { notes: null });
    expect(finished.status).toBe('completed');
    expect(finished.average_effort).toBe(7);
  });
});

describe('invitations', () => {
  it('creates, reads and revokes a link', async () => {
    const invite = await repository.createInvite({
      label: 'בדיקה',
      expires_at: null,
      max_uses: null,
      created_by: PROFILE_IDS.owner,
    });
    expect(await repository.getInviteByToken(invite.token)).not.toBeNull();

    await repository.revokeInvite(invite.id);
    const after = await repository.getInviteByToken(invite.token);
    expect(after?.revoked).toBe(true);
  });
});
