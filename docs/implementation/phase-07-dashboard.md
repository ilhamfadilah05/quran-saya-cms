# Phase 07 — Dashboard

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 04](./phase-04-shell.md),
> [Phase 06](./phase-06-datatable.md). (Modul PRD B)

## Tujuan
KPI ringkas + tren + notifikasi terbaru.

## Checklist
- [x] `app/(dashboard)/page.tsx` — Server Component; KPI via `count(head:true)`.
- [x] `components/kpi-card.tsx` — chip ikon accent + angka + label + sub.
- [x] KPI: total user, punya token, aktif 7 hari (`last_opened_at`), reminder
      aktif, pembelajar (`learning_lessons_done>0`), delivery rate 30h, Android,
      iOS.
- [x] `components/charts/user-growth-chart.tsx` — Recharts tren pengguna baru 7
      hari (tema-aware).
- [x] Tabel "Notifikasi terbaru" pakai **DataTable** (ringkas, client).
- [x] `app/(dashboard)/loading.tsx` — Skeleton menyerupai layout.

## Definition of Done
- Angka dihitung via agregasi (bukan fetch massal); render < 2 detik pada
  ribuan baris.
- Grafik & tabel tampil benar di light/dark.
- Skeleton muncul saat navigasi.

## Selanjutnya
→ [Phase 08 — Analitik Belajar](./phase-08-learning.md)
