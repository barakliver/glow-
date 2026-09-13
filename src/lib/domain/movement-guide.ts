import { MOVEMENT_GUIDES, type MovementGuide } from '@/lib/data/movements';

export type { MovementGuide };

/**
 * Turning a line on the whiteboard into something a member can tap.
 *
 * A workout is written as prose - "סווינג קטלבל קל", "Romanian Deadlift",
 * "מוט ריק: דדליפט, משיכה, דחיפה מעל הראש" - because that is how a coach
 * writes and how the library stays editable. None of it is a foreign key, so
 * matching a line to the movement it names is a text problem, and it has to
 * fail gracefully: a line nobody curated should still open something useful
 * rather than nothing.
 */

/**
 * Lines that are not movements.
 *
 * A block heading, a minute marker or a note to the room sits in the same list
 * as the movements and must not pretend to be one. Making "בלוק 2" tappable
 * and then showing a search for it is worse than leaving it alone.
 */
const NOT_A_MOVEMENT: RegExp[] = [
  /^בלוק\s*\d+$/,
  /^דקה\s*\d+$/,
  /^דקות\s*(זוגיות|אי-זוגיות)$/,
  /^תחנה\s*\d+$/,
  /^סבב\s*\d+$/,
  /* No \b here: JavaScript word boundaries are defined against [A-Za-z0-9_],
   * so between a Hebrew letter and a space there is no boundary at all and
   * every one of these patterns would quietly never match. */
  /^אין\s/,
  /^שומרים\s/,
  /^העלאה הדרגתית$/,
  /^סבב ניסיון/,
  /^סבב חימום/,
  /^שלושה מקטעים/,
  /^\d/,
];

/**
 * A line that prescribes a round rather than naming a movement.
 *
 * "מוט ריק: 10 סקוואטים, 2 סבבים" reads as a movement because it has a
 * movement inside it, but what it actually describes is a piece of work. The
 * digit straight after the colon is the tell.
 */
const PRESCRIPTION = /:\s*\d/;

/** Strips what decorates a movement without changing which movement it is. */
function normalise(label: string): string {
  return label
    .replace(/[׳’']/g, "'")
    .replace(/[.,;!?]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Every key that should resolve to a guide, longest first.
 *
 * Longest first is the whole trick: "Romanian Deadlift" and "Sumo Deadlift
 * High Pull" both contain "Deadlift", and whichever is checked first wins, so
 * the most specific key has to be checked first or every deadlift variant
 * collapses into the plain one.
 */
const KEYS: { key: string; guide: MovementGuide }[] = MOVEMENT_GUIDES.flatMap((guide) =>
  [guide.he, guide.en, ...(guide.aliases ?? [])].map((key) => ({ key: normalise(key), guide })),
).sort((a, b) => b.key.length - a.key.length);

export interface MovementMatch {
  /** The line exactly as the workout wrote it. */
  label: string;
  /** The curated entry, when the line names something we have written up. */
  guide: MovementGuide | null;
  /** What to search for a demonstration. English when we know it. */
  query: string;
}

/**
 * What a member gets when they tap a line, or null when the line is not a
 * movement at all.
 */
export function matchMovement(label: string): MovementMatch | null {
  const trimmed = label.trim();
  if (trimmed === '') return null;
  if (NOT_A_MOVEMENT.some((pattern) => pattern.test(trimmed))) return null;
  if (PRESCRIPTION.test(trimmed)) return null;

  const text = normalise(trimmed);

  /* A line may name the setup before the movement - "מוט ריק: דדליפט". The
   * movement is the half after the colon; the half before it is a loading
   * instruction that no video is going to be about. */
  const after = text.includes(':') ? text.slice(text.indexOf(':') + 1).trim() : text;

  for (const candidate of [text, after]) {
    const hit = KEYS.find(({ key }) => candidate === key);
    if (hit) return { label: trimmed, guide: hit.guide, query: hit.guide.en };
  }
  for (const candidate of [text, after]) {
    const hit = KEYS.find(({ key }) => candidate.includes(key));
    if (hit) return { label: trimmed, guide: hit.guide, query: hit.guide.en };
  }

  /* Nothing curated. The line is still a movement, so it still opens - just
   * with a search instead of a write-up. Hebrew search terms find Hebrew
   * demonstrations, which for a mobility drill is usually what is wanted. */
  return { label: trimmed, guide: null, query: trimmed };
}

/**
 * A YouTube search rather than a video id.
 *
 * A pinned video is a promise this library cannot keep: channels delete,
 * rename and go private, and a dead link on a movement someone is about to
 * load under a barbell is worse than no link. A search for the movement's
 * proper name always resolves, and it resolves to the whole field rather than
 * to one person's take on it.
 */
export function demonstrationUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} form tutorial`)}`;
}
