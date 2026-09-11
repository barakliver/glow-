import { cn } from '@/lib/utils';

/**
 * GLoW typographic logo.
 * Original lettering: heavy uppercase G-L-W in the primary ink, with a lowercase
 * "o" rendered as a luminous ring - the "glow" that gives the club its name.
 */
export function Logo({
  size = 'md',
  className,
  withMark = true,
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withMark?: boolean;
}) {
  const scale = {
    sm: { text: 'text-lg', ring: 'size-[0.62em]', gap: 'gap-[0.06em]' },
    md: { text: 'text-2xl', ring: 'size-[0.6em]', gap: 'gap-[0.05em]' },
    lg: { text: 'text-4xl', ring: 'size-[0.58em]', gap: 'gap-[0.05em]' },
    xl: { text: 'text-6xl', ring: 'size-[0.56em]', gap: 'gap-[0.04em]' },
  }[size];

  return (
    <span
      className={cn(
        'inline-flex select-none items-center font-num font-extrabold tracking-[-0.03em] text-ink',
        scale.text,
        scale.gap,
        className,
      )}
      dir="ltr"
      aria-label="GLoW"
      role="img"
    >
      <span aria-hidden>G</span>
      <span aria-hidden>L</span>
      {withMark ? (
        <span
          aria-hidden
          className={cn(
            'relative inline-block rounded-full border-[0.13em] border-accent align-middle',
            'shadow-[0_0_14px_-2px_rgba(199,255,74,0.75)]',
            scale.ring,
          )}
        />
      ) : (
        <span aria-hidden>o</span>
      )}
      <span aria-hidden>W</span>
    </span>
  );
}

/** Compact square mark for the PWA icon and avatars. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md bg-accent font-num text-lg font-extrabold text-bg',
        className,
      )}
      aria-hidden
    >
      G
    </span>
  );
}
