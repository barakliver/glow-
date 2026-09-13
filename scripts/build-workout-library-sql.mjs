/**
 * Generates supabase/migrations/20260101000006_workout_library_content.sql from
 * the TypeScript library in src/lib/data/workouts.
 *
 * The library is authored once, in TypeScript, because that is where a coach or
 * a reviewer can actually read it. This script is what puts the same rows into
 * PostgreSQL, so the demo adapter and the real database can never disagree
 * about what "Fran" is.
 *
 * Re-run with: npm run build:workout-sql
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Vite resolves the "@/..." alias and strips the types; nothing else here does
// both, and hand-maintaining a second copy of the library in JavaScript would
// defeat the point.
const server = await createServer({
  configFile: false,
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true, hmr: false, watch: null },
  resolve: { alias: { '@': join(root, 'src') } },
});

let library;
let toWorkout;
let workoutLibraryId;
try {
  const module = await server.ssrLoadModule('/src/lib/data/workouts/index.ts');
  ({ WORKOUT_LIBRARY: library, toWorkout, workoutLibraryId } = module);
} finally {
  await server.close();
}

/** Single-quoted SQL literal. */
const text = (value) => `'${String(value).replace(/'/g, "''")}'`;
const nullable = (value) => (value === null || value === undefined ? 'null' : text(value));
const jsonb = (value) => `${text(JSON.stringify(value))}::jsonb`;
const textArray = (values) =>
  values.length === 0 ? `'{}'::text[]` : `array[${values.map(text).join(', ')}]::text[]`;

const rows = library.map((entry) => {
  const workout = toWorkout(entry, {
    id: workoutLibraryId(entry.slug),
    organizationId: '00000000-0000-0000-0000-000000000000',
    timestamp: '1970-01-01T00:00:00.000Z',
  });
  return `  (
    ${text(workout.id)}::uuid, ${text(workout.slug)}, ${text(workout.title)},
    ${nullable(workout.subtitle)}, ${text(workout.category)}::public.workout_category,
    ${text(workout.format)}::public.workout_format,
    ${text(workout.difficulty)}::public.difficulty_level,
    ${workout.duration_minutes}, ${workout.time_cap_minutes ?? 'null'},
    ${textArray(workout.equipment)}, ${text(workout.description)},
    ${jsonb(workout.warmup)}, ${jsonb(workout.structure)},
    ${jsonb(workout.cooldown)}, ${jsonb(workout.scaling)},
    ${text(workout.score_type)}::public.score_type, ${nullable(workout.score_label)}
  )`;
});

const counts = library.reduce((totals, entry) => {
  totals[entry.category] = (totals[entry.category] ?? 0) + 1;
  return totals;
}, {});

const slugs = new Set(library.map((entry) => entry.slug));
if (slugs.size !== library.length) {
  throw new Error('duplicate slug in the workout library');
}
const ids = new Set(library.map((entry) => workoutLibraryId(entry.slug)));
if (ids.size !== library.length) {
  throw new Error('two workouts hashed to the same id - rename one slug');
}

const sql = `-- =============================================================================
-- GLoW - workout library content
--
-- GENERATED FILE - do not edit by hand.
-- Source: src/lib/data/workouts/*.ts
-- Rebuild with: npm run build:workout-sql
--
-- ${library.length} workouts: ${Object.entries(counts)
  .map(([category, count]) => `${count} ${category}`)
  .join(', ')}.
--
-- The library is installed per club rather than inline, because this migration
-- runs before any organization exists: on a fresh database the schema is
-- created first and the club is created by the seed that follows. The trigger
-- below installs the library whenever a club is created, and the call at the
-- end covers a database that already had one.
--
-- Ids are derived from the workout slug so the in-memory demo adapter and
-- PostgreSQL agree on what "fran" is. That derivation has room for exactly one
-- club, which is what GLoW is; hosting a second one means moving to per-club
-- ids, and this comment is the place to start.
-- =============================================================================

create or replace function public.install_workout_library()
returns integer
language plpgsql
security definer
set search_path = public
as $install$
declare
  v_org uuid;
  v_count integer;
begin
  select id into v_org from public.organizations order by created_at limit 1;
  if v_org is null then
    return 0;
  end if;

  insert into public.workouts (
    id, organization_id, slug, title, subtitle, category, format, difficulty,
    duration_minutes, time_cap_minutes, equipment, description,
    warmup, structure, cooldown, scaling, score_type, score_label
  )
  select
    v.id, v_org, v.slug, v.title, v.subtitle, v.category, v.format, v.difficulty,
    v.duration_minutes, v.time_cap_minutes, v.equipment, v.description,
    v.warmup, v.structure, v.cooldown, v.scaling, v.score_type, v.score_label
  from (values
${rows.join(',\n')}
  ) as v (
    id, slug, title, subtitle, category, format, difficulty,
    duration_minutes, time_cap_minutes, equipment, description,
    warmup, structure, cooldown, scaling, score_type, score_label
  )
  on conflict (id) do update set
    slug = excluded.slug,
    title = excluded.title,
    subtitle = excluded.subtitle,
    category = excluded.category,
    format = excluded.format,
    difficulty = excluded.difficulty,
    duration_minutes = excluded.duration_minutes,
    time_cap_minutes = excluded.time_cap_minutes,
    equipment = excluded.equipment,
    description = excluded.description,
    warmup = excluded.warmup,
    structure = excluded.structure,
    cooldown = excluded.cooldown,
    scaling = excluded.scaling,
    score_type = excluded.score_type,
    score_label = excluded.score_label;

  get diagnostics v_count = row_count;
  return v_count;
end;
$install$;

revoke all on function public.install_workout_library() from public;

create or replace function public.install_workout_library_on_org()
returns trigger
language plpgsql
security definer
set search_path = public
as $trigger$
begin
  perform public.install_workout_library();
  return new;
end;
$trigger$;

drop trigger if exists organizations_install_workouts on public.organizations;
create trigger organizations_install_workouts
  after insert on public.organizations
  for each row execute function public.install_workout_library_on_org();

-- Covers a database that already had a club before this migration ran.
select public.install_workout_library();
`;

const target = join(root, 'supabase/migrations/20260101000006_workout_library_content.sql');
writeFileSync(target, sql);
console.log(`workout library written (${library.length} workouts, ${sql.split('\n').length} lines)`);
