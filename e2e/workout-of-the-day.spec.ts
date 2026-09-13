import { expect, test, type Page } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/**
 * Finds a class in the next two weeks that this member can still join AND that
 * has a workout planned, then opens its page.
 *
 * Both conditions matter: other specs create classes of their own with nothing
 * assigned, and a class with nothing planned shows no lock at all - correctly,
 * but it proves nothing about the gate.
 *
 * Which classes have room depends on the day the suite runs, so the search
 * walks weeks and, on a phone-sized viewport, day tabs. The two layouts differ:
 * a wide screen renders the week as a grid of list items, a phone renders one
 * day as a column of cards. Both carry a booking control and a link to the
 * class, so the walk looks for whichever container holds the button.
 */
async function openBookableClass(page: Page) {
  const bookLabel = 'הרשמה לשיעור';
  const anyBookButton = page.getByRole('button', { name: bookLabel }).filter({ visible: true });

  const openFirst = async () => {
    for (const role of ['article', 'listitem'] as const) {
      const container = page
        .getByRole(role)
        .filter({ visible: true })
        .filter({ has: page.getByRole('button', { name: bookLabel }) })
        .filter({ has: page.locator('[data-workout="locked"]') })
        .first();
      if (await container.isVisible().catch(() => false)) {
        await container.getByRole('link').first().click();
        await expect(page).toHaveURL(/\/classes\//);
        return true;
      }
    }
    return false;
  };

  for (const week of [0, 1]) {
    await page.goto(`/schedule?week=${week}`);
    await expect(page.getByRole('heading', { name: 'לוח שבועי' })).toBeVisible();

    if ((await anyBookButton.count()) > 0 && (await openFirst())) return;

    const days = page.getByRole('tab').filter({ visible: true });
    const count = await days.count();
    for (let day = 0; day < count; day += 1) {
      await days.nth(day).click();
      if ((await anyBookButton.count()) > 0 && (await openFirst())) return;
    }
  }
  throw new Error('no bookable class in the next two weeks');
}

test.describe('the workout of the day', () => {
  test('is hidden until the member books, then opens in full', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await openBookableClass(page);

    // Before booking: the shape of the session, and not one movement.
    const locked = page.getByText('התוכנית המלאה נחשפת אחרי ההרשמה');
    await expect(locked).toBeVisible();
    await expect(page.getByRole('heading', { name: 'חימום' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'האימון', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'התאמות לרמה' })).toHaveCount(0);

    await page.getByRole('button', { name: 'הרשמה לשיעור' }).first().click();
    await expect(page.getByText('נרשמת לשיעור').first()).toBeVisible({ timeout: 15_000 });

    // After booking: the whole plan.
    await expect(locked).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'חימום' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'האימון', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'התאמות לרמה' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'שחרור' })).toBeVisible();
  });

  test('the schedule says a class holds five and marks the workout locked', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/schedule');

    // Both layouts print the same thing: how many of the five places are taken.
    // The layout that is not in use stays in the DOM, hidden by CSS, so filter
    // to what a member can actually see.
    await expect(page.getByText(/\d\/5/).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('תפוסים').filter({ visible: true }).first()).toBeVisible();
  });

  test('the library is browsable and a workout reads end to end', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/workout/wods');

    await expect(page.getByRole('heading', { name: 'מאגר האימונים' })).toBeVisible();
    await expect(page.getByText(/1\d\d אימונים מוכנים/)).toBeVisible();

    await page.getByRole('tab', { name: /קרוספיט/ }).click();
    const fran = page.getByRole('link', { name: /Fran/ }).first();
    await expect(fran).toBeVisible();
    await fran.click();

    await expect(page.getByRole('heading', { name: 'Fran', exact: true })).toBeVisible();
    await expect(page.getByText('Thrusters').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ניקוד' })).toBeVisible();
    await expect(page.getByText('זמן סיום').first()).toBeVisible();
  });

  test('a trainer assigns a workout to a class', async ({ page }) => {
    await signInAs(page, DEMO.trainer);

    // The roster link is on the admin week; the current week always has classes
    // in the demo seed, but walk forward if the suite runs on a quiet day.
    let opened = false;
    for (const week of [0, 1]) {
      await page.goto(`/admin/schedule?week=${week}`);
      const roster = page.getByRole('link', { name: 'משתתפים' }).filter({ visible: true }).first();
      if (await roster.isVisible().catch(() => false)) {
        await roster.click();
        opened = true;
        break;
      }
    }
    expect(opened, 'expected a class to manage in the next two weeks').toBe(true);
    await expect(page).toHaveURL(/\/admin\/classes\//);

    const picker = page.getByRole('heading', { name: 'אימון השיעור' });
    await expect(picker).toBeVisible();
    await expect(
      page.getByText('המתאמנים יראו את התוכנית המלאה רק אחרי שנרשמו לשיעור'),
    ).toBeVisible();

    // Swap the assigned workout for a named one and confirm it sticks.
    //
    // Both Playwright projects share one in-memory demo database, so this class
    // may already carry whichever workout the other project assigned. Pick one
    // it is not carrying - the save button is correctly disabled when nothing
    // would change, and a test that depends on run order is not a test.
    const assigned = (await page.getByRole('heading', { name: 'אימון השיעור' })
      .locator('xpath=../div[contains(@class, "border-accent")]')
      .first()
      .textContent()
      .catch(() => '')) ?? '';
    const target = assigned.includes('Cindy') ? 'Fran' : 'Cindy';

    // The picker opens filtered to the family already assigned, so widen it.
    await page.getByRole('button', { name: 'הכל', exact: true }).click();
    await page.getByPlaceholder('חיפוש אימון במאגר').fill(target);
    await page.getByRole('button', { name: new RegExp(`^${target}`) }).first().click();

    const save = page.getByRole('button', { name: 'שיבוץ לשיעור' });
    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.getByText('האימון שובץ לשיעור').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(target).first()).toBeVisible();
  });

  test('a member records a result after the class and sees it in their history', async ({
    page,
  }) => {
    await signInAs(page, DEMO.member);

    // A class that already happened, so the result form is open. The form is
    // deliberately not offered before the class starts.
    await page.goto('/bookings');
    await page.getByRole('tab', { name: 'הושלמו' }).click();
    const past = page.getByRole('link', { name: /.+/ }).filter({ visible: true });
    let opened = false;
    for (let index = 0; index < (await past.count()); index += 1) {
      const href = await past.nth(index).getAttribute('href');
      if (href?.startsWith('/classes/')) {
        await past.nth(index).click();
        opened = true;
        break;
      }
    }
    expect(opened, 'expected a completed booking in the demo seed').toBe(true);
    await expect(page).toHaveURL(/\/classes\//);

    const form = page.getByRole('heading', { name: /רישום תוצאה|עדכון התוצאה/ });
    await expect(form).toBeVisible();

    // Whatever this workout is scored on, one of these inputs is on screen and
    // the others are not - that is the whole point of the form.
    const fields = [
      { label: 'דקות', value: '8' },
      { label: 'סבבים מלאים', value: '14' },
      { label: 'סך החזרות', value: '120' },
      { label: 'משקל בק״ג', value: '60' },
    ];
    let filled = false;
    for (const field of fields) {
      const input = page.getByLabel(field.label, { exact: true });
      if (await input.isVisible().catch(() => false)) {
        await input.fill(field.value);
        filled = true;
        break;
      }
    }
    if (!filled) {
      // A completion-scored workout asks a yes/no question instead.
      await page.getByRole('button', { name: 'כן, השלמתי' }).click();
    }

    // The button's accessible name carries its hint line too, hence the prefix.
    await page.getByRole('button', { name: /^Rx/ }).click();
    await page.getByRole('radio', { name: /^8/ }).click();
    await page.getByLabel('הערות אישיות').fill('נרשם מתוך בדיקה אוטומטית.');

    await page.getByRole('button', { name: /שמירת התוצאה|עדכון התוצאה/ }).click();
    await expect(page.getByText('התוצאה נשמרה').first()).toBeVisible({ timeout: 15_000 });

    await page.goto('/workout/results');
    await expect(page.getByRole('heading', { name: 'התוצאות שלי' })).toBeVisible();
    await expect(page.getByText('נרשם מתוך בדיקה אוטומטית.').first()).toBeVisible();
  });
});

