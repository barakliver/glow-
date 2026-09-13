import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

/*
 * The app is used on a phone, held in one hand, in a gym.
 *
 * Two things break that and neither shows up in a desktop browser: a row of
 * actions that is wider than the screen, which makes the whole page slide
 * sideways, and content that ends underneath the fixed navigation. The second
 * is easy to get wrong because the bar is 80px but the avocado in the middle
 * of it stands proud of the bar's own box, so clearing the bar is not the same
 * as clearing the navigation.
 *
 * 360px is a small Android; an iPhone is 390.
 */
const ROUTES = [
  '/',
  '/schedule',
  '/progress',
  '/workout',
  '/workout/wods',
  '/workout/wods/krantz',
  '/tracking',
  '/tracking/new',
  '/timer',
  '/more',
  '/admin',
  '/admin/schedule',
  '/admin/members',
];

test.describe('fits a phone', () => {
  test('no screen makes the page scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await signInAs(page, DEMO.owner);

    const sideways: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 1) sideways.push(`${route} (+${overflow}px)`);
    }
    expect(sideways, `these scroll sideways at 360px: ${sideways.join(', ')}`).toEqual([]);
  });

  test('the navigation never lands on top of the content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signInAs(page, DEMO.member);
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    const clearance = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="ניווט ראשי"]')!;
      // The avocado is drawn outside the bar's own box, so the top of the
      // navigation is the top of whatever it draws, not the top of the bar.
      const parts = [nav, ...nav.querySelectorAll('svg')].map((el) => el.getBoundingClientRect());
      const navTop = Math.min(...parts.map((r) => r.top));

      const main = document.getElementById('main')!;
      const style = getComputedStyle(main);
      const contentBottom = main.getBoundingClientRect().bottom - parseFloat(style.paddingBottom);
      // Where the content ends relative to the page, once scrolled to the end.
      window.scrollTo(0, document.body.scrollHeight);
      return { navTop, contentBottom, padding: parseFloat(style.paddingBottom) };
    });

    // The reserved space has to cover the bar AND the fruit standing on it.
    const navHeight = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="ניווט ראשי"]')!;
      const parts = [nav, ...nav.querySelectorAll('svg')].map((el) => el.getBoundingClientRect());
      return Math.max(...parts.map((r) => r.bottom)) - Math.min(...parts.map((r) => r.top));
    });

    expect(
      clearance.padding,
      `content reserves ${clearance.padding}px but the navigation draws ${navHeight}px`,
    ).toBeGreaterThan(navHeight);
  });
});
