# Phase 10 — Kirim Notifikasi + Segmentasi

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 02](./phase-02-core-lib.md),
> [Phase 04](./phase-04-shell.md). (Modul PRD E)

## Tujuan
Broadcast **bertarget** dengan preview jumlah penerima (dry-run) + kontrol cron
manual.

## Checklist
- [x] `app/api/notifications/route.ts` — POST:
  - [x] `countOnly` (dry-run) → `fetchSegmentUsers` → kembalikan jumlah + deskripsi
        segmen (TIDAK mengirim).
  - [x] kirim → FCM ke semua token segmen → catat `notification_logs`
        (source `manual`, batch insert per 500).
- [x] `app/(dashboard)/notifications/page.tsx` — 2 kolom `Card` (Pesan | Segmen).
- [x] `components/forms/notification-composer.tsx`:
  - [x] input judul/isi.
  - [x] segmen: `Switch` reminder-only & belum-mulai; `Select` platform; input
        versi; `Input` min level/streak/vakum.
  - [x] tombol **"Cek jumlah"** (spinner "Menghitung…").
  - [x] tombol **"Kirim"** → `AlertDialog` konfirmasi → spinner "Mengirim…".
  - [x] hasil via **toast** (sukses/gagal), cegah double-submit.
- [x] `components/forms/cron-controls.tsx` — tombol manual (run/adzan/reminder/
      winback `force`) dgn spinner + ringkasan hasil.

## Definition of Done
- Dry-run tidak mengirim apa pun.
- Kirim menghasilkan ringkasan (terkirim/gagal) + entri log.
- Toast & konfirmasi berfungsi; tombol disable saat proses.

## Selanjutnya
→ [Phase 11 — Reminder](./phase-11-reminders.md)
