'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Registers the offline service worker and offers the member the new version
 * when one has been deployed.
 *
 * The worker deliberately does not take over on its own: a page that is already
 * running would then be served chunks from a different build. Instead the new
 * worker waits, the member is told, and the swap happens together with a reload
 * so the whole app comes back on one version.
 */
export function ServiceWorkerRegistrar({ buildId }: { buildId: string }) {
  const [ready, setReady] = useState<ServiceWorker | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Service workers need a secure context. `isSecureContext` is the correct
    // test: it covers https plus every loopback host (localhost, 127.0.0.1, ::1),
    // which a hostname string comparison silently misses.
    if (!window.isSecureContext) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          `/sw.js?v=${encodeURIComponent(buildId)}`,
        );
        if (cancelled) return;

        const offer = (worker: ServiceWorker | null) => {
          // Only worth offering when an older worker is still in control. On a
          // first install there is no previous version to replace.
          if (worker && navigator.serviceWorker.controller && !cancelled) setReady(worker);
        };

        // The previous worker only lets go of its caches once a page is running
        // under the new one, which is now.
        navigator.serviceWorker.controller?.postMessage({ type: 'glow:tidy' });

        offer(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed') offer(installing);
          });
        });
      } catch {
        // Registration failures must never break the app.
      }
    };

    const start = () => void register();
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', start);
    };
  }, [buildId]);

  const apply = useCallback(() => {
    if (!ready) return;
    setApplying(true);
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => window.location.reload(),
      { once: true },
    );
    ready.postMessage({ type: 'glow:skip-waiting' });
  }, [ready]);

  if (!ready) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-50 mx-auto flex w-full max-w-md items-center justify-between gap-3 px-3"
    >
      <div className="flex w-full items-center justify-between gap-3 rounded-md border border-accent/45 bg-raised/95 px-3.5 py-2.5 shadow-glow-soft backdrop-blur-md">
        <p className="text-sm font-semibold">גרסה חדשה של GLoW מוכנה</p>
        <button
          type="button"
          onClick={apply}
          disabled={applying}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-bg transition-colors hover:bg-accent-pressed disabled:opacity-60"
        >
          <RefreshCw className={applying ? 'size-3.5 animate-spin' : 'size-3.5'} aria-hidden />
          {applying ? 'מרענן' : 'רענון'}
        </button>
      </div>
    </div>
  );
}
