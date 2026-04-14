# AXIPH POS — React App

Gaming club uchun professional POS tizimi. Vaqt va pul hisoblashni to'liq avtomatlashtiradi.

## Ishga tushirish

### 1-qadam — Node.js o'rnatish
👉 **https://nodejs.org/** dan LTS versiyasini yuklab oling va o'rnating.

### 2-qadam — Ilovani ishga tushirish
`start.bat` faylini ikki marta bosing — barcha dependencylar o'rnatiladi va dev server ishga tushadi.

**Yoki terminal orqali:**
```bash
cd react-pos-app
npm install
npm run dev
```

Brauzerda oching: **http://localhost:5173**

---

## Loyiha tuzilmasi

```
react-pos-app/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── start.bat                   ← Ishga tushirish skripti
└── src/
    ├── main.jsx                ← React entry point
    ├── App.jsx                 ← Root component + layout
    ├── index.css               ← Global styles + animations
    ├── context/
    │   └── PosContext.jsx      ← Global state (tables, zones, foods, timers)
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.jsx     ← Sidebar navigation
    │   │   └── TopAppBar.jsx   ← Top header bar
    │   └── tables/
    │       ├── TableCard.jsx   ← Stol kartochkasi (timer + orders + stop)
    │       └── AddTableModal.jsx ← Yangi stol qo'shish modali
    └── pages/
        ├── Dashboard.jsx       ← Asosiy boshqaruv (KPI, live sessions)
        ├── Stollar.jsx         ← Stollar (zona bo'yicha grid)
        ├── Foyda.jsx           ← Foyda grafiklar (recharts)
        └── Admin.jsx           ← Admin (zona, menyu, stol, sozlamalar)
```

---

## Imkoniyatlar

| Bo'lim | Funksionallik |
|--------|--------------|
| **Dashboard** | KPI kartalar, jonli seans jadvali, oxirgi to'lovlar |
| **Stollar** | Zona bo'yicha guruhlanган, taymer, ovqat buyurtma, to'xtatish |
| **Foyda** | 1/7/30/90 kunlik daromad, area chart + bar chart |
| **Admin** | Zona CRUD, narx tahrirlash, menyu CRUD, stol boshqaruv, sozlamalar |

## Tech Stack

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Recharts | 2 | Grafiklar |
| Lucide React | 0.46 | Ikonalar (zahira) |

## Flutter ga o'tish uchun eslatmalar

- `PosContext.jsx` dagi state modeli to'g'ridan-to'g'ri Flutter `ChangeNotifier` / `Riverpod` ga map qilinadi
- Har bir sahifa alohida `StatelessWidget` yoki `ConsumerWidget` bo'ladi
- `calcTotal()`, `formatTime()`, `formatPrice()` funksiyalari Dart ga aynan ko'chiriladi
