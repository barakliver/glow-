/**
 * GLoW demo seed.
 * Deterministic given a "week anchor" date so local previews and e2e tests
 * always see a complete, sensible sample week.
 */
import { addDays, format } from 'date-fns';
import { fromGymTime, gymWeekDays, toGymTime } from '@/lib/time';
import { WORKOUT_LIBRARY, libraryWorkouts, workoutLibraryId } from '@/lib/data/workouts';
import type {
  AppNotification,
  Attendance,
  Booking,
  ClassSeries,
  Exercise,
  GymClass,
  InviteLink,
  Membership,
  Organization,
  Profile,
  ReadinessLog,
  ClassWorkout,
  TimerPreset,
  Trainer,
  Workout,
  WorkoutLog,
  WorkoutSession,
  WorkoutSet,
  WorkoutTemplate,
  WorkoutTemplateExercise,
} from '@/lib/domain/types';

export interface SeedData {
  organization: Organization;
  profiles: Profile[];
  memberships: Membership[];
  trainers: Trainer[];
  series: ClassSeries[];
  classes: GymClass[];
  bookings: Booking[];
  inviteLinks: InviteLink[];
  attendance: Attendance[];
  exercises: Exercise[];
  templates: WorkoutTemplate[];
  templateExercises: WorkoutTemplateExercise[];
  sessions: WorkoutSession[];
  sets: WorkoutSet[];
  readiness: ReadinessLog[];
  timerPresets: TimerPreset[];
  notifications: AppNotification[];
  workouts: Workout[];
  classWorkouts: ClassWorkout[];
  workoutLogs: WorkoutLog[];
}

/**
 * Which family of workouts a class of each kind runs.
 *
 * A mobility class does not get Fran. Keeping this explicit means the demo
 * schedule reads like a real week rather than a shuffle of the whole library.
 */
const WORKOUT_FAMILY: Record<ClassSeries['category'], Workout['category']> = {
  strength: 'functional',
  functional: 'functional',
  tabata: 'crossfit',
  mobility: 'yoga',
  open: 'crossfit',
  conditioning: 'crossfit',
};

const ORG_ID = '00000000-0000-4000-8000-000000000001';

const id = (n: number, prefix = '1') =>
  `00000000-0000-4000-8000-${prefix.padStart(3, '0')}${String(n).padStart(9, '0')}`;

const PROFILE_IDS = {
  owner: id(1, '100'),
  trainer1: id(2, '100'),
  trainer2: id(3, '100'),
  member1: id(4, '100'),
  member2: id(5, '100'),
  member3: id(6, '100'),
  member4: id(7, '100'),
  member5: id(8, '100'),
  applicant: id(9, '100'),
};

export const DEMO_ACCOUNTS = [
  { id: PROFILE_IDS.owner, email: 'owner@glow.fit', name: 'נועה ברק', role: 'owner' as const },
  { id: PROFILE_IDS.trainer1, email: 'idan@glow.fit', name: 'עידן כהן', role: 'trainer' as const },
  { id: PROFILE_IDS.trainer2, email: 'maya@glow.fit', name: 'מאיה לוי', role: 'trainer' as const },
  { id: PROFILE_IDS.member1, email: 'yuval@glow.fit', name: 'יובל אדרי', role: 'member' as const },
  { id: PROFILE_IDS.member2, email: 'tal@glow.fit', name: 'טל שרון', role: 'member' as const },
  { id: PROFILE_IDS.member3, email: 'roni@glow.fit', name: 'רוני גל', role: 'member' as const },
  { id: PROFILE_IDS.member4, email: 'omer@glow.fit', name: 'עומר נחום', role: 'member' as const },
  { id: PROFILE_IDS.member5, email: 'shira@glow.fit', name: 'שירה פלד', role: 'member' as const },
  // Waiting at the door, so the approval queue is not an empty screen in the demo.
  {
    id: PROFILE_IDS.applicant,
    email: 'dana@glow.fit',
    name: 'דנה אביב',
    role: 'member' as const,
    approved: false,
  },
];

const TS = '2026-01-01T00:00:00.000Z';

function profile(
  pid: string,
  email: string,
  fullName: string,
  phone: string,
  level: Profile['experience_level'],
): Profile {
  return {
    id: pid,
    email,
    full_name: fullName,
    phone,
    avatar_url: null,
    experience_level: level,
    onboarding_completed: true,
    created_at: TS,
    updated_at: TS,
  };
}

const EXERCISE_SEED: Omit<Exercise, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[] = [
  {
    name_he: 'היפ תראסט',
    name_en: 'Hip Thrust',
    movement_category: 'hinge',
    target_areas: ['glutes', 'legs', 'core'],
    equipment: ['hip_thrust'],
    difficulty: 'beginner',
    instructions: 'גב עליון נשען על הפד, דוחפים דרך העקבים עד שהגוף מקביל לרצפה ועוצרים שנייה למעלה.',
    safety_cues: 'הסנטר לחזה, הצלעות סגורות, בלי לקשת את הגב התחתון.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'עליות על הספסל',
    name_en: 'Bench Step-up',
    movement_category: 'squat',
    target_areas: ['legs', 'glutes'],
    equipment: ['bench'],
    difficulty: 'beginner',
    instructions: 'עולים על הספסל עם רגל אחת, מיישרים את הירך למעלה ויורדים בשליטה.',
    safety_cues: 'כל הכוח מהרגל שעל הספסל, בלי דחיפה מהרגל האחורית.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'טבילות על הספסל',
    name_en: 'Bench Dip',
    movement_category: 'push',
    target_areas: ['arms', 'chest', 'shoulders'],
    equipment: ['bench'],
    difficulty: 'beginner',
    instructions: 'כפות הידיים על קצה הספסל, יורדים עד זווית 90 במרפק ודוחפים חזרה.',
    safety_cues: 'הכתפיים רחוקות מהאוזניים, המרפקים לאחור ולא לצדדים.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'ריצה על ההליכון',
    name_en: 'Treadmill Run',
    movement_category: 'conditioning',
    target_areas: ['legs', 'full_body'],
    equipment: ['treadmill'],
    difficulty: 'beginner',
    instructions: 'ריצה בקצב ובשיפוע שנקבעו לאימון. מתחילים בהליכה ומעלים בהדרגה.',
    safety_cues: 'מבט קדימה, צעדים קצרים ותכופים, לא נתלים על המעקה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'חתירה הפוכה מתחת למוט',
    name_en: 'Inverted Row',
    movement_category: 'pull',
    target_areas: ['back', 'arms', 'core'],
    equipment: ['barbell'],
    difficulty: 'beginner',
    instructions: 'המוט בגובה מותן, הגוף ישר מתחתיו, מושכים את החזה למוט.',
    safety_cues: 'הגוף בקו אחד מהכתף לעקב, האגן לא צונח.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'כפיפות בטן',
    name_en: 'Sit-up',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'שכיבה על הגב, מתגלגלים למעלה חוליה אחר חוליה ונוגעים בכפות הרגליים.',
    safety_cues: 'הצוואר רפוי, התנועה מהבטן ולא מהידיים.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'הולו הולד',
    name_en: 'Hollow Hold',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'intermediate',
    instructions: 'שכיבה על הגב, ידיים ורגליים מורמות, הגב התחתון צמוד לרצפה.',
    safety_cues: 'אם הגב התחתון מתרומם - מקרבים את הרגליים.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'באג מת',
    name_en: 'Dead Bug',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'שכיבה על הגב, מורידים יד ורגל נגדיות לסירוגין בלי לאבד מגע של הגב עם הרצפה.',
    safety_cues: 'איטי ומבוקר, נושפים בכל הורדה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'פלאנק צד',
    name_en: 'Side Plank',
    movement_category: 'core',
    target_areas: ['core', 'shoulders'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'נשענים על אמה אחת וצד כף הרגל, מרימים את האגן לקו ישר.',
    safety_cues: 'האגן גבוה, הכתף מעל המרפק.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'הרמות ברך בתלייה',
    name_en: 'Hanging Knee Raise',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['pullup_bar'],
    difficulty: 'intermediate',
    instructions: 'תלייה על המתח, מרימים ברכיים לגובה החזה ומורידים בשליטה.',
    safety_cues: 'בלי נדנוד, הכתפיים פעילות לאורך כל התנועה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'ציפור-כלב',
    name_en: 'Bird Dog',
    movement_category: 'core',
    target_areas: ['core', 'back', 'glutes'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'על ארבע, מותחים יד ורגל נגדיות עד קו ישר ומחזירים.',
    safety_cues: 'האגן לא מסתובב, המבט לרצפה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'V-Ups',
    name_en: 'V-Up',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'advanced',
    instructions: 'שכיבה על הגב, מרימים ידיים ורגליים יחד ונפגשים באמצע.',
    safety_cues: 'הרגליים ישרות, יורדים בשליטה ולא בנפילה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'פלאנק עם נגיעות כתף',
    name_en: 'Plank Shoulder Tap',
    movement_category: 'core',
    target_areas: ['core', 'shoulders'],
    equipment: ['mat'],
    difficulty: 'intermediate',
    instructions: 'פלאנק גבוה, נוגעים לסירוגין בכתף הנגדית בלי להזיז את האגן.',
    safety_cues: 'רגליים רחבות מייצבות, האגן נשאר מקובע.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'טוויסט רוסי',
    name_en: 'Russian Twist',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'ישיבה בזווית אחורה, מסובבים את פלג הגוף העליון מצד לצד.',
    safety_cues: 'הסיבוב מהצלעות ולא מהידיים, הגב ישר.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'גלגול לאחור',
    name_en: 'Hollow Rock',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'advanced',
    instructions: 'מתנוחת הולו, מתנדנדים קדימה ואחורה בלי לשבור את צורת הגוף.',
    safety_cues: 'הצורה קודמת לתנופה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'אצבעות למוט',
    name_en: 'Toes to Bar',
    movement_category: 'core',
    target_areas: ['core', 'back'],
    equipment: ['pullup_bar'],
    difficulty: 'advanced',
    instructions: 'תלייה על המתח, מביאים את קצות האצבעות למוט ומורידים בשליטה.',
    safety_cues: 'מתחילים מכתפיים פעילות, בלי לזרוק את הרגליים.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'החזקת רגליים',
    name_en: 'Leg Raise Hold',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'intermediate',
    instructions: 'שכיבה על הגב, מחזיקים את הרגליים ישרות כמה סנטימטרים מהרצפה.',
    safety_cues: 'הגב התחתון צמוד לרצפה. אם הוא מתרומם - מרימים את הרגליים גבוה יותר.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'כפיפות בטן אופניים',
    name_en: 'Bicycle Crunch',
    movement_category: 'core',
    target_areas: ['core'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'שכיבה על הגב, מקרבים מרפק לברך הנגדית לסירוגין בקצב מבוקר.',
    safety_cues: 'הצוואר רפוי, לא מושכים את הראש בידיים.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'סקוואט גבי',
    name_en: 'Back Squat',
    movement_category: 'squat',
    target_areas: ['legs', 'glutes', 'core'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: 'עמידה ברוחב אגן, המוט על הגב העליון. יורדים באגן אחורה ומטה עד שהירך מקבילה לרצפה, ועולים בדחיפה דרך כל כף הרגל.',
    safety_cues: 'שומרים על גב ניטרלי, הברכיים בכיוון האצבעות, לא קורסים פנימה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'דדליפט',
    name_en: 'Deadlift',
    movement_category: 'hinge',
    target_areas: ['back', 'glutes', 'legs'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: 'המוט קרוב לשוקיים, אחיזה מעט מחוץ לרגליים. דוחפים את הרצפה ומיישרים אגן וברכיים יחד.',
    safety_cues: 'ליבה נעולה, המוט צמוד לגוף, בלי לעגל את הגב התחתון.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'לחיצת חזה במוט',
    name_en: 'Bench Press',
    movement_category: 'push',
    target_areas: ['chest', 'shoulders', 'arms'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: 'שכיבה על הספסל, אחיזה מעט רחבה מהכתפיים. מורידים לאזור החזה התחתון ודוחפים למעלה.',
    safety_cues: 'שומרים על שורשי כף יד ישרים ועל מרפקים בזווית 45 מעלות.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'מתח',
    name_en: 'Pull Up',
    movement_category: 'pull',
    target_areas: ['back', 'arms', 'core'],
    equipment: ['pullup_bar'],
    difficulty: 'advanced',
    instructions: 'תלייה מלאה, מושכים את עצם החזה לכיוון המוט ויורדים בשליטה.',
    safety_cues: 'מתחילים מכתפיים פעילות, בלי נדנוד מיותר.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'שכיבות סמיכה',
    name_en: 'Push Up',
    movement_category: 'push',
    target_areas: ['chest', 'shoulders', 'core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: 'פלאנק גבוה, יורדים עד שהחזה קרוב לרצפה ודוחפים חזרה.',
    safety_cues: 'הגוף בקו אחד, אגן לא צונח.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'סוויינג קטלבל',
    name_en: 'Kettlebell Swing',
    movement_category: 'hinge',
    target_areas: ['glutes', 'back', 'core'],
    equipment: ['kettlebell'],
    difficulty: 'intermediate',
    instructions: 'כפיפת ירך, מניפים את הקטלבל לגובה החזה בדחיפת אגן חדה.',
    safety_cues: 'התנועה מגיעה מהאגן ולא מהידיים, גב ניטרלי.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'גובלט סקוואט',
    name_en: 'Goblet Squat',
    movement_category: 'squat',
    target_areas: ['legs', 'glutes'],
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    instructions: 'מחזיקים משקולת מול החזה ויורדים לסקוואט עמוק ככל שמתאפשר.',
    safety_cues: 'חזה פתוח, עקבים על הרצפה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'מכרעים בהליכה',
    name_en: 'Walking Lunge',
    movement_category: 'squat',
    target_areas: ['legs', 'glutes', 'core'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: 'צעד קדימה, יורדים עד שהברך האחורית קרובה לרצפה, ומתקדמים.',
    safety_cues: 'הברך הקדמית מעל כף הרגל, גוף זקוף.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'חתירה בהרכנה',
    name_en: 'Bent Over Row',
    movement_category: 'pull',
    target_areas: ['back', 'arms'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: 'כפיפת ירך לזווית 45 מעלות, מושכים את המוט לבטן התחתונה.',
    safety_cues: 'בלי לזרוק את הגוף, שכמות נסגרות בסוף התנועה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'פלאנק',
    name_en: 'Plank',
    movement_category: 'core',
    target_areas: ['core', 'shoulders'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'נשענים על אמות וכפות רגליים, שומרים על קו ישר מהראש לעקבים.',
    safety_cues: 'אגן באמצע, נושמים ברציפות.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'הליכת חקלאי',
    name_en: 'Farmer Carry',
    movement_category: 'carry',
    target_areas: ['core', 'shoulders', 'back'],
    equipment: ['kettlebell'],
    difficulty: 'beginner',
    instructions: 'אוחזים משקל כבד בשתי הידיים והולכים במסלול ישר.',
    safety_cues: 'כתפיים אחורה, צעדים קטנים ויציבים.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'ברפי',
    name_en: 'Burpee',
    movement_category: 'conditioning',
    target_areas: ['full_body'],
    equipment: ['none'],
    difficulty: 'intermediate',
    instructions: 'יורדים לשכיבת סמיכה, קופצים חזרה לעמידה וקפיצה קלה למעלה.',
    safety_cues: 'נחיתה רכה, שומרים על קצב נשימה יציב.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'קפיצה על קופסה',
    name_en: 'Box Jump',
    movement_category: 'conditioning',
    target_areas: ['legs', 'glutes'],
    equipment: ['box'],
    difficulty: 'intermediate',
    instructions: 'קפיצה דו-רגלית לקופסה ונחיתה מלאה, יורדים בצעד.',
    safety_cues: 'נוחתים עם ברכיים רכות, לא קופצים חזרה למטה.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'חתירה במכשיר',
    name_en: 'Rowing Machine',
    movement_category: 'conditioning',
    target_areas: ['back', 'legs', 'core'],
    equipment: ['rower'],
    difficulty: 'beginner',
    instructions: 'דחיפה מהרגליים, פתיחת אגן ולבסוף משיכת ידיים. חוזרים בסדר הפוך.',
    safety_cues: 'לא מושכים לפני שהרגליים סיימו לדחוף.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'מתיחת מכופפי ירך',
    name_en: 'Hip Flexor Stretch',
    movement_category: 'mobility',
    target_areas: ['hips', 'legs'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'עמידת אבירים, דוחפים אגן קדימה ומחזיקים נשימה עמוקה.',
    safety_cues: 'בלי לקשת את הגב התחתון.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'סיבוב גב עליון',
    name_en: 'Thoracic Rotation',
    movement_category: 'mobility',
    target_areas: ['thoracic', 'shoulders'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'שכיבה על הצד, ברך עליונה נשענת, פותחים את היד העליונה לצד השני.',
    safety_cues: 'התנועה מהגב העליון, האגן נשאר יציב.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'חתול פרה',
    name_en: 'Cat Cow',
    movement_category: 'mobility',
    target_areas: ['thoracic', 'core'],
    equipment: ['mat'],
    difficulty: 'beginner',
    instructions: 'בשש, מתחלפים בין קימור לקישות בסנכרון עם הנשימה.',
    safety_cues: 'תנועה איטית וללא כאב.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'לחיצת כתפיים',
    name_en: 'Overhead Press',
    movement_category: 'push',
    target_areas: ['shoulders', 'arms', 'core'],
    equipment: ['barbell'],
    difficulty: 'intermediate',
    instructions: 'מוט בגובה עצמות הבריח, דוחפים מעל הראש עד יישור מרפקים.',
    safety_cues: 'צלעות סגורות, בלי לקשת את הגב.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'מאונטן קלימברס',
    name_en: 'Mountain Climbers',
    movement_category: 'conditioning',
    target_areas: ['core', 'shoulders'],
    equipment: ['none'],
    difficulty: 'beginner',
    instructions: 'מפלאנק גבוה, מביאים ברכיים לחזה לסירוגין בקצב מהיר.',
    safety_cues: 'אגן לא עולה, שומרים על קו ישר.',
    media_url: null,
    archived: false,
  },
  {
    name_he: 'משיכת גומייה',
    name_en: 'Band Pull Apart',
    movement_category: 'pull',
    target_areas: ['shoulders', 'back'],
    equipment: ['bands'],
    difficulty: 'beginner',
    instructions: 'ידיים ישרות מול הגוף, פותחים גומייה לצדדים וסוגרים שכמות.',
    safety_cues: 'בלי להרים כתפיים לאוזניים.',
    media_url: null,
    archived: false,
  },
];

interface ClassSeed {
  weekday: number;
  time: string;
  title: string;
  category: GymClass['category'];
  difficulty: GymClass['difficulty'];
  trainerIndex: 0 | 1;
  capacity: number;
  duration: number;
  equipment: GymClass['equipment'];
  description: string;
}

const WEEK_TEMPLATE: ClassSeed[] = [
  { weekday: 0, time: '07:00', title: 'אימון כוח', category: 'strength', difficulty: 'intermediate', trainerIndex: 0, capacity: 5, duration: 60, equipment: ['barbell', 'dumbbell'], description: 'אימון כוח מובנה סביב סקוואט, דדליפט ולחיצות. מתקדמים בעומס לפי הרגשה ומסיימים בעבודת ליבה.' },
  { weekday: 0, time: '18:30', title: 'אימון פונקציונלי', category: 'functional', difficulty: 'beginner', trainerIndex: 1, capacity: 5, duration: 45, equipment: ['kettlebell', 'box'], description: 'תחנות של דחיפה, משיכה, נשיאה וקפיצה. מתאים לכל הרמות עם התאמות אישיות.' },
  { weekday: 1, time: '06:30', title: 'טבאטה', category: 'tabata', difficulty: 'intermediate', trainerIndex: 1, capacity: 5, duration: 30, equipment: ['none'], description: 'שמונה סבבים של 20 שניות עבודה ו-10 שניות מנוחה, ארבעה בלוקים. קצר, חד ויעיל.' },
  { weekday: 1, time: '19:00', title: 'אימון כוח', category: 'strength', difficulty: 'advanced', trainerIndex: 0, capacity: 5, duration: 60, equipment: ['barbell'], description: 'בלוק כוח מתקדם עם עבודה כבדה על תרגילי יסוד ומנוחות ארוכות.' },
  { weekday: 2, time: '07:00', title: 'מוביליטי', category: 'mobility', difficulty: 'beginner', trainerIndex: 1, capacity: 5, duration: 30, equipment: ['mat', 'bands'], description: 'שחרור אגן, גב עליון וכתפיים. מושלם ליום שאחרי אימון כבד.' },
  { weekday: 2, time: '18:30', title: 'אימון פונקציונלי', category: 'functional', difficulty: 'intermediate', trainerIndex: 0, capacity: 5, duration: 45, equipment: ['kettlebell', 'rower'], description: 'מעגלים מתמשכים בקצב בינוני עם דגש על טכניקה נקייה תחת עייפות.' },
  { weekday: 3, time: '06:30', title: 'אימון כוח', category: 'strength', difficulty: 'intermediate', trainerIndex: 0, capacity: 5, duration: 60, equipment: ['barbell', 'dumbbell'], description: 'דגש על פלג גוף עליון: לחיצות, חתירות ומתח, עם עבודת ייצוב.' },
  { weekday: 3, time: '19:00', title: 'טבאטה', category: 'tabata', difficulty: 'beginner', trainerIndex: 1, capacity: 5, duration: 30, equipment: ['none'], description: 'גרסה נגישה של טבאטה עם תרגילי משקל גוף בלבד.' },
  { weekday: 4, time: '07:00', title: 'אימון פתוח', category: 'open', difficulty: 'intermediate', trainerIndex: 0, capacity: 5, duration: 60, equipment: ['barbell', 'dumbbell', 'kettlebell'], description: 'מתאמנים לפי התוכנית האישית שלכם, עם ליווי והתאמות מהמאמן.' },
  { weekday: 5, time: '08:00', title: 'אימון פונקציונלי', category: 'functional', difficulty: 'beginner', trainerIndex: 1, capacity: 5, duration: 45, equipment: ['kettlebell', 'box', 'bands'], description: 'אימון סוף שבוע אנרגטי בקבוצה גדולה, מסיימים במתיחות ארוכות.' },
  { weekday: 6, time: '19:30', title: 'מוביליטי', category: 'mobility', difficulty: 'beginner', trainerIndex: 1, capacity: 5, duration: 30, equipment: ['mat'], description: 'פתיחת שבוע רגועה: נשימה, טווחי תנועה ושחרור כללי.' },
];

export function buildSeed(anchor: Date = new Date()): SeedData {
  const organization: Organization = {
    id: ORG_ID,
    name: 'GLoW',
    slug: 'glow',
    timezone: 'Asia/Jerusalem',
    week_starts_on: 0,
    booking_cutoff_minutes: 30,
    cancel_cutoff_minutes: 120,
    waitlist_enabled: true,
    created_at: TS,
    updated_at: TS,
  };

  const profiles: Profile[] = [
    profile(PROFILE_IDS.owner, 'owner@glow.fit', 'נועה ברק', '050-1112233', 'advanced'),
    profile(PROFILE_IDS.trainer1, 'idan@glow.fit', 'עידן כהן', '050-2223344', 'advanced'),
    profile(PROFILE_IDS.trainer2, 'maya@glow.fit', 'מאיה לוי', '050-3334455', 'advanced'),
    profile(PROFILE_IDS.member1, 'yuval@glow.fit', 'יובל אדרי', '052-4445566', 'intermediate'),
    profile(PROFILE_IDS.member2, 'tal@glow.fit', 'טל שרון', '052-5556677', 'beginner'),
    profile(PROFILE_IDS.member3, 'roni@glow.fit', 'רוני גל', '053-6667788', 'intermediate'),
    profile(PROFILE_IDS.member4, 'omer@glow.fit', 'עומר נחום', '054-7778899', 'advanced'),
    profile(PROFILE_IDS.member5, 'shira@glow.fit', 'שירה פלד', '054-8889900', 'beginner'),
    profile(PROFILE_IDS.applicant, 'dana@glow.fit', 'דנה אביב', '052-4443322', 'beginner'),
  ];

  const memberships: Membership[] = DEMO_ACCOUNTS.map((account, index) => ({
    id: id(index + 1, '200'),
    organization_id: ORG_ID,
    profile_id: account.id,
    role: account.role,
    status: 'active',
    approved_at: 'approved' in account && account.approved === false ? null : TS,
    approved_by: null,
    joined_at: TS,
    created_at: TS,
    updated_at: TS,
  }));

  const trainers: Trainer[] = [
    {
      id: id(1, '300'),
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.trainer1,
      display_name: 'עידן כהן',
      bio: 'מאמן כוח עם התמחות בתרגילי יסוד והתקדמות הדרגתית.',
      specialties: ['strength', 'functional'],
      active: true,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(2, '300'),
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.trainer2,
      display_name: 'מאיה לוי',
      bio: 'מתמחה במוביליטי, סיבולת ואימוני אינטרוולים.',
      specialties: ['mobility', 'tabata', 'conditioning'],
      active: true,
      created_at: TS,
      updated_at: TS,
    },
  ];

  const exercises: Exercise[] = EXERCISE_SEED.map((exercise, index) => ({
    ...exercise,
    id: id(index + 1, '400'),
    organization_id: ORG_ID,
    created_at: TS,
    updated_at: TS,
  }));

  const byName = (nameEn: string) => exercises.find((e) => e.name_en === nameEn)!.id;

  // Classes: previous week (history), current week and next week.
  const classes: GymClass[] = [];
  const series: ClassSeries[] = [];
  const weekOffsets = [-1, 0, 1];

  const uniqueSeries = new Map<string, ClassSeries>();
  WEEK_TEMPLATE.forEach((seed, index) => {
    const key = `${seed.title}-${seed.time}-${seed.weekday}`;
    uniqueSeries.set(key, {
      id: id(index + 1, '500'),
      organization_id: ORG_ID,
      title: seed.title,
      description: seed.description,
      category: seed.category,
      difficulty: seed.difficulty,
      trainer_id: trainers[seed.trainerIndex].id,
      location: 'אולם GLoW',
      capacity: seed.capacity,
      duration_minutes: seed.duration,
      equipment: seed.equipment,
      recurrence: {
        weekdays: [seed.weekday],
        start_date: format(toGymTime(addDays(anchor, -14)), 'yyyy-MM-dd'),
        end_date: format(toGymTime(addDays(anchor, 60)), 'yyyy-MM-dd'),
        start_time: seed.time,
      },
      active: true,
      created_at: TS,
      updated_at: TS,
    });
  });
  series.push(...uniqueSeries.values());

  let classCounter = 0;
  for (const offset of weekOffsets) {
    const days = gymWeekDays(addDays(anchor, offset * 7));
    WEEK_TEMPLATE.forEach((seed, index) => {
      const dayStr = days[seed.weekday];
      const startsAt = fromGymTime(dayStr, seed.time);
      const endsAt = new Date(startsAt.getTime() + seed.duration * 60_000);
      classCounter += 1;
      classes.push({
        id: id(classCounter, '600'),
        organization_id: ORG_ID,
        series_id: series[index].id,
        title: seed.title,
        description: seed.description,
        category: seed.category,
        difficulty: seed.difficulty,
        trainer_id: trainers[seed.trainerIndex].id,
        location: 'אולם GLoW',
        capacity: seed.capacity,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        equipment: seed.equipment,
        status: 'scheduled',
        published: true,
        registration_closed: false,
        notes: null,
        created_at: TS,
        updated_at: TS,
      });
    });
  }

  // --- Bookings ----------------------------------------------------------
  const members = [
    PROFILE_IDS.member1,
    PROFILE_IDS.member2,
    PROFILE_IDS.member3,
    PROFILE_IDS.member4,
    PROFILE_IDS.member5,
  ];
  const bookings: Booking[] = [];
  const attendance: Attendance[] = [];
  let bookingCounter = 0;
  const nowMs = anchor.getTime();

  classes.forEach((gymClass, classIndex) => {
    const isPast = new Date(gymClass.starts_at).getTime() < nowMs;
    // Deterministic pseudo-random participation.
    const participants = members.filter((_, memberIndex) => (classIndex + memberIndex * 3) % 4 !== 0);
    let confirmed = 0;
    let waitlistPosition = 0;

    participants.forEach((profileId) => {
      bookingCounter += 1;
      const bookedAt = new Date(
        new Date(gymClass.starts_at).getTime() - (48 + bookingCounter) * 3_600_000,
      ).toISOString();

      let status: Booking['status'];
      let position: number | null = null;
      if (confirmed < gymClass.capacity) {
        confirmed += 1;
        status = isPast ? ((classIndex + confirmed) % 7 === 0 ? 'absent' : 'attended') : 'confirmed';
      } else {
        waitlistPosition += 1;
        position = waitlistPosition;
        status = isPast ? 'cancelled' : 'waitlisted';
      }

      bookings.push({
        id: id(bookingCounter, '700'),
        organization_id: ORG_ID,
        class_id: gymClass.id,
        profile_id: profileId,
        status,
        waitlist_position: position,
        booked_at: bookedAt,
        cancelled_at: status === 'cancelled' ? bookedAt : null,
        promoted_at: null,
        created_at: bookedAt,
        updated_at: bookedAt,
      });

      if (status === 'attended' || status === 'absent') {
        attendance.push({
          id: id(bookingCounter, '800'),
          organization_id: ORG_ID,
          class_id: gymClass.id,
          profile_id: profileId,
          present: status === 'attended',
          checked_in_at: status === 'attended' ? gymClass.starts_at : null,
          marked_by: PROFILE_IDS.trainer1,
          method: 'manual',
          created_at: gymClass.starts_at,
          updated_at: gymClass.starts_at,
        });
      }
    });
  });

  // --- Workout templates -------------------------------------------------
  const templates: WorkoutTemplate[] = [
    {
      id: id(1, '900'),
      organization_id: ORG_ID,
      title: 'בסיס כוח - פלג גוף תחתון',
      description: 'בלוק כוח קלאסי סביב סקוואט ודדליפט עם עבודת ליבה מסכמת.',
      goal: 'strength',
      difficulty: 'intermediate',
      duration_minutes: 60,
      equipment: ['barbell', 'kettlebell', 'mat'],
      focus_areas: ['legs', 'glutes', 'core'],
      movement_categories: ['squat', 'hinge', 'core'],
      created_by: PROFILE_IDS.trainer1,
      approved: true,
      suggestable: true,
      archived: false,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(2, '900'),
      organization_id: ORG_ID,
      title: 'דחיפה ומשיכה - 45 דקות',
      description: 'עבודת פלג גוף עליון מאוזנת בין דחיפה למשיכה.',
      goal: 'strength',
      difficulty: 'intermediate',
      duration_minutes: 45,
      equipment: ['barbell', 'dumbbell', 'pullup_bar'],
      focus_areas: ['chest', 'back', 'shoulders'],
      movement_categories: ['push', 'pull'],
      created_by: PROFILE_IDS.trainer1,
      approved: true,
      suggestable: true,
      archived: false,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(3, '900'),
      organization_id: ORG_ID,
      title: 'סיבולת מהירה - 20 דקות',
      description: 'מעגל קצר בעצימות גבוהה עם משקל גוף בלבד.',
      goal: 'conditioning',
      difficulty: 'intermediate',
      duration_minutes: 20,
      equipment: ['none'],
      focus_areas: ['full_body', 'core'],
      movement_categories: ['conditioning', 'core'],
      created_by: PROFILE_IDS.trainer2,
      approved: true,
      suggestable: true,
      archived: false,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(4, '900'),
      organization_id: ORG_ID,
      title: 'מוביליטי והתאוששות',
      description: 'רצף שחרור לאגן, גב עליון וכתפיים. מתאים ליום אחרי אימון כבד.',
      goal: 'mobility',
      difficulty: 'beginner',
      duration_minutes: 20,
      equipment: ['mat', 'bands'],
      focus_areas: ['hips', 'thoracic', 'shoulders'],
      movement_categories: ['mobility'],
      created_by: PROFILE_IDS.trainer2,
      approved: true,
      suggestable: true,
      archived: false,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(5, '900'),
      organization_id: ORG_ID,
      title: 'טכניקה - תרגילי יסוד',
      description: 'עבודה במשקלים קלים על איכות תנועה, טווחים ושליטה.',
      goal: 'technique',
      difficulty: 'beginner',
      duration_minutes: 30,
      equipment: ['dumbbell', 'mat'],
      focus_areas: ['full_body'],
      movement_categories: ['squat', 'hinge', 'push'],
      created_by: PROFILE_IDS.trainer1,
      approved: true,
      suggestable: true,
      archived: false,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(6, '900'),
      organization_id: ORG_ID,
      title: 'כושר כללי - 30 דקות',
      description: 'שילוב של כוח וסיבולת בזמן קצר, עם ציוד מינימלי.',
      goal: 'general',
      difficulty: 'beginner',
      duration_minutes: 30,
      equipment: ['dumbbell', 'kettlebell'],
      focus_areas: ['full_body', 'legs'],
      movement_categories: ['squat', 'push', 'conditioning'],
      created_by: PROFILE_IDS.owner,
      approved: true,
      suggestable: true,
      archived: false,
      created_at: TS,
      updated_at: TS,
    },
  ];

  const te = (
    templateId: string,
    n: number,
    exerciseName: string,
    block: WorkoutTemplateExercise['block'],
    position: number,
    fields: Partial<WorkoutTemplateExercise>,
  ): WorkoutTemplateExercise => ({
    id: id(n, '950'),
    template_id: templateId,
    exercise_id: byName(exerciseName),
    block,
    position,
    sets: null,
    reps: null,
    load_kg: null,
    duration_seconds: null,
    distance_meters: null,
    rest_seconds: null,
    trainer_notes: null,
    alternative_exercise_ids: [],
    ...fields,
  });

  const templateExercises: WorkoutTemplateExercise[] = [
    te(templates[0].id, 1, 'Cat Cow', 'warmup', 1, { sets: 1, duration_seconds: 90 }),
    te(templates[0].id, 2, 'Back Squat', 'main', 2, { sets: 5, reps: 5, load_kg: 60, rest_seconds: 150, trainer_notes: 'מוסיפים 2.5 ק״ג אם כל הסטים נקיים.', alternative_exercise_ids: [byName('Goblet Squat')] }),
    te(templates[0].id, 3, 'Deadlift', 'main', 3, { sets: 3, reps: 5, load_kg: 80, rest_seconds: 180, alternative_exercise_ids: [byName('Kettlebell Swing')] }),
    te(templates[0].id, 4, 'Walking Lunge', 'main', 4, { sets: 3, reps: 20, rest_seconds: 90 }),
    te(templates[0].id, 5, 'Plank', 'cooldown', 5, { sets: 3, duration_seconds: 45, rest_seconds: 45 }),

    te(templates[1].id, 6, 'Band Pull Apart', 'warmup', 1, { sets: 2, reps: 15 }),
    te(templates[1].id, 7, 'Bench Press', 'main', 2, { sets: 4, reps: 6, load_kg: 50, rest_seconds: 150, alternative_exercise_ids: [byName('Push Up')] }),
    te(templates[1].id, 8, 'Pull Up', 'main', 3, { sets: 4, reps: 6, rest_seconds: 150, alternative_exercise_ids: [byName('Bent Over Row')] }),
    te(templates[1].id, 9, 'Overhead Press', 'main', 4, { sets: 3, reps: 8, load_kg: 30, rest_seconds: 120 }),
    te(templates[1].id, 10, 'Farmer Carry', 'finisher', 5, { sets: 3, distance_meters: 40, rest_seconds: 60 }),

    te(templates[2].id, 11, 'Mountain Climbers', 'warmup', 1, { sets: 1, duration_seconds: 60 }),
    te(templates[2].id, 12, 'Burpee', 'main', 2, { sets: 4, duration_seconds: 40, rest_seconds: 20 }),
    te(templates[2].id, 13, 'Box Jump', 'main', 3, { sets: 4, reps: 10, rest_seconds: 40, alternative_exercise_ids: [byName('Walking Lunge')] }),
    te(templates[2].id, 14, 'Push Up', 'main', 4, { sets: 4, reps: 12, rest_seconds: 40 }),

    te(templates[3].id, 15, 'Cat Cow', 'warmup', 1, { sets: 2, duration_seconds: 60 }),
    te(templates[3].id, 16, 'Hip Flexor Stretch', 'main', 2, { sets: 2, duration_seconds: 60 }),
    te(templates[3].id, 17, 'Thoracic Rotation', 'main', 3, { sets: 2, duration_seconds: 60 }),
    te(templates[3].id, 18, 'Band Pull Apart', 'cooldown', 4, { sets: 2, reps: 20 }),

    te(templates[4].id, 19, 'Goblet Squat', 'main', 1, { sets: 3, reps: 8, load_kg: 12, rest_seconds: 90, trainer_notes: 'עוצרים שנייה בתחתית כל חזרה.' }),
    te(templates[4].id, 20, 'Kettlebell Swing', 'main', 2, { sets: 3, reps: 12, load_kg: 16, rest_seconds: 90 }),
    te(templates[4].id, 21, 'Push Up', 'main', 3, { sets: 3, reps: 8, rest_seconds: 60 }),
    te(templates[4].id, 22, 'Plank', 'cooldown', 4, { sets: 2, duration_seconds: 40 }),

    te(templates[5].id, 23, 'Goblet Squat', 'main', 1, { sets: 3, reps: 12, load_kg: 16, rest_seconds: 60 }),
    te(templates[5].id, 24, 'Push Up', 'main', 2, { sets: 3, reps: 10, rest_seconds: 60 }),
    te(templates[5].id, 25, 'Kettlebell Swing', 'main', 3, { sets: 3, reps: 15, load_kg: 16, rest_seconds: 60 }),
    te(templates[5].id, 26, 'Mountain Climbers', 'finisher', 4, { sets: 3, duration_seconds: 40, rest_seconds: 30 }),
  ];

  // --- Past workout sessions for the primary demo member -----------------
  const sessions: WorkoutSession[] = [];
  const sets: WorkoutSet[] = [];
  let setCounter = 0;

  const history = [
    { daysAgo: 2, templateIndex: 0, effort: 8 },
    { daysAgo: 5, templateIndex: 1, effort: 7 },
    { daysAgo: 9, templateIndex: 2, effort: 9 },
    { daysAgo: 12, templateIndex: 0, effort: 7 },
    { daysAgo: 16, templateIndex: 5, effort: 6 },
    { daysAgo: 21, templateIndex: 1, effort: 8 },
    { daysAgo: 28, templateIndex: 3, effort: 4 },
    { daysAgo: 35, templateIndex: 0, effort: 7 },
  ];

  history.forEach((entry, index) => {
    const template = templates[entry.templateIndex];
    const startedAt = new Date(nowMs - entry.daysAgo * 86_400_000);
    const completedAt = new Date(startedAt.getTime() + template.duration_minutes * 60_000);
    const sessionId = id(index + 1, '960');
    const exercisesForTemplate = templateExercises
      .filter((t) => t.template_id === template.id)
      .sort((a, b) => a.position - b.position);

    sessions.push({
      id: sessionId,
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.member1,
      template_id: template.id,
      title: template.title,
      goal: template.goal,
      status: 'completed',
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      total_seconds: template.duration_minutes * 60,
      average_effort: entry.effort,
      notes: index === 0 ? 'הרגשתי חזק, הוספתי משקל בסט האחרון.' : null,
      exercises: exercisesForTemplate.map((t) => ({
        exercise_id: t.exercise_id,
        position: t.position,
        target_sets: t.sets,
        target_reps: t.reps,
        target_load_kg: t.load_kg,
        target_duration_seconds: t.duration_seconds,
        target_distance_meters: t.distance_meters,
        rest_seconds: t.rest_seconds,
        notes: t.trainer_notes,
      })),
      created_at: startedAt.toISOString(),
      updated_at: completedAt.toISOString(),
    });

    exercisesForTemplate.forEach((templateExercise) => {
      const totalSets = templateExercise.sets ?? 3;
      for (let setIndex = 1; setIndex <= totalSets; setIndex += 1) {
        setCounter += 1;
        // Gentle linear progression backwards in time.
        const progression = 1 - entry.daysAgo * 0.004;
        sets.push({
          id: id(setCounter, '970'),
          session_id: sessionId,
          exercise_id: templateExercise.exercise_id,
          position: templateExercise.position,
          set_index: setIndex,
          reps: templateExercise.reps,
          load_kg: templateExercise.load_kg
            ? Math.round(templateExercise.load_kg * progression * 2) / 2
            : null,
          duration_seconds: templateExercise.duration_seconds,
          distance_meters: templateExercise.distance_meters,
          effort: entry.effort,
          notes: null,
          completed_at: new Date(
            startedAt.getTime() + setIndex * 4 * 60_000 + templateExercise.position * 60_000,
          ).toISOString(),
          created_at: startedAt.toISOString(),
        });
      }
    });
  });

  // --- Readiness ---------------------------------------------------------
  const readiness: ReadinessLog[] = [1, 2, 3, 5, 8].map((daysAgo, index) => {
    const date = toGymTime(new Date(nowMs - daysAgo * 86_400_000));
    return {
      id: id(index + 1, '980'),
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.member1,
      log_date: format(date, 'yyyy-MM-dd'),
      energy: [4, 3, 5, 3, 4][index],
      soreness: [2, 4, 1, 3, 2][index],
      sleep_quality: [4, 3, 5, 2, 4][index],
      available_minutes: [45, 30, 60, 20, 45][index],
      note: index === 1 ? 'רגליים תפוסות מהאימון של אתמול.' : null,
      created_at: TS,
      updated_at: TS,
    };
  });

  const timerPresets: TimerPreset[] = [
    {
      id: id(1, '990'),
      organization_id: ORG_ID,
      profile_id: null,
      name: 'טבאטה קלאסי',
      prepare_seconds: 10,
      work_seconds: 20,
      rest_seconds: 10,
      rounds: 8,
      sets: 1,
      rest_between_sets_seconds: 60,
      cooldown_seconds: 0,
      is_public: true,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(2, '990'),
      organization_id: ORG_ID,
      profile_id: null,
      name: 'EMOM 10 דקות',
      prepare_seconds: 15,
      work_seconds: 45,
      rest_seconds: 15,
      rounds: 10,
      sets: 1,
      rest_between_sets_seconds: 0,
      cooldown_seconds: 60,
      is_public: true,
      created_at: TS,
      updated_at: TS,
    },
    {
      id: id(3, '990'),
      organization_id: ORG_ID,
      profile_id: null,
      name: 'אינטרוולים 40/20',
      prepare_seconds: 10,
      work_seconds: 40,
      rest_seconds: 20,
      rounds: 6,
      sets: 3,
      rest_between_sets_seconds: 90,
      cooldown_seconds: 120,
      is_public: true,
      created_at: TS,
      updated_at: TS,
    },
  ];

  const inviteLinks: InviteLink[] = [
    {
      id: id(1, '991'),
      organization_id: ORG_ID,
      token: 'glow-demo-invite',
      label: 'הזמנה כללית לחברים',
      created_by: PROFILE_IDS.owner,
      expires_at: new Date(nowMs + 30 * 86_400_000).toISOString(),
      max_uses: null,
      uses: 7,
      revoked: false,
      created_at: TS,
      updated_at: TS,
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: id(1, '992'),
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.member1,
      type: 'schedule_published',
      title: 'הלוח השבועי החדש פורסם',
      body: 'אפשר להירשם לשיעורים של השבוע הקרוב.',
      link: '/schedule',
      read_at: null,
      delivery_status: 'skipped_no_provider',
      delivery_error: null,
      created_at: new Date(nowMs - 3_600_000).toISOString(),
    },
    {
      id: id(2, '992'),
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.member1,
      type: 'announcement',
      title: 'הודעת מאמן',
      body: 'ביום שישי נתחיל בשעה 08:00 בדיוק, מומלץ להגיע 10 דקות קודם לחימום.',
      link: null,
      read_at: null,
      delivery_status: 'skipped_no_provider',
      delivery_error: null,
      created_at: new Date(nowMs - 26 * 3_600_000).toISOString(),
    },
  ];

  // --- workout of the day ----------------------------------------------------
  const workouts = libraryWorkouts(ORG_ID, TS);

  // Every class gets a workout from its own family, picked deterministically so
  // the demo week looks the same on every machine and in every test run.
  const classWorkouts: ClassWorkout[] = classes.map((gymClass, index) => {
    const family = WORKOUT_FAMILY[gymClass.category];
    const pool = WORKOUT_LIBRARY.filter((entry) => entry.category === family);
    const entry = pool[index % pool.length];
    return {
      class_id: gymClass.id,
      organization_id: ORG_ID,
      workout_id: workoutLibraryId(entry.slug),
      notes: null,
      assigned_by: PROFILE_IDS.trainer1,
      created_at: TS,
      updated_at: TS,
    };
  });

  // A short history for one member, so the progress screen has something to
  // compare against rather than an empty state on first open.
  const pastWithWorkout = classes
    .filter((gymClass) => new Date(gymClass.starts_at).getTime() < nowMs)
    .slice(-6);
  const workoutLogs: WorkoutLog[] = pastWithWorkout.map((gymClass, index) => {
    const link = classWorkouts.find((cw) => cw.class_id === gymClass.id)!;
    const workout = workouts.find((w) => w.id === link.workout_id)!;
    const improving = index / Math.max(1, pastWithWorkout.length - 1);
    return {
      id: id(index + 1, '993'),
      organization_id: ORG_ID,
      profile_id: PROFILE_IDS.member1,
      workout_id: workout.id,
      class_id: gymClass.id,
      performed_on: format(toGymTime(new Date(gymClass.starts_at)), 'yyyy-MM-dd'),
      score_type: workout.score_type,
      result_seconds:
        workout.score_type === 'time' ? Math.round(720 - improving * 90) : null,
      result_rounds:
        workout.score_type === 'rounds_and_reps' ? 12 + Math.round(improving * 4) : null,
      result_reps:
        workout.score_type === 'rounds_and_reps'
          ? 7
          : workout.score_type === 'reps'
            ? 120 + Math.round(improving * 30)
            : workout.score_type === 'weight'
              ? 5
              : null,
      result_weight_kg:
        workout.score_type === 'weight' ? 60 + Math.round(improving * 10) : null,
      completed: workout.score_type === 'completion' ? true : null,
      rx: index % 3 !== 0,
      rpe: 6 + (index % 4),
      notes: index === pastWithWorkout.length - 1 ? 'הרגשתי חזק, הקצב היה יציב.' : null,
      created_at: gymClass.ends_at,
      updated_at: gymClass.ends_at,
    };
  });

  return {
    organization,
    profiles,
    memberships,
    trainers,
    series,
    classes,
    bookings,
    inviteLinks,
    attendance,
    exercises,
    templates,
    templateExercises,
    sessions,
    sets,
    readiness,
    timerPresets,
    notifications,
    workouts,
    classWorkouts,
    workoutLogs,
  };
}

export { ORG_ID, PROFILE_IDS };
