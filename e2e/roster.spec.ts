import { expect, test, type Page } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/**
 * Opens a class page.
 *
 * A wide screen shows the whole week, a phone one day at a time, so a class
 * link can be present and not visible. Walk the weeks and the day tabs until
 * one is actually clickable.
 */
async function openAClass(page: Page) {
  for (const week of [0, 1]) {
    await page.goto(`/schedule?week=${week}`);
    await expect(page.getByRole('heading', { name: 'לוח שבועי' })).toBeVisible();

    const link = page.locator('a[href^="/classes/"]').filter({ visible: true }).first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      await page.waitForURL(/\/classes\//);
      return;
    }
    const days = page.getByRole('tab').filter({ visible: true });
    for (let day = 0; day < (await days.count()); day += 1) {
      await days.nth(day).click();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForURL(/\/classes\//);
        return;
      }
    }
  }
  throw new Error('no class to open in the next two weeks');
}

/*
 * A roster is allowed to say who is in the room on Tuesday. It is not allowed
 * to say anything else about them, and that is the half worth testing: full
 * names, phone numbers and email addresses must not reach the page, and none
 * of it may reach somebody holding only an invite link.
 */
test.describe('who is coming to a class', () => {
  test('a member sees the others booked into the class', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await openAClass(page);

    const roster = page.getByRole('region', { name: 'מי מגיע' });
    await expect(roster).toBeVisible();
    await expect(roster).toContainText(/מתוך/);
  });

  test('never prints a full name, a phone or an email', async ({ page }) => {
    await signInAs(page, DEMO.owner);
    await openAClass(page);

    const roster = page.getByRole('region', { name: 'מי מגיע' });
    const text = await roster.innerText();

    // The demo members all have a surname and a phone on file.
    for (const surname of ['אדרי', 'שרון', 'ברק', 'כהן']) {
      expect(text, `a surname reached the roster: ${surname}`).not.toContain(surname);
    }
    expect(text, 'a phone number reached the roster').not.toMatch(/05\d[- ]?\d{7}/);
    expect(text, 'an email reached the roster').not.toMatch(/@/);
  });

  /*
   * The standing rule: nothing about a member goes out through a public link.
   * An invite carries no session, so the page behind it must not carry a
   * roster either.
   */
  test('an invite link carries no roster at all', async ({ page }) => {
    await page.goto('/invite/glow-demo');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('מי מגיע');
    for (const surname of ['אדרי', 'שרון', 'ברק', 'כהן']) {
      expect(body, `a member surname is on a public page: ${surname}`).not.toContain(surname);
    }
  });
});

test.describe('choosing how you appear', () => {
  test('a nickname and an avocado are saved and shown back', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/more/profile');

    await page.getByLabel('איך קוראים לך במועדון').fill('אבוקדני');
    await page.getByRole('button', { name: 'מאצ׳ה' }).click();
    await page.getByRole('button', { name: /שמיר|שמור/ }).first().click();

    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.getByLabel('איך קוראים לך במועדון')).toHaveValue('אבוקדני');
    await expect(page.getByRole('button', { name: 'מאצ׳ה' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
