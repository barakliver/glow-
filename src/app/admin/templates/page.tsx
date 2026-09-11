import type { Metadata } from 'next';
import { requireStaff, getRepository } from '@/lib/auth';
import { TemplateManager } from './template-manager';

export const metadata: Metadata = { title: 'תבניות אימון' };

export default async function AdminTemplatesPage() {
  await requireStaff();
  const repository = await getRepository();
  const [templates, exercises] = await Promise.all([
    repository.listTemplates(true),
    repository.listExercises(),
  ]);
  const detailed = await Promise.all(templates.map((t) => repository.getTemplate(t.id)));

  return (
    <TemplateManager
      templates={detailed.filter((t): t is NonNullable<typeof t> => Boolean(t))}
      exercises={exercises}
    />
  );
}
