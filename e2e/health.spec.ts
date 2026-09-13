import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/*
 * The app has to be able to say what is wrong with it.
 *
 * A server component that throws reaches the member as "something went wrong"
 * and reaches the developer as a digest - a hash that is only a handle on a
 * server log, which nobody holding a phone can open. These two endpoints are
 * what the error screen asks instead, so they have to keep working even on the
 * day everything else does not.
 */
test.describe('self diagnosis', () => {
  test('the schema check answers without a session', async ({ request }) => {
    const response = await request.get('/api/health/schema');
    expect(response.ok()).toBe(true);
    const report = await response.json();
    expect(report).toHaveProperty('verdict');
  });

  test('the self test says plainly that nobody is signed in', async ({ request }) => {
    const response = await request.get('/api/health/self-test');
    expect(response.ok()).toBe(true);
    const report = await response.json();
    expect(report.signedIn).toBe(false);
    // Even with no session it has to name the step it got to, or it is useless.
    expect(report.steps.length).toBeGreaterThan(0);
  });

  /* page.request, not the bare request fixture: the latter carries its own
     cookie jar and would arrive signed out. */
  test('the self test walks the whole home page data path for a member', async ({ page }) => {
    await signInAs(page, DEMO.member);

    const response = await page.request.get('/api/health/self-test');
    expect(response.ok()).toBe(true);
    const report = await response.json();

    expect(report.signedIn).toBe(true);
    const failed = (report.steps as { step: string; ok: boolean; detail?: string }[]).filter(
      (row) => !row.ok,
    );
    expect(failed, `failing steps: ${JSON.stringify(failed)}`).toEqual([]);

    // Every call the home page makes has to be covered, or a green self test
    // means nothing on the day the page is red.
    const covered = (report.steps as { step: string }[]).map((row) => row.step);
    for (const call of [
      'listMyBookings',
      'getReadiness',
      'listSessions',
      'listClasses',
      'buildRecommendations',
      'buildScore',
      'listActivities',
    ]) {
      expect(covered, `${call} is not covered by the self test`).toContain(call);
    }
  });

  test('the self test knows which role is asking', async ({ page }) => {
    await signInAs(page, DEMO.owner);
    const report = await (await page.request.get('/api/health/self-test')).json();
    expect(report.signedIn).toBe(true);
    expect(report.role).toBe('owner');
    expect(report.verdict).toBeTruthy();
  });
});
