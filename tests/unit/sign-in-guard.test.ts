import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Google and the email link are both first-class ways in. What matters is that
 * neither skips the checks the other goes through, and that the email path is
 * still available when a real Supabase is configured - a private club whose
 * only door depends on an external provider has no door on the day that
 * provider is misconfigured.
 */
async function loadAuthActions(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import('@/app/actions/auth');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('email sign-in', () => {
  it('is still offered once the club has a real Supabase behind it', async () => {
    const actions = await loadAuthActions({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_test',
    });

    const form = new FormData();
    form.set('email', 'not-an-email');
    const result = await actions.signInWithEmailAction(form);

    // Reaching validation is the point: the path was not shut off.
    expect(result.ok).toBe(false);
    expect(result.message).not.toContain('Google');
  });

  it('rejects an address that is not an address', async () => {
    const actions = await loadAuthActions({ DEMO_MODE: 'true' });

    const form = new FormData();
    form.set('email', 'nope');
    const result = await actions.signInWithEmailAction(form);

    expect(result.ok).toBe(false);
    expect(result.message).toBeTruthy();
  });
});
