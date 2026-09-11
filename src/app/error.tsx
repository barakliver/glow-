'use client';

import { useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the server logs; never shown raw to the member.
    console.error('GLoW error boundary:', error);
  }, [error]);

  return (
    <main
      id="main"
      className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-danger/12">
        <AlertOctagon className="size-7 text-danger" aria-hidden />
      </div>
      <h1 className="text-xl font-extrabold">משהו השתבש</h1>
      <p className="text-sm text-muted">
        לא הצלחנו לטעון את הדף. אפשר לנסות שוב, ואם הבעיה נמשכת כדאי לרענן את האפליקציה.
      </p>
      <Button block size="lg" onClick={reset}>
        ניסיון נוסף
      </Button>
    </main>
  );
}
