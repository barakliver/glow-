import { chromium } from '@playwright/test';
const [url, out, w = '412', h = '900'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
await page.goto('http://127.0.0.1:3150/auth/sign-in', { waitUntil: 'networkidle' });
const btn = page.getByRole('button', { name: /נועה ברק/ }).first();
if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForURL((u) => !u.pathname.startsWith('/auth/sign-in'), { timeout: 20000 }); }
await page.goto('http://127.0.0.1:3150' + url, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
if (process.env.CLICK) { await page.getByRole('button', { name: new RegExp(process.env.CLICK) }).first().click(); await page.waitForTimeout(600); }
await page.screenshot({ path: out, fullPage: process.env.FULL === '1' });
console.log('shot →', out);
await browser.close();
