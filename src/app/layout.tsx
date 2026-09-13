import type { Metadata, Viewport } from 'next';
import { Frank_Ruhl_Libre, Heebo, Manrope } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';
import { OfflineSync } from '@/components/pwa/offline-sync';
import { buildId } from '@/lib/build-id';
import { APP_URL } from '@/lib/env';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
  weight: ['300', '400', '500', '700', '800', '900'],
});

/*
 * A Hebrew serif for headings. Heebo alone is clean but anonymous - every
 * screen ends up the same weight of the same face. Frank Ruhl Libre is a real
 * Hebrew typeface with editorial pedigree, and pairing it against Heebo is
 * what gives the club a voice rather than a default.
 */
const frank = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  variable: '--font-frank',
  display: 'swap',
  weight: ['400', '500', '700', '900'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const TITLE = 'GLoW · מועדון אימונים פרטי';
const DESCRIPTION = 'לוח אימונים שבועי, רישום לשיעורים, מעקב ביצועים וטיימר אינטרוולים.';

export const metadata: Metadata = {
  /* Social scrapers need absolute URLs; this is what Next resolves them against. */
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: '%s · GLoW',
  },
  description: DESCRIPTION,
  applicationName: 'GLoW',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'GLoW',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icons/favicon.png', type: 'image/png', sizes: '64x64' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  /*
   * Invite links are pasted into WhatsApp, so every one of them unfurls into a
   * card. The card is the same for every link: the mark, the club's name and
   * one line about the app. It never carries the inviter, the member or
   * anything about who the link was meant for.
   */
  openGraph: {
    type: 'website',
    siteName: 'GLoW',
    locale: 'he_IL',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'GLoW' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og.png'] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0E100E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${manrope.variable} ${frank.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:end-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-bg"
        >
          דילוג לתוכן הראשי
        </a>
        <ToastProvider>
          {children}
          <OfflineSync />
        </ToastProvider>
        <ServiceWorkerRegistrar buildId={buildId()} />
      </body>
    </html>
  );
}
