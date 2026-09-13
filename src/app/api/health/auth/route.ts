import { NextResponse } from 'next/server';
import { APP_URL, SUPABASE_ANON_KEY, SUPABASE_URL, isDemoMode } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * Says out loud whether this deployment can actually talk to its Supabase.
 *
 * Deliberately public and deliberately secret-free: it reports what is
 * configured, never the values. Sign-in failures are the one class of problem
 * that cannot be diagnosed from inside the app - if you cannot sign in, every
 * page that could tell you why is behind the sign-in.
 */
export async function GET() {
  const checks: Record<string, unknown> = {
    demoMode: isDemoMode(),
    appUrl: APP_URL,
    supabaseUrl: SUPABASE_URL || '(missing)',
    anonKey: SUPABASE_ANON_KEY
      ? `${SUPABASE_ANON_KEY.slice(0, 14)}… (${SUPABASE_ANON_KEY.length} chars)`
      : '(missing)',
  };

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    checks.verdict = 'Supabase is not configured; the app is running on demo data.';
    return NextResponse.json(checks, { status: 200 });
  }

  // A settings read is the cheapest call that still proves the key is accepted.
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      cache: 'no-store',
    });
    checks.authStatus = response.status;
    if (response.ok) {
      const settings = (await response.json()) as {
        external?: Record<string, boolean>;
        disable_signup?: boolean;
        mailer_autoconfirm?: boolean;
      };
      checks.googleEnabled = Boolean(settings.external?.google);
      checks.emailEnabled = Boolean(settings.external?.email);
      checks.signupDisabled = Boolean(settings.disable_signup);
      checks.verdict =
        settings.external?.google || settings.external?.email
          ? 'Supabase answered and the key was accepted.'
          : 'Supabase answered, but no sign-in provider is switched on.';
    } else {
      checks.verdict = `Supabase refused the key (HTTP ${response.status}). The anon key is wrong or belongs to another project.`;
      checks.detail = (await response.text()).slice(0, 300);
    }
  } catch (error) {
    checks.verdict = 'Could not reach Supabase from the server at all.';
    checks.detail = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(checks, { status: 200 });
}
