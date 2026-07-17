# Phase 09 — Pengguna (List + Detail)

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 06](./phase-06-datatable.md).
> (Modul PRD D · CC3)

## Tujuan
Daftar perangkat dengan DataTable server-side + halaman detail per user.

## Checklist
- [x] Fetch server-side untuk DataTable (inline di `users/page.tsx`, SSR — lebih
      efisien daripada route terpisah): `page,size,sort,q,platform,reminder,
      hasToken` → Supabase `.or(ilike)`/`.eq()`/`.order()`/`.range()` +
      `count:'exact'`. URL-sync di `users-table.tsx` (mode `manual` DataTable).
- [x] `components/tables/users-columns.tsx` — `ColumnDef[]` (terdaftar, platform,
      versi, reminder, token, terakhir buka, ringkasan belajar, aksi).
- [x] `app/(dashboard)/users/page.tsx` — **DataTable server-side**:
  - [x] filter: platform, reminder, punya-token.
  - [x] global search (device/nama).
  - [x] sort default `created_at desc`.
  - [x] pagination server-side + pemilih ukuran.
  - [x] row action "Detail".
- [x] `app/(dashboard)/users/[id]/page.tsx` — detail: `Tabs`/kartu (Perangkat,
      Belajar, Adzan) + **DataTable** riwayat notifikasi user (`user_id`).

## Definition of Done
- Filter/sort/pagination bekerja **server-side**; performa baik ribuan baris.
- Detail lengkap; riwayat notifikasi terfilter user.

## Selanjutnya
→ [Phase 10 — Kirim Notifikasi](./phase-10-notifications.md)
