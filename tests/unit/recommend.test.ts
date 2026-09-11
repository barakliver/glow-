import { describe, expect, it } from 'vitest';
import {
  fatiguedAreas,
  readinessBand,
  recentCategories,
  recommendWorkouts,
  RECOVERY_WINDOW_HOURS,
  scoreTemplate,
  snapDuration,
  type RecommendationInput,
} from '@/lib/domain/recommend';
import type { WorkoutTemplate } from '@/lib/domain/types';

function template(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: 'tpl',
    organization_id: 'org',
    title: 'תבנית',
    description: null,
    goal: 'general',
    difficulty: 'intermediate',
    duration_minutes: 45,
    equipment: ['none'],
    focus_areas: ['full_body'],
    movement_categories: ['squat'],
    created_by: 'coach',
    approved: true,
    suggestable: true,
    archived: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function input(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    templates: [],
    recentWorkouts: [],
    readiness: { energy: 3, soreness: 2, sleepQuality: 3, availableMinutes: 45 },
    availableEquipment: ['none', 'barbell', 'dumbbell', 'kettlebell', 'mat', 'bands'],
    preferredGoal: null,
    experienceLevel: 'intermediate',
    upcomingClassInHours: null,
    upcomingClassCategory: null,
    ...overrides,
  };
}

describe('duration options', () => {
  it('snaps to the four supported lengths', () => {
    expect(snapDuration(18)).toBe(20);
    expect(snapDuration(27)).toBe(30);
    expect(snapDuration(40)).toBe(45);
    expect(snapDuration(70)).toBe(60);
  });

  it('prefers an exact duration match', () => {
    const exact = template({ id: 'exact', duration_minutes: 30 });
    const off = template({ id: 'off', duration_minutes: 60 });
    const context = input({ readiness: { energy: 3, soreness: 2, sleepQuality: 3, availableMinutes: 30 } });
    expect(scoreTemplate(exact, context).score).toBeGreaterThan(scoreTemplate(off, context).score);
  });

  it('penalises a workout longer than the time available', () => {
    const context = input({ readiness: { energy: 3, soreness: 2, sleepQuality: 3, availableMinutes: 20 } });
    const { signals } = scoreTemplate(template({ duration_minutes: 60 }), context);
    expect(signals.map((s) => s.id)).toContain('duration_too_long');
  });
});

describe('readiness banding', () => {
  it('classifies low readiness', () => {
    expect(readinessBand({ energy: 1, soreness: 5, sleepQuality: 2, availableMinutes: 30 })).toBe('low');
  });

  it('classifies high readiness', () => {
    expect(readinessBand({ energy: 5, soreness: 1, sleepQuality: 5, availableMinutes: 60 })).toBe('high');
  });

  it('defaults to moderate with no report', () => {
    expect(readinessBand(null)).toBe('moderate');
  });
});

describe('low readiness prioritises recovery', () => {
  const context = input({
    readiness: { energy: 1, soreness: 5, sleepQuality: 2, availableMinutes: 30 },
    templates: [
      template({ id: 'strength', goal: 'strength', duration_minutes: 30, focus_areas: ['legs'] }),
      template({ id: 'mobility', goal: 'mobility', duration_minutes: 30, focus_areas: ['hips'] }),
      template({ id: 'technique', goal: 'technique', duration_minutes: 30, focus_areas: ['full_body'] }),
    ],
  });

  it('puts mobility or technique first', () => {
    const [best] = recommendWorkouts(context);
    expect(['mobility', 'technique']).toContain(best.template.id);
  });

  it('explains the choice in one Hebrew sentence', () => {
    const [best] = recommendWorkouts(context);
    expect(best.reason.length).toBeGreaterThan(10);
    expect(best.reason).toMatch(/[֐-׿]/);
    expect(best.reason.split('.').filter(Boolean)).toHaveLength(1);
  });

  it('scores a demanding workout below a recovery workout', () => {
    const strength = scoreTemplate(context.templates[0], context).score;
    const mobility = scoreTemplate(context.templates[1], context).score;
    expect(mobility).toBeGreaterThan(strength);
  });
});

describe('high readiness favours demanding work', () => {
  it('ranks strength above mobility when fresh', () => {
    const context = input({
      readiness: { energy: 5, soreness: 1, sleepQuality: 5, availableMinutes: 60 },
      templates: [
        template({ id: 'strength', goal: 'strength', duration_minutes: 60 }),
        template({ id: 'mobility', goal: 'mobility', duration_minutes: 60 }),
      ],
    });
    const [best] = recommendWorkouts(context);
    expect(best.template.id).toBe('strength');
  });
});

describe('recovery window', () => {
  it('marks areas trained hard recently as fatigued', () => {
    const areas = fatiguedAreas([
      { hoursAgo: 12, movementCategories: ['squat'], focusAreas: ['legs'], averageEffort: 9 },
      { hoursAgo: 90, movementCategories: ['push'], focusAreas: ['chest'], averageEffort: 9 },
    ]);
    expect(areas).toContain('legs');
    expect(areas).not.toContain('chest');
  });

  it('releases an area once the recovery window has passed', () => {
    const areas = fatiguedAreas([
      {
        hoursAgo: RECOVERY_WINDOW_HOURS + 1,
        movementCategories: ['squat'],
        focusAreas: ['legs'],
        averageEffort: 9,
      },
    ]);
    expect(areas).toEqual([]);
  });

  it('avoids repeating demanding work on a fatigued area', () => {
    const context = input({
      recentWorkouts: [
        { hoursAgo: 14, movementCategories: ['squat'], focusAreas: ['legs'], averageEffort: 9 },
      ],
      templates: [
        template({ id: 'legs-again', goal: 'strength', focus_areas: ['legs'], movement_categories: ['squat'] }),
        template({ id: 'upper', goal: 'strength', focus_areas: ['back', 'chest'], movement_categories: ['pull', 'push'] }),
      ],
    });
    const [best] = recommendWorkouts(context);
    expect(best.template.id).toBe('upper');
  });

  it('tracks recently trained movement categories', () => {
    const categories = recentCategories([
      { hoursAgo: 10, movementCategories: ['push', 'pull'], focusAreas: [], averageEffort: 6 },
      { hoursAgo: 100, movementCategories: ['hinge'], focusAreas: [], averageEffort: 6 },
    ]);
    expect(categories.sort()).toEqual(['pull', 'push']);
  });
});

describe('equipment, goal and experience', () => {
  it('excludes workouts needing unavailable equipment', () => {
    const context = input({
      availableEquipment: ['none'],
      templates: [
        template({ id: 'barbell', equipment: ['barbell'] }),
        template({ id: 'bodyweight', equipment: ['none'] }),
      ],
    });
    const [best] = recommendWorkouts(context);
    expect(best.template.id).toBe('bodyweight');
  });

  it('boosts the member preferred goal', () => {
    const context = input({
      preferredGoal: 'conditioning',
      templates: [
        template({ id: 'cond', goal: 'conditioning' }),
        template({ id: 'general', goal: 'general' }),
      ],
    });
    const [best] = recommendWorkouts(context);
    expect(best.template.id).toBe('cond');
    expect(best.signals).toContain('goal_match');
  });

  it('avoids workouts far above the member level', () => {
    const context = input({
      experienceLevel: 'beginner',
      templates: [
        template({ id: 'advanced', difficulty: 'advanced' }),
        template({ id: 'beginner', difficulty: 'beginner' }),
      ],
    });
    const [best] = recommendWorkouts(context);
    expect(best.template.id).toBe('beginner');
  });
});

describe('upcoming class awareness', () => {
  it('prefers a light session before a booked class', () => {
    const context = input({
      upcomingClassInHours: 3,
      templates: [
        template({ id: 'heavy', goal: 'strength', duration_minutes: 45 }),
        template({ id: 'light', goal: 'mobility', duration_minutes: 45 }),
      ],
    });
    const [best] = recommendWorkouts(context);
    expect(best.template.id).toBe('light');
    expect(best.signals).toContain('class_soon_light');
  });
});

describe('pool filtering', () => {
  it('ignores unapproved, unsuggestable and archived templates', () => {
    const context = input({
      templates: [
        template({ id: 'a', approved: false }),
        template({ id: 'b', suggestable: false }),
        template({ id: 'c', archived: true }),
        template({ id: 'd' }),
      ],
    });
    const results = recommendWorkouts(context);
    expect(results).toHaveLength(1);
    expect(results[0].template.id).toBe('d');
  });

  it('returns an empty list when nothing is suggestable', () => {
    expect(recommendWorkouts(input({ templates: [] }))).toEqual([]);
  });

  it('limits the number of results', () => {
    const templates = Array.from({ length: 8 }, (_, i) => template({ id: `t${i}` }));
    expect(recommendWorkouts(input({ templates }), 3)).toHaveLength(3);
  });

  it('never recommends anything mentioning calories or weight loss', () => {
    const templates = Array.from({ length: 5 }, (_, i) =>
      template({ id: `t${i}`, goal: (['general', 'strength', 'conditioning', 'mobility', 'technique'] as const)[i] }),
    );
    for (const result of recommendWorkouts(input({ templates }), 5)) {
      expect(result.reason).not.toMatch(/קלורי|הרזיה|משקל גוף רצוי|ירידה במשקל/);
    }
  });
});
