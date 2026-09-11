'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Dumbbell, Home, MoreHorizontal, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'הבית', icon: Home },
  { href: '/schedule', label: 'לוח שבועי', icon: CalendarDays },
  { href: '/workout', label: 'אימון', icon: Dumbbell },
  { href: '/progress', label: 'התקדמות', icon: TrendingUp },
  { href: '/more', label: 'עוד', icon: MoreHorizontal },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="ניווט ראשי"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-semibold transition-colors',
                  active ? 'text-accent' : 'text-muted hover:text-ink',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md transition-all',
                    active && 'bg-accent/12 shadow-glow-soft',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
