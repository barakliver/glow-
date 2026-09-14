import { describe, expect, it } from 'vitest';
import { buildProgramme, toPlate } from '@/lib/domain/coach/programme';
import type { ProgrammeInput } from '@/lib/domain/coach/types';

const base: ProgrammeInput = {
  oneRm: { squat: 120, bench: 90, deadlift: 150, press: 55 },
  daysPerWeek: 4,
  sessionMinutes: 60,
  experience: 'intermediate',
};

describe('the twelve week programme', () => {
  it('runs twelve weeks in three blocks, each closed by a deload', () => {
    const programme = buildProgramme(base);
    expect(programme.weeks).toHaveLength(12);
    expect(programme.weeks.filter((week) => week.deload).map((week) => week.index)).toEqual([
      4, 8, 12,
    ]);
    expect(new Set(programme.weeks.map((week) => week.blockName)).size).toBe(3);
  });

  /*
   * The whole model in one assertion: volume comes down as intensity goes up.
   * If a change ever makes the last block both heavier AND higher volume, this
   * is what says so.
   */
  it('trades volume for intensity as the blocks go on', () => {
    const programme = buildProgramme(base);
    const main = (week: number) =>
      programme.weeks[week - 1].sessions[0].movements.find((m) => m.slot === 'main')!.prescription;

    expect(main(1).percent!).toBeLessThan(main(5).percent!);
    expect(main(5).percent!).toBeLessThan(main(9).percent!);
    expect(Number(main(1).reps.split('-')[0])).toBeGreaterThan(Number(main(9).reps.split('-')[0]));
  });

  it('gets lighter in a deload, not just shorter', () => {
    const programme = buildProgramme(base);
    const week3 = programme.weeks[2].sessions[0].movements[0].prescription;
    const week4 = programme.weeks[3].sessions[0].movements[0].prescription;
    expect(week4.percent!).toBeLessThan(week3.percent!);
    expect(week4.sets).toBeLessThan(week3.sets);
    expect(week4.rir).toBeGreaterThan(week3.rir);
  });

  it('loads every main lift off the member’s own max, rounded to real plates', () => {
    const programme = buildProgramme(base);
    const main = programme.weeks[0].sessions[0].movements[0].prescription;
    expect(main.kg).toBe(toPlate((120 * main.percent!) / 100));
    expect((main.kg! * 10) % 25).toBe(0);
  });

  /*
   * The club's standing rule is that it never tells anybody what to lift. A
   * programme is the one exception, and only because the number is computed
   * from the member's own max - so with no max there must be no number, not a
   * guessed one.
   */
  it('says nothing about kilograms when it was given no max', () => {
    const programme = buildProgramme({
      ...base,
      oneRm: { squat: null, bench: null, deadlift: null, press: null },
    });
    for (const week of programme.weeks) {
      for (const session of week.sessions) {
        for (const movement of session.movements) {
          expect(movement.prescription.kg, movement.name).toBeNull();
          expect(movement.prescription.percent, movement.name).toBeNull();
          // Effort still has to be prescribed, or the set means nothing.
          expect(movement.prescription.rir, movement.name).toBeGreaterThanOrEqual(0);
        }
      }
    }
    expect(programme.caveats.join(' ')).toMatch(/לא הזנת שיא/);
  });

  it('gives a different split for every realistic week, and explains it', () => {
    const names = new Set<string>();
    for (let days = 2; days <= 6; days += 1) {
      const programme = buildProgramme({ ...base, daysPerWeek: days });
      expect(programme.weeks[0].sessions).toHaveLength(days);
      expect(programme.splitWhy.length).toBeGreaterThan(40);
      names.add(programme.splitName);
    }
    expect(names.size).toBe(5);
  });

  it('clamps a week nobody can train rather than producing nonsense', () => {
    expect(buildProgramme({ ...base, daysPerWeek: 0 }).weeks[0].sessions).toHaveLength(2);
    expect(buildProgramme({ ...base, daysPerWeek: 99 }).weeks[0].sessions).toHaveLength(6);
  });

  /*
   * A plan that does not fit the hour the member actually has is not a plan.
   * Accessories drop out; the main lift never does.
   */
  it('fits the time it was given, and cuts accessories rather than the main lift', () => {
    for (const minutes of [30, 45, 60, 90]) {
      const programme = buildProgramme({ ...base, sessionMinutes: minutes });
      for (const week of programme.weeks) {
        for (const session of week.sessions) {
          expect(
            session.estimatedMinutes,
            `${minutes}min budget, ${session.title} came to ${session.estimatedMinutes}`,
          ).toBeLessThanOrEqual(Math.max(30, minutes));
          expect(session.movements.some((m) => m.slot === 'main'), session.title).toBe(true);
        }
      }
    }
  });

  it('explains why every movement is there', () => {
    const programme = buildProgramme(base);
    for (const movement of programme.weeks[0].sessions.flatMap((s) => s.movements)) {
      expect(movement.why.length, movement.name).toBeGreaterThan(25);
    }
  });

  it('is the same plan twice, because a plan you cannot reproduce is useless', () => {
    expect(JSON.stringify(buildProgramme(base))).toBe(JSON.stringify(buildProgramme(base)));
  });
});

describe('using the time it was given', () => {
  /*
   * The opposite failure to overrunning, and the easier one to ship: a
   * 60-minute slot that prescribed 37 minutes of work passed every budget
   * check while quietly short-changing the member.
   */
  it('fills a session close to the budget instead of stopping early', () => {
    for (const minutes of [45, 60, 75, 90]) {
      const programme = buildProgramme({ ...base, sessionMinutes: minutes });
      const working = programme.weeks[0].sessions[0];
      /*
       * Up to a point. A 90-minute slot should NOT become 90 minutes of
       * prescribed work: past about seven movements an intermediate is padding
       * rather than training, and the extra time is better spent on warm-up
       * ramps and not rushing the rests. So the floor stops climbing at
       * roughly an hour of actual work however long the slot is.
       */
      const expected = Math.min(minutes - 14, 62);
      expect(
        working.estimatedMinutes,
        `${minutes}min slot only prescribed ${working.estimatedMinutes}min`,
      ).toBeGreaterThanOrEqual(expected);
      expect(working.estimatedMinutes).toBeLessThanOrEqual(minutes);
    }
  });

  it('still leaves a deload short, because that is the point of a deload', () => {
    const programme = buildProgramme({ ...base, sessionMinutes: 75 });
    const hard = programme.weeks[0].sessions[0].estimatedMinutes;
    const deload = programme.weeks[3].sessions[0].estimatedMinutes;
    expect(deload).toBeLessThan(hard);
  });
});
