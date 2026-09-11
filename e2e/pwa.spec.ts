import { expect, test } from '@playwright/test';
import { DEMO, signInAs } from './helpers';

test.describe('installable app', () => {
  test('serves a valid web app manifest', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBe(true);

    const manifest = await response.json();
    expect(manifest.name).toContain('GLoW');
    expect(manifest.short_name).toBe('GLoW');
    expect(manifest.start_url).toBe('/');
    // Chromium requires standalone (or fullscreen) to offer installation.
    expect(manifest.display).toBe('standalone');
    expect(manifest.dir).toBe('rtl');
    expect(manifest.lang).toBe('he');

    // Installability needs a 192px and a 512px icon, plus a maskable one for
    // Android adaptive icons.
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    expect(
      manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable'),
    ).toBe(true);
  });

  test('every declared icon is actually served', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json();
    for (const icon of manifest.icons as { src: string }[]) {
      const response = await request.get(icon.src);
      expect(response.ok(), `${icon.src} should be served`).toBe(true);
      expect(Number(response.headers()['content-length'] ?? '1')).toBeGreaterThan(0);
    }
  });

  test('service worker is served uncached and scoped to the whole app', async ({ request }) => {
    const response = await request.get('/sw.js');
    expect(response.ok()).toBe(true);
    expect(response.headers()['cache-control']).toContain('no-store');
    expect(response.headers()['service-worker-allowed']).toBe('/');

    const body = await response.text();
    // A fetch handler is required for the browser to consider the app offline capable.
    expect(body).toContain("addEventListener('fetch'");
    expect(body).toContain('/offline');
  });

  test('the page links the manifest and registers the worker', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      /manifest\.webmanifest/,
    );
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  });

  test('the offline fallback page is reachable', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.getByRole('heading', { name: 'אין חיבור לאינטרנט' })).toBeVisible();
    await expect(page.getByRole('link', { name: /פתיחת הטיימר/ })).toBeVisible();
  });

  test('members are offered the install entry point', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/more');
    await expect(page.getByRole('heading', { name: 'האפליקציה במכשיר שלך' })).toBeVisible();
  });
});

test.describe('offline capability', () => {
  test('the service worker registers, caches the shell and survives going offline', async ({
    page,
    context,
  }) => {
    test.slow();
    await signInAs(page, DEMO.member);

    // Visit the two screens that must keep working without a connection.
    await page.goto('/timer');
    await expect(page.getByRole('heading', { name: 'טיימר אינטרוולים' })).toBeVisible();

    const registered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return Boolean(registration.active || registration.installing || registration.waiting);
    });
    expect(registered, 'service worker should register').toBe(true);

    // Let the worker take control and cache the shell.
    await page.reload();
    await expect(page.getByRole('heading', { name: 'טיימר אינטרוולים' })).toBeVisible();
    await page.waitForTimeout(1500);

    // Pull the network and confirm the timer still loads and runs.
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'טיימר אינטרוולים' })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole('button', { name: 'התחלה' }).click();
    await page.waitForTimeout(1600);
    await expect(page.getByRole('button', { name: 'השהיה' })).toBeVisible();

    await context.setOffline(false);
  });
});
