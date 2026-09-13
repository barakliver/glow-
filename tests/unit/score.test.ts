import { describe, expect, it } from 'vitest';
import {
  LEVELS,
  POINTS,
  computeScore,
  computeStreak,
  levelFor,
  type ScoreInput,
  weeklyGoal,
} from '@/lib/domain/score';

const NOW = new Date('2026-03-12T09:00:00.000Z'); // Thursday
const WEEK_START = new Date('2026-03-08T00:00:00.000Z'); // Sunday
const MONTH_START = new Date('2026-03-01T00:00:00.000Z');

function input(overrides: Partial<ScoreInput> = {}): ScoreInput {
  return {
    completedWorkouts: [],
    attendedClasses: [],
    readinessDays: [],
    personalRecords: 0,
    now: NOW,
    weekStart: WEEK_START,
    monthStart: MONTH_START,
    ...overrides,
  };
}

describe('levels', () => {
  it('are ordered and start at zero', () => {
    expect(LEVELS[0].minPoints).toBe(0);
    for (let i = 1; i < LEVELS.length; i += 1) {
      expect(LEVELS[i].minPoints).toBeGreaterThan(LEVELS[i - 1].minPoints);
      expect(LEVELS[i].ripeness).toBeGreaterThan(LEVELS[i - 1].ripeness);
    }
  });

  it('map points onto the right level', () => {
    expect(levelFor(0).key).toBe('seed');
    expect(levelFor(119).key).toBe('seed');
    expect(levelFor(120).key).toBe('sprout');
    expect(levelFor(999_999).key).toBe('perfect');
  });

  it('every level carries a Hebrew name and explanation', () => {
    for (const level of LEVELS) {
      expect(level.name).toMatch(/[֐-׿]/);
      expect(level.blurb).toMatch(/[֐-׿]/);
    }
  });
});

describe('points', () => {
  it('adds up each source', () => {
    const summary = computeScore(
      input({
        completedWorkouts: ['2026-03-09T09:00:00.000Z', '2026-03-10T09:00:00.000Z'],
        attendedClasses: ['2026-03-11T09:00:00.000Z'],
        readinessDays: ['2026-03-09', '2026-03-10', '2026-03-11'],
        personalRecords: 2,
      }),
    );
    // 2 workouts + 1 class + 3 readiness + 2 records + 1 streak week
    const expected =
      2 * POINTS.workout +
      1 * POINTS.classAttended +
      3 * POINTS.readiness +
      2 * POINTS.personalRecord +
      1 * POINTS.weeklyStreak;
    expect(summary.total).toBe(expected);
  });

  it('starts a new member at zero on the first level', () => {
    const summary = computeScore(input());
    expect(summary.total).toBe(0);
    expect(summary.level.key).toBe('seed');
    expect(summary.streakWeeks).toBe(0);
    expect(summary.breakdown).toHaveLength(0);
  });

  it('never returns a negative score', () => {
    const summary = computeScore(input({ personalRecords: -5 }));
    expect(summary.total).toBeGreaterThanOrEqual(0);
  });

  it('hides sources the member has not used yet', () => {
    const summary = computeScore(input({ completedWorkouts: ['2026-03-10T09:00:00.000Z'] }));
    expect(summary.breakdown.map((row) => row.key)).toEqual(['workout', 'weeklyStreak']);
  });
});

describe('week and month windows', () => {
  it('counts only activity inside the current week', () => {
    const summary = computeScore(
      input({
        completedWorkouts: [
          '2026-03-10T09:00:00.000Z', // this week
          '2026-03-03T09:00:00.000Z', // last week
        ],
      }),
    );
    expect(summary.thisWeek).toBe(POINTS.workout);
  });

  it('counts only activity inside the current month', () => {
    const summary = computeScore(
      input({
        attendedClasses: [
          '2026-03-05T09:00:00.000Z', // this month
          '2026-02-20T09:00:00.000Z', // last month
        ],
      }),
    );
    expect(summary.thisMonth).toBe(POINTS.classAttended);
  });

  it('filters readiness days by date key', () => {
    const summary = computeScore(
      input({ readinessDays: ['2026-03-09', '2026-02-25'] }),
    );
    expect(summary.thisMonth).toBe(POINTS.readiness);
  });

  it('keeps the lifetime total above the monthly total', () => {
    const summary = computeScore(
      input({
        completedWorkouts: ['2026-03-10T09:00:00.000Z', '2026-01-10T09:00:00.000Z'],
      }),
    );
    expect(summary.total).toBeGreaterThan(summary.thisMonth);
  });
});

describe('streaks', () => {
  it('counts consecutive active weeks', () => {
    const streak = computeStreak(
      [
        '2026-03-10T09:00:00.000Z', // current week
        '2026-03-03T09:00:00.000Z', // 1 back
        '2026-02-24T09:00:00.000Z', // 2 back
      ],
      NOW,
    );
    expect(streak).toBe(3);
  });

  it('does not break the streak just because this week is still young', () => {
    // Nothing logged yet this week, but last week and the one before were active.
    const streak = computeStreak(
      ['2026-03-03T09:00:00.000Z', '2026-02-24T09:00:00.000Z'],
      NOW,
    );
    expect(streak).toBe(2);
  });

  it('resets after a missed week', () => {
    const streak = computeStreak(
      ['2026-03-10T09:00:00.000Z', '2026-02-24T09:00:00.000Z'],
      NOW,
    );
    expect(streak).toBe(1);
  });

  it('is zero with no activity at all', () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it('is zero when the last activity is long past', () => {
    expect(computeStreak(['2025-10-01T09:00:00.000Z'], NOW)).toBe(0);
  });
});

describe('progress towards the next level', () => {
  it('reports the gap to the next level', () => {
    const summary = computeScore(input({ personalRecords: 4 })); // 100 points
    expect(summary.level.key).toBe('seed');
    expect(summary.nextLevel?.key).toBe('sprout');
    expect(summary.pointsToNext).toBe(20);
    expect(summary.levelProgress).toBeGreaterThan(0);
    expect(summary.levelProgress).toBeLessThan(100);
  });

  it('caps out at the top level', () => {
    const summary = computeScore(input({ personalRecords: 1000 }));
    expect(summary.level.key).toBe('perfect');
    expect(summary.nextLevel).toBeNull();
    expect(summary.pointsToNext).toBe(0);
    expect(summary.levelProgress).toBe(100);
  });

  it('progress stays within 0 and 100 across the whole range', () => {
    for (let records = 0; records < 120; records += 1) {
      const summary = computeScore(input({ personalRecords: records }));
      expect(summary.levelProgress).toBeGreaterThanOrEqual(0);
      expect(summary.levelProgress).toBeLessThanOrEqual(100);
    }
  });
});

describe('product guardrails', () => {
  it('awards nothing for anything but showing up and performing', () => {
    // The scoring surface is deliberately small: no weight, no measurements,
    // no appearance. If a new source is added, this test must be revisited.
    expect(Object.keys(POINTS).sort()).toEqual([
      'classAttended',
      'personalRecord',
      'readiness',
      'weeklyStreak',
      'workout',
    ]);
  });

  it('never mentions weight, calories or appearance in member-facing copy', () => {
    const copy = LEVELS.map((l) => `${l.name} ${l.blurb}`).join(' ');
    expect(copy).not.toMatch(/קלורי|משקל|הרזיה|שומן|מראה|בטן/);
  });
});

describe('weeklyGoal', () => {
  const weekStart = new Date('2026-09-13T00:00:00.000Z');
  const inWeek = (day: number) => new Date(`2026-09-1${day}T10:00:00.000Z`).toISOString();

  it('counts only sessions inside the current week', () => {
    const goal = weeklyGoal(3, ['2026-09-10T10:00:00.000Z', inWeek(4), inWeek(5)], weekStart);
    expect(goal.done).toBe(2);
    expect(goal.target).toBe(3);
    expect(goal.met).toBe(false);
  });

  it('fills the bar without going past it', () => {
    // Training more than the target is a good week, not a 200% bar.
    const goal = weeklyGoal(2, [inWeek(3), inWeek(4), inWeek(5), inWeek(6)], weekStart);
    expect(goal.progress).toBe(100);
    expect(goal.met).toBe(true);
    expect(goal.done).toBe(4);
  });

  it('reports an empty week plainly rather than dividing by zero', () => {
    expect(weeklyGoal(0, [], weekStart)).toEqual({
      target: 1,
      done: 0,
      progress: 0,
      met: false,
    });
  });

  it('is met exactly on the target', () => {
    const goal = weeklyGoal(2, [inWeek(3), inWeek(5)], weekStart);
    expect(goal.met).toBe(true);
    expect(goal.progress).toBe(100);
  });
});
