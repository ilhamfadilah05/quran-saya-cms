# Phase 08 — Analitik Belajar

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 07](./phase-07-dashboard.md).
> (Modul PRD C)

## Tujuan
Mengukur fitur hero "Belajar Ngaji": progres, distribusi, retensi.

## Checklist
- [x] `app/(dashboard)/learning/page.tsx` — KPI via count:
  - [x] total pembelajar (`learning_lessons_done>0`).
  - [x] aktif 7 hari (`learning_last_active_at`).
  - [x] streak ≥ 7.
  - [x] **streak berisiko** (streak≥3 & aktif kemarin, belum hari ini) — konsisten
        dgn win-back.
- [x] Chart distribusi **level** (bucket) & **streak** (bucket).
- [x] **DataTable** Top pembelajar (by XP) dengan sorting.
- [x] Catatan "belum mulai belajar" (`learning_lessons_done=0`, pasang >2 hari).

## Definition of Done
- Bucket dihitung via count per rentang.
- Definisi "streak berisiko" sama dengan cron win-back.
- Rapi di light/dark.

## Selanjutnya
→ [Phase 09 — Pengguna](./phase-09-users.md)
