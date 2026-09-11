import { describe, expect, it } from 'vitest';
import { shouldWarnAboutDemoData } from '@/components/pwa/demo-banner';

describe('demo data warning', () => {
  it('stays quiet on a development machine', () => {
    for (const host of ['localhost', '127.0.0.1', '::1', '0.0.0.0', 'LOCALHOST']) {
      expect(shouldWarnAboutDemoData(host), host).toBe(false);
    }
  });

  it('warns on a deployed host, where data is not durable', () => {
    for (const host of ['glow.vercel.app', 'glow.co.il', 'my-gym.fly.dev']) {
      expect(shouldWarnAboutDemoData(host), host).toBe(true);
    }
  });
});
