import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

/**
 * Public shell for the privacy policy and the terms.
 *
 * Both have to be reachable without signing in: Google requires them before an
 * OAuth app can be published, and a member should be able to read them before
 * handing over an email address.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10">
      <header className="mb-8 text-center">
        <Link href="/" aria-label="GLoW - דף הבית">
          <Logo size="md" className="justify-center" />
        </Link>
      </header>
      <main id="main" className="space-y-8 leading-relaxed">
        {children}
      </main>
      <footer className="mt-12 flex justify-center gap-4 border-t border-line pt-6 text-xs text-muted">
        <Link href="/legal/privacy" className="hover:text-ink">מדיניות פרטיות</Link>
        <span aria-hidden>·</span>
        <Link href="/legal/terms" className="hover:text-ink">תנאי שימוש</Link>
      </footer>
    </div>
  );
}
