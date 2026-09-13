'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ChevronLeft,
  Dumbbell,
  Filter,
  Library,
  LineChart,
  Play,
  RefreshCw,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DURATION_OPTIONS, type Recommendation } from '@/lib/domain/recommend';
import { getSuggestionsAction } from '@/app/actions/suggestions';
import { startWorkoutAction } from '@/app/actions/workout';
import { DIFFICULTY_LABELS, GOAL_LABELS, GOAL_OPTIONS } from '@/lib/labels';
import { formatDuration } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { TemplateWithExercises } from '@/lib/data/repository';
import type { Exercise, TrainingGoal, WorkoutSession, WorkoutSessionExercise } from '@/lib/domain/types';

function templateToExercises(template: TemplateWithExercises): WorkoutSessionExercise[] {
  return template.items.map((item, index) => ({
    exercise_id: item.exercise_id,
    position: item.position ?? index + 1,
    target_sets: item.sets,
    target_reps: item.reps,
    target_load_kg: item.load_kg,
    target_duration_seconds: item.duration_seconds,
    target_distance_meters: item.distance_meters,
    rest_seconds: item.rest_seconds,
    notes: item.trainer_notes,
  }));
}

export function WorkoutHub({
  activeSession,
  templates,
  exercises,
  initialRecommendations,
  preselectedTemplateId,
}: {
  activeSession: WorkoutSession | null;
  templates: TemplateWithExercises[];
  exercises: Exercise[];
  initialRecommendations: Recommendation[];
  preselectedTemplateId: string | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [goal, setGoal] = useState<TrainingGoal | 'auto'>('auto');
  const [minutes, setMinutes] = useState<number | 'auto'>('auto');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const templateMap = useMemo(
    () => new Map(templates.map((template) => [template.id, template])),
    [templates],
  );

  const start = (templateId: string | null) => {
    const template = templateId ? templateMap.get(templateId) : null;
    if (templateId && !template) {
      toast({ title: 'התבנית לא נמצאה', tone: 'error' });
      return;
    }
    startTransition(async () => {
      const result = await startWorkoutAction({
        templateId: template?.id ?? null,
        title: template?.title ?? 'אימון אישי',
        goal: template?.goal ?? 'general',
        exercises: template ? templateToExercises(template) : [],
      });
      if (!result.ok) {
        toast({ title: result.message, tone: 'error' });
        return;
      }
      router.push('/workout/active');
    });
  };

  // A recommendation link from the home screen starts immediately.
  useEffect(() => {
    if (!preselectedTemplateId || activeSession) return;
    const template = templateMap.get(preselectedTemplateId);
    if (!template) return;
    const element = document.getElementById(`template-${preselectedTemplateId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [preselectedTemplateId, templateMap, activeSession]);

  const refreshSuggestions = () => {
    setLoadingSuggestions(true);
    startTransition(async () => {
      const result = await getSuggestionsAction({
        goal: goal === 'auto' ? null : goal,
        minutes: minutes === 'auto' ? null : minutes,
        equipment: [],
      });
      if (result.ok && result.data) setRecommendations(result.data.recommendations);
      setLoadingSuggestions(false);
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="אימון"
        subtitle="המלצות אישיות, מאגר אימונים וספריית התרגילים"
        action={
          <Button variant="ghost" size="icon-sm" asChild aria-label="ספריית תרגילים">
            <Link href="/workout/library">
              <BookOpen className="size-4" />
            </Link>
          </Button>
        }
      />

      {activeSession && (
        <section className="rounded-lg border border-accent bg-accent/10 p-4 shadow-glow-soft">
          <p className="text-xs font-bold text-accent-ink">יש לך אימון פעיל</p>
          <h2 className="mt-0.5 text-lg font-extrabold">{activeSession.title}</h2>
          <p className="mt-1 text-xs text-muted">
            האימון נשמר אוטומטית. אפשר להמשיך בדיוק מאיפה שעצרתם.
          </p>
          <Button className="mt-3" block asChild>
            <Link href="/workout/active">
              <Play className="size-4" aria-hidden />
              המשך האימון
            </Link>
          </Button>
        </section>
      )}

      {/* Suggestions */}
      <section aria-labelledby="suggestions-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="suggestions-title" className="flex items-center gap-1.5 text-sm font-bold">
            <Sparkles className="size-4 text-champagne" aria-hidden />
            מומלץ עבורך
          </h2>
          <div className="flex gap-1">
            <Button
              variant={goal !== 'auto' || minutes !== 'auto' ? 'primary' : 'ghost'}
              size="icon-sm"
              aria-label="התאמת ההמלצות"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <Filter className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="רענון ההמלצות"
              onClick={refreshSuggestions}
              disabled={pending}
            >
              <RefreshCw className={cn('size-4', loadingSuggestions && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {filtersOpen && (
          <div className="surface space-y-3 p-3.5">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted">מטרת האימון</p>
              <Select
                value={goal}
                onValueChange={(value) => setGoal(value as TrainingGoal | 'auto')}
              >
                <SelectTrigger aria-label="מטרת אימון">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">לפי ההמלצה האוטומטית</SelectItem>
                  {GOAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted">כמה זמן יש לכם</p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setMinutes('auto')}
                  aria-pressed={minutes === 'auto'}
                  className={cn(
                    'h-10 flex-1 rounded-md border text-xs font-bold transition-all',
                    minutes === 'auto'
                      ? 'border-accent bg-accent/12 text-accent-ink'
                      : 'border-line bg-raised text-muted',
                  )}
                >
                  אוטומטי
                </button>
                {DURATION_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMinutes(value)}
                    aria-pressed={minutes === value}
                    className={cn(
                      'num h-10 flex-1 rounded-md border text-xs font-bold transition-all',
                      minutes === value
                        ? 'border-accent bg-accent/12 text-accent-ink'
                        : 'border-line bg-raised text-muted',
                    )}
                  >
                    {value}׳
                  </button>
                ))}
              </div>
            </div>
            <Button block size="sm" onClick={refreshSuggestions} loading={pending}>
              עדכון ההמלצות
            </Button>
          </div>
        )}

        {recommendations.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="אין כרגע המלצה מתאימה"
            description="נסו לשנות את המטרה או את הזמן הפנוי, או בחרו תבנית מהרשימה למטה."
          />
        ) : (
          recommendations.map((recommendation) => (
            <article
              key={recommendation.template.id}
              className="rounded-lg border border-line bg-surface p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold">{recommendation.template.title}</h3>
                <Badge tone="accent">{GOAL_LABELS[recommendation.template.goal]}</Badge>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{recommendation.reason}</p>
              <p className="num mt-2 text-xs font-semibold text-muted">
                {formatDuration(recommendation.template.duration_minutes)} ·{' '}
                {DIFFICULTY_LABELS[recommendation.template.difficulty]}
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => start(recommendation.template.id)} loading={pending}>
                  <Play className="size-4" aria-hidden />
                  התחלה
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/workout/templates/${recommendation.template.id}`}>
                    פרטי האימון
                    <ChevronLeft className="size-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* All approved templates */}
      <section aria-labelledby="templates-title" className="space-y-2">
        <h2 id="templates-title" className="section-label">
          כל תבניות האימון
        </h2>
        {templates.length === 0 ? (
          <EmptyState icon={Dumbbell} title="עדיין אין תבניות אימון" />
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li key={template.id} id={`template-${template.id}`}>
                <div
                  className={cn(
                    'rounded-lg border bg-surface p-3.5 transition-colors',
                    preselectedTemplateId === template.id
                      ? 'border-accent/50 shadow-glow-soft'
                      : 'border-line',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold">{template.title}</h3>
                      <p className="num mt-0.5 text-xs text-muted">
                        {formatDuration(template.duration_minutes)} ·{' '}
                        {DIFFICULTY_LABELS[template.difficulty]} · {template.items.length} תרגילים
                      </p>
                    </div>
                    <Badge tone="outline">{GOAL_LABELS[template.goal]}</Badge>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => start(template.id)} loading={pending}>
                      <Play className="size-4" aria-hidden />
                      התחלה
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/workout/templates/${template.id}`}>פרטים</Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        <Button variant="secondary" size="lg" block asChild>
          <Link href="/workout/wods">
            <Library className="size-4" aria-hidden />
            מאגר האימונים
          </Link>
        </Button>
        <Button variant="secondary" size="lg" block asChild>
          <Link href="/workout/results">
            <Trophy className="size-4" aria-hidden />
            התוצאות שלי
          </Link>
        </Button>
        <Button variant="secondary" size="lg" block asChild>
          <Link href="/tracking">
            <LineChart className="size-4" aria-hidden />
            המעקב שלי
          </Link>
        </Button>
        <Button variant="secondary" size="lg" block asChild>
          <Link href="/workout/new">
            <Dumbbell className="size-4" aria-hidden />
            בניית אימון אישי
          </Link>
        </Button>
        <Button variant="secondary" size="lg" block asChild>
          <Link href="/timer">
            <Timer className="size-4" aria-hidden />
            טיימר אינטרוולים
          </Link>
        </Button>
      </section>

      <p className="pb-2 text-center text-[11px] text-muted">
        ספריית התרגילים כוללת <span className="num">{exercises.length}</span> תרגילים עם הוראות
        ביצוע ודגשי בטיחות.
      </p>
    </div>
  );
}
