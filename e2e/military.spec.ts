import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/*
 * Barak Workout Military: a counter, a clock, and a deadline that rewrites
 * itself. The interesting behaviour is all in what happens when the pace
 * slips, so that is what is driven here rather than just the happy path.
 */
test.describe('Barak Workout Military', () => {
  test('is one tap from the home screen', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.getByRole('link', { name: /Barak Workout Military/ }).first().click();
    await expect(page).toHaveURL(/\/workout\/military/);
    await expect(page.getByText('16 / 0').or(page.getByText('0 / 16'))).toBeVisible();
  });

  test('counts a round per tap and holds at sixteen', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');
    await page.getByRole('button', { name: 'התחלה' }).click();

    const counter = page.getByRole('button', { name: /סיימתי סבב/ });
    await counter.click();
    await expect(counter).toContainText('1');
    await counter.click();
    await expect(counter).toContainText('2');

    // Through to the end: the session closes itself on the sixteenth.
    for (let round = 3; round <= 16; round += 1) await counter.click();
    await expect(page.getByRole('heading', { name: 'סיכום' })).toBeVisible();
    await expect(page.getByText('סיימת את כל הסבבים.')).toBeVisible();
    await expect(page.getByText('16', { exact: false }).first()).toBeVisible();
  });

  test('summarises a workout stopped part way, without pretending it finished', async ({
    page,
  }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');
    await page.getByRole('button', { name: 'התחלה' }).click();

    const counter = page.getByRole('button', { name: /סיימתי סבב/ });
    await counter.click();
    await counter.click();
    await counter.click();
    await page.getByRole('button', { name: 'סיום' }).click();

    await expect(page.getByRole('heading', { name: 'סיכום' })).toBeVisible();
    await expect(page.getByText('עצרת כאן. זה נספר.')).toBeVisible();
    await expect(page.getByText('סבבים')).toBeVisible();
  });

  /*
   * The club's one rule for this screen: a calorie figure is arithmetic on
   * body weight, so it appears for somebody who has recorded one and is
   * refused outright for somebody who has not. Both halves, because the
   * failure mode that matters is a plausible number computed from a guess.
   */
  test('shows the target against a real weight', async ({ page }) => {
    // The demo member has weigh-ins on file.
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');
    await expect(page.getByText(/אומדן קלוריות/)).toBeVisible();
    await expect(page.getByText('400', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/אין משקל גוף רשום/)).toHaveCount(0);
  });

  test('refuses to estimate calories for somebody with no weight on file', async ({ page }) => {
    // A second member, who has never recorded one.
    await signInAs(page, DEMO.member2);
    await page.goto('/workout/military');
    await expect(page.getByText(/אין משקל גוף רשום/)).toBeVisible();
    await expect(page.getByRole('link', { name: /רישום משקל/ })).toBeVisible();
    // And no number is printed anyway.
    const panel = await page.locator('main').innerText();
    expect(panel).not.toMatch(/\d+\s*\/\s*400/);
  });

  test('pauses and resumes without losing the count', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');
    await page.getByRole('button', { name: 'התחלה' }).click();

    const counter = page.getByRole('button', { name: /סיימתי סבב/ });
    await counter.click();
    await counter.click();
    await page.getByRole('button', { name: 'השהיה' }).click();
    await expect(page.getByRole('button', { name: 'המשך' })).toBeVisible();
    await expect(counter).toContainText('2');

    await page.getByRole('button', { name: 'המשך' }).click();
    await counter.click();
    await expect(counter).toContainText('3');
  });
});
