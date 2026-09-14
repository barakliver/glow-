'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Dumbbell, Home, MoreHorizontal } from 'lucide-react';
import { AvocadoGlyph } from '@/components/brand/avocado-glyph';
import { cn } from '@/lib/utils';

/**
 * The five places a member goes.
 *
 * The middle seat belongs to progress, because that is where a session ends -
 * you finish, you write down what you did, you see it land. It is drawn as the
 * club's own fruit rather than as an icon in a row of icons, and it sits
 * proud of the bar so the thumb finds it without looking.
 */
const ITEMS = [
  { href: '/', label: 'הבית', icon: Home },
  { href: '/schedule', label: 'לוח שבועי', icon: CalendarDays },
  { href: '/progress', label: 'התקדמות', avocado: true },
  { href: '/workout', label: 'אימון', icon: Dumbbell },
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

          if ('avocado' in item) {
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className="flex min-h-[68px] flex-col items-center justify-end gap-1 px-1 pb-2.5 text-[11px] font-medium"
                >
                  {/*
                    The fruit is the button. A round chip with an avocado
                    inside it is just another icon in a row of icons - the
                    shape has to be the thing you press, or none of this is
                    worth doing.
                  */}
                  <AvocadoGlyph
                    size={46}
                    filled={active}
                    className={cn(
                      '-mt-6 transition-all drop-shadow-[0_10px_16px_rgba(0,0,0,0.55)]',
                      active ? 'text-champagne' : 'text-muted',
                    )}
                  />
                  <span className={cn('truncate', active ? 'text-champagne' : 'text-muted')}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-[68px] flex-col items-center justify-center gap-1.5 px-1 py-2.5 text-[11px] font-medium transition-colors',
                  active ? 'text-accent-ink' : 'text-muted hover:text-ink',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full transition-all',
                    active && 'bg-accent/12 shadow-glow-soft',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
