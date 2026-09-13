import { cn } from '@/lib/utils';

/**
 * The club's fruit as a plain shape.
 *
 * Same silhouette as the ripeness mark, without the ripening: this one is just
 * an avocado, for the places that want the club's outline rather than a
 * reading of how anyone's year is going.
 */
export function AvocadoGlyph({
  className,
  size = 24,
  filled = false,
  title,
}: {
  className?: string;
  size?: number;
  filled?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M64 18c-9 0-15 8-15 18 0 7-4 11-8 16-6 8-10 17-10 27 0 20 15 33 33 33s33-13 33-33c0-10-4-19-10-27-4-5-8-9-8-16 0-10-6-18-15-18z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 7}
        strokeLinejoin="round"
      />
      {/* The stone. Hollow on a filled fruit so it reads at 24px. */}
      <ellipse
        cx="64"
        cy="84"
        rx="15"
        ry="17"
        fill={filled ? '#0E100E' : 'none'}
        stroke={filled ? 'none' : 'currentColor'}
        strokeWidth="6"
      />
    </svg>
  );
}
