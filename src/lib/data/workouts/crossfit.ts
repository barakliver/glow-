import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * CrossFit sessions, written for one room and one hour.
 *
 * Every entry runs the same four blocks a real class runs - חימום, כוח, מטקון,
 * שחרור - inside sixty minutes, and asks for nothing the room does not have:
 * a pull-up bar, a bench with dumbbells, a treadmill, kettlebells, a hip
 * thrust pad, and a 20 kg barbell with plates.
 *
 * No load is ever printed. The benchmark prescriptions everyone knows are
 * deliberately left out: what a person lifts on a given day is theirs to
 * choose and theirs to record afterwards, and a number on the board is wrong
 * for most of the room the moment it is written. Where a weight matters, the
 * line says what the weight has to *do* - "כבד, 5 חזרות נקיות" - not what it
 * has to read on the plate.
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

/** The line every strength block ends with, in one place. */
const LOAD_NOTE = 'המשקל שלכם. עולים כל עוד החזרה האחרונה נראית כמו הראשונה.';

export const CROSSFIT_WORKOUTS: LibraryWorkout[] = [
  {
    slug: 'fran',
    title: 'Fran',
    subtitle: 'הבנצ׳מרק הקצר והכן ביותר שיש.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 10,
    equipment: ['barbell', 'pullup_bar', 'treadmill'],
    description:
      'שעה שנבנית לשלוש דקות. הכוח היום הוא פרונט סקוואט כבד, והמטקון הוא תראסטרים ומתח בסבבים יורדים. הפיתוי לצאת חזק מדי במטקון אמיתי - חלקו את הסט של 21 לשניים מראש.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Front Squat | 3 חזרות, עולים בכל סט'],
      },
      {
        label: 'מטקון',
        detail: '21-15-9 חזרות, למהירות',
        items: ['Thrusters | מוט', 'Pull-ups | משיכות מתח'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'תראסטר עם משקולות יד או מוט ריק, משיכות בגומייה. 15-12-9 חזרות.',
      'מוט במשקל שמאפשר סט רצוף של 9, משיכות בקפיצה.',
      'לפי הפרוטוקול, בלי לרדת מהמוט בסט של 21.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'cindy',
    title: 'Cindy',
    subtitle: 'עשרים דקות של משקל גוף בקצב שאפשר להחזיק.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['pullup_bar', 'barbell', 'treadmill'],
    description:
      'סבב פשוט שחוזר על עצמו עשרים דקות. מי שמוצא מקצב יציב בדקה השלישית מסיים עם עוד ארבעה סבבים ממי שיצא מהר. לפניו בלוק כוח על הדדליפט, כדי שהשעה תבנה משהו ולא רק תשרוף.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Deadlift | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 20 דקות - כמה שיותר סבבים מלאים',
        items: ['Pull-ups | 5 חזרות', 'Push-ups | 10 חזרות', 'Air Squats | 15 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'משיכות בגומייה, שכיבות על הספסל. AMRAP 15 דקות.',
      'משיכות בקפיצה או 3 משיכות נקיות בסבב.',
      'לפי הפרוטוקול. 20 סבבים ומעלה זו תוצאה מצוינת.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'helen',
    title: 'Helen',
    subtitle: 'ריצה, קטלבל ומתח - שלושה סבבים שמלמדים לנשום.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 15,
    equipment: ['kettlebell', 'pullup_bar', 'treadmill', 'barbell'],
    description:
      'המבחן האמיתי הוא המעבר מההליכון לקטלבל. תכננו מראש: לרדת, לקחת אוויר שתי שניות, ולעשות 21 סווינג ברצף אחד. הכוח לפני כן הוא לחיצת כתפיים, שלא מתחרה בסווינג.',
    warmup: [
      'הליכון | 600 מטר קל',
      'סווינג קטלבל קל | 15 חזרות, 2 סבבים',
      'פתיחת ירך בכריעה | 45 שניות לכל צד',
      ...GYMNASTICS_PREP.slice(4),
    ],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Strict Press | לחיצה נקייה מעל הראש'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים למהירות',
        items: [
          'הליכון | 400 מטר',
          'Kettlebell Swings | 21 חזרות',
          'Pull-ups | 12 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '300 מטר, קטלבל קל, משיכות בגומייה.',
      'קטלבל בינוני, משיכות בקפיצה.',
      'לפי הפרוטוקול. מתחת ל-9 דקות זה סף מתקדם.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'grace',
    title: 'Grace',
    subtitle: 'שלושים קלין אנד ג׳רק. כלום להסתתר מאחוריו.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 12,
    equipment: ['barbell', 'treadmill'],
    description:
      'תרגיל אחד, שלושים פעם. בחרו אסטרטגיה לפני שמתחילים: סטים קטנים עם מנוחה קצובה כמעט תמיד מנצחים ניסיון לרוץ ברצף. הכוח הוא עבודת טכניקה על אותה תנועה, במשקל נוח.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: 'EMOM 8 דקות, משקל נוח שמאפשר תנועה מהירה ונקייה',
        items: ['Power Clean | 2 חזרות בתחילת כל דקה'],
      },
      {
        label: 'מטקון',
        detail: '30 חזרות, למהירות. המשקל שלכם - כבד מספיק שסט של 5 מרגיש עבודה.',
        items: ['Clean and Jerk | 30 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'מוט ריק או משקולות יד. התמקדו בטכניקה, לא בשעון.',
      'משקל שמאפשר סטים של 3 עם 10 שניות מנוחה.',
      'לפי הפרוטוקול. מתחת ל-3 דקות זה סף גבוה.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'isabel',
    title: 'Isabel',
    subtitle: 'שלושים סנאץ׳. מהירות מול טכניקה.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 10,
    equipment: ['barbell', 'treadmill'],
    description:
      'סנאץ׳ הוא התרגיל שהכי מהר מאבד צורה בעייפות. אם המוט מתחיל לעלות קדימה במקום צמוד לגוף - עצרו, נשמו, והתחילו סט חדש. הכוח לפניו הוא אוברהד סקוואט, שמכין בדיוק את הקבלה.',
    warmup: [...BARBELL_PREP, 'סנאץ׳ עם מוט ריק | 5 חזרות, 3 סבבים'],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Overhead Squat | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '30 חזרות, למהירות',
        items: ['Snatch | 30 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'Power snatch עם מוט ריק, אוברהד סקוואט עם מקל.',
      'משקל שמאפשר סטים של 3.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'diane',
    title: 'Diane',
    subtitle: 'דדליפט וכפיפות ידיים בעמידת ידיים.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 12,
    equipment: ['barbell', 'treadmill', 'mat'],
    description:
      'שילוב של משיכה כבדה ודחיפה הפוכה. הדדליפט מתיש את הגב התחתון בדיוק לפני שצריך להחזיק את הגוף הפוך - שמרו על ליבה נעולה בשני התרגילים.',
    warmup: [
      ...GENERAL_PREP,
      'מוט ריק: דדליפט | 8 חזרות, 2 סבבים',
      'עמידת ידיים בקיר | 30 שניות החזקה, 3 סבבים',
      'כפיפות ידיים בפייק | 8 חזרות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 6, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Deadlift | 6 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '21-15-9 חזרות, למהירות',
        items: ['Deadlift | משקל בינוני שמאפשר סט של 9', 'Handstand Push-ups'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'דדליפט קל, דחיקות פייק מהרצפה. 15-12-9.',
      'כפיפות ידיים בעמידת ידיים עם מדרגה או ספסל.',
      'לפי הפרוטוקול. מתחת ל-5 דקות זה סף גבוה.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'elizabeth',
    title: 'Elizabeth',
    subtitle: 'קלין וטבילות. כתפיים שעובדות פעמיים.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 15,
    equipment: ['barbell', 'bench', 'treadmill'],
    description:
      'הקלין מעייף את הרגליים והכתפיים, והטבילות דורשות בדיוק את הכתפיים האלה. שמרו על סטים קטנים בטבילות מהסבב הראשון.',
    warmup: [...BARBELL_PREP, 'טבילות על הספסל | 8 חזרות, 2 סבבים'],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Squat Clean | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '21-15-9 חזרות, למהירות',
        items: ['Squat Clean | משקל שמאפשר סט רצוף של 9', 'Bench Dips | טבילות על הספסל'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'קלין עם משקולות יד, טבילות עם רגליים על הרצפה. 15-12-9.',
      'לפי הפרוטוקול, טבילות עם רגליים מכופפות.',
      'לפי הפרוטוקול, רגליים מורמות על ספסל שני.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'annie',
    title: 'Annie',
    subtitle: 'בטן ורגליים. מהיר, פשוט, שורף.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 14,
    equipment: ['mat', 'treadmill', 'hip_thrust', 'barbell'],
    description:
      'סבבים יורדים של קפיצות פיצול וכפיפות בטן. אין כאן ציוד ואין לאן לברוח - רק קצב. הכוח לפני כן הוא היפ תראסט, שנותן לישבן את מה שהמטקון לא ייתן לו.',
    warmup: [
      ...GENERAL_PREP,
      'קפיצות פיצול קלות | 20 חזרות',
      'כפיפות בטן איטיות | 15 חזרות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 8, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Hip Thrust | 8 חזרות, עצירה של שנייה למעלה'],
      },
      {
        label: 'מטקון',
        detail: '50-40-30-20-10 חזרות, למהירות',
        items: ['Split Jumps | קפיצות פיצול', 'Sit-ups | כפיפות בטן'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'מכרעים לסירוגין בלי קפיצה, 30-25-20-15-10.',
      'לפי הפרוטוקול.',
      'לפי הפרוטוקול. מתחת ל-8 דקות זה סף טוב.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'karen',
    title: 'Karen',
    subtitle: 'מאה וחמישים תראסטרים. זהו. זה כל המטקון.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 18,
    equipment: ['dumbbell', 'treadmill', 'barbell'],
    description:
      'האימון שנשבר בראש לפני שהוא נשבר ברגליים. חלקו מראש לעשרה סטים של חמישה עשר עם חמש שניות מנוחה - זה כמעט תמיד מהיר יותר מלנסות סט של 40 בהתחלה.',
    warmup: [
      ...GENERAL_PREP,
      'תראסטר עם משקולות קלות | 10 חזרות, 3 סבבים',
      'פתיחת קרסול בקיר | 45 שניות לכל צד',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Back Squat | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '150 חזרות, למהירות. משקולות קלות שאפשר להחזיק סט של 20.',
        items: ['Dumbbell Thrusters | 150 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      '100 חזרות עם משקולות קלות מאוד.',
      '150 חזרות, משקולות בינוניות.',
      'לפי הפרוטוקול. מתחת ל-8 דקות זה סף גבוה.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'barbara',
    title: 'Barbara',
    subtitle: 'חמישה סבבים עם שלוש דקות מנוחה מלאות ביניהם.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['pullup_bar', 'mat', 'treadmill'],
    description:
      'האימון היחיד ברשימה שבו המנוחה כתובה בפרוטוקול. רשמו את זמן כל סבב בנפרד - הפער בין הסבב הראשון לחמישי הוא המדד האמיתי כאן. אין בלוק כוח: חמישה סבבים כאלה הם השעה.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: 'נכלל במטקון - הנפח עצמו הוא העבודה',
        items: ['אין בלוק כוח נפרד היום'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים, שלוש דקות מנוחה מלאות אחרי כל סבב',
        items: [
          'Pull-ups | 20 חזרות',
          'Push-ups | 30 חזרות',
          'Sit-ups | 40 חזרות',
          'Air Squats | 50 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '3 סבבים, חצי מהחזרות, משיכות בגומייה.',
      '5 סבבים, 10 משיכות במקום 20.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
    scoreLabel: 'זמן כולל כולל מנוחות',
  },
  {
    slug: 'angie',
    title: 'Angie',
    subtitle: 'מאה מכל דבר. סבלנות לפני מהירות.',
    category: 'crossfit',
    format: 'chipper',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 30,
    equipment: ['pullup_bar', 'mat', 'treadmill'],
    description:
      'מסיימים כל תרגיל לגמרי לפני שעוברים לבא. מאה משיכות זה החלק שמכריע - חלקו אותן לעשרים סטים של חמש מהרגע הראשון.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: '3 סטים, מנוחה מלאה. עבודת מתח נקייה לפני הנפח.',
        items: ['Strict Pull-ups | מקסימום חזרות פחות שתיים'],
      },
      {
        label: 'מטקון',
        detail: 'לפי הסדר, למהירות',
        items: [
          'Pull-ups | 100 חזרות',
          'Push-ups | 100 חזרות',
          'Sit-ups | 100 חזרות',
          'Air Squats | 100 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '50 מכל תרגיל, משיכות בגומייה.',
      '75 מכל תרגיל.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'nancy',
    title: 'Nancy',
    subtitle: 'ריצה וסקוואט מעל הראש. איזון תחת עייפות.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 20,
    equipment: ['barbell', 'treadmill'],
    description:
      'אוברהד סקוואט אחרי 400 מטר הוא מבחן ניידות כתף וקרסול לפני שהוא מבחן כוח. אם הידיים נופלות קדימה, הורידו משקל - כאן זה לא פשרה, זה בטיחות.',
    warmup: [
      'הליכון | 600 מטר קל',
      'מוט ריק: סנאץ׳ בלאנס | 5 חזרות, 3 סבבים',
      'אוברהד סקוואט עם מקל | 10 חזרות, 2 סבבים',
      'פתיחת גב עליון וכתף | 2 דקות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'בניית טכניקה: 5 סטים של 5, משקל שמאפשר ידיים נעולות לכל אורך הסט',
        items: ['Overhead Squat | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים למהירות',
        items: ['הליכון | 400 מטר', 'Overhead Squat | 15 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '200 מטר, אוברהד סקוואט עם מוט ריק או מקל.',
      '400 מטר, משקל קל.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'jackie',
    title: 'Jackie',
    subtitle: 'ריצה, מוט ריק ומשיכות. מבחן קצב קלאסי.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 15,
    equipment: ['treadmill', 'barbell', 'pullup_bar'],
    description:
      'הריצה צריכה להיות מהירה אבל לא על חשבון הידיים - מי שרץ את הקילומטר בכל הכוח מגיע למוט בלי אחיזה. כוונו לקצב שאפשר לדבר בו בקושי.',
    warmup: [
      'הליכון | 800 מטר בקצב עולה',
      'מוט ריק: תראסטרים | 10 חזרות, 3 סבבים',
      ...GYMNASTICS_PREP.slice(4),
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 8, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Bent-over Row | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'לפי הסדר, למהירות',
        items: [
          'הליכון | 1000 מטר',
          'Thrusters | 50 חזרות, מוט ריק',
          'Pull-ups | 30 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '750 מטר, 35 תראסטרים, משיכות בגומייה.',
      'לפי הפרוטוקול עם משיכות בקפיצה.',
      'לפי הפרוטוקול. מתחת ל-7 דקות זה סף גבוה.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'kelly',
    title: 'Kelly',
    subtitle: 'חמישה סבבים ארוכים. אימון סבולת אמיתי.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 35,
    equipment: ['bench', 'dumbbell', 'treadmill', 'barbell'],
    description:
      'אימון ארוך שדורש קצב אחיד. אל תרוצו את ה-400 הראשון מהר - הפער יתגלה בסבב השלישי, לא בראשון. בלוק כוח קצר לפני, כדי שהרגליים יגיעו חמות ולא שרופות.',
    warmup: [
      'הליכון | 600 מטר קל',
      'עליות על הספסל | 10 חזרות לכל רגל, 2 סבבים',
      'תראסטר קל | 10 חזרות, 2 סבבים',
      'פתיחת קרסול וירך | 2 דקות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '3 סטים של 10 לכל רגל, משקל שמאפשר עלייה מבוקרת בלי דחיפה מהרגל האחורית',
        items: ['Bench Step-ups | 10 חזרות לכל רגל'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים למהירות',
        items: [
          'הליכון | 400 מטר',
          'Bench Step-ups | 30 חזרות',
          'Dumbbell Thrusters | 30 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      '3 סבבים, 200 מטר, 20 חזרות מכל תרגיל.',
      '4 סבבים לפי הפרוטוקול.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'mary',
    title: 'Mary',
    subtitle: 'עשרים דקות של ג׳ימנסטיקס טהור.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['pullup_bar', 'bench', 'treadmill'],
    description:
      'אימון מיומנות לפני שהוא אימון כושר. אם אחד משלושת התרגילים עדיין לא בידיים - זה בדיוק האימון שבו כדאי לתרגל אותו בגרסה מותאמת, ולא לדלג עליו.',
    warmup: [
      ...GENERAL_PREP,
      'עמידת ידיים בקיר | 30 שניות, 3 סבבים',
      'סקוואט על רגל אחת לספסל | 5 לכל צד, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'מיומנות: 5 סטים, מנוחה מלאה בין סטים',
        items: [
          'Handstand Hold | 45 שניות בקיר',
          'Strict Pull-ups | 3-5 חזרות נקיות',
        ],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 20 דקות',
        items: [
          'Handstand Push-ups | 5 חזרות',
          'Pistols | 10 חזרות, 5 לכל רגל',
          'Pull-ups | 15 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'דחיקות פייק, סקוואט לספסל על רגל אחת, משיכות בגומייה.',
      'עמידת ידיים עם מדרגה, פיסטול עם תמיכה.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'chelsea',
    title: 'Chelsea',
    subtitle: 'סבב בתחילת כל דקה, שלושים דקות.',
    category: 'crossfit',
    format: 'emom',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['pullup_bar', 'treadmill', 'barbell'],
    description:
      'Cindy בפורמט EMOM. הקושי הוא שהמנוחה מתקצרת מעצמה ככל שהחזרות מאטות. רשמו כמה דקות השלמתם - לרדת מהקצב בדקה 22 זו תוצאה טובה, לא כישלון.',
    warmup: GYMNASTICS_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Push Press | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'EMOM 30 דקות - בתחילת כל דקה, סבב שלם',
        items: ['Pull-ups | 5 חזרות', 'Push-ups | 10 חזרות', 'Air Squats | 15 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '20 דקות, 3 משיכות בגומייה, 6 שכיבות, 9 סקוואטים.',
      '30 דקות עם משיכות בקפיצה.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'completion',
    scoreLabel: 'כמה דקות הושלמו במלואן',
  },
  {
    slug: 'murph',
    title: 'Murph',
    subtitle: 'האימון הארוך ביותר ברשימה. בונים אליו.',
    category: 'crossfit',
    format: 'chipper',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 50,
    equipment: ['pullup_bar', 'treadmill', 'mat'],
    description:
      'אימון Hero קלאסי, בגרסה שנכנסת לשעה. החלוקה המקובלת של החלק האמצעי היא עשרים סבבים של 5 משיכות, 10 שכיבות ו-15 סקוואטים - היא כמעט תמיד מהירה ובטוחה יותר מלעשות כל תרגיל ברצף. אל תנסו אותו בלי בסיס של כמה חודשי אימון.',
    warmup: [
      'הליכון | 5 דקות בקצב עולה',
      'מתיחות דינמיות לירך ולכתף | 3 דקות',
      'סבב חימום: 5 משיכות, 10 שכיבות, 15 סקוואטים | 2 סבבים בקצב קל',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'אין בלוק כוח - החלק האמצעי הוא הנפח של השבוע',
        items: ['שומרים הכול למטקון'],
      },
      {
        label: 'מטקון',
        detail: 'לפי הסדר. החלק האמצעי בחלוקה של 20 סבבים: 5 / 10 / 15',
        items: [
          'הליכון | 1600 מטר',
          'Pull-ups | 100 חזרות',
          'Push-ups | 200 חזרות',
          'Air Squats | 300 חזרות',
          'הליכון | 1600 מטר',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'חצי Murph: 800 מטר, 50/100/150, משיכות בגומייה.',
      'Murph מלא בחלוקה של 20 סבבים.',
      'לפי הפרוטוקול, ברצף.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'dt',
    title: 'DT',
    subtitle: 'חמישה סבבים עם מוט אחד ושלושה תרגילים.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 15,
    equipment: ['barbell', 'treadmill'],
    description:
      'לא מורידים את המוט בין התרגילים אם אפשר. הטריק הוא לעבור מדדליפט להאנג קלין בלי להניח - זה חוסך שניות יקרות בכל סבב. בחרו משקל שמאפשר את זה, לא את המקסימום.',
    warmup: [...BARBELL_PREP, 'האנג קלין עם מוט ריק | 5 חזרות, 3 סבבים'],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Push Jerk | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '5 סבבים למהירות, אותו משקל לאורך כל האימון',
        items: [
          'Deadlift | 12 חזרות',
          'Hang Power Clean | 9 חזרות',
          'Push Jerk | 6 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'משקולות יד או מוט ריק.',
      'משקל שמאפשר את 9 הקלינים ברצף בסבב הראשון.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'randy',
    title: 'Randy',
    subtitle: '75 פאוור סנאץ׳ ברצף אחד.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 10,
    equipment: ['barbell', 'treadmill'],
    description:
      'משקל קל, הרבה חזרות. האויב הוא האחיזה והנשימה, לא הרגליים. סטים של 15 עם 10 שניות מנוחה עובדים טוב לרוב האנשים.',
    warmup: [...BARBELL_PREP, 'פאוור סנאץ׳ עם מוט ריק | 10 חזרות, 3 סבבים'],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Sumo Deadlift High Pull | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '75 חזרות, למהירות. קל - כזה שאפשר לעשות בו 20 ברצף בסט הראשון.',
        items: ['Power Snatch | 75 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '50 חזרות עם מוט ריק.',
      '75 חזרות במשקל קל.',
      'לפי הפרוטוקול. מתחת ל-5 דקות זה סף גבוה.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'chad',
    title: 'Chad',
    subtitle: 'אלף עליות על הספסל. אימון ראש.',
    category: 'crossfit',
    format: 'chipper',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 55,
    equipment: ['bench', 'treadmill'],
    description:
      'תרגיל אחד, אלף פעם, בקצב הליכה. זה אימון סבולת ארוך - שתו מים, ורדו מהספסל במקום לקפוץ ממנו כדי לשמור על הברכיים. אם לא נכנסים בשעה, עוצרים איפה שהגעתם ורושמים כמה עשיתם.',
    warmup: [
      'הליכון | 5 דקות',
      'עליות על הספסל | 20 חזרות, 2 סבבים',
      'מתיחת שוקיים וארבע ראשי | 2 דקות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'אין בלוק כוח - אלף חזרות הן הנפח',
        items: ['שומרים הכול למטקון'],
      },
      {
        label: 'מטקון',
        detail: '1000 חזרות, למהירות',
        items: ['Bench Step-ups | 1000 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '300 עליות, בקצב הליכה.',
      '500 עליות. שתו מים באמצע.',
      '1000 עליות, ובתרמיל למי שמורגל.',
    ),
    scoreType: 'reps',
    scoreLabel: 'כמה חזרות הושלמו',
  },
  {
    slug: 'jt',
    title: 'JT',
    subtitle: 'שלוש וריאציות דחיפה בסבבים יורדים.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 20,
    equipment: ['bench', 'treadmill', 'barbell', 'mat'],
    description:
      'אימון דחיפה טהור בלי שום משקל במטקון. הכתפיים נגמרות מהר, ולכן מומלץ להתחיל בסטים קטנים מדי מאשר לגלות באמצע שנתקעתם.',
    warmup: [
      ...GENERAL_PREP,
      'עמידת ידיים בקיר | 30 שניות, 3 סבבים',
      'שכיבות סמיכה איטיות | 10 חזרות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Bench Press | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '21-15-9 חזרות, למהירות',
        items: [
          'Handstand Push-ups',
          'Bench Dips | טבילות על הספסל',
          'Push-ups | שכיבות סמיכה',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '12-9-6, דחיקות פייק, טבילות עם רגליים על הרצפה, שכיבות על הספסל.',
      '15-12-9 עם מדרגה.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'jerry',
    title: 'Jerry',
    subtitle: 'ריצה ארוכה בשלושה מקטעים.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 32,
    equipment: ['treadmill', 'kettlebell'],
    description:
      'אימון סבולת נקי. המקטע האמצעי בעלייה מפתה לדחוף - החזיקו קצב שמאפשר לרוץ את הקילומטר האחרון בלי לקרוס.',
    warmup: [
      'הליכון | 800 מטר קל',
      'מתיחות דינמיות | 2 דקות',
      'האצות | 3 × 30 שניות בקצב עולה',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '3 סטים, מנוחה 90 שניות. חד-צדדי לפני ריצה ארוכה - זה מה שמייצב את האגן.',
        items: ['Suitcase Carry | 40 מטר לכל צד', 'Single Leg Glute Bridge | 12 לכל צד'],
      },
      {
        label: 'מטקון',
        detail: 'לפי הסדר, למהירות',
        items: [
          'הליכון | 1600 מטר במישור',
          'הליכון | 1600 מטר בעלייה של 4 אחוז',
          'הליכון | 1600 מטר במישור',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '800 / 800 / 800, בלי עלייה.',
      '1200 / 1200 / 1200, עלייה 2 אחוז.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'ladder-thruster-burpee',
    title: 'סולם עולה: תראסטר ובורפי',
    subtitle: 'פורמט Open קלאסי - העבודה גדלה בכל סבב.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 12,
    equipment: ['barbell', 'treadmill'],
    description:
      'בכל סבב מוסיפים 3 חזרות לכל תרגיל. הסבבים הראשונים קלים מדי ומפתים לרוץ - החזיקו קצב, כי הסבב של 15 הוא זה שקובע את התוצאה.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 6, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Front Squat | 6 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 12 דקות - סולם עולה: 3-6-9-12-15... מכל תרגיל',
        items: ['Thrusters | מוט', 'Burpees over Bar | בורפי מעל המוט'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'מוט ריק או משקולות יד, בורפי לצד המוט בלי קפיצה.',
      'משקל שמאפשר סט רצוף של 12.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'reps',
    scoreLabel: 'סך החזרות שהושלמו',
  },
  {
    slug: 'couplet-snatch-stepup',
    title: 'סנאץ׳ וספסל',
    subtitle: 'שני תרגילים, עשר דקות, דופק גבוה.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 10,
    equipment: ['barbell', 'bench', 'treadmill'],
    description:
      'קופלט מהיר בסגנון Open. הסנאץ׳ קל יחסית, ולכן כל הפער נוצר בקצב המעבר בין התחנות. אל תעצרו ליד הספסל - עלו וירדו ברצף.',
    warmup: [...BARBELL_PREP, 'עליות על הספסל | 10 חזרות, 2 סבבים'],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Power Snatch | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 10 דקות',
        items: ['Power Snatch | 10 חזרות, קל', 'Bench Step-overs | 15 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'מוט ריק, עלייה והורדה מהספסל בקצב נוח.',
      'משקל קל, לפי הפרוטוקול.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'triplet-run-kb-lunge',
    title: 'ריצה, קטלבל וצעדים',
    subtitle: 'שלוש תחנות שלא מרשות לדופק לרדת.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 15,
    equipment: ['treadmill', 'kettlebell', 'dumbbell'],
    description:
      'אימון קצב. הריצה היא ההזדמנות היחידה לנשום - רוצו אותה חזק אבל אחיד, ושמרו כוח ברגליים לצעדים.',
    warmup: [
      'הליכון | 600 מטר קל',
      'סווינג קטלבל קל | 15 חזרות',
      'צעדי לאנג׳ | 20 חזרות',
      'פתיחת ירך | 90 שניות לכל צד',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 8, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Hip Thrust | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 15 דקות',
        items: [
          'הליכון | 300 מטר',
          'Kettlebell Swings | 20 חזרות',
          'Walking Lunges | 20 צעדים עם משקולות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '200 מטר, קטלבל קל, 20 צעדים ללא משקל.',
      'לפי הפרוטוקול.',
      'קטלבל כבד, צעדים עם משקולות כבדות.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'emom-24-four-station',
    title: 'EMOM 24: ארבע תחנות',
    subtitle: 'שישה סבבים של ארבע דקות, בלי מקום להתחבא.',
    category: 'crossfit',
    format: 'emom',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['treadmill', 'kettlebell', 'bench', 'barbell'],
    description:
      'כל דקה תרגיל אחר. בחרו נפח שמשאיר לפחות 15 שניות מנוחה בדקה הראשונה - אם אין מנוחה בהתחלה, לא תסיימו את הסבב הרביעי.',
    warmup: [
      'הליכון | 600 מטר קל',
      'סווינג קטלבל קל | 15 חזרות, 2 סבבים',
      'עליות על הספסל | 10 חזרות',
      'מוט ריק: דחיקות | 10 חזרות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Back Squat | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'EMOM 24 דקות - מחזור של ארבע דקות, שש פעמים',
        items: [
          'דקה 1 | הליכון 200 מטר',
          'דקה 2 | 15 סווינג קטלבל',
          'דקה 3 | 12 עליות על הספסל',
          'דקה 4 | 10 דחיקות מוט מעל הראש',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '150 מטר, 10 סווינג קל, 8 עליות, 8 דחיקות במוט ריק.',
      'לפי הפרוטוקול.',
      'נפח מלא עם משקלים כבדים.',
    ),
    scoreType: 'completion',
    scoreLabel: 'כמה דקות הושלמו בזמן',
  },
  {
    slug: 'emom-20-strength-skill',
    title: 'EMOM 20: כוח ומיומנות',
    subtitle: 'דקות מתחלפות בין משקל כבד לתרגיל טכני.',
    category: 'crossfit',
    format: 'emom',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['barbell', 'pullup_bar'],
    description:
      'אימון בנייה, לא אימון שריפה. המשקל צריך להיות כבד מספיק כדי שהחזרה החמישית תדרוש ריכוז, וקל מספיק כדי שהצורה לא תשתנה בדקה 19.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: 'EMOM 20 דקות - דקות אי-זוגיות וזוגיות לסירוגין',
        items: [
          'דקות אי-זוגיות | 5 Front Squats, כבד אבל נקי',
          'דקות זוגיות | 5 Strict Pull-ups',
        ],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 8 דקות, אחרי 3 דקות מנוחה',
        items: ['Burpees | 10 חזרות', 'Kettlebell Swings | 15 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'סקוואט גובלט, משיכות בגומייה.',
      'לפי הפרוטוקול, 3 משיכות נקיות.',
      'משיכות עם משקל נוסף.',
    ),
    scoreType: 'weight',
    scoreLabel: 'המשקל שבו עבדתם בסקוואט',
  },
  {
    slug: 'chipper-150',
    title: "צ'יפר 150",
    subtitle: 'חמש תחנות, שלושים חזרות בכל אחת, פעם אחת.',
    category: 'crossfit',
    format: 'chipper',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 25,
    equipment: ['kettlebell', 'bench', 'dumbbell', 'mat', 'treadmill'],
    description:
      'עוברים תחנה אחרי תחנה בלי לחזור. זה אימון של החלטות: איפה לעצור, כמה זמן, ובאיזו תחנה כדאי לקחת סטים קטנים מראש.',
    warmup: [
      ...GENERAL_PREP,
      'סווינג קטלבל קל | 15 חזרות',
      'תראסטר קל | 10 חזרות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 6, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Deadlift | 6 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'לפי הסדר, למהירות',
        items: [
          'Kettlebell Swings | 30 חזרות',
          'Bench Step-ups | 30 חזרות',
          'Dumbbell Thrusters | 30 חזרות',
          'Sit-ups | 30 חזרות',
          'Burpees | 30 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '20 חזרות בכל תחנה, משקלים קלים.',
      '25 חזרות בכל תחנה.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'chipper-descending-ladder',
    title: "צ'יפר יורד",
    subtitle: 'העבודה מתקצרת בכל תחנה, אבל מתקשה.',
    category: 'crossfit',
    format: 'chipper',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 24,
    equipment: ['treadmill', 'barbell', 'pullup_bar'],
    description:
      'מבנה יורד: 800 מטר, 40 חזרות, 30, 20, 10. ככל שהמספר קטן, התרגיל קשה יותר - כך שהתחושה נשארת אחידה מהתחלה ועד הסוף.',
    warmup: [...BARBELL_PREP, ...GYMNASTICS_PREP.slice(4, 6)],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 3, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Deadlift | 3 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'לפי הסדר, למהירות',
        items: [
          'הליכון | 800 מטר',
          'Air Squats | 40 חזרות',
          'Hang Power Clean | 30 חזרות',
          'Pull-ups | 20 חזרות',
          'Burpees | 10 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '400 מטר, מוט ריק, משיכות בגומייה.',
      '600 מטר, משקל קל, משיכות בקפיצה.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'tabata-this',
    title: 'Tabata This',
    subtitle: 'חמישה תרגילים בפורמט טבאטה, אחד אחרי השני.',
    category: 'crossfit',
    format: 'tabata',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['treadmill', 'pullup_bar', 'mat', 'barbell'],
    description:
      'שמונה סבבים של 20 שניות עבודה ו-10 מנוחה בכל תרגיל, עם דקה מנוחה בין תרגיל לתרגיל. הניקוד הוא סכום החזרות הנמוכות ביותר בכל תרגיל - מה שמעניש התחלה מהירה מדי.',
    warmup: [
      'הליכון | 4 דקות קל',
      'מתיחות דינמיות | 2 דקות',
      'סבב ניסיון קצר בכל תרגיל | 5 חזרות',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 8, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Bent-over Row | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'טבאטה × 5 - 8 סבבים של 20/10 בכל תרגיל, דקה בין תרגילים',
        items: [
          'Air Squats',
          'Pull-ups',
          'Push-ups',
          'Sit-ups',
          'Burpees',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'שלושה תרגילים בלבד, משיכות בגומייה.',
      'חמישה תרגילים, משיכות בקפיצה.',
      'לפי הפרוטוקול, ניקוד לפי הסבב החלש ביותר.',
    ),
    scoreType: 'reps',
    scoreLabel: 'סכום הסבבים הנמוכים',
  },
  {
    slug: 'death-by-burpee',
    title: 'Death by Burpee',
    subtitle: 'חזרה אחת נוספת בכל דקה, עד שנגמר.',
    category: 'crossfit',
    format: 'emom',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['treadmill', 'kettlebell'],
    description:
      'בדקה הראשונה בורפי אחד, בשנייה שניים, וכן הלאה. ממשיכים עד שלא מצליחים להשלים את המכסה בתוך הדקה. אימון שמדרג את עצמו אוטומטית - כל אחד נעצר במקום אחר, וזה בסדר.',
    warmup: [
      ...GENERAL_PREP,
      'בורפי איטי | 5 חזרות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 10, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Goblet Squat | 10 חזרות', 'Kettlebell Row | 10 חזרות לכל צד'],
      },
      {
        label: 'מטקון',
        detail: 'EMOM עד כישלון - דקה 1: בורפי אחד. דקה 2: שניים. וכן הלאה.',
        items: ['Burpees | חזרה נוספת בכל דקה'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'בורפי בלי קפיצה, עוצרים בדקה 10.',
      'בורפי מלא, ממשיכים עד שהדקה לא מספיקה.',
      'בורפי עם קפיצה וטפיחה, עד כישלון אמיתי.',
    ),
    scoreType: 'reps',
    scoreLabel: 'הדקה האחרונה שהושלמה',
  },
  {
    slug: 'heavy-day-back-squat',
    title: 'יום כבד: בק סקוואט',
    subtitle: 'חמישה סטים, חמש חזרות, משקל עולה.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['barbell', 'hip_thrust', 'treadmill', 'mat'],
    description:
      'אימון כוח נקי. עולים במשקל בכל סט, ומפסיקים בסט שבו החזרה האחרונה עדיין נראית כמו הראשונה. רשמו את הסט הכבד ביותר שביצעתם בצורה נקייה.',
    warmup: [
      'הליכון | 4 דקות',
      'סקוואט משקל גוף | 20 חזרות',
      'פתיחת קרסול וירך | 3 דקות',
      'מוט ריק: 10 סקוואטים, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '5 סטים של 5, עלייה במשקל בכל סט, 2-3 דקות מנוחה',
        items: ['Back Squat | סט 1-2 חימום, סט 3-5 עבודה'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים, קצב נוח',
        items: [
          'Hip Thrust | 12 חזרות',
          'Romanian Deadlift | 10 חזרות',
          'Plank | 45 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'סקוואט גובלט עם קטלבל או סקוואט לספסל.',
      '5 סטים של 5 במשקל בינוני.',
      'עלייה עד סט כבד של 5 חזרות.',
    ),
    scoreType: 'weight',
    scoreLabel: 'הסט הכבד ביותר × 5',
  },
  {
    slug: 'heavy-day-deadlift-press',
    title: 'יום כבד: דדליפט ולחיצה',
    subtitle: 'משיכה כבדה, דחיפה כבדה, וסיום קצר.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['barbell', 'kettlebell', 'treadmill'],
    description:
      'שני תרגילי כוח בסיסיים ואחריהם מטקון קצר. שמרו על גב ניטרלי בדדליפט - אם הוא מתעגל בחזרה השלישית, זה המשקל שמפסיקים בו.',
    warmup: [
      'הליכון | 4 דקות',
      'סיבובי ירך וכתף | 2 דקות',
      'מוט ריק: דדליפט ולחיצה | 8 מכל תרגיל, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'דדליפט: 5 סטים של 3, מנוחה 2 דקות. לחיצה: 4 סטים של 5, מנוחה 90 שניות.',
        items: ['Deadlift | 3 חזרות, כבד ונקי', 'Strict Press | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 5 דקות',
        items: ['Kettlebell Swings | 10 חזרות', 'Burpees | 5 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'דדליפט מגובה, לחיצה עם משקולות יד.',
      'לפי הפרוטוקול במשקל בינוני.',
      'לפי הפרוטוקול, כבד.',
    ),
    scoreType: 'weight',
    scoreLabel: 'הדדליפט הכבד ביותר × 3',
  },
  {
    slug: 'bench-and-bar',
    title: 'ספסל ומוט',
    subtitle: 'יום דחיפה עליון, עם מטקון קצר בסוף.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['bench', 'barbell', 'dumbbell', 'treadmill'],
    description:
      'לחיצת חזה כבדה, ואחריה נפח עם משקולות. מי שמתאמן לבד - שימו את המוט על המסילות בגובה החזה לפני הסט האחרון, זו הבטיחות היחידה שיש כאן.',
    warmup: [
      'הליכון | 4 דקות',
      'סיבובי כתף עם משקולת קלה | 10 לכל כיוון',
      'שכיבות סמיכה | 10 חזרות, 2 סבבים',
      'מוט ריק על הספסל | 10 חזרות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Bench Press | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, מנוחה 60 שניות',
        items: [
          'Dumbbell Bench Press | 12 חזרות',
          'Bent-over Row | 12 חזרות',
          'Bench Dips | 15 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'שכיבות סמיכה במקום לחיצה, משקולות קלות.',
      'לפי הפרוטוקול.',
      'לפי הפרוטוקול, כבד.',
    ),
    scoreType: 'weight',
    scoreLabel: 'הלחיצה הכבדה ביותר × 5',
  },
  {
    slug: 'hip-thrust-day',
    title: 'יום היפ תראסט',
    subtitle: 'הישבן הוא המנוע. היום הוא מקבל את הבמה.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['hip_thrust', 'barbell', 'kettlebell', 'treadmill', 'mat'],
    description:
      'היפ תראסט הוא התרגיל שהכי מהר משנה איך מרגישים בדדליפט ובריצה. עצירה של שנייה מלאה למעלה בכל חזרה - בלעדיה זה רק תנועה.',
    warmup: [
      'הליכון | 4 דקות',
      'גשר ירך משקל גוף | 20 חזרות',
      'Clamshells | 15 לכל צד',
      'פתיחת כופפי ירך | 60 שניות לכל צד',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 8, עצירה של שנייה למעלה, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Hip Thrust | 8 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '3 סבבים למהירות',
        items: [
          'Kettlebell Swings | 20 חזרות',
          'Walking Lunges | 20 צעדים',
          'Single Leg Glute Bridge | 12 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'משקל גוף בלבד, 3 סטים.',
      'לפי הפרוטוקול במשקל בינוני.',
      'לפי הפרוטוקול, כבד.',
    ),
    scoreType: 'weight',
    scoreLabel: 'ההיפ תראסט הכבד ביותר × 8',
  },
  {
    slug: 'pull-day',
    title: 'יום משיכה',
    subtitle: 'מתח, חתירה, ואחיזה שנגמרת אחרונה.',
    category: 'crossfit',
    format: 'strength',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['pullup_bar', 'barbell', 'kettlebell', 'treadmill'],
    description:
      'משיכה היא המיומנות שהכי הרבה אנשים נתקעים בה. הבלוק בנוי בשלושה שלבים: משיכה נקייה, חתירה כבדה, ואחיזה - שלושתם ביחד זה מה שמזיז את המחט.',
    warmup: [
      'הליכון | 4 דקות',
      'תלייה פסיבית | 30 שניות, 3 סבבים',
      'משיכת שכמות בתלייה | 8 חזרות, 2 סבבים',
      'חתירה עם מוט ריק | 10 חזרות, 2 סבבים',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '5 סטים, מנוחה 2 דקות',
        items: [
          'Strict Pull-ups | 3-5 חזרות נקיות, או בגומייה',
          'Bent-over Row | 6 חזרות',
        ],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, מנוחה 90 שניות',
        items: [
          'Kettlebell Swings | 20 חזרות',
          'Farmer Carry | 40 מטר',
          'Dead Hang | מקסימום זמן',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'משיכות בגומייה, נשיאה 20 מטר, תלייה 15 שניות.',
      'לפי הפרוטוקול.',
      'משיכות עם משקל נוסף, נשיאה 60 מטר.',
    ),
    scoreType: 'reps',
    scoreLabel: 'משיכות נקיות בסט הטוב',
  },
  {
    slug: 'sprint-intervals',
    title: 'אינטרוולים על ההליכון',
    subtitle: 'עשרה מקטעים קצרים, מנוחה מלאה.',
    category: 'crossfit',
    format: 'intervals',
    difficulty: 'advanced',
    durationMinutes: 60,
    equipment: ['treadmill', 'barbell'],
    description:
      'ריצה מהירה היא מיומנות, לא רק כושר. חממו ביסודיות - ספרינט על שרירים קרים הוא הדרך המהירה ביותר לפציעת מיתר ברך. עלו במהירות בהדרגה בארבעת המקטעים הראשונים.',
    warmup: [
      'הליכון | 800 מטר קל',
      'מתיחות דינמיות: בעיטות ישבן, הרמות ברך | 3 סבבים של 20 מטר',
      'האצות | 4 × 20 שניות בקצב עולה',
    ],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים של 6, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Front Squat | 6 חזרות'],
      },
      {
        label: 'מטקון',
        detail: '10 × 30 שניות, שתי דקות הליכה בין מקטעים',
        items: ['הליכון | 30 שניות בקצב מהיר'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '6 מקטעים של 20 שניות בקצב מהיר ולא מרבי.',
      '8 מקטעים של 30 שניות.',
      '10 מקטעים, כולל עלייה של 2 אחוז.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'partner-split-work',
    title: 'אימון זוגות',
    subtitle: 'אחד עובד, אחד נח. הקצב נקבע ביחד.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'intermediate',
    durationMinutes: 60,
    timeCapMinutes: 25,
    equipment: ['treadmill', 'kettlebell', 'dumbbell', 'barbell'],
    description:
      'מחלקים את החזרות בין שני מתאמנים איך שרוצים, כל עוד רק אחד עובד בכל רגע. אימון טוב לימים שבהם יש פער רמות בקבוצה - כל אחד לוקח כמה שהוא יכול.',
    warmup: [...GENERAL_PREP, 'סווינג קטלבל קל | 15 חזרות'],
    structure: [
      {
        label: 'כוח',
        detail: 'לסירוגין: אחד עושה סט, השני נח. 5 סטים כל אחד.',
        items: ['Deadlift | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'בזוג, למהירות. מחלקים חופשי, רק אחד עובד בכל פעם.',
        items: [
          'הליכון | 1600 מטר',
          'Kettlebell Swings | 150 חזרות',
          'Dumbbell Thrusters | 100 חזרות',
          'Burpees | 100 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'חצי מהחזרות, משקלים קלים.',
      'שלושה רבעים מהחזרות.',
      'לפי הפרוטוקול.',
    ),
    scoreType: 'time',
  },
  {
    slug: 'benchmark-open-couplet',
    title: 'קופלט Open',
    subtitle: 'דדליפט ובורפי. פשוט וקשה.',
    category: 'crossfit',
    format: 'amrap',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 12,
    equipment: ['barbell', 'treadmill'],
    description:
      'שני תרגילים שמתחרים על אותו גב תחתון. זה בכוונה - כאן לומדים לחלק סטים לפני שהגוף מכריח. אל תעשו את 12 הדדליפטים הראשונים ברצף.',
    warmup: BARBELL_PREP,
    structure: [
      {
        label: 'כוח',
        detail: `5 סטים של 5, מנוחה 2 דקות. ${LOAD_NOTE}`,
        items: ['Romanian Deadlift | 5 חזרות'],
      },
      {
        label: 'מטקון',
        detail: 'AMRAP 12 דקות',
        items: ['Deadlift | 12 חזרות, בינוני', 'Burpees over Bar | 9 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'משקל קל, בורפי בלי קפיצה מעל המוט.',
      'לפי הפרוטוקול.',
      'משקל כבד, לפי הפרוטוקול.',
    ),
    scoreType: 'rounds_and_reps',
  },
  {
    slug: 'engine-builder-treadmill',
    title: 'בניית מנוע',
    subtitle: 'מקטעים ארוכים בקצב מדוד.',
    category: 'crossfit',
    format: 'intervals',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['treadmill', 'kettlebell'],
    description:
      'אימון סבולת אירובית. המטרה היא קצב אחיד - הפרש של יותר מ-10 שניות בין המקטע הראשון לאחרון אומר שיצאתם מהר מדי.',
    warmup: [
      'הליכון | 800 מטר קל',
      'מתיחות דינמיות לגב ולירך | 2 דקות',
      'האצות | 3 × 20 שניות בקצב עולה',
    ],
    structure: [
      {
        label: 'כוח',
        detail: '3 סבבים, מנוחה 90 שניות',
        items: ['Goblet Squat | 12 חזרות', 'Single Leg Glute Bridge | 12 לכל צד'],
      },
      {
        label: 'מטקון',
        detail: '6 × 800 מטר, 90 שניות מנוחה בין מקטעים',
        items: ['הליכון | 800 מטר בקצב אחיד'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      '4 מקטעים של 400 מטר.',
      '5 מקטעים של 800 מטר.',
      '6 מקטעים, קצב מרוץ.',
    ),
    scoreType: 'time',
    scoreLabel: 'ממוצע המקטעים',
  },
  {
    slug: 'core-and-carry-crossfit',
    title: 'ליבה ונשיאה',
    subtitle: 'יציבות תחת עומס, לא כפיפות בטן.',
    category: 'crossfit',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 60,
    equipment: ['kettlebell', 'mat', 'pullup_bar', 'treadmill'],
    description:
      'נשיאה היא תרגיל הליבה הכי מתפספס. כשהמשקל ביד אחת, הגוף חייב להתנגד להטיה לצד - וזה בדיוק מה שהגב התחתון צריך.',
    warmup: [...GENERAL_PREP, 'Dead Bug | 10 לכל צד'],
    structure: [
      {
        label: 'כוח',
        detail: `4 סטים, מנוחה 90 שניות. ${LOAD_NOTE}`,
        items: ['Front Squat | 6 חזרות', 'Suitcase Carry | 40 מטר לכל צד'],
      },
      {
        label: 'מטקון',
        detail: '4 סבבים, קצב נוח',
        items: [
          'Hollow Hold | 30 שניות',
          'Hanging Knee Raises | 10 חזרות',
          'Side Plank | 30 שניות לכל צד',
          'Bird Dog | 10 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'משקל קל, פלאנק צד מהברכיים, הרמות ברך בשכיבה.',
      'לפי הפרוטוקול.',
      'משקל כבד, Toes to Bar במקום הרמות ברך.',
    ),
    scoreType: 'completion',
  },
];
