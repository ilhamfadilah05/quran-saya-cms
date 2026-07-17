# Phase 06 — Komponen DataTable Standar ⭐

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 03](./phase-03-theme.md).
> Acuan: [Design System §9](../02-design-system.md). (Memenuhi CC3)

## Tujuan
Satu komponen **reusable** yang WAJIB dipakai semua tabel data, dengan
**filter + sorting + pagination** terstandardisasi.

## Checklist
- [x] `components/data-table/data-table.tsx` — generik
      `@tanstack/react-table`, terima `columns`, `data`, opsi (mode
      server/client, `pageCount`/`total`, state pagination/sort/filter).
- [x] `components/data-table/data-table-toolbar.tsx` — **global search** + slot
      **faceted filters** + tombol **Reset** + **column visibility**
      (`DropdownMenu`).
- [x] `components/data-table/data-table-faceted-filter.tsx` — filter kolom
      (multi-select `Popover`+`Command`).
- [x] `components/data-table/data-table-pagination.tsx` — prev/next, nomor
      halaman, **"X–Y dari N"**, **pemilih ukuran halaman** (10/25/50/100).
- [x] `components/data-table/data-table-column-header.tsx` — header **sortable**
      (indikator asc/desc/none).
- [x] Dukungan **server-side**: DataTable mendukung `manual` mode (controlled
      pagination/sorting/globalFilter + `pageCount`/`rowCount`). Util sinkron
      state ↔ URL query dibuat saat dipakai di **Phase 09** (Pengguna).
- [x] State: **Skeleton** loading, empty state, sticky header, hover baris.
- [ ] (Opsional) selection checkbox + export CSV — dilewati untuk sekarang.
- [x] Halaman demo/dummy untuk verifikasi.

## Definition of Done
- DataTable demo menunjukkan: sorting, global search, faceted filter, pagination
  (server & client), column visibility, reset, skeleton — semuanya bekerja di
  light & dark.

## Selanjutnya
→ [Phase 07 — Dashboard](./phase-07-dashboard.md)
