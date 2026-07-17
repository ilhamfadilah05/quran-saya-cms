# Phase 13 — Log Notifikasi

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 06](./phase-06-datatable.md).
> (Modul PRD H · CC3)

## Tujuan
Audit pengiriman notifikasi dengan DataTable + faceted filter.

## Checklist
- [x] Fetch server-side inline di `logs/page.tsx` (SSR): filter `source_type` &
      `status`, search `title` (ilike), sort waktu, pagination + `count:'exact'`.
      URL-sync di `logs-table.tsx`.
- [x] `components/tables/logs-columns.tsx` — `ColumnDef[]` (waktu, jenis,
      kategori, judul, status badge, error).
- [x] `app/(dashboard)/logs/page.tsx` — **DataTable**:
  - [x] **faceted filter**: jenis (adzan/reminder/manual/winback) & status
        (sent/failed/queued/partial).
  - [x] search judul, sort `created_at desc`, pagination server-side.
  - [x] badge status berwarna.

## Definition of Done
- Audit lengkap; faceted filter + search + pagination server-side bekerja.

## Selanjutnya
→ [Phase 14 — Cron](./phase-14-cron.md)
