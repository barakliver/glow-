import { describe, expect, it } from 'vitest';
import {
  ROOM_EQUIPMENT,
  WORKOUTS_BY_CATEGORY,
  WORKOUT_LIBRARY,
  libraryWorkouts,
  workoutLibraryId,
} from '@/lib/data/workouts';
import { SCORE_FIELDS } from '@/lib/domain/workout-score';
import { EQUIPMENT_LABELS } from '@/lib/labels';
import type { Equipment } from '@/lib/domain/types';

describe('the shipped library', () => {
  it('carries at least a hundred workouts', () => {
    expect(WORKOUT_LIBRARY.length).toBeGreaterThanOrEqual(100);
  });

  it('covers all four families at the promised depth', () => {
    expect(WORKOUTS_BY_CATEGORY.crossfit.length).toBeGreaterThanOrEqual(30);
    expect(WORKOUTS_BY_CATEGORY.functional.length).toBeGreaterThanOrEqual(30);
    expect(WORKOUTS_BY_CATEGORY.pilates.length).toBeGreaterThanOrEqual(20);
    expect(WORKOUTS_BY_CATEGORY.yoga.length).toBeGreaterThanOrEqual(15);
  });

  it('has a unique slug for every workout', () => {
    const slugs = WORKOUT_LIBRARY.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('derives a unique, stable id from each slug', () => {
    const ids = WORKOUT_LIBRARY.map((entry) => workoutLibraryId(entry.slug));
    expect(new Set(ids).size).toBe(ids.length);
    // Stable across calls, or a class would point at nothing after a rebuild.
    expect(workoutLibraryId('fran')).toBe(workoutLibraryId('fran'));
    expect(ids.every((id) => /^[0-9a-f-]{36}$/.test(id))).toBe(true);
  });
});

describe('every entry is complete enough to run', () => {
  it.each(WORKOUT_LIBRARY.map((entry) => [entry.slug, entry] as const))(
    '%s',
    (_slug, entry) => {
      expect(entry.title.trim()).not.toBe('');
      expect(entry.subtitle.trim()).not.toBe('');
      expect(entry.description.length).toBeGreaterThan(40);
      expect(entry.durationMinutes).toBeGreaterThan(0);
      expect(entry.warmup.length).toBeGreaterThan(0);
      expect(entry.cooldown.length).toBeGreaterThan(0);
      expect(entry.structure.length).toBeGreaterThan(0);
      expect(entry.structure.every((block) => block.items.length > 0)).toBe(true);

      // Three levels, so nobody is turned away from a session for being new.
      expect(entry.scaling.map((option) => option.level)).toEqual([
        'beginner',
        'intermediate',
        'advanced',
      ]);

      // The equipment list has to be renderable; an unknown value shows raw.
      for (const item of entry.equipment) {
        expect(EQUIPMENT_LABELS[item as Equipment]).toBeDefined();
      }

      // A time cap below the session length would be a typo.
      if (entry.timeCapMinutes) {
        expect(entry.timeCapMinutes).toBeLessThanOrEqual(entry.durationMinutes + 20);
      }
    },
  );

  it('scores each workout with a type the form can actually collect', () => {
    for (const entry of WORKOUT_LIBRARY) {
      expect(SCORE_FIELDS[entry.scoreType]).toBeDefined();
    }
  });

  it('keeps a for-time workout on the clock and an AMRAP on rounds', () => {
    for (const entry of WORKOUT_LIBRARY) {
      if (entry.format === 'for_time') expect(entry.scoreType).toBe('time');
      if (entry.format === 'amrap') {
        expect(['rounds_and_reps', 'reps']).toContain(entry.scoreType);
      }
    }
  });
});

describe('the library fits the room', () => {
  const lines = (entry: (typeof WORKOUT_LIBRARY)[number]) => [
    entry.description,
    ...entry.warmup,
    ...entry.cooldown,
    ...entry.scaling.map((option) => option.detail),
    ...entry.structure.flatMap((block) => [block.label, block.detail ?? '', ...block.items]),
  ];

  it('asks for nothing the gym does not own', () => {
    const strays = WORKOUT_LIBRARY.flatMap((entry) =>
      entry.equipment
        .filter((item) => !ROOM_EQUIPMENT.includes(item))
        .map((item) => `${entry.slug}: ${item}`),
    );
    expect(strays).toEqual([]);
  });

  it('never names a machine that is not on the floor', () => {
    // The room has no rower, no bike, no box, no rings, no rope and no wall
    // ball. A line calling for one is a class that stops halfway.
    const banned =
      /\b(rower|rowing|row \d|bike|erg|box jump|box step|ring dip|ring row|muscle-up|wall ball|double-?under|jump rope|GHD)\b/i;
    const offenders = WORKOUT_LIBRARY.flatMap((entry) =>
      lines(entry)
        .filter((line) => banned.test(line))
        .map((line) => `${entry.slug}: ${line}`),
    );
    expect(offenders).toEqual([]);
  });

  it('never says the same thing in Hebrew either', () => {
    // `נשימת קופסה` is box breathing, which needs no box.
    const banned =
      /(חתירה\s*\||מכשיר חתירה|אופני|(?<!נשימת )קופסה|טבעות|כדור כוח|וול בול|חבל קפיצה|דאבל אנדר)/;
    const offenders = WORKOUT_LIBRARY.flatMap((entry) =>
      lines(entry)
        .filter((line) => banned.test(line))
        .map((line) => `${entry.slug}: ${line}`),
    );
    expect(offenders).toEqual([]);
  });

  it('never prescribes a load', () => {
    // What someone lifts is theirs to choose and theirs to record. A number on
    // the board is wrong for most of the room the moment it is written.
    const load = /\d+\s*(\/\s*\d+\s*)?(ק״ג|ק"ג|קילו|kg)/i;
    const offenders = WORKOUT_LIBRARY.flatMap((entry) =>
      lines(entry)
        .filter((line) => load.test(line))
        .map((line) => `${entry.slug}: ${line}`),
    );
    expect(offenders).toEqual([]);
  });

  it('runs every CrossFit session for a full hour, in four blocks', () => {
    for (const entry of WORKOUTS_BY_CATEGORY.crossfit) {
      expect(entry.durationMinutes, entry.slug).toBe(60);
      expect(entry.structure.map((block) => block.label), entry.slug).toEqual(['כוח', 'מטקון']);
      expect(entry.warmup.length, entry.slug).toBeGreaterThan(2);
      expect(entry.cooldown.length, entry.slug).toBeGreaterThan(2);
    }
  });
});

describe('the guardrails hold across the whole library', () => {
  const corpus = WORKOUT_LIBRARY.map((entry) =>
    [
      entry.title,
      entry.subtitle,
      entry.description,
      ...entry.warmup,
      ...entry.cooldown,
      ...entry.scaling.map((option) => option.detail),
      ...entry.structure.flatMap((block) => [block.label, block.detail ?? '', ...block.items]),
    ].join(' '),
  ).join('\n');

  it('never sets a calorie target or talks about losing weight', () => {
    // Calories on a rower are a unit of work, not a diet. "שריפת קלוריות",
    // "ירידה במשקל" and the rest are what the product forbids.
    expect(corpus).not.toMatch(/קלוריות ביום|צריכה קלורית|גירעון קלור|שריפת קלוריות/);
    expect(corpus).not.toMatch(/ירידה במשקל|הרזיה|דיאטה|לרדת במשקל/);
  });

  it('never rates a body or compares members to each other', () => {
    expect(corpus).not.toMatch(/בטן שטוחה|מראה הגוף|אחוזי שומן|גוף מושלם/);
    expect(corpus).not.toMatch(/טוב יותר מ|מקום ראשון|טבלת מובילים|מול שאר המתאמנים/);
  });
});

describe('libraryWorkouts', () => {
  it('builds rows the repository can serve', () => {
    const rows = libraryWorkouts('org-1', '2026-01-01T00:00:00.000Z');
    expect(rows).toHaveLength(WORKOUT_LIBRARY.length);

    const fran = rows.find((row) => row.slug === 'fran');
    expect(fran?.organization_id).toBe('org-1');
    expect(fran?.score_type).toBe('time');
    expect(fran?.archived).toBe(false);
    // The strength block comes first, and carries no load - only what the
    // load has to do.
    expect(fran?.structure[0].label).toBe('כוח');
    expect(fran?.structure[1].items[0]).toEqual({ label: 'Thrusters', detail: 'מוט' });
  });

  it('leaves a movement without a detail as a bare label', () => {
    const rows = libraryWorkouts('org-1', '2026-01-01T00:00:00.000Z');
    const cindy = rows.find((row) => row.slug === 'cindy');
    expect(cindy?.warmup.some((item) => item.detail !== null)).toBe(true);
    const bare = rows
      .flatMap((row) => row.structure.flatMap((block) => block.items))
      .find((item) => item.detail === null);
    expect(bare).toBeDefined();
  });
});

describe('scaling is three real levels, not one repeated', () => {
  it.each(WORKOUT_LIBRARY.map((entry) => [entry.slug, entry] as const))('%s', (_slug, entry) => {
    const details = entry.scaling.map((option) => option.detail.trim());
    // Stripping prescribed loads once collapsed several triples into three
    // identical lines, which is worse than no scaling at all: it tells a
    // beginner and an advanced member the same thing.
    expect(new Set(details).size).toBe(3);
    for (const detail of details) {
      expect(detail.length).toBeGreaterThan(12);
      expect(detail).not.toMatch(/^[,.\s]/);
    }
  });
});
