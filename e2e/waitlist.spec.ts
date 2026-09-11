import { expect, test } from '@playwright/test';
import { DEMO, findAdminClassRow, signInAs, signOut } from './helpers';

/**
 * Drives the full capacity lifecycle through the UI:
 * owner creates a one-seat class -> member A books it -> member B is queued ->
 * member A cancels -> member B is promoted automatically.
 */
test('full class queues a member, and cancelling promotes them', async ({ page }) => {
  test.slow();

  // --- owner creates a class with a single seat ---------------------------
  await signInAs(page, DEMO.owner);
  await page.goto('/admin/schedule');
  await page.getByRole('button', { name: 'שיעור חדש' }).click();

  const title = `בדיקת המתנה ${Date.now()}`;
  await page.getByLabel('שם השיעור').fill(title);
  await page.getByLabel('מספר מקומות').fill('1');

  const tomorrow = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
  await page.getByLabel('תאריך').fill(tomorrow);
  await page.getByLabel('שעת התחלה').fill('17:00');
  await page.getByRole('button', { name: 'יצירת השיעור' }).click();
  await expect(page.getByText('השיעור נוצר').first()).toBeVisible({ timeout: 15_000 });

  const classRow = await findAdminClassRow(page, title);
  await classRow.getByRole('link', { name: 'משתתפים' }).click();
  await page.waitForURL(/\/admin\/classes\//, { timeout: 20_000 });
  const classId = page.url().split('/admin/classes/')[1];
  expect(classId, 'expected a class id in the roster URL').toBeTruthy();
  await signOut(page);

  // --- member A takes the only seat --------------------------------------
  await signInAs(page, DEMO.member);
  await page.goto(`/classes/${classId}`);
  await page.getByRole('button', { name: 'הרשמה לשיעור' }).click();
  await expect(page.getByText('נרשמת לשיעור').first()).toBeVisible({ timeout: 15_000 });
  await signOut(page);

  // --- member B is offered the waiting list ------------------------------
  await signInAs(page, DEMO.member2);
  await page.goto(`/classes/${classId}`);
  await expect(page.getByText('מלא').first()).toBeVisible();
  await page.getByRole('button', { name: 'הצטרפות לרשימת המתנה' }).click();
  await expect(page.getByText('נוספת לרשימת ההמתנה').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/ברשימת המתנה/).first()).toBeVisible();
  await signOut(page);

  // --- member A cancels, member B is promoted ----------------------------
  await signInAs(page, DEMO.member);
  await page.goto(`/classes/${classId}`);
  await page.getByRole('button', { name: 'ביטול הרישום' }).click();
  await page.getByRole('button', { name: 'כן, בטלו את הרישום' }).click();
  await expect(page.getByText('הרישום בוטל').first()).toBeVisible({ timeout: 15_000 });
  await signOut(page);

  await signInAs(page, DEMO.member2);
  await page.goto(`/classes/${classId}`);
  await expect(page.getByText('רשום לשיעור').first()).toBeVisible({ timeout: 15_000 });

  await page.goto('/notifications');
  await expect(page.getByText('התפנה לך מקום').first()).toBeVisible();
});
