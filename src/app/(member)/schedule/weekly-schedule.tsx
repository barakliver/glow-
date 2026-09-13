'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Lock,
  LockOpen,
  X,
} from 'lucide-react';
import { ClassCard } from '@/components/classes/class-card';
import { BookingButton } from '@/components/classes/booking-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { availabilityForClass } from '@/lib/domain/booking-rules';
import { CATEGORY_LABELS, CATEGORY_OPTIONS, WORKOUT_FORMAT_LABELS } from '@/lib/labels';
import {
  dayKey,
  formatHebrewFullDate,
  HEBREW_WEEKDAYS_SHORT,
  isToday,
  parseISO,
  format,
} from '@/lib/time';
import { cn } from '@/lib/utils';
import type { ClassWithMeta, TrainingCategory } from '@/lib/domain/types';

type Availability = 'all' | 'available' | 'booked';

export function WeeklySchedule({
  classes,
  trainers,
  weekOffset,
  weekDays,
  initialDay,
}: {
  classes: ClassWithMeta[];
  trainers: { id: string; name: string }[];
  weekOffset: number;
  weekDays: string[];
  initialDay: string | null;
}) {
  const todayKey = dayKey(new Date());
  const defaultDay = weekDays.includes(todayKey) ? todayKey : weekDays[0];
  const [selectedDay, setSelectedDay] = useState(
    initialDay && weekDays.includes(initialDay) ? initialDay : defaultDay,
  );
  const [category, setCategory] = useState<TrainingCategory | 'all'>('all');
  const [trainerId, setTrainerId] = useState<string>('all');
  const [availability, setAvailability] = useState<Availability>('all');
  // 'auto' lets CSS decide: one day on a phone, the whole week on a wide
  // screen. Touching the toggle pins it to an explicit choice.
  const [view, setView] = useState<'auto' | 'day' | 'week'>('auto');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return classes.filter((gymClass) => {
      if (category !== 'all' && gymClass.category !== category) return false;
      if (trainerId !== 'all' && gymClass.trainer_id !== trainerId) return false;
      if (availability === 'booked' && !gymClass.my_booking) return false;
      if (availability === 'available') {
        const state = availabilityForClass(gymClass);
        if (state !== 'available' && state !== 'almost_full') return false;
      }
      return true;
    });
  }, [classes, category, trainerId, availability]);

  const byDay = useMemo(() => {
    const map = new Map<string, ClassWithMeta[]>();
    weekDays.forEach((day) => map.set(day, []));
    for (const gymClass of filtered) {
      const key = dayKey(gymClass.starts_at);
      if (map.has(key)) map.get(key)!.push(gymClass);
    }
    return map;
  }, [filtered, weekDays]);

  const countsByDay = useMemo(() => {
    const map = new Map<string, number>();
    weekDays.forEach((day) => map.set(day, 0));
    for (const gymClass of classes) {
      const key = dayKey(gymClass.starts_at);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [classes, weekDays]);

  const activeFilters =
    (category !== 'all' ? 1 : 0) + (trainerId !== 'all' ? 1 : 0) + (availability !== 'all' ? 1 : 0);

  const dayClasses = byDay.get(selectedDay) ?? [];
  const weekLabel = `${formatHebrewFullDate(parseISO(`${weekDays[0]}T12:00:00`))} – ${formatHebrewFullDate(parseISO(`${weekDays[6]}T12:00:00`))}`;

  const resetFilters = () => {
    setCategory('all');
    setTrainerId('all');
    setAvailability('all');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="display text-xl tracking-tight">לוח שבועי</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="החלפה בין תצוגת יום לתצוגת שבוע"
            onClick={() => {
              const wide =
                typeof window !== 'undefined' &&
                window.matchMedia('(min-width: 1024px)').matches;
              const effective = view === 'auto' ? (wide ? 'week' : 'day') : view;
              setView(effective === 'day' ? 'week' : 'day');
            }}
          >
            {view === 'week' ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
          </Button>
          <Button
            variant={activeFilters > 0 ? 'primary' : 'ghost'}
            size="icon-sm"
            aria-label="סינון"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <Filter className="size-4" />
          </Button>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface p-1.5">
        <Button variant="ghost" size="icon-sm" asChild aria-label="שבוע קודם">
          <Link href={`/schedule?week=${weekOffset - 1}`} scroll={false}>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 text-center">
          <p className="truncate text-xs font-semibold">{weekLabel}</p>
          {weekOffset !== 0 && (
            <Link href="/schedule" className="text-[11px] font-bold text-ink/80 transition-colors hover:text-ink">
              חזרה להיום
            </Link>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" asChild aria-label="שבוע הבא">
          <Link href={`/schedule?week=${weekOffset + 1}`} scroll={false}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
      </div>

      {filtersOpen && (
        <div className="surface space-y-3 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">סינון</p>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-ink/80 transition-colors hover:text-ink"
              >
                <X className="size-3" aria-hidden />
                ניקוי
              </button>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Select value={category} onValueChange={(v) => setCategory(v as TrainingCategory | 'all')}>
              <SelectTrigger aria-label="סוג אימון">
                <SelectValue placeholder="סוג אימון" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל סוגי האימון</SelectItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={trainerId} onValueChange={setTrainerId}>
              <SelectTrigger aria-label="מאמן">
                <SelectValue placeholder="מאמן" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המאמנים</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={availability} onValueChange={(v) => setAvailability(v as Availability)}>
              <SelectTrigger aria-label="זמינות">
                <SelectValue placeholder="זמינות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="available">יש מקום פנוי</SelectItem>
                <SelectItem value="booked">השיעורים שלי</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div
        className={cn(
          view === 'day' && 'block',
          view === 'week' && 'hidden',
          view === 'auto' && 'block lg:hidden',
        )}
      >
        <div className="space-y-4">
          {/* Day strip */}
          <div
            role="tablist"
            aria-label="ימי השבוע"
            className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
          >
            {weekDays.map((day) => {
              const date = parseISO(`${day}T12:00:00`);
              const active = day === selectedDay;
              const today = isToday(date);
              const count = countsByDay.get(day) ?? 0;
              return (
                <button
                  key={day}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'flex min-h-[68px] w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border px-1 py-2 transition-all',
                    active
                      ? 'border-accent bg-accent/12 text-accent-ink shadow-glow-soft'
                      : 'border-line bg-surface text-muted hover:text-ink',
                  )}
                >
                  <span className="text-[11px] font-bold">
                    {HEBREW_WEEKDAYS_SHORT[date.getDay()]}
                  </span>
                  <span className="num text-base font-extrabold leading-none">
                    {format(date, 'd')}
                  </span>
                  <span
                    className={cn(
                      'num text-[10px] font-semibold',
                      today && !active && 'text-accent-ink',
                    )}
                  >
                    {today ? 'היום' : count > 0 ? `${count}` : '·'}
                  </span>
                </button>
              );
            })}
          </div>

          <section aria-label="שיעורים ביום שנבחר" className="space-y-3">
            <p className="text-sm font-semibold text-muted">
              {formatHebrewFullDate(parseISO(`${selectedDay}T12:00:00`))}
            </p>
            {dayClasses.length === 0 ? (
              <EmptyState
                icon={CalendarOff}
                title="אין שיעורים ביום הזה"
                description={
                  activeFilters > 0
                    ? 'נסו לנקות את הסינון או לבחור יום אחר בשבוע.'
                    : 'בחרו יום אחר או עברו לשבוע הבא.'
                }
                action={
                  activeFilters > 0 ? (
                    <Button variant="secondary" size="sm" onClick={resetFilters}>
                      ניקוי סינון
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              dayClasses.map((gymClass) => (
                <ClassCard
                  key={gymClass.id}
                  gymClass={gymClass}
                  action={
                    <BookingButton
                      classId={gymClass.id}
                      availability={availabilityForClass(gymClass)}
                      waitlistPosition={gymClass.my_booking?.waitlist_position}
                      size="sm"
                    />
                  }
                />
              ))
            )}
          </section>
        </div>
      </div>

      <div
        className={cn(
          view === 'week' && 'block',
          view === 'day' && 'hidden',
          view === 'auto' && 'hidden lg:block',
        )}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {weekDays.map((day) => {
            const date = parseISO(`${day}T12:00:00`);
            const items = byDay.get(day) ?? [];
            return (
              <section key={day} className="surface p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-sm font-bold">
                    יום {HEBREW_WEEKDAYS_SHORT[date.getDay()]}
                    <span className="num ms-1.5 text-muted">{format(date, 'd.M')}</span>
                  </h2>
                  {isToday(date) && <Badge tone="accent">היום</Badge>}
                </div>
                {items.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted">אין שיעורים</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((gymClass) => (
                      <li
                        key={gymClass.id}
                        className={cn(
                          'rounded-md border transition-colors focus-within:border-accent/40 hover:border-accent/40',
                          gymClass.my_booking ? 'border-accent/45 bg-accent/5' : 'border-line bg-raised',
                        )}
                      >
                        <Link href={`/classes/${gymClass.id}`} className="block px-2.5 pb-1.5 pt-2">
                          <span className="num block text-xs font-bold text-accent-ink">
                            {new Date(gymClass.starts_at).toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Asia/Jerusalem',
                            })}
                          </span>
                          <span className="block truncate text-sm font-semibold">{gymClass.title}</span>
                          <span className="block truncate text-[11px] text-muted">
                            {CATEGORY_LABELS[gymClass.category]} ·{' '}
                            <span className="num">
                              {gymClass.confirmed_count}/{gymClass.capacity}
                            </span>{' '}
                            תפוסים
                          </span>
                          {gymClass.workout_teaser && (
                            <span
                              data-workout={gymClass.my_booking ? 'open' : 'locked'}
                              title={
                                gymClass.my_booking
                                  ? 'האימון פתוח לצפייה'
                                  : 'האימון נחשף אחרי ההרשמה'
                              }
                              className={cn(
                                'mt-0.5 flex items-center gap-1 text-[11px]',
                                gymClass.my_booking ? 'text-accent-ink' : 'text-muted',
                              )}
                            >
                              {gymClass.my_booking ? (
                                <LockOpen className="size-3" aria-hidden />
                              ) : (
                                <Lock className="size-3" aria-hidden />
                              )}
                              {WORKOUT_FORMAT_LABELS[gymClass.workout_teaser.format]}
                            </span>
                          )}
                        </Link>
                        {/* The week grid is the default on a wide screen, so it has
                            to be bookable in place and not only a way in to the
                            class page. */}
                        <div className="px-2.5 pb-2">
                          <BookingButton
                            classId={gymClass.id}
                            availability={availabilityForClass(gymClass)}
                            waitlistPosition={gymClass.my_booking?.waitlist_position}
                            size="sm"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
