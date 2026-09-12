import { afterEach, describe, expect, it, vi } from 'vitest';

/** env.ts reads the environment once at import, so each case needs a fresh one. */
async function loadEnv(values: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) vi.stubEnv(key, '');
    else vi.stubEnv(key, value);
  }
  return import('@/lib/env');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('APP_URL', () => {
  it('uses the address it was given', async () => {
    const env = await loadEnv({ APP_URL: 'https://glow.example.com' });
    expect(env.APP_URL).toBe('https://glow.example.com');
  });

  it('drops a trailing slash so joined paths never double up', async () => {
    const env = await loadEnv({ APP_URL: 'https://glow.example.com/' });
    expect(env.APP_URL).toBe('https://glow.example.com');
  });

  it('ignores a loopback address when the platform knows the real host', async () => {
    // Importing a project on Vercel copies APP_URL=http://localhost:3000 out of
    // the example file. Honouring it would mail members a sign-in link pointing
    // at their own machine.
    const env = await loadEnv({
      APP_URL: 'http://localhost:3000',
      VERCEL_PROJECT_PRODUCTION_URL: 'glow-six-kohl.vercel.app',
    });
    expect(env.APP_URL).toBe('https://glow-six-kohl.vercel.app');
  });

  it('keeps a loopback address when there is no platform host to prefer', async () => {
    const env = await loadEnv({ APP_URL: 'http://127.0.0.1:3000' });
    expect(env.APP_URL).toBe('http://127.0.0.1:3000');
  });

  it('falls back to the platform host when nothing was configured', async () => {
    const env = await loadEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'glow-six-kohl.vercel.app' });
    expect(env.APP_URL).toBe('https://glow-six-kohl.vercel.app');
  });
});

describe('demo mode', () => {
  it('is on while Supabase credentials are missing', async () => {
    const env = await loadEnv({});
    expect(env.isDemoMode()).toBe(true);
  });

  it('turns itself off once both Supabase values are present', async () => {
    const env = await loadEnv({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_test',
    });
    expect(env.isDemoMode()).toBe(false);
  });

  it('is not tripped by the empty values an import leaves behind', async () => {
    // Vercel creates every name from the example file, so a blank
    // NEXT_PUBLIC_DEMO_MODE sits there on a real deployment.
    const env = await loadEnv({
      NEXT_PUBLIC_DEMO_MODE: '',
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_test',
    });
    expect(env.isDemoMode()).toBe(false);
  });

  it('can still be forced on over working credentials', async () => {
    const env = await loadEnv({
      DEMO_MODE: 'true',
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_test',
    });
    expect(env.isDemoMode()).toBe(true);
  });
});
