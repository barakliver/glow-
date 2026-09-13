import { avatarSeededFor } from '@/lib/domain/avatars';
import { cn } from '@/lib/utils';

/**
 * A member, as an avocado.
 *
 * The face is drawn rather than photographed, so nothing here is a picture of
 * anybody and there is nothing to moderate or take down.
 */
export function AvocadoAvatar({
  profileId,
  preset,
  size = 40,
  className,
  title,
}: {
  profileId: string;
  preset?: string | null;
  size?: number;
  className?: string;
  title?: string;
}) {
  const avatar = avatarSeededFor(profileId, preset);
  const s = avatar.stroke;

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
        fill={avatar.fill}
        stroke={s}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <ellipse cx="64" cy="86" rx="14" ry="16" fill={avatar.stone} opacity="0.9" />
      {avatar.face && <Face kind={avatar.face} stroke={s} />}
    </svg>
  );
}

/** Two eyes and a mouth, high on the fruit so the stone reads as a belly. */
function Face({ kind, stroke }: { kind: NonNullable<Parameters<typeof AvocadoAvatar>[0]['preset']> | string; stroke: string }) {
  const common = { stroke, strokeWidth: 5, strokeLinecap: 'round' as const, fill: 'none' };

  if (kind === 'shades') {
    return (
      <g>
        <rect x="46" y="48" width="15" height="11" rx="4" fill={stroke} />
        <rect x="67" y="48" width="15" height="11" rx="4" fill={stroke} />
        <path d="M61 53h6" {...common} strokeWidth={3} />
        <path d="M57 68q7 5 14 0" {...common} />
      </g>
    );
  }

  const eyes =
    kind === 'wink' ? (
      <>
        <circle cx="54" cy="52" r="3.2" fill={stroke} />
        <path d="M69 52q4-4 8 0" {...common} />
      </>
    ) : kind === 'calm' ? (
      <>
        <path d="M50 52q4-4 8 0" {...common} />
        <path d="M70 52q4-4 8 0" {...common} />
      </>
    ) : (
      <>
        <circle cx="54" cy="52" r="3.2" fill={stroke} />
        <circle cx="74" cy="52" r="3.2" fill={stroke} />
      </>
    );

  const mouth =
    kind === 'grin' ? (
      <path d="M54 64q10 10 20 0q-10 4-20 0z" fill={stroke} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />
    ) : kind === 'determined' ? (
      <path d="M56 67h16" {...common} />
    ) : kind === 'calm' ? (
      <path d="M58 66q6 3 12 0" {...common} />
    ) : (
      <path d="M56 64q8 7 16 0" {...common} />
    );

  return (
    <g>
      {eyes}
      {mouth}
    </g>
  );
}
