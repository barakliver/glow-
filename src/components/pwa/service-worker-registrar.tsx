'use client';

import { useEffect } from 'react';

/** Registers the offline service worker once, on the client. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    // Service workers need a secure context. `isSecureContext` is the correct
    // test: it covers https plus every loopback host (localhost, 127.0.0.1, ::1),
    // which a hostname string comparison silently misses.
    if (!window.isSecureContext) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failures must never break the app.
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
