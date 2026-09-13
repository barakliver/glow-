'use client';

import { DEFAULT_CLASS_CAPACITY } from '@/lib/domain/booking-rules';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarOff,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Copy,
  Ban,
  Lock,
  LockOpen,
  Megaphone,
  Pencil,
  Repeat,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ClassForm, type ClassFormValues } from './class-form';
import {
  createClassAction,
  createSeriesAction,
  deleteClassAction,
  duplicateClassAction,
  patchClassAction,
  publishWeekAction,
  updateSeriesScopeAction,
} from '@/app/actions/admin';
import { classFormSchema, seriesFormSchema, zodFieldErrors } from '@/lib/validation';
import { CATEGORY_LABELS } from '@/lib/labels';
import {
  dayKey,
  formatHebrewFullDate,
  formatTime,
  HEBREW_WEEKDAYS_SHORT,
  parseISO,
  format,
} from '@/lib/time';
import { cn } from '@/lib/utils';
import type { ClassWithMeta } from '@/lib/domain/types';

function emptyValues(date: string): ClassFormValues {
  return {
    title: '',
    description: '',
    category: 'functional',
    difficulty: 'beginner',
    trainer_id: '',
    location: 'אולם GLoW',
    capacity: String(DEFAULT_CLASS_CAPACITY),
    date,
    time: '18:00',
    duration_minutes: '45',
    equipment: [],
    published: true,
    weekdays: [],
    start_date: date,
    end_date: date,
  };
}

function fromClass(gymClass: ClassWithMeta): ClassFormValues {
  const duration = Math.round(
    (new Date(gymClass.ends_at).getTime() - new Date(gymClass.starts_at).getTime()) / 60000,
  );
  return {
    title: gymClass.title,
    description: gymClass.description ?? '',
    category: gymClass.category,
    difficulty: gymClass.difficulty,
    trainer_id: gymClass.trainer_id ?? '',
    location: gymClass.location,
    capacity: String(gymClass.capacity),
    date: dayKey(gymClass.starts_at),
    time: formatTime(gymClass.starts_at),
    duration_minutes: String(duration),
    equipment: gymClass.equipment,
    published: gymClass.published,
    weekdays: [],
    start_date: dayKey(gymClass.starts_at),
    end_date: dayKey(gymClass.starts_at),
  };
}

function toPayload(values: ClassFormValues) {
  return {
    title: values.title,
    description: values.description,
    category: values.category,
    difficulty: values.difficulty,
    trainer_id: values.trainer_id,
    location: values.location,
    capacity: values.capacity,
    date: values.date,
    time: values.time,
    duration_minutes: values.duration_minutes,
    equipment: values.equipment,
    published: values.published,
  };
}

export function AdminSchedule({
  classes,
  trainers,
  series,
  weekOffset,
  weekDays,
  isOwner,
  myTrainerId,
  weekRange,
}: {
  classes: ClassWithMeta[];
  trainers: { id: string; name: string }[];
  series: { id: string; title: string }[];
  weekOffset: number;
  weekDays: string[];
  isOwner: boolean;
  myTrainerId: string | null;
  weekRange: { fromIso: string; toIso: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [editing, setEditing] = useState<ClassWithMeta | null>(null);
  const [duplicating, setDuplicating] = useState<ClassWithMeta | null>(null);
  const [duplicateDate, setDuplicateDate] = useState(weekDays[0]);
  const [duplicateTime, setDuplicateTime] = useState('18:00');
  const [values, setValues] = useState<ClassFormValues>(emptyValues(weekDays[0]));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scope, setScope] = useState<'one' | 'all'>('one');

  const canManage = (gymClass: ClassWithMeta) =>
    isOwner || (myTrainerId !== null && gymClass.trainer_id === myTrainerId);

  const openCreate = (isRecurring: boolean) => {
    setRecurring(isRecurring);
    setValues({
      ...emptyValues(weekDays[0]),
      weekdays: isRecurring ? [0] : [],
      end_date: weekDays[6],
    });
    setErrors({});
    setCreateOpen(true);
  };

  const submitCreate = () => {
    if (recurring) {
      const payload = {
        ...toPayload(values),
        weekdays: values.weekdays,
        start_date: values.start_date,
        end_date: values.end_date,
      };
      const { date: _date, ...rest } = payload;
      const parsed = seriesFormSchema.safeParse(rest);
      if (!parsed.success) {
        setErrors(zodFieldErrors(parsed.error));
        return;
      }
      startTransition(async () => {
        const result = await createSeriesAction(rest);
        toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
        if (result.ok) {
          setCreateOpen(false);
          router.refresh();
        }
      });
      return;
    }

    const payload = toPayload(values);
    const parsed = classFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    startTransition(async () => {
      const result = await createClassAction(payload);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setCreateOpen(false);
        router.refresh();
      }
    });
  };

  const submitEdit = () => {
    if (!editing) return;
    const payload = toPayload(values);
    const parsed = classFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    startTransition(async () => {
      const result = editing.series_id
        ? await updateSeriesScopeAction(editing.series_id, editing.id, payload, scope)
        : await updateSeriesScopeAction('', editing.id, payload, 'one');
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setEditing(null);
        router.refresh();
      }
    });
  };

  const patch = (gymClass: ClassWithMeta, changes: Parameters<typeof patchClassAction>[1]) => {
    startTransition(async () => {
      const result = await patchClassAction(gymClass.id, changes);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const remove = (gymClass: ClassWithMeta) => {
    startTransition(async () => {
      const result = await deleteClassAction(gymClass.id);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const publishWeek = () => {
    startTransition(async () => {
      const result = await publishWeekAction(weekRange.fromIso, weekRange.toIso);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) router.refresh();
    });
  };

  const duplicate = () => {
    if (!duplicating) return;
    startTransition(async () => {
      const result = await duplicateClassAction(duplicating.id, duplicateDate, duplicateTime);
      toast({ title: result.message, tone: result.ok ? 'success' : 'error' });
      if (result.ok) {
        setDuplicating(null);
        router.refresh();
      }
    });
  };

  const byDay = new Map<string, ClassWithMeta[]>();
  weekDays.forEach((day) => byDay.set(day, []));
  for (const gymClass of classes) {
    const key = dayKey(gymClass.starts_at);
    if (byDay.has(key)) byDay.get(key)!.push(gymClass);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-2xl tracking-tight">ניהול לוח שבועי</h1>
          <p className="text-sm text-muted">
            {formatHebrewFullDate(parseISO(`${weekDays[0]}T12:00:00`))} –{' '}
            {formatHebrewFullDate(parseISO(`${weekDays[6]}T12:00:00`))}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => openCreate(false)}>
              <CalendarPlus className="size-4" aria-hidden />
              שיעור חדש
            </Button>
            <Button variant="secondary" size="sm" onClick={() => openCreate(true)}>
              <Repeat className="size-4" aria-hidden />
              סדרה קבועה
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" size="sm" disabled={pending}>
                  <Megaphone className="size-4" aria-hidden />
                  פרסום הלוח
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>לפרסם את לוח השבוע?</AlertDialogTitle>
                  <AlertDialogDescription>
                    כל השיעורים שנשמרו כטיוטה בשבוע הזה יפורסמו, וכל המתאמנים יקבלו התראה שהלוח
                    החדש פתוח להרשמה.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={publishWeek}>כן, פרסמו והודיעו</AlertDialogAction>
                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface p-1.5">
        <Button variant="ghost" size="icon-sm" asChild aria-label="שבוע קודם">
          <Link href={`/admin/schedule?week=${weekOffset - 1}`}>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
        {weekOffset !== 0 ? (
          <Link href="/admin/schedule" className="text-xs font-bold text-ink/80 transition-colors hover:text-ink">
            חזרה לשבוע הנוכחי
          </Link>
        ) : (
          <span className="text-xs font-semibold text-muted">השבוע הנוכחי</span>
        )}
        <Button variant="ghost" size="icon-sm" asChild aria-label="שבוע הבא">
          <Link href={`/admin/schedule?week=${weekOffset + 1}`}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
      </div>

      {classes.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="אין שיעורים בשבוע הזה"
          description={
            isOwner
              ? 'צרו שיעור בודד או סדרה קבועה שתייצר מופעים אוטומטית.'
              : 'עדיין לא שובצת לשיעורים בשבוע הזה.'
          }
          action={
            isOwner ? (
              <Button size="sm" onClick={() => openCreate(true)}>
                יצירת סדרה קבועה
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const items = byDay.get(day) ?? [];
            if (items.length === 0) return null;
            const date = parseISO(`${day}T12:00:00`);
            return (
              <section key={day}>
                <h2 className="section-label mb-2 block">
                  יום {HEBREW_WEEKDAYS_SHORT[date.getDay()]}
                  <span className="num ms-2 font-normal text-muted">{format(date, 'd.M')}</span>
                </h2>
                <ul className="space-y-2">
                  {items.map((gymClass) => (
                    <li key={gymClass.id} className="surface p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="num text-sm font-extrabold text-accent-ink">
                              {formatTime(gymClass.starts_at)}
                            </span>
                            <h3 className="truncate text-sm font-bold">{gymClass.title}</h3>
                            {!gymClass.published && <Badge tone="warning">טיוטה</Badge>}
                            {gymClass.status === 'cancelled' && <Badge tone="danger">בוטל</Badge>}
                            {gymClass.registration_closed && <Badge tone="neutral">הרשמה סגורה</Badge>}
                            {gymClass.series_id && <Badge tone="outline">סדרה</Badge>}
                          </div>
                          <p className="num mt-1 text-xs text-muted">
                            {CATEGORY_LABELS[gymClass.category]} · {gymClass.trainer_name ?? 'ללא מאמן'} ·{' '}
                            {gymClass.confirmed_count}/{gymClass.capacity} רשומים
                            {gymClass.waitlist_count > 0 && ` · ${gymClass.waitlist_count} בהמתנה`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/admin/classes/${gymClass.id}`}>
                            <Users className="size-4" aria-hidden />
                            משתתפים
                          </Link>
                        </Button>

                        {canManage(gymClass) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditing(gymClass);
                                setValues(fromClass(gymClass));
                                setScope('one');
                                setErrors({});
                              }}
                            >
                              <Pencil className="size-4" aria-hidden />
                              עריכה
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                patch(gymClass, { registration_closed: !gymClass.registration_closed })
                              }
                            >
                              {gymClass.registration_closed ? (
                                <LockOpen className="size-4" aria-hidden />
                              ) : (
                                <Lock className="size-4" aria-hidden />
                              )}
                              {gymClass.registration_closed ? 'פתיחת הרשמה' : 'סגירת הרשמה'}
                            </Button>

                            {isOwner && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setDuplicating(gymClass);
                                  setDuplicateDate(dayKey(gymClass.starts_at));
                                  setDuplicateTime(formatTime(gymClass.starts_at));
                                }}
                              >
                                <Copy className="size-4" aria-hidden />
                                שכפול
                              </Button>
                            )}

                            {gymClass.status !== 'cancelled' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Ban className="size-4" aria-hidden />
                                    ביטול שיעור
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>לבטל את השיעור?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      כל הרישומים יבוטלו ו-{gymClass.confirmed_count + gymClass.waitlist_count}{' '}
                                      מתאמנים יקבלו התראה. הפעולה אינה הפיכה.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogAction
                                      onClick={() => patch(gymClass, { status: 'cancelled' })}
                                    >
                                      כן, בטלו את השיעור
                                    </AlertDialogAction>
                                    <AlertDialogCancel>השאירו</AlertDialogCancel>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {isOwner && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="size-4" aria-hidden />
                                    מחיקה
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>למחוק את השיעור לצמיתות?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      השיעור, הרישומים והנוכחות שלו יימחקו ולא ניתן יהיה לשחזר אותם.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogAction onClick={() => remove(gymClass)}>
                                      כן, מחקו
                                    </AlertDialogAction>
                                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{recurring ? 'יצירת סדרה קבועה' : 'יצירת שיעור'}</DialogTitle>
            <DialogDescription>
              {recurring
                ? 'הסדרה תייצר מופע לכל יום שנבחר בטווח התאריכים.'
                : 'שיעור בודד בתאריך ובשעה שתבחרו.'}
            </DialogDescription>
          </DialogHeader>
          <ClassForm
            values={values}
            onChange={(patchValues) => setValues((current) => ({ ...current, ...patchValues }))}
            trainers={trainers}
            errors={errors}
            recurring={recurring}
          />
          <Button block size="lg" className="mt-4" onClick={submitCreate} loading={pending}>
            {recurring ? 'יצירת הסדרה' : 'יצירת השיעור'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת שיעור</DialogTitle>
            <DialogDescription>
              שינוי שעה ישלח התראה אוטומטית לכל המשתתפים הרשומים.
            </DialogDescription>
          </DialogHeader>

          {editing?.series_id && (
            <fieldset className="mb-3">
              <legend className="mb-1.5 text-sm font-semibold">על מה חל השינוי?</legend>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={scope === 'one'}
                  onClick={() => setScope('one')}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-xs font-bold transition-all',
                    scope === 'one'
                      ? 'border-accent bg-accent/12 text-accent-ink'
                      : 'border-line bg-raised text-muted',
                  )}
                >
                  המופע הזה בלבד
                </button>
                <button
                  type="button"
                  aria-pressed={scope === 'all'}
                  onClick={() => setScope('all')}
                  className={cn(
                    'rounded-md border px-3 py-2.5 text-xs font-bold transition-all',
                    scope === 'all'
                      ? 'border-accent bg-accent/12 text-accent-ink'
                      : 'border-line bg-raised text-muted',
                  )}
                >
                  כל הסדרה מכאן והלאה
                </button>
              </div>
            </fieldset>
          )}

          <ClassForm
            values={values}
            onChange={(patchValues) => setValues((current) => ({ ...current, ...patchValues }))}
            trainers={trainers}
            errors={errors}
          />
          <Button block size="lg" className="mt-4" onClick={submitEdit} loading={pending}>
            שמירת השינויים
          </Button>
        </DialogContent>
      </Dialog>

      {/* Duplicate dialog */}
      <Dialog open={Boolean(duplicating)} onOpenChange={(open) => !open && setDuplicating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שכפול שיעור</DialogTitle>
            <DialogDescription>
              {duplicating?.title} ישוכפל עם אותם הגדרות, ללא הרישומים הקיימים.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="duplicate-date">תאריך חדש</Label>
              <Input
                id="duplicate-date"
                type="date"
                dir="ltr"
                className="num"
                value={duplicateDate}
                onChange={(event) => setDuplicateDate(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duplicate-time">שעה</Label>
              <Input
                id="duplicate-time"
                type="time"
                dir="ltr"
                className="num"
                value={duplicateTime}
                onChange={(event) => setDuplicateTime(event.target.value)}
              />
            </div>
          </div>
          <Button block size="lg" className="mt-4" onClick={duplicate} loading={pending}>
            שכפול
          </Button>
        </DialogContent>
      </Dialog>

      {series.length > 0 && isOwner && (
        <p className="pt-2 text-xs text-muted">
          פעילות כרגע <span className="num font-bold text-ink">{series.length}</span> סדרות קבועות.
        </p>
      )}
    </div>
  );
}
