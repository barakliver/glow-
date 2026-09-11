import 'server-only';

/**
 * Environment access.
 *
 * Every value here is read on the server only. Nothing Supabase-related is
 * inlined into the browser bundle, because the app talks to Supabase purely
 * through server components, server actions and route handlers.
 *
 * That is why the variable names carry no `NEXT_PUBLIC_` prefix: such variables
 * are baked in at build time and exposed to the browser, which on Vercel also
 * forces them to be plain "Config" variables rather than secrets. Reading them
 * at runtime instead keeps deployment simple and the values private.
 *
 * The `NEXT_PUBLIC_` names are still honoured so existing deployments that
 * already set them keep working.
 */

function read(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim() !== '') return value.trim();
  }
  return '';
}

export const APP_URL =
  read('APP_URL', 'NEXT_PUBLIC_APP_URL').replace(/\/$/, '') ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');

export const SUPABASE_URL = read('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');

export const SUPABASE_ANON_KEY = read(
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
);

export const GOOGLE_AUTH_ENABLED =
  read('ENABLE_GOOGLE_AUTH', 'NEXT_PUBLIC_ENABLE_GOOGLE_AUTH') === 'true';

/**
 * Demo mode is on when explicitly forced, or whenever Supabase credentials are
 * missing. It keeps every flow working without any external service.
 */
export function isDemoMode(): boolean {
  const forced = read('DEMO_MODE', 'NEXT_PUBLIC_DEMO_MODE');
  if (forced === 'true') return true;
  if (forced === 'false') return false;
  return !SUPABASE_URL || !SUPABASE_ANON_KEY;
}
