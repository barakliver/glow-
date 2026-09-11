/**
 * Demo adapter: a complete, working implementation of the Repository contract
 * backed by the in-memory store. Used when Supabase credentials are absent, in
 * local preview and in the e2e suite.
 *
 * Booking / cancellation mutate the store under a synchronous critical section,
 * which mirrors the atomic PostgreSQL functions used in production.
 */
import { addDays, format, parseISO } from 'date-fns';
import {
  decideBooking,
  decideCancellation,
  countConfirmed,
  countWaitlisted,
  isActiveBooking,
  promoteFromWaitlist,
  spotsLeft,
  BOOKING_ERRORS,
} from '@/lib/domain/booking-rules';
import { detectNewRecords } from '@/lib/domain/progress';
import { dayKey, formatTime, fromGymTime, toGymTime } from '@/lib/time';
import { allowRate, db, newId, nowIso } from '@/lib/data/store';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type AdminStats,
  type BookingOutcome,
  type CancelOutcome,
  type Repository,
  type TemplateWithExercises,
} from '@/lib/data/repository';
import type {
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
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from '@/lib/domain/types';

function touch<T extends { updated_at: string }>(row: T): T {
  row.updated_at = nowIso();
  return row;
}

export class DemoRepository implements Repository {
  // --- identity ---------------------------------------------------------
  async getOrganization(): Promise<Organization> {
    return db().organization;
  }

  async updateOrganization(patch: Partial<Organization>): Promise<Organization> {
    const org = db().organization;
    Object.assign(org, patch);
    return touch(org);
  }

  async getSessionUser(profileId: string | null): Promise<SessionUser | null> {
    if (!profileId) return null;
    const database = db();
    const profile = database.profiles.find((p) => p.id === profileId);
    const membership = database.memberships.find((m) => m.profile_id === profileId);
    if (!profile || !membership || membership.status !== 'active') return null;
    return {
      profile,
      membership,
      organization: database.organization,
      trainer: database.trainers.find((t) => t.profile_id === profileId) ?? null,
    };
  }

  async updateProfile(profileId: string, patch: Partial<Profile>): Promise<Profile> {
    const profile = db().profiles.find((p) => p.id === profileId);
    if (!profile) throw new Error('profile_not_found');
    Object.assign(profile, patch);
    return touch(profile);
  }

  async listMembers(): Promise<{ profile: Profile; membership: Membership }[]> {
    const database = db();
    return database.memberships
      .map((membership) => ({
        membership,
        profile: database.profiles.find((p) => p.id === membership.profile_id)!,
      }))
      .filter((row) => Boolean(row.profile))
      .sort((a, b) => a.profile.full_name.localeCompare(b.profile.full_name, 'he'));
  }

  async setMemberRole(profileId: string, role: Membership['role']): Promise<void> {
    const membership = db().memberships.find((m) => m.profile_id === profileId);
    if (!membership) throw new Error('membership_not_found');
    membership.role = role;
    touch(membership);
    if (role === 'trainer' && !db().trainers.some((t) => t.profile_id === profileId)) {
      const profile = db().profiles.find((p) => p.id === profileId);
      await this.upsertTrainer({ profile_id: profileId, display_name: profile?.full_name ?? 'מאמן' });
    }
  }

  async setMemberStatus(profileId: string, status: Membership['status']): Promise<void> {
    const membership = db().memberships.find((m) => m.profile_id === profileId);
    if (!membership) throw new Error('membership_not_found');
    membership.status = status;
    touch(membership);
  }

  async ensureProfile(input: {
    id?: string;
    email: string;
    full_name: string;
    phone?: string | null;
  }): Promise<Profile> {
    const database = db();
    const existing = database.profiles.find(
      (p) => p.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (existing) {
      if (input.full_name) existing.full_name = input.full_name;
      if (input.phone !== undefined) existing.phone = input.phone ?? existing.phone;
      return touch(existing);
    }
    const profile: Profile = {
      id: input.id ?? newId(),
      email: input.email,
      full_name: input.full_name,
      phone: input.phone ?? null,
      avatar_url: null,
      experience_level: 'beginner',
      onboarding_completed: Boolean(input.full_name && input.phone),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.profiles.push(profile);
    database.memberships.push({
      id: newId(),
      organization_id: database.organization.id,
      profile_id: profile.id,
      role: 'member',
      status: 'active',
      joined_at: nowIso(),
      created_at: nowIso(),
      updated_at: nowIso(),
    });
    return profile;
  }

  // --- trainers ---------------------------------------------------------
  async listTrainers(): Promise<Trainer[]> {
    return db().trainers.filter((t) => t.active);
  }

  async upsertTrainer(input: Partial<Trainer> & { profile_id: string }): Promise<Trainer> {
    const database = db();
    const existing = database.trainers.find((t) => t.profile_id === input.profile_id);
    if (existing) {
      Object.assign(existing, input);
      return touch(existing);
    }
    const trainer: Trainer = {
      id: newId(),
      organization_id: database.organization.id,
      profile_id: input.profile_id,
      display_name: input.display_name ?? 'מאמן',
      bio: input.bio ?? null,
      specialties: input.specialties ?? [],
      active: input.active ?? true,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.trainers.push(trainer);
    return trainer;
  }

  // --- schedule ---------------------------------------------------------
  private decorate(gymClass: GymClass, profileId: string | null): ClassWithMeta {
    const database = db();
    const bookings = database.bookings.filter((b) => b.class_id === gymClass.id);
    const trainer = database.trainers.find((t) => t.id === gymClass.trainer_id);
    const mine =
      profileId != null
        ? bookings.find((b) => b.profile_id === profileId && isActiveBooking(b)) ?? null
        : null;
    return {
      ...gymClass,
      trainer_name: trainer?.display_name ?? null,
      confirmed_count: countConfirmed(bookings),
      waitlist_count: countWaitlisted(bookings),
      spots_left: spotsLeft(gymClass.capacity, bookings),
      my_booking: mine,
    };
  }

  async listClasses(input: {
    fromIso: string;
    toIso: string;
    profileId: string | null;
    includeUnpublished?: boolean;
  }): Promise<ClassWithMeta[]> {
    const from = new Date(input.fromIso).getTime();
    const to = new Date(input.toIso).getTime();
    return db()
      .classes.filter((c) => {
        const start = new Date(c.starts_at).getTime();
        if (start < from || start >= to) return false;
        if (!input.includeUnpublished && !c.published) return false;
        return true;
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .map((c) => this.decorate(c, input.profileId));
  }

  async getClass(classId: string, profileId: string | null): Promise<ClassWithMeta | null> {
    const gymClass = db().classes.find((c) => c.id === classId);
    return gymClass ? this.decorate(gymClass, profileId) : null;
  }

  async createClass(input: Partial<GymClass>): Promise<GymClass> {
    const database = db();
    const gymClass: GymClass = {
      id: newId(),
      organization_id: database.organization.id,
      series_id: input.series_id ?? null,
      title: input.title ?? 'שיעור',
      description: input.description ?? null,
      category: input.category ?? 'functional',
      difficulty: input.difficulty ?? 'beginner',
      trainer_id: input.trainer_id ?? null,
      location: input.location ?? 'אולם GLoW',
      capacity: input.capacity ?? 10,
      starts_at: input.starts_at ?? nowIso(),
      ends_at: input.ends_at ?? nowIso(),
      equipment: input.equipment ?? [],
      status: input.status ?? 'scheduled',
      published: input.published ?? true,
      registration_closed: input.registration_closed ?? false,
      notes: input.notes ?? null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.classes.push(gymClass);
    return gymClass;
  }

  async updateClass(classId: string, patch: Partial<GymClass>): Promise<GymClass> {
    const database = db();
    const gymClass = database.classes.find((c) => c.id === classId);
    if (!gymClass) throw new Error('class_not_found');
    const previousStart = gymClass.starts_at;
    const previousStatus = gymClass.status;
    Object.assign(gymClass, patch);
    touch(gymClass);

    const affected = database.bookings.filter(
      (b) => b.class_id === classId && isActiveBooking(b),
    );

    if (patch.starts_at && patch.starts_at !== previousStart) {
      for (const booking of affected) {
        await this.createNotification({
          profile_id: booking.profile_id,
          type: 'class_time_changed',
          title: 'שינוי בשעת השיעור',
          body: `${gymClass.title} עבר לשעה ${formatTime(gymClass.starts_at)}.`,
          link: `/classes/${gymClass.id}`,
        });
      }
    }
    if (patch.status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const booking of affected) {
        booking.status = 'cancelled';
        booking.cancelled_at = nowIso();
        booking.waitlist_position = null;
        touch(booking);
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
    const database = db();
    database.classes = database.classes.filter((c) => c.id !== classId);
    database.bookings = database.bookings.filter((b) => b.class_id !== classId);
    database.attendance = database.attendance.filter((a) => a.class_id !== classId);
  }

  async duplicateClass(classId: string, newStartIso: string): Promise<GymClass> {
    const source = db().classes.find((c) => c.id === classId);
    if (!source) throw new Error('class_not_found');
    const durationMs = new Date(source.ends_at).getTime() - new Date(source.starts_at).getTime();
    return this.createClass({
      ...source,
      series_id: null,
      starts_at: newStartIso,
      ends_at: new Date(new Date(newStartIso).getTime() + durationMs).toISOString(),
      registration_closed: false,
      status: 'scheduled',
    });
  }

  async listSeries(): Promise<ClassSeries[]> {
    return db().series.filter((s) => s.active);
  }

  async createSeries(
    input: Omit<ClassSeries, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
  ): Promise<{ series: ClassSeries; created: number }> {
    const database = db();
    const series: ClassSeries = {
      ...input,
      id: newId(),
      organization_id: database.organization.id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.series.push(series);

    let created = 0;
    let cursor = toGymTime(fromGymTime(input.recurrence.start_date, '00:00'));
    const endDate = toGymTime(fromGymTime(input.recurrence.end_date, '23:59'));

    // Cap generation so a bad range cannot explode the store.
    let guard = 0;
    while (cursor.getTime() <= endDate.getTime() && guard < 400) {
      guard += 1;
      if (input.recurrence.weekdays.includes(cursor.getDay())) {
        const dayStr = format(cursor, 'yyyy-MM-dd');
        const startsAt = fromGymTime(dayStr, input.recurrence.start_time);
        await this.createClass({
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
        created += 1;
      }
      cursor = addDays(cursor, 1);
    }
    return { series, created };
  }

  async updateSeries(
    seriesId: string,
    patch: Partial<ClassSeries>,
    scope: 'one' | 'all',
    classId?: string,
  ): Promise<void> {
    const database = db();
    const series = database.series.find((s) => s.id === seriesId);
    if (!series) throw new Error('series_not_found');

    const classPatch: Partial<GymClass> = {};
    if (patch.title !== undefined) classPatch.title = patch.title;
    if (patch.description !== undefined) classPatch.description = patch.description;
    if (patch.category !== undefined) classPatch.category = patch.category;
    if (patch.difficulty !== undefined) classPatch.difficulty = patch.difficulty;
    if (patch.trainer_id !== undefined) classPatch.trainer_id = patch.trainer_id;
    if (patch.location !== undefined) classPatch.location = patch.location;
    if (patch.capacity !== undefined) classPatch.capacity = patch.capacity;
    if (patch.equipment !== undefined) classPatch.equipment = patch.equipment;

    if (scope === 'one') {
      if (!classId) throw new Error('class_id_required');
      await this.updateClass(classId, classPatch);
      return;
    }

    Object.assign(series, patch);
    touch(series);
    const future = database.classes.filter(
      (c) => c.series_id === seriesId && new Date(c.starts_at).getTime() >= Date.now(),
    );
    for (const gymClass of future) {
      const duration = patch.duration_minutes ?? series.duration_minutes;
      const updates: Partial<GymClass> = { ...classPatch };
      if (patch.recurrence?.start_time) {
        const startsAt = fromGymTime(dayKey(gymClass.starts_at), patch.recurrence.start_time);
        updates.starts_at = startsAt.toISOString();
        updates.ends_at = new Date(startsAt.getTime() + duration * 60_000).toISOString();
      } else if (patch.duration_minutes) {
        updates.ends_at = new Date(
          new Date(gymClass.starts_at).getTime() + duration * 60_000,
        ).toISOString();
      }
      await this.updateClass(gymClass.id, updates);
    }
  }

  async deleteSeries(seriesId: string): Promise<void> {
    const database = db();
    const series = database.series.find((s) => s.id === seriesId);
    if (series) {
      series.active = false;
      touch(series);
    }
    const future = database.classes.filter(
      (c) => c.series_id === seriesId && new Date(c.starts_at).getTime() >= Date.now(),
    );
    for (const gymClass of future) await this.deleteClass(gymClass.id);
  }

  // --- bookings ---------------------------------------------------------
  async bookClass(classId: string, profileId: string): Promise<BookingOutcome> {
    if (!allowRate(`book:${profileId}`, 20, 60_000)) {
      return { ok: false, code: BOOKING_ERRORS.RATE_LIMITED };
    }
    const database = db();
    const gymClass = database.classes.find((c) => c.id === classId);
    if (!gymClass) return { ok: false, code: BOOKING_ERRORS.CLASS_NOT_FOUND };

    const bookings = database.bookings.filter((b) => b.class_id === classId);
    const decision = decideBooking({
      gymClass,
      bookings,
      profileId,
      bookingCutoffMinutes: database.organization.booking_cutoff_minutes,
      cancelCutoffMinutes: database.organization.cancel_cutoff_minutes,
      waitlistEnabled: database.organization.waitlist_enabled,
      now: new Date(),
    });
    if (!decision.ok) return decision;

    const existing = database.bookings.find(
      (b) => b.class_id === classId && b.profile_id === profileId,
    );
    const patch = {
      status: decision.status as BookingStatus,
      waitlist_position: decision.status === 'waitlisted' ? decision.position : null,
      booked_at: nowIso(),
      cancelled_at: null,
      promoted_at: null,
    };

    if (existing) {
      Object.assign(existing, patch);
      touch(existing);
    } else {
      database.bookings.push({
        id: newId(),
        organization_id: database.organization.id,
        class_id: classId,
        profile_id: profileId,
        ...patch,
        created_at: nowIso(),
        updated_at: nowIso(),
      });
    }

    await this.createNotification({
      profile_id: profileId,
      type: 'booking_confirmed',
      title: decision.status === 'confirmed' ? 'הרישום אושר' : 'נוספת לרשימת ההמתנה',
      body:
        decision.status === 'confirmed'
          ? `${gymClass.title} · ${formatTime(gymClass.starts_at)}`
          : `${gymClass.title} · מקום ${decision.status === 'waitlisted' ? decision.position : ''} ברשימת ההמתנה`,
      link: `/classes/${classId}`,
    });

    return decision;
  }

  async cancelBooking(
    classId: string,
    profileId: string,
    options?: { force?: boolean },
  ): Promise<CancelOutcome> {
    const database = db();
    const gymClass = database.classes.find((c) => c.id === classId);
    if (!gymClass) return { ok: false, code: BOOKING_ERRORS.CLASS_NOT_FOUND };

    const bookings = database.bookings.filter((b) => b.class_id === classId);
    const decision = decideCancellation({
      gymClass,
      bookings,
      profileId,
      bookingCutoffMinutes: database.organization.booking_cutoff_minutes,
      cancelCutoffMinutes: database.organization.cancel_cutoff_minutes,
      waitlistEnabled: database.organization.waitlist_enabled,
      now: new Date(),
    });
    if (!decision.ok && !options?.force) return decision;

    const mine = bookings.find((b) => b.profile_id === profileId && isActiveBooking(b));
    if (!mine) return { ok: false, code: BOOKING_ERRORS.NOT_BOOKED };

    mine.status = 'cancelled';
    mine.cancelled_at = nowIso();
    mine.waitlist_position = null;
    touch(mine);

    const remaining = database.bookings.filter((b) => b.class_id === classId);
    const { promoted, reordered } = promoteFromWaitlist(remaining, gymClass.capacity);
    for (const entry of reordered) {
      const row = database.bookings.find((b) => b.id === entry.id);
      if (row) {
        row.waitlist_position = entry.waitlist_position;
        touch(row);
      }
    }
    if (promoted) {
      const row = database.bookings.find((b) => b.id === promoted.id);
      if (row) {
        row.status = 'confirmed';
        row.waitlist_position = null;
        row.promoted_at = nowIso();
        touch(row);
        await this.createNotification({
          profile_id: row.profile_id,
          type: 'waitlist_promoted',
          title: 'התפנה לך מקום',
          body: `קודמת מרשימת ההמתנה ל${gymClass.title} · ${formatTime(gymClass.starts_at)}`,
          link: `/classes/${classId}`,
        });
      }
    }
    return { ok: true, promotedProfileId: promoted?.profile_id ?? null };
  }

  async listMyBookings(profileId: string): Promise<{ booking: Booking; gymClass: GymClass }[]> {
    const database = db();
    return database.bookings
      .filter((b) => b.profile_id === profileId)
      .map((booking) => ({
        booking,
        gymClass: database.classes.find((c) => c.id === booking.class_id)!,
      }))
      .filter((row) => Boolean(row.gymClass))
      .sort(
        (a, b) =>
          new Date(b.gymClass.starts_at).getTime() - new Date(a.gymClass.starts_at).getTime(),
      );
  }

  async listClassBookings(classId: string): Promise<{ booking: Booking; profile: Profile }[]> {
    const database = db();
    return database.bookings
      .filter((b) => b.class_id === classId && b.status !== 'cancelled')
      .map((booking) => ({
        booking,
        profile: database.profiles.find((p) => p.id === booking.profile_id)!,
      }))
      .filter((row) => Boolean(row.profile))
      .sort((a, b) => {
        const rank = (s: BookingStatus) => (s === 'waitlisted' ? 1 : 0);
        if (rank(a.booking.status) !== rank(b.booking.status))
          return rank(a.booking.status) - rank(b.booking.status);
        return (a.booking.waitlist_position ?? 0) - (b.booking.waitlist_position ?? 0);
      });
  }

  async setBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    const database = db();
    const booking = database.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('booking_not_found');
    const previous = booking.status;
    booking.status = status;
    booking.waitlist_position =
      status === 'waitlisted'
        ? booking.waitlist_position ??
          countWaitlisted(database.bookings.filter((b) => b.class_id === booking.class_id)) + 1
        : null;
    if (status === 'cancelled') booking.cancelled_at = nowIso();
    touch(booking);

    if (previous === 'waitlisted' && status === 'confirmed') {
      const gymClass = database.classes.find((c) => c.id === booking.class_id);
      booking.promoted_at = nowIso();
      await this.createNotification({
        profile_id: booking.profile_id,
        type: 'waitlist_promoted',
        title: 'התפנה לך מקום',
        body: `המאמן קידם אותך ל${gymClass?.title ?? 'שיעור'}.`,
        link: `/classes/${booking.class_id}`,
      });
    }
  }

  async markAttendance(
    classId: string,
    profileId: string,
    present: boolean,
    markedBy: string,
    method: Attendance['method'] = 'manual',
  ): Promise<void> {
    const database = db();
    const existing = database.attendance.find(
      (a) => a.class_id === classId && a.profile_id === profileId,
    );
    if (existing) {
      existing.present = present;
      existing.checked_in_at = present ? nowIso() : null;
      existing.marked_by = markedBy;
      existing.method = method;
      touch(existing);
    } else {
      database.attendance.push({
        id: newId(),
        organization_id: database.organization.id,
        class_id: classId,
        profile_id: profileId,
        present,
        checked_in_at: present ? nowIso() : null,
        marked_by: markedBy,
        method,
        created_at: nowIso(),
        updated_at: nowIso(),
      });
    }
    const booking = database.bookings.find(
      (b) => b.class_id === classId && b.profile_id === profileId,
    );
    if (booking && booking.status !== 'cancelled') {
      booking.status = present ? 'attended' : 'absent';
      touch(booking);
    }
  }

  async listAttendance(profileId: string): Promise<Attendance[]> {
    return db().attendance.filter((a) => a.profile_id === profileId);
  }

  // --- invitations ------------------------------------------------------
  async listInvites(): Promise<InviteLink[]> {
    return db().inviteLinks.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async createInvite(input: {
    label: string;
    expires_at: string | null;
    max_uses: number | null;
    created_by: string;
  }): Promise<InviteLink> {
    const database = db();
    const invite: InviteLink = {
      id: newId(),
      organization_id: database.organization.id,
      token: `glow-${Math.random().toString(36).slice(2, 10)}`,
      label: input.label,
      created_by: input.created_by,
      expires_at: input.expires_at,
      max_uses: input.max_uses,
      uses: 0,
      revoked: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.inviteLinks.push(invite);
    return invite;
  }

  async revokeInvite(inviteId: string): Promise<void> {
    const invite = db().inviteLinks.find((i) => i.id === inviteId);
    if (!invite) throw new Error('invite_not_found');
    invite.revoked = true;
    touch(invite);
  }

  async getInviteByToken(token: string): Promise<InviteLink | null> {
    return db().inviteLinks.find((i) => i.token === token) ?? null;
  }

  async consumeInvite(token: string): Promise<void> {
    const invite = db().inviteLinks.find((i) => i.token === token);
    if (!invite) return;
    invite.uses += 1;
    touch(invite);
  }

  // --- exercises & templates -------------------------------------------
  async listExercises(includeArchived = false): Promise<Exercise[]> {
    return db()
      .exercises.filter((e) => includeArchived || !e.archived)
      .sort((a, b) => a.name_he.localeCompare(b.name_he, 'he'));
  }

  async createExercise(input: Partial<Exercise>): Promise<Exercise> {
    const database = db();
    const exercise: Exercise = {
      id: newId(),
      organization_id: database.organization.id,
      name_he: input.name_he ?? '',
      name_en: input.name_en ?? '',
      movement_category: input.movement_category ?? 'core',
      target_areas: input.target_areas ?? [],
      equipment: input.equipment ?? ['none'],
      difficulty: input.difficulty ?? 'beginner',
      instructions: input.instructions ?? '',
      safety_cues: input.safety_cues ?? '',
      media_url: input.media_url ?? null,
      archived: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.exercises.push(exercise);
    return exercise;
  }

  async updateExercise(id: string, patch: Partial<Exercise>): Promise<Exercise> {
    const exercise = db().exercises.find((e) => e.id === id);
    if (!exercise) throw new Error('exercise_not_found');
    Object.assign(exercise, patch);
    return touch(exercise);
  }

  async listTemplates(includeArchived = false): Promise<WorkoutTemplate[]> {
    return db()
      .templates.filter((t) => includeArchived || !t.archived)
      .sort((a, b) => a.title.localeCompare(b.title, 'he'));
  }

  async getTemplate(id: string): Promise<TemplateWithExercises | null> {
    const database = db();
    const template = database.templates.find((t) => t.id === id);
    if (!template) return null;
    const items = database.templateExercises
      .filter((t) => t.template_id === id)
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        ...item,
        exercise: database.exercises.find((e) => e.id === item.exercise_id) ?? null,
      }));
    return { ...template, items };
  }

  async createTemplate(input: {
    template: Partial<WorkoutTemplate>;
    items: Partial<WorkoutTemplateExercise>[];
  }): Promise<WorkoutTemplate> {
    const database = db();
    const template: WorkoutTemplate = {
      id: newId(),
      organization_id: database.organization.id,
      title: input.template.title ?? 'תבנית חדשה',
      description: input.template.description ?? null,
      goal: input.template.goal ?? 'general',
      difficulty: input.template.difficulty ?? 'beginner',
      duration_minutes: input.template.duration_minutes ?? 45,
      equipment: input.template.equipment ?? [],
      focus_areas: input.template.focus_areas ?? [],
      movement_categories: input.template.movement_categories ?? [],
      created_by: input.template.created_by ?? '',
      approved: input.template.approved ?? true,
      suggestable: input.template.suggestable ?? true,
      archived: false,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.templates.push(template);
    this.writeTemplateItems(template.id, input.items);
    return template;
  }

  private writeTemplateItems(templateId: string, items: Partial<WorkoutTemplateExercise>[]): void {
    const database = db();
    database.templateExercises = database.templateExercises.filter(
      (t) => t.template_id !== templateId,
    );
    items.forEach((item, index) => {
      if (!item.exercise_id) return;
      database.templateExercises.push({
        id: newId(),
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
      });
    });
  }

  async updateTemplate(
    id: string,
    input: { template: Partial<WorkoutTemplate>; items?: Partial<WorkoutTemplateExercise>[] },
  ): Promise<WorkoutTemplate> {
    const template = db().templates.find((t) => t.id === id);
    if (!template) throw new Error('template_not_found');
    Object.assign(template, input.template);
    touch(template);
    if (input.items) this.writeTemplateItems(id, input.items);
    return template;
  }

  // --- workout sessions -------------------------------------------------
  async getActiveSession(profileId: string): Promise<WorkoutSession | null> {
    return (
      db().sessions.find((s) => s.profile_id === profileId && s.status === 'active') ?? null
    );
  }

  async startSession(input: {
    profileId: string;
    templateId: string | null;
    title: string;
    goal: WorkoutSession['goal'];
    exercises: WorkoutSessionExercise[];
  }): Promise<WorkoutSession> {
    const database = db();
    // Only one active session per member; abandon a stale one.
    for (const session of database.sessions) {
      if (session.profile_id === input.profileId && session.status === 'active') {
        session.status = 'abandoned';
        touch(session);
      }
    }
    const session: WorkoutSession = {
      id: newId(),
      organization_id: database.organization.id,
      profile_id: input.profileId,
      template_id: input.templateId,
      title: input.title,
      goal: input.goal,
      status: 'active',
      started_at: nowIso(),
      completed_at: null,
      total_seconds: null,
      average_effort: null,
      notes: null,
      exercises: input.exercises,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.sessions.push(session);
    return session;
  }

  async updateSession(sessionId: string, patch: Partial<WorkoutSession>): Promise<WorkoutSession> {
    const session = db().sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('session_not_found');
    Object.assign(session, patch);
    return touch(session);
  }

  async getSession(sessionId: string): Promise<WorkoutSession | null> {
    return db().sessions.find((s) => s.id === sessionId) ?? null;
  }

  async listSessions(profileId: string, limit = 50): Promise<WorkoutSession[]> {
    return db()
      .sessions.filter((s) => s.profile_id === profileId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, limit);
  }

  async listSets(profileId: string): Promise<WorkoutSet[]> {
    const database = db();
    const sessionIds = new Set(
      database.sessions.filter((s) => s.profile_id === profileId).map((s) => s.id),
    );
    return database.sets.filter((s) => sessionIds.has(s.session_id));
  }

  async listSessionSets(sessionId: string): Promise<WorkoutSet[]> {
    return db()
      .sets.filter((s) => s.session_id === sessionId)
      .sort((a, b) => a.position - b.position || a.set_index - b.set_index);
  }

  async addSet(input: Omit<WorkoutSet, 'id' | 'created_at'>): Promise<WorkoutSet> {
    const set: WorkoutSet = { ...input, id: newId(), created_at: nowIso() };
    db().sets.push(set);
    return set;
  }

  async deleteSet(setId: string): Promise<void> {
    const database = db();
    database.sets = database.sets.filter((s) => s.id !== setId);
  }

  async finishSession(
    sessionId: string,
    input: { notes: string | null },
  ): Promise<WorkoutSession> {
    const database = db();
    const session = database.sessions.find((s) => s.id === sessionId);
    if (!session) throw new Error('session_not_found');
    const sets = database.sets.filter((s) => s.session_id === sessionId);
    const efforts = sets.map((s) => s.effort).filter((e): e is number => e !== null);

    session.status = 'completed';
    session.completed_at = nowIso();
    session.total_seconds = Math.max(
      60,
      Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000),
    );
    session.average_effort =
      efforts.length > 0
        ? Math.round((efforts.reduce((a, b) => a + b, 0) / efforts.length) * 10) / 10
        : null;
    session.notes = input.notes;
    return touch(session);
  }

  // --- readiness --------------------------------------------------------
  async getReadiness(profileId: string, dateKey: string): Promise<ReadinessLog | null> {
    return (
      db().readiness.find((r) => r.profile_id === profileId && r.log_date === dateKey) ?? null
    );
  }

  async listReadiness(profileId: string, limit = 30): Promise<ReadinessLog[]> {
    return db()
      .readiness.filter((r) => r.profile_id === profileId)
      .sort((a, b) => b.log_date.localeCompare(a.log_date))
      .slice(0, limit);
  }

  async upsertReadiness(
    input: Omit<ReadinessLog, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
  ): Promise<ReadinessLog> {
    const database = db();
    const existing = database.readiness.find(
      (r) => r.profile_id === input.profile_id && r.log_date === input.log_date,
    );
    if (existing) {
      Object.assign(existing, input);
      return touch(existing);
    }
    const log: ReadinessLog = {
      ...input,
      id: newId(),
      organization_id: database.organization.id,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.readiness.push(log);
    return log;
  }

  // --- timer presets ----------------------------------------------------
  async listTimerPresets(profileId: string): Promise<TimerPreset[]> {
    return db()
      .timerPresets.filter((p) => p.is_public || p.profile_id === profileId)
      .sort((a, b) => Number(b.is_public) - Number(a.is_public) || a.name.localeCompare(b.name, 'he'));
  }

  async createTimerPreset(
    input: Partial<TimerPreset> & { profile_id: string | null; name: string },
  ): Promise<TimerPreset> {
    const database = db();
    const preset: TimerPreset = {
      id: newId(),
      organization_id: database.organization.id,
      profile_id: input.profile_id,
      name: input.name,
      prepare_seconds: input.prepare_seconds ?? 10,
      work_seconds: input.work_seconds ?? 20,
      rest_seconds: input.rest_seconds ?? 10,
      rounds: input.rounds ?? 8,
      sets: input.sets ?? 1,
      rest_between_sets_seconds: input.rest_between_sets_seconds ?? 60,
      cooldown_seconds: input.cooldown_seconds ?? 0,
      is_public: input.is_public ?? false,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    database.timerPresets.push(preset);
    return preset;
  }

  async updateTimerPreset(id: string, patch: Partial<TimerPreset>): Promise<TimerPreset> {
    const preset = db().timerPresets.find((p) => p.id === id);
    if (!preset) throw new Error('preset_not_found');
    Object.assign(preset, patch);
    return touch(preset);
  }

  async deleteTimerPreset(id: string): Promise<void> {
    const database = db();
    database.timerPresets = database.timerPresets.filter((p) => p.id !== id);
  }

  // --- notifications ----------------------------------------------------
  async listNotifications(profileId: string): Promise<AppNotification[]> {
    return db()
      .notifications.filter((n) => n.profile_id === profileId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async createNotification(
    input: Omit<
      AppNotification,
      'id' | 'organization_id' | 'created_at' | 'read_at' | 'delivery_status' | 'delivery_error'
    >,
  ): Promise<AppNotification> {
    const database = db();
    const prefs = await this.getNotificationPreferences(input.profile_id);
    if (prefs[input.type] === false) {
      // Preference opt-out: nothing is stored and nothing is delivered.
      return {
        ...input,
        id: newId(),
        organization_id: database.organization.id,
        read_at: nowIso(),
        delivery_status: 'skipped_no_provider',
        delivery_error: 'muted_by_preference',
        created_at: nowIso(),
      };
    }
    const { deliverEmail } = await import('@/lib/notifications/email');
    const delivery = await deliverEmail({
      to: database.profiles.find((p) => p.id === input.profile_id)?.email ?? '',
      subject: input.title,
      body: input.body,
      enabled: prefs.email_enabled,
    });
    const notification: AppNotification = {
      ...input,
      id: newId(),
      organization_id: database.organization.id,
      read_at: null,
      delivery_status: delivery.status,
      delivery_error: delivery.error,
      created_at: nowIso(),
    };
    database.notifications.push(notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = db().notifications.find((n) => n.id === id);
    if (notification) notification.read_at = nowIso();
  }

  async markAllNotificationsRead(profileId: string): Promise<void> {
    for (const notification of db().notifications) {
      if (notification.profile_id === profileId && !notification.read_at) {
        notification.read_at = nowIso();
      }
    }
  }

  async getNotificationPreferences(profileId: string): Promise<NotificationPreferences> {
    const stored = db().preferences[profileId];
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(stored ?? {}) } as NotificationPreferences;
  }

  async setNotificationPreferences(
    profileId: string,
    prefs: NotificationPreferences,
  ): Promise<void> {
    db().preferences[profileId] = { ...prefs };
  }

  async broadcastAnnouncement(input: {
    title: string;
    body: string;
    authorId: string;
  }): Promise<number> {
    const database = db();
    const recipients = database.memberships.filter(
      (m) => m.status === 'active' && m.profile_id !== input.authorId,
    );
    for (const membership of recipients) {
      await this.createNotification({
        profile_id: membership.profile_id,
        type: 'announcement',
        title: input.title,
        body: input.body,
        link: null,
      });
    }
    return recipients.length;
  }

  // --- analytics --------------------------------------------------------
  async getAdminStats(fromIso: string, toIso: string): Promise<AdminStats> {
    const database = db();
    const from = new Date(fromIso).getTime();
    const to = new Date(toIso).getTime();
    const classes = database.classes.filter((c) => {
      const t = new Date(c.starts_at).getTime();
      return t >= from && t < to && c.status === 'scheduled';
    });
    const classIds = new Set(classes.map((c) => c.id));
    const bookings = database.bookings.filter((b) => classIds.has(b.class_id));

    const capacity = classes.reduce((sum, c) => sum + c.capacity, 0);
    const confirmed = bookings.filter(
      (b) => b.status === 'confirmed' || b.status === 'attended' || b.status === 'absent',
    ).length;
    const attended = bookings.filter((b) => b.status === 'attended').length;
    const completed = bookings.filter(
      (b) => b.status === 'attended' || b.status === 'absent',
    ).length;
    const waitlisted = bookings.filter((b) => b.status === 'waitlisted').length;

    const byTime = new Map<string, number>();
    const byTitle = new Map<string, number>();
    for (const gymClass of classes) {
      const time = formatTime(gymClass.starts_at);
      const count = bookings.filter(
        (b) => b.class_id === gymClass.id && b.status !== 'cancelled',
      ).length;
      byTime.set(time, (byTime.get(time) ?? 0) + count);
      byTitle.set(gymClass.title, (byTitle.get(gymClass.title) ?? 0) + count);
    }

    const byDay = new Map<string, { bookings: number; capacity: number }>();
    for (const gymClass of classes) {
      const key = dayKey(gymClass.starts_at);
      const entry = byDay.get(key) ?? { bookings: 0, capacity: 0 };
      entry.capacity += gymClass.capacity;
      entry.bookings += bookings.filter(
        (b) =>
          b.class_id === gymClass.id &&
          (b.status === 'confirmed' || b.status === 'attended' || b.status === 'absent'),
      ).length;
      byDay.set(key, entry);
    }

    return {
      occupancyRate: capacity === 0 ? 0 : Math.round((confirmed / capacity) * 100),
      attendanceRate: completed === 0 ? 0 : Math.round((attended / completed) * 100),
      waitlistDemand: waitlisted,
      totalClasses: classes.length,
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

export { detectNewRecords };
