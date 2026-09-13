/**
 * GLoW ripeness score.
 *
 * The club sits inside an avocado grove, so a member's consistency is tracked
 * the way an avocado ripens: slowly, steadily, and never by comparison with
 * the fruit next to it.
 *
 * Design rules, matching the rest of the product:
 *  - points come only from showing up and from performance, never from body
 *    measurements, weight or appearance
 *  - there is no leaderboard and no ranking: every number here describes one
 *    member against their own history
 *  - ripeness never rots. Points are cumulative, so a quiet month costs
 *    progress but never takes achievements away
 */

export const POINTS = {
  /** Finishing a workout you logged yourself. */
  workout: 10,
  /** Turning up to a booked class. */
  classAttended: 15,
  /** The 20-second daily readiness check. */
  readiness: 3,
  /** Beating one of your own records. */
  personalRecord: 25,
  /** Each consecutive week with at least one session. */
  weeklyStreak: 20,
} as const;

export interface RipenessLevel {
  key: string;
  name: string;
  /** One short Hebrew line describing where the member stands. */
  blurb: string;
  minPoints: number;
  /** 0 = stone, 1 = fully ripe. Drives how filled the avocado mark looks. */
  ripeness: number;
}

export const LEVELS: RipenessLevel[] = [
  { key: 'seed', name: 'גרעין', blurb: 'הכול מתחיל מגרעין אחד. האימון הראשון הוא הכי חשוב.', minPoints: 0, ripeness: 0 },
  { key: 'sprout', name: 'נבט', blurb: 'התחלת לקבוע שגרה. ממשיכים באותו קצב.', minPoints: 120, ripeness: 0.2 },
  { key: 'young', name: 'אבוקדו צעיר', blurb: 'השגרה תפסה. הגוף כבר מזהה את הקצב.', minPoints: 350, ripeness: 0.4 },
  { key: 'ripening', name: 'מתחיל להבשיל', blurb: 'העקביות שלך ניכרת. מכאן זה נהיה מעניין.', minPoints: 700, ripeness: 0.6 },
  { key: 'ripe', name: 'בשל', blurb: 'אתה בכושר מלא ובאימון קבוע. כבוד.', minPoints: 1200, ripeness: 0.8 },
  { key: 'perfect', name: 'בשל מושלם', blurb: 'הרמה הגבוהה ביותר. נשאר רק לשמור עליה.', minPoints: 2000, ripeness: 1 },
];

export interface WeeklyGoal {
  /** Sessions the member is aiming for each week. */
  target: number;
  /** Sessions done in the current week - classes attended plus logged training. */
  done: number;
  /** 0-100, capped. Going past the goal is fine; the bar just fills. */
  progress: number;
  met: boolean;
}

/**
 * Progress toward the member's own weekly target.
 *
 * A target, never a quota. Nothing in the app penalises a quiet week: the bar
 * simply starts again on Sunday, and the ripeness score keeps every point ever
 * earned.
 */
export function weeklyGoal(target: number, activity: string[], weekStart: Date): WeeklyGoal {
  const from = weekStart.getTime();
  const done = activity.filter((iso) => new Date(iso).getTime() >= from).length;
  /* A target that is not a number at all reaches here when the database is a
   * migration behind and the column is simply absent. NaN would then travel
   * all the way to the screen as a rendered "NaN", so it falls back to the
   * same default the migration sets. */
  const safeTarget = Number.isFinite(target) ? Math.max(1, target) : 3;
  return {
    target: safeTarget,
    done,
    progress: Math.min(100, Math.round((done / safeTarget) * 100)),
    met: done >= safeTarget,
  };
}

export interface ScoreInput {
  /** ISO timestamps of completed workout sessions. */
  completedWorkouts: string[];
  /** ISO timestamps of classes the member actually attended. */
  attendedClasses: string[];
  /** yyyy-MM-dd keys of days with a readiness report. */
  readinessDays: string[];
  /** How many personal records the member holds. */
  personalRecords: number;
  now: Date;
  /** Start of the member's current week, as a UTC instant. */
  weekStart: Date;
  /** Start of the current month, as a UTC instant. */
  monthStart: Date;
}

export interface ScoreBreakdownRow {
  key: keyof typeof POINTS;
  label: string;
  count: number;
  points: number;
}

export interface ScoreSummary {
  total: number;
  thisWeek: number;
  thisMonth: number;
  level: RipenessLevel;
  nextLevel: RipenessLevel | null;
  /** Points still needed for the next level, 0 at the top. */
  pointsToNext: number;
  /** 0-100 progress through the current level. */
  levelProgress: number;
  /** Consecutive weeks, ending with the current one, that had activity. */
  streakWeeks: number;
  breakdown: ScoreBreakdownRow[];
}

const LABELS: Record<keyof typeof POINTS, string> = {
  workout: 'אימונים שהושלמו',
  classAttended: 'שיעורים שהגעת אליהם',
  readiness: 'דיווחי מוכנות',
  personalRecord: 'שיאים אישיים',
  weeklyStreak: 'שבועות ברצף',
};

/** Sunday-based week index, so weeks can be compared without a date library. */
function weekIndex(value: Date): number {
  return Math.floor((value.getTime() - Date.UTC(2020, 0, 5)) / (7 * 86_400_000));
}

/**
 * Consecutive weeks with at least one session, counting back from the current
 * week. A quiet current week does not break a streak that is still alive: the
 * week is not over yet, so the count simply continues from last week.
 */
export function computeStreak(activity: string[], now: Date): number {
  if (activity.length === 0) return 0;
  const weeks = new Set(activity.map((iso) => weekIndex(new Date(iso))));
  const current = weekIndex(now);

  let cursor = weeks.has(current) ? current : current - 1;
  if (!weeks.has(cursor)) return 0;

  let streak = 0;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

export function levelFor(points: number): RipenessLevel {
  let match = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.minPoints) match = level;
  }
  return match;
}

export function computeScore(input: ScoreInput): ScoreSummary {
  const activity = [...input.completedWorkouts, ...input.attendedClasses];
  const streakWeeks = computeStreak(activity, input.now);

  const counts: Record<keyof typeof POINTS, number> = {
    workout: input.completedWorkouts.length,
    classAttended: input.attendedClasses.length,
    readiness: input.readinessDays.length,
    personalRecord: Math.max(0, input.personalRecords),
    weeklyStreak: streakWeeks,
  };

  const breakdown: ScoreBreakdownRow[] = (Object.keys(POINTS) as (keyof typeof POINTS)[]).map(
    (key) => ({
      key,
      label: LABELS[key],
      count: counts[key],
      points: counts[key] * POINTS[key],
    }),
  );

  const total = breakdown.reduce((sum, row) => sum + row.points, 0);

  const since = (from: Date) => {
    const cutoff = from.getTime();
    const workouts = input.completedWorkouts.filter((iso) => new Date(iso).getTime() >= cutoff);
    const classes = input.attendedClasses.filter((iso) => new Date(iso).getTime() >= cutoff);
    // Readiness days are date keys, so compare on the same granularity.
    const fromKey = from.toISOString().slice(0, 10);
    const readiness = input.readinessDays.filter((day) => day >= fromKey);
    return (
      workouts.length * POINTS.workout +
      classes.length * POINTS.classAttended +
      readiness.length * POINTS.readiness
    );
  };

  const level = levelFor(total);
  const levelIndex = LEVELS.findIndex((l) => l.key === level.key);
  const nextLevel = LEVELS[levelIndex + 1] ?? null;

  const span = nextLevel ? nextLevel.minPoints - level.minPoints : 0;
  const into = total - level.minPoints;

  return {
    total,
    thisWeek: since(input.weekStart),
    thisMonth: since(input.monthStart),
    level,
    nextLevel,
    pointsToNext: nextLevel ? Math.max(0, nextLevel.minPoints - total) : 0,
    levelProgress: nextLevel ? Math.min(100, Math.round((into / span) * 100)) : 100,
    streakWeeks,
    breakdown: breakdown.filter((row) => row.count > 0),
  };
}
