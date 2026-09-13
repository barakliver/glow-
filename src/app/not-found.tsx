import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center"
    >
      <Logo size="lg" stacked />
      <div className="flex size-14 items-center justify-center rounded-full bg-raised">
        <SearchX className="size-7 text-muted" aria-hidden />
      </div>
      <h1 className="text-xl font-extrabold">הדף לא נמצא</h1>
      <p className="text-sm text-muted">
        יכול להיות שהשיעור בוטל, שהקישור השתנה או שאין לכם הרשאה לצפות בדף הזה.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button block size="lg" asChild>
          <Link href="/">חזרה לדף הבית</Link>
        </Button>
        <Button variant="secondary" block asChild>
          <Link href="/schedule">ללוח השבועי</Link>
        </Button>
      </div>
    </main>
  );
}
