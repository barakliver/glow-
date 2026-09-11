import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireStaff } from '@/lib/auth';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { AdminNav } from './admin-nav';
import { ROLE_LABELS } from '@/lib/labels';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <Badge tone="accent">ניהול</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted sm:inline">
              {user.profile.full_name} · {ROLE_LABELS[user.membership.role]}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              חזרה לאפליקציה
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
        <AdminNav isOwner={user.membership.role === 'owner'} />
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl px-4 pb-16 pt-5">
        {children}
      </main>
    </div>
  );
}
