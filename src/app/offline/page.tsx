import Link from 'next/link';
import { CloudOff, Timer } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'אין חיבור' };

export default function OfflinePage() {
  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-4 px-5 text-center"
    >
      <Logo size="lg" stacked />
      <div className="flex size-14 items-center justify-center rounded-full bg-raised">
        <CloudOff className="size-7 text-warning" aria-hidden />
      </div>
      <h1 className="text-xl font-extrabold">אין חיבור לאינטרנט</h1>
      <p className="text-sm text-muted">
        הטיימר והאימון הפעיל ממשיכים לעבוד גם בלי רשת. כל הסטים שתרשמו יישמרו במכשיר ויסתנכרנו
        אוטומטית ברגע שהחיבור יחזור.
      </p>
      <div className="flex w-full flex-col gap-2">
        <Button asChild block size="lg">
          <Link href="/timer">
            <Timer className="size-4" aria-hidden />
            פתיחת הטיימר
          </Link>
        </Button>
        <Button variant="secondary" asChild block>
          <Link href="/">ניסיון נוסף</Link>
        </Button>
      </div>
    </main>
  );
}
