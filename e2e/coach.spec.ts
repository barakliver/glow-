import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/*
 * The coach is three calculators, not a chat box. What has to hold is that it
 * produces something usable from what was typed, and - the part that matters
 * to this club - that it never invents a weight for somebody who did not give
 * it one.
 */
test.describe('the coach', () => {
  test('builds a twelve week programme from the numbers typed in', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/coach');

    await page.locator('#rm-squat').fill('120');
    await page.locator('#rm-bench').fill('90');
    await page.locator('#rm-deadlift').fill('150');
    await page.locator('#rm-press').fill('55');
    await page.getByRole('button', { name: 'בניית התוכנית' }).click();

    await expect(page.getByText(/פריודיזציה בבלוקים/)).toBeVisible();
    await expect(page.getByRole('button', { name: '12', exact: true })).toBeVisible();

    /*
     * Week 1 of the first block is 67% of the squat, so 120kg becomes 80kg.
     * Scoped to the session that prescribes it rather than matched loosely
     * across the page - /80.*ק/ will happily find a rest interval or a
     * percentage somewhere else and then complain that it is not visible.
     */
    const firstSession = page.getByRole('article').first();
    await expect(firstSession).toContainText('סקוואט גבי');
    await expect(firstSession).toContainText('80');
    await expect(firstSession).toContainText('67%');
  });

  /*
   * The club's standing rule, enforced at the one screen that is allowed to
   * name a weight at all: with no max there is no kilogram, anywhere.
   */
  test('names no weight at all when it was given no maxes', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/coach');
    await page.getByRole('button', { name: 'בניית התוכנית' }).click();

    await expect(page.getByText(/לא הזנת שיא/)).toBeVisible();
    const plan = await page.locator('main').innerText();
    expect(plan, 'a kilogram was printed with no max to compute it from').not.toMatch(/\d+\s*ק״ג/);
    // Effort still has to be prescribed or the sets mean nothing.
    expect(plan).toMatch(/ביד/);
  });

  test('ranks what is stopping you rather than listing everything', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/coach');
    await page.getByRole('button', { name: /נתקעתי/ }).click();

    await page.getByLabel('שעות שינה בלילה').fill('5');
    await page.getByRole('button', { name: 'מה עוצר אותי' }).click();

    const first = page.getByRole('article').first();
    await expect(first).toContainText('שינה');
    await expect(page.getByText('שמונה שבועות לשבור את זה')).toBeVisible();
  });

  test('works two weak points at a time and parks the rest by name', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/coach');
    await page.getByRole('button', { name: /נקודות תורפה/ }).click();

    for (const label of ['הסקוואט קורס בתחתית', 'חזה עליון', 'זרועות', 'ישבן']) {
      await page.getByRole('button', { name: label }).click();
    }

    await expect(page.getByText('מתחילים מכאן')).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(2);
    await expect(page.getByText('אחר כך')).toBeVisible();
  });
});
