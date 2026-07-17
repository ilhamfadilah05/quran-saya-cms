# Implementation Plan — Quran Saya CMS

Rencana implementasi **dari awal sampai akhir**, dipecah **satu fase per file**.
Kerjakan berurutan (Phase 00 → 17). Centang checklist di tiap file; pastikan
**Definition of Done (DoD)** terpenuhi sebelum lanjut.

Acuan: [PRD](../01-prd.md) · [Design System](../02-design-system.md) ·
[Database](../03-database-architecture.md) ·
[System Architecture](../04-system-architecture.md).

> **Aturan mutlak** (jaga app live): jangan ubah RLS/skema kontrak
> `users` & `adzan_notification`. SQL idempoten. `.env` tidak di-commit.

## Legenda
`[ ]` belum · `[~]` sedang · `[x]` selesai & terverifikasi

## Daftar Fase & Status

| Fase | File | Fokus | Status |
|------|------|-------|--------|
| 00 | [phase-00-setup.md](./phase-00-setup.md) | Setup proyek (Next.js+Tailwind+shadcn) | [x] |
| 01 | [phase-01-schema.md](./phase-01-schema.md) | Skema Supabase + admin pertama | [~] |
| 02 | [phase-02-core-lib.md](./phase-02-core-lib.md) | Core lib server | [x] |
| 03 | [phase-03-theme.md](./phase-03-theme.md) | Fondasi tema Light/Dark + font | [x] |
| 04 | [phase-04-shell.md](./phase-04-shell.md) | App shell (sidebar/topbar) | [x] |
| 05 | [phase-05-auth.md](./phase-05-auth.md) | Autentikasi admin | [x] |
| 06 | [phase-06-datatable.md](./phase-06-datatable.md) | Komponen DataTable standar | [x] |
| 07 | [phase-07-dashboard.md](./phase-07-dashboard.md) | Dashboard | [x] |
| 08 | [phase-08-learning.md](./phase-08-learning.md) | Analitik Belajar | [x] |
| 09 | [phase-09-users.md](./phase-09-users.md) | Pengguna (list + detail) | [x] |
| 10 | [phase-10-notifications.md](./phase-10-notifications.md) | Kirim Notifikasi + segmentasi | [x] |
| 11 | [phase-11-reminders.md](./phase-11-reminders.md) | Reminder (CRUD) | [x] |
| 12 | [phase-12-adzan.md](./phase-12-adzan.md) | Adzan | [x] |
| 13 | [phase-13-logs.md](./phase-13-logs.md) | Log Notifikasi | [x] |
| 14 | [phase-14-cron.md](./phase-14-cron.md) | Cron + worker | [x] |
| 15 | [phase-15-polish.md](./phase-15-polish.md) | Polish UX | [x] |
| 16 | [phase-16-qa.md](./phase-16-qa.md) | QA & pengujian | [~] |
| 17 | [phase-17-deploy.md](./phase-17-deploy.md) | Deployment | [ ] |

## Peta Modul PRD → Fase

| Modul PRD | Fase |
|-----------|------|
| A Autentikasi | 05 |
| B Dashboard | 07 |
| C Analitik Belajar | 08 |
| D Pengguna | 09 |
| E Kirim Notifikasi | 10 |
| F Reminder | 11 |
| G Adzan | 12 |
| H Log | 13 |
| I Cron | 14 |
| CC1–CC7 (lintas) | 03, 04, 06, 15 |

## Definition of Done (Global)
- [ ] Semua fase 00–17 tercentang.
- [ ] Semua acceptance criteria PRD (Modul A–I + CC1–CC7) terpenuhi.
- [ ] `typecheck` + `build` hijau; app live aman; tak ada secret bocor.
- [ ] Dark/Light, DataTable standar (filter/sort/pagination), navbar premium,
      loading states — terverifikasi.
