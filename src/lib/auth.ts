import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { isDemoMode } from '@/lib/env';
import { DemoRepository } from '@/lib/data/demo-repository';
import { SupabaseRepository } from '@/lib/data/supabase-repository';
import { createServerSupabase } from '@/lib/supabase/server';
import type { Repository } from '@/lib/data/repository';
import type { AccessState, SessionUser } from '@/lib/domain/types';

export const DEMO_SESSION_COOKIE = 'glow_demo_profile';
export const RETURN_TO_COOKIE = 'glow_return_to';

/** Repository bound to the current request and its credentials. */
export const getRepository = cache(async (): Promise<Repository> => {
  if (isDemoMode()) return new DemoRepository();
  const supabase = await createServerSupabase();
  if (!supabase) return new DemoRepository();
  const orgId = await SupabaseRepository.resolveOrganizationId(supabase);
  return new SupabaseRepository(supabase, orgId);
});

/** Profile id of the signed-in user, or null. */
export const getCurrentProfileId = cache(async (): Promise<string | null> => {
  if (isDemoMode()) {
    const store = await cookies();
    return store.get(DEMO_SESSION_COOKIE)?.value ?? null;
  }
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
});

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const profileId = await getCurrentProfileId();
  if (!profileId) return null;
  const repository = await getRepository();
  return repository.getSessionUser(profileId);
});

/** Why the signed-in person can or cannot use the app. */
export const getAccessState = cache(async (): Promise<AccessState> => {
  const profileId = await getCurrentProfileId();
  if (!profileId) return 'none';
  const repository = await getRepository();
  return repository.getAccessState(profileId);
});

/** Redirects to sign-in, preserving where the member wanted to go. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    // Someone signed in but held at the door must be told so. Sending them back
    // to sign-in would only loop them through a form they already completed.
    const state = await getAccessState();
    if (state === 'pending' || state === 'suspended') redirect('/auth/waiting');
    const target = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
    redirect(`/auth/sign-in${target}`);
  }
  if (!user.profile.onboarding_completed) redirect('/auth/onboarding');
  return user;
}

export async function requireStaff(): Promise<SessionUser> {
  const user = await requireUser('/admin');
  if (user.membership.role === 'member') redirect('/');
  return user;
}

export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser('/admin');
  if (user.membership.role !== 'owner') redirect('/');
  return user;
}

export function isStaff(user: SessionUser | null): boolean {
  return user?.membership.role === 'owner' || user?.membership.role === 'trainer';
}

export function isOwner(user: SessionUser | null): boolean {
  return user?.membership.role === 'owner';
}
