/**
 * Weak points, and what is actually behind them.
 *
 * Two kinds. A lift that fails in the same place every time is a performance
 * weak point; a muscle that lags behind the rest is an aesthetic one. They are
 * kept apart because they are diagnosed differently - a squat that collapses
 * out of the hole is usually a position problem, while a flat upper chest is
 * almost always just a volume problem wearing a costume.
 *
 * Nothing here rates a body. "Underdeveloped compared to the rest of your own
 * physique" is a training observation and stays one; there is no ideal shape
 * in this file, no comparison with anybody else, and no before and after.
 */

export type WeakPointKind = 'performance' | 'aesthetic';
export type RootCause = 'imbalance' | 'technique' | 'programming' | 'structure';

export interface Corrective {
  name: string;
  sets: number;
  reps: string;
  tempo: string;
  /** What to feel or watch while doing it. */
  cue: string;
}

export interface WeakPoint {
  id: string;
  kind: WeakPointKind;
  label: string;
  /** The likeliest root cause, and why. */
  rootCause: RootCause;
  rootCauseWhy: string;
  correctives: Corrective[];
  /** Where it goes in the week without wrecking recovery. */
  integration: string;
  /** An honest timeline. */
  timeline: string;
  /** How you know it is genuinely improving - numbers, not feelings. */
  markers: string[];
}

const ROOT_LABEL: Record<RootCause, string> = {
  imbalance: 'חוסר איזון שרירי',
  technique: 'טכניקה',
  programming: 'תכנות',
  structure: 'מבנה ומנופים',
};

export { ROOT_LABEL };

export const WEAK_POINTS: WeakPoint[] = [
  // --- performance ----------------------------------------------------------
  {
    id: 'squat-hole',
    kind: 'performance',
    label: 'הסקוואט קורס בתחתית',
    rootCause: 'technique',
    rootCauseWhy:
      'כמעט תמיד אובדן מתח בירידה ולא חולשה בישבן. כשהירידה חופשית, מגיעים לתחתית בלי מתח ואין ממה לדחוף.',
    correctives: [
      {
        name: 'סקוואט עם עצירה בתחתית',
        sets: 4,
        reps: '3',
        tempo: '3-3-1-0',
        cue: 'שלוש שניות בתחתית בלי לאבד את החזה. אם הוא נופל - המשקל גדול מדי.',
      },
      {
        name: 'סקוואט קדמי',
        sets: 4,
        reps: '5',
        tempo: '3-0-1-0',
        cue: 'מכריח גב זקוף. אם הוא קורס, זאת התשובה מה נופל בסקוואט הגבי.',
      },
      {
        name: 'סקוואט גובלט עם החזקה',
        sets: 3,
        reps: '20 שניות החזקה',
        tempo: '-',
        cue: 'מרפקים דוחפים את הברכיים החוצה, עקבים דבוקים לרצפה.',
      },
    ],
    integration: 'להחליף את הסקוואט המרכזי בגרסת העצירה ליום אחד בשבוע, שמונה שבועות. לא להוסיף - להחליף.',
    timeline: 'הרגשה של שליטה בתחתית תוך 3-4 שבועות. מספרים שזזים תוך 8.',
    markers: [
      'סקוואט עם עצירה של 3 שניות ב-85% מהמשקל הרגיל.',
      'הווידאו מהצד מראה את אותה זווית גו בעלייה ובירידה.',
      'החזרה החמישית נראית כמו הראשונה.',
    ],
  },
  {
    id: 'bench-chest',
    kind: 'performance',
    label: 'הלחיצה נתקעת מהחזה',
    rootCause: 'imbalance',
    rootCauseWhy:
      'החלק התחתון של הלחיצה הוא חזה וכתף קדמית. תקיעה שם היא כמעט תמיד חולשה בטווח המתוח, שהלחיצה הרגילה כמעט לא מאמנת.',
    correctives: [
      {
        name: 'לחיצה עם עצירה על החזה',
        sets: 5,
        reps: '3',
        tempo: '3-2-1-0',
        cue: 'שתי שניות מלאות על החזה בלי לאבד מתח בגב.',
      },
      {
        name: 'לחיצת חזה במשקולות',
        sets: 3,
        reps: '8-10',
        tempo: '3-1-1-0',
        cue: 'לרדת עמוק יותר ממה שהמוט מאפשר. שם נמצא הטווח שחסר.',
      },
      {
        name: 'שכיבות סמיכה בהטיה',
        sets: 3,
        reps: 'עד 2 חזרות ביד',
        tempo: '3-0-1-0',
        cue: 'נפח נוסף בלי עומס נוסף על הכתף.',
      },
    ],
    integration: 'גרסת העצירה מחליפה את הלחיצה המרכזית ביום אחד; המשקולות נכנסות כתרגיל עזר ביום השני.',
    timeline: '6-8 שבועות לשינוי מדיד.',
    markers: [
      'לחיצה עם עצירה של שתי שניות ב-85% מהמשקל הרגיל.',
      'המוט עולה מהחזה בלי להיתקע לרגע.',
    ],
  },
  {
    id: 'deadlift-knee',
    kind: 'performance',
    label: 'הדדליפט נתקע בברך',
    rootCause: 'imbalance',
    rootCauseWhy:
      'תקיעה מעל הברך היא גב עליון וישבן, לא רגליים. המוט מתרחק מהגוף ומנוף הגב מתארך.',
    correctives: [
      {
        name: 'דדליפט רומני',
        sets: 4,
        reps: '6-8',
        tempo: '4-0-1-0',
        cue: 'לגלול את המוט על הירך. אם הוא מתרחק, ההתרחקות היא בדיוק הבעיה.',
      },
      {
        name: 'חתירה בהרכנה',
        sets: 4,
        reps: '8',
        tempo: '2-1-1-0',
        cue: 'גב עליון שמחזיק את המוט קרוב.',
      },
      {
        name: 'היפ תראסט',
        sets: 3,
        reps: '10',
        tempo: '2-1-1-1',
        cue: 'נעילה מלאה של הישבן בסוף הטווח.',
      },
    ],
    integration: 'רומני מחליף את הדדליפט הכבד ליום אחד בשבוע; חתירה והיפ תראסט כתרגילי עזר.',
    timeline: '8 שבועות.',
    markers: ['המוט נשאר במגע עם הירך לכל אורך העלייה בווידאו.', 'דדליפט רומני ב-70% מהדדליפט הרגיל ל-8 חזרות.'],
  },
  {
    id: 'overhead',
    kind: 'performance',
    label: 'קשה לנעול מעל הראש',
    rootCause: 'structure',
    rootCauseWhy:
      'לרוב ניידות ולא כוח: גב עליון נוקשה מכריח את הצלעות להיפתח, והמוט נשאר מול הגוף במקום מעליו.',
    correctives: [
      {
        name: 'פתיחת גב עליון על הספסל',
        sets: 3,
        reps: '60 שניות',
        tempo: '-',
        cue: 'הצלעות התחתונות סגורות. אם הן נפתחות, הטווח מגיע מהגב התחתון.',
      },
      {
        name: 'החלקות בקיר',
        sets: 3,
        reps: '10',
        tempo: '3-0-3-0',
        cue: 'לא לאבד מגע עם הקיר באף נקודה.',
      },
      {
        name: 'אוברהד סקוואט עם מקל',
        sets: 3,
        reps: '8',
        tempo: '3-1-1-0',
        cue: 'מקל, לא מוט. זו בדיקת ניידות ולא תרגיל כוח.',
      },
    ],
    integration: 'בחימום של כל אימון עליון, כל יום אם אפשר. ניידות מגיבה לתדירות ולא לעצימות.',
    timeline: '4-6 שבועות לשינוי מורגש בטווח.',
    markers: ['אוברהד סקוואט מלא עם מקל, עקבים על הרצפה.', 'שכיבה על הרצפה עם ידיים מעל הראש והגב התחתון צמוד.'],
  },

  // --- aesthetic ------------------------------------------------------------
  {
    id: 'upper-chest',
    kind: 'aesthetic',
    label: 'חזה עליון',
    rootCause: 'programming',
    rootCauseWhy:
      'כמעט תמיד פשוט חוסר נפח בזווית הנכונה. לחיצה שטוחה עובדת בעיקר על החלק האמצעי והתחתון.',
    correctives: [
      { name: 'לחיצת חזה במשקולות בהטיה', sets: 4, reps: '8-12', tempo: '3-1-1-0', cue: 'הטיה קטנה, 15-30 מעלות. גבוה יותר הופך את זה ללחיצת כתפיים.' },
      { name: 'שכיבות סמיכה עם רגליים מוגבהות', sets: 3, reps: 'עד 2 ביד', tempo: '3-0-1-0', cue: 'אותה זווית, בלי עומס על הכתף.' },
    ],
    integration: 'להעביר את הלחיצה בהטיה לתחילת יום עליון אחד, לפני הלחיצה השטוחה.',
    timeline: '12-16 שבועות. שריר לא ממהר.',
    markers: ['הלחיצה בהטיה עולה ב-10% ב-12 שבועות.', 'סטים שבועיים בזווית הזאת: מ-0 ל-8-10.'],
  },
  {
    id: 'rear-delts',
    kind: 'aesthetic',
    label: 'כתף אחורית',
    rootCause: 'programming',
    rootCauseWhy:
      'התרגיל היחיד שמאמן אותה ישירות הוא הרחקה אופקית, וכמעט אף תוכנית לא כוללת אותו. חתירה כבדה נותנת לה מעט מאוד.',
    correctives: [
      { name: 'משיכת גומייה', sets: 4, reps: '15-20', tempo: '2-1-2-0', cue: 'מעט מאוד משקל, הרבה מאוד חזרות. הכתף האחורית מגיבה לנפח.' },
      { name: 'Y-T-W בשכיבה', sets: 3, reps: '10 מכל אות', tempo: '2-1-2-0', cue: 'התנועה מהשכמה, לא מהיד.' },
    ],
    integration: 'בסוף כל אימון עליון, ובחימום של כל אימון לחיצה. אפשר כל יום - העומס זניח.',
    timeline: '8-12 שבועות.',
    markers: ['משיכת גומייה חזקה יותר ל-20 חזרות נקיות.', 'הכתפיים יושבות אחורה יותר בעמידה רגילה.'],
  },
  {
    id: 'hamstrings',
    kind: 'aesthetic',
    label: 'מיתרי ברך',
    rootCause: 'programming',
    rootCauseWhy:
      'סקוואט הוא בעיקר ארבע ראשי. בלי תרגיל ציר ייעודי מיתרי הברך מקבלים כמעט כלום, וזה הפער הנפוץ ביותר ברגליים.',
    correctives: [
      { name: 'דדליפט רומני', sets: 4, reps: '8-10', tempo: '4-1-1-0', cue: 'ארבע שניות בירידה. המתיחה היא העבודה.' },
      { name: 'גשר ירך על רגל אחת', sets: 3, reps: '12 לכל רגל', tempo: '2-1-1-1', cue: 'האגן נשאר מקביל לרצפה.' },
    ],
    integration: 'רומני כתרגיל מרכזי ביום תחתון אחד מתוך שניים.',
    timeline: '12 שבועות.',
    markers: ['רומני ב-70% מהדדליפט ל-10 חזרות.', 'אין יותר תפיסות במיתר בסוף אימון רגליים.'],
  },
  {
    id: 'arms',
    kind: 'aesthetic',
    label: 'זרועות',
    rootCause: 'programming',
    rootCauseWhy:
      'לחיצות ומשיכות כבדות מאמנות זרועות רק בעקיפין. זרוע גדלה מנפח ישיר בטווח הארוך, וזה בדיוק מה שתוכניות כוח מדלגות עליו.',
    correctives: [
      { name: 'פשיטת מרפק מעל הראש', sets: 4, reps: '10-12', tempo: '3-1-1-0', cue: 'מרפקים צמודים לראש. הטווח הארוך הוא זה שמגדיל.' },
      { name: 'מתח באחיזה תחתית', sets: 3, reps: 'עד 2 ביד', tempo: '2-1-2-0', cue: 'ירידה איטית. שם נמצאת רוב העבודה.' },
    ],
    integration: 'בסוף אימון עליון, פעמיים בשבוע. אחרי הלחיצה והמשיכה, אף פעם לפניהן.',
    timeline: '12-16 שבועות.',
    markers: ['פשיטת מרפק עולה ב-2.5 ק"ג ב-8 שבועות.', 'שתי חזרות מתח נוספות באחיזה תחתית.'],
  },
  {
    id: 'glutes',
    kind: 'aesthetic',
    label: 'ישבן',
    rootCause: 'programming',
    rootCauseWhy:
      'הישבן חזק ביותר בטווח המקוצר - בדיוק הטווח שהסקוואט והדדליפט כמעט לא נכנסים אליו.',
    correctives: [
      { name: 'היפ תראסט', sets: 4, reps: '8-12', tempo: '2-1-1-2', cue: 'שתי שניות נעילה למעלה. הנעילה היא התרגיל.' },
      { name: 'מכרעים בהליכה', sets: 3, reps: '10 לכל רגל', tempo: '2-0-1-0', cue: 'צעד ארוך. צעד קצר הופך את זה לארבע ראשי.' },
    ],
    integration: 'היפ תראסט כתרגיל שני ביום תחתון, אחרי הסקוואט או הדדליפט.',
    timeline: '10-12 שבועות.',
    markers: ['היפ תראסט עולה ב-20% ב-10 שבועות.', 'הנעילה מורגשת בישבן ולא בגב התחתון.'],
  },
];

/**
 * A week's worth of work, ordered.
 *
 * Two at a time, and that is the whole rule. Everybody wants to fix five weak
 * points at once and nobody recovers from five extra pieces of work a week -
 * so the rest are named and parked rather than quietly dropped.
 */
export function prioritise(selected: string[]): {
  now: WeakPoint[];
  later: WeakPoint[];
} {
  const chosen = selected
    .map((id) => WEAK_POINTS.find((point) => point.id === id))
    .filter((point): point is WeakPoint => Boolean(point));

  // Performance first: a lift that fails in the same place is also the thing
  // holding back the volume every aesthetic weak point needs.
  const ordered = [...chosen].sort((a, b) =>
    a.kind === b.kind ? 0 : a.kind === 'performance' ? -1 : 1,
  );
  return { now: ordered.slice(0, 2), later: ordered.slice(2) };
}
