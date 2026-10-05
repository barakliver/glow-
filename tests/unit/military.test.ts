import { describe, expect, it } from 'vitest';
import {
  BASE_SECONDS,
  MET,
  ROUNDS,
  TARGET_KCAL,
  allowanceSeconds,
  averageRoundSeconds,
  caloriesBurned,
  calorieProgress,
  extraMinutes,
  summarise,
} from '@/lib/domain/military';

describe('the burn estimate', () => {
  it('is arithmetic on body weight, not a guess', () => {
    // MET x 3.5 x kg / 200 per minute, for ten minutes at 80kg.
    const expected = Math.round(((MET * 3.5 * 80) / 200) * 10);
    expect(caloriesBurned(80, 600)).toBe(expected);
  });

  /*
   * The one rule this exception is held to. Every other number on the screen
   * survives a missing weight; a calorie figure does not, because the formula
   * needs the kilograms and inventing them produces fiction with a number's
   * confidence.
   */
  it('refuses to produce a number with no weight on file', () => {
    for (const weight of [null, 0, -70, Number.NaN]) {
      expect(caloriesBurned(weight as number | null, 1800), String(weight)).toBeNull();
      expect(calorieProgress(weight as number | null, 1800), String(weight)).toBeNull();
    }
  });

  it('scales with weight and with time', () => {
    expect(caloriesBurned(90, 600)!).toBeGreaterThan(caloriesBurned(60, 600)!);
    expect(caloriesBurned(80, 1200)!).toBeGreaterThan(caloriesBurned(80, 600)!);
  });

  it('reports progress toward the target and stops at full', () => {
    expect(calorieProgress(80, 0)).toBe(0);
    const halfway = calorieProgress(80, 900);
    expect(halfway!).toBeGreaterThan(0);
    expect(halfway!).toBeLessThan(100);
    // Long past the target the bar fills rather than overflowing.
    expect(calorieProgress(80, 20_000)).toBe(100);
    expect(caloriesBurned(80, 20_000)!).toBeGreaterThan(TARGET_KCAL);
  });
});

describe('the clock that rewrites itself', () => {
  it('is thirty minutes until there is a pace to go on', () => {
    expect(allowanceSeconds(0, 0)).toBe(BASE_SECONDS);
    expect(allowanceSeconds(0, 400)).toBe(BASE_SECONDS);
    expect(extraMinutes(0, 400)).toBe(0);
  });

  it('stays at thirty minutes while the pace is good enough', () => {
    // 100s a round x 16 = 1600s, inside the half hour.
    expect(allowanceSeconds(4, 400)).toBe(BASE_SECONDS);
    expect(extraMinutes(4, 400)).toBe(0);
  });

  /*
   * The whole point. Four rounds at two minutes each projects to 32 minutes,
   * so the deadline moves to 32 rather than expiring on somebody who is still
   * working.
   */
  it('gives the clock the time sixteen rounds will actually take', () => {
    expect(allowanceSeconds(4, 480)).toBe(32 * 60);
    expect(extraMinutes(4, 480)).toBe(2);
  });

  it('rounds up to a whole minute, because nobody reads a deadline of 34:12', () => {
    // 8 rounds in 17:06 projects to 34:12.
    const allowance = allowanceSeconds(8, 1026);
    expect(allowance % 60).toBe(0);
    expect(allowance).toBe(35 * 60);
  });

  /*
   * It only ever grows. A quick opening round says very little about the
   * sixteenth, and shortening the clock under somebody mid-workout would be a
   * punishment for going well.
   */
  it('never shortens the clock when the pace is quick', () => {
    expect(allowanceSeconds(1, 30)).toBe(BASE_SECONDS);
    expect(allowanceSeconds(15, 60)).toBe(BASE_SECONDS);
  });

  it('keeps growing as the pace keeps slipping', () => {
    const early = allowanceSeconds(2, 240);
    const later = allowanceSeconds(4, 600);
    expect(later).toBeGreaterThan(early);
  });

  it('reports the average round honestly, and says nothing before the first', () => {
    expect(averageRoundSeconds(0, 300)).toBeNull();
    expect(averageRoundSeconds(5, 500)).toBe(100);
  });
});

describe('the summary when you stop', () => {
  it('counts what was finished, finished or not', () => {
    const stopped = summarise(7, 900, 80);
    expect(stopped.roundsDone).toBe(7);
    expect(stopped.rounds).toBe(ROUNDS);
    expect(stopped.finished).toBe(false);
    expect(stopped.caloriesBurned).toBe(caloriesBurned(80, 900));
  });

  it('knows when the whole thing was finished', () => {
    expect(summarise(16, 1700, 80).finished).toBe(true);
  });

  it('never reports more rounds than the workout has', () => {
    expect(summarise(40, 2000, 80).roundsDone).toBe(ROUNDS);
    expect(summarise(-3, 2000, 80).roundsDone).toBe(0);
  });

  it('still gives a summary with no weight, minus the calories', () => {
    const stopped = summarise(9, 1100, null);
    expect(stopped.roundsDone).toBe(9);
    expect(stopped.averageRoundSeconds).toBeCloseTo(1100 / 9);
    expect(stopped.caloriesBurned).toBeNull();
  });
});
