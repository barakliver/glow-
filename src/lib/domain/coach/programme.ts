import type {
  LiftKey,
  OneRepMaxes,
  PlannedMovement,
  PlannedSession,
  PlannedWeek,
  Prescription,
  Programme,
  ProgrammeInput,
} from './types';

/**
 * Twelve weeks, block periodised.
 *
 * Three four-week blocks, each ending in a deload. Volume is highest in the
 * first block and intensity in the last, which is the ordinary answer for an
 * intermediate chasing size with strength behind it: you cannot accumulate and
 * peak at the same time, and trying to is most of why intermediates stall.
 *
 * Everything here is arithmetic on what the member typed. Nothing is sampled,
 * nothing is random, and running it twice with the same answers gives the same
 * plan - which is the point, because a plan you cannot reproduce is one you
 * cannot review in six weeks.
 */

interface Block {
  name: string;
  intent: string;
  /** Percent of 1RM for the main lift, by week within the block. */
  mainPercent: [number, number, number];
  mainSets: number;
  mainReps: string;
  accessoryReps: string;
  accessorySets: number;
  rir: number;
  restMain: number;
  restAccessory: number;
  tempo: string;
}

const BLOCKS: Block[] = [
  {
    name: 'צבירה',
    intent: 'נפח גבוה במשקלים בינוניים. כאן נבנית רוב מסת השריר.',
    mainPercent: [67, 70, 73],
    mainSets: 4,
    mainReps: '8-10',
    accessoryReps: '10-12',
    accessorySets: 3,
    rir: 2,
    restMain: 150,
    restAccessory: 75,
    tempo: '3-0-1-0',
  },
  {
    name: 'העצמה',
    intent: 'הנפח יורד, המשקל עולה. השריר שנבנה לומד להפיק כוח.',
    mainPercent: [77, 80, 83],
    mainSets: 5,
    mainReps: '5-6',
    accessoryReps: '8-10',
    accessorySets: 3,
    rir: 2,
    restMain: 180,
    restAccessory: 90,
    tempo: '2-1-1-0',
  },
  {
    name: 'מימוש',
    intent: 'מעט חזרות, משקל גבוה. הבלוק שבו השיאים נופלים.',
    mainPercent: [86, 89, 92],
    mainSets: 5,
    mainReps: '3',
    accessoryReps: '6-8',
    accessorySets: 3,
    rir: 1,
    restMain: 210,
    restAccessory: 90,
    tempo: '2-0-X-0',
  },
];

/** The deload that closes every block. Same shape in all three. */
const DELOAD = {
  intent: 'שבוע ריקון. חצי מהנפח, משקל נוח. זה החלק שבו הגוף מדביק את מה שעשית.',
  percent: 60,
  sets: 2,
  reps: '5',
  rir: 4,
  tempo: '2-0-1-0',
  rest: 120,
};

const LIFT_LABEL: Record<LiftKey, string> = {
  squat: 'סקוואט גבי',
  bench: 'לחיצת חזה',
  deadlift: 'דדליפט',
  press: 'לחיצת כתפיים',
};

/** Rounds to the smallest jump the room can actually make. */
export function toPlate(kg: number): number {
  return Math.round(kg / 2.5) * 2.5;
}

function prescribe(
  oneRm: number | null,
  percent: number,
  sets: number,
  reps: string,
  rir: number,
  tempo: string,
  restSeconds: number,
): Prescription {
  return {
    sets,
    reps,
    percent: oneRm ? percent : null,
    kg: oneRm ? toPlate((oneRm * percent) / 100) : null,
    rir,
    tempo,
    restSeconds,
  };
}

/**
 * The split.
 *
 * Chosen by how many days the member actually has, not by what is fashionable.
 * Below four days a split wastes frequency on an intermediate; at five and six
 * it stops being useful to hit everything every session.
 */
interface Split {
  name: string;
  why: string;
  /** Each day: a title, its focus, and the main lift it is built on. */
  days: { title: string; focus: string; main: LiftKey; second: LiftKey | null }[];
}

const SPLITS: Record<number, Split> = {
  2: {
    name: 'גוף מלא, שני מפגשים',
    why: 'בשני אימונים בשבוע כל פיצול מבזבז תדירות. גוף מלא פעמיים נותן לכל דפוס תנועה שתי הזדמנויות בשבוע.',
    days: [
      { title: 'גוף מלא א׳', focus: 'סקוואט ודחיפה', main: 'squat', second: 'bench' },
      { title: 'גוף מלא ב׳', focus: 'ציר ומשיכה', main: 'deadlift', second: 'press' },
    ],
  },
  3: {
    name: 'גוף מלא, שלושה מפגשים',
    why: 'שלוש פעמים בשבוע על כל דפוס תנועה זו התדירות הגבוהה ביותר שמתאוששים ממנה, ולכן גם המהירה ביותר למתאמן בינוני.',
    days: [
      { title: 'גוף מלא א׳', focus: 'סקוואט כבד', main: 'squat', second: 'bench' },
      { title: 'גוף מלא ב׳', focus: 'דחיפה מעל הראש', main: 'press', second: 'squat' },
      { title: 'גוף מלא ג׳', focus: 'ציר ומשיכה', main: 'deadlift', second: 'bench' },
    ],
  },
  4: {
    name: 'עליון ותחתון, פעמיים כל אחד',
    why: 'ארבעה ימים מאפשרים להפריד עליון מתחתון בלי לרדת מתדירות של פעמיים לכל קבוצה - החלוקה הנפוצה ביותר לבינוניים, ובצדק.',
    days: [
      { title: 'תחתון א׳', focus: 'סקוואט', main: 'squat', second: null },
      { title: 'עליון א׳', focus: 'דחיפה אופקית', main: 'bench', second: null },
      { title: 'תחתון ב׳', focus: 'ציר', main: 'deadlift', second: null },
      { title: 'עליון ב׳', focus: 'דחיפה אנכית', main: 'press', second: null },
    ],
  },
  5: {
    name: 'עליון, תחתון, דחיפה, משיכה, רגליים',
    why: 'ביום החמישי כדאי להפריד דחיפה ממשיכה: זה מאפשר יותר נפח לכל תבנית בלי להאריך אף אימון.',
    days: [
      { title: 'תחתון', focus: 'סקוואט', main: 'squat', second: null },
      { title: 'עליון', focus: 'דחיפה אופקית', main: 'bench', second: null },
      { title: 'דחיפה', focus: 'כתפיים וחזה', main: 'press', second: null },
      { title: 'משיכה', focus: 'גב וזרועות', main: 'deadlift', second: null },
      { title: 'רגליים', focus: 'ציר וחד-צדדי', main: 'deadlift', second: 'squat' },
    ],
  },
  6: {
    name: 'דחיפה, משיכה, רגליים, פעמיים',
    why: 'בשישה ימים כל אימון קצר יותר, וכל דפוס תנועה חוזר פעמיים בשבוע. זה עובד רק אם השינה והתזונה עומדות בזה.',
    days: [
      { title: 'דחיפה א׳', focus: 'חזה וכתפיים', main: 'bench', second: null },
      { title: 'משיכה א׳', focus: 'גב', main: 'deadlift', second: null },
      { title: 'רגליים א׳', focus: 'סקוואט', main: 'squat', second: null },
      { title: 'דחיפה ב׳', focus: 'דחיפה מעל הראש', main: 'press', second: null },
      { title: 'משיכה ב׳', focus: 'משיכה אנכית', main: 'deadlift', second: null },
      { title: 'רגליים ב׳', focus: 'ציר וחד-צדדי', main: 'squat', second: 'deadlift' },
    ],
  },
};

/**
 * Accessories per main lift, in this room and no other.
 *
 * Pull-up bar, bench with dumbbells, treadmill, kettlebells, hip thrust pad,
 * barbell with plates. Nothing here asks for a machine that is not on the
 * floor, which is the same rule the workout library is written under.
 */
const ACCESSORIES: Record<LiftKey, { name: string; why: string }[]> = {
  squat: [
    { name: 'מכרעים בהליכה', why: 'עבודה חד-צדדית שמאזנת את מה שהסקוואט מסתיר - רגל חזקה שמכסה על חלשה.' },
    { name: 'היפ תראסט', why: 'הישבן בטווח המקוצר, בדיוק במקום שבו הסקוואט חלש בו.' },
    { name: 'הרמת עקבים', why: 'שוק חזק היא מה שמחזיק את העקב על הרצפה בתחתית הסקוואט.' },
    { name: 'סקוואט גובלט', why: 'טווח עמוק יותר עם משקל קל, אחרי שהסקוואט הכבד כבר נגמר.' },
    { name: 'עליות על הספסל', why: 'עוד עבודה חד-צדדית, הפעם בטווח שהמכרע לא מגיע אליו.' },
  ],
  bench: [
    { name: 'לחיצת חזה במשקולות', why: 'טווח גדול יותר מהמוט, ומכריח כל צד לעבוד לבד.' },
    { name: 'חתירה במשקולת', why: 'משיכה אחת על כל דחיפה. בלי זה הכתף מסתובבת קדימה תוך חודשיים.' },
    { name: 'טבילות על הספסל', why: 'תלת ראשי בטווח המלא - החוליה שנעילת הלחיצה נשענת עליה.' },
    { name: 'שכיבות סמיכה', why: 'נפח נוסף לחזה בלי עוד עומס על הכתף מתחת למוט.' },
    { name: 'הרחקת כתף', why: 'ראש הכתף האמצעי, שאף לחיצה לא נוגעת בו באמת.' },
  ],
  deadlift: [
    { name: 'דדליפט רומני', why: 'מיתרי הברך תחת מתח ארוך. זה מה שמייצר את החלק העליון של הדדליפט.' },
    { name: 'מתח', why: 'משיכה אנכית שהדדליפט לא נותן, ואחיזה שהוא כן דורש.' },
    { name: 'חתירה בהרכנה', why: 'גב עליון שמחזיק את המוט קרוב - הסיבה הנפוצה ביותר לדדליפט שנתקע.' },
    { name: 'היפ תראסט', why: 'הישבן בטווח המקוצר, שם הדדליפט מסיים ולא מתחיל.' },
    { name: 'הליכת חקלאי', why: 'אחיזה וליבה תחת עומס - שני הדברים שנשברים בדדליפט לפני הרגליים.' },
  ],
  press: [
    { name: 'דחיקת כתפיים', why: 'אותה תנועה עם עזרה מהרגליים, כדי לעמוד במשקל גדול יותר מעל הראש.' },
    { name: 'הרחקת כתף', why: 'ראש הכתף האמצעי, שלחיצה לבדה כמעט לא נוגעת בו.' },
    { name: 'פשיטת מרפק מעל הראש', why: 'תלת ראשי בטווח הארוך, שם הוא צומח הכי מהר.' },
    { name: 'מתח', why: 'משיכה אנכית שמאזנת את כל הדחיפה מעל הראש שביום הזה.' },
    { name: 'משיכת גומייה', why: 'כתף אחורית, שכמעט שום תרגיל אחר בתוכנית לא נוגע בה.' },
  ],
};

const CORE = [
  { name: 'הולו הולד', why: 'בקרת ליבה בקו ישר - מה שמונע מהגב התחתון לקחת פיקוד בסקוואט ובלחיצה.' },
  { name: 'הליכת מזוודה', why: 'ליבה שמתנגדת להטיה לצד, שזה מה שהיא עושה בפועל תחת מוט.' },
  { name: 'באג מת', why: 'הצלעות סגורות והגב צמוד - השליטה שכל תרגיל מעל הראש נשען עליה.' },
];

function estimateMinutes(movements: PlannedMovement[]): number {
  const seconds = movements.reduce((total, movement) => {
    const { sets, restSeconds } = movement.prescription;
    // ~40s under the bar per set, plus the rest after all but the last.
    return total + sets * 40 + (sets - 1) * restSeconds;
  }, 0);
  return Math.round(seconds / 60) + 10; // warm-up and changeovers
}

function buildSession(
  day: { title: string; focus: string; main: typeof LIFT_LABEL extends never ? never : LiftKey; second: LiftKey | null },
  index: number,
  block: Block,
  weekInBlock: number,
  oneRm: OneRepMaxes,
  deload: boolean,
  budgetMinutes: number,
): PlannedSession {
  const movements: PlannedMovement[] = [];

  const percent = deload ? DELOAD.percent : block.mainPercent[weekInBlock];
  const sets = deload ? DELOAD.sets : block.mainSets;
  const reps = deload ? DELOAD.reps : block.mainReps;
  const rir = deload ? DELOAD.rir : block.rir;
  const tempo = deload ? DELOAD.tempo : block.tempo;
  const restMain = deload ? DELOAD.rest : block.restMain;

  movements.push({
    name: LIFT_LABEL[day.main],
    slot: 'main',
    prescription: prescribe(oneRm[day.main], percent, sets, reps, rir, tempo, restMain),
    why: `תרגיל היום. ${block.intent}`,
  });

  if (day.second) {
    movements.push({
      name: LIFT_LABEL[day.second],
      slot: 'secondary',
      prescription: prescribe(
        oneRm[day.second],
        Math.max(50, percent - 15),
        Math.max(2, sets - 1),
        deload ? DELOAD.reps : '6-8',
        rir + 1,
        tempo,
        Math.round(restMain * 0.75),
      ),
      why: 'תרגיל שני, קל יותר מהראשון - נפח נוסף בלי להוסיף עייפות שתגבה מחר.',
    });
  }

  // Accessories fill whatever time is left, in order of usefulness.
  const pool = ACCESSORIES[day.main];
  for (const accessory of deload ? pool.slice(0, 1) : pool) {
    const candidate: PlannedMovement = {
      name: accessory.name,
      slot: 'accessory',
      prescription: {
        sets: deload ? 2 : block.accessorySets,
        reps: deload ? '10' : block.accessoryReps,
        percent: null,
        kg: null,
        rir: deload ? 4 : block.rir + 1,
        tempo: '2-0-1-0',
        restSeconds: block.restAccessory,
      },
      why: accessory.why,
    };
    if (estimateMinutes([...movements, candidate]) > budgetMinutes) break;
    movements.push(candidate);
  }

  /*
   * Use the hour that was asked for.
   *
   * Accessories stop being added once one more would overrun, which left a
   * 60-minute session prescribing 37 minutes of work - technically inside the
   * budget and quietly short-changing the member. Whatever room is left now
   * goes into more sets of what is already there, which is the right place for
   * it: another set of a movement already chosen beats a ninth movement.
   */
  if (!deload) {
    for (let round = 0; round < 2; round += 1) {
      for (const movement of movements) {
        if (movement.slot !== 'accessory') continue;
        if (movement.prescription.sets >= 5) continue;
        const grown = movements.map((entry) =>
          entry === movement
            ? { ...entry, prescription: { ...entry.prescription, sets: entry.prescription.sets + 1 } }
            : entry,
        );
        // Leave room for the core finisher that still has to go on the end.
        if (estimateMinutes(grown) + 4 > budgetMinutes) continue;
        movements.splice(0, movements.length, ...grown);
      }
    }
  }

  const core = CORE[index % CORE.length];
  const finisher: PlannedMovement = {
    name: core.name,
    slot: 'finisher',
    prescription: {
      sets: 3,
      reps: '30-45 שניות',
      percent: null,
      kg: null,
      rir: 2,
      tempo: '-',
      restSeconds: 45,
    },
    why: core.why,
  };
  if (estimateMinutes([...movements, finisher]) <= budgetMinutes) movements.push(finisher);

  return {
    day: index + 1,
    title: day.title,
    focus: day.focus,
    movements,
    estimatedMinutes: estimateMinutes(movements),
  };
}

export function buildProgramme(input: ProgrammeInput): Programme {
  const days = Math.min(6, Math.max(2, Math.round(input.daysPerWeek)));
  const split = SPLITS[days];
  const budget = Math.max(30, Math.min(120, Math.round(input.sessionMinutes)));

  const caveats: string[] = [];
  const missing = (Object.keys(input.oneRm) as LiftKey[]).filter((key) => !input.oneRm[key]);
  if (missing.length > 0) {
    caveats.push(
      `לא הזנת שיא ל${missing.map((key) => LIFT_LABEL[key]).join(', ')}. התוכנית תיתן לך מספר חזרות ורמת מאמץ במקום משקל - זה עובד בדיוק אותו דבר, פשוט תצטרך להרגיש את הסט הראשון.`,
    );
  }
  if (input.sessionMinutes < 45) {
    caveats.push(
      'בפחות מ-45 דקות ירדנו בתרגילי עזר ולא בתרגיל המרכזי. התרגיל הראשון הוא זה שמזיז את המחט.',
    );
  }
  if (days >= 6) {
    caveats.push(
      'שישה ימים בשבוע עובדים רק אם השינה והאוכל עומדים בזה. אם שבועיים ברצף מרגישים כבדים - רדו לחמישה, זה לא כישלון.',
    );
  }

  const weeks: PlannedWeek[] = [];
  for (let week = 0; week < 12; week += 1) {
    const blockIndex = Math.floor(week / 4);
    const weekInBlock = week % 4;
    const block = BLOCKS[blockIndex];
    const deload = weekInBlock === 3;

    weeks.push({
      index: week + 1,
      blockName: block.name,
      intent: deload ? DELOAD.intent : block.intent,
      deload,
      sessions: split.days.map((day, index) =>
        buildSession(day, index, block, weekInBlock, input.oneRm, deload, budget),
      ),
    });
  }

  return {
    model: 'פריודיזציה בבלוקים, שלושה בלוקים של ארבעה שבועות',
    modelWhy:
      'אי אפשר לצבור נפח ולהגיע לשיא באותו זמן, וניסיון לעשות את שניהם הוא רוב הסיבה שמתאמנים בינוניים נתקעים. הבלוק הראשון בונה, השני מלמד את מה שנבנה להפיק כוח, השלישי מממש. כל בלוק נסגר בשבוע ריקון - לא כי אתה עייף, אלא כדי שלא תהיה.',
    splitName: split.name,
    splitWhy: split.why,
    weeks,
    caveats,
  };
}
