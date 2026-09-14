import Link from 'next/link';
import { Bell, Shield } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

export function AppHeader({
  unreadCount = 0,
  showAdminLink = false,
  className,
}: {
  unreadCount?: number;
  showAdminLink?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-md',
        className,
      )}
      /*
       * The viewport is declared `viewport-fit: cover`, which is what lets the
       * page paint under the status bar and the Dynamic Island instead of
       * leaving a grey band above it. The cost is that `top: 0` is the top of
       * the SCREEN, not the top of the usable area - so without this the logo
       * sits underneath the island and the whole header reads as cut off.
       *
       * The bottom bar has always reserved its inset. This is the other half.
       */
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 lg:max-w-4xl">
        <Link href="/" className="rounded-md" aria-label="GLoW - דף הבית">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-1">
          {showAdminLink && (
            <Link
              href="/admin"
              className="flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
              aria-label="אזור ניהול"
            >
              <Shield className="size-5" aria-hidden />
            </Link>
          )}
          <Link
            href="/notifications"
            className="relative flex size-10 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
            aria-label={unreadCount > 0 ? `התראות, ${unreadCount} חדשות` : 'התראות'}
          >
            <Bell className="size-5" aria-hidden />
            {unreadCount > 0 && (
              <span className="absolute end-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 font-num text-[10px] font-semibold leading-4 text-bg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
