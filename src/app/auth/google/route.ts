import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { APP_URL } from '@/lib/env';

/**
 * Starts the Google sign-in.
 *
 * This has to be a route handler rather than a server action. The PKCE flow
 * stores a code verifier in a cookie when the authorize URL is built, and the
 * callback needs that exact cookie to exchange the code afterwards. Building
 * the URL inside a server action and then navigating with window.location left
 * the verifier behind, which is what failed every exchange; issuing the
 * redirect from here puts the Set-Cookie on the very response that performs it,
 * so the verifier and the redirect cannot come apart.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=provider_unavailable', APP_URL));
  }

  const rawReturnTo = new URL(request.url).searchParams.get('returnTo');
  const callback = new URL('/auth/callback', APP_URL);
  // Only same-origin relative paths travel through the round trip.
  if (rawReturnTo?.startsWith('/')) callback.searchParams.set('returnTo', rawReturnTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) {
    const target = new URL('/auth/sign-in', APP_URL);
    target.searchParams.set('error', 'google_start_failed');
    if (error?.message) target.searchParams.set('error_description', error.message);
    return NextResponse.redirect(target);
  }

  return NextResponse.redirect(data.url);
}
