'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
} from '@/lib/labels';
import { HEBREW_WEEKDAYS_LONG } from '@/lib/time';
import { cn } from '@/lib/utils';
import type { Difficulty, TrainingCategory } from '@/lib/domain/types';

export interface ClassFormValues {
  title: string;
  description: string;
  category: TrainingCategory;
  difficulty: Difficulty;
  trainer_id: string;
  location: string;
  capacity: string;
  date: string;
  time: string;
  duration_minutes: string;
  equipment: string[];
  published: boolean;
  // recurring only
  weekdays: number[];
  start_date: string;
  end_date: string;
}

export function ClassForm({
  values,
  onChange,
  trainers,
  errors,
  recurring = false,
}: {
  values: ClassFormValues;
  onChange: (patch: Partial<ClassFormValues>) => void;
  trainers: { id: string; name: string }[];
  errors: Record<string, string>;
  recurring?: boolean;
}) {
  const [equipmentOpen, setEquipmentOpen] = useState(false);

  const toggleEquipment = (value: string) => {
    onChange({
      equipment: values.equipment.includes(value)
        ? values.equipment.filter((item) => item !== value)
        : [...values.equipment, value],
    });
  };

  const toggleWeekday = (day: number) => {
    onChange({
      weekdays: values.weekdays.includes(day)
        ? values.weekdays.filter((d) => d !== day)
        : [...values.weekdays, day].sort(),
    });
  };

  return (
    <div className="space-y-4">
      <Field label="שם השיעור" error={errors.title} htmlFor="class-title">
        <Input
          id="class-title"
          value={values.title}
          maxLength={60}
          onChange={(event) => onChange({ title: event.target.value })}
          aria-invalid={Boolean(errors.title)}
        />
      </Field>

      <Field label="תיאור" error={errors.description} htmlFor="class-description">
        <Textarea
          id="class-description"
          value={values.description}
          maxLength={600}
          placeholder="מה עושים בשיעור, למי הוא מתאים ומה חשוב לדעת"
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="סוג אימון" htmlFor="class-category">
          <Select
            value={values.category}
            onValueChange={(value) => onChange({ category: value as TrainingCategory })}
          >
            <SelectTrigger id="class-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="רמה" htmlFor="class-difficulty">
          <Select
            value={values.difficulty}
            onValueChange={(value) => onChange({ difficulty: value as Difficulty })}
          >
            <SelectTrigger id="class-difficulty">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="מאמן" htmlFor="class-trainer">
        <Select
          value={values.trainer_id || 'none'}
          onValueChange={(value) => onChange({ trainer_id: value === 'none' ? '' : value })}
        >
          <SelectTrigger id="class-trainer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">ללא שיבוץ</SelectItem>
            {trainers.map((trainer) => (
              <SelectItem key={trainer.id} value={trainer.id}>
                {trainer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="מיקום" error={errors.location} htmlFor="class-location">
          <Input
            id="class-location"
            value={values.location}
            onChange={(event) => onChange({ location: event.target.value })}
          />
        </Field>
        <Field label="מספר מקומות" error={errors.capacity} htmlFor="class-capacity">
          <Input
            id="class-capacity"
            type="number"
            min="1"
            max="100"
            dir="ltr"
            className="num"
            value={values.capacity}
            onChange={(event) => onChange({ capacity: event.target.value })}
          />
        </Field>
      </div>

      {recurring ? (
        <>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">ימים בשבוע</legend>
            <div className="grid grid-cols-7 gap-1">
              {HEBREW_WEEKDAYS_LONG.map((name, day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={values.weekdays.includes(day)}
                  aria-label={`יום ${name}`}
                  onClick={() => toggleWeekday(day)}
                  className={cn(
                    'h-11 rounded-md border text-xs font-semibold transition-all',
                    values.weekdays.includes(day)
                      ? 'border-accent bg-accent/12 text-accent-ink'
                      : 'border-line bg-raised text-muted',
                  )}
                >
                  {name.charAt(0)}
                </button>
              ))}
            </div>
            {errors.weekdays && (
              <p role="alert" className="mt-1 text-xs font-medium text-danger">
                {errors.weekdays}
              </p>
            )}
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <Field label="מתאריך" error={errors.start_date} htmlFor="series-start">
              <Input
                id="series-start"
                type="date"
                dir="ltr"
                className="num"
                value={values.start_date}
                onChange={(event) => onChange({ start_date: event.target.value })}
              />
            </Field>
            <Field label="עד תאריך" error={errors.end_date} htmlFor="series-end">
              <Input
                id="series-end"
                type="date"
                dir="ltr"
                className="num"
                value={values.end_date}
                onChange={(event) => onChange({ end_date: event.target.value })}
              />
            </Field>
          </div>
        </>
      ) : (
        <Field label="תאריך" error={errors.date} htmlFor="class-date">
          <Input
            id="class-date"
            type="date"
            dir="ltr"
            className="num"
            value={values.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="שעת התחלה" error={errors.time} htmlFor="class-time">
          <Input
            id="class-time"
            type="time"
            dir="ltr"
            className="num"
            value={values.time}
            onChange={(event) => onChange({ time: event.target.value })}
          />
        </Field>
        <Field label="משך (דקות)" error={errors.duration_minutes} htmlFor="class-duration">
          <Input
            id="class-duration"
            type="number"
            min="10"
            max="240"
            step="5"
            dir="ltr"
            className="num"
            value={values.duration_minutes}
            onChange={(event) => onChange({ duration_minutes: event.target.value })}
          />
        </Field>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setEquipmentOpen((open) => !open)}
          aria-expanded={equipmentOpen}
          className="flex w-full items-center justify-between rounded-md border border-line bg-raised px-3 py-2.5 text-sm font-medium"
        >
          <span>ציוד נדרש</span>
          <span className="num text-xs text-muted">{values.equipment.length} נבחרו</span>
        </button>
        {equipmentOpen && (
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {EQUIPMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={values.equipment.includes(option.value)}
                onClick={() => toggleEquipment(option.value)}
                className={cn(
                  'rounded-md border px-2 py-2 text-xs font-medium transition-all',
                  values.equipment.includes(option.value)
                    ? 'border-accent bg-accent/12 text-accent-ink'
                    : 'border-line bg-raised text-muted',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-raised p-3">
        <div>
          <p className="text-sm font-medium">פרסום למתאמנים</p>
          <p className="text-xs text-muted">שיעור שאינו מפורסם נשמר כטיוטה ואינו נראה לאיש.</p>
        </div>
        <Switch
          checked={values.published}
          onCheckedChange={(checked) => onChange({ published: checked })}
          aria-label="פרסום למתאמנים"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
