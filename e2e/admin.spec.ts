import { expect, test } from '@playwright/test';
import { DEMO, findAdminClassRow, signInAs } from './helpers';

test.describe('owner administration', () => {
  test('creates a recurring class series that generates occurrences', async ({ page }) => {
    test.slow();
    await signInAs(page, DEMO.owner);
    await page.goto('/admin/schedule');

    await page.getByRole('button', { name: 'סדרה קבועה' }).click();

    // The title deliberately avoids the word "סדרה" so it cannot collide with
    // the series badge when asserting.
    const title = `מחזור קבוע ${Date.now()}`;
    await page.getByLabel('שם השיעור').fill(title);
    await page.getByLabel('מספר מקומות').fill('8');

    // Pick Sunday and Wednesday.
    await page.getByRole('button', { name: 'יום ראשון' }).click();
    await page.getByRole('button', { name: 'יום רביעי' }).click();

    // Start from the beginning of the current week so occurrences are generated
    // both in the visible week and in the next one.
    const start = new Date(Date.now() - 7 * 86_400_000);
    const end = new Date(Date.now() + 20 * 86_400_000);
    await page.getByLabel('מתאריך').fill(start.toISOString().slice(0, 10));
    await page.getByLabel('עד תאריך').fill(end.toISOString().slice(0, 10));
    await page.getByLabel('שעת התחלה').fill('20:00');

    await page.getByRole('button', { name: 'יצירת הסדרה' }).click();
    await expect(page.getByText(/נוצרה סדרה עם \d+ מופעים/).first()).toBeVisible({ timeout: 20_000 });

    // Occurrences appear on the schedule and carry the series badge.
    const occurrence = await findAdminClassRow(page, title);
    await expect(occurrence).toBeVisible();
    await expect(occurrence.getByText('סדרה', { exact: true })).toBeVisible();
  });

  test('members area is protected from non-staff', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/admin');
    // A member is redirected back to the app instead of seeing admin tools.
    await expect(page).not.toHaveURL(/\/admin/);
  });

  test('owner can see the roster and the check-in QR for a class', async ({ page }) => {
    await signInAs(page, DEMO.owner);
    await page.goto('/admin/schedule');
    await page.getByRole('link', { name: 'משתתפים' }).first().click();

    await expect(page.getByRole('heading', { name: 'משתתפים רשומים', exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'קוד צ׳ק-אין' }).click();
    await expect(page.getByRole('heading', { name: 'קוד צ׳ק-אין לשיעור' })).toBeVisible();
    await expect(page.getByRole('img', { name: /קוד QR/ })).toBeVisible({ timeout: 10_000 });
  });
});
