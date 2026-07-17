# Phase 02 — Core Lib (Server)

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 01](./phase-01-schema.md).
> Acuan: [System Architecture](../04-system-architecture.md).

## Tujuan
Fondasi server: env, koneksi Supabase, FCM, sesi admin, segmentasi, cron, utils.

## Checklist
- [x] `lib/env.ts` — `getServerEnv()`, `validateSupabaseEnv()`,
      `validateFcmEnv()`; handle `FCM_PRIVATE_KEY` (`\n` → newline).
- [x] `lib/supabase.ts` — `getSupabaseServerClient()` (service-role, cached,
      **server-only**).
- [x] `lib/admin-session.ts` — `createAdminSessionToken`,
      `verifyAdminSessionToken` (HMAC-SHA256), `ADMIN_COOKIE`.
- [x] `lib/cms-auth.ts` — `getAdminSession`, `requireAdminPageSession`,
      `canAccessCronRoute` (sesi **atau** `x-cron-secret`, timing-safe).
- [x] `lib/fcm.ts` — `sendPushNotification()` (FCM HTTP v1 via
      `google-auth-library`), `adzanSoundDetails()`.
- [x] `lib/segments.ts` — `SegmentFilter`, `fetchSegmentUsers`, `describeSegment`.
- [x] `lib/cron-jobs.ts` — `getNowParts`, `addCalendarDays`, **dispatcher dedupe**,
      `runAdzanCron`, `runReminderCron`, `runWinbackCron`.
- [x] `lib/utils.ts` — `cn()`, format tanggal (`id-ID`), format angka.

## Definition of Done
- `npm run typecheck` lolos.
- Tidak ada import service-role/`lib/supabase` di komponen client.
- Fungsi cron & FCM dapat dipanggil (diuji lewat cron route di Phase 14).

## Selanjutnya
→ [Phase 03 — Fondasi Tema](./phase-03-theme.md)
