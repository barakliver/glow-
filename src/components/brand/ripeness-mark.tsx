'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The club mark, used as a progress indicator.
 *
 * An avocado ripens from the base upward, so `ripeness` (0-1) fills the fruit
 * from the bottom. At 0 it is a pale stone-hard fruit; at 1 it is fully ripe.
 */
export function RipenessMark({
  ripeness,
  size = 64,
  className,
  title,
}: {
  ripeness: number;
  size?: number;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, '');
  const level = Math.max(0, Math.min(1, ripeness));
  // The fruit occupies roughly y=18..116 in the viewBox.
  const fillTop = 116 - level * 98;

  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role="img"
      aria-label={title ?? `בשלות ${Math.round(level * 100)} אחוז`}
    >
      <defs>
        <linearGradient id={`ripe-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#C7FF4A" />
          <stop offset="1" stop-color="#EAFFB4" />
        </linearGradient>
        <clipPath id={`body-${id}`}>
          <path d="M64 18c-9 0-15 8-15 18 0 7-4 11-8 16-6 8-10 17-10 27 0 20 15 33 33 33s33-13 33-33c0-10-4-19-10-27-4-5-8-9-8-16 0-10-6-18-15-18z" />
        </clipPath>
      </defs>

      {/* unripe body */}
      <g clipPath={`url(#body-${id})`}>
        <rect x="0" y="0" width="128" height="128" fill="#29322D" />
        <rect x="0" y={fillTop} width="128" height="128" fill={`url(#ripe-${id})`} />
      </g>

      {/* rind */}
      <path
        d="M64 18c-9 0-15 8-15 18 0 7-4 11-8 16-6 8-10 17-10 27 0 20 15 33 33 33s33-13 33-33c0-10-4-19-10-27-4-5-8-9-8-16 0-10-6-18-15-18z"
        fill="none"
        stroke="#A8DC32"
        strokeOpacity={0.55}
        strokeWidth="4"
      />

      {/* stone */}
      <circle cx="64" cy="84" r="17" fill="#3F2610" />
      <circle cx="64" cy="84" r="17" fill="none" stroke="#0D100F" strokeOpacity={0.5} strokeWidth="2" />
      <path
        d="M54 76a14 14 0 0 1 9-5"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.25}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
