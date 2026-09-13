import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * Functional training: HIIT, strength-endurance circuits, dumbbells,
 * kettlebells and bodyweight.
 *
 * These are the sessions for a mixed floor - a group where one person is in
 * their first month and another has been training for a decade. Every entry is
 * written so both can run it at the same time without a separate class.
 */

const GENERAL_PREP = [
  'הליכון | 3 דקות בקצב קל', 'סיבובי כתפיים, ירך וקרסול | 10 לכל כיוון', 'סקוואט משקל גוף | 15 חזרות', 'גשר ירך | 15 חזרות', 'שכיבות סמיכה בהטיה | 10 חזרות',
];

const KB_PREP = [
  'הליכה מהירה | 2 דקות', 'גשר ירך | 15 חזרות', 'דדליפט קטלבל קל | 10 חזרות, 2 סבבים', 'סווינג קטלבל קל | 15 חזרות, 2 סבבים', 'פתיחת גב עליון בישיבה | 60 שניות',
];

const DB_PREP = [
  'חתירה או הליכה מהירה | 3 דקות', 'סיבובי כתף עם משקולת קלה | 10 לכל כיוון', 'סקוואט גובלט | 12 חזרות, 2 סבבים', 'חתירה בכפיפה עם משקולות | 12 חזרות, 2 סבבים', 'פתיחת חזה במשקוף | 45 שניות',
];

export const FUNCTIONAL_WORKOUTS: LibraryWorkout[] = [
  {
    slug: 'hiit-30-30-full-body',
    title: 'HIIT 30/30 גוף מלא',
    subtitle: 'שלושים שניות עבודה, שלושים מנוחה, שמונה תחנות.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['dumbbell', 'mat'],
    description:
      'אינטרוולים קצרים בחלוקה שווה. ביחס של 1:1 אפשר לעבוד חזק בכל מקטע בלי לקרוס - אם בסבב השלישי אתם כבר לא מסוגלים לשמור על אותו מספר חזרות, הורידו משקל ולא קצב.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: '3 סבבים',
        detail: '30 שניות עבודה / 30 שניות מנוחה בכל תחנה, דקה בין סבבים',
        items: [
          'Goblet Squat | סקוואט גובלט', 'Push-ups | שכיבות סמיכה', 'Dumbbell Row | חתירה עם משקולת, מתחלף בין הצדדים', 'Reverse Lunges | לאנג׳ לאחור', 'Dumbbell Press | לחיצה מעל הראש', 'Mountain Climbers | טיפוס הרים', 'Dead Bug | באג מת', 'Plank | פלאנק',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '20 שניות עבודה / 40 מנוחה, בלי משקל.', '30/30 עם משקולות בינוניות.', '40 שניות עבודה / 20 מנוחה, משקולות כבדות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'hiit-tabata-four',
    title: 'טבאטה ארבע תחנות',
    subtitle: 'שש עשרה דקות שמרגישות כמו ארבעים.',
    category: 'functional',
    format: 'tabata',
    difficulty: 'intermediate',
    durationMinutes: 22,
    equipment: ['kettlebell', 'mat'],
    description:
      'ארבעה בלוקים של טבאטה עם דקה מנוחה ביניהם. הניקוד הוא סך החזרות - מה שמתגמל קצב אחיד ולא התפרצות בסבב הראשון.',
    warmup: KB_PREP,
    structure: [
      {
        label: 'טבאטה × 4',
        detail: '8 סבבים של 20 שניות עבודה / 10 מנוחה, דקה בין בלוקים',
        items: [
          'בלוק 1 | Kettlebell Swings', 'בלוק 2 | Air Squats', 'בלוק 3 | Push-ups', 'בלוק 4 | Sit-ups',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'שני בלוקים, קטלבל קל, שכיבות סמיכה על הספסל.', 'ארבעה בלוקים, קטלבל שאפשר להחזיק איתו 20 שניות רצוף.', 'ארבעה בלוקים, קטלבל כבד. הניקוד הוא הסבב החלש ביותר.',
    ),
    scoreType: 'reps',
  },
  {
    slug: 'hiit-40-20-conditioning',
    title: 'HIIT 40/20',
    subtitle: 'יחס עבודה גבוה. לא לפעם הראשונה.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'advanced',
    durationMinutes: 30,
    equipment: ['dumbbell', 'bench', 'treadmill'],
    description:
      'ארבעים שניות עבודה מול עשרים מנוחה. היחס הזה לא מאפשר התאוששות מלאה, ולכן בחירת המשקל קובעת הכל - בחרו משקל שתוכלו לעבוד איתו ברצף ארבעים שניות גם בסבב האחרון.',
    warmup: [...DB_PREP, 'קפיצה בחבל | 2 דקות'],
    structure: [
      {
        label: '4 סבבים',
        detail: '40 שניות עבודה / 20 מנוחה, 90 שניות בין סבבים',
        items: [
          'Dumbbell Thrusters | תראסטר עם משקולות', 'Bench Step-overs | עליות מעל הספסל', 'Renegade Rows | חתירה בפלאנק', 'Split Jumps | קפיצות פיצול', 'Burpees | בורפי',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '30/30, משקולות קלות, עלייה על הספסל בלי קפיצה.', '40/20 עם משקולות בינוניות.', 'לפי הפרוטוקול.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'strength-endurance-circuit-a',
    title: 'מעגל כוח-סבולת א׳',
    subtitle: 'חמש תחנות, ארבעה סבבים, קצב עבודה.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 40,
    equipment: ['barbell', 'dumbbell', 'bench'],
    description:
      'מעגל קלאסי של דחיפה, משיכה, רגליים וליבה. הכוונה היא עומס ולא מהירות - המנוחה בין התחנות קצרה, אבל הצורה קודמת לשעון.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: '4 סבבים',
        detail: '45 שניות מנוחה בין תחנות, 2 דקות בין סבבים',
        items: [
          'Front Squat | 10 חזרות', 'Bench Press או שכיבות סמיכה | 10 חזרות', 'Bent-over Row | 12 חזרות', 'Step-ups | 12 חזרות לכל רגל', 'Hollow Hold | 30 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'מוט ריק או משקולות קלות, 3 סבבים.', 'משקל בינוני, 4 סבבים.', 'משקל כבד, 5 סבבים.',
    ),
    scoreType: 'weight',
    scoreLabel: 'המשקל בתחנה הכבדה',
  },
  {
    slug: 'strength-endurance-circuit-b',
    title: 'מעגל כוח-סבולת ב׳',
    subtitle: 'דגש על שרשרת אחורית ואחיזה.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 40,
    equipment: ['kettlebell', 'barbell', 'pullup_bar'],
    description:
      'מעגל שמתמקד בגב, בישבן ובאחיזה - שלושת הדברים שהכי מהר נשארים מאחור אצל מי שמתאמן בעיקר בדחיפה.',
    warmup: KB_PREP,
    structure: [
      {
        label: '4 סבבים',
        detail: '60 שניות מנוחה בין תחנות',
        items: [
          'Romanian Deadlift | 10 חזרות', 'Strict Pull-ups או משיכות בגומייה | 8 חזרות', 'Kettlebell Swings | 20 חזרות', 'Farmer Carry | 40 מטר', 'Side Plank | 30 שניות לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'קטלבל קל, משיכות בגומייה, נשיאה 20 מטר.', 'משקל בינוני, 3 משיכות נקיות.', 'משקל כבד, משיכות עם משקל נוסף.',
    ),
    scoreType: 'weight',
    scoreLabel: 'המשקל בדדליפט',
  },
  {
    slug: 'dumbbell-complex-devil',
    title: 'קומפלקס משקולות: דבל פרס',
    subtitle: 'חמישה תרגילים עם אותו זוג משקולות, בלי להניח.',
    category: 'functional',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 25,
    timeCapMinutes: 18,
    equipment: ['dumbbell'],
    description:
      'קומפלקס הוא רצף תרגילים שמבצעים בלי להניח את המשקולות. זה מבחן אחיזה וכתפיים לפני הכל - אם הן נופלות באמצע הסבב, המשקל גדול מדי.',
    warmup: DB_PREP,
    structure: [
      {
        label: '5 סבבים למהירות',
        detail: 'לא מניחים את המשקולות בתוך סבב',
        items: [
          'Deadlift | 8 חזרות', 'Hang Clean | 6 חזרות', 'Front Squat | 6 חזרות', 'Push Press | 6 חזרות', 'Bent-over Row | 8 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '3 סבבים, משקולות שאפשר להשלים איתן את הרצף בלי להניח.', '4 סבבים, משקולות שהסט האחרון דורש איתן ריכוז.', '5 סבבים, כבד - האחיזה היא שנגמרת ראשונה.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'dumbbell-amrap-push-pull',
    title: 'משקולות: דחיפה ומשיכה',
    subtitle: 'AMRAP 18 עם זוג משקולות אחד.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 25,
    equipment: ['dumbbell', 'mat'],
    description:
      'אימון גוף מלא עם ציוד מינימלי. המבנה מאזן דחיפה ומשיכה בכל סבב, כך שאף קבוצת שרירים לא נשברת לפני האחרות.',
    warmup: DB_PREP,
    structure: [
      {
        label: 'AMRAP 18 דקות',
        items: [
          'Dumbbell Snatch | 10 חזרות, 5 לכל יד', 'Push-ups | 10 חזרות', 'Dumbbell Row | 10 חזרות, 5 לכל יד', 'Goblet Squat | 15 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'משקולת קלה, שכיבות סמיכה על הספסל.', 'משקולת שמאפשרת 10 סנאץ׳ רצופים לכל יד.', 'משקולת כבדה, שכיבות עם רגליים מוגבהות.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'dumbbell-emom-24',
    title: 'משקולות EMOM 24',
    subtitle: 'ארבע תחנות מתחלפות, שישה סבבים.',
    category: 'functional',
    format: 'emom',
    difficulty: 'intermediate',
    durationMinutes: 24,
    equipment: ['dumbbell'],
    description:
      'פורמט EMOM נותן מנוחה מובנית, ולכן אפשר לעבוד עם משקל כבד יותר מהרגיל. כוונו לסיים כל דקה בתוך 40 שניות.',
    warmup: DB_PREP,
    structure: [
      {
        label: 'EMOM 24 דקות',
        detail: 'מחזור של ארבע דקות, שש פעמים',
        items: [
          'דקה 1 | 12 Goblet Squats', 'דקה 2 | 10 Dumbbell Push Press', 'דקה 3 | 12 Romanian Deadlifts', 'דקה 4 | 40 שניות Plank',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '8-10 חזרות עם משקולות קלות.', 'לפי הפרוטוקול, משקל שמשאיר 15 שניות מנוחה בכל דקה.', 'לפי הפרוטוקול, כבד - הדקה מנוצלת כמעט כולה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'kettlebell-circuit-simple',
    title: 'מעגל קטלבל בסיסי',
    subtitle: 'ארבעה תרגילים, קטלבל אחד, עשרים דקות.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'beginner',
    durationMinutes: 25,
    equipment: ['kettlebell'],
    description:
      'נקודת הכניסה לעבודה עם קטלבל. הסווינג הוא תנועת ירך ולא תנועת ידיים - הכוח בא מדחיפת האגן קדימה, והידיים רק מלוות.',
    warmup: KB_PREP,
    structure: [
      {
        label: 'AMRAP 20 דקות',
        detail: 'קצב נוח, מנוחה לפי הצורך',
        items: [
          'Kettlebell Swings | 15 חזרות', 'Goblet Squat | 10 חזרות', 'Kettlebell Row | 10 חזרות לכל צד', 'Farmer Carry | 30 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'קטלבל קל, 15 דקות.', 'קטלבל שמאפשר 15 סווינג רצופים.', 'קטלבל כבד, 25 דקות.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'kettlebell-complex-clean-press',
    title: 'קומפלקס קטלבל: קלין ולחיצה',
    subtitle: 'צד אחד בכל פעם. כוח חד-צדדי.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['kettlebell'],
    description:
      'עבודה חד-צדדית חושפת פערים בין הצדדים שאימון עם מוט מסתיר. עשו את הצד החלש קודם ותנו לו לקבוע את מספר החזרות.',
    warmup: KB_PREP,
    structure: [
      {
        label: '5 סבבים',
        detail: 'משלימים צד אחד לגמרי, מחליפים, ואז 90 שניות מנוחה',
        items: [
          'Kettlebell Clean | 5 חזרות', 'Strict Press | 5 חזרות', 'Front Squat | 5 חזרות', 'Suitcase Carry | 20 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'קטלבל קל, 3 סבבים.', 'קטלבל שמאפשר 5 לחיצות נקיות בצד החלש.', 'קטלבל כבד, 6 סבבים.',
    ),
    scoreType: 'weight',
  },
  {
    slug: 'kettlebell-turkish-getup-ladder',
    title: 'טרקיש גט-אפ',
    subtitle: 'תרגיל אחד, איטי, מדויק.',
    category: 'functional',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 30,
    equipment: ['kettlebell', 'mat'],
    description:
      'התרגיל האיטי ביותר בחדר, ואחד היעילים ביותר לכתף יציבה ולליבה. כל חזרה אורכת בערך 40 שניות. אם הזרוע רועדת - הורידו משקל, לא חזרות.',
    warmup: [
      'גלגול על הצד | 8 חזרות לכל צד', 'גשר ירך | 15 חזרות', 'החזקת נעל מעל הראש בשכיבה | 30 שניות לכל צד', 'פתיחת גב עליון בישיבה | 60 שניות',
    ],
    structure: [
      {
        label: 'מיומנות',
        detail: '5 סבבים, חזרה אחת לכל צד, מנוחה מלאה',
        items: ['Turkish Get-up | חזרה אחת לכל צד'],
      },
      {
        label: 'סיום',
        detail: '3 סבבים בקצב נוח',
        items: ['Kettlebell Swings | 15 חזרות', 'Dead Bug | 10 חזרות לכל צד'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'ללא משקל, או עם נעל מאוזנת על כף היד.', 'קטלבל שאפשר להחזיק יציב מעל הראש לאורך כל החזרה.', 'קטלבל כבד. אם הזרוע רועדת - זה המשקל שמפסיקים בו.',
    ),
    scoreType: 'weight',
  },
  {
    slug: 'calisthenics-pull-strength',
    title: 'משקל גוף: משיכה',
    subtitle: 'בניית משיכה נקייה, שלב אחרי שלב.',
    category: 'functional',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['pullup_bar', 'bands', 'bench'],
    description:
      'משיכה היא המיומנות שהכי הרבה אנשים נתקעים בה. האימון הזה בונה אותה בשלושה שלבים: תלייה, משיכה אופקית, ומשיכה אנכית עם עזרה שמצטמצמת.',
    warmup: [
      'תלייה פסיבית | 30 שניות, 3 סבבים', 'משיכת שכמות בתלייה | 8 חזרות, 2 סבבים', 'חתירה בגומייה | 12 חזרות, 2 סבבים', 'פתיחת חזה | 60 שניות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '5 סטים, 2 דקות מנוחה',
        items: ['Strict Pull-ups או משיכות בגומייה | 3-5 חזרות נקיות'],
      },
      {
        label: 'נפח',
        detail: '4 סבבים',
        items: [
          'Inverted Rows | 10 חזרות מתחת למוט', 'Hollow Hold | 30 שניות', 'Scapular Pull-ups | 8 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'חתירה הפוכה מתחת למוט בזווית נוחה, תלייה מסייעת.', 'משיכות בגומייה דקה.', 'משיכות עם משקל נוסף.',
    ),
    scoreType: 'reps',
    scoreLabel: 'משיכות נקיות בסט הטוב',
  },
  {
    slug: 'calisthenics-push-strength',
    title: 'משקל גוף: דחיפה',
    subtitle: 'משכיבות סמיכה לעמידת ידיים.',
    category: 'functional',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['none', 'mat'],
    description:
      'בניית דחיפה בלי משקולות. שלושת השלבים - הטיה, מישור, פייק - מאפשרים לכל אחד למצוא את הגובה הנכון ולעלות משם.',
    warmup: [
      'סיבובי כתפיים | 10 לכל כיוון', 'פלאנק | 30 שניות, 2 סבבים', 'שכיבות סמיכה בהטיה | 10 חזרות, 2 סבבים', 'פתיחת חזה במשקוף | 45 שניות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '5 סטים, 90 שניות מנוחה',
        items: ['Push-ups בגובה שמאפשר 5-8 חזרות נקיות'],
      },
      {
        label: 'נפח',
        detail: '4 סבבים',
        items: [
          'Pike Push-ups | 8 חזרות', 'Dips על ספסל | 10 חזרות', 'Plank Shoulder Taps | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'שכיבות מהקיר או מספסל גבוה.', 'שכיבות מהרצפה.', 'שכיבות עם רגליים מוגבהות ופייק בקיר.',
    ),
    scoreType: 'reps',
  },
  {
    slug: 'calisthenics-full-body-amrap',
    title: 'משקל גוף: גוף מלא',
    subtitle: 'בלי ציוד בכלל. אפשר גם בבית.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'beginner',
    durationMinutes: 22,
    equipment: ['none'],
    description:
      'אימון שלא דורש שום דבר מלבד רצפה. שימושי בנסיעות, בימי עומס או כשהאולם מלא. שמרו על קצב שמאפשר לדבר משפט קצר.',
    warmup: [
      'הליכה במקום | 2 דקות', 'סיבובי מפרקים | 90 שניות', 'סקוואט משקל גוף | 15 חזרות', 'גשר ירך | 15 חזרות',
    ],
    structure: [
      {
        label: 'AMRAP 18 דקות',
        items: [
          'Air Squats | 15 חזרות', 'Push-ups | 10 חזרות', 'Reverse Lunges | 10 חזרות לכל רגל', 'Sit-ups | 15 חזרות', 'Burpees | 5 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '12 דקות, שכיבות מהברכיים, בורפי בלי קפיצה.', '18 דקות לפי הפרוטוקול.', '18 דקות, בורפי עם קפיצה, שכיבות עם מחיאת כף.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'engine-builder-run',
    title: 'בניית מנוע: ריצה ארוכה',
    subtitle: 'מקטעים ארוכים בקצב מדוד.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['treadmill'],
    description:
      'אימון סבולת אירובית. המטרה היא קצב אחיד - הפרש של יותר מ-5 שניות בין המקטע הראשון לאחרון אומר שיצאתם מהר מדי.',
    warmup: [
      'הליכון | 600 מטר קל', 'מתיחות דינמיות לגב ולירך | 2 דקות', 'הליכון | 3 מקטעים של 20 שניות בקצב עולה',
    ],
    structure: [
      {
        label: '6 × 500 מטר',
        detail: '90 שניות מנוחה בין מקטעים',
        items: ['הליכון | 800 מטר בקצב אחיד'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '4 מקטעים של 300 מטר.', '5 מקטעים של 500 מטר.', '6 מקטעים של 500 מטר, קצב מרוץ.',
    ),
    scoreType: 'time',
    scoreLabel: 'ממוצע המקטעים',
  },
  {
    slug: 'engine-builder-sprints',
    title: 'בניית מנוע: מקטעים חדים',
    subtitle: 'מקטעים קצרים וחדים.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'advanced',
    durationMinutes: 30,
    equipment: ['treadmill'],
    description:
      'אינטרוולים קצרים בעצימות גבוהה. במקטע של 30 שניות אין קצב לשמור - נותנים הכל, ואז מנוחה מלאה עד המקטע הבא.',
    warmup: [
      'הליכון | 5 דקות בקצב עולה', 'שלושה מקטעים של 15 שניות חזק | דקה מנוחה ביניהם',
    ],
    structure: [
      {
        label: '10 × 30 שניות',
        detail: '90 שניות מנוחה מלאה בין מקטעים',
        items: ['הליכון | 30 שניות בקצב מהיר'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '6 מקטעים של 20 שניות.', '8 מקטעים של 30 שניות.', '10 מקטעים לפי הפרוטוקול.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'partner-workout-split-work',
    title: 'אימון זוגות: עבודה מחולקת',
    subtitle: 'אחד עובד, אחד נח. הקצב נקבע ביחד.',
    category: 'functional',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 30,
    timeCapMinutes: 25,
    equipment: ['treadmill', 'kettlebell', 'dumbbell'],
    description:
      'מחלקים את החזרות בין שני מתאמנים איך שרוצים, כל עוד רק אחד עובד בכל רגע. אימון טוב לימים שבהם יש פער רמות בקבוצה - כל אחד לוקח כמה שהוא יכול.',
    warmup: [...GENERAL_PREP, 'סווינג קטלבל קל | 15 חזרות'],
    structure: [
      {
        label: 'בזוג, למהירות',
        detail: 'מחלקים את החזרות חופשי, רק אחד עובד בכל פעם',
        items: [
          'הליכון | 2000 מטר', 'Kettlebell Swings | 150 חזרות', 'Wall Balls | 150 חזרות', 'Burpees | 100 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'חצי מהחזרות, משקלים קלים.', 'שלושה רבעים מהחזרות.', 'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'partner-workout-you-go-i-go',
    title: 'אימון זוגות: סבב מתחלף',
    subtitle: 'סבב שלם לכל אחד, לסירוגין, עשרים דקות.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 25,
    equipment: ['dumbbell', 'bench'],
    description:
      'כל אחד עושה סבב שלם והשני נח. המנוחה המובנית מאפשרת לעבוד חזק בכל סבב, והאחריות ההדדית עושה את השאר.',
    warmup: DB_PREP,
    structure: [
      {
        label: 'AMRAP 20 דקות, לסירוגין',
        detail: 'הניקוד הוא סך הסבבים של שניכם',
        items: [
          'Dumbbell Thrusters | 10 חזרות', 'Box Jumps | 10 חזרות', 'Burpees | 10 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'משקולות קלות, עלייה על הספסל, בורפי בלי קפיצה.', 'לפי הפרוטוקול.', 'משקולות כבדות, בורפי עם קפיצה מלאה.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'core-and-carry',
    title: 'ליבה ונשיאה',
    subtitle: 'עשרים דקות של יציבות תחת עומס.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 28,
    equipment: ['kettlebell', 'mat'],
    description:
      'נשיאה היא תרגיל הליבה הכי מתפספס. כשהמשקל ביד אחת, הגוף חייב להתנגד להטיה לצד - וזה בדיוק מה שהגב התחתון צריך.',
    warmup: KB_PREP,
    structure: [
      {
        label: '4 סבבים',
        detail: '60 שניות מנוחה בין סבבים',
        items: [
          'Suitcase Carry | 30 מטר לכל צד', 'Dead Bug | 10 חזרות לכל צד', 'Side Plank | 30 שניות לכל צד', 'Bird Dog | 10 חזרות לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'משקל קל, 20 מטר, 3 סבבים.', 'לפי הפרוטוקול.', 'משקל כבד, 40 מטר.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'lower-body-strength-day',
    title: 'יום רגליים',
    subtitle: 'סקוואט, ציר ירך, וחד-צדדי.',
    category: 'functional',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 45,
    equipment: ['barbell', 'dumbbell'],
    description:
      'שלושה דפוסי תנועה שמכסים את כל הרגל. החלק החד-צדדי בסוף חשוב במיוחד למי שרץ או משחק ספורט - הוא חושף חוסר איזון שסקוואט מסתיר.',
    warmup: [...GENERAL_PREP, 'פתיחת קרסול בקיר | 45 שניות לכל צד'],
    structure: [
      {
        label: 'כוח א׳',
        detail: '4 סטים של 6, מנוחה 2 דקות',
        items: ['Back Squat | משקל בינוני-כבד'],
      },
      {
        label: 'כוח ב׳',
        detail: '3 סטים של 8, מנוחה 90 שניות',
        items: ['Romanian Deadlift'],
      },
      {
        label: 'חד-צדדי',
        detail: '3 סבבים',
        items: [
          'Bulgarian Split Squat | 10 חזרות לכל רגל', 'Calf Raises | 15 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'סקוואט לכיסא, דדליפט עם משקולות קלות.', 'לפי הפרוטוקול, משקל בינוני.', 'לפי הפרוטוקול, משקל כבד.',
    ),
    scoreType: 'weight',
    scoreLabel: 'הסקוואט הכבד ביותר × 6',
  },
  {
    slug: 'upper-body-strength-day',
    title: 'יום פלג גוף עליון',
    subtitle: 'דחיפה, משיכה, ואיזון בין השתיים.',
    category: 'functional',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 45,
    equipment: ['barbell', 'dumbbell', 'pullup_bar'],
    description:
      'יחס של שתי משיכות לכל דחיפה. זה המבנה שמחזיק כתפיים בריאות לאורך שנים, גם אם הוא פחות מספק מיום חזה קלאסי.',
    warmup: [
      'הליכון | 600 מטר', 'סיבובי כתף עם גומייה | 15 לכל כיוון', 'חתירה בגומייה | 15 חזרות, 2 סבבים', 'שכיבות סמיכה | 10 חזרות',
    ],
    structure: [
      {
        label: 'כוח א׳',
        detail: '4 סטים של 6, מנוחה 2 דקות',
        items: ['Strict Press | לחיצה נקייה מעל הראש'],
      },
      {
        label: 'כוח ב׳',
        detail: '4 סטים של 8',
        items: ['Bent-over Row | חתירה בכפיפה'],
      },
      {
        label: 'נפח',
        detail: '3 סבבים',
        items: [
          'Pull-ups או משיכות בגומייה | מקסימום פחות 2', 'Dumbbell Bench Press | 12 חזרות', 'Face Pulls בגומייה | 15 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'לחיצה עם משקולות יד, חתירה הפוכה מתחת למוט.', 'לפי הפרוטוקול.', 'לפי הפרוטוקול, משקל כבד.',
    ),
    scoreType: 'weight',
    scoreLabel: 'הלחיצה הכבדה ביותר × 6',
  },
  {
    slug: 'conditioning-ladder-down',
    title: 'סולם יורד',
    subtitle: 'החזרות יורדות, הקצב עולה.',
    category: 'functional',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 25,
    timeCapMinutes: 18,
    equipment: ['kettlebell', 'treadmill'],
    description:
      'מבנה יורד נותן תחושת התקדמות: כל סבב קצר מהקודם. זה מאפשר לדחוף בסוף בלי לחשוש שיישאר עוד הרבה.',
    warmup: [...KB_PREP, 'קפיצה בחבל | 2 דקות'],
    structure: [
      {
        label: 'סבבים של 10-8-6-4-2',
        detail: 'למהירות',
        items: [
          'Kettlebell Swings ', 'Burpees', 'קפיצה בחבל | פי 10 מהמספר בסבב',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'קטלבל קל, בורפי בלי קפיצה.', 'לפי הפרוטוקול.', 'קפיצות פיצול מהירות במקום צעדים.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'conditioning-every-3-minutes',
    title: 'כל שלוש דקות',
    subtitle: 'חמישה מקטעים עם מנוחה שמשתנה לפי הביצוע.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'advanced',
    durationMinutes: 25,
    equipment: ['treadmill', 'dumbbell'],
    description:
      'מה שנשאר מהשלוש דקות אחרי שסיימתם - זו המנוחה. מבנה שמתגמל מאמץ אמיתי בכל מקטע במקום קצב בינוני לאורך כל האימון.',
    warmup: [...DB_PREP, 'הליכון | 600 מטר'],
    structure: [
      {
        label: '5 מקטעים, כל 3 דקות',
        detail: 'רשמו את זמן כל מקטע בנפרד',
        items: [
          'הליכון | 300 מטר', 'Dumbbell Thrusters | 15 חזרות', 'Burpees | 10 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'כל 4 דקות, מקטע קצר יותר, משקולות קלות.', 'לפי הפרוטוקול.', 'כל 3 דקות, משקולות כבדות.',
    ),
    scoreType: 'time',
    scoreLabel: 'המקטע האיטי ביותר',
  },
  {
    slug: 'conditioning-death-by-complex',
    title: 'קומפלקס עולה',
    subtitle: 'חזרה נוספת בכל דקה, עד שנגמר.',
    category: 'functional',
    format: 'emom',
    difficulty: 'intermediate',
    durationMinutes: 25,
    equipment: ['dumbbell'],
    description:
      'מתחילים בחזרה אחת מכל תרגיל ומוסיפים חזרה בכל דקה. האימון מדרג את עצמו - כל אחד מפסיק במקום אחר, וזה בסדר.',
    warmup: DB_PREP,
    structure: [
      {
        label: 'EMOM עד כישלון',
        detail: 'דקה 1: חזרה אחת מכל תרגיל. דקה 2: שתיים. וכן הלאה.',
        items: [
          'Dumbbell Clean', 'Dumbbell Front Squat', 'Dumbbell Push Press',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'משקולות קלות - התרגיל כאן הוא הרצף, לא המשקל.', 'משקולות בינוניות שמאפשרות קלין נקי בדקה 10.', 'משקולות כבדות. רוב האנשים נעצרים בין דקה 8 ל-12.',
    ),
    scoreType: 'reps',
    scoreLabel: 'הדקה האחרונה שהושלמה',
  },
  {
    slug: 'beginner-first-session',
    title: 'אימון ראשון',
    subtitle: 'הכניסה לחדר. בלי שעון, בלי משקל.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 40,
    equipment: ['none', 'mat', 'bands'],
    description:
      'האימון שמתחילים בו. המטרה היחידה היא ללמוד את חמשת דפוסי התנועה בצורה נכונה: סקוואט, ציר ירך, דחיפה, משיכה ונשיאה. אין שעון ואין ניקוד - רק חזרות נקיות.',
    warmup: [
      'הליכה | 5 דקות', 'סיבובי מפרקים | 2 דקות', 'גשר ירך | 12 חזרות', 'פתיחת חזה במשקוף | 45 שניות',
    ],
    structure: [
      {
        label: '3 סבבים',
        detail: 'מנוחה מלאה בין תרגילים. הצורה קודמת למספר.',
        items: [
          'סקוואט לכיסא | 10 חזרות', 'גשר ירך | 12 חזרות', 'שכיבות סמיכה מהקיר | 10 חזרות', 'חתירה בגומייה | 12 חזרות', 'הליכה עם משקל | 20 מטר', 'פלאנק | 20 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '2 סבבים, 8 חזרות בכל תרגיל.', '3 סבבים לפי הפרוטוקול.', '4 סבבים עם משקל קל.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'beginner-build-up',
    title: 'בונים בסיס',
    subtitle: 'השלב שאחרי האימון הראשון.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 40,
    equipment: ['dumbbell', 'bench', 'mat'],
    description:
      'אותם דפוסי תנועה, עכשיו עם קצת משקל ועם מנוחה קצרה יותר. אם השלמתם את שלושת הסבבים בלי לאבד צורה, בפעם הבאה עלו במשקל ולא בחזרות.',
    warmup: GENERAL_PREP,
    structure: [
      {
        label: '3 סבבים',
        detail: '45 שניות מנוחה בין תחנות',
        items: [
          'Goblet Squat | 12 חזרות', 'Romanian Deadlift | 12 חזרות', 'Push-ups בהטיה | 10 חזרות', 'Dumbbell Row | 12 חזרות לכל צד', 'Step-ups | 10 חזרות לכל רגל', 'Plank | 30 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'בלי משקל, 2 סבבים.', 'משקולות קלות, 3 סבבים.', 'משקולות בינוניות, 4 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'grip-and-carry-medley',
    title: 'אחיזה ונשיאה',
    subtitle: 'האימון שחושף כמה חלשה האחיזה.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 30,
    equipment: ['kettlebell', 'dumbbell', 'pullup_bar'],
    description:
      'אחיזה היא לרוב החוליה החלשה בדדליפט ובמשיכות. עשרים דקות ממוקדות בה משנות את זה מהר יותר מכל תרגיל אחר.',
    warmup: KB_PREP,
    structure: [
      {
        label: '5 סבבים',
        detail: '90 שניות מנוחה בין סבבים',
        items: [
          'Farmer Carry | 40 מטר כבד', 'Dead Hang | מקסימום זמן', 'Kettlebell Swings | 15 חזרות', 'Plate Pinch Hold | 30 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'משקל קל, 20 מטר, תלייה 15 שניות.', 'לפי הפרוטוקול.', 'משקל כבד, נשיאה 60 מטר.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'sprint-intervals-running',
    title: 'ספרינטים',
    subtitle: 'עשרה מקטעים קצרים, מנוחה מלאה.',
    category: 'functional',
    format: 'intervals',
    difficulty: 'advanced',
    durationMinutes: 30,
    equipment: ['none'],
    description:
      'ריצה מהירה היא מיומנות, לא רק כושר. חממו ביסודיות - ספרינט על שרירים קרים הוא הדרך המהירה ביותר לפציעת מיתר ברך.',
    warmup: [
      'ריצה קלה | 800 מטר', 'מתיחות דינמיות: בעיטות ישבן, הרמות ברך, צעד פתוח | 3 סבבים של 20 מטר', 'האצות | 4 × 40 מטר בקצב עולה',
    ],
    structure: [
      {
        label: '10 × 100 מטר',
        detail: 'מנוחה מלאה - הליכה חזרה להתחלה, לפחות 90 שניות',
        items: ['ספרינט | 100 מטר'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '6 מקטעים של 60 מטר בקצב מהיר ולא מרבי.', '8 מקטעים של 100 מטר.', '10 מקטעים לפי הפרוטוקול.',
    ),
    scoreType: 'time',
    scoreLabel: 'המקטע המהיר ביותר',
  },
  {
    slug: 'bodyweight-hotel-room',
    title: 'אימון חדר מלון',
    subtitle: 'שני מטר רבוע, עשרים דקות, בלי כלום.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'beginner',
    durationMinutes: 22,
    equipment: ['none'],
    description:
      'אימון לנסיעות. אין קפיצות ואין רעש - אפשר לעשות אותו בשקט מעל שכנים ישנים.',
    warmup: [
      'צעדה במקום | 2 דקות', 'סיבובי מפרקים | 90 שניות', 'סקוואט משקל גוף | 15 חזרות',
    ],
    structure: [
      {
        label: 'AMRAP 20 דקות',
        detail: 'בלי קפיצות',
        items: [
          'Air Squats | 20 חזרות', 'Push-ups | 12 חזרות', 'Reverse Lunges | 12 חזרות לכל רגל', 'Plank | 45 שניות', 'Glute Bridge | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      '15 דקות, שכיבות מהברכיים.', '20 דקות לפי הפרוטוקול.', 'שכיבות עם רגליים מוגבהות, סקוואט על רגל אחת.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'active-recovery-flow',
    title: 'התאוששות פעילה',
    subtitle: 'יום בין אימונים קשים.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['treadmill', 'bands', 'mat'],
    description:
      'עצימות נמוכה בכוונה. המטרה היא להזרים דם לשרירים כואבים ולשמור על טווחי תנועה, לא לייצר עוד עייפות. אם הדופק עולה מעל שיחה נוחה - האטו.',
    warmup: ['הליכון | 5 דקות בקצב קל'],
    structure: [
      {
        label: '3 סבבים, קצב נוח',
        items: [
          'הליכון | 3 דקות קל', 'Band Pull-aparts | 15 חזרות', 'Glute Bridge | 15 חזרות', 'Cat-Cow | 10 חזרות', 'Worlds Greatest Stretch | 5 חזרות לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      '2 סבבים. אם הדופק עולה מעל שיחה נוחה - האטו.', '3 סבבים בקצב שיחה.', '4 סבבים והליכה ארוכה בסוף.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'metcon-fifteen-minute',
    title: 'מטקון 15 דקות',
    subtitle: 'קצר, פשוט, ובלי חימום ארוך.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 20,
    equipment: ['kettlebell', 'bench'],
    description:
      'האימון לימים שבהם יש רבע שעה ולא יותר. שלושה תרגילים, מבנה פשוט, ואפשר לתת בו הכל בלי לתכנן.',
    warmup: [...KB_PREP.slice(0, 3), 'עליות על הספסל | 10 חזרות'],
    structure: [
      {
        label: 'AMRAP 15 דקות',
        items: [
          'Kettlebell Swings | 20 חזרות', 'Bench Step-ups | 15 חזרות', 'Push-ups | 10 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'קטלבל קל, עלייה על הספסל בקצב נוח.', 'לפי הפרוטוקול.', 'קטלבל כבד, עלייה נפיצה.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'metcon-the-long-one',
    title: 'המטקון הארוך',
    subtitle: 'ארבעים דקות בקצב אחיד.',
    category: 'functional',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 45,
    equipment: ['treadmill', 'dumbbell', 'kettlebell'],
    description:
      'אימון סבולת ארוך. בארבעים דקות אין מקום להתפרצות - מצאו קצב שתוכלו להחזיק בדקה 38, והתחילו בו כבר בדקה הראשונה.',
    warmup: [...GENERAL_PREP, 'הליכון | 600 מטר'],
    structure: [
      {
        label: 'AMRAP 40 דקות',
        detail: 'קצב שיחה. שתו מים באמצע.',
        items: [
          'הליכון | 400 מטר', 'Dumbbell Snatch | 20 חזרות, 10 לכל יד', 'קפיצה בחבל | 100 חזרות', 'Walking Lunges | 20 צעדים',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '25 דקות, 300 מטר, משקולת קלה.', '40 דקות לפי הפרוטוקול.', '40 דקות בקצב מרוץ.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'mobility-strength-hybrid',
    title: 'ניידות וכוח',
    subtitle: 'טווח תנועה תחת עומס.',
    category: 'functional',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['dumbbell', 'bands', 'mat'],
    description:
      'מתיחה בלי כוח בטווח החדש לא נשארת. האימון הזה עובד בקצוות הטווח עם משקל קל, וזה מה שהופך ניידות זמנית ליכולת קבועה.',
    warmup: [
      'הליכון | 3 דקות בקצב קל', 'Cat-Cow | 10 חזרות', 'Worlds Greatest Stretch | 5 לכל צד', 'סיבובי כתף עם גומייה | 15 לכל כיוון',
    ],
    structure: [
      {
        label: '3 סבבים',
        detail: 'איטי ומבוקר. 3 שניות בירידה בכל תרגיל.',
        items: [
          'Deep Goblet Squat Hold | 45 שניות', 'Cossack Squat | 8 חזרות לכל צד', 'Overhead Squat עם מקל | 10 חזרות', 'Jefferson Curl עם משקל קל | 8 חזרות', 'Dumbbell Windmill | 6 חזרות לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'בלי משקל, טווח חלקי.', 'משקל קל לפי הפרוטוקול.', 'משקל בינוני בטווח מלא.',
    ),
    scoreType: 'completion',
  },
];
