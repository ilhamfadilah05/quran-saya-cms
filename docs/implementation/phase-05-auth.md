# Phase 05 — Autentikasi Admin

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 02](./phase-02-core-lib.md),
> [Phase 03](./phase-03-theme.md). (Modul PRD A)

## Tujuan
Login/logout admin dengan sesi cookie HMAC; halaman terproteksi.

## Checklist
- [x] `app/api/auth/login/route.ts` — RPC `admin_login`, set cookie **httpOnly**
      (`secure` di produksi, TTL 7 hari), update `last_login_at`.
- [x] `app/api/auth/logout/route.ts` — hapus cookie.
- [x] `app/(auth)/login/page.tsx` — redirect ke `/` bila sudah login; render
      `LoginForm`.
- [x] `components/forms/login-form.tsx` — kartu login premium (logo besar, judul,
      subjudul, input email/password), tombol dengan **spinner + label**,
      error via `Alert`/toast, input **disable saat proses**.

## Definition of Done
- Login benar → redirect dashboard; salah → pesan error, tak buat sesi.
- Akses halaman dashboard tanpa sesi → redirect `/login`.
- Logout menghapus sesi.
- Tampil rapi di light & dark.

## Selanjutnya
→ [Phase 06 — DataTable Standar](./phase-06-datatable.md)
