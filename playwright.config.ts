import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    /*
     * Use the Chromium that ships with the environment when one is present,
     * so CI images do not have to download a browser on every run.
     */
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      /*
       * Phone-sized viewport with touch input. `isMobile` is deliberately off:
       * Chromium's mobile emulation simulates a collapsing URL bar, which
       * offsets the visual viewport from the layout viewport and makes hit
       * testing near the bottom of a scrolled page unreliable. The responsive
       * layout is driven by CSS width, so coverage is unaffected.
       */
      name: 'mobile',
      use: { ...devices['Pixel 7'], isMobile: false, viewport: { width: 412, height: 915 } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 240_000,
    env: { DEMO_MODE: 'true' },
  },
});
