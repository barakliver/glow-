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

function isLoopback(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(url);
}

/**
 * Public URL of this deployment. Sign-in links, invitations, ICS files and the
 * check-in QR codes are all built from it.
 *
 * A loopback address is never right for a hosted deployment, and it arrives by
 * accident: importing a project on Vercel copies the names and values out of
 * the repository's example file, `APP_URL=http://localhost:3000` among them.
 * Left alone it would mail members a sign-in link pointing at their own
 * machine. Where the platform tells us the real host, that wins.
 */
function resolveAppUrl(): string {
  const configured = read('APP_URL', 'NEXT_PUBLIC_APP_URL').replace(/\/$/, '');
  const platform = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '';
  if (configured && !(platform && isLoopback(configured))) return configured;
  return platform || 'http://localhost:3000';
}

export const APP_URL = resolveAppUrl();

export const SUPABASE_URL = read('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');

export const SUPABASE_ANON_KEY = read(
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
);

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
