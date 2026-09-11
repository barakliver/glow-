'use client';

import { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISS_KEY = 'glow:demo-banner-dismissed';

/** Loopback hosts are development machines and need no warning. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0', '[::1]']);

/**
 * Whether a member should be told the data is not durable.
 * Pure so it can be tested without a browser.
 */
export function shouldWarnAboutDemoData(hostname: string): boolean {
  return !LOCAL_HOSTS.has(hostname.toLowerCase());
}

/**
 * Shown when the app is deployed without Supabase.
 *
 * Demo data lives in the server process, so on a hosted (especially serverless)
 * environment it can reset between requests. Saying so beats letting a member
 * wonder why their booking vanished.
 */
export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Local development already knows it is a demo; only warn on a real host.
    if (!shouldWarnAboutDemoData(window.location.hostname)) return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') return;
    } catch {
      /* storage blocked - show the banner anyway */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* storage blocked */
    }
  };

  return (
    <div
      role="status"
      className="border-b border-warning/35 bg-warning/10 px-4 py-2 text-center text-warning"
    >
      <div className="mx-auto flex max-w-2xl items-start gap-2 text-start">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p className="flex-1 text-xs leading-relaxed">
          <span className="font-bold">מצב הדגמה.</span> עדיין לא חובר מסד נתונים, ולכן רישומים
          ואימונים עשויים להתאפס. הלוח והמסכים מלאים ופעילים לחלוטין.
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="סגירת ההודעה"
          className="-me-1 shrink-0 rounded p-1 transition-colors hover:bg-warning/15"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
