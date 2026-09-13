/**
 * The faces a member can wear.
 *
 * Drawn, not uploaded. An upload needs a storage bucket, a size limit, a
 * moderation story and a way to take a picture down again; a set of avocados
 * needs none of that and cannot leak anybody's face. It is also funnier, which
 * for a club of this size counts for more than it usually does.
 *
 * Each one is the club's own fruit in a different mood. Nothing here describes
 * a body type - these are expressions and colours, not shapes, because the
 * moment an avatar set has a "before" and an "after" in it the whole thing
 * turns into something else.
 */
export interface AvatarPreset {
  key: string;
  /** What the member sees when choosing. */
  label: string;
  /** The flesh. */
  fill: string;
  /** The rind and outline. */
  stroke: string;
  /** The stone. */
  stone: string;
  /** Two dots and a mouth, as a path. Optional - some are just fruit. */
  face?: 'smile' | 'grin' | 'wink' | 'calm' | 'shades' | 'determined';
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { key: 'classic', label: 'קלאסי', fill: '#D9C68C', stroke: '#0E100E', stone: '#0E100E', face: 'smile' },
  { key: 'grove', label: 'מהמטע', fill: '#A8B87A', stroke: '#0E100E', stone: '#4A3A1E', face: 'calm' },
  { key: 'butter', label: 'חמאה', fill: '#F0E3B8', stroke: '#0E100E', stone: '#8A6A2E', face: 'grin' },
  { key: 'matcha', label: 'מאצ׳ה', fill: '#8FB89A', stroke: '#0E100E', stone: '#2E4A38', face: 'calm' },
  { key: 'toast', label: 'על טוסט', fill: '#E0B072', stroke: '#0E100E', stone: '#5A3A18', face: 'wink' },
  { key: 'midnight', label: 'אימון לילה', fill: '#3D4A42', stroke: '#D9C68C', stone: '#D9C68C', face: 'shades' },
  { key: 'guac', label: 'גואקמולי', fill: '#7FA05E', stroke: '#0E100E', stone: '#3A2E12', face: 'grin' },
  { key: 'rose', label: 'ורוד', fill: '#E6B8B0', stroke: '#0E100E', stone: '#7A4038', face: 'smile' },
  { key: 'espresso', label: 'אספרסו', fill: '#B0855A', stroke: '#0E100E', stone: '#2E1C0E', face: 'determined' },
  { key: 'plain', label: 'בלי פרצוף', fill: '#D9C68C', stroke: '#0E100E', stone: '#0E100E' },
];

export const DEFAULT_AVATAR = AVATAR_PRESETS[0];

/** Never throws on a key from the database that this build does not know. */
export function avatarFor(key: string | null | undefined): AvatarPreset {
  if (!key) return DEFAULT_AVATAR;
  return AVATAR_PRESETS.find((preset) => preset.key === key) ?? DEFAULT_AVATAR;
}

/**
 * A stable face for somebody who has not chosen one.
 *
 * Deterministic on the profile id, so the same person is the same avocado on
 * every screen and after every reload - a roster where everyone is the default
 * fruit tells you nothing about who is in the room.
 */
export function avatarSeededFor(profileId: string, key?: string | null): AvatarPreset {
  if (key) return avatarFor(key);
  let hash = 2166136261;
  for (let i = 0; i < profileId.length; i += 1) {
    hash ^= profileId.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return AVATAR_PRESETS[hash % AVATAR_PRESETS.length];
}
