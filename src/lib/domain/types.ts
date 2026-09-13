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
  | 'medicine_ball'
  | 'jump_rope'
  | 'bench'
  | 'treadmill'
  | 'hip_thrust';

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

/**
 * The kind of training a member is here for.
 *
 * A style, never a body. "I am here to get strong" is something the app can
 * help with; "become this shape" is a promise it cannot keep.
 */
export type AvocadoStyle = 'strong' | 'lean' | 'flow';

export interface Profile {
  id: string;
  email: string;
  /** The name on the club's records. Never shown to other members. */
  full_name: string;
  /** What this member is called in the club. This is what others see. */
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  /** Key of a drawn avocado from `@/lib/domain/avatars`. */
  avatar_preset: string | null;
  experience_level: Difficulty;
  avocado_style: AvocadoStyle | null;
  /** Sessions a week this member is aiming for. */
  weekly_goal_sessions: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * One person in a class, as other members are allowed to see them.
 *
 * Four fields and no more. There is no full name here, no phone, no email and
 * nothing anyone has trained - a roster answers who is in the room, and the
 * shape of this type is what stops it answering anything else.
 */
export interface RosterEntry {
  profile_id: string;
  /** The name they chose, or their first name. Never the full one. */
  name: string;
  avatar_preset: string | null;
  status: BookingStatus;
  waitlist_position: number | null;
}

export interface Membership {
  id: string;
  organization_id: string;
  profile_id: string;
  role: Role;
  status: 'active' | 'suspended';
  /** Null until an owner lets this person into the club. */
  approved_at: string | null;
  approved_by: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

/** Why a signed-in person can or cannot use the app. */
export type AccessState = 'none' | 'pending' | 'suspended' | 'active';

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
  /**
   * The shape of the planned workout, or null when nothing is planned.
   *
   * Never its content: the movements live behind `getClassWorkout`, which only
   * hands them over to someone who holds a place.
   */
  workout_teaser: WorkoutTeaser | null;
}

export interface WorkoutTeaser {
  category: WorkoutCategory;
  format: WorkoutFormat;
  duration_minutes: number;
  difficulty: Difficulty;
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

// --- workout of the day -------------------------------------------------------

/** The four families the workout library is organised into. */
export type WorkoutCategory = 'crossfit' | 'functional' | 'pilates' | 'yoga';

/** How a workout is run, which is also what decides how it is scored. */
export type WorkoutFormat =
  | 'amrap'
  | 'for_time'
  | 'emom'
  | 'tabata'
  | 'chipper'
  | 'intervals'
  | 'strength'
  | 'circuit'
  | 'flow';

/** What a member writes down at the end. */
export type ScoreType = 'time' | 'rounds_and_reps' | 'reps' | 'weight' | 'completion';

/** One line as a coach would write it on the board. */
export interface WorkoutMovement {
  label: string;
  /** Load, pace, tempo or a cue. Optional. */
  detail?: string | null;
}

/** A named part of a workout: a buy-in, the main piece, a cash-out. */
export interface WorkoutBlock {
  label: string;
  /** How to run it - rounds, rest, time cap. */
  detail?: string | null;
  items: WorkoutMovement[];
}

export interface WorkoutScaling {
  level: Difficulty;
  detail: string;
}

export interface Workout {
  id: string;
  organization_id: string;
  /** Stable handle, unique per organization. */
  slug: string;
  title: string;
  subtitle: string | null;
  category: WorkoutCategory;
  format: WorkoutFormat;
  difficulty: Difficulty;
  duration_minutes: number;
  time_cap_minutes: number | null;
  equipment: Equipment[];
  description: string;
  warmup: WorkoutMovement[];
  structure: WorkoutBlock[];
  cooldown: WorkoutMovement[];
  scaling: WorkoutScaling[];
  score_type: ScoreType;
  /** Overrides the default unit wording, e.g. "סבבים + חזרות". */
  score_label: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

/** The workout a class will run. Hidden until the member holds a place. */
export interface ClassWorkout {
  class_id: string;
  organization_id: string;
  workout_id: string;
  notes: string | null;
  assigned_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * What a member is allowed to know about their class's workout.
 *
 * `locked` still carries the shape of the session - family, format, length -
 * because that is what someone needs to decide whether to come. It never
 * carries the movements.
 */
export type WorkoutReveal =
  | { state: 'none' }
  | {
      state: 'locked';
      category: WorkoutCategory;
      format: WorkoutFormat;
      duration_minutes: number;
      difficulty: Difficulty;
    }
  | { state: 'revealed'; workout: Workout; notes: string | null };

export interface WorkoutLog {
  id: string;
  organization_id: string;
  profile_id: string;
  workout_id: string;
  class_id: string | null;
  /** yyyy-MM-dd in gym time. */
  performed_on: string;
  score_type: ScoreType;
  result_seconds: number | null;
  result_rounds: number | null;
  result_reps: number | null;
  result_weight_kg: number | null;
  completed: boolean | null;
  /** True when performed exactly as prescribed. */
  rx: boolean;
  /** Rate of perceived exertion, 1-10. */
  rpe: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** A result together with the workout it belongs to, for history screens. */
export interface WorkoutLogWithWorkout {
  log: WorkoutLog;
  workout: Workout;
}

// --- personal tracking --------------------------------------------------------

export type ActivityKind = 'strength' | 'run' | 'class' | 'mobility' | 'other';

/** Height and weight on one day. Either number may stand alone. */
export interface BodyMetric {
  id: string;
  organization_id: string;
  profile_id: string;
  /** yyyy-MM-dd in gym time. */
  measured_on: string;
  height_cm: number | null;
  weight_kg: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/** One weight moved, inside one session. */
export interface ActivityLift {
  id: string;
  activity_id: string;
  profile_id: string;
  position: number;
  /** Null when the member typed a name the library does not have. */
  exercise_id: string | null;
  exercise_name: string;
  sets: number;
  reps: number | null;
  weight_kg: number | null;
  created_at: string;
}

/** Anything a member did, written however they wanted to write it. */
export interface ActivityLog {
  id: string;
  organization_id: string;
  profile_id: string;
  /** yyyy-MM-dd in gym time. */
  performed_on: string;
  kind: ActivityKind;
  title: string;
  notes: string | null;
  duration_seconds: number | null;
  rpe: number | null;
  /** Runs only. */
  distance_meters: number | null;
  incline_percent: number | null;
  class_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityWithLifts {
  activity: ActivityLog;
  lifts: ActivityLift[];
}

/** The heaviest a member has moved on one exercise, and when. */
export interface LiftRecord {
  exercise_name: string;
  weight_kg: number;
  reps: number | null;
  performed_on: string;
  /** How many separate days this exercise has been logged. */
  sessions: number;
}
