/**
 * "Barak Workout Military" - the session, and the maths the live screen runs on.
 *
 * Sixteen rounds of a 140 metre run out and back and four clean and jerks.
 * The screen counts the rounds, runs a clock, estimates the burn and - the
 * only genuinely interesting part - rewrites its own deadline when the pace
 * says thirty minutes was never going to be enough.
 *
 * On calories. The club's standing rule is that it does not deal in calorie
 * targets, and this is a deliberate exception the owner asked for twice. It is
 * still held to one thing: a calorie figure is arithmetic on body weight, and
 * without a weight on file there is no number here at all. A burn estimate
 * with the weight guessed is not an estimate, it is a decoration.
 */

export const ROUNDS = 16;
/** Out and back, so a round covers twice this. */
export const RUN_METRES = 140;
export const CLEAN_AND_JERKS = 4;
export const LOAD_KG = 40;
export const TARGET_KCAL = 400;
export const BASE_SECONDS = 30 * 60;

/**
 * Metabolic equivalent for this piece of work.
 *
 * A round is a 280 metre run at pace plus four heavy clean and jerks, which
 * sits with vigorous circuit training rather than with either steady running
 * or ordinary lifting. 9.5 is the usual figure for that mix and it is the one
 * number here that is a judgement rather than a measurement - which is exactly
 * why what comes out of it is always called an estimate.
 */
export const MET = 9.5;

/**
 * Burn so far, in kilocalories.
 *
 * Null when there is no weight on file: the formula is MET x 3.5 x kg / 200,
 * and with the kg invented the answer is fiction wearing a number's clothes.
 */
export function caloriesBurned(weightKg: number | null, elapsedSeconds: number): number | null {
  if (!weightKg || !Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return 0;
  const perMinute = (MET * 3.5 * weightKg) / 200;
  return Math.round((perMinute * elapsedSeconds) / 60);
}

/** 0-100 toward the 400 kcal target. Null when the burn is unknown. */
export function calorieProgress(weightKg: number | null, elapsedSeconds: number): number | null {
  const burned = caloriesBurned(weightKg, elapsedSeconds);
  if (burned === null) return null;
  return Math.min(100, Math.round((burned / TARGET_KCAL) * 100));
}

/** Average seconds a round has actually taken. Null before the first one lands. */
export function averageRoundSeconds(roundsDone: number, elapsedSeconds: number): number | null {
  if (roundsDone <= 0) return null;
  return elapsedSeconds / roundsDone;
}

/**
 * How long the clock should run for.
 *
 * Starts at thirty minutes. Once there is a pace to go on, the clock is given
 * however long sixteen rounds will actually take at that pace - rounded up to
 * a whole minute, because a deadline of 34:12 is not a deadline anybody reads.
 *
 * It only ever grows. Moving quickly should not shorten the clock underneath
 * somebody mid-round, and a fast first round says very little about the
 * sixteenth.
 */
export function allowanceSeconds(roundsDone: number, elapsedSeconds: number): number {
  const average = averageRoundSeconds(roundsDone, elapsedSeconds);
  if (average === null) return BASE_SECONDS;
  const projected = average * ROUNDS;
  if (projected <= BASE_SECONDS) return BASE_SECONDS;
  return Math.ceil(projected / 60) * 60;
}

/** Whole minutes added beyond the original thirty. 0 while on schedule. */
export function extraMinutes(roundsDone: number, elapsedSeconds: number): number {
  return Math.round((allowanceSeconds(roundsDone, elapsedSeconds) - BASE_SECONDS) / 60);
}

export interface MilitarySummary {
  roundsDone: number;
  rounds: number;
  elapsedSeconds: number;
  /** Null when no weight is on file. */
  caloriesBurned: number | null;
  calorieProgress: number | null;
  averageRoundSeconds: number | null;
  extraMinutes: number;
  finished: boolean;
}

/** What the member sees when they stop, whether they finished or not. */
export function summarise(
  roundsDone: number,
  elapsedSeconds: number,
  weightKg: number | null,
): MilitarySummary {
  const done = Math.max(0, Math.min(ROUNDS, Math.round(roundsDone)));
  return {
    roundsDone: done,
    rounds: ROUNDS,
    elapsedSeconds: Math.max(0, Math.round(elapsedSeconds)),
    caloriesBurned: caloriesBurned(weightKg, elapsedSeconds),
    calorieProgress: calorieProgress(weightKg, elapsedSeconds),
    averageRoundSeconds: averageRoundSeconds(done, elapsedSeconds),
    extraMinutes: extraMinutes(done, elapsedSeconds),
    finished: done >= ROUNDS,
  };
}
