import { describe, expect, it } from 'vitest';
import { matchMovement, demonstrationUrl } from '@/lib/domain/movement-guide';
import { MOVEMENT_GUIDES } from '@/lib/data/movements';
import { CROSSFIT_WORKOUTS } from '@/lib/data/workouts/crossfit';
import { FUNCTIONAL_WORKOUTS } from '@/lib/data/workouts/functional';
import { PILATES_WORKOUTS } from '@/lib/data/workouts/pilates';
import { YOGA_WORKOUTS } from '@/lib/data/workouts/yoga';

/** Every movement line in the library, as the member sees it. */
function everyLine(): string[] {
  const lines: string[] = [];
  for (const workout of [
    ...CROSSFIT_WORKOUTS,
    ...FUNCTIONAL_WORKOUTS,
    ...PILATES_WORKOUTS,
    ...YOGA_WORKOUTS,
  ]) {
    lines.push(...workout.warmup);
    for (const block of workout.structure) lines.push(...block.items);
    lines.push(...workout.cooldown);
  }
  return lines.map((line) => line.split(' | ')[0].trim());
}

describe('tapping a movement', () => {
  it('opens something for every movement in the library', () => {
    const stuck = everyLine().filter((label) => {
      const match = matchMovement(label);
      // null is a deliberate answer for a block heading; the failure we care
      // about is a movement that matches nothing and offers no search either.
      return match !== null && match.query.trim() === '';
    });
    expect(stuck).toEqual([]);
  });

  /*
   * The write-ups are the point. A search link alone is a fallback, and if the
   * library grows away from the guides this is what says so out loud rather
   * than letting coverage rot one workout at a time.
   */
  it('has a written-up movement behind almost every line', () => {
    const lines = everyLine();
    const movements = lines.filter((label) => matchMovement(label) !== null);
    const guided = movements.filter((label) => matchMovement(label)?.guide);
    const share = guided.length / movements.length;
    expect(share, `${(share * 100).toFixed(1)}% of movement lines have a write-up`).toBeGreaterThan(
      0.95,
    );
  });

  it('leaves block headings and minute markers alone', () => {
    for (const label of ['בלוק 1', 'דקה 3', 'דקות זוגיות', 'אין בלוק כוח נפרד היום']) {
      expect(matchMovement(label), label).toBeNull();
    }
  });

  /*
   * These read like movements and are not: the digit after the colon means the
   * line is prescribing a round. The Hebrew ones also guard a real trap - a
   * JavaScript word boundary is defined against [A-Za-z0-9_], so /^שומרים\b/
   * matches nothing at all and the pattern silently never fires.
   */
  it('leaves a prescribed round alone', () => {
    for (const label of [
      'מוט ריק: 10 סקוואטים, 2 סבבים',
      'סבב חימום: 5 משיכות, 10 שכיבות, 15 סקוואטים',
      'שומרים הכול למטקון',
    ]) {
      expect(matchMovement(label), label).toBeNull();
    }
  });

  it('reads the movement out of a line that names its setup first', () => {
    expect(matchMovement('מוט ריק: דדליפט')?.guide?.id).toBe('deadlift');
    expect(matchMovement('מוט ריק: תראסטרים')?.guide?.id).toBe('thruster');
  });

  it('keeps a variant apart from the movement it contains', () => {
    expect(matchMovement('Romanian Deadlift')?.guide?.id).toBe('romanian-deadlift');
    expect(matchMovement('Deadlift')?.guide?.id).toBe('deadlift');
    expect(matchMovement('Sumo Deadlift High Pull')?.guide?.id).toBe('sumo-deadlift-high-pull');
  });

  it('sees through the adjectives a coach adds', () => {
    expect(matchMovement('סווינג קטלבל קל')?.guide?.id).toBe('kettlebell-swing');
    expect(matchMovement('שכיבות סמיכה בהטיה')?.guide?.id).toBe('push-up');
    expect(matchMovement('גשר ירך איטי')?.guide?.id).toBe('glute-bridge');
  });

  it('searches under the name the movement is actually taught by', () => {
    const match = matchMovement('סווינג קטלבל קל');
    expect(demonstrationUrl(match!.query)).toContain(encodeURIComponent('Kettlebell Swing'));
  });
});

describe('the write-ups themselves', () => {
  it('gives every movement a name in both languages and something to do', () => {
    for (const guide of MOVEMENT_GUIDES) {
      expect(guide.he.trim(), guide.id).not.toBe('');
      expect(guide.en.trim(), guide.id).not.toBe('');
      expect(guide.cues.length, guide.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('never prescribes a load', () => {
    // The library refuses to say how much to lift; the cues must not smuggle
    // it back in through the side door.
    for (const guide of MOVEMENT_GUIDES) {
      const text = [...guide.cues, guide.watch ?? ''].join(' ');
      expect(text, guide.id).not.toMatch(/\d+\s*(ק"ג|קילו|kg)/i);
    }
  });

  it('describes what a movement does, never what a body should look like', () => {
    for (const guide of MOVEMENT_GUIDES) {
      const text = [guide.he, ...guide.cues, guide.watch ?? ''].join(' ');
      expect(text, guide.id).not.toMatch(/קלוריות|הרזיה|לרזות|שומן בטן|מראה|חטוב יותר/);
    }
  });

  it('has no two movements answering to the same name', () => {
    const seen = new Map<string, string>();
    for (const guide of MOVEMENT_GUIDES) {
      for (const key of [guide.he, guide.en, ...(guide.aliases ?? [])]) {
        const normal = key.trim().toLowerCase();
        const owner = seen.get(normal);
        expect(owner, `"${key}" is claimed by both ${owner} and ${guide.id}`).toBeUndefined();
        seen.set(normal, guide.id);
      }
    }
  });
});
