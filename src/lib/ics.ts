import type { GymClass } from '@/lib/domain/types';

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcsStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Builds a single-event ICS file for a class. Times are emitted in UTC. */
export function buildClassIcs(
  gymClass: Pick<GymClass, 'id' | 'title' | 'description' | 'starts_at' | 'ends_at' | 'location'>,
  trainerName: string | null,
): string {
  const description = [gymClass.description, trainerName ? `מאמן: ${trainerName}` : null]
    .filter(Boolean)
    .join('\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GLoW//Training Club//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:glow-class-${gymClass.id}`,
    `DTSTAMP:${toIcsStamp(new Date().toISOString())}`,
    `DTSTART:${toIcsStamp(gymClass.starts_at)}`,
    `DTEND:${toIcsStamp(gymClass.ends_at)}`,
    `SUMMARY:${escapeIcs(`GLoW · ${gymClass.title}`)}`,
    `LOCATION:${escapeIcs(gymClass.location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcs(`תזכורת: ${gymClass.title}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
