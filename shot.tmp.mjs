import { chromium } from '@playwright/test';

const out = process.argv[2];
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({
  viewport: { width: 412, height: 915 },
  locale: 'he-IL',
  timezoneId: 'Asia/Jerusalem',
});

await page.goto('http://127.0.0.1:3210/auth/sign-in');
await page.getByRole('button', { name: /נועה ברק/ }).first().click();
await page.waitForURL((url) => !url.pathname.startsWith('/auth/sign-in'), { timeout: 20000 });

await page.goto('http://127.0.0.1:3210/admin/schedule');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: out });

// Does the owner row actually fit, or does it run off the side?
const report = await page.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.includes('שיעור חדש'),
  );
  if (!button) return { found: false };
  const row = button.parentElement;
  const box = button.getBoundingClientRect();
  const rowBox = row.getBoundingClientRect();
  return {
    found: true,
    viewport: window.innerWidth,
    buttonLeftEdge: Math.round(box.left),
    buttonRightEdge: Math.round(box.right),
    rowLeftEdge: Math.round(rowBox.left),
    rowWidth: Math.round(rowBox.width),
    rowScrollWidth: row.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    clipped: box.left < 0 || box.right > window.innerWidth,
  };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
