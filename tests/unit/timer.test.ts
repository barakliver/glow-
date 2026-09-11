import { describe, expect, it } from 'vitest';
import {
  buildTimeline,
  normalizeConfig,
  resolveState,
  seekPhase,
  TABATA_DEFAULT,
  totalDuration,
  type TimerConfig,
} from '@/lib/domain/timer';

const tabata = TABATA_DEFAULT;

describe('timeline construction', () => {
  it('builds the classic Tabata structure', () => {
    const timeline = buildTimeline(tabata);
    // prepare + 8 work + 7 rest (no rest after the final round)
    expect(timeline).toHaveLength(1 + 8 + 7);
    expect(timeline[0].kind).toBe('prepare');
    expect(timeline[1].kind).toBe('work');
    expect(timeline[2].kind).toBe('rest');
    expect(timeline[timeline.length - 1].kind).toBe('work');
  });

  it('computes the classic Tabata total duration', () => {
    // 10 prepare + 8*20 work + 7*10 rest = 240 seconds
    expect(totalDuration(tabata)).toBe(240);
  });

  it('omits zero-length phases', () => {
    const timeline = buildTimeline({ ...tabata, prepareSeconds: 0, restSeconds: 0 });
    expect(timeline.every((phase) => phase.kind === 'work')).toBe(true);
    expect(timeline).toHaveLength(8);
  });

  it('inserts rest between sets but not after the last one', () => {
    const config: TimerConfig = {
      ...tabata,
      rounds: 2,
      sets: 3,
      restBetweenSetsSeconds: 60,
      prepareSeconds: 0,
      cooldownSeconds: 0,
    };
    const timeline = buildTimeline(config);
    expect(timeline.filter((phase) => phase.kind === 'rest_set')).toHaveLength(2);
    expect(timeline[timeline.length - 1].kind).toBe('work');
  });

  it('appends a cooldown when configured', () => {
    const timeline = buildTimeline({ ...tabata, cooldownSeconds: 90 });
    expect(timeline[timeline.length - 1].kind).toBe('cooldown');
    expect(totalDuration({ ...tabata, cooldownSeconds: 90 })).toBe(330);
  });

  it('offsets are contiguous across the timeline', () => {
    const timeline = buildTimeline({ ...tabata, sets: 2, cooldownSeconds: 30 });
    for (let i = 1; i < timeline.length; i += 1) {
      expect(timeline[i].startOffset).toBe(timeline[i - 1].endOffset);
    }
  });

  it('numbers rounds and sets correctly', () => {
    const timeline = buildTimeline({
      ...tabata,
      rounds: 2,
      sets: 2,
      prepareSeconds: 0,
      restSeconds: 5,
      restBetweenSetsSeconds: 30,
    });
    const work = timeline.filter((phase) => phase.kind === 'work');
    expect(work.map((phase) => `${phase.set}-${phase.round}`)).toEqual([
      '1-1',
      '1-2',
      '2-1',
      '2-2',
    ]);
  });
});

describe('config normalisation', () => {
  it('clamps invalid values into a safe range', () => {
    const config = normalizeConfig({
      prepareSeconds: -10,
      workSeconds: 0,
      restSeconds: -5,
      rounds: 0,
      sets: 1000,
      restBetweenSetsSeconds: 99999,
      cooldownSeconds: Number.NaN,
    });
    expect(config.prepareSeconds).toBe(0);
    expect(config.workSeconds).toBe(1);
    expect(config.restSeconds).toBe(0);
    expect(config.rounds).toBe(1);
    expect(config.sets).toBe(99);
    expect(config.restBetweenSetsSeconds).toBe(3600);
    expect(config.cooldownSeconds).toBe(0);
  });
});

describe('phase resolution from elapsed time', () => {
  const timeline = buildTimeline(tabata);

  it('starts inside the prepare phase', () => {
    const state = resolveState(timeline, 0, tabata);
    expect(state.phase?.kind).toBe('prepare');
    expect(state.remainingInPhase).toBe(10);
    expect(state.nextPhase?.kind).toBe('work');
  });

  it('resolves the first work phase', () => {
    const state = resolveState(timeline, 10, tabata);
    expect(state.phase?.kind).toBe('work');
    expect(state.round).toBe(1);
    expect(state.remainingInPhase).toBe(20);
  });

  it('resolves a mid-session rest phase', () => {
    // 10 prepare + 20 work => rest starts at 30
    const state = resolveState(timeline, 35, tabata);
    expect(state.phase?.kind).toBe('rest');
    expect(state.remainingInPhase).toBe(5);
    expect(state.round).toBe(1);
  });

  it('resolves the final round', () => {
    const state = resolveState(timeline, 239, tabata);
    expect(state.phase?.kind).toBe('work');
    expect(state.round).toBe(8);
    expect(state.remainingInPhase).toBe(1);
    expect(state.nextPhase).toBeNull();
  });

  it('reports completion at and beyond the total duration', () => {
    expect(resolveState(timeline, 240, tabata).finished).toBe(true);
    expect(resolveState(timeline, 5000, tabata).finished).toBe(true);
    expect(resolveState(timeline, 240, tabata).remainingTotal).toBe(0);
  });

  it('is exact when elapsed jumps (backgrounded tab)', () => {
    // A tab throttled for 100 seconds still lands on the right phase.
    const before = resolveState(timeline, 12, tabata);
    const after = resolveState(timeline, 112, tabata);
    expect(before.round).toBe(1);
    expect(after.round).toBe(4);
    expect(after.phase?.kind).toBe('work');
  });

  it('total remaining decreases monotonically', () => {
    let previous = Number.POSITIVE_INFINITY;
    for (let t = 0; t <= 240; t += 7) {
      const state = resolveState(timeline, t, tabata);
      expect(state.remainingTotal).toBeLessThanOrEqual(previous);
      previous = state.remainingTotal;
    }
  });
});

describe('skip and previous', () => {
  const timeline = buildTimeline(tabata);

  it('skip jumps to the start of the next phase', () => {
    expect(seekPhase(timeline, 3, 'next')).toBe(10);
    expect(seekPhase(timeline, 12, 'next')).toBe(30);
  });

  it('previous restarts the current phase when already inside it', () => {
    expect(seekPhase(timeline, 25, 'previous')).toBe(10);
  });

  it('previous goes back a phase when pressed right after a change', () => {
    expect(seekPhase(timeline, 30.5, 'previous')).toBe(10);
  });

  it('previous at the very start stays at zero', () => {
    expect(seekPhase(timeline, 0, 'previous')).toBe(0);
  });

  it('skip on the last phase lands on the total duration', () => {
    expect(seekPhase(timeline, 239, 'next')).toBe(240);
  });

  it('handles an empty timeline safely', () => {
    expect(seekPhase([], 10, 'next')).toBe(0);
  });
});
