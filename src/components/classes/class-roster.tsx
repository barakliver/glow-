import { Users } from 'lucide-react';
import { AvocadoAvatar } from '@/components/brand/avocado-avatar';
import { Badge } from '@/components/ui/badge';
import type { RosterEntry } from '@/lib/domain/types';

/**
 * Who is in the room.
 *
 * Names people chose for themselves and avocados they picked - never a full
 * name, a phone or an email, and nothing about what anyone has trained. The
 * roster answers one question and the shape of `RosterEntry` is what keeps it
 * from answering any others.
 *
 * There is no order of merit here either: waitlisted names sit after confirmed
 * ones because that is the queue, and that is the only ranking on the screen.
 */
export function ClassRoster({ roster, capacity }: { roster: RosterEntry[]; capacity: number }) {
  const booked = roster.filter((row) => row.status !== 'waitlisted');
  const waiting = roster.filter((row) => row.status === 'waitlisted');

  return (
    <section className="surface p-5" aria-labelledby="roster-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="roster-title" className="flex items-center gap-2 text-sm font-bold">
          <Users className="size-4 text-accent-ink" aria-hidden />
          מי מגיע
        </h2>
        <span className="num text-xs font-bold text-muted">
          {booked.length} מתוך {capacity}
        </span>
      </div>

      {roster.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          עוד אף אחד לא נרשם. מישהו צריך להיות הראשון.
        </p>
      ) : (
        <>
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-3.5">
            {booked.map((row) => (
              <li key={row.profile_id} className="flex w-[68px] flex-col items-center gap-1.5">
                <AvocadoAvatar profileId={row.profile_id} preset={row.avatar_preset} size={44} />
                <span className="w-full truncate text-center text-[11px] font-semibold">
                  {row.name}
                </span>
              </li>
            ))}
          </ul>

          {waiting.length > 0 && (
            <div className="mt-4 border-t border-line pt-4">
              <p className="label-muted mb-2.5 block">ברשימת המתנה</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-3">
                {waiting.map((row) => (
                  <li key={row.profile_id} className="flex w-[68px] flex-col items-center gap-1.5">
                    <AvocadoAvatar
                      profileId={row.profile_id}
                      preset={row.avatar_preset}
                      size={36}
                      className="opacity-60"
                    />
                    <span className="w-full truncate text-center text-[11px] text-muted">
                      {row.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {booked.length < capacity && (
        <Badge tone="outline" className="mt-4">
          נשארו <span className="num">{capacity - booked.length}</span> מקומות
        </Badge>
      )}
    </section>
  );
}
