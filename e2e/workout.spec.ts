import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

test.describe('workout recording', () => {
  test('records sets from a template and completes the workout', async ({ page }) => {
    test.slow();
    await signInAs(page, DEMO.member2);
    await page.goto('/workout');

    // Start the first available template.
    await page.getByRole('button', { name: 'התחלה' }).first().click();
    await page.waitForURL(/\/workout\/active/, { timeout: 20_000 });
    await expect(page.getByText('אימון פעיל').first()).toBeVisible();

    // Log two sets on the first exercise.
    for (let i = 0; i < 2; i += 1) {
      await page.getByLabel('חזרות').fill(String(8 + i));
      await page.getByLabel('משקל (ק"ג)').fill(String(40 + i * 2.5));
      await page.getByRole('button', { name: 'שמירת הסט' }).click();
      await expect(page.getByText(/#\d/).first()).toBeVisible({ timeout: 10_000 });
      // Skip the rest timer if it appeared.
      const skip = page.getByRole('button', { name: 'דילוג על המנוחה' });
      if (await skip.isVisible().catch(() => false)) await skip.click();
    }

    await expect(page.getByRole('heading', { name: 'הסטים שנרשמו' })).toBeVisible();

    // Move to the next exercise and back.
    await page.getByRole('button', { name: 'התרגיל הבא' }).click();
    await page.getByRole('button', { name: 'התרגיל הקודם' }).click();

    // Finish.
    await page.getByRole('button', { name: 'סיום האימון' }).click();
    await page.getByLabel('איך היה האימון? (לא חובה)').fill('אימון בדיקה אוטומטי');
    await page.getByRole('button', { name: 'סיימתי את האימון' }).click();

    await page.waitForURL(/\/workout\/summary\//, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: 'האימון הושלם' })).toBeVisible();
    // The summary survives a refresh because it lives on its own route.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'האימון הושלם' })).toBeVisible();

    await page.getByRole('link', { name: 'לצפייה בהתקדמות' }).click();
    await expect(page).toHaveURL(/\/progress/);
    await expect(page.getByRole('heading', { name: 'ההתקדמות שלך' })).toBeVisible();
  });

  test('an unfinished workout is restored after a reload', async ({ page }) => {
    test.slow();
    await signInAs(page, DEMO.member);
    await page.goto('/workout');
    await page.getByRole('button', { name: 'התחלה' }).first().click();
    await page.waitForURL(/\/workout\/active/, { timeout: 20_000 });

    await page.getByLabel('חזרות').fill('12');
    await page.getByRole('button', { name: 'שמירת הסט' }).click();
    await expect(page.getByText(/#1/).first()).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByText('אימון פעיל').first()).toBeVisible();
    await expect(page.getByText(/#1/).first()).toBeVisible();

    // The hub also offers to resume it.
    await page.goto('/workout');
    await expect(page.getByText('יש לך אימון פעיל').first()).toBeVisible();
  });
});
