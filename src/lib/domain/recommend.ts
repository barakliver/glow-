/**
 * Transparent, rule-based workout recommendation engine.
 *
 * No external AI service. Every template gets a score built from explicit,
 * auditable rules, and the winning rule produces the Hebrew reason sentence
 * shown to the member.
 *
 * Product guardrails: the engine never reasons about calories, appearance,
 * body comparison or weight loss. Only performance, recovery and consistency.
 */
import type {
  BodyArea,
  Difficulty,
  Equipment,
  MovementCategory,
  TrainingGoal,
  WorkoutTemplate,
} from '@/lib/domain/types';
import { GOAL_LABELS } from '@/lib/labels';

export interface RecentWorkoutSummary {
  /** Hours since the session finished. */
  hoursAgo: number;
  movementCategories: MovementCategory[];
  focusAreas: BodyArea[];
  averageEffort: number | null;
}

export interface RecommendationInput {
  templates: WorkoutTemplate[];
  recentWorkouts: RecentWorkoutSummary[];
  readiness: {
    energy: number;
    soreness: number;
    sleepQuality: number;
    availableMinutes: number;
  } | null;
  availableEquipment: Equipment[];
  preferredGoal: TrainingGoal | null;
  experienceLevel: Difficulty;
  /** Hours until the next booked class, if any. */
  upcomingClassInHours: number | null;
  upcomingClassCategory: string | null;
}

export interface Recommendation {
  template: WorkoutTemplate;
  score: number;
  /** One short Hebrew sentence. */
  reason: string;
  /** Machine-readable rule identifiers, exposed in the UI as "why". */
  signals: string[];
}

export const DURATION_OPTIONS = [20, 30, 45, 60] as const;
export type DurationOption = (typeof DURATION_OPTIONS)[number];

/** Snaps any minute value onto the four supported workout lengths. */
export function snapDuration(minutes: number): DurationOption {
  return DURATION_OPTIONS.reduce<DurationOption>((best, option) => {
    return Math.abs(option - minutes) < Math.abs(best - minutes) ? option : best;
  }, DURATION_OPTIONS[0]);
}

/** Hours a demanding session needs before the same area is loaded hard again. */
export const RECOVERY_WINDOW_HOURS = 44;

const DIFFICULTY_RANK: Record<Difficulty, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export type ReadinessBand = 'low' | 'moderate' | 'high';

/**
 * Combines energy, soreness and sleep into one band.
 * soreness is inverted: 5 = very sore.
 */
export function readinessBand(readiness: RecommendationInput['readiness']): ReadinessBand {
  if (!readiness) return 'moderate';
  const score = readiness.energy + (6 - readiness.soreness) + readiness.sleepQuality;
  if (score <= 7) return 'low';
  if (score >= 12) return 'high';
  return 'moderate';
}

function equipmentAvailable(template: WorkoutTemplate, available: Equipment[]): boolean {
  const needed = template.equipment.filter((e) => e !== 'none');
  if (needed.length === 0) return true;
  if (available.length === 0) return false;
  return needed.every((e) => available.includes(e));
}

/** Areas loaded hard inside the recovery window. */
export function fatiguedAreas(recent: RecentWorkoutSummary[]): BodyArea[] {
  const set = new Set<BodyArea>();
  for (const workout of recent) {
    if (workout.hoursAgo > RECOVERY_WINDOW_HOURS) continue;
    const demanding = (workout.averageEffort ?? 0) >= 7 || workout.hoursAgo <= 20;
    if (!demanding) continue;
    workout.focusAreas.forEach((area) => set.add(area));
  }
  return [...set];
}

/** Movement categories trained within the last 48 hours. */
export function recentCategories(recent: RecentWorkoutSummary[]): MovementCategory[] {
  const set = new Set<MovementCategory>();
  for (const workout of recent) {
    if (workout.hoursAgo > 48) continue;
    workout.movementCategories.forEach((c) => set.add(c));
  }
  return [...set];
}

interface Signal {
  id: string;
  points: number;
  reason?: string;
  /** Higher priority reasons win the single displayed sentence. */
  priority: number;
}

export function scoreTemplate(
  template: WorkoutTemplate,
  input: RecommendationInput,
): { score: number; signals: Signal[] } {
  const signals: Signal[] = [];
  const band = readinessBand(input.readiness);
  const tired = fatiguedAreas(input.recentWorkouts);
  const recentCats = recentCategories(input.recentWorkouts);
  const isRecovery = template.goal === 'mobility' || template.goal === 'technique';

  // --- Duration fit ------------------------------------------------------
  const targetMinutes = input.readiness?.availableMinutes ?? 45;
  const target = snapDuration(targetMinutes);
  const diff = Math.abs(template.duration_minutes - target);
  if (diff === 0) {
    signals.push({ id: 'duration_exact', points: 30, priority: 2, reason: `מתאים בדיוק ל־${target} הדקות שיש לך היום.` });
  } else if (diff <= 10) {
    signals.push({ id: 'duration_close', points: 16, priority: 1 });
  } else {
    signals.push({ id: 'duration_far', points: -22, priority: 0 });
  }
  if (template.duration_minutes > targetMinutes + 10) {
    signals.push({ id: 'duration_too_long', points: -18, priority: 0 });
  }

  // --- Readiness ---------------------------------------------------------
  if (band === 'low') {
    if (isRecovery) {
      signals.push({
        id: 'low_readiness_recovery',
        points: 46,
        priority: 9,
        reason: 'הדיווח שלך היום מצביע על עייפות, אז בחרנו אימון מתון שמחזיר תחושה טובה.',
      });
    } else {
      signals.push({ id: 'low_readiness_penalty', points: -34, priority: 0 });
    }
  }
  if (band === 'high' && (template.goal === 'strength' || template.goal === 'conditioning')) {
    signals.push({
      id: 'high_readiness_intense',
      points: 26,
      priority: 6,
      reason: 'המוכנות שלך היום גבוהה, זה זמן מצוין לאימון תובעני.',
    });
  }
  if (input.readiness && input.readiness.soreness >= 4 && !isRecovery) {
    signals.push({ id: 'soreness_penalty', points: -26, priority: 0 });
  }
  if (input.readiness && input.readiness.sleepQuality <= 2 && template.goal === 'strength') {
    signals.push({ id: 'poor_sleep_strength_penalty', points: -20, priority: 0 });
  }

  // --- Recovery window ---------------------------------------------------
  const overlap = template.focus_areas.filter((area) => tired.includes(area));
  if (overlap.length > 0 && !isRecovery) {
    signals.push({ id: 'recovery_window', points: -30 * overlap.length, priority: 0 });
  }
  if (overlap.length === 0 && tired.length > 0 && !isRecovery) {
    signals.push({
      id: 'fresh_area',
      points: 20,
      priority: 5,
      reason: 'האזורים באימון הזה נחו מספיק מהאימון האחרון שלך.',
    });
  }

  // --- Movement balance --------------------------------------------------
  const repeated = template.movement_categories.filter((c) => recentCats.includes(c));
  if (repeated.length === template.movement_categories.length && repeated.length > 0) {
    signals.push({ id: 'repeat_pattern', points: -16, priority: 0 });
  } else if (repeated.length === 0 && recentCats.length > 0) {
    signals.push({
      id: 'balance',
      points: 18,
      priority: 4,
      reason: 'האימון הזה משלים דפוסי תנועה שלא עבדת עליהם לאחרונה.',
    });
  }

  // --- Goal --------------------------------------------------------------
  if (input.preferredGoal && template.goal === input.preferredGoal) {
    signals.push({
      id: 'goal_match',
      points: 24,
      priority: 7,
      reason: `בחרת להתמקד ב${GOAL_LABELS[input.preferredGoal]}, והאימון הזה בדיוק שם.`,
    });
  }

  // --- Equipment ---------------------------------------------------------
  if (!equipmentAvailable(template, input.availableEquipment)) {
    signals.push({ id: 'equipment_missing', points: -70, priority: 0 });
  } else if (input.availableEquipment.length > 0) {
    signals.push({ id: 'equipment_ok', points: 8, priority: 1 });
  }

  // --- Experience --------------------------------------------------------
  const gap = DIFFICULTY_RANK[template.difficulty] - DIFFICULTY_RANK[input.experienceLevel];
  if (gap === 0) signals.push({ id: 'level_match', points: 14, priority: 3, reason: 'רמת האימון תואמת לרמה שלך.' });
  else if (gap === 1) signals.push({ id: 'level_stretch', points: 2, priority: 0 });
  else if (gap >= 2) signals.push({ id: 'level_too_hard', points: -30, priority: 0 });
  else signals.push({ id: 'level_easy', points: -4, priority: 0 });

  // --- Upcoming class ----------------------------------------------------
  if (input.upcomingClassInHours !== null && input.upcomingClassInHours <= 8) {
    if (isRecovery) {
      signals.push({
        id: 'class_soon_light',
        points: 30,
        priority: 8,
        reason: 'יש לך שיעור בקרוב, אז זה אימון קצר ומכין ולא תובעני.',
      });
    } else {
      signals.push({ id: 'class_soon_penalty', points: -28, priority: 0 });
    }
  }

  const score = signals.reduce((sum, s) => sum + s.points, 0);
  return { score, signals };
}

/** Returns the top recommendations, best first. */
export function recommendWorkouts(input: RecommendationInput, limit = 3): Recommendation[] {
  const pool = input.templates.filter((t) => t.approved && t.suggestable && !t.archived);
  const scored = pool.map((template) => {
    const { score, signals } = scoreTemplate(template, input);
    const best = signals
      .filter((s) => s.reason)
      .sort((a, b) => b.priority - a.priority || b.points - a.points)[0];
    return {
      template,
      score,
      reason: best?.reason ?? 'אימון מאוזן שמתאים לשגרה הנוכחית שלך.',
      signals: signals.map((s) => s.id),
    };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.template.duration_minutes - b.template.duration_minutes)
    .slice(0, limit);
}

export const REPLACE_REASONS = [
  { value: 'equipment', label: 'הציוד לא זמין' },
  { value: 'pain', label: 'כאב או אי נוחות' },
  { value: 'too_hard', label: 'קשה מדי כרגע' },
  { value: 'too_easy', label: 'קל מדי כרגע' },
  { value: 'preference', label: 'מעדיף תרגיל אחר' },
] as const;

export type ReplaceReason = (typeof REPLACE_REASONS)[number]['value'];
