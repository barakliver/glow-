'use client';

import { useState } from 'react';
import { Activity, ClipboardList, Compass } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { AvocadoGlyph } from '@/components/brand/avocado-glyph';
import { cn } from '@/lib/utils';
import { ProgrammeTool } from './programme-tool';
import { PlateauTool } from './plateau-tool';
import { WeakPointTool } from './weak-point-tool';

/**
 * The coach.
 *
 * Three tools, one screen. Everything they produce is computed here on the
 * phone from what was typed - there is no model behind this, no key, no
 * network call and no cost, which is also why the same answers always give
 * the same plan.
 */
const TOOLS = [
  {
    key: 'programme' as const,
    label: 'תוכנית 12 שבועות',
    hint: 'תוכנית מלאה לפי המספרים שלך',
    icon: ClipboardList,
  },
  { key: 'plateau' as const, label: 'נתקעתי', hint: 'מה עוצר אותך, לפי סדר', icon: Activity },
  { key: 'weak' as const, label: 'נקודות תורפה', hint: 'מה חלש ומה עושים', icon: Compass },
];

export function CoachScreen() {
  const [tool, setTool] = useState<(typeof TOOLS)[number]['key']>('programme');

  return (
    <div className="space-y-8">
      <PageHeader title="המאמן" subtitle="תוכניות ואבחונים לפי המספרים שלך" backHref="/more" />

      <section className="relative overflow-hidden rounded-2xl border border-line/40 bg-surface p-6">
        <AvocadoGlyph
          size={120}
          className="pointer-events-none absolute -bottom-8 -start-6 text-ink/[0.035]"
        />
        <p className="relative text-sm leading-relaxed text-muted">
          כל מה שכאן מחושב מהמספרים שתזין, כאן בטלפון. אין מודל, אין חיבור לאינטרנט ואין עלות —
          ואותן תשובות תמיד יתנו אותה תוכנית, כדי שתוכל לחזור אליה בעוד חודשיים ולהשוות.
        </p>
      </section>

      <nav aria-label="כלי המאמן" className="grid grid-cols-3 gap-3">
        {TOOLS.map((item) => {
          const Icon = item.icon;
          const active = tool === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTool(item.key)}
              aria-pressed={active}
              className={cn(
                'flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors',
                active
                  ? 'border-accent/50 bg-accent/10 text-ink'
                  : 'border-line bg-surface text-muted hover:bg-raised',
              )}
            >
              <Icon className={cn('size-5', active ? 'text-accent-ink' : 'text-muted')} aria-hidden />
              <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <p className="-mt-4 text-xs text-muted">{TOOLS.find((t) => t.key === tool)!.hint}</p>

      {tool === 'programme' && <ProgrammeTool />}
      {tool === 'plateau' && <PlateauTool />}
      {tool === 'weak' && <WeakPointTool />}
    </div>
  );
}
