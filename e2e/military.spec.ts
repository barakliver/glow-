import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/*
 * Barak Workout Military: a counter, a clock, and a deadline that rewrites
 * itself. The interesting behaviour is all in what happens when the pace
 * slips, so that is what is driven here rather than just the happy path.
 *
 * The counter is reached by test id rather than by name because its label is
 * deliberately different in every phase - "לחיצה להתחלה" before the clock
 * runs, "סיימתי סבב" while it does, "מושהה" when it is held. Pinning the name
 * would mean the locator stops matching exactly when the screen is working.
 */
const counterOf = (page: import('@playwright/test').Page) =>
  page.getByTestId('round-counter');

test.describe('Barak Workout Military', () => {
  test('is one tap from the home screen', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.getByRole('link', { name: /Barak Workout Military/ }).first().click();
    await expect(page).toHaveURL(/\/workout\/military/);
    await expect(counterOf(page)).toContainText('16');
  });

  /*
   * The first tap starts the clock and the rest count rounds, so the largest
   * control on the screen is never inert. Before this, it rendered disabled
   * and faded until a separate start button was found and pressed - which is
   * the one thing you cannot ask of somebody who is already out of breath.
   */
  test('starts on the first tap of the counter itself', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');

    const counter = counterOf(page);
    await expect(counter).toContainText('לחיצה להתחלה');
    await expect(counter).toBeEnabled();

    await counter.click();
    await expect(counter).toContainText('סיימתי סבב');
    // That tap started the clock; it did not also count a round.
    await expect(counter).toContainText('0');
    await expect(page.getByRole('button', { name: 'השהיה' })).toBeVisible();
  });

  test('counts a round per tap and holds at sixteen', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');
    const counter = counterOf(page);
    await counter.click(); // starts

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
    const counter = counterOf(page);
    await counter.click(); // starts

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
    await expect(page.getByText('קלוריות').first()).toBeVisible();
    await expect(page.getByText('400', { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /רישום משקל/ })).toHaveCount(0);
  });

  test('refuses to estimate calories for somebody with no weight on file', async ({ page }) => {
    // A second member, who has never recorded one.
    await signInAs(page, DEMO.member2);
    await page.goto('/workout/military');

    // The live tile offers the way to fix it instead of printing a guess.
    await expect(page.getByRole('link', { name: /רישום משקל/ })).toBeVisible();
    const live = await page.locator('main').innerText();
    expect(live).not.toMatch(/\d+\s*\/\s*400/);

    // And the summary says why in full, rather than leaving a bare dash.
    await counterOf(page).click(); // starts
    await counterOf(page).click(); // one round
    await page.getByRole('button', { name: 'סיום' }).click();
    await expect(page.getByText(/אין משקל גוף רשום/)).toBeVisible();
    const summary = await page.locator('main').innerText();
    expect(summary).not.toMatch(/\d+\s*\/\s*400/);
  });

  test('pauses and resumes without losing the count', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/military');
    const counter = counterOf(page);
    await counter.click(); // starts

    await counter.click();
    await counter.click();
    await page.getByRole('button', { name: 'השהיה' }).click();
    await expect(page.getByRole('button', { name: 'המשך' })).toBeVisible();
    await expect(counter).toContainText('2');

    // Resuming works from the counter as well as from the explicit control,
    // because that is where the thumb already is.
    await counter.click();
    await expect(counter).toContainText('סיימתי סבב');
    await counter.click();
    await expect(counter).toContainText('3');
  });
});
