import { Badge } from '@/components/ui/badge';
import { AVAILABILITY_LABELS } from '@/lib/domain/booking-rules';
import type { ClassAvailability } from '@/lib/domain/types';

const TONES: Record<ClassAvailability, 'neutral' | 'accent' | 'success' | 'warning' | 'danger'> = {
  available: 'success',
  almost_full: 'warning',
  full: 'danger',
  booked: 'accent',
  waitlisted: 'warning',
  cancelled: 'danger',
  closed: 'neutral',
  past: 'neutral',
};

export function AvailabilityBadge({
  availability,
  spotsLeft,
}: {
  availability: ClassAvailability;
  spotsLeft?: number;
}) {
  const label =
    availability === 'available' && spotsLeft !== undefined
      ? `${spotsLeft} מקומות פנויים`
      : availability === 'almost_full' && spotsLeft !== undefined
        ? `נותרו ${spotsLeft}`
        : AVAILABILITY_LABELS[availability];

  return <Badge tone={TONES[availability]}>{label}</Badge>;
}
