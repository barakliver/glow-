/**
 * Supabase adapter for the Repository contract.
 *
 * Reads and writes go through the anon key under Row Level Security, so the
 * database - not this file - is the authority on what the caller may touch.
 * Booking, cancellation and waiting-list promotion are delegated to the atomic
 * PostgreSQL functions defined in supabase/migrations/..._functions.sql.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { addDays, format, parseISO } from 'date-fns';
import { countConfirmed, countWaitlisted, isActiveBooking, spotsLeft } from '@/lib/domain/booking-rules';
import { dayKey, formatTime, fromGymTime, toGymTime } from '@/lib/time';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type AdminStats,
  type BookingOutcome,
  type CancelOutcome,
  type Repository,
  type TemplateWithExercises,
} from '@/lib/data/repository';
import type {
  AccessState,
  AppNotification,
  Attendance,
  Booking,
  BookingStatus,
  ClassSeries,
  ClassWithMeta,
  Exercise,
  GymClass,
  InviteLink,
  Membership,
  NotificationPreferences,
  Organization,
  Profile,
  ReadinessLog,
  SessionUser,
  TimerPreset,
  Trainer,
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSet,
  Workout,
  WorkoutCategory,
  WorkoutLog,
  WorkoutLogWithWorkout,
  WorkoutReveal,
  WorkoutTeaser,
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from '@/lib/domain/types';

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

/**
 * True when the error means "this part of the schema is not installed yet".
 *
 * A deployment reaches the club the moment it is pushed; the SQL that goes with
 * it is pasted by hand into the Supabase editor, which can be minutes or a day
 * later. In that window the workout tables do not exist. The club should see a
 * schedule with no workouts attached, not a page that refuses to load - so a
 * missing table degrades to "nothing planned" and every other error still
 * throws.
 */
function isMissingWorkoutSchema(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  // 42P01 undefined_table, 42883 undefined_function, PGRST202 no such function.
  if (error.code === '42P01' || error.code === '42883' || error.code === 'PGRST202') return true;
  const message = error.message ?? '';
  return (
    /relation .*(workouts|class_workouts|workout_logs).* does not exist/i.test(message) ||
    /function .*class_workout_teasers.* does not exist/i.test(message) ||
    /Could not find the function/i.test(message)
  );
}

export class SupabaseRepository implements Repository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly organizationId: string,
  ) {}

  /** Resolves the single GLoW organization id for a fresh client. */
  static async resolveOrganizationId(supabase: SupabaseClient): Promise<string> {
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .order('created_at')
      .limit(1)
      .maybeSingle();
    return data?.id ?? '';
  }

  private get orgFilter() {
    return { organization_id: this.organizationId };
  }

  // --- identity ---------------------------------------------------------
  async getOrganization(): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', this.organizationId)
      .single();
    if (error) throw new Error(error.message);
    return data as Organization;
  }

  async updateOrganization(patch: Partial<Organization>): Promise<Organization> {
    const { data, error } = await this.supabase
      .from('organizations')
      .update(patch)
      .eq('id', this.organizationId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Organization;
  }

  async getSessionUser(profileId: string | null): Promise<SessionUser | null> {
    if (!profileId) return null;
    const [profileRes, membershipRes, trainerRes] = await Promise.all([
      this.supabase.from('profiles').select('*').eq('id', profileId).maybeSingle(),
      this.supabase
        .from('memberships')
        .select('*')
        .eq('profile_id', profileId)
        .eq('organization_id', this.organizationId)
        .maybeSingle(),
      this.supabase
        .from('trainers')
        .select('*')
        .eq('profile_id', profileId)
        .eq('organization_id', this.organizationId)
        .maybeSingle(),
    ]);
    const profile = profileRes.data as Profile | null;
    const membership = membershipRes.data as Membership | null;
    // A membership that is suspended or still waiting for approval yields no
    // session at all, so nothing about the club can leak to it.
    if (!profile || !membership) return null;
    if (membership.status !== 'active' || !membership.approved_at) return null;
    return {
      profile,
      membership,
      organization: await this.getOrganization(),
      trainer: (trainerRes.data as Trainer | null) ?? null,
    };
  }

  async getAccessState(profileId: string | null): Promise<AccessState> {
    if (!profileId) return 'none';
    const { data } = await this.supabase
      .from('memberships')
      .select('status, approved_at')
      .eq('profile_id', profileId)
      .eq('organization_id', this.organizationId)
      .maybeSingle();
    if (!data) return 'none';
    if (data.status !== 'active') return 'suspended';
    return data.approved_at ? 'active' : 'pending';
  }

  async approveMember(
    profileId: string,
    role: Membership['role'],
    approvedBy: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .from('memberships')
      .update({ role, status: 'active', approved_at: new Date().toISOString(), approved_by: approvedBy })
      .eq('profile_id', profileId)
      .eq('organization_id', this.organizationId);
    if (error) throw error;
    if (role === 'trainer') await this.ensureTrainerFor(profileId);
  }

  async updateProfile(profileId: string, patch: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(patch)
      .eq('id', profileId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Profile;
  }

  async listMembers(): Promise<{ profile: Profile; membership: Membership }[]> {
    const { data, error } = await this.supabase
      .from('memberships')
      .select('*, profile:profiles(*)')
      .eq('organization_id', this.organizationId);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row: Record<string, unknown>) => {
        const { profile, ...membership } = row as { profile: Profile };
        return { profile, membership: membership as unknown as Membership };
      })
      .filter((row) => Boolean(row.profile))
      .sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name, 'he'));
  }

  async setMemberRole(profileId: string, role: Membership['role']): Promise<void> {
    const { error } = await this.supabase
      .from('memberships')
      .update({ role })
      .eq('profile_id', profileId)
      .eq('organization_id', this.organizationId);
    if (error) throw new Error(error.message);
    if (role === 'trainer') await this.ensureTrainerFor(profileId);
  }

  /** A trainer needs a trainer row before they can be put on a class. */
  private async ensureTrainerFor(profileId: string): Promise<void> {
    const profile = await this.supabase
      .from('profiles')
      .select('full_name')
      .eq('id', profileId)
      .maybeSingle();
    await this.upsertTrainer({
      profile_id: profileId,
      display_name: (profile.data?.full_name as string) ?? 'מאמן',
    });
  }

  async setMemberStatus(profileId: string, status: Membership['status']): Promise<void> {
    const { error } = await this.supabase
      .from('memberships')
      .update({ status })
      .eq('profile_id', profileId)
      .eq('organization_id', this.organizationId);
    if (error) throw new Error(error.message);
  }

  async ensureProfile(input: {
    id?: string;
    email: string;
    full_name: string;
    phone?: string | null;
  }): Promise<Profile> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', input.id ?? '')
      .maybeSingle();
    if (data) {
      return this.updateProfile(data.id as string, {
        full_name: input.full_name || (data.full_name as string),
        phone: input.phone ?? (data.phone as string | null),
        onboarding_completed: true,
      });
    }
    const inserted = await this.supabase
      .from('profiles')
      .insert({
        id: input.id,
        email: input.email,
        full_name: input.full_name,
        phone: input.phone ?? null,
        onboarding_completed: Boolean(input.full_name && input.phone),
      })
      .select('*')
      .single();
    return unwrap(inserted) as Profile;
  }

  // --- trainers ---------------------------------------------------------
  async listTrainers(): Promise<Trainer[]> {
    const { data, error } = await this.supabase
      .from('trainers')
      .select('*')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .order('display_name');
    if (error) throw new Error(error.message);
    return (data ?? []) as Trainer[];
  }

  async upsertTrainer(input: Partial<Trainer> & { profile_id: string }): Promise<Trainer> {
    const { data, error } = await this.supabase
      .from('trainers')
      .upsert(
        {
          ...this.orgFilter,
          profile_id: input.profile_id,
          display_name: input.display_name ?? 'מאמן',
          bio: input.bio ?? null,
          specialties: input.specialties ?? [],
          active: input.active ?? true,
        },
        { onConflict: 'organization_id,profile_id' },
      )
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Trainer;
  }

  // --- schedule ---------------------------------------------------------
  private async decorateClasses(
    classes: GymClass[],
    profileId: string | null,
  ): Promise<ClassWithMeta[]> {
    if (classes.length === 0) return [];
    const ids = classes.map((c) => c.id);
    // The teaser comes from a security-definer function rather than a join:
    // members cannot read `class_workouts` at all until they hold a place, and
    // the function only ever returns the shape of the session, never its
    // movements. One call covers the whole range.
    const starts = classes.map((c) => new Date(c.starts_at).getTime());
    const [{ data: bookings }, { data: trainers }, { data: teasers }] = await Promise.all([
      this.supabase.from('bookings').select('*').in('class_id', ids),
      this.supabase.from('trainers').select('id, display_name').eq('organization_id', this.organizationId),
      this.supabase.rpc('class_workout_teasers', {
        p_from: new Date(Math.min(...starts)).toISOString(),
        p_to: new Date(Math.max(...starts) + 1000).toISOString(),
      }),
    ]);
    const teaserMap = new Map(
      ((teasers ?? []) as (WorkoutTeaser & { class_id: string })[]).map((row) => [
        row.class_id,
        {
          category: row.category,
          format: row.format,
          duration_minutes: row.duration_minutes,
          difficulty: row.difficulty,
        },
      ]),
    );
    const trainerMap = new Map(
      ((trainers ?? []) as { id: string; display_name: string }[]).map((t) => [t.id, t.display_name]),
    );
    const rows = (bookings ?? []) as Booking[];
    return classes.map((gymClass) => {
      const classBookings = rows.filter((b) => b.class_id === gymClass.id);
      return {
        ...gymClass,
        trainer_name: gymClass.trainer_id ? trainerMap.get(gymClass.trainer_id) ?? null : null,
        confirmed_count: countConfirmed(classBookings),
        waitlist_count: countWaitlisted(classBookings),
        spots_left: spotsLeft(gymClass.capacity, classBookings),
        my_booking:
          profileId != null
            ? classBookings.find((b) => b.profile_id === profileId && isActiveBooking(b)) ?? null
            : null,
        workout_teaser: teaserMap.get(gymClass.id) ?? null,
      };
    });
  }

  async listClasses(input: {
    fromIso: string;
    toIso: string;
    profileId: string | null;
    includeUnpublished?: boolean;
  }): Promise<ClassWithMeta[]> {
    let query = this.supabase
      .from('classes')
      .select('*')
      .eq('organization_id', this.organizationId)
      .gte('starts_at', input.fromIso)
      .lt('starts_at', input.toIso)
      .order('starts_at');
    if (!input.includeUnpublished) query = query.eq('published', true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return this.decorateClasses((data ?? []) as GymClass[], input.profileId);
  }

  async getClass(classId: string, profileId: string | null): Promise<ClassWithMeta | null> {
    const { data } = await this.supabase.from('classes').select('*').eq('id', classId).maybeSingle();
    if (!data) return null;
    const [decorated] = await this.decorateClasses([data as GymClass], profileId);
    return decorated ?? null;
  }

  async createClass(input: Partial<GymClass>): Promise<GymClass> {
    const { data, error } = await this.supabase
      .from('classes')
      .insert({ ...input, id: undefined, organization_id: this.organizationId })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as GymClass;
  }

  async updateClass(classId: string, patch: Partial<GymClass>): Promise<GymClass> {
    const before = await this.supabase
      .from('classes')
      .select('starts_at, status, title')
      .eq('id', classId)
      .maybeSingle();

    const { data, error } = await this.supabase
      .from('classes')
      .update(patch)
      .eq('id', classId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const gymClass = data as GymClass;

    const { data: affected } = await this.supabase
      .from('bookings')
      .select('profile_id, status')
      .eq('class_id', classId)
      .in('status', ['confirmed', 'waitlisted']);

    if (patch.starts_at && before.data && patch.starts_at !== before.data.starts_at) {
      for (const booking of (affected ?? []) as Booking[]) {
        await this.createNotification({
          profile_id: booking.profile_id,
          type: 'class_time_changed',
          title: 'שינוי בשעת השיעור',
          body: `${gymClass.title} עבר לשעה ${formatTime(gymClass.starts_at)}.`,
          link: `/classes/${classId}`,
        });
      }
    }

    if (patch.status === 'cancelled' && before.data?.status !== 'cancelled') {
      await this.supabase
        .from('bookings')
        .update({ status: 'cancelled', waitlist_position: null, cancelled_at: new Date().toISOString() })
        .eq('class_id', classId)
        .in('status', ['confirmed', 'waitlisted']);
      for (const booking of (affected ?? []) as Booking[]) {
        await this.createNotification({
          profile_id: booking.profile_id,
          type: 'class_cancelled',
          title: 'השיעור בוטל',
          body: `${gymClass.title} בתאריך ${format(toGymTime(gymClass.starts_at), 'dd.MM')} בוטל.`,
          link: '/bookings',
        });
      }
    }
    return gymClass;
  }

  async deleteClass(classId: string): Promise<void> {
    const { error } = await this.supabase.from('classes').delete().eq('id', classId);
    if (error) throw new Error(error.message);
  }

  async duplicateClass(classId: string, newStartIso: string): Promise<GymClass> {
    const { data } = await this.supabase.from('classes').select('*').eq('id', classId).maybeSingle();
    if (!data) throw new Error('class_not_found');
    const source = data as GymClass;
    const duration = new Date(source.ends_at).getTime() - new Date(source.starts_at).getTime();
    const {
      id: _id,
      created_at: _created,
      updated_at: _updated,
      ...rest
    } = source;
    return this.createClass({
      ...rest,
      series_id: null,
      starts_at: newStartIso,
      ends_at: new Date(new Date(newStartIso).getTime() + duration).toISOString(),
      registration_closed: false,
      status: 'scheduled',
    });
  }

  async listSeries(): Promise<ClassSeries[]> {
    const { data, error } = await this.supabase
      .from('class_series')
      .select('*')
      .eq('organization_id', this.organizationId)
      .eq('active', true)
      .order('title');
    if (error) throw new Error(error.message);
    return (data ?? []) as ClassSeries[];
  }

  async createSeries(
    input: Omit<ClassSeries, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
  ): Promise<{ series: ClassSeries; created: number }> {
    const { data, error } = await this.supabase
      .from('class_series')
      .insert({ ...input, organization_id: this.organizationId })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const series = data as ClassSeries;

    const occurrences: Record<string, unknown>[] = [];
    let cursor = toGymTime(fromGymTime(input.recurrence.start_date, '00:00'));
    const end = toGymTime(fromGymTime(input.recurrence.end_date, '23:59'));
    let guard = 0;
    while (cursor.getTime() <= end.getTime() && guard < 400) {
      guard += 1;
      if (input.recurrence.weekdays.includes(cursor.getDay())) {
        const startsAt = fromGymTime(format(cursor, 'yyyy-MM-dd'), input.recurrence.start_time);
        occurrences.push({
          organization_id: this.organizationId,
          series_id: series.id,
          title: series.title,
          description: series.description,
          category: series.category,
          difficulty: series.difficulty,
          trainer_id: series.trainer_id,
          location: series.location,
          capacity: series.capacity,
          equipment: series.equipment,
          starts_at: startsAt.toISOString(),
          ends_at: new Date(startsAt.getTime() + series.duration_minutes * 60_000).toISOString(),
          published: true,
        });
      }
      cursor = addDays(cursor, 1);
    }
    if (occurrences.length > 0) {
      const { error: insertError } = await this.supabase.from('classes').insert(occurrences);
      if (insertError) throw new Error(insertError.message);
    }
    return { series, created: occurrences.length };
  }

  async updateSeries(
    seriesId: string,
    patch: Partial<ClassSeries>,
    scope: 'one' | 'all',
    classId?: string,
  ): Promise<void> {
    const classPatch: Partial<GymClass> = {};
    (['title', 'description', 'category', 'difficulty', 'trainer_id', 'location', 'capacity', 'equipment'] as const).forEach(
      (key) => {
        if (patch[key] !== undefined) {
          (classPatch as Record<string, unknown>)[key] = patch[key];
        }
      },
    );

    if (scope === 'one') {
      if (!classId) throw new Error('class_id_required');
      await this.updateClass(classId, classPatch);
      return;
    }

    const { error } = await this.supabase.from('class_series').update(patch).eq('id', seriesId);
    if (error) throw new Error(error.message);

    const { data: future } = await this.supabase
      .from('classes')
      .select('id, starts_at')
      .eq('series_id', seriesId)
      .gte('starts_at', new Date().toISOString());

    const duration = patch.duration_minutes;
    for (const row of (future ?? []) as { id: string; starts_at: string }[]) {
      const updates: Partial<GymClass> = { ...classPatch };
      if (patch.recurrence?.start_time) {
        const startsAt = fromGymTime(dayKey(row.starts_at), patch.recurrence.start_time);
        updates.starts_at = startsAt.toISOString();
        if (duration) updates.ends_at = new Date(startsAt.getTime() + duration * 60_000).toISOString();
      } else if (duration) {
        updates.ends_at = new Date(
          new Date(row.starts_at).getTime() + duration * 60_000,
        ).toISOString();
      }
      await this.updateClass(row.id, updates);
    }
  }

  async deleteSeries(seriesId: string): Promise<void> {
    await this.supabase.from('class_series').update({ active: false }).eq('id', seriesId);
    await this.supabase
      .from('classes')
      .delete()
      .eq('series_id', seriesId)
      .gte('starts_at', new Date().toISOString());
  }

  // --- bookings ---------------------------------------------------------
  async bookClass(classId: string, _profileId: string): Promise<BookingOutcome> {
    const { data, error } = await this.supabase.rpc('book_class', { p_class_id: classId });
    if (error) throw new Error(error.message);
    const result = data as BookingOutcome;
    if (result.ok) {
      const gymClass = await this.getClass(classId, null);
      await this.createNotification({
        profile_id: _profileId,
        type: 'booking_confirmed',
        title: result.status === 'confirmed' ? 'הרישום אושר' : 'נוספת לרשימת ההמתנה',
        body: gymClass ? `${gymClass.title} · ${formatTime(gymClass.starts_at)}` : '',
        link: `/classes/${classId}`,
      });
    }
    return result;
  }

  async cancelBooking(classId: string, profileId: string): Promise<CancelOutcome> {
    const { data, error } = await this.supabase.rpc('cancel_booking', {
      p_class_id: classId,
      p_profile_id: profileId,
    });
    if (error) throw new Error(error.message);
    const result = data as { ok: boolean; code?: string; promoted_profile_id?: string | null };
    if (!result.ok) return { ok: false, code: result.code as never };
    return { ok: true, promotedProfileId: result.promoted_profile_id ?? null };
  }

  async listMyBookings(profileId: string): Promise<{ booking: Booking; gymClass: GymClass }[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*, gymClass:classes(*)')
      .eq('profile_id', profileId);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row: Record<string, unknown>) => {
        const { gymClass, ...booking } = row as { gymClass: GymClass };
        return { gymClass, booking: booking as unknown as Booking };
      })
      .filter((row) => Boolean(row.gymClass))
      .sort(
        (a, b) =>
          new Date(b.gymClass.starts_at).getTime() - new Date(a.gymClass.starts_at).getTime(),
      );
  }

  async listClassBookings(classId: string): Promise<{ booking: Booking; profile: Profile }[]> {
    const { data, error } = await this.supabase
      .from('bookings')
      .select('*, profile:profiles(*)')
      .eq('class_id', classId)
      .neq('status', 'cancelled');
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row: Record<string, unknown>) => {
        const { profile, ...booking } = row as { profile: Profile };
        return { profile, booking: booking as unknown as Booking };
      })
      .filter((row) => Boolean(row.profile))
      .sort((a, b) => {
        const rank = (s: BookingStatus) => (s === 'waitlisted' ? 1 : 0);
        if (rank(a.booking.status) !== rank(b.booking.status))
          return rank(a.booking.status) - rank(b.booking.status);
        return (a.booking.waitlist_position ?? 0) - (b.booking.waitlist_position ?? 0);
      });
  }

  async setBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const { data, error } = await this.supabase.rpc('set_booking_status', {
      p_booking_id: bookingId,
      p_status: status,
    });
    if (error) throw new Error(error.message);
    const result = data as { ok: boolean; code?: string };
    if (!result.ok) throw new Error(result.code ?? 'set_booking_status_failed');
  }

  async markAttendance(
    classId: string,
    profileId: string,
    present: boolean,
    markedBy: string,
    method: Attendance['method'] = 'manual',
  ): Promise<void> {
    const { error } = await this.supabase.from('attendance').upsert(
      {
        organization_id: this.organizationId,
        class_id: classId,
        profile_id: profileId,
        present,
        checked_in_at: present ? new Date().toISOString() : null,
        marked_by: markedBy,
        method,
      },
      { onConflict: 'class_id,profile_id' },
    );
    if (error) throw new Error(error.message);
    await this.supabase
      .from('bookings')
      .update({ status: present ? 'attended' : 'absent' })
      .eq('class_id', classId)
      .eq('profile_id', profileId)
      .neq('status', 'cancelled');
  }

  async listAttendance(profileId: string): Promise<Attendance[]> {
    const { data, error } = await this.supabase
      .from('attendance')
      .select('*')
      .eq('profile_id', profileId);
    if (error) throw new Error(error.message);
    return (data ?? []) as Attendance[];
  }

  // --- invitations ------------------------------------------------------
  async listInvites(): Promise<InviteLink[]> {
    const { data, error } = await this.supabase
      .from('invite_links')
      .select('*')
      .eq('organization_id', this.organizationId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as InviteLink[];
  }

  async createInvite(input: {
    label: string;
    expires_at: string | null;
    max_uses: number | null;
    created_by: string;
  }): Promise<InviteLink> {
    const { data, error } = await this.supabase
      .from('invite_links')
      .insert({
        organization_id: this.organizationId,
        token: `glow-${Math.random().toString(36).slice(2, 10)}`,
        label: input.label,
        created_by: input.created_by,
        expires_at: input.expires_at,
        max_uses: input.max_uses,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as InviteLink;
  }

  async revokeInvite(inviteId: string): Promise<void> {
    const { error } = await this.supabase
      .from('invite_links')
      .update({ revoked: true })
      .eq('id', inviteId);
    if (error) throw new Error(error.message);
  }

  async getInviteByToken(token: string): Promise<InviteLink | null> {
    const { data } = await this.supabase
      .from('invite_links')
      .select('*')
      .eq('token', token)
      .maybeSingle();
    return (data as InviteLink | null) ?? null;
  }

  async consumeInvite(token: string): Promise<void> {
    const invite = await this.getInviteByToken(token);
    if (!invite) return;
    await this.supabase
      .from('invite_links')
      .update({ uses: invite.uses + 1 })
      .eq('id', invite.id);
  }

  // --- exercises & templates -------------------------------------------
  async listExercises(includeArchived = false): Promise<Exercise[]> {
    let query = this.supabase
      .from('exercises')
      .select('*')
      .eq('organization_id', this.organizationId)
      .order('name_he');
    if (!includeArchived) query = query.eq('archived', false);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Exercise[];
  }

  async createExercise(input: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await this.supabase
      .from('exercises')
      .insert({ ...input, id: undefined, organization_id: this.organizationId })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Exercise;
  }

  async updateExercise(id: string, patch: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await this.supabase
      .from('exercises')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as Exercise;
  }

  async listTemplates(includeArchived = false): Promise<WorkoutTemplate[]> {
    let query = this.supabase
      .from('workout_templates')
      .select('*')
      .eq('organization_id', this.organizationId)
      .order('title');
    if (!includeArchived) query = query.eq('archived', false);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as WorkoutTemplate[];
  }

  async getTemplate(id: string): Promise<TemplateWithExercises | null> {
    const { data } = await this.supabase
      .from('workout_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (!data) return null;
    const { data: items } = await this.supabase
      .from('workout_template_exercises')
      .select('*, exercise:exercises(*)')
      .eq('template_id', id)
      .order('position');
    return {
      ...(data as WorkoutTemplate),
      items: ((items ?? []) as (WorkoutTemplateExercise & { exercise: Exercise | null })[]),
    };
  }

  async createTemplate(input: {
    template: Partial<WorkoutTemplate>;
    items: Partial<WorkoutTemplateExercise>[];
  }): Promise<WorkoutTemplate> {
    const { data, error } = await this.supabase
      .from('workout_templates')
      .insert({ ...input.template, id: undefined, organization_id: this.organizationId })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const template = data as WorkoutTemplate;
    await this.writeTemplateItems(template.id, input.items);
    return template;
  }

  private async writeTemplateItems(
    templateId: string,
    items: Partial<WorkoutTemplateExercise>[],
  ): Promise<void> {
    await this.supabase.from('workout_template_exercises').delete().eq('template_id', templateId);
    const rows = items
      .filter((item) => item.exercise_id)
      .map((item, index) => ({
        template_id: templateId,
        exercise_id: item.exercise_id,
        block: item.block ?? 'main',
        position: item.position ?? index + 1,
        sets: item.sets ?? null,
        reps: item.reps ?? null,
        load_kg: item.load_kg ?? null,
        duration_seconds: item.duration_seconds ?? null,
        distance_meters: item.distance_meters ?? null,
        rest_seconds: item.rest_seconds ?? null,
        trainer_notes: item.trainer_notes ?? null,
        alternative_exercise_ids: item.alternative_exercise_ids ?? [],
      }));
    if (rows.length > 0) {
      const { error } = await this.supabase.from('workout_template_exercises').insert(rows);
      if (error) throw new Error(error.message);
    }
  }

  async updateTemplate(
    id: string,
    input: { template: Partial<WorkoutTemplate>; items?: Partial<WorkoutTemplateExercise>[] },
  ): Promise<WorkoutTemplate> {
    const { data, error } = await this.supabase
      .from('workout_templates')
      .update(input.template)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    if (input.items) await this.writeTemplateItems(id, input.items);
    return data as WorkoutTemplate;
  }

  // --- workout sessions -------------------------------------------------
  async getActiveSession(profileId: string): Promise<WorkoutSession | null> {
    const { data } = await this.supabase
      .from('workout_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'active')
      .maybeSingle();
    return (data as WorkoutSession | null) ?? null;
  }

  async startSession(input: {
    profileId: string;
    templateId: string | null;
    title: string;
    goal: WorkoutSession['goal'];
    exercises: WorkoutSessionExercise[];
  }): Promise<WorkoutSession> {
    await this.supabase
      .from('workout_sessions')
      .update({ status: 'abandoned' })
      .eq('profile_id', input.profileId)
      .eq('status', 'active');

    const { data, error } = await this.supabase
      .from('workout_sessions')
      .insert({
        organization_id: this.organizationId,
        profile_id: input.profileId,
        template_id: input.templateId,
        title: input.title,
        goal: input.goal,
        status: 'active',
        exercises: input.exercises,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as WorkoutSession;
  }

  async updateSession(sessionId: string, patch: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const { data, error } = await this.supabase
      .from('workout_sessions')
      .update(patch)
      .eq('id', sessionId)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as WorkoutSession;
  }

  async getSession(sessionId: string): Promise<WorkoutSession | null> {
    const { data } = await this.supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();
    return (data as WorkoutSession | null) ?? null;
  }

  async listSessions(profileId: string, limit = 50): Promise<WorkoutSession[]> {
    const { data, error } = await this.supabase
      .from('workout_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .order('started_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as WorkoutSession[];
  }

  async listSets(profileId: string): Promise<WorkoutSet[]> {
    const { data, error } = await this.supabase
      .from('workout_sets')
      .select('*, session:workout_sessions!inner(profile_id)')
      .eq('session.profile_id', profileId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as (WorkoutSet & { session?: unknown })[]).map(({ session: _s, ...set }) => set);
  }

  async listSessionSets(sessionId: string): Promise<WorkoutSet[]> {
    const { data, error } = await this.supabase
      .from('workout_sets')
      .select('*')
      .eq('session_id', sessionId)
      .order('position')
      .order('set_index');
    if (error) throw new Error(error.message);
    return (data ?? []) as WorkoutSet[];
  }

  async addSet(input: Omit<WorkoutSet, 'id' | 'created_at'>): Promise<WorkoutSet> {
    const { data, error } = await this.supabase
      .from('workout_sets')
      .insert(input)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as WorkoutSet;
  }

  async deleteSet(setId: string): Promise<void> {
    const { error } = await this.supabase.from('workout_sets').delete().eq('id', setId);
    if (error) throw new Error(error.message);
  }

  async finishSession(sessionId: string, input: { notes: string | null }): Promise<WorkoutSession> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('session_not_found');
    const sets = await this.listSessionSets(sessionId);
    const efforts = sets.map((s) => s.effort).filter((e): e is number => e !== null);
    return this.updateSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_seconds: Math.max(
        60,
        Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000),
      ),
      average_effort:
        efforts.length > 0
          ? Math.round((efforts.reduce((a, b) => a + b, 0) / efforts.length) * 10) / 10
          : null,
      notes: input.notes,
    });
  }

  // --- readiness --------------------------------------------------------
  async getReadiness(profileId: string, dateKeyValue: string): Promise<ReadinessLog | null> {
    const { data } = await this.supabase
      .from('readiness_logs')
      .select('*')
      .eq('profile_id', profileId)
      .eq('log_date', dateKeyValue)
      .maybeSingle();
    return (data as ReadinessLog | null) ?? null;
  }

  async listReadiness(profileId: string, limit = 30): Promise<ReadinessLog[]> {
    const { data, error } = await this.supabase
      .from('readiness_logs')
      .select('*')
      .eq('profile_id', profileId)
      .order('log_date', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as ReadinessLog[];
  }

  async upsertReadiness(
    input: Omit<ReadinessLog, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
  ): Promise<ReadinessLog> {
    const { data, error } = await this.supabase
      .from('readiness_logs')
      .upsert({ ...input, organization_id: this.organizationId }, { onConflict: 'profile_id,log_date' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as ReadinessLog;
  }

  // --- timer presets ----------------------------------------------------
  async listTimerPresets(profileId: string): Promise<TimerPreset[]> {
    const { data, error } = await this.supabase
      .from('timer_presets')
      .select('*')
      .eq('organization_id', this.organizationId)
      .or(`is_public.eq.true,profile_id.eq.${profileId}`)
      .order('is_public', { ascending: false })
      .order('name');
    if (error) throw new Error(error.message);
    return (data ?? []) as TimerPreset[];
  }

  async createTimerPreset(
    input: Partial<TimerPreset> & { profile_id: string | null; name: string },
  ): Promise<TimerPreset> {
    const { data, error } = await this.supabase
      .from('timer_presets')
      .insert({ ...input, id: undefined, organization_id: this.organizationId })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as TimerPreset;
  }

  async updateTimerPreset(id: string, patch: Partial<TimerPreset>): Promise<TimerPreset> {
    const { data, error } = await this.supabase
      .from('timer_presets')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as TimerPreset;
  }

  async deleteTimerPreset(id: string): Promise<void> {
    const { error } = await this.supabase.from('timer_presets').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // --- notifications ----------------------------------------------------
  async listNotifications(profileId: string): Promise<AppNotification[]> {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as AppNotification[];
  }

  async createNotification(
    input: Omit<
      AppNotification,
      'id' | 'organization_id' | 'created_at' | 'read_at' | 'delivery_status' | 'delivery_error'
    >,
  ): Promise<AppNotification> {
    const prefs = await this.getNotificationPreferences(input.profile_id);
    if (prefs[input.type] === false) {
      return {
        ...input,
        id: '',
        organization_id: this.organizationId,
        read_at: new Date().toISOString(),
        delivery_status: 'skipped_no_provider',
        delivery_error: 'muted_by_preference',
        created_at: new Date().toISOString(),
      };
    }
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('email')
      .eq('id', input.profile_id)
      .maybeSingle();
    const { deliverEmail } = await import('@/lib/notifications/email');
    const delivery = await deliverEmail({
      to: (profile?.email as string) ?? '',
      subject: input.title,
      body: input.body,
      enabled: prefs.email_enabled,
    });

    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        ...input,
        organization_id: this.organizationId,
        delivery_status: delivery.status,
        delivery_error: delivery.error,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as AppNotification;
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
  }

  async markAllNotificationsRead(profileId: string): Promise<void> {
    await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('profile_id', profileId)
      .is('read_at', null);
  }

  async getNotificationPreferences(profileId: string): Promise<NotificationPreferences> {
    const { data } = await this.supabase
      .from('app_settings')
      .select('value')
      .eq('organization_id', this.organizationId)
      .eq('profile_id', profileId)
      .eq('key', 'notification_preferences')
      .maybeSingle();
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...((data?.value as Partial<NotificationPreferences>) ?? {}),
    };
  }

  async setNotificationPreferences(
    profileId: string,
    prefs: NotificationPreferences,
  ): Promise<void> {
    const { error } = await this.supabase.from('app_settings').upsert(
      {
        organization_id: this.organizationId,
        profile_id: profileId,
        key: 'notification_preferences',
        value: prefs,
      },
      { onConflict: 'organization_id,profile_id,key' },
    );
    if (error) throw new Error(error.message);
  }

  async broadcastAnnouncement(input: {
    title: string;
    body: string;
    authorId: string;
  }): Promise<number> {
    const { data } = await this.supabase
      .from('memberships')
      .select('profile_id')
      .eq('organization_id', this.organizationId)
      .eq('status', 'active');
    const recipients = ((data ?? []) as { profile_id: string }[]).filter(
      (m) => m.profile_id !== input.authorId,
    );
    for (const member of recipients) {
      await this.createNotification({
        profile_id: member.profile_id,
        type: 'announcement',
        title: input.title,
        body: input.body,
        link: null,
      });
    }
    return recipients.length;
  }

  // --- analytics --------------------------------------------------------
  // --- workout library --------------------------------------------------

  async listWorkouts(filters?: {
    category?: WorkoutCategory | null;
    search?: string | null;
    includeArchived?: boolean;
  }): Promise<Workout[]> {
    let query = this.supabase
      .from('workouts')
      .select('*')
      .eq('organization_id', this.organizationId)
      .order('title');
    if (!filters?.includeArchived) query = query.eq('archived', false);
    if (filters?.category) query = query.eq('category', filters.category);

    const needle = filters?.search?.trim();
    if (needle) {
      const escaped = needle.replace(/[%,()]/g, ' ');
      query = query.or(
        `title.ilike.%${escaped}%,subtitle.ilike.%${escaped}%,description.ilike.%${escaped}%`,
      );
    }
    const { data, error } = await query;
    if (isMissingWorkoutSchema(error)) return [];
    if (error) throw new Error(error.message);
    return (data ?? []) as Workout[];
  }

  async getWorkout(idOrSlug: string): Promise<Workout | null> {
    const column = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug)
      ? 'id'
      : 'slug';
    const { data, error } = await this.supabase
      .from('workouts')
      .select('*')
      .eq('organization_id', this.organizationId)
      .eq(column, idOrSlug)
      .maybeSingle();
    if (isMissingWorkoutSchema(error)) return null;
    if (error) throw new Error(error.message);
    return (data as Workout) ?? null;
  }

  /**
   * The gate here is the RLS policy on `class_workouts`, not this code: an
   * unbooked member gets no row back, full stop. The teaser is then fetched
   * through a security-definer function that only ever returns the shape of the
   * session - never its movements.
   */
  async getClassWorkout(classId: string, _profileId: string | null): Promise<WorkoutReveal> {
    const { data: link, error } = await this.supabase
      .from('class_workouts')
      .select('workout_id, notes, workouts(*)')
      .eq('class_id', classId)
      .maybeSingle();
    if (isMissingWorkoutSchema(error)) return { state: 'none' };
    if (error && error.code !== 'PGRST116') throw new Error(error.message);

    const workout = (link as { workouts?: Workout } | null)?.workouts;
    if (workout) {
      return {
        state: 'revealed',
        workout,
        notes: (link as { notes: string | null }).notes,
      };
    }
    return this.classWorkoutTeaser(classId);
  }

  private async classWorkoutTeaser(classId: string): Promise<WorkoutReveal> {
    // A wide window, narrowed by class id: the function is keyed on the class
    // row, and a class always sits inside its own year.
    const { data, error } = await this.supabase.rpc('class_workout_teasers', {
      p_from: '1970-01-01T00:00:00Z',
      p_to: '2999-01-01T00:00:00Z',
    });
    if (isMissingWorkoutSchema(error)) return { state: 'none' };
    if (error) throw new Error(error.message);

    const teaser = ((data ?? []) as {
      class_id: string;
      category: WorkoutCategory;
      format: Workout['format'];
      duration_minutes: number;
      difficulty: Workout['difficulty'];
    }[]).find((row) => row.class_id === classId);

    if (!teaser) return { state: 'none' };
    return {
      state: 'locked',
      category: teaser.category,
      format: teaser.format,
      duration_minutes: teaser.duration_minutes,
      difficulty: teaser.difficulty,
    };
  }

  async setClassWorkout(
    classId: string,
    workoutId: string | null,
    input: { notes: string | null; assignedBy: string },
  ): Promise<void> {
    if (!workoutId) {
      const { error } = await this.supabase
        .from('class_workouts')
        .delete()
        .eq('class_id', classId);
      if (error) throw new Error(error.message);
      return;
    }
    const { error } = await this.supabase.from('class_workouts').upsert(
      {
        class_id: classId,
        organization_id: this.organizationId,
        workout_id: workoutId,
        notes: input.notes,
        assigned_by: input.assignedBy,
      },
      { onConflict: 'class_id' },
    );
    if (error) throw new Error(error.message);
  }

  // --- workout results ---------------------------------------------------

  async logWorkoutResult(input: {
    profileId: string;
    workoutId: string;
    classId: string | null;
    performedOn: string;
    scoreType: WorkoutLog['score_type'];
    resultSeconds: number | null;
    resultRounds: number | null;
    resultReps: number | null;
    resultWeightKg: number | null;
    completed: boolean | null;
    rx: boolean;
    rpe: number | null;
    notes: string | null;
  }): Promise<WorkoutLog> {
    const { data, error } = await this.supabase
      .from('workout_logs')
      .upsert(
        {
          organization_id: this.organizationId,
          profile_id: input.profileId,
          workout_id: input.workoutId,
          class_id: input.classId,
          performed_on: input.performedOn,
          score_type: input.scoreType,
          result_seconds: input.resultSeconds,
          result_rounds: input.resultRounds,
          result_reps: input.resultReps,
          result_weight_kg: input.resultWeightKg,
          completed: input.completed,
          rx: input.rx,
          rpe: input.rpe,
          notes: input.notes,
        },
        { onConflict: 'profile_id,workout_id,performed_on' },
      )
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as WorkoutLog;
  }

  async listWorkoutLogs(profileId: string, limit = 50): Promise<WorkoutLogWithWorkout[]> {
    const { data, error } = await this.supabase
      .from('workout_logs')
      .select('*, workouts(*)')
      .eq('profile_id', profileId)
      .order('performed_on', { ascending: false })
      .limit(limit);
    if (isMissingWorkoutSchema(error)) return [];
    if (error) throw new Error(error.message);

    return ((data ?? []) as (WorkoutLog & { workouts: Workout | null })[]).flatMap((row) => {
      const { workouts, ...log } = row;
      return workouts ? [{ log: log as WorkoutLog, workout: workouts }] : [];
    });
  }

  async listWorkoutHistory(profileId: string, workoutId: string): Promise<WorkoutLog[]> {
    const { data, error } = await this.supabase
      .from('workout_logs')
      .select('*')
      .eq('profile_id', profileId)
      .eq('workout_id', workoutId)
      .order('performed_on', { ascending: false });
    if (isMissingWorkoutSchema(error)) return [];
    if (error) throw new Error(error.message);
    return (data ?? []) as WorkoutLog[];
  }

  async getWorkoutLog(
    profileId: string,
    workoutId: string,
    performedOn: string,
  ): Promise<WorkoutLog | null> {
    const { data, error } = await this.supabase
      .from('workout_logs')
      .select('*')
      .eq('profile_id', profileId)
      .eq('workout_id', workoutId)
      .eq('performed_on', performedOn)
      .maybeSingle();
    if (isMissingWorkoutSchema(error)) return null;
    if (error) throw new Error(error.message);
    return (data as WorkoutLog) ?? null;
  }

  async deleteWorkoutLog(logId: string, profileId: string): Promise<void> {
    const { error } = await this.supabase
      .from('workout_logs')
      .delete()
      .eq('id', logId)
      .eq('profile_id', profileId);
    if (error) throw new Error(error.message);
  }

  async getAdminStats(fromIso: string, toIso: string): Promise<AdminStats> {
    const { data: classes } = await this.supabase
      .from('classes')
      .select('id, title, capacity, starts_at')
      .eq('organization_id', this.organizationId)
      .eq('status', 'scheduled')
      .gte('starts_at', fromIso)
      .lt('starts_at', toIso);

    const classRows = (classes ?? []) as Pick<GymClass, 'id' | 'title' | 'capacity' | 'starts_at'>[];
    if (classRows.length === 0) {
      return {
        occupancyRate: 0,
        attendanceRate: 0,
        waitlistDemand: 0,
        totalClasses: 0,
        totalBookings: 0,
        popularTimes: [],
        popularClasses: [],
        weeklyTrend: [],
      };
    }

    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('class_id, status')
      .in('class_id', classRows.map((c) => c.id));
    const bookingRows = (bookings ?? []) as Pick<Booking, 'class_id' | 'status'>[];

    const capacity = classRows.reduce((sum, c) => sum + c.capacity, 0);
    const confirmed = bookingRows.filter((b) =>
      ['confirmed', 'attended', 'absent'].includes(b.status),
    ).length;
    const attended = bookingRows.filter((b) => b.status === 'attended').length;
    const completed = bookingRows.filter((b) => ['attended', 'absent'].includes(b.status)).length;
    const waitlisted = bookingRows.filter((b) => b.status === 'waitlisted').length;

    const byTime = new Map<string, number>();
    const byTitle = new Map<string, number>();
    const byDay = new Map<string, { bookings: number; capacity: number }>();

    for (const gymClass of classRows) {
      const count = bookingRows.filter(
        (b) => b.class_id === gymClass.id && b.status !== 'cancelled',
      ).length;
      const time = formatTime(gymClass.starts_at);
      byTime.set(time, (byTime.get(time) ?? 0) + count);
      byTitle.set(gymClass.title, (byTitle.get(gymClass.title) ?? 0) + count);
      const key = dayKey(gymClass.starts_at);
      const entry = byDay.get(key) ?? { bookings: 0, capacity: 0 };
      entry.capacity += gymClass.capacity;
      entry.bookings += bookingRows.filter(
        (b) =>
          b.class_id === gymClass.id && ['confirmed', 'attended', 'absent'].includes(b.status),
      ).length;
      byDay.set(key, entry);
    }

    return {
      occupancyRate: capacity === 0 ? 0 : Math.round((confirmed / capacity) * 100),
      attendanceRate: completed === 0 ? 0 : Math.round((attended / completed) * 100),
      waitlistDemand: waitlisted,
      totalClasses: classRows.length,
      totalBookings: confirmed,
      popularTimes: [...byTime.entries()]
        .map(([time, count]) => ({ time, bookings: count }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5),
      popularClasses: [...byTitle.entries()]
        .map(([title, count]) => ({ title, bookings: count }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5),
      weeklyTrend: [...byDay.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => ({
          label: format(parseISO(key), 'dd.MM'),
          bookings: value.bookings,
          capacity: value.capacity,
        })),
    };
  }
}
