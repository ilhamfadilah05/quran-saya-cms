# Phase 00 — Setup Proyek

> [← Daftar Fase](./README.md) · Prasyarat: `.env` & `.gitignore` sudah ada.

## Tujuan
Kerangka Next.js 15 (App Router, TS) + Tailwind + shadcn/ui siap, dependency
terpasang, struktur folder awal terbentuk.

## Checklist
- [x] Inisialisasi Next.js 15 (App Router, TypeScript, ESLint) di
      `quran-saya-cms/` — **pertahankan** `.env` & `.gitignore` yang ada.
- [x] Setup **Tailwind CSS** + `postcss` + `autoprefixer`.
- [x] Init **shadcn/ui** (`npx shadcn@latest init`) → `components.json`, alias
      `@/components`, `@/lib/utils` (`cn()`).
- [x] Install runtime deps: `@supabase/supabase-js`, `google-auth-library`,
      `@tanstack/react-table`, `next-themes`, `lucide-react`, `recharts`,
      `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`.
- [x] `tsconfig.json` strict + path `@/*`.
- [x] Skrip `package.json`: `dev`, `build`, `start`, `lint`, `typecheck`,
      `cron:worker`.
- [x] Buat `.env.example` (Supabase, FCM, ADMIN_SESSION_SECRET, CRON_SECRET,
      APP_TIMEZONE, WINBACK_TIME, adzan sound, opsi worker).
- [x] `.gitignore` mencakup `node_modules`, `.next`, `.env`,
      `*firebase-adminsdk*.json`, `*.tsbuildinfo`.
- [x] Struktur folder: `app/`,
      `components/{ui,layout,data-table,forms,charts,tables}`, `lib/`,
      `scripts/`, `supabase/`, `docs/`.

## Definition of Done
- `npm run dev` jalan & halaman default tampil.
- `npm run typecheck` lolos.
- shadcn siap dipakai (`components.json` ada).

## Selanjutnya
→ [Phase 01 — Skema Supabase](./phase-01-schema.md)
