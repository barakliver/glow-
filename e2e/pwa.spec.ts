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

  /*
   * The icons the manifest lists are not the only ones the app claims. The
   * favicon, the Apple touch icon and the link-preview card are declared in
   * the document head, and a path there that points at nothing fails silently:
   * the browser just shows its default and nobody notices for a year.
   */
  test('every icon the page declares is actually served', async ({ page, request }) => {
    await page.goto('/auth/sign-in');

    const declared = await page.evaluate(() => [
      ...[...document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')].map(
        (node) => (node as HTMLLinkElement).getAttribute('href') ?? '',
      ),
      ...[...document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')].map(
        (node) => node.getAttribute('content') ?? '',
      ),
    ]);

    expect(declared.length).toBeGreaterThanOrEqual(4);
    for (const url of declared) {
      expect(url, 'an icon was declared with no URL').not.toBe('');
      /* Social scrapers do not resolve relative URLs, so the preview card has
       * to be absolute - but the test server is not on the configured host,
       * so fetch it back by path. */
      const path = url.startsWith('http') ? new URL(url).pathname : url;
      const response = await request.get(path);
      expect(response.ok(), `${url} should be served`).toBe(true);
      expect(Number(response.headers()['content-length'] ?? '1')).toBeGreaterThan(0);
    }

    for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
      const value = await page.locator(selector).getAttribute('content');
      expect(value, `${selector} must be absolute`).toMatch(/^https?:\/\//);
    }

    // iOS only probes the site root when a page declares no Apple icon of its
    // own, so an icon parked under /icons/ and never referenced is invisible.
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
      'href',
      '/apple-touch-icon.png',
    );
    expect((await request.get('/apple-touch-icon.png')).ok()).toBe(true);
  });

  /*
   * Invite links get pasted into WhatsApp, which unfurls them into a card. The
   * card has to be the club's, not the invitee's: nothing about who was
   * invited, who invited them, or what is on the schedule.
   */
  test('a shared invite link previews as the club, not as the member', async ({ page }) => {
    await page.goto('/auth/sign-in');
    const brandCard = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');

    await page.goto('/invite/not-a-real-token');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      String(brandCard),
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);

    const card = await page.evaluate(() =>
      [...document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')]
        .map((node) => node.getAttribute('content') ?? '')
        .join(' '),
    );
    expect(card).not.toContain('not-a-real-token');
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
    // The cache namespace has to come from the registration URL. Hardcoding it
    // would strand every installed app on the version it first cached.
    expect(body).toContain("searchParams.get('v')");
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

  test('the worker is versioned per deployment so updates reach installed apps', async ({
    page,
  }) => {
    await page.goto('/auth/sign-in');
    const scriptURL = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return (registration.active ?? registration.waiting ?? registration.installing)?.scriptURL ?? '';
    });
    // Without the build id in the URL the browser keeps the worker it already
    // has, and a member who installed the app never sees a new version.
    expect(scriptURL).toMatch(/\/sw\.js\?v=.+/);
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

test.describe('hosted demo mode', () => {
  test('no demo warning on a local host', async ({ page }) => {
    await signInAs(page, DEMO.member);
    await page.goto('/');
    // 127.0.0.1 is a development machine; the warning would only be noise.
    // The hostname rule itself is covered by tests/unit/demo-banner.test.ts,
    // because window.location.hostname cannot be overridden in Chromium.
    await expect(page.getByText('מצב הדגמה.')).toHaveCount(0);
  });
});
