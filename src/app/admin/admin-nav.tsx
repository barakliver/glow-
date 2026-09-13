'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  Dumbbell,
  Link2,
  ListChecks,
  Megaphone,
  PenLine,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'סקירה', icon: BarChart3, ownerOnly: false },
  { href: '/admin/schedule', label: 'לוח שבועי', icon: CalendarDays, ownerOnly: false },
  { href: '/admin/members', label: 'מתאמנים', icon: Users, ownerOnly: true },
  { href: '/admin/workouts', label: 'כתיבת אימון', icon: PenLine, ownerOnly: false },
  { href: '/admin/templates', label: 'תבניות אימון', icon: ListChecks, ownerOnly: false },
  { href: '/admin/exercises', label: 'ספריית תרגילים', icon: Dumbbell, ownerOnly: false },
  { href: '/admin/invites', label: 'הזמנות', icon: Link2, ownerOnly: true },
  { href: '/admin/announcements', label: 'הודעות', icon: Megaphone, ownerOnly: false },
  { href: '/admin/settings', label: 'הגדרות', icon: Settings, ownerOnly: true },
] as const;

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const items = ITEMS.filter((item) => !item.ownerOnly || isOwner);

  return (
    <nav aria-label="ניווט ניהול" className="border-t border-line">
      <ul className="hide-scrollbar mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 py-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-colors',
                  active ? 'bg-accent/12 text-accent-ink' : 'text-muted hover:bg-raised hover:text-ink',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
