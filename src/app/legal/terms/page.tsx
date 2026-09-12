import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'תנאי שימוש',
  description: 'הכללים לשימוש באפליקציית GLoW.',
};

export default function TermsPage() {
  return (
    <article className="space-y-6">
      <div>
        <h1 className="display text-2xl tracking-tight">תנאי שימוש</h1>
        <p className="mt-1 text-xs text-muted">עודכן לאחרונה: ספטמבר 2026</p>
      </div>

      <p className="text-sm text-muted">
        GLoW היא אפליקציה פנימית של מועדון אימונים פרטי. השימוש בה מותנה בהסכמה לתנאים שלהלן.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">מי רשאי להשתמש</h2>
        <p className="text-sm text-muted">
          האפליקציה מיועדת לחברי המועדון בלבד. ההרשמה פתוחה למי שהוזמן, וכניסה בפועל ניתנת רק
          לאחר אישור של בעלי המועדון. בעלי המועדון רשאים להשעות או להסיר חשבון.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">הרשמה לשיעורים וביטולים</h2>
        <p className="text-sm text-muted">
          מספר המקומות בכל שיעור מוגבל. כששיעור מלא אפשר להצטרף לרשימת המתנה, והמקום מתפנה
          אוטומטית לראשון בתור. ביטול אפשרי עד למועד הסגירה שנקבע לאותו שיעור. אנא בטלו בזמן —
          מקום שנשמר ולא נוצל הוא מקום שנלקח ממתאמן אחר.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">בריאות ואחריות</h2>
        <p className="text-sm text-muted">
          התכנים באפליקציה — תוכניות אימון, המלצות ומדדי התקדמות — הם מידע כללי לניהול האימונים
          במועדון. הם אינם ייעוץ רפואי ואינם תחליף לו. התייעצו עם רופא לפני תחילת פעילות גופנית,
          ובמיוחד אם יש לכם מצב בריאותי כלשהו. האימון הוא באחריותכם.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">שימוש הוגן</h2>
        <p className="text-sm text-muted">
          אין לשתף את פרטי הכניסה שלכם, לנסות לגשת לנתונים של מתאמנים אחרים, או להשתמש
          באפליקציה לכל מטרה שאינה הפעילות במועדון.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">שינויים</h2>
        <p className="text-sm text-muted">
          התנאים עשויים להתעדכן. שינוי מהותי יובא לידיעת החברים דרך האפליקציה.
        </p>
      </section>
    </article>
  );
}
