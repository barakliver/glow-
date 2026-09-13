import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * Yoga and mobility: vinyasa, power yoga, yin, and recovery work.
 *
 * Sanskrit pose names are kept alongside the Hebrew so a member can follow a
 * class taught either way. Nothing here is scored on speed; several sessions
 * are deliberately the easiest thing on the schedule.
 */

const JOINT_PREP = [
  'ישיבה ונשימה | 2 דקות', 'Cat-Cow | 10 חזרות', 'סיבובי כתף ופרק כף יד | 10 לכל כיוון', 'כלב מביט מטה, כיפוף ברכיים לסירוגין | 60 שניות',
];

const SUN_A = [
  'Tadasana | הר, 3 נשימות', 'Urdhva Hastasana | הושטה מעלה', 'Uttanasana | כיפוף קדימה', 'Ardha Uttanasana | חצי הרמה', 'Chaturanga | הנמכה מבוקרת', 'Urdhva Mukha Svanasana | כלב מביט מעלה', 'Adho Mukha Svanasana | כלב מביט מטה, 5 נשימות',
];

export const YOGA_WORKOUTS: LibraryWorkout[] = [
  {
    slug: 'vinyasa-morning-flow',
    title: 'ויניאסה בוקר',
    subtitle: 'לפתוח את הגוף לפני שהיום מתחיל.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['mat'],
    description:
      'רצף זורם שמתחיל לאט ומתחמם בהדרגה. הנשימה מובילה - כל תנועה מתחילה בשאיפה או בנשיפה, ולא להפך. אם הנשימה מתקצרת, האטו.',
    warmup: JOINT_PREP,
    structure: [
      { label: 'ברכת שמש א׳', detail: '5 סבבים', items: SUN_A },
      {
        label: 'רצף עמידה',
        detail: '2 סבבים לכל צד, 5 נשימות בכל תנוחה',
        items: [
          'Virabhadrasana I | לוחם א׳', 'Virabhadrasana II | לוחם ב׳', 'Utthita Trikonasana | משולש', 'Parsvakonasana | זווית צידית',
        ],
      },
      {
        label: 'סיום',
        items: [
          'Malasana | כריעה עמוקה, 60 שניות', 'Paschimottanasana | כיפוף קדימה בישיבה, 90 שניות', 'Supta Matsyendrasana | פיתול בשכיבה, 60 שניות לכל צד',
        ],
      },
    ],
    cooldown: ['Savasana | שכיבת מנוחה, 4 דקות'],
    scaling: scale(
      '3 ברכות שמש, ברכיים על המזרן ב-Chaturanga.', 'לפי הפרוטוקול.', '8 ברכות שמש וקצב רציף.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'vinyasa-full-flow',
    title: 'ויניאסה מלא',
    subtitle: 'שישים דקות של תנועה רציפה.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 60,
    equipment: ['mat'],
    description:
      'שיעור מלא עם רצף עמידה ארוך, שיווי משקל וסיום שקט. הדופק עולה יותר משנדמה - זה שיעור שאפשר לספור אותו כאימון.',
    warmup: [...JOINT_PREP, 'ברכת שמש א׳ | 3 סבבים איטיים'],
    structure: [
      { label: 'חימום זורם', detail: '5 סבבים', items: SUN_A },
      {
        label: 'רצף עמידה',
        detail: '3 סבבים לכל צד',
        items: [
          'Virabhadrasana I | לוחם א׳', 'Virabhadrasana III | לוחם ג׳', 'Ardha Chandrasana | חצי ירח', 'Parivrtta Trikonasana | משולש מסובב', 'Utkatasana | כיסא',
        ],
      },
      {
        label: 'שיווי משקל',
        detail: '5 נשימות בכל תנוחה, לכל צד',
        items: ['Vrksasana | עץ', 'Garudasana | נשר', 'Natarajasana | רקדן'],
      },
      {
        label: 'רצפה',
        items: [
          'Bhujangasana | קוברה, 5 נשימות', 'Dhanurasana | קשת, 3 סבבים של 5 נשימות', 'Setu Bandha | גשר, 60 שניות', 'Halasana | מחרשה, 60 שניות',
        ],
      },
    ],
    cooldown: ['Supta Matsyendrasana | פיתול, 90 שניות לכל צד', 'Savasana | 5 דקות'],
    scaling: scale(
      'רצף עמידה אחד לכל צד, דילוג על חצי ירח ומחרשה.', 'לפי הפרוטוקול.', 'תוספת של עמידת ידיים בקיר ו-Chaturanga מלא בכל מעבר.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'power-yoga-strength',
    title: 'פאוור יוגה',
    subtitle: 'יוגה שנחשבת אימון כוח.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'advanced',
    durationMinutes: 45,
    equipment: ['mat'],
    description:
      'אחזקות ארוכות ומעברים דרך Chaturanga. אין כאן מנוחה בין תנוחות - הרגליים והכתפיים עובדות ברצף, וזה מרגיש בדיוק כמו מעגל כוח.',
    warmup: [...JOINT_PREP, 'ברכת שמש א׳ | 3 סבבים'],
    structure: [
      { label: 'חימום', detail: '5 סבבים בקצב', items: SUN_A },
      {
        label: 'בלוק כוח',
        detail: '3 סבבים לכל צד, אחזקה של 8 נשימות בכל תנוחה',
        items: [
          'Utkatasana | כיסא', 'Virabhadrasana III | לוחם ג׳', 'Chaturanga Hold | אחזקה נמוכה, 20 שניות', 'Phalakasana | פלאנק, 45 שניות', 'Vasisthasana | פלאנק צד, 30 שניות',
        ],
      },
      {
        label: 'שיאים',
        detail: '3 ניסיונות בכל תנוחה',
        items: [
          'Bakasana | עורב', 'Adho Mukha Vrksasana | עמידת ידיים בקיר, 30 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips, 'Savasana | 3 דקות'],
    scaling: scale(
      'ברכיים ב-Chaturanga, דילוג על העורב.', 'לפי הפרוטוקול, עורב עם מדרגה.', 'לפי הפרוטוקול, אחזקות ארוכות יותר.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'power-yoga-core',
    title: 'פאוור יוגה: ליבה',
    subtitle: 'רצף שמתמקד במרכז.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 40,
    equipment: ['mat'],
    description:
      'הליבה עובדת בכל תנוחה, אבל כאן היא במרכז. מעברים איטיים בכוונה - מעבר איטי דורש פי כמה יותר בקרה ממעבר מהיר.',
    warmup: JOINT_PREP,
    structure: [
      { label: 'חימום', detail: '4 סבבים', items: SUN_A },
      {
        label: 'ליבה',
        detail: '3 סבבים',
        items: [
          'Phalakasana | פלאנק, 45 שניות', 'Vasisthasana | פלאנק צד, 30 שניות לכל צד', 'Navasana | סירה, 45 שניות', 'Ardha Navasana | חצי סירה, 30 שניות', 'Knee-to-Nose מכלב מביט מטה | 10 לכל צד',
        ],
      },
      {
        label: 'איזון',
        detail: '5 נשימות בכל תנוחה',
        items: ['Vrksasana | עץ', 'Virabhadrasana III | לוחם ג׳'],
      },
    ],
    cooldown: ['Balasana | תנוחת ילד, 2 דקות', 'Supta Matsyendrasana | 60 שניות לכל צד'],
    scaling: scale(
      'פלאנק מהברכיים, סירה עם ברכיים כפופות.', 'לפי הפרוטוקול.', '4 סבבים ואחזקות של דקה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yin-yoga-hips',
    title: 'יין יוגה: אגן',
    subtitle: 'תנוחות ארוכות. בלי לזוז.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 50,
    equipment: ['mat'],
    description:
      'יין הוא ההפך מכל השאר בלוח: נשארים בכל תנוחה שלוש עד חמש דקות בשריר רפוי, ונותנים לרקמות העמוקות זמן להשתנות. אי-נוחות עמומה זה בסדר. חדות זה לא.',
    warmup: ['ישיבה ונשימה | 3 דקות', 'Cat-Cow איטי | 10 חזרות'],
    structure: [
      {
        label: 'רצף יין',
        detail: '3-5 דקות בכל תנוחה, גוף רפוי',
        items: [
          'Butterfly | פרפר', 'Dragon | דרקון, לכל צד', 'Pigeon | יונה, לכל צד', 'Frog | צפרדע', 'Sleeping Swan | ברבור ישן, לכל צד', 'Supported Bridge | גשר נתמך',
        ],
      },
    ],
    cooldown: ['רגליים על הקיר | 4 דקות', 'Savasana | 5 דקות'],
    scaling: scale(
      '2 דקות בכל תנוחה עם תמיכת כריות.', '3 דקות בכל תנוחה.', '5 דקות בכל תנוחה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yin-yoga-spine',
    title: 'יין יוגה: גב',
    subtitle: 'שחרור עמוק לגב ולגב עליון.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 45,
    equipment: ['mat'],
    description:
      'רצף יין שממוקד בעמוד השדרה. מתאים במיוחד לימים שאחרי אימון כבד או אחרי יום ארוך של ישיבה.',
    warmup: ['נשימת סרעפת בשכיבה | 3 דקות'],
    structure: [
      {
        label: 'רצף יין',
        detail: '3-4 דקות בכל תנוחה',
        items: [
          'Caterpillar | זחל', 'Sphinx | ספינקס', 'Seal | כלב ים', 'Melting Heart | לב נמס', 'Supine Twist | פיתול בשכיבה, לכל צד', 'Child’s Pose | תנוחת ילד',
        ],
      },
    ],
    cooldown: ['Savasana | 5 דקות'],
    scaling: scale(
      '2 דקות בכל תנוחה, תמיכת כריות מלאה.', '3 דקות בכל תנוחה.', '4-5 דקות בכל תנוחה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'mobility-hips-deep',
    title: 'מוביליטי: אגן',
    subtitle: 'טווח תנועה פעיל, לא רק מתיחה.',
    category: 'yoga',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['mat', 'bands'],
    description:
      'ההבדל בין גמישות לניידות הוא שליטה. כאן לא רק נכנסים לטווח - גם מפעילים בו שרירים, וזה מה שגורם לטווח החדש להישאר.',
    warmup: JOINT_PREP,
    structure: [
      {
        label: '3 סבבים',
        items: [
          '90/90 Hip Switch | 10 חזרות', 'Cossack Squat | 8 לכל צד', 'Deep Squat Hold | 60 שניות', 'Couch Stretch | 90 שניות לכל צד', 'Active Pigeon Lift | 8 לכל צד',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips],
    scaling: scale(
      'טווח חלקי עם תמיכה.', 'לפי הפרוטוקול.', 'תוספת עומס קל בכל תנוחה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'mobility-shoulders-thoracic',
    title: 'מוביליטי: כתפיים וגב עליון',
    subtitle: 'הכנה לעבודה מעל הראש.',
    category: 'yoga',
    format: 'circuit',
    difficulty: 'intermediate',
    durationMinutes: 30,
    equipment: ['mat', 'bands'],
    description:
      'מי שלא מצליח להחזיק מוט מעל הראש בלי לקשת את הגב התחתון - זה השיעור. הבעיה כמעט תמיד בגב העליון ולא בכתף עצמה.',
    warmup: JOINT_PREP,
    structure: [
      {
        label: '3 סבבים',
        items: [
          'Thread the Needle | 45 שניות לכל צד', 'Thoracic Extension על גליל | 60 שניות', 'Band Dislocates | 10 חזרות איטיות', 'Wall Slides | 12 חזרות', 'Prone Y-T-W | 8 מכל אות', 'Puppy Pose | 60 שניות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders],
    scaling: scale(
      'גומייה רחבה, טווח קטן.', 'לפי הפרוטוקול.', 'גומייה צרה וטווח מלא.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'mobility-ankles-and-feet',
    title: 'מוביליטי: קרסוליים',
    subtitle: 'החוליה שמגבילה את הסקוואט.',
    category: 'yoga',
    format: 'circuit',
    difficulty: 'beginner',
    durationMinutes: 25,
    equipment: ['mat', 'bands'],
    description:
      'קרסול נוקשה מוציא את העקבים מהרצפה בסקוואט ומעביר את העומס לברך ולגב. עשרים דקות בשבוע כאן משנות את הסקוואט יותר מכל תיקון טכני.',
    warmup: ['הליכה על קצות האצבעות ועל העקבים | 2 דקות', 'סיבובי קרסול | 15 לכל כיוון'],
    structure: [
      {
        label: '3 סבבים',
        items: [
          'Knee-to-Wall | 15 חזרות לכל צד', 'Deep Squat Hold עם עקבים על הרצפה | 60 שניות', 'Calf Raise איטי | 15 חזרות', 'Tibialis Raise | 15 חזרות', 'Toe Splay ו-Short Foot | 10 חזרות',
        ],
      },
    ],
    cooldown: ['מתיחת שוקיים בקיר | 90 שניות לכל צד', 'ישיבה על העקבים | 60 שניות'],
    scaling: scale(
      'עקבים על צלחת, טווח קטן.', 'לפי הפרוטוקול.', 'טווח מלא עם עומס קל.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'recovery-after-leg-day',
    title: 'התאוששות אחרי יום רגליים',
    subtitle: 'למחרת בבוקר.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['mat'],
    description:
      'רצף עדין ליום שאחרי. תנועה קלה מזרימה דם לשרירים כואבים ומקצרת את זמן ההתאוששות יותר ממנוחה מוחלטת - כל עוד היא באמת קלה.',
    warmup: ['הליכה | 5 דקות', 'Cat-Cow | 10 חזרות'],
    structure: [
      {
        label: 'רצף עדין',
        detail: '90 שניות בכל תנוחה',
        items: [
          'Low Lunge | לאנג׳ נמוך, לכל צד', 'Half Split | חצי שפגט, לכל צד', 'Pigeon | יונה, לכל צד', 'Figure Four בשכיבה | לכל צד', 'Legs up the Wall | רגליים על הקיר, 3 דקות', 'Supine Twist | פיתול, לכל צד',
        ],
      },
    ],
    cooldown: ['Savasana | 4 דקות'],
    scaling: scale(
      'תמיכת כריות בכל תנוחה.', 'לפי הפרוטוקול.', 'אחזקות של 2 דקות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'recovery-breath-and-nervous-system',
    title: 'נשימה והרגעה',
    subtitle: 'עשרים דקות להוריד הילוך.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 20,
    equipment: ['mat'],
    description:
      'שיעור בלי כמעט תנועה. נשימה ארוכה ומווסתת מורידה דופק ולחץ - וזה משפיע גם על איכות האימון למחרת, לא רק על איך שמרגישים עכשיו.',
    warmup: ['ישיבה נוחה, עיניים עצומות | 2 דקות'],
    structure: [
      {
        label: 'תרגול נשימה',
        detail: 'כל תרגיל 3-4 דקות',
        items: [
          'נשימת סרעפת | יד על הבטן', 'נשימת קופסה | 4-4-4-4', 'נשימה 4-7-8 | נשיפה ארוכה', 'Nadi Shodhana | נשימה מתחלפת',
        ],
      },
      {
        label: 'תנוחות תמיכה',
        items: ['Supported Child’s Pose | 3 דקות', 'Legs up the Wall | 4 דקות'],
      },
    ],
    cooldown: ['Savasana | 5 דקות'],
    scaling: scale(
      'רק נשימת סרעפת ונשימת קופסה.', 'לפי הפרוטוקול.', 'תוספת של 5 דקות ישיבה שקטה.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yoga-balance-and-focus',
    title: 'שיווי משקל וריכוז',
    subtitle: 'עומדים על רגל אחת ונשארים שם.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['mat'],
    description:
      'שיווי משקל הוא מיומנות שנשחקת מהר כשלא מתרגלים אותה. השיעור בונה אותה בשלבים, מעמידה יציבה ועד תנוחות שדורשות ריכוז מלא.',
    warmup: [...JOINT_PREP, 'ברכת שמש א׳ | 3 סבבים'],
    structure: [
      {
        label: 'בסיס',
        detail: '5 נשימות בכל תנוחה, לכל צד',
        items: ['Vrksasana | עץ', 'Utkatasana | כיסא', 'Garudasana | נשר'],
      },
      {
        label: 'מתקדם',
        detail: '5 נשימות, לכל צד',
        items: [
          'Virabhadrasana III | לוחם ג׳', 'Ardha Chandrasana | חצי ירח', 'Natarajasana | רקדן', 'Utthita Hasta Padangusthasana | אחיזת בוהן בעמידה',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.hips, 'Savasana | 3 דקות'],
    scaling: scale(
      'יד על הקיר, כף רגל על השוק ולא על הירך.', 'לפי הפרוטוקול.', 'עיניים עצומות בתנוחות הבסיס.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yoga-backbends-gentle',
    title: 'פתיחת חזה',
    subtitle: 'כיפופים לאחור, בהדרגה.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'intermediate',
    durationMinutes: 35,
    equipment: ['mat'],
    description:
      'כיפוף לאחור מתחיל בגב העליון, לא בגב התחתון. אם מרגישים לחץ בגב התחתון - הגב העליון לא פתוח מספיק, וכדאי לחזור לתנוחה קודמת.',
    warmup: [...JOINT_PREP, 'Thoracic Extension על גליל | 90 שניות'],
    structure: [
      {
        label: 'הדרגה',
        detail: '5 נשימות בכל תנוחה, 2 סבבים',
        items: [
          'Sphinx | ספינקס', 'Bhujangasana | קוברה', 'Salabhasana | ארבה', 'Dhanurasana | קשת', 'Ustrasana | גמל', 'Setu Bandha | גשר',
        ],
      },
      {
        label: 'נטרול',
        items: ['Balasana | תנוחת ילד, 2 דקות', 'Apanasana | ברכיים לחזה, 60 שניות'],
      },
    ],
    cooldown: [...COOLDOWNS.shoulders, 'Savasana | 3 דקות'],
    scaling: scale(
      'ספינקס וקוברה בלבד.', 'עד גמל עם ידיים על האגן.', 'כולל Urdhva Dhanurasana לגלגל מלא.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yoga-twists-and-digestion',
    title: 'פיתולים',
    subtitle: 'סיבוב מבוקר לעמוד השדרה.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 30,
    equipment: ['mat'],
    description:
      'פיתול טוב מתחיל בהתארכות. שאפו והתארכו, ורק בנשיפה תסתובבו - אחרת הסיבוב יוצא מהגב התחתון במקום מהחלק האמצעי.',
    warmup: JOINT_PREP,
    structure: [
      {
        label: 'רצף פיתולים',
        detail: '60-90 שניות בכל תנוחה, לכל צד',
        items: [
          'Ardha Matsyendrasana | חצי מלך הדגים', 'Parivrtta Utkatasana | כיסא מסובב', 'Parivrtta Trikonasana | משולש מסובב', 'Thread the Needle | חוט המחט', 'Supta Matsyendrasana | פיתול בשכיבה',
        ],
      },
    ],
    cooldown: ['Balasana | 2 דקות', 'Savasana | 3 דקות'],
    scaling: scale(
      'טווח קטן, יד על הרצפה לתמיכה.', 'לפי הפרוטוקול.', 'טווח מלא, אחזקות של 2 דקות.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yoga-express-fifteen',
    title: 'יוגה אקספרס',
    subtitle: 'חמש עשרה דקות, בלי תירוצים.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 15,
    equipment: ['mat'],
    description:
      'הרצף הקצר ביותר בלוח. מספיק כדי לפתוח את הגוף בבוקר או להוריד מתח בערב, וקצר מספיק כדי שלא תדלגו עליו.',
    warmup: ['Cat-Cow | 8 חזרות'],
    structure: [
      { label: 'ברכת שמש', detail: '3 סבבים', items: SUN_A },
      {
        label: 'סיום',
        detail: '60 שניות בכל תנוחה',
        items: [
          'Low Lunge | לכל צד', 'Uttanasana | כיפוף קדימה', 'Supine Twist | לכל צד',
        ],
      },
    ],
    cooldown: ['Savasana | 2 דקות'],
    scaling: scale(
      '2 ברכות שמש, ברכיים על המזרן במעבר.', '3 ברכות שמש בקצב הנשימה.', '5 ברכות שמש ברצף רציף.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yoga-for-runners',
    title: 'יוגה לרצים',
    subtitle: 'כל מה שהריצה מקצרת.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 35,
    equipment: ['mat'],
    description:
      'ריצה מקצרת כופפי ירך, מיתרי ברך ושוקיים ומחלישה את הישבן. השיעור נוגע בדיוק בארבעה האלה, בסדר הזה.',
    warmup: ['הליכה | 3 דקות', 'סיבובי ירך וקרסול | 2 דקות'],
    structure: [
      {
        label: 'פתיחה',
        detail: '90 שניות בכל תנוחה, לכל צד',
        items: [
          'Low Lunge | כופפי ירך', 'Half Split | מיתרי ברך', 'Downward Dog עם כיפוף ברכיים לסירוגין | שוקיים', 'Figure Four | ישבן',
        ],
      },
      {
        label: 'חיזוק',
        detail: '2 סבבים',
        items: [
          'Glute Bridge | 15 חזרות', 'Single Leg Balance | 45 שניות לכל צד', 'Calf Raise | 20 חזרות',
        ],
      },
    ],
    cooldown: [...COOLDOWNS.posterior, 'Savasana | 3 דקות'],
    scaling: scale(
      'תמיכת כריות, 60 שניות בכל תנוחה.', 'לפי הפרוטוקול.', '2 דקות בכל תנוחה, 3 סבבי חיזוק.',
    ),
    scoreType: 'completion',
  },
  {
    slug: 'yoga-restorative-long',
    title: 'יוגה משקמת',
    subtitle: 'התנוחות עושות את העבודה, לא אתם.',
    category: 'yoga',
    format: 'flow',
    difficulty: 'beginner',
    durationMinutes: 55,
    equipment: ['mat'],
    description:
      'השיעור הכי קל בלוח, ולפעמים הכי חשוב. כל תנוחה נתמכת בכריות או בשמיכות כך שאפשר להישאר בה חמש דקות בלי שום מאמץ שרירי. מתאים לשבוע עמוס או לימי מחלה קלים.',
    warmup: ['שכיבה ונשימה שקטה | 3 דקות'],
    structure: [
      {
        label: 'רצף נתמך',
        detail: '5 דקות בכל תנוחה, עם כרית או שמיכה מקופלת',
        items: [
          'Supported Child’s Pose | תנוחת ילד נתמכת', 'Supported Bridge | גשר נתמך', 'Reclined Butterfly | פרפר בשכיבה', 'Supported Twist | פיתול נתמך, לכל צד', 'Legs up the Wall | רגליים על הקיר',
        ],
      },
    ],
    cooldown: ['Savasana עם שמיכה | 8 דקות'],
    scaling: scale(
      '3 דקות בכל תנוחה.', '5 דקות בכל תנוחה.', '7 דקות בכל תנוחה.',
    ),
    scoreType: 'completion',
  },
];
