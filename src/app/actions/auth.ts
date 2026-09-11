'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { DEMO_SESSION_COOKIE, getCurrentUser, getRepository } from '@/lib/auth';
import { isDemoMode, APP_URL } from '@/lib/env';
import { createServerSupabase } from '@/lib/supabase/server';
import { onboardingSchema, signInSchema } from '@/lib/validation';
import { allowRate } from '@/lib/data/store';
import type { ActionResult } from '@/app/actions/booking';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/** Passwordless email sign-in. In demo mode it creates/uses a local profile. */
export async function signInWithEmailAction(formData: FormData): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    returnTo: formData.get('returnTo') ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'כתובת האימייל אינה תקינה' };
  }
  const { email, returnTo } = parsed.data;

  if (!allowRate(`signin:${email.toLowerCase()}`, 5, 60_000)) {
    return { ok: false, message: 'נשלחו יותר מדי בקשות. נסו שוב בעוד דקה.' };
  }

  if (isDemoMode()) {
    const repository = await getRepository();
    const profile = await repository.ensureProfile({
      email,
      full_name: email.split('@')[0],
    });
    const store = await cookies();
    store.set(DEMO_SESSION_COOKIE, profile.id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return {
      ok: true,
      message: 'התחברת במצב הדגמה.',
      data: undefined,
    };
  }

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, message: 'שירות ההתחברות אינו זמין כרגע.' };

  const callback = new URL('/auth/callback', APP_URL);
  if (returnTo) callback.searchParams.set('returnTo', returnTo);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback.toString() },
  });
  if (error) return { ok: false, message: 'שליחת הקישור נכשלה. נסו שוב בעוד רגע.' };

  return { ok: true, message: 'שלחנו קישור כניסה לאימייל שלכם.' };
}

/** Demo-only: sign in directly as one of the seeded accounts. */
export async function signInAsDemoAccountAction(profileId: string): Promise<ActionResult> {
  if (!isDemoMode()) return { ok: false, message: 'זמין רק במצב הדגמה.' };
  const repository = await getRepository();
  const user = await repository.getSessionUser(profileId);
  if (!user) return { ok: false, message: 'המשתמש לא נמצא.' };

  const store = await cookies();
  store.set(DEMO_SESSION_COOKIE, profileId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  revalidatePath('/', 'layout');
  return { ok: true, message: `התחברת בתור ${user.profile.full_name}.` };
}

export async function signInWithGoogleAction(returnTo?: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, message: 'התחברות עם Google אינה מוגדרת.' };

  const callback = new URL('/auth/callback', APP_URL);
  if (returnTo) callback.searchParams.set('returnTo', returnTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callback.toString() },
  });
  if (error || !data.url) return { ok: false, message: 'התחברות עם Google נכשלה.' };
  return { ok: true, message: '', data: { url: data.url } };
}

export async function signOutAction(): Promise<void> {
  if (isDemoMode()) {
    const store = await cookies();
    store.delete(DEMO_SESSION_COOKIE);
  } else {
    const supabase = await createServerSupabase();
    await supabase?.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/auth/sign-in');
}

export async function completeOnboardingAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: 'צריך להתחבר כדי להמשיך.' };

  const parsed = onboardingSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    experience_level: formData.get('experience_level'),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'הפרטים אינם תקינים' };
  }

  const repository = await getRepository();
  await repository.updateProfile(user.profile.id, {
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    experience_level: parsed.data.experience_level,
    onboarding_completed: true,
  });
  revalidatePath('/', 'layout');
  return { ok: true, message: 'הפרטים נשמרו.' };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  return completeOnboardingAction(formData);
}
