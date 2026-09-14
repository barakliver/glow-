import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Info } from 'lucide-react';
import { requireUser, getRepository } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { StartTemplateButton } from './start-template-button';
import { AREA_LABELS, DIFFICULTY_LABELS, GOAL_LABELS } from '@/lib/labels';
import { formatDuration } from '@/lib/time';
import type { BodyArea } from '@/lib/domain/types';

const BLOCK_LABELS = {
  warmup: 'חימום',
  main: 'עיקרי',
  finisher: 'סיום',
  cooldown: 'שחרור',
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const repository = await getRepository();
  const template = await repository.getTemplate(id);
  return { title: template?.title ?? 'תבנית אימון' };
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser(`/workout/templates/${id}`);
  const repository = await getRepository();
  const template = await repository.getTemplate(id);
  if (!template || template.archived) notFound();

  const blocks = (['warmup', 'main', 'finisher', 'cooldown'] as const)
    .map((block) => ({ block, items: template.items.filter((item) => item.block === block) }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="space-y-4">
      <PageHeader title={template.title} backHref="/workout" />

      <section className="surface p-4">
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="accent">{GOAL_LABELS[template.goal]}</Badge>
          <Badge tone="neutral">{DIFFICULTY_LABELS[template.difficulty]}</Badge>
          <Badge tone="outline">{formatDuration(template.duration_minutes)}</Badge>
        </div>
        {template.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted">{template.description}</p>
        )}
        {template.focus_areas.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            מיקוד: {template.focus_areas.map((a) => AREA_LABELS[a as BodyArea]).join(' · ')}
          </p>
        )}
        <div className="mt-4">
          <StartTemplateButton
            templateId={template.id}
            title={template.title}
            goal={template.goal}
            exercises={template.items.map((item, index) => ({
              exercise_id: item.exercise_id,
              position: item.position ?? index + 1,
              target_sets: item.sets,
              target_reps: item.reps,
              target_load_kg: item.load_kg,
              target_duration_seconds: item.duration_seconds,
              target_distance_meters: item.distance_meters,
              rest_seconds: item.rest_seconds,
              notes: item.trainer_notes,
            }))}
          />
        </div>
      </section>

      {blocks.map((group) => (
        <section key={group.block} className="space-y-2">
          <h2 className="text-sm font-semibold">{BLOCK_LABELS[group.block]}</h2>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item.id} className="surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.exercise?.name_he ?? 'תרגיל'}
                    </p>
                    <p className="num mt-1 text-xs text-muted">
                      {[
                        item.sets && `${item.sets} סטים`,
                        item.reps && `${item.reps} חזרות`,
                        item.load_kg && `${item.load_kg} ק"ג`,
                        item.duration_seconds && `${item.duration_seconds} שניות`,
                        item.distance_meters && `${item.distance_meters} מטר`,
                        item.rest_seconds && `מנוחה ${item.rest_seconds}׳׳`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                {item.trainer_notes && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-md border border-line bg-raised p-2.5 text-xs text-muted">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-accent-ink" aria-hidden />
                    {item.trainer_notes}
                  </p>
                )}
                {item.alternative_exercise_ids.length > 0 && (
                  <p className="mt-2 text-[11px] text-muted">
                    חלופות:{' '}
                    {item.alternative_exercise_ids
                      .map(
                        (altId) =>
                          template.items.find((i) => i.exercise_id === altId)?.exercise?.name_he ??
                          null,
                      )
                      .filter(Boolean)
                      .join(', ') || 'זמינות בתוך האימון'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
