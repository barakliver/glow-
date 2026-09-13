import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCORE_TYPE,
  EMPTY_SCORE,
  comparableValue,
  formatScore,
  formatSeconds,
  hasScore,
  lowerIsBetter,
  progressNote,
  scoreColumns,
} from '@/lib/domain/workout-score';

describe('scoreColumns', () => {
  it('folds minutes and seconds into one total', () => {
    expect(scoreColumns('time', { minutes: 7, seconds: 32 }).result_seconds).toBe(452);
  });

  it('accepts a bare seconds value', () => {
    expect(scoreColumns('time', { seconds: 45 }).result_seconds).toBe(45);
  });

  it('drops fields the score type does not use', () => {
    const columns = scoreColumns('rounds_and_reps', {
      minutes: 12,
      seconds: 30,
      rounds: 8,
      reps: 4,
      weightKg: 60,
      completed: true,
    });
    expect(columns).toEqual({
      result_seconds: null,
      result_rounds: 8,
      result_reps: 4,
      result_weight_kg: null,
      completed: null,
    });
  });

  it('keeps reps alongside weight, because a lift is a weight and a count', () => {
    const columns = scoreColumns('weight', { weightKg: 82.5, reps: 3 });
    expect(columns.result_weight_kg).toBe(82.5);
    expect(columns.result_reps).toBe(3);
  });

  it('never records a negative result', () => {
    expect(scoreColumns('time', { minutes: -5, seconds: 0 }).result_seconds).toBe(0);
  });
});

describe('hasScore', () => {
  it('rejects an untouched form', () => {
    expect(hasScore('time', EMPTY_SCORE)).toBe(false);
    expect(hasScore('rounds_and_reps', EMPTY_SCORE)).toBe(false);
    expect(hasScore('weight', EMPTY_SCORE)).toBe(false);
    expect(hasScore('completion', EMPTY_SCORE)).toBe(false);
  });

  it('accepts "did not finish" as a real answer', () => {
    expect(hasScore('completion', { ...EMPTY_SCORE, completed: false })).toBe(true);
  });

  it('accepts a partial AMRAP round', () => {
    expect(hasScore('rounds_and_reps', { ...EMPTY_SCORE, result_rounds: 0, result_reps: 9 })).toBe(
      true,
    );
  });
});

describe('formatScore', () => {
  it('writes a finishing time as mm:ss', () => {
    expect(formatScore('time', { ...EMPTY_SCORE, result_seconds: 452 })).toBe('7:32');
  });

  it('grows to h:mm:ss for the long ones', () => {
    expect(formatSeconds(3 * 3600 + 4 * 60 + 5)).toBe('3:04:05');
  });

  it('pads the seconds', () => {
    expect(formatSeconds(305)).toBe('5:05');
  });

  it('writes an AMRAP as rounds plus reps', () => {
    expect(
      formatScore('rounds_and_reps', { ...EMPTY_SCORE, result_rounds: 18, result_reps: 12 }),
    ).toBe('18 + 12');
  });

  it('omits the plus when the round was exact', () => {
    expect(
      formatScore('rounds_and_reps', { ...EMPTY_SCORE, result_rounds: 20, result_reps: 0 }),
    ).toBe('20');
  });

  it('keeps half kilos and drops empty decimals', () => {
    expect(formatScore('weight', { ...EMPTY_SCORE, result_weight_kg: 82.5, result_reps: 3 })).toBe(
      '82.5 ק״ג × 3',
    );
    expect(formatScore('weight', { ...EMPTY_SCORE, result_weight_kg: 80, result_reps: 0 })).toBe(
      '80 ק״ג',
    );
  });

  it('says plainly when a workout was not finished', () => {
    expect(formatScore('completion', { ...EMPTY_SCORE, completed: false })).toBe('לא הושלם');
  });
});

describe('comparing a member against themselves', () => {
  it('treats a lower time as better and a higher count as better', () => {
    expect(lowerIsBetter('time')).toBe(true);
    expect(lowerIsBetter('rounds_and_reps')).toBe(false);
  });

  it('orders AMRAP results by rounds first, then by reps', () => {
    const a = comparableValue('rounds_and_reps', {
      ...EMPTY_SCORE,
      result_rounds: 18,
      result_reps: 0,
    })!;
    const b = comparableValue('rounds_and_reps', {
      ...EMPTY_SCORE,
      result_rounds: 17,
      result_reps: 40,
    })!;
    expect(a).toBeGreaterThan(b);
  });

  it('has nothing to compare on a completion workout', () => {
    expect(comparableValue('completion', { ...EMPTY_SCORE, completed: true })).toBeNull();
  });

  it('calls the first attempt a first attempt, not a setback', () => {
    const note = progressNote('time', { ...EMPTY_SCORE, result_seconds: 400, rx: true }, []);
    expect(note.kind).toBe('first');
  });

  it('reports an improvement against the previous best', () => {
    const note = progressNote(
      'time',
      { ...EMPTY_SCORE, result_seconds: 380, rx: true },
      [
        { ...EMPTY_SCORE, result_seconds: 420, rx: true },
        { ...EMPTY_SCORE, result_seconds: 460, rx: true },
      ],
    );
    expect(note).toEqual({ kind: 'improved', previous: '7:00' });
  });

  it('does not call a slower day a personal best', () => {
    const note = progressNote('time', { ...EMPTY_SCORE, result_seconds: 500, rx: true }, [
      { ...EMPTY_SCORE, result_seconds: 420, rx: true },
    ]);
    expect(note.kind).toBe('steady');
  });

  it('never scores a scaled attempt against an Rx one', () => {
    // A scaled AMRAP with easier movements beats the Rx number on paper.
    // Calling that a personal best would be a lie the member has to untangle.
    const note = progressNote(
      'rounds_and_reps',
      { ...EMPTY_SCORE, result_rounds: 25, result_reps: 0, rx: false },
      [{ ...EMPTY_SCORE, result_rounds: 18, result_reps: 0, rx: true }],
    );
    expect(note.kind).toBe('first');
  });
});

describe('DEFAULT_SCORE_TYPE', () => {
  it('gives every format a sensible default', () => {
    expect(DEFAULT_SCORE_TYPE.amrap).toBe('rounds_and_reps');
    expect(DEFAULT_SCORE_TYPE.for_time).toBe('time');
    expect(DEFAULT_SCORE_TYPE.strength).toBe('weight');
    expect(DEFAULT_SCORE_TYPE.flow).toBe('completion');
  });
});
