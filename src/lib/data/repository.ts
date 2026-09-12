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
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from '@/lib/domain/types';
import type { BookingErrorCode } from '@/lib/domain/booking-rules';

export type BookingOutcome =
  | { ok: true; status: 'confirmed' }
  | { ok: true; status: 'waitlisted'; position: number }
  | { ok: false; code: BookingErrorCode };

export type CancelOutcome =
  | { ok: true; promotedProfileId: string | null }
  | { ok: false; code: BookingErrorCode };

export interface ScheduleFilters {
  category?: string | null;
  trainerId?: string | null;
  availability?: 'all' | 'available' | 'booked';
}

export interface AdminStats {
  occupancyRate: number;
  attendanceRate: number;
  waitlistDemand: number;
  totalClasses: number;
  totalBookings: number;
  popularTimes: { time: string; bookings: number }[];
  popularClasses: { title: string; bookings: number }[];
  weeklyTrend: { label: string; bookings: number; capacity: number }[];
}

export interface TemplateWithExercises extends WorkoutTemplate {
  items: (WorkoutTemplateExercise & { exercise: Exercise | null })[];
}

/**
 * Single data-access contract shared by the demo adapter and the Supabase
 * adapter. Every method is already scoped to the caller's organization and
 * permissions by the implementation.
 */
export interface Repository {
  // --- identity ---------------------------------------------------------
  getOrganization(): Promise<Organization>;
  updateOrganization(patch: Partial<Organization>): Promise<Organization>;
  getSessionUser(profileId: string | null): Promise<SessionUser | null>;
  updateProfile(profileId: string, patch: Partial<Profile>): Promise<Profile>;
  listMembers(): Promise<{ profile: Profile; membership: Membership }[]>;
  /**
   * Why this person can or cannot use the app. Separate from `getSessionUser`,
   * which stays strict and returns nothing at all for anyone who is not a fully
   * approved, active member - otherwise a pending sign-in would bounce back to
   * the sign-in screen forever with no way to explain itself.
   */
  getAccessState(profileId: string | null): Promise<AccessState>;
  setMemberRole(profileId: string, role: Membership['role']): Promise<void>;
  setMemberStatus(profileId: string, status: Membership['status']): Promise<void>;
  /** Lets someone into the club, as a member or as a trainer. */
  approveMember(
    profileId: string,
    role: Membership['role'],
    approvedBy: string,
  ): Promise<void>;
  ensureProfile(input: {
    id?: string;
    email: string;
    full_name: string;
    phone?: string | null;
  }): Promise<Profile>;

  // --- trainers ---------------------------------------------------------
  listTrainers(): Promise<Trainer[]>;
  upsertTrainer(input: Partial<Trainer> & { profile_id: string }): Promise<Trainer>;

  // --- schedule ---------------------------------------------------------
  listClasses(input: {
    fromIso: string;
    toIso: string;
    profileId: string | null;
    includeUnpublished?: boolean;
  }): Promise<ClassWithMeta[]>;
  getClass(classId: string, profileId: string | null): Promise<ClassWithMeta | null>;
  createClass(input: Partial<GymClass>): Promise<GymClass>;
  updateClass(classId: string, patch: Partial<GymClass>): Promise<GymClass>;
  deleteClass(classId: string): Promise<void>;
  duplicateClass(classId: string, newStartIso: string): Promise<GymClass>;
  listSeries(): Promise<ClassSeries[]>;
  createSeries(input: Omit<ClassSeries, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<{ series: ClassSeries; created: number }>;
  updateSeries(seriesId: string, patch: Partial<ClassSeries>, scope: 'one' | 'all', classId?: string): Promise<void>;
  deleteSeries(seriesId: string): Promise<void>;

  // --- bookings ---------------------------------------------------------
  bookClass(classId: string, profileId: string): Promise<BookingOutcome>;
  cancelBooking(classId: string, profileId: string, options?: { force?: boolean }): Promise<CancelOutcome>;
  listMyBookings(profileId: string): Promise<{ booking: Booking; gymClass: GymClass }[]>;
  listClassBookings(classId: string): Promise<{ booking: Booking; profile: Profile }[]>;
  setBookingStatus(bookingId: string, status: BookingStatus): Promise<void>;
  markAttendance(classId: string, profileId: string, present: boolean, markedBy: string, method?: Attendance['method']): Promise<void>;
  listAttendance(profileId: string): Promise<Attendance[]>;

  // --- invitations ------------------------------------------------------
  listInvites(): Promise<InviteLink[]>;
  createInvite(input: { label: string; expires_at: string | null; max_uses: number | null; created_by: string }): Promise<InviteLink>;
  revokeInvite(inviteId: string): Promise<void>;
  getInviteByToken(token: string): Promise<InviteLink | null>;
  consumeInvite(token: string): Promise<void>;

  // --- exercises & templates -------------------------------------------
  listExercises(includeArchived?: boolean): Promise<Exercise[]>;
  createExercise(input: Partial<Exercise>): Promise<Exercise>;
  updateExercise(id: string, patch: Partial<Exercise>): Promise<Exercise>;
  listTemplates(includeArchived?: boolean): Promise<WorkoutTemplate[]>;
  getTemplate(id: string): Promise<TemplateWithExercises | null>;
  createTemplate(input: {
    template: Partial<WorkoutTemplate>;
    items: Partial<WorkoutTemplateExercise>[];
  }): Promise<WorkoutTemplate>;
  updateTemplate(id: string, input: {
    template: Partial<WorkoutTemplate>;
    items?: Partial<WorkoutTemplateExercise>[];
  }): Promise<WorkoutTemplate>;

  // --- workout sessions -------------------------------------------------
  getActiveSession(profileId: string): Promise<WorkoutSession | null>;
  startSession(input: {
    profileId: string;
    templateId: string | null;
    title: string;
    goal: WorkoutSession['goal'];
    exercises: WorkoutSessionExercise[];
  }): Promise<WorkoutSession>;
  updateSession(sessionId: string, patch: Partial<WorkoutSession>): Promise<WorkoutSession>;
  getSession(sessionId: string): Promise<WorkoutSession | null>;
  listSessions(profileId: string, limit?: number): Promise<WorkoutSession[]>;
  listSets(profileId: string): Promise<WorkoutSet[]>;
  listSessionSets(sessionId: string): Promise<WorkoutSet[]>;
  addSet(input: Omit<WorkoutSet, 'id' | 'created_at'>): Promise<WorkoutSet>;
  deleteSet(setId: string): Promise<void>;
  finishSession(sessionId: string, input: { notes: string | null }): Promise<WorkoutSession>;

  // --- readiness --------------------------------------------------------
  getReadiness(profileId: string, dateKey: string): Promise<ReadinessLog | null>;
  listReadiness(profileId: string, limit?: number): Promise<ReadinessLog[]>;
  upsertReadiness(input: Omit<ReadinessLog, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<ReadinessLog>;

  // --- timer presets ----------------------------------------------------
  listTimerPresets(profileId: string): Promise<TimerPreset[]>;
  createTimerPreset(input: Partial<TimerPreset> & { profile_id: string | null; name: string }): Promise<TimerPreset>;
  updateTimerPreset(id: string, patch: Partial<TimerPreset>): Promise<TimerPreset>;
  deleteTimerPreset(id: string): Promise<void>;

  // --- notifications ----------------------------------------------------
  listNotifications(profileId: string): Promise<AppNotification[]>;
  createNotification(input: Omit<AppNotification, 'id' | 'organization_id' | 'created_at' | 'read_at' | 'delivery_status' | 'delivery_error'>): Promise<AppNotification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(profileId: string): Promise<void>;
  getNotificationPreferences(profileId: string): Promise<NotificationPreferences>;
  setNotificationPreferences(profileId: string, prefs: NotificationPreferences): Promise<void>;
  broadcastAnnouncement(input: { title: string; body: string; authorId: string }): Promise<number>;

  // --- analytics --------------------------------------------------------
  getAdminStats(fromIso: string, toIso: string): Promise<AdminStats>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  booking_confirmed: true,
  waitlist_promoted: true,
  class_cancelled: true,
  class_time_changed: true,
  class_reminder: true,
  schedule_published: true,
  announcement: true,
  email_enabled: false,
};
