import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser, getRepository, isStaff } from '@/lib/auth';
import { addDays, formatTime, dayKey, now } from '@/lib/time';
import { BOOKING_STATUS_LABELS, CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/lib/labels';
import { sessionVolume } from '@/lib/domain/progress';

type ExportType = 'classes' | 'bookings' | 'attendance' | 'workouts';

const TYPES: ExportType[] = ['classes', 'bookings', 'attendance', 'workouts'];

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(head: string[], rows: unknown[][]): string {
  const lines = [head, ...rows].map((row) => row.map(csvCell).join(','));
  // BOM so Excel opens Hebrew correctly.
  return `﻿${lines.join('\r\n')}`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) {
    return new NextResponse('forbidden', { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as ExportType | null;
  if (!type || !TYPES.includes(type)) {
    return new NextResponse('unknown export type', { status: 400 });
  }
  const days = Math.min(365, Math.max(1, Number.parseInt(searchParams.get('days') ?? '30', 10) || 30));

  const repository = await getRepository();
  const reference = now();
  const from = addDays(reference, -days);
  const to = addDays(reference, 60);

  const classes = await repository.listClasses({
    fromIso: from.toISOString(),
    toIso: to.toISOString(),
    profileId: null,
    includeUnpublished: true,
  });

  let csv = '';
  let filename = `glow-${type}.csv`;

  if (type === 'classes') {
    csv = toCsv(
      ['תאריך', 'שעה', 'שיעור', 'קטגוריה', 'רמה', 'מאמן', 'מיקום', 'קיבולת', 'רשומים', 'רשימת המתנה', 'סטטוס'],
      classes.map((c) => [
        dayKey(c.starts_at),
        formatTime(c.starts_at),
        c.title,
        CATEGORY_LABELS[c.category],
        DIFFICULTY_LABELS[c.difficulty],
        c.trainer_name ?? '',
        c.location,
        c.capacity,
        c.confirmed_count,
        c.waitlist_count,
        c.status === 'cancelled' ? 'בוטל' : c.published ? 'מפורסם' : 'טיוטה',
      ]),
    );
  }

  if (type === 'bookings' || type === 'attendance') {
    const rows: unknown[][] = [];
    for (const gymClass of classes) {
      const bookings = await repository.listClassBookings(gymClass.id);
      for (const row of bookings) {
        if (type === 'attendance' && !['attended', 'absent'].includes(row.booking.status)) continue;
        rows.push([
          dayKey(gymClass.starts_at),
          formatTime(gymClass.starts_at),
          gymClass.title,
          row.profile.full_name,
          BOOKING_STATUS_LABELS[row.booking.status],
          row.booking.waitlist_position ?? '',
          row.booking.booked_at,
        ]);
      }
    }
    csv = toCsv(
      ['תאריך', 'שעה', 'שיעור', 'מתאמן', 'סטטוס', 'מקום בהמתנה', 'מועד רישום'],
      rows,
    );
  }

  if (type === 'workouts') {
    const members = await repository.listMembers();
    const rows: unknown[][] = [];
    for (const member of members) {
      const sessions = await repository.listSessions(member.profile.id, 200);
      const sets = await repository.listSets(member.profile.id);
      for (const session of sessions) {
        if (session.status !== 'completed') continue;
        if (new Date(session.started_at).getTime() < from.getTime()) continue;
        const sessionSets = sets.filter((s) => s.session_id === session.id);
        rows.push([
          dayKey(session.started_at),
          member.profile.full_name,
          session.title,
          session.goal,
          Math.round((session.total_seconds ?? 0) / 60),
          sessionSets.length,
          Math.round(sessionVolume(sessionSets)),
          session.average_effort ?? '',
        ]);
      }
    }
    csv = toCsv(
      ['תאריך', 'מתאמן', 'אימון', 'מטרה', 'דקות', 'סטים', 'נפח (ק"ג)', 'מאמץ ממוצע'],
      rows,
    );
    filename = 'glow-workout-summaries.csv';
  }

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
