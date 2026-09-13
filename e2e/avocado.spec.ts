import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/*
 * The club counts in avocados. The rule that matters is that it counts
 * ALONGSIDE the kilograms and never instead of them: whoever is deciding what
 * to load next needs the real figure, and a joke that hides it is a bug.
 */
test.describe('counting in avocados', () => {
  test('a lift shows its tonnage in fruit as it is typed', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/tracking/new');

    // The form opens with one empty lift row already on it.
    const row = page.getByRole('listitem').filter({ has: page.getByLabel('סטים') }).first();
    await row.getByLabel(/שם תרגיל/).fill('דדליפט');
    await row.getByLabel('סטים').fill('5');
    await row.getByLabel('חזרות').fill('5');
    await row.getByLabel(/משקל/).fill('60');

    // 5 x 5 x 60 = 1500 kg = 7500 avocados, which is well past crates.
    await expect(row.getByText(/הרמת/)).toBeVisible();

    // The kilograms the member typed are still there, untouched.
    await expect(row.getByLabel(/משקל/)).toHaveValue('60');
  });

  test('says nothing at all until there is a weight', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/tracking/new');
    const row = page.getByRole('listitem').filter({ has: page.getByLabel('סטים') }).first();
    await row.getByLabel(/שם תרגיל/).fill('מתח');
    await row.getByLabel('חזרות').fill('10');
    // Bodyweight work has no load, so there is nothing to convert and the line
    // must stay away rather than print a zero.
    await expect(row.getByText(/הרמת/)).toHaveCount(0);
  });
});
