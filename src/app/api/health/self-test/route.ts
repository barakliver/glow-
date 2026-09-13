import { NextResponse } from 'next/server';
import { getCurrentUser, getCurrentProfileId, getRepository, isStaff } from '@/lib/auth';
import { buildRecommendations, buildScore } from '@/lib/data/insights';
import { addDays, dayKey, now } from '@/lib/time';

export const dynamic = 'force-dynamic';

/**
 * Runs the home page's data path one call at a time and reports what broke.
 *
 * A server component that throws reaches the member as "something went wrong"
 * and reaches the developer as a digest - a hash that is only a handle on a
 * server log, which is no use to whoever is holding the phone. This walks the
 * same calls the page makes, catches each one on its own, and names the one
 * that failed.
 *
 * The message is only spelled out for staff. Anyone else is told which step
 * failed and nothing more: the step names are in the public repository, the
 * database's own words are not.
 */

type Step = { step: string; ok: boolean; detail?: string; note?: string };

async function run(step: string, work: () => Promise<unknown>): Promise<Step> {
  try {
    const value = await work();
    return {
      step,
      ok: true,
      note: Array.isArray(value) ? `${value.length} rows` : value ? 'ok' : 'empty',
    };
  } catch (error) {
    return { step, ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

export async function GET() {
  const steps: Step[] = [];

  const profileId = await run('resolve the signed-in profile', getCurrentProfileId);
  steps.push(profileId);

  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    steps.push({
      step: 'load the session user',
      ok: false,
      detail: 'No session. Sign in first, then open this address again.',
    });
    return NextResponse.json({ signedIn: false, steps, verdict: 'Not signed in.' });
  }
  steps.push({ step: 'load the session user', ok: true, note: user.membership.role });

  const repository = await getRepository();
  const reference = now();
  const id = user.profile.id;

  steps.push(await run('listMyBookings', () => repository.listMyBookings(id)));
  steps.push(await run('getReadiness', () => repository.getReadiness(id, dayKey(reference))));
  steps.push(await run('listSessions', () => repository.listSessions(id, 20)));
  steps.push(
    await run('listClasses', () =>
      repository.listClasses({
        fromIso: reference.toISOString(),
        toIso: addDays(reference, 7).toISOString(),
        profileId: id,
      }),
    ),
  );
  steps.push(await run('buildRecommendations', () => buildRecommendations(repository, id, { limit: 1 })));
  steps.push(await run('buildScore', () => buildScore(repository, id)));
  steps.push(await run('listActivities', () => repository.listActivities(id, 60)));
  steps.push(
    await run('profile fields the home page reads', async () => ({
      avocado_style: user.profile.avocado_style,
      weekly_goal_sessions: user.profile.weekly_goal_sessions,
    })),
  );

  const failed = steps.filter((row) => !row.ok);
  const staff = isStaff(user);

  return NextResponse.json({
    signedIn: true,
    role: user.membership.role,
    steps: steps.map((row) =>
      row.ok || staff ? row : { step: row.step, ok: false, detail: '(staff only)' },
    ),
    verdict:
      failed.length === 0
        ? 'Every call the home page makes succeeded. The fault is not in this page’s data.'
        : `Failing: ${failed.map((row) => row.step).join(', ')}.`,
  });
}
