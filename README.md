# 🎂 Balicake

בוטיק עוגות מעוצבות וסדנאות אפייה — אתר עסקי מלא בעברית RTL.

🌐 **חי באוויר:** https://balicake.vercel.app

---

## 📦 מה כולל האתר

✅ 10 דפים: בית · קטלוג · גלריה · עלינו · מתכונים · שאלות נפוצות · הזמנה · צור קשר · נגישות · 404
✅ עיצוב responsive (נייד · טאבלט · מחשב)
✅ קרוסלת hero עם 4 עוגות
✅ קטלוג מסונן עם הזמנת WhatsApp ישירה לכל מוצר
✅ Google Analytics 4 + Meta Pixel
✅ נגישות מלאה — תקן ישראלי 5568 / WCAG 2.0 AA
✅ SEO — sitemap.xml · robots.txt · JSON-LD (LocalBusiness)
✅ CMS פשוט: עדכון מוצרים ב-`data/products.json` (ראה [`data/README.md`](data/README.md))
✅ אנימציות ייחודיות: shimmer · marquee · sparkle · scroll-progress · counter

---

## 🚀 פריסה

האתר מתפרס אוטומטית ל-Vercel בכל push ל-`main`:

```bash
git push origin main
```

או דריסת deploy ידני:
```bash
vercel deploy --prod
```

---

## 🛠️ עריכה לוקאלית

```bash
# פתח את index.html בדפדפן — אין שלב build
# או הרץ שרת מקומי:
python -m http.server 8000
```

---

## ⚠️ TODO לפני go-live סופי

לפני העלאה לדומיין הסופי, החליפו את ה־placeholders האלה:

1. **טלפון WhatsApp** — `wa.me/972543097883` (חפשו ב-`*.html` ו-`data/products.json`)
2. **GA4 ID** — `G-XXXXXXXXXX` (בכל ה-HTML)
3. **Meta Pixel ID** — `000000000000000` (בכל ה-HTML)
4. **דומיין** — `https://balicake.co.il/` ב-`og:` tags ו-`sitemap.xml`/`robots.txt`
5. **רכז נגישות** — `accessibility@balicake.co.il` ב-[`accessibility.html`](accessibility.html)

---

## 📂 מבנה התיקייה

```
.
├── index.html            ← דף הבית
├── catalog.html          ← קטלוג (CMS-driven)
├── gallery.html          ← גלריית עבודות
├── about.html            ← עלינו
├── recipes.html          ← מתכונים
├── faq.html              ← שאלות נפוצות
├── orders.html           ← הזמנה אישית
├── contact.html          ← צור קשר
├── accessibility.html    ← הצהרת נגישות
├── 404.html              ← עמוד שגיאה
├── css/style.css         ← כל ה-CSS
├── js/main.js            ← כל ה-JS
├── data/
│   ├── products.json     ← קטלוג מוצרים (CMS)
│   └── README.md         ← מדריך ניהול ללקוחה
├── images/hero/          ← תמונות hero (cake-1..4.jpg)
├── sitemap.xml
├── robots.txt
└── vercel.json
```

---

## 📝 רישיון

קוד פרטי — Balicake / Yarin Brosh © 2026
