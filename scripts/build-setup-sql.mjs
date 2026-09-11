/**
 * Generates supabase/setup.sql - one file the owner can paste into the Supabase
 * SQL editor in a single step.
 *
 * It is generated rather than hand-maintained so it can never drift from the
 * migrations. Re-run with: node scripts/build-setup-sql.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const parts = [
  'migrations/20260101000000_initial_schema.sql',
  'migrations/20260101000001_functions.sql',
  'migrations/20260101000002_rls.sql',
  'starter-content.sql',
];

const banner = `-- =============================================================================
-- GLoW - complete database setup
--
-- GENERATED FILE - do not edit by hand.
-- Rebuild with: node scripts/build-setup-sql.mjs
--
-- Paste the whole file into the Supabase SQL editor and run it once. It
-- creates the schema, the booking functions, every Row Level Security policy,
-- and the starter content (exercise library, workout templates, timer presets).
--
-- Safe to run on a fresh project. Running it twice will fail on the enum
-- definitions, which is intentional: re-running a schema migration is a
-- mistake, not a routine operation.
-- =============================================================================

`;

const body = parts
  .map((part) => {
    const sql = readFileSync(join(root, 'supabase', part), 'utf8');
    return `-- >>> ${part} <<<\n\n${sql.trim()}\n`;
  })
  .join('\n\n');

writeFileSync(join(root, 'supabase/setup.sql'), banner + body);
console.log(`setup.sql written (${(banner + body).split('\n').length} lines)`);
