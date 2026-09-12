import { cn } from '@/lib/utils';

/**
 * GLoW lockup.
 *
 * The mark is the club itself: a halved avocado from the grove the gym sits in,
 * with a woman holding a flex where the stone would be. Beside it, heavy
 * uppercase G-L-W with a lowercase accent "o" - the glow the club is named for.
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
    sm: { text: 'text-lg', mark: 'h-7', gap: 'gap-1.5' },
    md: { text: 'text-2xl', mark: 'h-9', gap: 'gap-2' },
    lg: { text: 'text-4xl', mark: 'h-14', gap: 'gap-2.5' },
    xl: { text: 'text-6xl', mark: 'h-24', gap: 'gap-3.5' },
  }[size];

  return (
    <span
      className={cn('inline-flex select-none items-center', scale.gap, className)}
      dir="ltr"
      aria-label="GLoW"
      role="img"
    >
      {withMark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/mark.svg"
          alt=""
          aria-hidden
          className={cn('w-auto drop-shadow-[0_0_18px_rgba(199,255,74,0.35)]', scale.mark)}
        />
      )}
      <span
        aria-hidden
        className={cn(
          'font-num font-extrabold tracking-[-0.03em] text-ink',
          scale.text,
        )}
      >
        GL<span className="text-accent">o</span>W
      </span>
    </span>
  );
}

/** Compact square mark for avatars and dense rows. */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/mark.svg"
      alt=""
      aria-hidden
      className={cn('size-9 object-contain', className)}
    />
  );
}
