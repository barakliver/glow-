/**
 * In-memory demo database.
 *
 * Kept on `globalThis` so it survives Next.js hot reloads and is shared across
 * server actions inside one server process. This is the DEMO backend only -
 * production runs against Supabase (see supabase-repository.ts).
 */
import { buildSeed, type SeedData } from '@/lib/data/seed';

export interface DemoDatabase extends SeedData {
  /** profileId -> notification preferences */
  preferences: Record<string, Record<string, boolean>>;
  /** Rate limiter buckets: key -> timestamps (ms) */
  rateLimits: Record<string, number[]>;
  seededAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __glowDemoDb: DemoDatabase | undefined;
}

function createDatabase(): DemoDatabase {
  return {
    ...buildSeed(new Date()),
    preferences: {},
    rateLimits: {},
    seededAt: Date.now(),
  };
}

export function db(): DemoDatabase {
  if (!globalThis.__glowDemoDb) {
    globalThis.__glowDemoDb = createDatabase();
  }
  return globalThis.__glowDemoDb;
}

/** Test/preview helper - rebuilds the seed from scratch. */
export function resetDemoDatabase(): DemoDatabase {
  globalThis.__glowDemoDb = createDatabase();
  return globalThis.__glowDemoDb;
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Fixed-window rate limiter shared by the invitation and booking endpoints.
 * Returns true when the call is allowed.
 */
export function allowRate(key: string, limit: number, windowMs: number): boolean {
  const database = db();
  const now = Date.now();
  const bucket = (database.rateLimits[key] ?? []).filter((t) => now - t < windowMs);
  if (bucket.length >= limit) {
    database.rateLimits[key] = bucket;
    return false;
  }
  bucket.push(now);
  database.rateLimits[key] = bucket;
  return true;
}
