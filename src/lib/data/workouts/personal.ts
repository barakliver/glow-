import { COOLDOWNS, scale, type LibraryWorkout } from './types';

/**
 * Sessions the owner wrote for himself, with his own numbers in them.
 *
 * The library's rule is that it never prints a load, because a number on the
 * board is wrong for most of the room the moment it is written. These are the
 * exception and the reason is narrow: the owner wrote them, the weight is the
 * weight he chose, and the session is not a prescription handed to a room - it
 * is his own workout, published so he can run it from his phone.
 *
 * The no-load test in tests/unit/workout-library.test.ts exempts this file by
 * slug and by name, so the rule still holds everywhere it was meant to and the
 * exception has to be made deliberately rather than by drifting.
 */
export const PERSONAL_WORKOUTS: LibraryWorkout[] = [
  {
    slug: 'barak-military',
    title: 'Barak Workout Military',
    subtitle: 'שישה עשר סבבים. ריצה, מוט, ושוב.',
    category: 'crossfit',
    format: 'for_time',
    difficulty: 'advanced',
    durationMinutes: 60,
    timeCapMinutes: 30,
    equipment: ['barbell', 'treadmill'],
    description:
      'שישה עשר סבבים של 140 מטר הלוך וחזור וארבעה קלין וג׳רק. הקצב הוא כל האימון: 16 סבבים בחצי שעה זה סבב כל דקה ושמונה שניות, וכמעט כולם יוצאים מהר מדי בסבב הראשון. למסך החי יש מונה סבבים גדול, שעון, והוא מאריך את עצמו אם הקצב אומר שחצי שעה לא תספיק.',
    warmup: [
      'הליכון | 5 דקות, עולים בקצב בהדרגה',
      'סיבובי כתפיים, ירך וקרסול | 10 לכל כיוון',
      'סקוואט משקל גוף | 15 חזרות',
      'מוט ריק: דדליפט, משיכה, דחיפה מעל הראש | 5 מכל תרגיל, 2 סבבים',
      'העלאה הדרגתית | 3 סטים של 3, עד משקל העבודה',
    ],
    structure: [
      {
        label: 'כוח',
        detail: 'חימום הקלין עד משקל העבודה, בלי לעייף',
        items: ['Clean and Jerk | 3 סטים של 2, עולים'],
      },
      {
        label: 'מטקון',
        detail: '16 סבבים, למהירות. מכסת זמן 30 דקות',
        items: ['הליכון | 140 מטר הלוך וחזור', 'Clean and Jerk | 4 חזרות, 40 ק״ג'],
      },
    ],
    cooldown: [...COOLDOWNS.breath],
    scaling: scale(
      '10 סבבים, 100 מטר, מוט במשקל נוח שמאפשר 4 חזרות נקיות.',
      'לפי הפרוטוקול: 16 סבבים, 140 מטר, 40 ק״ג.',
      '20 סבבים, או אותם 16 במכסת זמן של 25 דקות.',
    ),
    scoreType: 'time',
  },
];
