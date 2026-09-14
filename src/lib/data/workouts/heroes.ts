import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * A shelf of heroes.
 *
 * Named after Marvel characters, matched to what the session actually does
 * rather than to who is on the poster: the heavy slow one is the strongest
 * character, the long aerobic one is the character who just keeps going, the
 * one that is all grip and hanging is the one who hangs off things. A name
 * earns its place by describing the work.
 *
 * The benchmark canon - Cindy, Annie, Diane, Helen, Grace, Murph, DT, Chelsea -
 * is NOT here. It was already in crossfit.ts, written for this room, and this
 * file briefly shipped a second copy of all eight before the library's own
 * uniqueness test caught it.
 *
 * Same rules as everything else: one hour, four blocks, only what is on this
 * floor, and no load ever printed.
 */

const GENERAL_PREP = [
  'הליכון | 4 דקות בעלייה קלה, מסיימים בקצב נשימה מהיר',
  'סיבובי כתפיים, ירך וקרסול | 10 לכל כיוון',
  'סקוואט משקל גוף | 15 חזרות',
  'גשר ירך | 15 חזרות',
];

const BARBELL_PREP = [
  ...GENERAL_PREP,
  'מוט ריק: דדליפט, משיכה, דחיפה מעל הראש | 5 מכל תרגיל, 2 סבבים',
  'העלאה הדרגתית | 3 סטים של 3, עולים עד המשקל שתעבדו בו',
];

const GYMNASTICS_PREP = [
  ...GENERAL_PREP,
  'תלייה פסיבית במתח | 30 שניות, 2 סבבים',
  'משיכת שכמות בתלייה | 8 חזרות, 2 סבבים',
  'שכיבות סמיכה על הספסל | 10 חזרות, 2 סבבים',
];

const LOAD_NOTE = 'המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.';

export const HERO_WORKOUTS: LibraryWorkout[] = [
  // --- the heroes shelf ------------------------------------------------------
  {
    slug: 'hulk',
    title: 'האלק',
    subtitle: 'כבד, איטי, ובלי שום דבר מתוחכם.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['barbell', 'bench', 'hip_thrust'],
    description:
      'אימון הכוח הכבד ביותר בספרייה. סטים נמוכים, מנוחות ארוכות, ותרגילים שמזיזים את המשקל הגדול ביותר שהגוף יודע להזיז. אין כאן מטקון ואין לאן למהר - הזמן בין הסטים הוא חלק מהאימון.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 3 דקות מלאות. ${LOAD_NOTE}`,
        items: ['Back Squat | 3 חזרות', 'Deadlift | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים, לא לזמן',
        items: ['Hip Thrust | 8 חזרות', 'Bench Press | 5 חזרות', 'Farmer Carry | 40 מטר'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'סטים של 5 במשקל נוח, 3 סבבים.',
      'לפי הפרוטוקול.',
      'סטים של 2, מנוחה 4 דקות.',
    ),
    scoreType: 'weight',
  },
  {
    slug: 'black-widow',
    title: 'האלמנה השחורה',
    subtitle: 'מהיר, מדויק, ונגמר לפני שהבנת.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['kettlebell', 'dumbbell', 'mat', 'treadmill'],
    description:
      'אינטרוולים קצרים בעצימות גבוהה עם מנוחות שלמות. העבודה קצרה מספיק כדי להיות מהירה באמת, וזאת הנקודה כולה - מי שמוריד קצב כדי לשרוד את הסבב הבא פספס את האימון.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 8, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Dumbbell Snatch | 8 לכל יד'],
      },
      {
        label: 'מטקון',
        detail: '8 סבבים של 30 שניות עבודה, 90 שניות מנוחה',
        items: ['Kettlebell Swings | מקסימום חזרות', 'הליכון | ספרינט לסירוגין'],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      '5 סבבים, 20 שניות עבודה.',
      'לפי הפרוטוקול.',
      '10 סבבים, מנוחה 60 שניות.',
    ),
    scoreType: 'reps',
  },
  {
    slug: 'captain-america',
    title: 'קפטן אמריקה',
    subtitle: 'אין קיצורי דרך. פשוט ממשיכים.',
    category: 'crossfit',
    format: 'chipper',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 28,
    equipment: ['treadmill', 'pullup_bar', 'kettlebell', 'mat'],
    description:
      'צ׳יפר ארוך שעוברים תרגיל אחרי תרגיל, בלי לחזור אחורה. זה לא אימון של מהירות אלא של סירוב לעצור - האנשים שמסיימים אותו הכי מהר הם אלה שלא ישבו באמצע.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `3 סטים של 8, מנוחה דקה. ${LOAD_NOTE}`,
        items: ['Bent-over Row | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'צ׳יפר, למהירות',
        items: [
          'הליכון | 800 מטר',
          'Kettlebell Swings | 50 חזרות',
          'Push-ups | 50 חזרות',
          'Air Squats | 50 חזרות',
          'Sit-ups | 50 חזרות',
          'הליכון | 800 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '400 מטר, 30 חזרות מכל תרגיל.',
      'לפי הפרוטוקול.',
      '1200 מטר, 60 חזרות מכל תרגיל.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'black-panther',
    title: 'הפנתר השחור',
    subtitle: 'הכול ברגליים, והכול שקט.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['bench', 'dumbbell', 'mat', 'treadmill'],
    description:
      'אימון רגליים חד-צדדי: כל תרגיל על רגל אחת בכל פעם. הנחיתה צריכה להיות שקטה - אם שומעים אותה, המשקל גדול מדי או הירידה מהירה מדי.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סבבים, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Bulgarian Split Squat | 8 לכל רגל', 'Single Leg Glute Bridge | 12 לכל רגל'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, מנוחה דקה',
        items: [
          'Bench Step-ups | 12 לכל רגל',
          'Cossack Squat | 8 לכל צד',
          'Single Leg Balance | 45 שניות לכל רגל',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'משקל גוף, אחיזה בקיר לאיזון, 3 סבבים.',
      'לפי הפרוטוקול.',
      'משקולות כבדות, נחיתה בשליטה מלאה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'scarlet-witch',
    title: 'הוויץ׳ האדומה',
    subtitle: 'הכול בשליטה, כולל הנשימה.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['mat', 'bands'],
    description:
      'שיעור פילאטיס מתקדם שכולו שליטה עדינה. התנועות קטנות והעבודה עמוקה, והנשימה מכתיבה את הקצב ולא להפך. זה השיעור שבו מגלים שהליבה עייפה הרבה לפני שהיא כואבת.',
    warmup: [
      'נשימה צידית בשכיבה | 10 נשימות',
      'הטיית אגן | 10 חזרות',
      'Cat-Cow | 8 חזרות',
      'Dead Bug | 8 לכל צד',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '3 סבבים, בשליטה מלאה',
        items: ['Teaser | 6 חזרות', 'Swan | 8 חזרות', 'Side Plank with Rotation | 8 לכל צד'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים, בלי מנוחה בין תרגילים',
        items: [
          'The Hundred | סדרה מלאה',
          'Criss Cross | 20 חזרות',
          'Corkscrew | 8 לכל כיוון',
          'Side Kick Series | 12 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'טיזר עם ברכיים כפופות, 2 סבבים.',
      'לפי הפרוטוקול.',
      'גומייה בכל התרגילים, 4 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'thor',
    title: 'ת׳ור',
    subtitle: 'הכול מעל הראש.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['barbell', 'dumbbell', 'pullup_bar'],
    description:
      'אימון כתפיים מלא: כל תרגיל מסתיים עם משהו נעול מעל הראש. הכתף עובדת כאן בטווח מלא, אז החימום ארוך יותר מהרגיל וזה בכוונה.',
    warmup: [...BARBELL_PREP, 'משיכת גומייה | 15 חזרות, 2 סבבים', 'החלקות בקיר | 10 חזרות'],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Strict Press | 3 חזרות', 'Push Jerk | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, מנוחה 90 שניות',
        items: [
          'Dumbbell Push Press | 10 חזרות',
          'Overhead Squat | 8 חזרות',
          'Farmer Carry | 30 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'מקל או מוט ריק בכל תרגיל מעל הראש.',
      'לפי הפרוטוקול.',
      'אוברהד סקוואט במשקל, 5 סבבים.',
    ),
    scoreType: 'weight',
  },
  {
    slug: 'spider-man',
    title: 'ספיידרמן',
    subtitle: 'הכול בתלייה, הכול בליבה.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['pullup_bar', 'mat'],
    description:
      'אימון גופני שכולו אחיזה, תלייה ובקרת ליבה. האחיזה תיגמר לפני הבטן, וזה בסדר - זה חלק מהאימון. שחררו את המוט לפני שהיד נפתחת לבד.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: '5 סבבים, מנוחה 2 דקות',
        items: ['Strict Pull-ups | מקסימום חזרות נקיות', 'Dead Hang | מקסימום זמן'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, מנוחה דקה',
        items: [
          'Hanging Knee Raises | 10 חזרות',
          'Mountain Climbers | 30 חזרות',
          'Hollow Hold | 30 שניות',
          'Plank Shoulder Taps | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'משיכות בגומייה, הרמות ברך בשכיבה, 3 סבבים.',
      'לפי הפרוטוקול.',
      'אצבעות למוט, 5 סבבים.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'iron-man',
    title: 'איירון מן',
    subtitle: 'ארוך, יציב, ומתוכנן מראש.',
    category: 'functional',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 40,
    equipment: ['treadmill', 'bench', 'mat'],
    description:
      'החלק האירובי הארוך של הספרייה. ארבעים דקות בקצב אחד שאפשר להחזיק - לא מרוץ. אם אי אפשר לומר משפט שלם תוך כדי, הורידו את הקצב; זה לא ויתור אלא ההנחיה.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: '3 סבבים, לא לזמן',
        items: ['Bench Step-ups | 20 לכל רגל', 'Push-ups | 15 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים, למהירות',
        items: ['הליכון | 1000 מטר', 'Air Squats | 25 חזרות', 'Sit-ups | 25 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '3 סבבים של 600 מטר.',
      'לפי הפרוטוקול.',
      '6 סבבים, קצב מרוץ בסבב האחרון.',
    ),
    scoreType: 'time',
  },
];
