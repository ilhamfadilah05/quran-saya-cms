# Phase 11 — Reminder (CRUD)

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 06](./phase-06-datatable.md).
> (Modul PRD F)

## Tujuan
CRUD `custom_reminders` (dikirim harian ke user reminder-on oleh cron).

## Checklist
- [x] `app/api/reminders/route.ts` — GET/POST/PATCH/DELETE:
  - [x] guard sesi admin.
  - [x] validasi `schedule_time` format `HH:MM`.
  - [x] POST set `is_active=true`; PATCH update `updated_at`.
- [x] `app/(dashboard)/reminders/page.tsx` — `Card` form tambah + **DataTable**
      daftar.
- [x] `components/forms/reminder-manager.tsx`:
  - [x] tambah (spinner "Menyimpan…", input disable).
  - [x] toggle aktif/nonaktif (loading per baris).
  - [x] hapus via `AlertDialog` konfirmasi (loading per baris).
  - [x] toast hasil; skeleton saat load daftar.

## Definition of Done
- Tambah/toggle/hapus berfungsi dengan loading per aksi.
- Validasi waktu bekerja; reminder nonaktif tak dikirim cron.
- Tabel ber-sort/filter.

## Selanjutnya
→ [Phase 12 — Adzan](./phase-12-adzan.md)
