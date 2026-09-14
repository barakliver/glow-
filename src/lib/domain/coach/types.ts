import type { Difficulty } from '@/lib/domain/types';

/**
 * The coach.
 *
 * Everything under this folder is a pure function of what the member typed.
 * No model, no network, no key, no cost, and the same answer every time - which
 * for a programme matters more than it sounds: a plan you cannot reproduce is a
 * plan you cannot follow up on in six weeks.
 *
 * On loads. The workout library never prints a weight, on purpose: a number on
 * a whiteboard is wrong for most of the room. A programme is the one place
 * that rule does not apply, because the numbers here are computed from the
 * member's OWN maxes and are theirs by definition. Where a max is missing the
 * programme says nothing about kilograms and prescribes effort instead - never
 * a guess dressed up as a number.
 */

/** The four lifts a programme is built around. All optional. */
export interface OneRepMaxes {
  squat: number | null;
  bench: number | null;
  deadlift: number | null;
  press: number | null;
}

export type LiftKey = keyof OneRepMaxes;

export interface ProgrammeInput {
  oneRm: OneRepMaxes;
  /** Sessions a week the member can actually make. */
  daysPerWeek: number;
  /** Minutes per session, the honest number rather than the hopeful one. */
  sessionMinutes: number;
  experience: Difficulty;
}

export interface Prescription {
  sets: number;
  /** "8-10", "5", "AMRAP" - a string because ranges are the norm. */
  reps: string;
  /** Percent of the member's own 1RM, when one was given. */
  percent: number | null;
  /** Weight in kg, computed from their max. Null when there is no max. */
  kg: number | null;
  /** Reps in reserve. Always present - this is what carries a set with no max. */
  rir: number;
  /** Eccentric-pause-concentric-pause, as coaches write it. */
  tempo: string;
  restSeconds: number;
}

export type Slot = 'main' | 'secondary' | 'accessory' | 'finisher';

export interface PlannedMovement {
  name: string;
  slot: Slot;
  prescription: Prescription;
  /** Why this movement is in this slot on this day. */
  why: string;
}

export interface PlannedSession {
  /** 1-based within the week. */
  day: number;
  title: string;
  focus: string;
  movements: PlannedMovement[];
  /** Rough minutes, from sets and rest. Checked against the member's cap. */
  estimatedMinutes: number;
}

export interface PlannedWeek {
  index: number;
  blockName: string;
  /** One line on what this week is for. */
  intent: string;
  deload: boolean;
  sessions: PlannedSession[];
}

export interface Programme {
  model: string;
  modelWhy: string;
  splitName: string;
  splitWhy: string;
  weeks: PlannedWeek[];
  /** Anything the input could not support, said out loud. */
  caveats: string[];
}
