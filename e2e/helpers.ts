import { expect, type Page } from '@playwright/test';

export const DEMO = {
  owner: 'נועה ברק',
  trainer: 'עידן כהן',
  member: 'יובל אדרי',
  member2: 'טל שרון',
} as const;

/** Signs in through the demo account picker on the sign-in screen. */
export async function signInAs(page: Page, name: string) {
  await page.goto('/auth/sign-in');
  const button = page.getByRole('button', { name: new RegExp(name) });
  await expect(button.first()).toBeVisible();
  await button.first().click();
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/sign-in'), { timeout: 20_000 });
}

export async function signOut(page: Page) {
  await page.goto('/more');
  await page.getByRole('button', { name: 'יציאה מהחשבון' }).click();
  await page.getByRole('button', { name: 'כן, צאו' }).click();
  await page.waitForURL(/\/auth\/sign-in/, { timeout: 20_000 });
}

/** Opens the weekly schedule and returns the first class card that is bookable. */
export async function gotoSchedule(page: Page) {
  await page.goto('/schedule');
  await expect(page.getByRole('heading', { name: 'לוח שבועי' })).toBeVisible();
}

/**
 * Finds a class row in the admin schedule, looking at this week and the next.
 * Occurrences can land in either week depending on which day the suite runs.
 */
export async function findAdminClassRow(page: Page, title: string) {
  for (const week of [0, 1, 2]) {
    await page.goto(`/admin/schedule?week=${week}`);
    const row = page.getByRole('listitem').filter({ hasText: title }).first();
    if (await row.isVisible().catch(() => false)) return row;
  }
  throw new Error(`class "${title}" was not found in the next three weeks`);
}
