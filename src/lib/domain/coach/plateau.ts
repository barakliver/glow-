/**
 * Why a lift stopped moving, in order of how likely it is here.
 *
 * The honest thing about plateaus is that the cause is usually boring and
 * usually not the programme: an intermediate who sleeps six hours, has not
 * deloaded in three months and has been running the same five sets of five
 * since March does not have a programming problem to solve, they have three
 * ordinary problems stacked on top of each other.
 *
 * So this ranks rather than lists. Everything scores against what the member
 * actually reported, the ones that do not apply are not shown at all, and the
 * plan that comes out addresses the top of the list first.
 */

export type StressLevel = 'low' | 'moderate' | 'high';
export type CalorieState = 'deficit' | 'maintenance' | 'surplus' | 'unknown';

export interface PlateauInput {
  /** How long the lifts have not moved. */
  weeksStuck: number;
  sleepHours: number;
  stress: StressLevel;
  /** Grams of protein per kg of bodyweight. Null when they do not track it. */
  proteinPerKg: number | null;
  calories: CalorieState;
  /** Weeks since the last real deload. */
  weeksSinceDeload: number;
  /** Weeks on the same programme, unchanged. */
  weeksOnProgramme: number;
  sessionsPerWeek: number;
  yearsTraining: number;
}

export type CauseArea = 'programming' | 'recovery' | 'nutrition' | 'psychology';

export interface Cause {
  id: string;
  area: CauseArea;
  title: string;
  /** What in their answers points at this. */
  evidence: string;
  /** What to do about it, concretely. */
  fix: string;
  /** 0-100. Only used to order the list. */
  score: number;
}

const AREA_LABEL: Record<CauseArea, string> = {
  programming: 'תכנות',
  recovery: 'התאוששות',
  nutrition: 'תזונה',
  psychology: 'ראש',
};

export { AREA_LABEL };

export function diagnose(input: PlateauInput): Cause[] {
  const causes: Cause[] = [];
  const add = (cause: Cause) => {
    if (cause.score > 0) causes.push(cause);
  };

  // --- recovery -------------------------------------------------------------
  add({
    id: 'sleep',
    area: 'recovery',
    title: 'שינה',
    evidence: `${input.sleepHours} שעות בלילה.`,
    fix: 'לכוון ל-7.5 שעות לפחות, שבועיים ברצף, לפני ששוקלים לשנות משהו בתוכנית. שינה היא המשתנה היחיד ברשימה הזאת שמשפר גם כוח וגם התאוששות וגם מוטיבציה בבת אחת.',
    /*
     * Weighted hardest of anything here, on purpose. Sleep is the only
     * variable on this list that improves strength, recovery and willingness
     * to train at once, so at five hours it outranks even a deload that is
     * three months overdue - fixing the programme first would just change
     * which programme is not working.
     */
    score: input.sleepHours >= 7.5 ? 0 : Math.min(100, Math.round((7.5 - input.sleepHours) * 40)),
  });

  add({
    id: 'deload',
    area: 'recovery',
    title: 'לא היה שבוע ריקון',
    evidence: `${input.weeksSinceDeload} שבועות מאז הריקון האחרון.`,
    fix: 'שבוע ריקון עכשיו: חצי מהסטים, בערך 60% מהמשקל, אותה תדירות. לא יום חופש - שבוע קל. ברוב המקרים השיא חוזר בשבוע שאחריו בלי לשנות שום דבר אחר.',
    score: input.weeksSinceDeload <= 6 ? 0 : Math.min(96, (input.weeksSinceDeload - 6) * 6),
  });

  add({
    id: 'stress',
    area: 'recovery',
    title: 'עומס נפשי',
    evidence:
      input.stress === 'high' ? 'דיווחת על עומס גבוה.' : 'דיווחת על עומס בינוני.',
    fix: 'תקופה עמוסה היא לא הזמן לשבור שיאים - זה הזמן לשמור על מה שיש. הורידו נפח בכ-20% ותשאירו את התדירות. עדיף להגיע לצד השני עם אותם מספרים מאשר לרדת מהם.',
    score: input.stress === 'high' ? 70 : input.stress === 'moderate' ? 30 : 0,
  });

  // --- programming ----------------------------------------------------------
  add({
    id: 'staleness',
    area: 'programming',
    title: 'אותה תוכנית יותר מדי זמן',
    evidence: `${input.weeksOnProgramme} שבועות על אותה תוכנית.`,
    fix: 'להחליף את התרגיל המרכזי לווריאציה קרובה לשמונה שבועות - סקוואט קדמי במקום גבי, דדליפט רומני במקום רגיל. אותה תבנית תנועה, גירוי חדש, ובחזרה לתרגיל המקורי עם קפיצה.',
    score: input.weeksOnProgramme <= 8 ? 0 : Math.min(100, (input.weeksOnProgramme - 8) * 8),
  });

  add({
    id: 'frequency',
    area: 'programming',
    title: 'תדירות נמוכה מדי לתרגיל',
    evidence: `${input.sessionsPerWeek} אימונים בשבוע.`,
    fix: 'לפצל את אותו נפח על יותר ימים. תרגיל שנעשה פעמיים בשבוע במחצית הנפח כל פעם מתקדם מהר יותר מאותו נפח ביום אחד, כי אף סט לא נעשה במצב עייפות מלאה.',
    score: input.sessionsPerWeek <= 2 ? 55 : input.sessionsPerWeek === 3 ? 20 : 0,
  });

  add({
    id: 'progression',
    area: 'programming',
    title: 'מודל התקדמות שנגמר',
    evidence: `${input.yearsTraining} שנות אימון - התקדמות שבועית כבר לא ריאלית.`,
    fix: 'לעבור מהוספת משקל כל אימון להוספה על פני בלוק: לצבור נפח שלושה שבועות, לרוקן שבוע, ולפתוח את הבלוק הבא גבוה יותר. מתקדמים לא עולים כל שבוע, הם עולים כל חודש.',
    score: input.yearsTraining >= 2 ? 60 : 15,
  });

  // --- nutrition ------------------------------------------------------------
  add({
    id: 'protein',
    area: 'nutrition',
    title: 'חלבון',
    evidence:
      input.proteinPerKg === null
        ? 'לא עוקב אחרי חלבון.'
        : `${input.proteinPerKg} גרם לקילו משקל גוף.`,
    fix: 'לכוון ל-1.6 עד 2.2 גרם לקילו, מחולק על פני היום. מתחת לזה הגוף לא מרכיב את מה שהאימון ביקש ממנו, וכל שאר הרשימה הזאת לא תעזור.',
    score:
      input.proteinPerKg === null ? 45 : input.proteinPerKg >= 1.6 ? 0 : Math.round((1.6 - input.proteinPerKg) * 60),
  });

  add({
    id: 'calories',
    area: 'nutrition',
    title: 'גירעון קלורי',
    evidence: 'דיווחת שאתה בגירעון.',
    fix: 'בגירעון שיאים לא נשברים, והם גם לא אמורים. המטרה בתקופה כזאת היא לשמור על המספרים, לא להעלות אותם. אם הכוח הוא העדיפות - לעלות לתחזוקה לשמונה שבועות.',
    score: input.calories === 'deficit' ? 65 : 0,
  });

  // --- psychology -----------------------------------------------------------
  add({
    id: 'effort',
    area: 'psychology',
    title: 'הסט האחרון לא באמת קרוב לכישלון',
    evidence: `${input.weeksStuck} שבועות באותם מספרים בדיוק.`,
    fix: 'לצלם סט אחד בשבוע. תקיעה ארוכה באותו משקל בדיוק היא לרוב סטים שמסתיימים עם שתיים-שלוש חזרות ביד בלי ששמים לב - הווידאו פותר את זה מיד, ובלי ויכוח.',
    score: input.weeksStuck >= 6 ? 50 : input.weeksStuck >= 3 ? 25 : 0,
  });

  return causes.sort((a, b) => b.score - a.score);
}

export interface PlateauWeek {
  index: number;
  headline: string;
  actions: string[];
}

/**
 * Eight weeks built around whatever came out on top.
 *
 * Deliberately front-loaded: the first fortnight fixes recovery and nutrition,
 * because changing a programme while sleeping six hours only changes which
 * programme is not working.
 */
export function breakthroughPlan(causes: Cause[]): PlateauWeek[] {
  const top = causes.slice(0, 3);
  const has = (id: string) => top.some((cause) => cause.id === id);

  const settle: string[] = [];
  if (has('sleep')) settle.push('שינה: 7.5 שעות, אותה שעת כיבוי אור כל ערב.');
  if (has('protein')) settle.push('חלבון: לשקול ולרשום שלושה ימים, ואז לכוון ל-1.6-2.2 גרם לקילו.');
  if (has('calories')) settle.push('לעלות לתחזוקה. שוקלים פעם בשבוע, אותו בוקר.');
  if (has('stress')) settle.push('להוריד 20% מהנפח ולשמור על התדירות.');
  if (settle.length === 0) settle.push('לשמור על מה שכבר עובד - שינה, אוכל וקצב אימונים.');

  return [
    {
      index: 1,
      headline: 'שבוע ריקון',
      actions: ['חצי מהסטים, בערך 60% מהמשקל, אותה תדירות.', ...settle],
    },
    { index: 2, headline: 'בסיס', actions: ['לחזור ל-85% מהמשקלים שעבדת בהם.', 'לצלם סט מפתח אחד.', ...settle] },
    {
      index: 3,
      headline: 'החלפת וריאציה',
      actions: [
        'להחליף את התרגיל המרכזי לווריאציה קרובה: סקוואט קדמי, דדליפט רומני, לחיצה בהפסקה.',
        '4 סטים של 6, שתי חזרות ביד.',
      ],
    },
    { index: 4, headline: 'עלייה', actions: ['להוסיף 2.5 ק"ג לווריאציה.', 'אותו נפח, חזרה אחת ביד בסט האחרון.'] },
    { index: 5, headline: 'עלייה', actions: ['להוסיף 2.5 ק"ג נוספים.', 'לוודא שהטכניקה בסט האחרון זהה לראשון.'] },
    { index: 6, headline: 'ריקון קצר', actions: ['שני סטים במקום ארבעה, אותו משקל.'] },
    {
      index: 7,
      headline: 'חזרה לתרגיל המקורי',
      actions: ['בחזרה לתרגיל שנתקע, מתחילים ב-90% מהמשקל שנתקעת בו.', '5 סטים של 3.'],
    },
    { index: 8, headline: 'ניסיון שיא', actions: ['לעלות לסינגל כבד, בלי לכשול.', 'זה המספר החדש שממנו ממשיכים.'] },
  ];
}
