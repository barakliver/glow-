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
    return NextResponse.redirect(new URL('/auth/sign-in?error=missing_code', APP_URL));
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
