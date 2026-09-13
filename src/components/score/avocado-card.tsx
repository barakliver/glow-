import Link from 'next/link';
import { ChevronLeft, Flame } from 'lucide-react';
import { RipenessMark } from '@/components/brand/ripeness-mark';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AVOCADO_STYLES } from '@/lib/labels';
import { num } from '@/lib/utils';
import type { ScoreSummary, WeeklyGoal } from '@/lib/domain/score';
import type { AvocadoStyle } from '@/lib/domain/types';

/**
 * The member's avocado: the style they chose, how ripe it is, and where the
 * week stands against their own target.
 *
 * The weekly line never scolds. A week with nothing in it says so plainly and
 * points at the schedule; it does not imply anyone has fallen behind.
 */
export function AvocadoCard({
  style,
  score,
  goal,
}: {
  style: AvocadoStyle | null;
  score: ScoreSummary;
  goal: WeeklyGoal;
}) {
  const chosen = style ? AVOCADO_STYLES[style] : null;

  return (
    <section className="surface p-5" aria-labelledby="avocado-title">
      <div className="flex items-start gap-4">
        <RipenessMark
          ripeness={score.level.ripeness}
          size={60}
          title={`רמת בשלות: ${score.level.name}`}
        />

        <div className="min-w-0 flex-1">
          <h2 id="avocado-title" className="section-label">
            {chosen ? chosen.name : 'האבוקדו שלך'}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <p className="display text-xl leading-tight">{score.level.name}</p>
            {score.streakWeeks > 1 && (
              <Badge tone="accent">
                <Flame className="size-3" aria-hidden />
                <span className="num">{score.streakWeeks}</span> שבועות ברצף
              </Badge>
            )}
          </div>
          <p className="num mt-2 text-xs text-muted">
            <span className="font-bold text-ink">{num(score.total)}</span> נקודות · השבוע{' '}
            <span className="font-bold text-ink">+{num(score.thisWeek)}</span>
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold">היעד השבועי שלך</p>
          <p className="num text-sm font-bold text-accent-ink">
            {num(goal.done)} / {num(goal.target)}
          </p>
        </div>
        <Progress
          value={goal.progress}
          className="mt-3"
          aria-label={`${goal.done} מתוך ${goal.target} אימונים השבוע`}
        />
        <p className="mt-2.5 text-xs text-muted">
          {goal.met
            ? 'השלמת את היעד השבועי. כל אימון מכאן הוא בונוס.'
            : goal.done === 0
              ? 'השבוע עוד פתוח לגמרי.'
              : `עוד ${num(goal.target - goal.done)} כדי לסגור את השבוע.`}
        </p>
      </div>

      <Link
        href="/progress"
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-ink/80 transition-colors hover:text-ink"
      >
        פירוט הנקודות
        <ChevronLeft className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}
