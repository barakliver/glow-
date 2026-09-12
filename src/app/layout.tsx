import type { Metadata, Viewport } from 'next';
import { Heebo, Manrope } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';
import { OfflineSync } from '@/components/pwa/offline-sync';
import { buildId } from '@/lib/build-id';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
  weight: ['300', '400', '500', '700', '800', '900'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'GLoW · מועדון אימונים פרטי',
    template: '%s · GLoW',
  },
  description: 'לוח אימונים שבועי, רישום לשיעורים, מעקב ביצועים וטיימר אינטרוולים.',
  applicationName: 'GLoW',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'GLoW',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#0D100F',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${manrope.variable}`}>
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
