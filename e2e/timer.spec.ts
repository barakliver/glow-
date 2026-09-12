import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

test.describe('interval timer', () => {
  test('starts, pauses and resumes with an accurate clock', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/timer');

    await expect(page.getByRole('heading', { name: 'טיימר אינטרוולים' })).toBeVisible();
    await expect(page.getByText('היכונו').first()).toBeVisible();
    // Classic Tabata default: 10s prepare, 20/10 x 8 => 04:00 total.
    await expect(page.getByText('סה״כ 04:00', { exact: false }).first()).toBeVisible();

    await page.getByRole('button', { name: 'התחלה' }).click();
    await page.waitForTimeout(2200);

    await page.getByRole('button', { name: 'השהיה' }).click();
    const paused = await page.locator('p.num').first().textContent();

    // While paused the clock must not move.
    await page.waitForTimeout(1200);
    await expect(page.locator('p.num').first()).toHaveText(paused ?? '');

    await page.getByRole('button', { name: 'המשך' }).click();
    await page.waitForTimeout(1200);
    await expect(page.locator('p.num').first()).not.toHaveText(paused ?? '');
  });

  test('skips to the next phase and restarts', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/timer');

    await page.getByRole('button', { name: 'הפאזה הבאה' }).click();
    await expect(page.getByText('עבודה').first()).toBeVisible();
    await expect(page.getByText(/סבב/).first()).toBeVisible();

    await page.getByRole('button', { name: 'אתחול' }).click();
    await expect(page.getByText('היכונו').first()).toBeVisible();
  });

  test('saves a custom preset', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/timer');

    await page.getByRole('button', { name: 'הגדרות הטיימר' }).click();
    await page.getByLabel('זמן עבודה').fill('30');
    await page.getByLabel('מספר סבבים').fill('5');
    await page.getByRole('button', { name: 'שמירה' }).last().click();

    await page.getByRole('button', { name: 'שמירת התבנית הנוכחית' }).click();
    const name = `תבנית בדיקה ${Date.now()}`;
    await page.getByLabel('שם התבנית').fill(name);
    await page.getByRole('button', { name: 'שמירה' }).last().click();

    await expect(page.getByText('התבנית נשמרה').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(name)).toBeVisible();
  });
});
