# Quran Saya CMS — Dokumentasi

Dokumentasi lengkap untuk membangun **Quran Saya CMS**: panel admin untuk
**mengelola (manage)** dan **memantau (monitor)** aplikasi Quran Saya.

## Daftar Dokumen

| # | Dokumen | Isi |
|---|---------|-----|
| 00 | [Analisa Aplikasi](./00-app-analysis.md) | Analisa menyeluruh fitur & arsitektur `quran-saya-apps` (sumber kebutuhan CMS) |
| 01 | [PRD](./01-prd.md) | Product Requirements Document: tujuan, persona, fitur, user stories, acceptance criteria, scope |
| 02 | [Design System](./02-design-system.md) | Sistem desain UI/UX: prinsip, warna, tipografi, komponen, pola halaman |
| 03 | [Database Architecture](./03-database-architecture.md) | Skema Supabase, tabel, kolom, relasi, indeks, RLS, migrasi |
| 04 | [System Architecture](./04-system-architecture.md) | Arsitektur teknis: stack, komponen, alur data, notifikasi, cron, keamanan, deployment |
| 05 | [Implementation Plan](./implementation/README.md) | Rencana implementasi **1 fase = 1 file** (Phase 00–17) dengan **checklist** progres |

## Ringkasan Cepat

- **App**: Flutter, offline-first, untuk Muslim Indonesia (v1.0.007). Menyimpan
  data ke SQLite lokal, dan **menulis subset ke Supabase** (perangkat + progres
  belajar) untuk keperluan notifikasi & analitik.
- **CMS**: Next.js 15 (App Router) + **Tailwind + shadcn/ui** + **next-themes
  (light/dark)** + **@tanstack/react-table** (DataTable standar: filter +
  sorting + pagination) + Supabase (service-role) + Firebase Cloud Messaging
  (FCM v1). Font **Plus Jakarta Sans**. Read/write ke Supabase yang sama,
  mengirim push ke `users.token_firebase`.
- **Prinsip kunci**: CMS **tidak boleh merusak** kontrak backend app yang sudah
  live (skema `users` & `adzan_notification`, RLS).

## Status

Dokumen ini adalah **blueprint untuk membangun ulang** CMS. Implementasi kode
belum ada di folder ini (hanya `.env` & `.gitignore`).
