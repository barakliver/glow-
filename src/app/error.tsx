'use client';

import { useEffect, useState } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * What a member sees when a page throws.
 *
 * Next hands the boundary a digest - a hash that is a handle on a server log.
 * That is no use at all to the person actually holding the phone, which is who
 * is looking at this screen. So instead of printing the digest and hoping
 * somebody has log access, the boundary asks the running app two questions:
 * is the database behind the code, and which of the calls this page makes is
 * failing. Whichever answers, answers here, in the screenshot.
 *
 * The endpoints behind those questions report names, never member data, and
 * spell a database error out only for staff.
 */

type SelfTest = {
  signedIn?: boolean;
  steps?: { step: string; ok: boolean; detail?: string }[];
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [schemaBehind, setSchemaBehind] = useState(false);
  const [failing, setFailing] = useState<{ step: string; detail?: string }[]>([]);

  useEffect(() => {
    console.error('GLoW error boundary:', error);
  }, [error]);

  useEffect(() => {
    let cancelled = false;
    const json = (path: string) =>
      fetch(path, { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);

    json('/api/health/schema').then((report: { migrationsBehind?: string[] } | null) => {
      if (!cancelled && (report?.migrationsBehind?.length ?? 0) > 0) setSchemaBehind(true);
    });

    json('/api/health/self-test').then((report: SelfTest | null) => {
      if (cancelled || !report?.steps) return;
      setFailing(
        report.steps
          .filter((row) => !row.ok)
          .map((row) => ({ step: row.step, detail: row.detail })),
      );
    });

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

      {/* The technical half, for whoever is reporting the fault. Deliberately
          quiet, deliberately last, and deliberately on screen rather than in a
          log nobody can reach from a phone. */}
      {(failing.length > 0 || error.digest) && (
        <div
          dir="ltr"
          className="mt-2 w-full rounded-md border border-line bg-surface p-3 text-start text-[11px] leading-relaxed text-muted/80"
        >
          {failing.map((row) => (
            <p key={row.step}>
              <span className="font-bold text-danger">✕</span> {row.step}
              {row.detail ? `: ${row.detail}` : ''}
            </p>
          ))}
          {error.digest && <p className="num opacity-70">digest {error.digest}</p>}
        </div>
      )}
    </main>
  );
}
