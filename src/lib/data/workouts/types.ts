import type {
  Difficulty,
  Equipment,
  ScoreType,
  Workout,
  WorkoutBlock,
  WorkoutCategory,
  WorkoutFormat,
  WorkoutMovement,
  WorkoutScaling,
} from '@/lib/domain/types';

/**
 * The authoring shape of the workout library.
 *
 * Lines are plain strings so a coach can read and edit the library as prose.
 * A line may carry a second half after a pipe, which becomes the grey detail
 * next to the movement:
 *
 *   'Thrusters' -> just the movement
 *   'Thrusters | 21-15-9' -> movement with its rep scheme
 *
 * Loads are never written into the library. What someone lifts is theirs to
 * decide on the day and theirs to record afterwards; a number printed here
 * would only ever be wrong for most of the room.
 */
export interface LibraryWorkout {
  slug: string;
  title: string;
  /** One Hebrew line saying what the session is for. */
  subtitle: string;
  category: WorkoutCategory;
  format: WorkoutFormat;
  difficulty: Difficulty;
  durationMinutes: number;
  timeCapMinutes?: number;
  equipment: Equipment[];
  description: string;
  warmup: string[];
  structure: { label: string; detail?: string; items: string[] }[];
  cooldown: string[];
  scaling: WorkoutScaling[];
  scoreType: ScoreType;
  scoreLabel?: string;
}

/**
 * What the room actually has. Every CrossFit and functional session in the
 * library is written against this list and nothing else - no rower, no bike,
 * no box, no rings, no rope - so nothing on the whiteboard asks for a machine
 * that is not there.
 */
export const ROOM_EQUIPMENT: readonly Equipment[] = [
  'pullup_bar',
  'bench',
  'dumbbell',
  'treadmill',
  'kettlebell',
  'hip_thrust',
  'barbell',
  // A mat and a resistance band are floor props rather than machines, and the
  // pilates and mobility sessions are built around them. If the room has
  // neither, say so and they come out.
  'mat',
  'bands',
  'none',
] as const;

const SEPARATOR = ' | ';

export function toMovements(lines: string[]): WorkoutMovement[] {
  return lines.map((line) => {
    const index = line.indexOf(SEPARATOR);
    if (index === -1) return { label: line, detail: null };
    return {
      label: line.slice(0, index).trim(),
      detail: line.slice(index + SEPARATOR.length).trim(),
    };
  });
}

export function toBlocks(
  blocks: { label: string; detail?: string; items: string[] }[],
): WorkoutBlock[] {
  return blocks.map((block) => ({
    label: block.label,
    detail: block.detail ?? null,
    items: toMovements(block.items),
  }));
}

/** The library entry as the rest of the app sees it. */
export function toWorkout(
  entry: LibraryWorkout,
  context: { id: string; organizationId: string; timestamp: string },
): Workout {
  return {
    id: context.id,
    organization_id: context.organizationId,
    slug: entry.slug,
    title: entry.title,
    subtitle: entry.subtitle,
    category: entry.category,
    format: entry.format,
    difficulty: entry.difficulty,
    duration_minutes: entry.durationMinutes,
    time_cap_minutes: entry.timeCapMinutes ?? null,
    equipment: entry.equipment,
    description: entry.description,
    warmup: toMovements(entry.warmup),
    structure: toBlocks(entry.structure),
    cooldown: toMovements(entry.cooldown),
    scaling: entry.scaling,
    score_type: entry.scoreType,
    score_label: entry.scoreLabel ?? null,
    archived: false,
    created_at: context.timestamp,
    updated_at: context.timestamp,
  };
}

/** Shorthand for the three scaling levels, which every entry carries. */
export function scale(
  beginner: string,
  intermediate: string,
  advanced: string,
): WorkoutScaling[] {
  return [
    { level: 'beginner', detail: beginner },
    { level: 'intermediate', detail: intermediate },
    { level: 'advanced', detail: advanced },
  ];
}

/** Cool-downs repeat across families; these are the four that recur. */
export const COOLDOWNS = {
  breath: [
    'הליכה קלה על ההליכון | 3 דקות עד שהדופק יורד',
    'נשימת קופסה בשכיבה | 4 שניות פנימה, 4 החזקה, 4 החוצה, 8 סבבים',
    'מתיחת ארבע ראשי בעמידה | 45 שניות לכל צד',
    'מתיחת חזה במשקוף | 45 שניות',
  ],
  posterior: [
    'מתיחת מיתרי ברך בישיבה | 60 שניות לכל צד',
    'מתיחת שוקיים בקיר | 45 שניות לכל צד',
    'תנוחת ילד עם הושטה לצדדים | 90 שניות',
    'פתיחת גב עליון על הספסל | 60 שניות',
  ],
  shoulders: [
    'מתיחת כתף צולבת | 45 שניות לכל צד',
    'מתיחת תלת ראשי מעל הראש | 45 שניות לכל צד',
    'פתיחת חזה בשכיבה על הספסל | 90 שניות',
    'נשימות עמוקות בישיבה | 2 דקות',
  ],
  hips: [
    'תנוחת יונה | 90 שניות לכל צד',
    'מתיחת כופפי ירך בכריעה | 60 שניות לכל צד',
    'פרפר בישיבה | 60 שניות',
    'סיבוב עמוד שדרה בשכיבה | 60 שניות לכל צד',
  ],
} as const;
