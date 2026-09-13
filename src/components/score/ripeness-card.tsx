import Link from 'next/link';
import { ChevronLeft, Flame } from 'lucide-react';
import { RipenessMark } from '@/components/brand/ripeness-mark';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { num } from '@/lib/utils';
import type { ScoreSummary } from '@/lib/domain/score';

/** Compact ripeness summary for the home screen. */
export function RipenessCard({ score }: { score: ScoreSummary }) {
  return (
    <section className="surface p-4" aria-labelledby="ripeness-title">
      <div className="flex items-start gap-3.5">
        <RipenessMark
          ripeness={score.level.ripeness}
          size={54}
          title={`רמת בשלות: ${score.level.name}`}
        />

        <div className="min-w-0 flex-1">
          <h2 id="ripeness-title" className="section-label">
            מדד הבשלות שלך
          </h2>
          {/* The level name is the headline here, so it wraps rather than
              clipping, and the streak badge drops below it when space is tight. */}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="display text-xl leading-tight">{score.level.name}</p>
            {score.streakWeeks > 1 && (
              <Badge tone="accent">
                <Flame className="size-3" aria-hidden />
                <span className="num">{score.streakWeeks}</span> שבועות ברצף
              </Badge>
            )}
          </div>

          <p className="num mt-1.5 text-xs text-muted">
            <span className="font-bold text-ink">{num(score.total)}</span> נקודות · השבוע{' '}
            <span className="font-bold text-ink">+{num(score.thisWeek)}</span>
          </p>

          {score.nextLevel ? (
            <>
              <Progress
                value={score.levelProgress}
                className="mt-2.5"
                label={`התקדמות לרמת ${score.nextLevel.name}`}
              />
              <p className="num mt-1.5 text-[11px] text-muted">
                עוד {num(score.pointsToNext)} נקודות ל&quot;{score.nextLevel.name}&quot;
              </p>
            </>
          ) : (
            <p className="mt-2 text-[11px] font-semibold text-accent-ink">
              הגעת לרמה הגבוהה ביותר. נשאר רק לשמור עליה.
            </p>
          )}
        </div>
      </div>

      <Link
        href="/progress"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-ink/80 transition-colors hover:text-ink"
      >
        איך צוברים נקודות
        <ChevronLeft className="size-3.5" aria-hidden />
      </Link>
    </section>
  );
}
