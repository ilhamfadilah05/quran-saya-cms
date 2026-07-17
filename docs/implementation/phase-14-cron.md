# Phase 14 — Cron + Worker

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 02](./phase-02-core-lib.md).
> (Modul PRD I)

## Tujuan
Endpoint cron (adzan/reminder/win-back) + worker; dedupe anti-kirim-ganda.

## Checklist
- [x] `app/api/cron/run/route.ts` — jalankan `runAdzanCron` + `runReminderCron`
      + `runWinbackCron`, kembalikan `total`. Auth: sesi **atau** `x-cron-secret`.
- [x] `app/api/cron/adzan/route.ts`, `.../reminders/route.ts`.
- [x] `app/api/cron/winback/route.ts` — dukung `?force=1`.
- [x] `app/api/health/route.ts` — health check.
- [x] `scripts/cron-worker.mjs` — polling `POST /api/cron/run` (interval, load
      `.env` manual, header `x-cron-secret`, opsi run-on-start).
- [~] **(AKSI RUNTIME)** Uji **dedupe**: panggil cron 2× dalam menit yang sama →
      tak ada kiriman ganda (cek `notification_logs.dedupe_key`). Butuh
      Supabase+FCM live. (Logika dedupe di `lib/cron-jobs.ts` sudah dibangun.)
- [~] **(AKSI RUNTIME)** Uji **win-back**: di luar `WINBACK_TIME` → skip; dengan
      `force` → jalan. Butuh env live.

## Definition of Done
- Cron dapat dipicu manual (dari CMS) & via worker.
- Dedupe terbukti (tak dobel).
- Win-back terjaga jam target.

## Selanjutnya
→ [Phase 15 — Polish UX](./phase-15-polish.md)
