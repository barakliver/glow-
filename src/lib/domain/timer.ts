/**
 * Interval timer engine.
 * The whole timeline is pre-computed into a flat phase list, so the UI only
 * needs a single elapsed-milliseconds number (derived from timestamps) to know
 * exactly where it is. Tab switching, sleep and throttled rAF cannot drift it.
 */

export type TimerPhaseKind = 'prepare' | 'work' | 'rest' | 'rest_set' | 'cooldown' | 'done';

export interface TimerConfig {
  prepareSeconds: number;
  workSeconds: number;
  restSeconds: number;
  rounds: number;
  sets: number;
  restBetweenSetsSeconds: number;
  cooldownSeconds: number;
}

export const TABATA_DEFAULT: TimerConfig = {
  prepareSeconds: 10,
  workSeconds: 20,
  restSeconds: 10,
  rounds: 8,
  sets: 1,
  restBetweenSetsSeconds: 60,
  cooldownSeconds: 0,
};

export interface TimerPhase {
  index: number;
  kind: TimerPhaseKind;
  seconds: number;
  /** 1-based, null for prepare/cooldown/set-rest. */
  round: number | null;
  /** 1-based. */
  set: number;
  startOffset: number;
  endOffset: number;
}

export const PHASE_LABELS: Record<TimerPhaseKind, string> = {
  prepare: 'היכונו',
  work: 'עבודה',
  rest: 'מנוחה',
  rest_set: 'מנוחה בין סטים',
  cooldown: 'שחרור',
  done: 'סיום',
};

export function normalizeConfig(config: TimerConfig): TimerConfig {
  return {
    prepareSeconds: clampInt(config.prepareSeconds, 0, 600),
    workSeconds: clampInt(config.workSeconds, 1, 3600),
    restSeconds: clampInt(config.restSeconds, 0, 3600),
    rounds: clampInt(config.rounds, 1, 99),
    sets: clampInt(config.sets, 1, 99),
    restBetweenSetsSeconds: clampInt(config.restBetweenSetsSeconds, 0, 3600),
    cooldownSeconds: clampInt(config.cooldownSeconds, 0, 3600),
  };
}

function clampInt(value: number, min: number, max: number): number {
  const n = Math.round(Number.isFinite(value) ? value : min);
  return Math.min(max, Math.max(min, n));
}

/** Expands a config into an ordered phase timeline with absolute offsets. */
export function buildTimeline(rawConfig: TimerConfig): TimerPhase[] {
  const config = normalizeConfig(rawConfig);
  const phases: TimerPhase[] = [];
  let offset = 0;
  let index = 0;

  const push = (kind: TimerPhaseKind, seconds: number, round: number | null, set: number) => {
    if (seconds <= 0) return;
    phases.push({
      index: index++,
      kind,
      seconds,
      round,
      set,
      startOffset: offset,
      endOffset: offset + seconds,
    });
    offset += seconds;
  };

  push('prepare', config.prepareSeconds, null, 1);

  for (let set = 1; set <= config.sets; set += 1) {
    for (let round = 1; round <= config.rounds; round += 1) {
      push('work', config.workSeconds, round, set);
      const isLastRoundOfSet = round === config.rounds;
      if (!isLastRoundOfSet) push('rest', config.restSeconds, round, set);
    }
    if (set < config.sets) push('rest_set', config.restBetweenSetsSeconds, null, set);
  }

  push('cooldown', config.cooldownSeconds, null, config.sets);
  return phases;
}

export function totalDuration(config: TimerConfig): number {
  const timeline = buildTimeline(config);
  return timeline.length === 0 ? 0 : timeline[timeline.length - 1].endOffset;
}

export interface TimerState {
  phase: TimerPhase | null;
  nextPhase: TimerPhase | null;
  /** Seconds remaining inside the current phase, rounded up. */
  remainingInPhase: number;
  /** Seconds remaining for the whole session. */
  remainingTotal: number;
  elapsed: number;
  finished: boolean;
  round: number | null;
  set: number;
  totalRounds: number;
  totalSets: number;
  progress: number;
}

/** Resolves the timer state from elapsed seconds. Pure and drift-free. */
export function resolveState(timeline: TimerPhase[], elapsedSeconds: number, config: TimerConfig): TimerState {
  const total = timeline.length === 0 ? 0 : timeline[timeline.length - 1].endOffset;
  const elapsed = Math.max(0, Math.min(elapsedSeconds, total));
  const finished = timeline.length === 0 || elapsedSeconds >= total;

  if (finished) {
    return {
      phase: null,
      nextPhase: null,
      remainingInPhase: 0,
      remainingTotal: 0,
      elapsed: total,
      finished: true,
      round: null,
      set: config.sets,
      totalRounds: config.rounds,
      totalSets: config.sets,
      progress: 1,
    };
  }

  const phase = timeline.find((p) => elapsed >= p.startOffset && elapsed < p.endOffset) ?? timeline[0];
  const nextPhase = timeline[phase.index + 1] ?? null;

  return {
    phase,
    nextPhase,
    remainingInPhase: Math.ceil(phase.endOffset - elapsed - 1e-6),
    remainingTotal: Math.ceil(total - elapsed - 1e-6),
    elapsed,
    finished: false,
    round: phase.round,
    set: phase.set,
    totalRounds: config.rounds,
    totalSets: config.sets,
    progress: total === 0 ? 0 : elapsed / total,
  };
}

/** Offset of the phase boundary to jump to when pressing skip / previous. */
export function seekPhase(
  timeline: TimerPhase[],
  elapsedSeconds: number,
  direction: 'next' | 'previous',
): number {
  if (timeline.length === 0) return 0;
  const total = timeline[timeline.length - 1].endOffset;
  const clamped = Math.max(0, Math.min(elapsedSeconds, total));
  const current =
    timeline.find((p) => clamped >= p.startOffset && clamped < p.endOffset) ??
    timeline[timeline.length - 1];

  if (direction === 'next') {
    return current.endOffset >= total ? total : current.endOffset;
  }
  // Pressing previous restarts the current phase unless we just entered it.
  const intoPhase = clamped - current.startOffset;
  if (intoPhase > 1.2 || current.index === 0) return current.startOffset;
  return timeline[current.index - 1].startOffset;
}

export const PHASE_TONE: Record<TimerPhaseKind, { color: string; ring: string }> = {
  prepare: { color: '#F4C45E', ring: 'rgba(244,196,94,0.45)' },
  work: { color: '#C7FF4A', ring: 'rgba(199,255,74,0.5)' },
  rest: { color: '#70E1A3', ring: 'rgba(112,225,163,0.45)' },
  rest_set: { color: '#70E1A3', ring: 'rgba(112,225,163,0.35)' },
  cooldown: { color: '#ADB7B0', ring: 'rgba(173,183,176,0.35)' },
  done: { color: '#C7FF4A', ring: 'rgba(199,255,74,0.55)' },
};
