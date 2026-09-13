import { chromium } from '@playwright/test';
const B = 'http://127.0.0.1:3161';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
await page.goto(B + '/auth/sign-in', { waitUntil: 'networkidle' });
const btn = page.getByRole('button', { name: new RegExp(process.env.AS || 'יובל אדרי') }).first();
if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForURL(u => !u.pathname.startsWith('/auth/sign-in'), { timeout: 20000 }); }
for (const spec of process.argv.slice(2)) {
  const [route, out, sel] = spec.split('::');
  await page.goto(B + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const target = sel ? page.locator(sel).first() : page;
  await target.screenshot({ path: out, fullPage: !sel && process.env.FULL === '1' });
  console.log('→', out);
}
await browser.close();
