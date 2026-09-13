import { Flame, ListChecks, Lock, Snowflake, SlidersHorizontal, Timer, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  SCORE_TYPE_LABELS,
  WORKOUT_CATEGORY_LABELS,
  WORKOUT_FORMAT_HINTS,
  WORKOUT_FORMAT_LABELS,
} from '@/lib/labels';
import { formatDuration } from '@/lib/time';
import { scoreUnit } from '@/lib/domain/workout-score';
import type {
  Difficulty,
  Equipment,
  Workout,
  WorkoutCategory,
  WorkoutFormat,
  WorkoutMovement,
} from '@/lib/domain/types';

/** The line as it would be written on the whiteboard. */
function MovementList({ items }: { items: WorkoutMovement[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`} className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-semibold">{item.label}</span>
          {item.detail && <span className="text-xs text-muted">{item.detail}</span>}
        </li>
      ))}
    </ul>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface p-4">
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-accent-ink" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  );
}

/** The shared header line: family, format, length, level. */
export function WorkoutMeta({
  category,
  format,
  durationMinutes,
  difficulty,
  timeCapMinutes,
}: {
  category: WorkoutCategory;
  format: WorkoutFormat;
  durationMinutes: number;
  difficulty: Difficulty;
  timeCapMinutes?: number | null;
}) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      <li>
        <Badge tone="accent">{WORKOUT_CATEGORY_LABELS[category]}</Badge>
      </li>
      <li>
        <Badge tone="outline">{WORKOUT_FORMAT_LABELS[format]}</Badge>
      </li>
      <li>
        <Badge tone="neutral">{formatDuration(durationMinutes)}</Badge>
      </li>
      <li>
        <Badge tone="neutral">{DIFFICULTY_LABELS[difficulty]}</Badge>
      </li>
      {timeCapMinutes ? (
        <li>
          <Badge tone="warning">מכסת זמן {formatDuration(timeCapMinutes)}</Badge>
        </li>
      ) : null}
    </ul>
  );
}

/**
 * The full workout. Only rendered once the member holds a place in the class,
 * or when they are browsing the library on their own.
 */
export function WorkoutDetail({
  workout,
  coachNotes,
}: {
  workout: Workout;
  coachNotes?: string | null;
}) {
  const unit = scoreUnit(workout.score_type);

  return (
    <div className="space-y-3">
      <section className="surface p-4">
        <h2 className="display text-2xl leading-tight">{workout.title}</h2>
        {workout.subtitle && <p className="mt-1 text-sm text-muted">{workout.subtitle}</p>}
        <div className="mt-3">
          <WorkoutMeta
            category={workout.category}
            format={workout.format}
            durationMinutes={workout.duration_minutes}
            difficulty={workout.difficulty}
            timeCapMinutes={workout.time_cap_minutes}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">{workout.description}</p>
        <p className="mt-2 text-xs text-muted">{WORKOUT_FORMAT_HINTS[workout.format]}</p>

        {workout.equipment.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {workout.equipment.map((item) => (
              <li key={item}>
                <Badge tone="outline">{EQUIPMENT_LABELS[item as Equipment] ?? item}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {coachNotes && (
        <section className="surface border-accent/40 p-4">
          <h3 className="mb-1.5 text-sm font-bold text-accent-ink">הערת המאמן לשיעור הזה</h3>
          <p className="text-sm leading-relaxed">{coachNotes}</p>
        </section>
      )}

      {workout.warmup.length > 0 && (
        <Section icon={Flame} title="חימום">
          <MovementList items={workout.warmup} />
        </Section>
      )}

      <Section icon={ListChecks} title="האימון">
        <div className="space-y-4">
          {workout.structure.map((block, index) => (
            <div key={`${block.label}-${index}`}>
              <p className="text-sm font-bold text-accent-ink">{block.label}</p>
              {block.detail && <p className="mb-2 mt-0.5 text-xs text-muted">{block.detail}</p>}
              <div className={block.detail ? '' : 'mt-2'}>
                <MovementList items={block.items} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Trophy} title="ניקוד">
        <p className="text-sm">
          <span className="font-semibold">{SCORE_TYPE_LABELS[workout.score_type]}</span>
          {unit && <span className="text-muted"> · {unit}</span>}
        </p>
        {workout.score_label && <p className="mt-1 text-xs text-muted">{workout.score_label}</p>}
      </Section>

      {workout.scaling.length > 0 && (
        <Section icon={SlidersHorizontal} title="התאמות לרמה">
          <dl className="space-y-2.5">
            {workout.scaling.map((option) => (
              <div key={option.level}>
                <dt className="text-xs font-bold text-accent-ink">
                  {DIFFICULTY_LABELS[option.level]}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-muted">{option.detail}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {workout.cooldown.length > 0 && (
        <Section icon={Snowflake} title="שחרור">
          <MovementList items={workout.cooldown} />
        </Section>
      )}
    </div>
  );
}

/**
 * What a member sees before they book: enough to decide whether to come, and
 * nothing that identifies which workout it is.
 */
export function WorkoutLocked({
  category,
  format,
  durationMinutes,
  difficulty,
}: {
  category: WorkoutCategory;
  format: WorkoutFormat;
  durationMinutes: number;
  difficulty: Difficulty;
}) {
  return (
    <section className="surface border-dashed p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Lock className="size-4 text-champagne" aria-hidden />
        האימון של השיעור
      </h2>
      <p className="mt-1.5 text-sm text-muted">
        התוכנית המלאה נחשפת אחרי ההרשמה. עד אז זה מה שאפשר לספר:
      </p>
      <div className="mt-3">
        <WorkoutMeta
          category={category}
          format={format}
          durationMinutes={durationMinutes}
          difficulty={difficulty}
        />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Timer className="size-3.5" aria-hidden />
        {WORKOUT_FORMAT_HINTS[format]}
      </p>
    </section>
  );
}
