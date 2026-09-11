/**
 * GLoW domain types.
 * These mirror the PostgreSQL schema in supabase/migrations 1:1 so that the
 * demo adapter and the Supabase adapter can share the same repository API.
 * All timestamps are ISO-8601 strings in UTC.
 */

export type Role = 'owner' | 'trainer' | 'member';

export type BookingStatus = 'confirmed' | 'waitlisted' | 'cancelled' | 'attended' | 'absent';

export type ClassStatus = 'scheduled' | 'cancelled';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type TrainingCategory =
  | 'strength'
  | 'functional'
  | 'tabata'
  | 'mobility'
  | 'open'
  | 'conditioning';

export type MovementCategory =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'carry'
  | 'core'
  | 'conditioning'
  | 'mobility';

export type BodyArea =
  | 'legs'
  | 'glutes'
  | 'back'
  | 'chest'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'full_body'
  | 'hips'
  | 'thoracic';

export type Equipment =
  | 'none'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebell'
  | 'bands'
  | 'box'
  | 'rower'
  | 'bike'
  | 'rings'
  | 'pullup_bar'
  | 'mat'
  | 'medicine_ball';

export type TrainingGoal = 'general' | 'strength' | 'conditioning' | 'mobility' | 'technique';

export type NotificationType =
  | 'booking_confirmed'
  | 'waitlist_promoted'
  | 'class_cancelled'
  | 'class_time_changed'
  | 'class_reminder'
  | 'schedule_published'
  | 'announcement';

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped_no_provider';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  week_starts_on: number;
  booking_cutoff_minutes: number;
  cancel_cutoff_minutes: number;
  waitlist_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  experience_level: Difficulty;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  organization_id: string;
  profile_id: string;
  role: Role;
  status: 'active' | 'suspended';
  joined_at: string;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  organization_id: string;
  profile_id: string;
  display_name: string;
  bio: string | null;
  specialties: TrainingCategory[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type RecurrenceRule = {
  /** 0 = Sunday ... 6 = Saturday */
  weekdays: number[];
  /** inclusive, yyyy-MM-dd in gym timezone */
  start_date: string;
  /** inclusive, yyyy-MM-dd in gym timezone */
  end_date: string;
  /** HH:mm in gym timezone */
  start_time: string;
};

export interface ClassSeries {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  category: TrainingCategory;
  difficulty: Difficulty;
  trainer_id: string | null;
  location: string;
  capacity: number;
  duration_minutes: number;
  equipment: Equipment[];
  recurrence: RecurrenceRule;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GymClass {
  id: string;
  organization_id: string;
  series_id: string | null;
  title: string;
  description: string | null;
  category: TrainingCategory;
  difficulty: Difficulty;
  trainer_id: string | null;
  location: string;
  capacity: number;
  /** UTC ISO */
  starts_at: string;
  /** UTC ISO */
  ends_at: string;
  equipment: Equipment[];
  status: ClassStatus;
  published: boolean;
  registration_closed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  organization_id: string;
  class_id: string;
  profile_id: string;
  status: BookingStatus;
  waitlist_position: number | null;
  booked_at: string;
  cancelled_at: string | null;
  promoted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface InviteLink {
  id: string;
  organization_id: string;
  token: string;
  label: string;
  created_by: string;
  expires_at: string | null;
  max_uses: number | null;
  uses: number;
  revoked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  organization_id: string;
  class_id: string;
  profile_id: string;
  present: boolean;
  checked_in_at: string | null;
  marked_by: string | null;
  method: 'manual' | 'qr';
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  organization_id: string;
  name_he: string;
  name_en: string;
  movement_category: MovementCategory;
  target_areas: BodyArea[];
  equipment: Equipment[];
  difficulty: Difficulty;
  instructions: string;
  safety_cues: string;
  media_url: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateExercise {
  id: string;
  template_id: string;
  exercise_id: string;
  block: 'warmup' | 'main' | 'finisher' | 'cooldown';
  position: number;
  sets: number | null;
  reps: number | null;
  load_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  rest_seconds: number | null;
  trainer_notes: string | null;
  alternative_exercise_ids: string[];
}

export interface WorkoutTemplate {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  goal: TrainingGoal;
  difficulty: Difficulty;
  duration_minutes: number;
  equipment: Equipment[];
  focus_areas: BodyArea[];
  movement_categories: MovementCategory[];
  created_by: string;
  approved: boolean;
  suggestable: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  position: number;
  set_index: number;
  reps: number | null;
  load_kg: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  effort: number | null;
  notes: string | null;
  completed_at: string;
  created_at: string;
}

export interface WorkoutSessionExercise {
  exercise_id: string;
  position: number;
  target_sets: number | null;
  target_reps: number | null;
  target_load_kg: number | null;
  target_duration_seconds: number | null;
  target_distance_meters: number | null;
  rest_seconds: number | null;
  notes: string | null;
  replaced_from_exercise_id?: string | null;
  replace_reason?: string | null;
}

export interface WorkoutSession {
  id: string;
  organization_id: string;
  profile_id: string;
  template_id: string | null;
  title: string;
  goal: TrainingGoal;
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  total_seconds: number | null;
  average_effort: number | null;
  notes: string | null;
  exercises: WorkoutSessionExercise[];
  created_at: string;
  updated_at: string;
}

export interface ReadinessLog {
  id: string;
  organization_id: string;
  profile_id: string;
  /** yyyy-MM-dd in gym timezone */
  log_date: string;
  energy: number;
  soreness: number;
  sleep_quality: number;
  available_minutes: number;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimerPreset {
  id: string;
  organization_id: string;
  profile_id: string | null;
  name: string;
  prepare_seconds: number;
  work_seconds: number;
  rest_seconds: number;
  rounds: number;
  sets: number;
  rest_between_sets_seconds: number;
  cooldown_seconds: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  organization_id: string;
  profile_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  delivery_status: DeliveryStatus;
  delivery_error: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  booking_confirmed: boolean;
  waitlist_promoted: boolean;
  class_cancelled: boolean;
  class_time_changed: boolean;
  class_reminder: boolean;
  schedule_published: boolean;
  announcement: boolean;
  email_enabled: boolean;
}

export interface AppSettings {
  id: string;
  organization_id: string;
  profile_id: string | null;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/** Session user resolved by the auth layer. */
export interface SessionUser {
  profile: Profile;
  membership: Membership;
  organization: Organization;
  trainer: Trainer | null;
}

/** Denormalised class row used across the UI. */
export interface ClassWithMeta extends GymClass {
  trainer_name: string | null;
  confirmed_count: number;
  waitlist_count: number;
  spots_left: number;
  my_booking: Booking | null;
}

export type ClassAvailability =
  | 'available'
  | 'almost_full'
  | 'full'
  | 'booked'
  | 'waitlisted'
  | 'cancelled'
  | 'closed'
  | 'past';
