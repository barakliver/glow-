import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

test.describe('invitation and booking', () => {
  test('an invited visitor sees the published schedule and must sign in to book', async ({ page }) => {
    await page.goto('/invite/glow-demo-invite');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('הוזמנתם ללוח האימונים');
    // Public page must never leak member data.
    await expect(page.getByText(DEMO.member)).toHaveCount(0);

    const joinLink = page.getByRole('link', { name: /הצטרפות והרשמה לשיעורים/ });
    await expect(joinLink).toBeVisible();
    await joinLink.click();
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test('an expired or unknown invitation shows a clear message', async ({ page }) => {
    await page.goto('/invite/not-a-real-token');
    await expect(page.getByText('ההזמנה לא נמצאה').first()).toBeVisible();
  });

  test('a member books a class and sees it under their bookings', async ({ page }) => {
    await signInAs(page, DEMO.member);

    // Walk this week and the next until a class with a free seat shows up.
    const bookButton = page.getByRole('button', { name: 'הרשמה לשיעור' }).first();
    let found = false;
    for (const week of [0, 1]) {
      await page.goto(`/schedule?week=${week}`);
      await expect(page.getByRole('heading', { name: 'לוח שבועי' })).toBeVisible();
      const days = page.getByRole('tab');
      const count = await days.count();
      for (let day = 0; day < count; day += 1) {
        await days.nth(day).click();
        if (await bookButton.isVisible().catch(() => false)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }

    expect(found, 'expected at least one bookable class in the next two weeks').toBe(true);
    await bookButton.click();

    await expect(page.getByText('נרשמת לשיעור').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('רשום לשיעור').first()).toBeVisible();

    await page.goto('/bookings');
    await expect(page.getByRole('heading', { name: 'ההזמנות שלי' })).toBeVisible();
    await expect(page.getByText('רשום').first()).toBeVisible();
  });

  test('booking is returned to after signing in from a class link', async ({ page }) => {
    await page.goto('/invite/glow-demo-invite');
    const classLink = page.getByRole('link', { name: 'התחברות והרשמה לשיעור' }).first();
    await classLink.click();
    await expect(page).toHaveURL(/returnTo=/);

    await page.getByRole('button', { name: new RegExp(DEMO.member2) }).first().click();
    // After authentication the member lands back on the class they picked.
    await page.waitForURL(/\/classes\//, { timeout: 20_000 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
