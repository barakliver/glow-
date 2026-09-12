import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות',
  description: 'איזה מידע GLoW אוסף, למה, ומה אפשר לעשות איתו.',
};

/**
 * Describes what the app actually does with member data. Kept deliberately
 * narrow: anything claimed here has to be true of the code.
 */
export default function PrivacyPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="display text-2xl tracking-tight">מדיניות פרטיות</h1>
        <p className="mt-1 text-xs text-muted">עודכן לאחרונה: ספטמבר 2026</p>
      </div>

      <p className="text-sm text-muted">
        GLoW היא אפליקציה של מועדון אימונים פרטי, בהזמנה בלבד. המסמך הזה מתאר איזה מידע נאסף, למה,
        ומה אפשר לעשות איתו. אנחנו מנסחים אותו קצר ומדויק, בלי אותיות קטנות.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">מה נאסף</h2>
        <ul className="space-y-1.5 text-sm text-muted">
          <li>· <span className="font-semibold text-ink">פרטי חשבון</span> — שם וכתובת אימייל, מחשבון Google שבו נכנסתם. אנחנו לא מקבלים ולא שומרים את הסיסמה שלכם.</li>
          <li>· <span className="font-semibold text-ink">מספר טלפון</span> — אם בחרתם למלא אותו. אפשר להשאיר ריק.</li>
          <li>· <span className="font-semibold text-ink">פעילות במועדון</span> — הרשמות לשיעורים, נוכחות, אימונים שרשמתם, שיאים אישיים ודיווחי מוכנות יומיים.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">למה זה משמש</h2>
        <p className="text-sm text-muted">
          כדי להפעיל את המועדון בלבד: לשבץ אתכם לשיעורים, לנהל רשימות המתנה, להציג לכם את
          ההתקדמות שלכם ולשלוח התראות על שיעורים שנרשמתם אליהם. אנחנו לא משתמשים במידע לפרסום,
          לא מוכרים אותו ולא מעבירים אותו לגורם שלישי.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">מי רואה מה</h2>
        <p className="text-sm text-muted">
          מתאמן רואה את הנתונים של עצמו בלבד. בעלי המועדון והמאמנים רואים את רשימות השיעורים
          והנוכחות, כנדרש לניהול. ההפרדה הזאת אכופה במסד הנתונים עצמו, לא רק במסכים — גם מי
          שינסה לעקוף את הממשק לא יקבל מידע של מתאמן אחר.
        </p>
        <p className="text-sm text-muted">
          קישורי הזמנה ציבוריים מציגים את לוח השיעורים בלבד. הם לעולם אינם חושפים שמות, טלפונים
          או נתוני אימון של מי מהמתאמנים.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">איפה זה נשמר</h2>
        <p className="text-sm text-muted">
          הנתונים נשמרים ב-Supabase, ספק תשתית מסדי נתונים, בשרתים באירופה. הכניסה נעשית דרך
          חשבון Google שלכם; אנחנו מקבלים מגוגל את השם והאימייל בלבד.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">הזכויות שלכם</h2>
        <p className="text-sm text-muted">
          אתם יכולים לעיין בפרטים שלכם ולתקן אותם מתוך האפליקציה, במסך הפרופיל. אם תרצו שהחשבון
          והנתונים שלכם יימחקו — פנו לבעלי המועדון והבקשה תבוצע.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">יצירת קשר</h2>
        <p className="text-sm text-muted">
          לכל שאלה בנושא פרטיות אפשר לפנות לבעלי המועדון, דרך פרטי הקשר שמופיעים במסך
          &quot;עוד&quot; באפליקציה.
        </p>
      </section>
    </article>
  );
}
