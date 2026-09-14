import { describe, expect, it } from 'vitest';
import { breakthroughPlan, diagnose, type PlateauInput } from '@/lib/domain/coach/plateau';
import { WEAK_POINTS, prioritise } from '@/lib/domain/coach/weak-points';

const healthy: PlateauInput = {
  weeksStuck: 2,
  sleepHours: 8,
  stress: 'low',
  proteinPerKg: 2,
  calories: 'maintenance',
  weeksSinceDeload: 3,
  weeksOnProgramme: 6,
  sessionsPerWeek: 4,
  yearsTraining: 2,
};

describe('diagnosing a plateau', () => {
  it('puts the biggest problem first', () => {
    const causes = diagnose({ ...healthy, sleepHours: 5, weeksSinceDeload: 20 });
    expect(causes[0].id).toBe('sleep');
    expect(causes.map((cause) => cause.id)).toContain('deload');
  });

  it('does not invent a problem that is not in the answers', () => {
    const causes = diagnose(healthy);
    for (const absent of ['sleep', 'stress', 'protein', 'calories', 'deload', 'staleness']) {
      expect(
        causes.map((cause) => cause.id),
        `${absent} was reported as fine and should not be listed`,
      ).not.toContain(absent);
    }
  });

  it('is ordered strictly by score', () => {
    const causes = diagnose({ ...healthy, sleepHours: 6, stress: 'high', proteinPerKg: 1 });
    const scores = causes.map((cause) => cause.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it('always gives something to do, even when nothing is obviously wrong', () => {
    const causes = diagnose(healthy);
    expect(causes.length).toBeGreaterThan(0);
    for (const cause of causes) {
      expect(cause.fix.length, cause.id).toBeGreaterThan(60);
      expect(cause.evidence.length, cause.id).toBeGreaterThan(5);
    }
  });

  /*
   * The order matters more than the content: changing a programme while
   * sleeping five hours only changes which programme is not working.
   */
  it('fixes recovery before it touches the programme', () => {
    const plan = breakthroughPlan(diagnose({ ...healthy, sleepHours: 5 }));
    expect(plan).toHaveLength(8);
    expect(plan[0].actions.join(' ')).toMatch(/שינה/);
    const variationWeek = plan.findIndex((week) => week.headline.includes('וריאציה'));
    expect(variationWeek).toBeGreaterThan(0);
  });

  it('ends by establishing a new number to work from', () => {
    const plan = breakthroughPlan(diagnose(healthy));
    expect(plan[plan.length - 1].headline).toMatch(/שיא/);
  });
});

describe('weak points', () => {
  it('works on two at a time and parks the rest by name', () => {
    const { now, later } = prioritise(WEAK_POINTS.map((point) => point.id));
    expect(now).toHaveLength(2);
    expect(later.length).toBe(WEAK_POINTS.length - 2);
  });

  it('takes the lifts that fail before the muscles that lag', () => {
    const { now } = prioritise(['upper-chest', 'squat-hole', 'arms']);
    expect(now[0].id).toBe('squat-hole');
  });

  it('ignores an id it does not know instead of crashing', () => {
    expect(prioritise(['nonsense', 'arms']).now.map((p) => p.id)).toEqual(['arms']);
  });

  it('gives every weak point a cause, a fix, a timeline and a way to measure it', () => {
    for (const point of WEAK_POINTS) {
      expect(point.rootCauseWhy.length, point.id).toBeGreaterThan(40);
      expect(point.correctives.length, point.id).toBeGreaterThanOrEqual(2);
      expect(point.integration.length, point.id).toBeGreaterThan(30);
      expect(point.timeline, point.id).toMatch(/שבוע/);
      expect(point.markers.length, point.id).toBeGreaterThanOrEqual(2);
      for (const corrective of point.correctives) {
        expect(corrective.cue.length, `${point.id}/${corrective.name}`).toBeGreaterThan(20);
      }
    }
  });

  /*
   * A weak point is a training observation. The moment this file starts
   * describing how a body should look, it has become something else.
   */
  it('never describes how a body ought to look', () => {
    for (const point of WEAK_POINTS) {
      const text = [point.label, point.rootCauseWhy, point.integration, ...point.markers].join(' ');
      expect(text, point.id).not.toMatch(/רזה|שמן|מושלם|אידיאלי|חטוב|להיראות|יפה יותר|קלוריות/);
    }
  });
});
