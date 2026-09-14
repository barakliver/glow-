'use client';

import { cn } from '@/lib/utils';

/**
 * Chart wrapper that pairs every visualisation with a written summary and a
 * hidden data table, so the information is available without seeing the chart.
 */
export function AccessibleChart({
  title,
  summary,
  children,
  table,
  className,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  table?: { caption: string; head: string[]; rows: (string | number)[][] };
  className?: string;
}) {
  return (
    <section className={cn('surface p-4', className)} aria-labelledby={`chart-${slug(title)}`}>
      <h3 id={`chart-${slug(title)}`} className="text-sm font-semibold">
        {title}
      </h3>
      <div className="mt-3" role="img" aria-label={`${title}. ${summary}`}>
        {children}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">{summary}</p>
      {table && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] font-medium text-accent-ink">
            הצגת הנתונים כטבלה
          </summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-start text-xs">
              <caption className="sr-only">{table.caption}</caption>
              <thead>
                <tr className="border-b border-line">
                  {table.head.map((cell) => (
                    <th key={cell} scope="col" className="p-1.5 text-start font-semibold text-muted">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, index) => (
                  <tr key={index} className="border-b border-line/50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="num p-1.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}

function slug(value: string): string {
  return value.replace(/\s+/g, '-');
}
