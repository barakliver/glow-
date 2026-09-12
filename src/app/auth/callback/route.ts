import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { APP_URL } from '@/lib/env';

/** Exchanges the magic-link / OAuth code for a session, then returns the member
 *  to wherever they were heading before signing in. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawReturnTo = searchParams.get('returnTo');
  // Only same-origin relative paths are honoured.
  const returnTo = rawReturnTo?.startsWith('/') ? rawReturnTo : '/';

  if (!code) {
    // Pass on whatever the provider did send, so the screen can name the real
    // problem instead of guessing. Anything in the URL fragment is invisible
    // here and gets read in the browser instead.
    const providerError = searchParams.get('error');
    const target = new URL('/auth/sign-in', APP_URL);
    target.searchParams.set('error', providerError ?? 'missing_code');
    const description = searchParams.get('error_description');
    if (description) target.searchParams.set('error_description', description);
    return NextResponse.redirect(target);
  }

  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(new URL('/auth/sign-in', APP_URL));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=exchange_failed', APP_URL));
  }

  const { data } = await supabase.auth.getUser();
  const needsOnboarding = !data.user?.user_metadata?.phone;
  const target = needsOnboarding ? '/auth/onboarding' : returnTo;
  return NextResponse.redirect(new URL(target, APP_URL));
}
