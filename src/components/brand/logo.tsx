import { cn } from '@/lib/utils';

/**
 * The GLoW lockup.
 *
 * The mark is a woman's line drawn against a halved avocado - the grove the
 * club sits in, and the shape it is named for. Both the mark and the GLOW
 * wordmark come from the same piece of artwork (brand/glow-logo.jpg), cut and
 * keyed by scripts/build-icons.mjs, so the app never sets the wordmark in a
 * typeface of its own: there is one G-L-O-W and it is the drawn one.
 */

/**
 * Two sets of proportions, because the two arrangements want different ones.
 *
 * Stacked keeps the artwork's own ratio - the wordmark is 23% of the mark's
 * height there, and anything larger turns a drawn mark with a caption into two
 * competing logos. Side by side the word can carry more weight, since it is no
 * longer underneath.
 */
const SCALE = {
  sm: { mark: 'h-7', word: 'h-3.5', gap: 'gap-2', stackedMark: 'h-12', stackedWord: 'h-[11px]', stackedGap: 'gap-[7px]' },
  md: { mark: 'h-9', word: 'h-[18px]', gap: 'gap-2.5', stackedMark: 'h-16', stackedWord: 'h-[15px]', stackedGap: 'gap-[9px]' },
  lg: { mark: 'h-14', word: 'h-7', gap: 'gap-3.5', stackedMark: 'h-24', stackedWord: 'h-[22px]', stackedGap: 'gap-[13px]' },
  xl: { mark: 'h-20', word: 'h-10', gap: 'gap-4', stackedMark: 'h-32', stackedWord: 'h-[29px]', stackedGap: 'gap-[18px]' },
} as const;

export function Logo({
  size = 'md',
  className,
  withMark = true,
  /**
   * Mark above word, the way the artwork was drawn. Worth the vertical space
   * on a sign-in screen; wrong in a 56px header, which is why the default is
   * the horizontal reading.
   */
  stacked = false,
}: {
  size?: keyof typeof SCALE;
  className?: string;
  withMark?: boolean;
  stacked?: boolean;
}) {
  const scale = SCALE[size];

  return (
    <span
      className={cn(
        'select-none',
        stacked ? 'inline-flex flex-col items-center' : 'inline-flex items-center',
        stacked ? scale.stackedGap : scale.gap,
        className,
      )}
      dir="ltr"
      aria-label="GLoW"
      role="img"
    >
      {withMark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/mark.png"
          alt=""
          aria-hidden
          className={cn('w-auto', stacked ? scale.stackedMark : scale.mark)}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/wordmark.png"
        alt=""
        aria-hidden
        className={cn('w-auto', stacked ? scale.stackedWord : scale.word)}
      />
    </span>
  );
}

/** The mark on its own, for avatars and dense rows. */
export function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/mark.png"
      alt=""
      aria-hidden
      className={cn('size-9 object-contain', className)}
    />
  );
}
