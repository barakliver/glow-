import { beforeEach, describe, expect, it } from 'vitest';
import { DemoRepository } from '@/lib/data/demo-repository';
import { resetDemoDatabase, db } from '@/lib/data/store';
import { PROFILE_IDS } from '@/lib/data/seed';
import { workoutLibraryId } from '@/lib/data/workouts';

let repository: DemoRepository;

/** A future class with every seat free and a known workout attached. */
async function makeClassWithWorkout(slug = 'fran', capacity = 5) {
  const database = db();
  const gymClass = await repository.createClass({
    title: 'שיעור בדיקה',
    capacity,
    starts_at: new Date(Date.now() + 24 * 3_600_000).toISOString(),
    ends_at: new Date(Date.now() + 25 * 3_600_000).toISOString(),
    published: true,
  });
  database.bookings = database.bookings.filter((b) => b.class_id !== gymClass.id);
  await repository.setClassWorkout(gymClass.id, workoutLibraryId(slug), {
    notes: 'מי שחוזר מפציעת כתף - גרסה מותאמת.',
    assignedBy: PROFILE_IDS.trainer1,
  });
  return gymClass;
}

beforeEach(() => {
  resetDemoDatabase();
  repository = new DemoRepository();
});

describe('the workout stays hidden until a member holds a place', () => {
  it('shows a member who has not booked only the shape of the session', async () => {
    const gymClass = await makeClassWithWorkout();
    const reveal = await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member1);

    expect(reveal.state).toBe('locked');
    if (reveal.state !== 'locked') return;
    expect(reveal.category).toBe('crossfit');
    expect(reveal.format).toBe('for_time');
    expect(reveal.duration_minutes).toBe(20);
    // Nothing in the locked payload names a movement or a load.
    expect(JSON.stringify(reveal)).not.toMatch(/Thruster|Pull-up|43\/30/);
  });

  it('reveals it the moment they book', async () => {
    const gymClass = await makeClassWithWorkout();
    expect((await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member1)).state).toBe(
      'locked',
    );

    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);

    const reveal = await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member1);
    expect(reveal.state).toBe('revealed');
    if (reveal.state !== 'revealed') return;
    expect(reveal.workout.title).toBe('Fran');
    expect(reveal.notes).toContain('פציעת כתף');
  });

  it('reveals it to a waitlisted member too, who may be promoted at any moment', async () => {
    const gymClass = await makeClassWithWorkout('cindy', 1);
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    const queued = await repository.bookClass(gymClass.id, PROFILE_IDS.member2);
    expect(queued).toEqual({ ok: true, status: 'waitlisted', position: 1 });

    expect((await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member2)).state).toBe(
      'revealed',
    );
  });

  it('hides it again when the member cancels', async () => {
    const gymClass = await makeClassWithWorkout();
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    await repository.cancelBooking(gymClass.id, PROFILE_IDS.member1, { force: true });

    expect((await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member1)).state).toBe(
      'locked',
    );
  });

  it('shows nothing at all when no workout is planned', async () => {
    const gymClass = await makeClassWithWorkout();
    await repository.setClassWorkout(gymClass.id, null, {
      notes: null,
      assignedBy: PROFILE_IDS.trainer1,
    });
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);

    expect(await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member1)).toEqual({
      state: 'none',
    });
  });

  it('gives a signed-out visitor nothing but the shape', async () => {
    const gymClass = await makeClassWithWorkout();
    expect((await repository.getClassWorkout(gymClass.id, null)).state).toBe('locked');
  });

  it('lets staff see it without booking, so they can coach it', async () => {
    const gymClass = await makeClassWithWorkout();
    for (const staff of [PROFILE_IDS.owner, PROFILE_IDS.trainer1]) {
      expect((await repository.getClassWorkout(gymClass.id, staff)).state).toBe('revealed');
    }
  });

  it('gives a member still waiting for approval nothing, even with a booking row', async () => {
    const gymClass = await makeClassWithWorkout();
    const database = db();
    await repository.bookClass(gymClass.id, PROFILE_IDS.member1);
    const membership = database.memberships.find((m) => m.profile_id === PROFILE_IDS.member1)!;
    membership.approved_at = null;

    expect((await repository.getClassWorkout(gymClass.id, PROFILE_IDS.member1)).state).toBe(
      'locked',
    );
  });

  it('carries the teaser on the schedule without leaking the workout', async () => {
    const gymClass = await makeClassWithWorkout();
    const decorated = await repository.getClass(gymClass.id, PROFILE_IDS.member1);

    expect(decorated?.workout_teaser).toEqual({
      category: 'crossfit',
      format: 'for_time',
      duration_minutes: 20,
      difficulty: 'advanced',
    });
    expect(JSON.stringify(decorated)).not.toMatch(/Thruster/);
  });
});

describe('recording a result', () => {
  it('keeps one row per workout per day and corrects it in place', async () => {
    const workoutId = workoutLibraryId('fran');
    const base = {
      profileId: PROFILE_IDS.member1,
      workoutId,
      classId: null,
      performedOn: '2026-03-01',
      scoreType: 'time' as const,
      resultRounds: null,
      resultReps: null,
      resultWeightKg: null,
      completed: null,
      rx: true,
      rpe: 8,
      notes: null,
    };

    await repository.logWorkoutResult({ ...base, resultSeconds: 420 });
    await repository.logWorkoutResult({ ...base, resultSeconds: 395, rpe: 9 });

    const history = await repository.listWorkoutHistory(PROFILE_IDS.member1, workoutId);
    const onThatDay = history.filter((log) => log.performed_on === '2026-03-01');
    expect(onThatDay).toHaveLength(1);
    expect(onThatDay[0].result_seconds).toBe(395);
    expect(onThatDay[0].rpe).toBe(9);
  });

  it('returns a member their own results only', async () => {
    const workoutId = workoutLibraryId('cindy');
    await repository.logWorkoutResult({
      profileId: PROFILE_IDS.member2,
      workoutId,
      classId: null,
      performedOn: '2026-03-02',
      scoreType: 'rounds_and_reps',
      resultSeconds: null,
      resultRounds: 20,
      resultReps: 5,
      resultWeightKg: null,
      completed: null,
      rx: true,
      rpe: null,
      notes: null,
    });

    const mine = await repository.listWorkoutLogs(PROFILE_IDS.member1);
    expect(mine.every((entry) => entry.log.profile_id === PROFILE_IDS.member1)).toBe(true);
    expect(mine.some((entry) => entry.log.result_rounds === 20)).toBe(false);
  });

  it('refuses to delete a row that is not yours', async () => {
    const logs = await repository.listWorkoutLogs(PROFILE_IDS.member1);
    expect(logs.length).toBeGreaterThan(0);

    await repository.deleteWorkoutLog(logs[0].log.id, PROFILE_IDS.member2);
    const after = await repository.listWorkoutLogs(PROFILE_IDS.member1);
    expect(after.map((entry) => entry.log.id)).toContain(logs[0].log.id);
  });
});

describe('five to a class', () => {
  it('seeds the demo week at five places', async () => {
    for (const gymClass of db().classes) {
      expect(gymClass.capacity).toBe(5);
    }
  });

  it('defaults a newly created class to five', async () => {
    const created = await repository.createClass({ title: 'שיעור חדש' });
    expect(created.capacity).toBe(5);
  });
});
