'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Compass } from 'lucide-react';
import { ROOT_LABEL, WEAK_POINTS, prioritise } from '@/lib/domain/coach/weak-points';
import { cn } from '@/lib/utils';

export function WeakPointTool() {
  const [selected, setSelected] = useState<string[]>([]);
  const { now, later } = useMemo(() => prioritise(selected), [selected]);

  const toggle = (id: string) =>
    setSelected((ids) => (ids.includes(id) ? ids.filter((entry) => entry !== id) : [...ids, id]));

  const groups = [
    { kind: 'performance' as const, title: 'איפה ההרמה נשברת' },
    { kind: 'aesthetic' as const, title: 'מה מפגר מאחור' },
  ];

  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <section key={group.kind} className="surface p-6">
          <h2 className="text-sm font-semibold">{group.title}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {WEAK_POINTS.filter((point) => point.kind === group.kind).map((point) => (
              <button
                key={point.id}
                type="button"
                onClick={() => toggle(point.id)}
                aria-pressed={selected.includes(point.id)}
                className={cn(
                  'rounded-full border px-4 py-2.5 text-xs font-medium transition-colors',
                  selected.includes(point.id)
                    ? 'border-accent bg-accent text-primary-foreground'
                    : 'border-line bg-surface text-muted hover:bg-raised',
                )}
              >
                {point.label}
              </button>
            ))}
          </div>
        </section>
      ))}

      {selected.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="בחרו מה לתקן"
          description="סמנו כל מה שרלוונטי. נעבוד על שניים בכל פעם — יותר מזה אף אחד לא מתאושש ממנו."
        />
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="section-label">מתחילים מכאן</h2>
            {now.map((point) => (
              <article key={point.id} className="surface p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{point.label}</h3>
                  <Badge tone="outline">{ROOT_LABEL[point.rootCause]}</Badge>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{point.rootCauseWhy}</p>

                <ul className="mt-5 space-y-4">
                  {point.correctives.map((corrective) => (
                    <li key={corrective.name} className="border-t border-line/70 pt-4 first:border-0 first:pt-0">
                      <p className="text-sm font-semibold">{corrective.name}</p>
                      <p className="num mt-1 text-sm text-accent-ink">
                        {corrective.sets} × {corrective.reps} · טמפו {corrective.tempo}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">{corrective.cue}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-3 border-t border-line pt-4">
                  <div>
                    <p className="label-muted block">איך משלבים</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{point.integration}</p>
                  </div>
                  <div>
                    <p className="label-muted block">כמה זמן</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{point.timeline}</p>
                  </div>
                  <div>
                    <p className="label-muted block">איך תדע שזה עובד</p>
                    <ul className="mt-1 space-y-1">
                      {point.markers.map((marker) => (
                        <li key={marker} className="flex gap-2 text-xs leading-relaxed text-muted">
                          <span aria-hidden className="text-accent-ink">
                            ·
                          </span>
                          {marker}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {later.length > 0 && (
            <section className="surface p-6">
              <h2 className="text-sm font-semibold">אחר כך</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                לא שכחנו — פשוט לא עכשיו. שתי נקודות בכל פעם זה מה שאפשר להתאושש ממנו, ורשימה של
                חמש הופכת לרשימה של אפס.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {later.map((point) => (
                  <li key={point.id}>
                    <Badge tone="neutral">{point.label}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
