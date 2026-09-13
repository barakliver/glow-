'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CheckCircle2, MapPin, ScanLine, XCircle } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { checkInAction } from '@/app/actions/booking';
import { BOOKING_STATUS_LABELS } from '@/lib/labels';
import type { BookingStatus } from '@/lib/domain/types';

export function CheckInScreen({
  classId,
  title,
  when,
  location,
  bookingStatus,
  cancelled,
  memberName,
}: {
  classId: string;
  title: string;
  when: string;
  location: string;
  bookingStatus: BookingStatus | null;
  cancelled: boolean;
  memberName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    bookingStatus === 'attended'
      ? { ok: true, message: 'כבר ביצעתם צ׳ק-אין לשיעור הזה.' }
      : null,
  );

  const checkIn = () => {
    startTransition(async () => {
      const response = await checkInAction(classId);
      setResult({ ok: response.ok, message: response.message });
    });
  };

  const eligible = bookingStatus === 'confirmed' || bookingStatus === 'attended';

  return (
    <main
      id="main"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-5 py-10"
    >
      <Logo size="lg" stacked className="justify-center" />

      <section className="surface p-5 text-center">
        <h1 className="text-xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm text-muted">{when}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
          <MapPin className="size-3.5" aria-hidden />
          {location}
        </p>

        <p className="mt-4 text-sm">
          שלום <span className="font-bold">{memberName}</span>
        </p>
        <div className="mt-2 flex justify-center">
          <Badge tone={eligible ? 'accent' : 'warning'}>
            {bookingStatus ? BOOKING_STATUS_LABELS[bookingStatus] : 'לא רשום'}
          </Badge>
        </div>

        {result ? (
          <div
            role="status"
            className={`mt-5 flex flex-col items-center gap-2 rounded-md border p-4 ${
              result.ok
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-danger/40 bg-danger/10 text-danger'
            }`}
          >
            {result.ok ? (
              <CheckCircle2 className="size-8" aria-hidden />
            ) : (
              <XCircle className="size-8" aria-hidden />
            )}
            <p className="text-sm font-bold">{result.message}</p>
          </div>
        ) : cancelled ? (
          <p
            role="alert"
            className="mt-5 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm font-semibold text-danger"
          >
            השיעור בוטל ולכן לא ניתן לבצע צ׳ק-אין.
          </p>
        ) : eligible ? (
          <Button block size="lg" className="mt-5" onClick={checkIn} loading={pending}>
            <ScanLine className="size-4" aria-hidden />
            אישור הגעה
          </Button>
        ) : (
          <p className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm font-semibold text-warning">
            {bookingStatus === 'waitlisted'
              ? 'אתם ברשימת ההמתנה. אם יתפנה מקום תקבלו התראה ותוכלו לבצע צ׳ק-אין.'
              : 'אין לכם רישום מאושר לשיעור הזה.'}
          </p>
        )}
      </section>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" block asChild>
          <Link href={`/classes/${classId}`}>לפרטי השיעור</Link>
        </Button>
        <Button variant="ghost" block asChild>
          <Link href="/">חזרה לדף הבית</Link>
        </Button>
      </div>
    </main>
  );
}
