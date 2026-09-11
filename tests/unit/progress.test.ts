import { describe, expect, it } from 'vitest';
import {
  computePersonalRecords,
  detectNewRecords,
  movementBalance,
  sessionVolume,
  setVolume,
  averageEffort,
  consistencyPercent,
} from '@/lib/domain/progress';
import type { Exercise, WorkoutSession, WorkoutSet } from '@/lib/domain/types';

function set(overrides: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: 'set',
    session_id: 's1',
    exercise_id: 'squat',
    position: 1,
    set_index: 1,
    reps: null,
    load_kg: null,
    duration_seconds: null,
    distance_meters: null,
    effort: null,
    notes: null,
    completed_at: '2026-03-01T08:00:00.000Z',
    created_at: '2026-03-01T08:00:00.000Z',
    ...overrides,
  };
}

describe('volume', () => {
  it('multiplies reps by load', () => {
    expect(setVolume({ reps: 5, load_kg: 60 })).toBe(300);
  });

  it('treats missing values as zero', () => {
    expect(setVolume({ reps: null, load_kg: 60 })).toBe(0);
    expect(setVolume({ reps: 10, load_kg: null })).toBe(0);
  });

  it('sums a session', () => {
    const sets = [set({ reps: 5, load_kg: 60 }), set({ reps: 5, load_kg: 70 })];
    expect(sessionVolume(sets)).toBe(650);
  });
});

describe('personal records', () => {
  const history = [
    set({ id: 'a', session_id: 's1', reps: 5, load_kg: 60, completed_at: '2026-03-01T08:00:00.000Z' }),
    set({ id: 'b', session_id: 's1', reps: 8, load_kg: 50, completed_at: '2026-03-01T08:05:00.000Z' }),
  ];

  it('tracks the best load, reps and volume per exercise', () => {
    const records = computePersonalRecords(history);
    expect(records.find((r) => r.kind === 'max_load')?.value).toBe(60);
    expect(records.find((r) => r.kind === 'max_reps')?.value).toBe(8);
    expect(records.find((r) => r.kind === 'max_volume')?.value).toBe(400);
  });

  it('detects a new record against earlier sessions', () => {
    const all = [
      ...history,
      set({ id: 'c', session_id: 's2', reps: 5, load_kg: 65, completed_at: '2026-03-08T08:00:00.000Z' }),
    ];
    const records = detectNewRecords(all, 's2');
    expect(records.some((r) => r.kind === 'max_load' && r.value === 65)).toBe(true);
  });

  it('does not report a record when the result is lower', () => {
    const all = [
      ...history,
      set({ id: 'c', session_id: 's2', reps: 5, load_kg: 55, completed_at: '2026-03-08T08:00:00.000Z' }),
    ];
    expect(detectNewRecords(all, 's2').some((r) => r.kind === 'max_load')).toBe(false);
  });

  it('treats the first ever result as a record', () => {
    const all = [set({ id: 'x', session_id: 's9', reps: 3, load_kg: 20, completed_at: '2026-04-01T08:00:00.000Z' })];
    expect(detectNewRecords(all, 's9').length).toBeGreaterThan(0);
  });

  it('returns nothing for a session with no sets', () => {
    expect(detectNewRecords(history, 'missing')).toEqual([]);
  });

  it('tracks duration and distance records separately', () => {
    const sets = [
      set({ id: 'd', exercise_id: 'plank', duration_seconds: 60 }),
      set({ id: 'e', exercise_id: 'row', distance_meters: 500 }),
    ];
    const records = computePersonalRecords(sets);
    expect(records.find((r) => r.kind === 'max_duration')?.value).toBe(60);
    expect(records.find((r) => r.kind === 'max_distance')?.value).toBe(500);
  });
});

describe('movement balance', () => {
  const exercises = [
    { id: 'squat', movement_category: 'squat' },
    { id: 'press', movement_category: 'push' },
  ] as Exercise[];

  it('counts sets per movement category', () => {
    const sets = [
      set({ id: '1', exercise_id: 'squat' }),
      set({ id: '2', exercise_id: 'squat' }),
      set({ id: '3', exercise_id: 'press' }),
    ];
    expect(movementBalance(sets, exercises)).toEqual([
      { category: 'squat', count: 2 },
      { category: 'push', count: 1 },
    ]);
  });

  it('ignores sets for unknown exercises', () => {
    expect(movementBalance([set({ exercise_id: 'gone' })], exercises)).toEqual([]);
  });
});

describe('effort and consistency', () => {
  const session = (effort: number | null, completedAt: string | null): WorkoutSession =>
    ({
      id: completedAt ?? 'x',
      status: completedAt ? 'completed' : 'active',
      completed_at: completedAt,
      average_effort: effort,
    }) as WorkoutSession;

  it('averages recorded effort', () => {
    expect(averageEffort([session(6, 'a'), session(8, 'b'), session(null, 'c')])).toBe(7);
  });

  it('returns null with no effort data', () => {
    expect(averageEffort([session(null, 'a')])).toBeNull();
  });

  it('computes the share of active weeks', () => {
    const weeks = ['w1', 'w2', 'w3', 'w4'];
    const sessions = [session(7, 'w1'), session(7, 'w3')];
    expect(consistencyPercent(sessions, weeks, (iso) => iso)).toBe(50);
  });

  it('returns zero with no weeks', () => {
    expect(consistencyPercent([], [], (iso) => iso)).toBe(0);
  });
});
