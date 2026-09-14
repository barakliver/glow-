import { Flame, Sprout } from 'lucide-react';
import { RipenessMark } from '@/components/brand/ripeness-mark';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LEVELS, POINTS, type ScoreSummary } from '@/lib/domain/score';
import { cn, num } from '@/lib/utils';

const POINT_HINT: Record<keyof typeof POINTS, string> = {
  workout: `${POINTS.workout} נק׳ לאימון`,
  classAttended: `${POINTS.classAttended} נק׳ לשיעור`,
  readiness: `${POINTS.readiness} נק׳ לדיווח`,
  personalRecord: `${POINTS.personalRecord} נק׳ לשיא`,
  weeklyStreak: `${POINTS.weeklyStreak} נק׳ לשבוע ברצף`,
};

/** Full ripeness breakdown for the progress area. */
export function RipenessDetail({ score }: { score: ScoreSummary }) {
  const currentIndex = LEVELS.findIndex((level) => level.key === score.level.key);

  return (
    <section className="space-y-3" aria-labelledby="ripeness-detail-title">
      <h2 id="ripeness-detail-title" className="flex items-center gap-1.5 text-sm font-semibold">
        <Sprout className="size-4 text-champagne" aria-hidden />
        מדד הבשלות
      </h2>

      <div className="surface p-4">
        <div className="flex items-center gap-4">
          <RipenessMark ripeness={score.level.ripeness} size={80} />
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold leading-tight">{score.level.name}</p>
            <p className="num text-sm text-muted">{num(score.total)} נקודות</p>
            {score.streakWeeks > 1 && (
              <Badge tone="accent" className="mt-1.5">
                <Flame className="size-3" aria-hidden />
                <span className="num">{score.streakWeeks}</span> שבועות ברצף
              </Badge>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">{score.level.blurb}</p>

        {score.nextLevel && (
          <div className="mt-3">
            <Progress value={score.levelProgress} label={`התקדמות לרמת ${score.nextLevel.name}`} />
            <p className="num mt-1.5 text-[11px] text-muted">
              עוד {num(score.pointsToNext)} נקודות ל&quot;{score.nextLevel.name}&quot;
            </p>
          </div>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-line bg-raised p-2.5 text-center">
            <dd className="num text-lg font-semibold text-ink">+{num(score.thisWeek)}</dd>
            <dt className="label-muted">השבוע</dt>
          </div>
          <div className="rounded-md border border-line bg-raised p-2.5 text-center">
            <dd className="num text-lg font-semibold">+{num(score.thisMonth)}</dd>
            <dt className="label-muted">החודש</dt>
          </div>
        </dl>
      </div>

      {score.breakdown.length > 0 && (
        <div className="surface p-4">
          <h3 className="text-sm font-semibold">מאיפה הגיעו הנקודות</h3>
          <ul className="mt-2.5 space-y-1.5">
            {score.breakdown.map((row) => (
              <li
                key={row.key}
                className="flex items-center justify-between gap-2 rounded-md border border-line bg-raised px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">{row.label}</span>
                  <span className="num block text-[11px] text-muted">
                    {num(row.count)} × {POINT_HINT[row.key]}
                  </span>
                </span>
                <span className="num shrink-0 text-sm font-semibold text-ink">
                  +{num(row.points)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="surface p-4">
        <h3 className="text-sm font-semibold">שלבי הבשלות</h3>
        <ol className="mt-2.5 space-y-1.5">
          {LEVELS.map((level, index) => {
            const reached = index <= currentIndex;
            const current = index === currentIndex;
            return (
              <li
                key={level.key}
                className={cn(
                  'flex items-center gap-3 rounded-md border px-3 py-2 transition-colors',
                  current
                    ? 'border-accent/45 bg-accent/8'
                    : reached
                      ? 'border-line bg-raised'
                      : 'border-line/60 bg-surface opacity-60',
                )}
              >
                <RipenessMark ripeness={level.ripeness} size={28} title={level.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{level.name}</span>
                  <span className="num block text-[11px] text-muted">
                    מ-{num(level.minPoints)} נקודות
                  </span>
                </span>
                {current && <Badge tone="accent">כאן אתה</Badge>}
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          הנקודות נצברות מהופעה ומביצועים בלבד, והן אישיות לחלוטין — אין דירוג ואין השוואה בין
          מתאמנים.
        </p>
      </div>
    </section>
  );
}
