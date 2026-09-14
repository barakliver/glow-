import Link from 'next/link';
import { CheckCircle2, Gauge } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SCORE_TYPE_LABELS, WORKOUT_CATEGORY_LABELS } from '@/lib/labels';
import { formatShortDate } from '@/lib/time';
import { formatScore, progressNote, PROGRESS_NOTE_TEXT } from '@/lib/domain/workout-score';
import type { WorkoutLogWithWorkout } from '@/lib/domain/types';

/**
 * A member's own results, newest first.
 *
 * Every comparison on this screen is against the same member's earlier
 * attempts. There is no leaderboard in GLoW and no view that ranks one member
 * against another.
 */
export function WorkoutHistoryList({
  title,
  entries,
  showWorkoutTitle = true,
}: {
  title: string;
  entries: WorkoutLogWithWorkout[];
  showWorkoutTitle?: boolean;
}) {
  // Oldest first while walking the list, so each row compares only to what came
  // before it rather than to the whole history including its own future.
  const ordered = [...entries].sort((a, b) =>
    a.log.performed_on.localeCompare(b.log.performed_on),
  );
  const annotated = ordered.map((entry, index) => ({
    ...entry,
    note: progressNote(entry.workout.score_type, entry.log, ordered.slice(0, index).map((e) => e.log)),
  }));

  return (
    <section className="surface p-6">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      <ol className="space-y-2.5">
        {annotated.reverse().map((entry) => (
          <li
            key={entry.log.id}
            className="rounded-xl border border-line bg-raised p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {showWorkoutTitle ? (
                  <Link
                    href={`/workout/wods/${entry.workout.slug}`}
                    className="truncate text-sm font-semibold hover:text-accent-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {entry.workout.title}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold">
                    {SCORE_TYPE_LABELS[entry.workout.score_type]}
                  </p>
                )}
                <p className="num mt-0.5 text-xs text-muted">
                  {formatShortDate(entry.log.performed_on)}
                </p>
              </div>
              <p className="num display shrink-0 text-xl leading-none text-accent-ink">
                {formatScore(entry.workout.score_type, entry.log)}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge tone={entry.log.rx ? 'success' : 'neutral'}>
                {entry.log.rx ? 'Rx' : 'Scaled'}
              </Badge>
              {showWorkoutTitle && (
                <Badge tone="outline">{WORKOUT_CATEGORY_LABELS[entry.workout.category]}</Badge>
              )}
              {entry.log.rpe !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Gauge className="size-3.5" aria-hidden />
                  <span className="num">RPE {entry.log.rpe}</span>
                </span>
              )}
              {(entry.note.kind === 'best' || entry.note.kind === 'improved') && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                  {PROGRESS_NOTE_TEXT[entry.note.kind]}
                </span>
              )}
            </div>

            {entry.log.notes && (
              <p className="mt-2 text-sm leading-relaxed text-muted">{entry.log.notes}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
