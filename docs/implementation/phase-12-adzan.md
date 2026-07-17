# Phase 12 — Adzan

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 06](./phase-06-datatable.md).
> (Modul PRD G · CC3)

## Tujuan
Monitoring preferensi adzan per user (read-only fase awal).

## Checklist
- [x] Fetch server-side inline di `adzan/page.tsx` (SSR): filter kota (ilike),
      sort, pagination + `count:'exact'`. URL-sync di `adzan-table.tsx`. (PATCH
      edit = opsional, dilewati — read-only.)
- [x] `app/(dashboard)/adzan/page.tsx` — **DataTable**:
  - [x] kolom: kota + 6 waktu (imsak/subuh/dzuhur/ashar/maghrib/isya, tampil
        jam bila aktif) + user (ringkas).
  - [x] filter kota, sorting, pagination server-side.

## Definition of Done
- Data adzan tampil dengan filter/sort/pagination; rapi di light/dark.

## Selanjutnya
→ [Phase 13 — Log Notifikasi](./phase-13-logs.md)
