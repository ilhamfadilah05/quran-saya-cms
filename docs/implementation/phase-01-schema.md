# Phase 01 — Skema Supabase

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 00](./phase-00-setup.md).
> Detail DDL: [Database Architecture](../03-database-architecture.md).

## Tujuan
DB Supabase siap **tanpa merusak app live** (skema idempoten, RLS tak diubah).

## Checklist
- [x] Tulis `supabase/schema.sql` **idempoten**:
  - [x] `users` — `create if not exists` + `add column if not exists` + indeks
        (`is_reminder`, `device_id`, `last_opened_at`, `learning_last_active_at`).
  - [x] `adzan_notification` — idem + indeks `user_id`.
  - [x] `admin` (email unique, `password_hash`, `is_active`, `last_login_at`).
  - [x] `custom_reminders` (+ indeks aktif).
  - [x] `notification_logs` (+ indeks `created_at`,`status`, **unique partial**
        `dedupe_key`).
  - [x] RPC `admin_login` (bcrypt via `extensions.crypt`, `security definer`).
  - [x] Seed reminder default (`where not exists`).
- [x] Template pembuatan admin: `supabase/create-first-admin.sql`.
- [ ] **(AKSI USER)** Jalankan `schema.sql` di Supabase SQL editor — pastikan
      **tanpa error** & data lama utuh.
- [ ] **(AKSI USER)** Buat **admin pertama** (`create-first-admin.sql`, ganti
      email & password kuat).
- [ ] **(AKSI USER)** Konfirmasi **RLS `users`/`adzan_notification` TIDAK
      diubah** (app tetap menulis via anon key).

## Definition of Done
- Semua tabel & RPC ada di Supabase.
- Admin pertama bisa di-`select`.
- App live tidak terganggu (uji tulis dari app masih berhasil).

## Selanjutnya
→ [Phase 02 — Core Lib](./phase-02-core-lib.md)
