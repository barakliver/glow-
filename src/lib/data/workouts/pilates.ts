import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * Mat pilates: classical sequences, strength work, core stability, posture and
 * the posterior chain.
 *
 * Pilates is scored on completion rather than on numbers. A session done slowly
 * and precisely beats the same session done fast, and the library should not
 * quietly reward the wrong one.
 */

const MAT_PREP = [
  'נשימה צידית בשכיבה | 10 נשימות, יד על הצלעות',
  'הטיית אגן | 10 חזרות',
  'Cat-Cow | 8 חזרות',
  'גשר ירך איטי | 10 חזרות',
  'מתיחת ברך לחזה לסירוגין | 8 לכל צד',
];

const STANDING_PREP = [
  'הליכה במקום | 2 דקות',
  'גלגול עמוד שדרה מעמידה | 5 חזרות איטיות',
  'סיבובי כתף | 10 לכל כיוון',
  'הטיית אגן בעמידה | 10 חזרות',
];

export const PILATES_WORKOUTS: LibraryWorkout[] = [
  {
    slug: 'pilates-classical-mat',
    title: 'פילאטיס מזרן קלאסי',
    subtitle: 'הרצף המקורי, לפי הסדר.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 45,
    equipment: ['mat'],
    description:
      'הרצף הקלאסי בסדר המסורתי שלו. כל תרגיל מכין את הבא אחריו, ולכן הסדר חשוב לא פחות מהתרגילים עצמם. נשימה מלווה כל תנועה: שאיפה בהתארכות, נשיפה במאמץ.',
    warmup: MAT_PREP,
    structure: [
      {
        label: 'פתיחה',
        detail: 'איטי, מוצא את החיבור לליבה',
        items: [
          'The Hundred | 100 פעימות, 10 נשימות',
          'Roll Up | 6 חזרות',
          'Roll Over | 5 חזרות',
          'Single Leg Circles | 5 לכל כיוון, לכל רגל',
        ],
      },
      {
        label: 'הרצף המרכזי',
        items: [
          'Rolling Like a Ball | 8 חזרות',
          'Single Leg Stretch | 10 לכל צד',
          'Double Leg Stretch | 10 חזרות',
          'Scissors | 10 לכל צד',
          'Lower Lift | 8 חזרות',
          'Criss Cross | 10 לכל צד',
        ],
      },
      {
        label: 'עמוד שדרה וירך',
        items: [
          'Spine Stretch Forward | 5 חזרות',
          'Open Leg Rocker | 6 חזרות',
          'Corkscrew | 4 לכל כיוון',
          'Saw | 6 לכל צד',
        ],
      },
      {
        label: 'שרשרת אחורית וסיום',
        items: [
          'Swan Dive | 6 חזרות',
          'Single Leg Kick | 8 לכל צד',
          'Double Leg Kick | 6 חזרות',
          'Neck Pull | 6 חזרות',
          'Side Kick Series | 10 מכל תרגיל, לכל צד',
          'Teaser | 3 חזרות',
          'Seal | 8 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'ברכיים כפופות ב-Roll Up ו-Teaser, דילוג על Roll Over ו-Open Leg Rocker.',
      'הרצף המלא עם ידיים מאחורי הירך בתרגילים הקשים.',
      'הרצף המלא בקצב רציף בלי הפסקות בין תרגילים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-core-foundations',
    title: 'יסודות הליבה',
    subtitle: 'חמישה עקרונות, חצי שעה, בלי מהירות.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['mat'],
    description:
      'שיעור הפתיחה. לומדים למצוא את המצב הניטרלי של האגן, לנשום לצדדים, ולהפעיל את הליבה בלי לתפוס את הצוואר. זה הבסיס לכל שאר התרגילים בקטגוריה.',
    warmup: MAT_PREP,
    structure: [
      {
        label: 'חיבור',
        detail: 'איטי מאוד, 5 נשימות בכל תרגיל',
        items: [
          'אגן ניטרלי ונשימה | 10 נשימות',
          'הטיית אגן | 10 חזרות',
          'Toe Taps | 10 לכל צד',
        ],
      },
      {
        label: 'ליבה',
        detail: '2 סבבים',
        items: [
          'Dead Bug | 8 לכל צד',
          'Single Leg Stretch | 8 לכל צד',
          'The Hundred | 50 פעימות',
          'Bridge | 10 חזרות',
        ],
      },
      {
        label: 'גב',
        items: [
          'Swimming | 30 שניות',
          'Bird Dog | 8 לכל צד',
          'Child’s Pose | 60 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'ראש על המזרן בכל התרגילים בשכיבה.',
      'הרמת ראש וכתפיים לפי הפרוטוקול.',
      'רגליים ישרות וזווית נמוכה יותר.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-power-mat',
    title: 'פילאטיס כוח',
    subtitle: 'אותם עקרונות, יותר עומס.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'advanced',
    durationMinutes: 45,
    equipment: ['mat', 'bands', 'dumbbell'],
    description:
      'שיעור פילאטיס שמוסיף התנגדות. הגומייה והמשקולות הקלות לא משנות את איכות התנועה - הן רק מאריכות את הזמן שבו השריר עובד.',
    warmup: MAT_PREP,
    structure: [
      {
        label: '3 סבבים',
        detail: 'איטי ומבוקר, 3 שניות בירידה',
        items: [
          'Teaser | 5 חזרות',
          'Single Leg Bridge | 10 לכל צד',
          'Side Plank with Leg Lift | 10 לכל צד',
          'Band Pull-aparts | 15 חזרות',
          'Swan with Arm Reach | 8 חזרות',
          'Roll Up עם משקולת קלה | 8 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'בלי התנגדות, 2 סבבים.',
      'גומייה קלה, 3 סבבים.',
      'גומייה חזקה ומשקולות 2-3 ק״ג.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-core-stability-deep',
    title: 'יציבות ליבה עמוקה',
    subtitle: 'שרירים שלא רואים במראה.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['mat'],
    description:
      'עבודה על השכבה העמוקה - רוחבי הבטן, רצפת האגן והמייצבים של עמוד השדרה. אין כאן תחושת שריפה גדולה, וזה בסדר: העבודה נמדדת ביציבות ולא בכאב.',
    warmup: MAT_PREP,
    structure: [
      {
        label: '3 סבבים',
        detail: '30 שניות מנוחה בין סבבים',
        items: [
          'Dead Bug | 10 לכל צד, איטי',
          'Bird Dog | 10 לכל צד',
          'Side Plank | 30 שניות לכל צד',
          'Hollow Hold | 30 שניות',
          'Glute Bridge March | 10 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'פלאנק צד מהברכיים, 20 שניות.',
      'לפי הפרוטוקול.',
      'פלאנק צד עם הרמת רגל, 45 שניות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-posture-desk',
    title: 'יציבה אחרי יום מול מסך',
    subtitle: 'פותחים את מה שהתקצר.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 25,
    equipment: ['mat', 'bands'],
    description:
      'שיעור קצר למי שיושב שמונה שעות ביום. הרעיון פשוט: לפתוח את החזה וכופפי הירך שהתקצרו, ולחזק את הגב העליון והישבן שנרדמו.',
    warmup: STANDING_PREP,
    structure: [
      {
        label: 'פתיחה',
        items: [
          'פתיחת חזה במשקוף | 45 שניות',
          'מתיחת כופפי ירך בכריעה | 60 שניות לכל צד',
          'Thread the Needle | 45 שניות לכל צד',
        ],
      },
      {
        label: 'חיזוק',
        detail: '3 סבבים',
        items: [
          'Band Pull-aparts | 15 חזרות',
          'Prone Y-T-W | 8 מכל אות',
          'Glute Bridge | 15 חזרות',
          'Wall Angels | 10 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '2 סבבים, בלי גומייה.',
      'לפי הפרוטוקול.',
      '4 סבבים עם גומייה חזקה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-posterior-chain',
    title: 'שרשרת אחורית',
    subtitle: 'גב, ישבן ומיתרי ברך.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['mat', 'bands'],
    description:
      'כל מה שנמצא בגב הגוף. אצל רוב האנשים זה הצד החלש, והחיזוק שלו הוא מה שמוריד כאבי גב תחתון יותר מכל מתיחה.',
    warmup: MAT_PREP,
    structure: [
      {
        label: '3 סבבים',
        items: [
          'Single Leg Bridge | 12 לכל צד',
          'Swimming | 45 שניות',
          'Prone Leg Lifts | 12 לכל צד',
          'Clamshells עם גומייה | 15 לכל צד',
          'Hamstring Curl בגלגול | 12 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'גשר דו-רגלי, בלי גומייה.',
      'לפי הפרוטוקול.',
      'גשר על רגל אחת עם משקל, 4 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-flexibility-flow',
    title: 'גמישות מודרכת',
    subtitle: 'טווחי תנועה, לאט.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['mat', 'bands'],
    description:
      'שיעור שמוקדש כולו לטווח תנועה. אחזקות ארוכות עם נשימה - לא מתיחות קפיציות. אם אתם מרגישים חדות ולא מתיחה, צאו מהטווח.',
    warmup: MAT_PREP,
    structure: [
      {
        label: 'רצף מתיחות',
        detail: '60-90 שניות בכל תנוחה, נשימה עמוקה',
        items: [
          'Spine Stretch Forward | 8 חזרות איטיות',
          'Saw | 8 לכל צד',
          'מתיחת מיתרי ברך עם גומייה | 90 שניות לכל צד',
          'Figure Four | 90 שניות לכל צד',
          'Spinal Twist בשכיבה | 90 שניות לכל צד',
          'Mermaid | 60 שניות לכל צד',
          'Child’s Pose | 2 דקות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'טווח חלקי, ברכיים כפופות.',
      'לפי הפרוטוקול.',
      'טווח מלא, אחזקות של 2 דקות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-abs-focus',
    title: 'בטן ממוקד',
    subtitle: 'עשרים דקות, ליבה בלבד.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 25,
    equipment: ['mat'],
    description:
      'שיעור קצר וממוקד. שמרו על הגב התחתון צמוד למזרן לאורך כל התרגילים - ברגע שהוא מתרומם, הורידו את הרגליים גבוה יותר.',
    warmup: MAT_PREP,
    structure: [
      {
        label: '3 סבבים',
        detail: '45 שניות מנוחה בין סבבים',
        items: [
          'The Hundred | 100 פעימות',
          'Single Leg Stretch | 15 לכל צד',
          'Double Leg Stretch | 12 חזרות',
          'Criss Cross | 15 לכל צד',
          'Lower Lift | 10 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'ראש על המזרן, ברכיים ב-90 מעלות.',
      'לפי הפרוטוקול.',
      'רגליים ישרות ונמוכות, 4 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-standing-balance',
    title: 'פילאטיס בעמידה',
    subtitle: 'שיווי משקל ויציבה, בלי מזרן.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['none', 'bands'],
    description:
      'כל השיעור בעמידה. שימושי למי שקשה לו לרדת ולעלות מהרצפה, ולכל מי שרוצה לעבוד על שיווי משקל - יכולת שיורדת מהר יותר מכוח.',
    warmup: STANDING_PREP,
    structure: [
      {
        label: '3 סבבים',
        items: [
          'עמידה על רגל אחת | 45 שניות לכל צד',
          'Standing Leg Circles | 10 לכל כיוון, לכל רגל',
          'Roll Down | 6 חזרות',
          'Standing Side Bend | 10 לכל צד',
          'Heel Raises | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'יד על הקיר לתמיכה.',
      'בלי תמיכה.',
      'עיניים עצומות בעמידה על רגל אחת.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-lower-back-care',
    title: 'טיפוח גב תחתון',
    subtitle: 'לימים שהגב מזכיר את עצמו.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 25,
    equipment: ['mat'],
    description:
      'שיעור עדין לגב רגיש. אין בו כיפוף קדימה בעומס ואין סיבובים חדים. אם משהו מכאיב - דלגו עליו. כאב חד הוא לא חלק מהתרגיל.',
    warmup: [
      'נשימה בשכיבה עם ברכיים כפופות | 10 נשימות',
      'הטיית אגן | 12 חזרות',
      'ברך לחזה לסירוגין | 10 לכל צד',
    ],
    structure: [
      {
        label: 'רצף עדין',
        detail: 'איטי, בלי להגיע לקצה הטווח',
        items: [
          'Cat-Cow | 10 חזרות',
          'Bird Dog | 8 לכל צד',
          'Glute Bridge | 12 חזרות',
          'Dead Bug | 8 לכל צד',
          'Side Plank מהברכיים | 20 שניות לכל צד',
          'Knee Rolls | 10 לכל צד',
        ],
      },
    ],
    cooldown: [
      'תנוחת ילד | 2 דקות',
      'שכיבה עם רגליים על כיסא | 3 דקות',
      'נשימת סרעפת | 2 דקות',
    ],
    scaling: scale(
      'טווח קטן, 6 חזרות בכל תרגיל.',
      'לפי הפרוטוקול.',
      'תוספת של Swimming ו-Prone Leg Lifts.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-hips-and-glutes',
    title: 'אגן וישבן',
    subtitle: 'סדרת הצד הקלאסית, מלאה.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 30,
    equipment: ['mat', 'bands'],
    description:
      'סדרת השכיבה על הצד במלואה. השריר שעובד כאן - הישבן האמצעי - הוא זה שמייצב את האגן בהליכה ובריצה, ולכן יש לזה השפעה מעבר לשיעור.',
    warmup: MAT_PREP,
    structure: [
      {
        label: 'לכל צד, סבב שלם',
        detail: '2 סבבים לכל צד',
        items: [
          'Side Kick Front-Back | 15 חזרות',
          'Side Kick Up-Down | 15 חזרות',
          'Small Circles | 15 לכל כיוון',
          'Clamshell | 20 חזרות',
          'Inner Thigh Lift | 15 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'סבב אחד לכל צד, בלי גומייה.',
      'לפי הפרוטוקול.',
      'גומייה חזקה, 3 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-full-body-express',
    title: 'פילאטיס אקספרס',
    subtitle: 'עשרים דקות שמכסות הכל.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 22,
    equipment: ['mat'],
    description:
      'גרסה מקוצרת לימים עמוסים. עשרים דקות בקצב רציף שנוגעות בליבה, בגב, בישבן ובגמישות.',
    warmup: MAT_PREP.slice(0, 3),
    structure: [
      {
        label: 'רצף רציף',
        detail: '2 סבבים בלי מנוחה בין תרגילים',
        items: [
          'The Hundred | 50 פעימות',
          'Roll Up | 5 חזרות',
          'Single Leg Stretch | 10 לכל צד',
          'Bridge | 12 חזרות',
          'Swimming | 30 שניות',
          'Side Plank | 20 שניות לכל צד',
          'Spine Stretch Forward | 5 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'סבב אחד.',
      '2 סבבים.',
      '3 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-teaser-progression',
    title: 'הדרך אל ה-Teaser',
    subtitle: 'שיעור שבונה תרגיל אחד.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'advanced',
    durationMinutes: 35,
    equipment: ['mat'],
    description:
      'ה-Teaser הוא תרגיל הסימן של פילאטיס, והוא דורש שילוב של כוח ליבה, גמישות מיתרי ברך ושליטה בגלגול עמוד השדרה. השיעור מפרק אותו לשלבים ובונה אותו מחדש.',
    warmup: MAT_PREP,
    structure: [
      {
        label: 'שלב 1 - גלגול',
        items: ['Roll Up | 8 חזרות איטיות', 'Rolling Like a Ball | 10 חזרות'],
      },
      {
        label: 'שלב 2 - חלקים',
        items: [
          'Teaser עם רגל אחת | 6 לכל צד',
          'Teaser עם ברכיים כפופות | 6 חזרות',
          'Half Teaser מהרצפה | 8 חזרות',
        ],
      },
      {
        label: 'שלב 3 - התרגיל',
        detail: '3 סטים, מנוחה מלאה',
        items: ['Teaser מלא | 3-5 חזרות'],
      },
      {
        label: 'תמיכה',
        items: ['Hollow Hold | 30 שניות, 3 סבבים', 'מתיחת מיתרי ברך | 90 שניות לכל צד'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'עצירה בשלב 2, ידיים על הירך.',
      'Teaser עם ברכיים כפופות.',
      'Teaser מלא, רגליים ישרות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-breath-and-ribcage',
    title: 'נשימה ובית חזה',
    subtitle: 'המיומנות שכל השאר נשען עליה.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 25,
    equipment: ['mat', 'bands'],
    description:
      'שיעור שמוקדש לנשימה. רוב האנשים נושמים לתוך הבטן או לתוך הכתפיים ומדלגים על הצלעות. זה משנה את תפקוד הליבה בכל תרגיל אחר - ולכן זה שווה שיעור שלם.',
    warmup: ['שכיבה עם ברכיים כפופות, ידיים על הצלעות | 2 דקות'],
    structure: [
      {
        label: 'לימוד',
        detail: '10 נשימות בכל תנוחה',
        items: [
          'נשימה צידית בשכיבה | ידיים על הצלעות',
          'נשימה צידית עם גומייה סביב הצלעות',
          'נשימה בישיבה מזרחית',
          'נשימה בתנוחת ילד',
        ],
      },
      {
        label: 'יישום',
        detail: 'מלווים כל תנועה בנשיפה במאמץ',
        items: [
          'Bridge | 10 חזרות',
          'Dead Bug | 8 לכל צד',
          'Cat-Cow | 10 חזרות',
          'The Hundred | 100 פעימות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      'רק חלק הלימוד.',
      'לפי הפרוטוקול.',
      'תוספת של אחזקות ארוכות בנשיפה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-athlete-support',
    title: 'פילאטיס לספורטאי',
    subtitle: 'משלים אימונים כבדים, לא מחליף אותם.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['mat', 'bands'],
    description:
      'שיעור שנבנה כיום משלים למי שמתאמן כבד בשאר השבוע. הדגש הוא על מייצבי הכתף והאגן - המקומות שמתעייפים ראשונים תחת עומס ומובילים לפציעות.',
    warmup: MAT_PREP,
    structure: [
      {
        label: '3 סבבים',
        items: [
          'Prone Y-T-W | 8 מכל אות',
          'Side Plank with Rotation | 10 לכל צד',
          'Single Leg Bridge | 12 לכל צד',
          'Clamshell עם גומייה | 20 לכל צד',
          'Bird Dog | 10 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      '2 סבבים, בלי גומייה.',
      'לפי הפרוטוקול.',
      '4 סבבים עם גומייה חזקה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-prenatal-safe',
    title: 'פילאטיס עדין',
    subtitle: 'בלי שכיבה על הבטן ובלי כיפוף בטן.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['mat', 'bands'],
    description:
      'גרסה שמוותרת על שכיבה על הבטן ועל תרגילי כיפוף בטן. מתאימה למי שחוזר מפציעה, למי שהבטן רגישה, ולכל מי שמעדיף עומס נמוך. אם יש מצב רפואי - התייעצו קודם עם מי שמטפל בכם.',
    warmup: STANDING_PREP,
    structure: [
      {
        label: 'רצף',
        detail: 'איטי, נשימה מלאה בכל תנועה',
        items: [
          'Cat-Cow | 10 חזרות',
          'Bird Dog | 10 לכל צד',
          'Side-Lying Leg Series | 12 מכל תרגיל, לכל צד',
          'Glute Bridge | 15 חזרות',
          'Wall Squat Hold | 30 שניות, 3 סבבים',
          'Standing Roll Down | 6 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'טווח קטן, תמיכה ביד.',
      'לפי הפרוטוקול.',
      'תוספת גומייה בכל תרגיל.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-spine-mobility',
    title: 'ניידות עמוד שדרה',
    subtitle: 'כיפוף, יישור, סיבוב, הטיה.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 30,
    equipment: ['mat'],
    description:
      'עמוד השדרה נע בארבעה כיוונים, ורוב הימים הוא נע רק באחד. השיעור עובר על כל הארבעה בסדר מסודר, מהעדין אל העמוק.',
    warmup: MAT_PREP,
    structure: [
      {
        label: 'כיפוף',
        items: ['Roll Up | 8 חזרות', 'Spine Stretch Forward | 8 חזרות'],
      },
      {
        label: 'יישור',
        items: ['Swan | 8 חזרות', 'Swimming | 45 שניות'],
      },
      {
        label: 'סיבוב',
        items: ['Saw | 8 לכל צד', 'Spine Twist בישיבה | 10 לכל צד'],
      },
      {
        label: 'הטיה',
        items: ['Mermaid | 8 לכל צד', 'Side Bend בעמידה | 10 לכל צד'],
      },
    ],
    cooldown: [...COOLDOWNS.posterior],
    scaling: scale(
      'טווח חלקי, ברכיים כפופות בישיבה.',
      'לפי הפרוטוקול.',
      'טווח מלא, אחזקה של 3 שניות בקצה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-arms-and-shoulders',
    title: 'ידיים וכתפיים',
    subtitle: 'עומס קל, הרבה חזרות, שליטה מלאה.',
    category: 'pilates',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 28,
    equipment: ['mat', 'bands', 'dumbbell'],
    description:
      'עבודה על הכתף עם משקל קל מאוד. המטרה היא סבולת ובקרה ולא היפרטרופיה - ולכן משקולת של שניים-שלושה קילו מספיקה לחלוטין כאן.',
    warmup: STANDING_PREP,
    structure: [
      {
        label: '3 סבבים',
        detail: 'משקולות 1-3 ק״ג, קצב איטי',
        items: [
          'Arm Circles | 20 לכל כיוון',
          'Front Raise | 15 חזרות',
          'Lateral Raise | 15 חזרות',
          'Band Pull-aparts | 20 חזרות',
          'Tricep Extension | 15 חזרות',
          'Prone Y-T-W | 8 מכל אות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'בלי משקל.',
      'משקולות 2 ק״ג.',
      'משקולות 4 ק״ג, 4 סבבים.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-evening-unwind',
    title: 'פילאטיס ערב',
    subtitle: 'להוריד הילוך לפני השינה.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 25,
    equipment: ['mat'],
    description:
      'שיעור שמסתיים נמוך יותר ממה שהתחיל. בלי עבודה מאומצת ובלי דופק גבוה - רצף שמרפה את מה שנתפס במהלך היום ומכין לשינה.',
    warmup: ['נשימת סרעפת בשכיבה | 2 דקות'],
    structure: [
      {
        label: 'רצף יורד',
        detail: '60-90 שניות בכל תנוחה',
        items: [
          'Cat-Cow | 10 חזרות איטיות',
          'Thread the Needle | 60 שניות לכל צד',
          'Child’s Pose | 90 שניות',
          'Knee Rolls | 10 לכל צד',
          'Figure Four | 90 שניות לכל צד',
          'רגליים על הקיר | 3 דקות',
        ],
      },
    ],
    cooldown: ['נשימה 4-7-8 | 8 סבבים', 'שכיבה שקטה | 2 דקות'],
    scaling: scale(
      'אחזקות של 45 שניות.',
      'לפי הפרוטוקול.',
      'אחזקות של 2 דקות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'pilates-fifty-minute-full',
    title: 'שיעור מלא 50 דקות',
    subtitle: 'השיעור השלם, בלי קיצורים.',
    category: 'pilates',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 50,
    equipment: ['mat', 'bands'],
    description:
      'השיעור הארוך של הקטגוריה. חימום מלא, רצף מרכזי, עבודת צד, עבודת גב וסיום ארוך. זה השיעור להביא אליו את הבוקר של יום ראשון.',
    warmup: [...MAT_PREP, 'Roll Down בעמידה | 6 חזרות'],
    structure: [
      {
        label: 'ליבה',
        items: [
          'The Hundred | 100 פעימות',
          'Roll Up | 8 חזרות',
          'Single Leg Circles | 8 לכל כיוון',
          'Rolling Like a Ball | 10 חזרות',
        ],
      },
      {
        label: 'סדרת הבטן',
        items: [
          'Single Leg Stretch | 12 לכל צד',
          'Double Leg Stretch | 12 חזרות',
          'Scissors | 12 לכל צד',
          'Lower Lift | 10 חזרות',
          'Criss Cross | 12 לכל צד',
        ],
      },
      {
        label: 'צד וגב',
        items: [
          'Side Kick Series | 12 מכל תרגיל, לכל צד',
          'Swan | 8 חזרות',
          'Swimming | 60 שניות',
          'Single Leg Kick | 10 לכל צד',
        ],
      },
      {
        label: 'סיום',
        items: ['Teaser | 5 חזרות', 'Spine Stretch Forward | 8 חזרות', 'Seal | 10 חזרות'],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'חצי מהחזרות, דילוג על Teaser.',
      'לפי הפרוטוקול.',
      'לפי הפרוטוקול ברצף בלי מנוחות.',
    ),
    scoreType: 'completion',
  },
];
