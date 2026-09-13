import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * The house sessions.
 *
 * The rest of the library is named the way the field names things - Fran,
 * Murph, Virabhadrasana. These are named the way this club talks. Two running
 * jokes: a wedding, from the panic of the invitation to the moment the band
 * stops, and a patisserie, because everything here is laminated, proved and
 * folded. They are real sessions - same room, same hour, same four blocks, no
 * loads printed - the joke is only ever in the name.
 *
 * A name is allowed to be funny. It is not allowed to be about anyone's body,
 * so nothing here is a "bikini", a "pre-wedding shred" or a countdown to a
 * dress size. You come out of these fitter and in on the joke, and that is the
 * whole of it.
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

export const HOUSE_WORKOUTS: LibraryWorkout[] = [
  // --- the wedding -----------------------------------------------------------
  {
    slug: 'save-the-date',
    title: 'סייב דה דייט',
    subtitle: 'התאריך נקבע. מכאן זה רק מתקרב.',
    category: 'functional',
    format: 'emom',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['kettlebell', 'treadmill', 'mat'],
    description:
      'הכול עוד רגוע, וזאת בדיוק הנקודה. EMOM של עשרים דקות שבו כל דקה מגיעה בין אם התכוננתם ובין אם לא. אל תרוצו בדקה הראשונה - יש עוד תשע עשרה, והן לא מזיזות את עצמן.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 8, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Goblet Squat | 8 חזרות', 'Bent-over Row | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'EMOM 20 דקות, מחזור של ארבע דקות',
        items: [
          'דקה 1 | Kettlebell Swings, 12 חזרות',
          'דקה 2 | Push-ups, 10 חזרות',
          'דקה 3 | Air Squats, 15 חזרות',
          'דקה 4 | מנוחה',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'קטלבל קל, שכיבות סמיכה מהספסל, 10 דקות בלבד.',
      'לפי הפרוטוקול.',
      'קטלבל כבד, 24 דקות, שכיבות סמיכה עם עצירה למטה.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'seating-chart',
    title: 'סידורי הישיבה',
    subtitle: 'כולם צריכים מקום, ואף אחד לא ליד מי שהוא רוצה.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 18,
    equipment: ['dumbbell', 'bench', 'pullup_bar', 'treadmill'],
    description:
      'ארבע תחנות שצריך לסדר ביניהן, וכמו בסידורי ישיבה אמיתיים - הסדר שבחרתם בהתחלה יתפרק באמצע. תכננו איפה אתם עוצרים לפני שאתם מגיעים לשם.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Bench Press | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 18 דקות',
        items: [
          'Dumbbell Row | 10 לכל יד',
          'Bench Step-ups | 12 לכל רגל',
          'Pull-ups | 6 חזרות',
          'הליכון | 200 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'משיכות בגומייה, מדרגה נמוכה, 12 דקות.',
      'לפי הפרוטוקול.',
      'משקולות כבדות, 24 דקות.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'the-hora',
    title: 'הורה',
    subtitle: 'מעגל שלא נגמר, ואסור לעצור באמצע.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 20,
    equipment: ['kettlebell', 'barbell', 'treadmill', 'mat'],
    description:
      'חמישה סבבים במעגל אחד רצוף. אין תחנה שבה נוח - זה העניין בהורה. מי שיוצא מהר מדי בסבב הראשון מגלה את זה בסבב השלישי, וכולם בסוף שם.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2-3 דקות. ${LOAD_NOTE}`,
        items: ['Deadlift | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים, למהירות',
        items: [
          'הליכון | 400 מטר',
          'Kettlebell Swings | 20 חזרות',
          'Burpees | 12 חזרות',
          'Sit-ups | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '3 סבבים, 200 מטר בלבד, קטלבל קל.',
      'לפי הפרוטוקול.',
      '7 סבבים, קטלבל כבד, בלי לעצור בין תחנות.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'first-dance',
    title: 'ריקוד ראשון',
    subtitle: 'איטי, כולם מסתכלים, ואי אפשר לזייף.',
    category: 'functional',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['barbell', 'bench', 'hip_thrust', 'treadmill'],
    description:
      'אימון טמפו. כל חזרה יורדת בשלוש שניות ועולה בשליטה, בלי תנופה ובלי לזייף את התחתית. זה האימון שבו מתגלה מי באמת שולט במשקל שלו - וכמו בריקוד ראשון, הכול פה במעבר בין הצעדים.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 6, טמפו 3 שניות בירידה. ${LOAD_NOTE}`,
        items: ['Back Squat | 6 חזרות', 'Romanian Deadlift | 6 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים, לא לזמן',
        items: ['Hip Thrust | 12 חזרות', 'Bench Press | 10 חזרות', 'Plank | 45 שניות'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'משקל גוף בטמפו, 3 סטים.',
      'לפי הפרוטוקול.',
      'טמפו 4 שניות בירידה, שנייה עצירה בתחתית.',
    ),
    scoreType: 'weight',
  },
  {
    slug: 'seven-blessings',
    title: 'שבע ברכות',
    subtitle: 'שבעה סבבים, ואחרי כל אחד עוד אחד.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 25,
    equipment: ['pullup_bar', 'dumbbell', 'treadmill', 'mat'],
    description:
      'שבעה סבבים של שבע חזרות. הכמות נראית קטנה על הדף וגדולה בסבב החמישי. המשקל צריך להיות כזה שהסבב האחרון עדיין נראה כמו הראשון.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `לעבוד עד סינגל כבד ליום, בלי לכשול. ${LOAD_NOTE}`,
        items: ['Strict Press | סינגל כבד'],
      },
      {
        label: 'מטקון',
        detail: '7 סבבים של 7 חזרות, למהירות',
        items: [
          'Dumbbell Thrusters | 7 חזרות',
          'Pull-ups | 7 חזרות',
          'Burpees | 7 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '5 סבבים, משקולות קלות, משיכות בגומייה.',
      'לפי הפרוטוקול.',
      '7 סבבים בלי לרדת מהמוט.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'open-bar',
    title: 'בר פתוח',
    subtitle: 'המוט זמין כל הערב. זאת לא בהכרח בשורה טובה.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['barbell', 'treadmill'],
    description:
      'הכול על המוט, מההתחלה ועד הסוף. חמישה מקטעי כוח רצופים עם מנוחות אמיתיות ביניהם. אין פה מטקון להתחבא בו - האימון הוא הטכניקה, וזה בדיוק מה שמקשה.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3 בכל תרגיל, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Power Clean | 3 חזרות', 'Front Squat | 3 חזרות', 'Push Press | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '10 דקות, קצב נוח',
        items: ['הליכון | 10 דקות בעלייה קלה'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'מוט ריק לאורך כל האימון, עבודה על מסלול.',
      'לפי הפרוטוקול.',
      'לעלות במשקל בכל סט עד סינגל כבד.',
    ),
    scoreType: 'weight',
  },
  {
    slug: 'last-song',
    title: 'השיר האחרון',
    subtitle: 'כולם עייפים, אף אחד לא הולך.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 12,
    equipment: ['kettlebell', 'mat', 'treadmill'],
    description:
      'שתים עשרה דקות אחרונות שבהן כבר אין מה לחסוך. קצב אחד לכל האורך, ומי שנשבר בדקה השמינית מסיים עם פחות סבבים ממי שיצא לאט.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `3 סטים של 10, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Goblet Squat | 10 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 12 דקות',
        items: ['Kettlebell Swings | 15 חזרות', 'Sit-ups | 15 חזרות', 'הליכון | 200 מטר'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '8 דקות, קטלבל קל, 100 מטר בהליכון.',
      'לפי הפרוטוקול.',
      '16 דקות, קטלבל כבד, 400 מטר בהליכון.',
    ),
    scoreType: 'rounds_and_reps',
  },

  // --- the patisserie --------------------------------------------------------
  {
    slug: 'krantz',
    title: "קראנצ'",
    subtitle: 'קלוע, מגולגל, ובסוף תמיד קצת יותר ממה שהתכוונתם.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['mat', 'pullup_bar', 'kettlebell'],
    description:
      'האימון של דני, ולכן כולו בטן. קראנץ׳ נקלע שכבה על שכבה, וכך גם זה: כל סבב מוסיף עוד קיפול על מה שכבר עייף. שומרים על הגב התחתון צמוד לרצפה - ברגע שהוא מתרומם, הסט נגמר.',
    warmup: [
      ...GENERAL_PREP,
      'Dead Bug | 8 לכל צד',
      'Bird Dog | 8 לכל צד',
      'Hollow Hold | 20 שניות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Farmer Carry | 40 מטר', 'Suitcase Carry | 20 מטר לכל צד'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים, מנוחה דקה בין סבבים',
        items: [
          'Hanging Knee Raises | 10 חזרות',
          'Hollow Hold | 30 שניות',
          'Russian Twist | 20 חזרות',
          'Side Plank | 30 שניות לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'הרמות ברך בשכיבה, פלאנק צד מהברכיים, 3 סבבים.',
      'לפי הפרוטוקול.',
      'אצבעות למוט, הולו הולד 45 שניות, 6 סבבים.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'croissant',
    title: 'קרואסון',
    subtitle: 'שלוש קיפולים, הרבה סבלנות, ואסור למהר.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['mat', 'bands'],
    description:
      'בצק עלים נבנה מקיפול, מנוחה, וקיפול נוסף - וזה בדיוק המבנה כאן. כל תרגיל מגלגל את עמוד השדרה חוליה אחר חוליה, והאיטיות היא העבודה ולא ההפסקה ממנה.',
    warmup: [
      'נשימה צידית בשכיבה | 10 נשימות',
      'הטיית אגן | 10 חזרות',
      'Cat-Cow | 8 חזרות',
      'גשר ירך איטי | 10 חזרות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '3 סבבים, בשליטה מלאה',
        items: ['Roll Up | 8 חזרות', 'Spine Stretch Forward | 6 חזרות', 'Swan | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים, בלי מנוחה בין תרגילים',
        items: [
          'The Hundred | סדרה מלאה',
          'Single Leg Stretch | 10 לכל צד',
          'Side Kick Series | 10 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'ברכיים כפופות, סבב אחד של כל תרגיל.',
      'לפי הפרוטוקול.',
      'רגליים ישרות, גומייה, 4 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'mille-feuille',
    title: 'מיל פיי',
    subtitle: 'אלף שכבות. נספור רק חלק מהן.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 22,
    equipment: ['barbell', 'pullup_bar', 'mat', 'treadmill'],
    description:
      'סולם יורד: 21-15-9 על שלושה תרגילים, שכבה על שכבה. הסט של 21 הוא זה שקובע את כל השאר, אז חלקו אותו מראש ואל תחכו שהוא יחלק אתכם.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Front Squat | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '21-15-9 חזרות, למהירות',
        items: ['Thrusters | מוט', 'Pull-ups | משיכות מתח', 'Sit-ups | כפיפות בטן'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '15-12-9, מוט ריק, משיכות בגומייה.',
      'לפי הפרוטוקול.',
      '27-21-15, בלי לרדת מהמוט באמצע סט.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'macaron',
    title: 'מקרון',
    subtitle: 'קטן, מדויק, ומתפרק אם ממהרים.',
    category: 'functional',
    format: 'tabata',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['mat', 'kettlebell'],
    description:
      'עשרים שניות עבודה, עשר מנוחה, ארבעה בלוקים. הניקוד הוא סך החזרות - מה שמתגמל קצב אחיד ולא התפרצות בסבב הראשון. מקרון נשבר בדיוק מאותה סיבה.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `3 סטים של 12, מנוחה דקה. ${LOAD_NOTE}`,
        items: ['Goblet Squat | 12 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '4 × טבאטה, 8 סבבים של 20/10, דקה בין בלוקים',
        items: [
          'בלוק 1 | Kettlebell Swings',
          'בלוק 2 | Air Squats',
          'בלוק 3 | Push-ups',
          'בלוק 4 | Sit-ups',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '2 בלוקים, קטלבל קל, שכיבות מהספסל.',
      'לפי הפרוטוקול.',
      '6 בלוקים, קטלבל כבד.',
    ),
    scoreType: 'reps',
  },
  {
    slug: 'proving-drawer',
    title: 'תפיחה',
    subtitle: 'שום דבר לא קורה, ואז הכול קורה.',
    category: 'yoga',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['mat'],
    description:
      'שיעור ארוך ואיטי שכולו החזקות. בצק תופח כשמניחים לו, וגם ניידות. אין פה מה למהר אליו - התנוחה עושה את העבודה בדקה השנייה שלה, לא בראשונה.',
    warmup: [
      'נשימת סרעפת בשכיבה | 10 נשימות',
      'Cat-Cow | 10 חזרות',
      'ברכת שמש א׳ | 3 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'מחזיקים 90 שניות בכל תנוחה, סבב אחד',
        items: [
          'Virabhadrasana II | 90 שניות לכל צד',
          'Utkatasana | 90 שניות',
          'Vasisthasana | 60 שניות לכל צד',
        ],
      },
      {
        label: 'מטקון',
        detail: 'מחזיקים 2-3 דקות בכל תנוחה',
        items: ['Pigeon | 3 דקות לכל צד', 'Supta Matsyendrasana | 2 דקות לכל צד', 'Uttanasana | 2 דקות'],
      },
    ],
    cooldown: ['Savasana | 6 דקות'],
    scaling: scale(
      'החזקות של 45 שניות, תמיכה בגליל או בשמיכה.',
      'לפי הפרוטוקול.',
      'החזקות של 4 דקות בתנוחות הארוכות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'lemon-tart',
    title: 'טארט לימון',
    subtitle: 'חמוץ בהתחלה, ואחר כך עוד יותר.',
    category: 'crossfit',
    format: 'emom',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['dumbbell', 'pullup_bar', 'treadmill'],
    description:
      'EMOM של 24 דקות. הדקה הראשונה תמיד מרגישה קלה מדי וזאת המלכודת - בדקה השתים עשרה המנוחה מצטמצמת לבד, בלי שאף אחד שינה את הכללים.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Bent-over Row | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'EMOM 24 דקות, מחזור של שלוש דקות',
        items: [
          'דקה 1 | Dumbbell Snatch, 12 חזרות',
          'דקה 2 | Pull-ups, 8 חזרות',
          'דקה 3 | הליכון, 200 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '12 דקות, משקולת קלה, משיכות בגומייה.',
      'לפי הפרוטוקול.',
      '30 דקות, משקולת כבדה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'babka',
    title: 'בבקה',
    subtitle: 'מגולגל פעמיים, ואז חותכים לאורך.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['kettlebell', 'dumbbell', 'bench', 'mat'],
    description:
      'שני סבבים שנכרכים זה בזה - כל תרגיל דוחף וכל תרגיל שאחריו מושך. זה אימון שמרגיש מאוזן בסוף ולא בהתחלה, וזאת המטרה.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סבבים, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Dumbbell Bench Press | 8 חזרות', 'Dumbbell Row | 8 לכל יד'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, מנוחה דקה',
        items: [
          'Kettlebell Swings | 15 חזרות',
          'Renegade Rows | 8 לכל צד',
          'Bench Step-ups | 10 לכל רגל',
          'Plank Shoulder Taps | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '3 סבבים, משקולות קלות, רנגייד מהברכיים.',
      'לפי הפרוטוקול.',
      '5 סבבים, משקולות כבדות.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'eclair',
    title: 'אקלר',
    subtitle: 'ארוך, ישר, ובפנים זה רך.',
    category: 'functional',
    format: 'for_time',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['treadmill', 'mat', 'bench'],
    description:
      'אימון אירובי ארוך עם עצירות קצרות. הקצב על ההליכון צריך להיות כזה שאפשר לדבר בו - אם אי אפשר, הורידו. האורך הוא העבודה, לא המהירות.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: '3 סבבים, לא לזמן',
        items: ['Bench Step-ups | 15 לכל רגל', 'Push-ups | 12 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, למהירות',
        items: ['הליכון | 800 מטר', 'Sit-ups | 20 חזרות', 'Air Squats | 20 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale('3 סבבים של 400 מטר.', 'לפי הפרוטוקול.', '5 סבבים, קצב מרוץ.'),
    scoreType: 'time',
  },
  {
    slug: 'rugelach',
    title: 'רוגלך',
    subtitle: 'קטנים, ואי אפשר לאכול רק אחד.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['kettlebell', 'mat', 'bench'],
    description:
      'סבבים קצרצרים שנערמים. כל סבב לוקח פחות מדקה, ובדיוק בגלל זה קשה לעצור - וזאת בדיוק הבעיה בדקה החמש עשרה.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 10, מנוחה דקה. ${LOAD_NOTE}`,
        items: ['Kettlebell Deadlift | 10 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 15 דקות',
        items: ['Kettlebell Swings | 10 חזרות', 'Push-ups | 5 חזרות', 'Air Squats | 10 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale('10 דקות, קטלבל קל.', 'לפי הפרוטוקול.', '20 דקות, קטלבל כבד.'),
    scoreType: 'rounds_and_reps',
  },
];
