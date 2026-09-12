import 'server-only';
import { isDemoMode } from '@/lib/env';
import { DemoRepository } from '@/lib/data/demo-repository';
import { createServerSupabase } from '@/lib/supabase/server';
import { allowRate } from '@/lib/data/store';
import { spotsLeft } from '@/lib/domain/booking-rules';

/**
 * The ONLY shape exposed to unauthenticated visitors holding an invitation
 * token. Deliberately contains no member data, no phone numbers and no ids of
 * anyone who booked.
 */
export interface PublicClass {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  trainer_name: string | null;
  location: string;
  capacity: number;
  starts_at: string;
  ends_at: string;
  spots_left: number;
}

export type InviteState =
  | { status: 'valid'; label: string; classes: PublicClass[]; organizationName: string }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'revoked' }
  | { status: 'exhausted' }
  | { status: 'rate_limited' };

/**
 * Server-side resolver for a public invitation.
 * In Supabase mode it calls the `public_schedule` security-definer function,
 * which enforces the token rules inside the database.
 */
export async function resolveInvite(
  token: string,
  fromIso: string,
  toIso: string,
  clientKey: string,
): Promise<InviteState> {
  if (!allowRate(`invite:${clientKey}`, 30, 60_000)) return { status: 'rate_limited' };
  if (!token || token.length > 80) return { status: 'invalid' };

  if (isDemoMode()) {
    const repository = new DemoRepository();
    const invite = await repository.getInviteByToken(token);
    if (!invite) return { status: 'invalid' };
    if (invite.revoked) return { status: 'revoked' };
    if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
      return { status: 'expired' };
    }
    if (invite.max_uses !== null && invite.uses >= invite.max_uses) return { status: 'exhausted' };

    const organization = await repository.getOrganization();
    const classes = await repository.listClasses({ fromIso, toIso, profileId: null });
    return {
      status: 'valid',
      label: invite.label,
      organizationName: organization.name,
      classes: classes
        .filter((c) => c.status === 'scheduled')
        .map((c) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          difficulty: c.difficulty,
          trainer_name: c.trainer_name,
          location: c.location,
          capacity: c.capacity,
          starts_at: c.starts_at,
          ends_at: c.ends_at,
          spots_left: spotsLeft(c.capacity, Array.from({ length: c.confirmed_count }, () => ({ status: 'confirmed' as const }))),
        })),
    };
  }

  // The anon key is enough here. Both calls below are security-definer
  // functions that validate the token inside the database and return a narrow
  // projection, so no service-role key is needed anywhere in the deployment.
  const supabase = await createServerSupabase();
  if (!supabase) return { status: 'invalid' };

  const { data: statusRows, error: statusError } = await supabase.rpc('public_invite_status', {
    p_token: token,
  });

  if (statusError) {
    // public_invite_status ships in a later migration than the rest of the
    // schema. If a deployment has not applied it yet, fall back to the schedule
    // function alone: the token is still validated inside the database, we just
    // cannot tell an expired link from a revoked one.
    return resolveWithoutStatusFunction(supabase, token, fromIso, toIso);
  }

  const invite = (statusRows as { status: string; label: string; organization_name: string }[] | null)?.[0];
  if (!invite || invite.status === 'invalid') return { status: 'invalid' };
  if (invite.status === 'revoked') return { status: 'revoked' };
  if (invite.status === 'expired') return { status: 'expired' };
  if (invite.status === 'exhausted') return { status: 'exhausted' };

  const { data: classes } = await supabase.rpc('public_schedule', {
    p_token: token,
    p_from: fromIso,
    p_to: toIso,
  });

  return {
    status: 'valid',
    label: invite.label,
    organizationName: invite.organization_name || 'GLoW',
    classes: ((classes ?? []) as PublicClass[]).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty,
      trainer_name: row.trainer_name,
      location: row.location,
      capacity: row.capacity,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      spots_left: row.spots_left,
    })),
  };
}

/**
 * Fallback for deployments that have not applied the public_invite_status
 * migration. public_schedule already enforces the token rules - it returns no
 * rows for a token that is unknown, revoked, expired or used up - so an
 * invitation still works; only the specific reason for a dead link is lost.
 */
async function resolveWithoutStatusFunction(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabase>>>,
  token: string,
  fromIso: string,
  toIso: string,
): Promise<InviteState> {
  const { data, error } = await supabase.rpc('public_schedule', {
    p_token: token,
    p_from: fromIso,
    p_to: toIso,
  });
  if (error) return { status: 'invalid' };

  const rows = (data ?? []) as PublicClass[];
  if (rows.length === 0) return { status: 'invalid' };

  return {
    status: 'valid',
    label: '',
    organizationName: 'GLoW',
    classes: rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      difficulty: row.difficulty,
      trainer_name: row.trainer_name,
      location: row.location,
      capacity: row.capacity,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      spots_left: row.spots_left,
    })),
  };
}
