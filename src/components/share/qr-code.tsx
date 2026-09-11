'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Skeleton } from '@/components/ui/skeleton';

/** Renders a QR code as a data URL. Sized up front so the layout never shifts. */
export function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: '#0D100F', light: '#F6F3EB' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <p className="text-xs text-muted" style={{ width: size }}>
        לא ניתן היה ליצור קוד QR.
      </p>
    );
  }

  return src ? (
    <img
      src={src}
      alt={`קוד QR לכתובת ${value}`}
      width={size}
      height={size}
      className="rounded-md"
      style={{ width: size, height: size }}
    />
  ) : (
    <Skeleton style={{ width: size, height: size }} />
  );
}
