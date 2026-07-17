# Phase 16 — QA & Pengujian

> [← Daftar Fase](./README.md) · Prasyarat: Phase 00–15.

## Tujuan
Memastikan kualitas, keamanan, dan bahwa app live tidak terganggu.

## Checklist — Otomatis
- [x] `npm run typecheck` (tsc strict) **lolos**.
- [x] `npm run build` **lolos** (tanpa error tipe/route) — 13 rute + `/_not-found`.
- [x] `npm run lint` bersih — ESLint (`next/core-web-vitals` + `@typescript-eslint`)
      dikonfigurasi via `.eslintrc.json`; "No ESLint warnings or errors".

## Checklist — Uji Manual per Modul (AKSI MANUAL — butuh env live)
- [~] Auth: login benar/salah, proteksi halaman, logout.
- [~] Dashboard & Analitik: angka masuk akal, grafik tampil.
- [~] **DataTable** (Pengguna/Log/Adzan): sorting, global search, faceted
      filter, pagination (server & client), column visibility, reset.
- [~] Kirim notif: dry-run count, kirim, toast, log tercatat.
- [~] Reminder: CRUD + validasi waktu + konfirmasi hapus.
- [~] Cron: dedupe (2× semenit tak dobel), win-back `force`.
- [~] Tema: toggle light/dark/system, tanpa flash.
- [~] Responsif: mobile drawer, tabel scroll.

> Butuh Supabase + FCM live untuk dijalankan. Logika sudah terbangun; verifikasi
> UI/runtime dilakukan saat smoke test di Phase 17.

## Checklist — Keamanan & Integritas
- [x] Tidak ada secret ter-commit; `.env` `gitignored` (`git check-ignore` OK).
- [x] Service-role key hanya di server: `SUPABASE_SERVICE_ROLE_KEY` (bukan
      `NEXT_PUBLIC_*`), modul sensitif ber-`import 'server-only'`, tak ada
      komponen `'use client'` yang mengimpornya, string tak muncul di
      `.next/static`.
- [x] **App live tidak terganggu**: `schema.sql` hanya `add column if not exists`
      pada `users`/`adzan_notification`, **tanpa** DROP/ALTER-RLS/DELETE; semua
      CREATE idempotent; RLS tak disentuh → app tetap menulis via anon key.

## Definition of Done
- Semua checklist QA hijau.

## Selanjutnya
→ [Phase 17 — Deployment](./phase-17-deploy.md)
