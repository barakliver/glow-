import { NextResponse } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isDemoMode } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Says whether this deployment's database has caught up with its code.
 *
 * The app ships its schema as migrations that an owner runs by hand, so the
 * two drift apart every time a feature lands and supabase/setup.sql is not
 * re-run. What that looks like from the outside is a page that throws: the
 * code selects a column the table has not got yet. "Something went wrong" is
 * a terrible way to say "run the SQL", so this endpoint says it properly.
 *
 * Deliberately public and deliberately data-free. Every probe asks for zero
 * rows: the answer is whether the name resolves, never what is in it. The
 * table names it reports are in the public repository already.
 */

/** What the code expects, in the order the migrations add it. */
const EXPECTED: { table: string; columns: string; migration: string }[] = [
  { table: 'organizations', columns: 'id', migration: '…000000_initial_schema' },
  { table: 'profiles', columns: 'id', migration: '…000000_initial_schema' },
  { table: 'memberships', columns: 'id', migration: '…000000_initial_schema' },
  { table: 'classes', columns: 'id,capacity', migration: '…000000_initial_schema' },
  { table: 'bookings', columns: 'id', migration: '…000000_initial_schema' },
  { table: 'invitations', columns: 'id', migration: '…000000_initial_schema' },
  { table: 'workouts', columns: 'id,slug', migration: '…000005_workouts' },
  { table: 'class_workouts', columns: 'id', migration: '…000005_workouts' },
  { table: 'workout_logs', columns: 'id', migration: '…000005_workouts' },
  { table: 'body_metrics', columns: 'id', migration: '…000009_personal_tracking' },
  { table: 'activity_logs', columns: 'id', migration: '…000009_personal_tracking' },
  { table: 'activity_lifts', columns: 'id', migration: '…000009_personal_tracking' },
  {
    table: 'profiles',
    columns: 'avocado_style,weekly_goal_sessions',
    migration: '…000010_avocado_style',
  },
];

type Probe = { target: string; ok: boolean; migration: string; detail?: string };

async function probe(spec: (typeof EXPECTED)[number]): Promise<Probe> {
  const target = `${spec.table}.${spec.columns.replace(/,/g, '+')}`;
  const url = `${SUPABASE_URL}/rest/v1/${spec.table}?select=${spec.columns}&limit=0`;
  try {
    const response = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      cache: 'no-store',
    });
    /* A table that exists but is closed to an anonymous reader answers with an
     * empty list or with a permission error - both mean the name resolved.
     * Only "undefined table" and "undefined column" mean the migration is
     * missing, so those are the two the verdict turns on. */
    if (response.ok) return { target, ok: true, migration: spec.migration };

    const body = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
    const missing = body.code === '42P01' || body.code === '42703' || response.status === 404;
    return {
      target,
      ok: !missing,
      migration: spec.migration,
      detail: missing ? (body.message ?? `HTTP ${response.status}`) : undefined,
    };
  } catch (error) {
    return {
      target,
      ok: false,
      migration: spec.migration,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({
      demoMode: true,
      verdict: 'Running on demo data; there is no database to check.',
    });
  }

  const results = await Promise.all(EXPECTED.map(probe));
  const missing = results.filter((row) => !row.ok);
  const behind = [...new Set(missing.map((row) => row.migration))];

  return NextResponse.json({
    demoMode: false,
    checked: results.length,
    missing: missing.map((row) => ({ target: row.target, detail: row.detail })),
    migrationsBehind: behind,
    verdict:
      missing.length === 0
        ? 'The database has everything the code expects.'
        : `The database is behind the code. Run supabase/setup.sql in the Supabase SQL editor; it is safe to re-run. Missing: ${missing.map((row) => row.target).join(', ')}.`,
  });
}
