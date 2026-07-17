# 04 — System Architecture: Quran Saya CMS

Arsitektur teknis lengkap CMS: stack, komponen, alur data, notifikasi, cron,
keamanan, dan deployment.

---

## 1. Gambaran Arsitektur

```
        ┌────────────────────────────────────────────────────────────┐
        │                     Quran Saya App (Flutter)               │
        │   menulis via anon key ──► Supabase (users, adzan_notif)   │
        │   menerima push ◄────────── FCM                            │
        └───────────────┬──────────────────────────┬────────────────┘
                        │                           │
             (baca/tulis via service-role)     (kirim push FCM v1)
                        │                           │
        ┌───────────────▼───────────────────────────▼────────────────┐
        │                    Quran Saya CMS (Next.js 15)              │
        │  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐ │
        │  │ App Router  │   │  Route Hand. │   │  lib/ (server)    │ │
        │  │ (Server     │   │  /api/*      │   │  supabase, fcm,   │ │
        │  │  Components)│   │  (auth, cron,│   │  segments, cron,  │ │
        │  │  + shadcn UI│   │   notif, ...)│   │  admin-session    │ │
        │  └─────────────┘   └──────────────┘   └──────────────────┘ │
        └───────────────┬───────────────────────────┬────────────────┘
                        │                            │
                 Supabase (PostgreSQL)          Firebase FCM v1
                        ▲
                        │ POST /api/cron/run (tiap 1 menit)
                 Scheduler eksternal / worker (x-cron-secret)
```

## 2. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | **Next.js 15** (App Router, React 19, Server Components) |
| Bahasa | TypeScript (strict) |
| Styling | **Tailwind CSS** |
| Komponen UI | **shadcn/ui** (Radix UI) |
| Tema | **next-themes** (light/dark/system) |
| Tabel | **@tanstack/react-table** (DataTable) |
| Grafik | **Recharts** (shadcn Chart) |
| Toast | **sonner** |
| Ikon | **lucide-react** |
| Font | Plus Jakarta Sans (`next/font/google`) |
| DB client | `@supabase/supabase-js` (service-role, server-only) |
| Push | `google-auth-library` → FCM HTTP v1 |
| Auth admin | HMAC session cookie (tanpa dependency berat) |
| Deploy | Vercel / Node server; cron via Vercel Cron / GitHub Actions / worker |

## 3. Struktur Folder (target)

```
quran-saya-cms/
├── app/
│   ├── globals.css                 # Tailwind + token tema (light/dark)
│   ├── layout.tsx                  # ThemeProvider + font + Toaster
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Shell: Sidebar + Topbar (auth gate)
│   │   ├── page.tsx                # Dashboard
│   │   ├── learning/page.tsx
│   │   ├── users/page.tsx
│   │   ├── users/[id]/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── reminders/page.tsx
│   │   ├── adzan/page.tsx
│   │   ├── logs/page.tsx
│   │   └── loading.tsx             # Skeleton
│   └── api/
│       ├── auth/{login,logout}/route.ts
│       ├── notifications/route.ts  # broadcast + count-only
│       ├── reminders/route.ts      # CRUD
│       ├── adzan/route.ts          # GET/PATCH (opsional)
│       ├── users/route.ts          # data server-side untuk DataTable (page/sort/filter)
│       ├── logs/route.ts           # idem
│       └── cron/{run,adzan,reminders,winback}/route.ts
├── components/
│   ├── ui/                         # shadcn components (button, card, table, ...)
│   ├── layout/                     # sidebar, topbar, theme-toggle, nav
│   ├── data-table/                 # DataTable generik + toolbar + pagination + faceted-filter
│   ├── kpi-card.tsx, charts/*.tsx
│   └── forms/                      # notification-composer, reminder-manager, cron-controls
├── lib/
│   ├── env.ts, supabase.ts, fcm.ts
│   ├── admin-session.ts, cms-auth.ts
│   ├── segments.ts, cron-jobs.ts
│   └── utils.ts                    # cn(), format tanggal/angka
├── scripts/cron-worker.mjs
├── supabase/schema.sql
├── tailwind.config.ts, components.json (shadcn)
├── .env  (gitignored)  ·  .env.example
└── docs/  (dokumen ini)
```

> Catatan: shell dipindah ke **route group `(dashboard)/layout.tsx`** agar
> sidebar/topbar **persisten** antar-navigasi (loading.tsx hanya mengganti area
> konten dengan Skeleton, sidebar tetap).

## 4. Rendering & Data Flow

- **Server Components** mengambil data langsung dari Supabase (service-role) saat
  request → aman, cepat, tanpa mengekspos key.
- **KPI/agregat**: `count(head:true)` + query per-bucket (bukan fetch massal).
- **DataTable server-side** (Pengguna, Log): halaman membaca query param
  (`page,size,sort,q,filter`) → memanggil Route Handler / query Supabase
  `.order().range().ilike()/.eq()` + `count:'exact'` → kirim ke komponen tabel.
- **Client Components** hanya untuk interaksi (form, toggle tema, DataTable
  toolbar, cron controls) — memanggil Route Handlers via `fetch`.

## 5. Autentikasi Admin

1. `POST /api/auth/login` → Supabase RPC `admin_login(email,password)` (bcrypt di
   DB) → jika valid, set cookie **httpOnly** `quran_saya_admin_session`
   (HMAC-SHA256, TTL 7 hari), update `last_login_at`.
2. `(dashboard)/layout.tsx` memanggil `requireAdminPageSession()` →
   verifikasi cookie; jika tidak ada → `redirect('/login')`.
3. Route Handler admin memverifikasi sesi; cron via sesi **atau**
   `x-cron-secret`.

## 6. Pengiriman Notifikasi (FCM v1)

- `lib/fcm.ts`: OAuth service account (`google-auth-library`) → `POST
  https://fcm.googleapis.com/v1/projects/{projectId}/messages:send`.
- Payload: `notification{title,body}`, `data{type,category,...}`,
  `android.notification{channel_id,sound}`, `apns.payload.aps{sound}`.
- Adzan memakai channel & sound adzan; reminder/manual/winback = default.

## 7. Segmentasi (Targeting)

`lib/segments.ts` membangun query `users` terfilter (AND):
`is_reminder`, `platform`, `version`, `learning_level>=`, `learning_streak>=`,
`last_opened_at<=` (vakum), `learning_lessons_done=0` (belum mulai). Selalu
mensyaratkan `token_firebase` non-null. Mendukung **dry-run** (hitung jumlah)
sebelum kirim.

## 8. Cron & Dedupe

- Endpoint `POST /api/cron/run` (dipicu tiap 1 menit) menjalankan
  `runAdzanCron()`, `runReminderCron()`, `runWinbackCron()`.
- **Shared dispatcher** menangani dedupe: cek `notification_logs.dedupe_key`,
  kirim hanya item **baru**/**retry**, catat status.
- **Adzan/Reminder**: dipicu saat `HH:MM` cocok. **Win-back**: sekali/hari pada
  `WINBACK_TIME` (mode `force` untuk uji).
- Pemicu: **Vercel Cron** / **GitHub Actions** (curl POST + header) atau
  **worker** `scripts/cron-worker.mjs` (polling interval).

## 9. Environment Variables

```
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
FCM_PROJECT_ID, FCM_CLIENT_EMAIL, FCM_PRIVATE_KEY   # PEM \n-escaped
ADMIN_SESSION_SECRET, CRON_SECRET
APP_TIMEZONE=Asia/Jakarta, WINBACK_TIME=19:00
ADZAN_ANDROID_CHANNEL_ID, ADZAN_ANDROID_SOUND, ADZAN_APNS_SOUND
CRON_BASE_URL, CRON_INTERVAL_SECONDS, CRON_RUN_ON_START   # worker
```
`.env` **gitignored**; kredensial Firebase JSON juga.

## 10. Keamanan

| Aspek | Kontrol |
|-------|---------|
| Service-role key | Hanya di server (lib/*), tak pernah ke browser |
| Halaman admin | Gerbang sesi (`requireAdminPageSession`) |
| API admin | Verifikasi sesi tiap request |
| Cron | Sesi admin atau `x-cron-secret` (timing-safe compare) |
| Sesi | HMAC-SHA256, httpOnly, `secure` di produksi, TTL 7 hari |
| Login | bcrypt di DB (RPC), hash tak keluar |
| App live | Skema/RLS `users`,`adzan_notification` tidak diubah |
| Rahasia | `.env` gitignored; tidak ada secret di repo |

## 11. Kinerja & Skala

- Query agregasi (`count`) + indeks (lihat
  [DB Architecture §8](./03-database-architecture.md)).
- DataTable **server-side pagination** untuk `users` & `notification_logs`.
- Dispatcher notifikasi memproses per-batch; log di-insert per 500 baris.
- Roadmap: retensi `notification_logs` (arsip/hapus > 90 hari), pembersihan
  token FCM mati.

## 12. Deployment

1. `npm install` → set `.env`.
2. Jalankan `supabase/schema.sql` di Supabase (idempoten) → buat admin pertama.
3. `npm run build` & deploy (Vercel disarankan).
4. Aktifkan **Vercel Cron** (atau GitHub Action) → `POST /api/cron/run` tiap
   menit dengan `x-cron-secret`. Alternatif: jalankan `npm run cron:worker`.
5. Verifikasi: login admin, dashboard tampil, uji "Cek jumlah" & kirim uji.

## 13. Dependencies (ringkas)

**Runtime**: `next`, `react`, `react-dom`, `@supabase/supabase-js`,
`google-auth-library`, `@tanstack/react-table`, `next-themes`, `lucide-react`,
`recharts`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`@radix-ui/*` (via shadcn).
**Dev**: `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `@types/*`.

## 14. Pengujian & Kualitas

- `npm run typecheck` (tsc strict) & `npm run build` wajib lolos.
- Uji manual per modul: login, DataTable (filter/sort/pagination), kirim notif
  (dry-run + kirim), cron (dedupe), toggle tema (light/dark), responsif (drawer).
