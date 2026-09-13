'use client';

import { useEffect, useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * What a member sees when a page throws.
 *
 * One cause is common enough here to be worth naming out loud: the club runs
 * its own Supabase and its owner applies the schema by hand, so the database
 * falls behind the code every time a feature ships and supabase/setup.sql is
 * not re-run. The page then throws on a column that does not exist yet, and
 * "something went wrong" sends everybody hunting. So the boundary asks the
 * database whether that is what happened, and says so when it is.
 *
 * The check reports names, never data, and the digest below is the handle the
 * server log is filed under - enough to report a fault, useless to anyone else.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [schemaBehind, setSchemaBehind] = useState(false);

  useEffect(() => {
    console.error('GLoW error boundary:', error);
  }, [error]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health/schema', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((report: { migrationsBehind?: string[] } | null) => {
        if (!cancelled && (report?.migrationsBehind?.length ?? 0) > 0) setSchemaBehind(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-danger/12">
        <AlertOctagon className="size-7 text-danger" aria-hidden />
      </div>
      <h1 className="text-xl font-extrabold">משהו השתבש</h1>

      {schemaBehind ? (
        <p className="text-sm leading-relaxed text-muted">
          מסד הנתונים של המועדון לא מעודכן לגרסה הנוכחית. בעל המועדון צריך להריץ שוב את{' '}
          <span dir="ltr" className="font-bold text-ink">
            supabase/setup.sql
          </span>{' '}
          בעורך ה־SQL של Supabase. אפשר להריץ אותו שוב בבטחה.
        </p>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          לא הצלחנו לטעון את הדף. אפשר לנסות שוב, ואם הבעיה נמשכת כדאי לרענן את האפליקציה.
        </p>
      )}

      <Button block size="lg" onClick={reset}>
        ניסיון נוסף
      </Button>

      {error.digest && (
        <p className="num text-[11px] text-muted/70" dir="ltr">
          {error.digest}
        </p>
      )}
    </main>
  );
}
