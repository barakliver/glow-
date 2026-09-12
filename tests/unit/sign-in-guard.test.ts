import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * The club signs in with Google and nothing else. A server action is reachable
 * directly, so the email path has to refuse on its own rather than relying on
 * the sign-in screen not offering it.
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
  it('is refused once the club has a real Supabase behind it', async () => {
    const actions = await loadAuthActions({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_test',
    });

    const form = new FormData();
    form.set('email', 'stranger@example.com');
    const result = await actions.signInWithEmailAction(form);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('Google');
  });

  it('still works in demo mode, which has no provider to sign in with', async () => {
    const actions = await loadAuthActions({ DEMO_MODE: 'true' });

    const form = new FormData();
    form.set('email', 'not-an-email');
    const result = await actions.signInWithEmailAction(form);

    // Reaching validation is the point: the demo path was not shut off.
    expect(result.ok).toBe(false);
    expect(result.message).not.toContain('Google');
  });
});
