# Phase 04 — App Shell (Sidebar/Topbar Premium)

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 03](./phase-03-theme.md),
> [Phase 02](./phase-02-core-lib.md). (Memenuhi CC6)

## Tujuan
Kerangka konsisten (sidebar + topbar) yang persisten antar-navigasi + gerbang
auth.

## Checklist
- [x] Route group `app/(dashboard)/layout.tsx` + shell (persisten). Saat ini
      pakai **sesi lunak** (`getAdminSession`); **gate keras**
      `requireAdminPageSession()` (redirect `/login`) diaktifkan di **Phase 05**
      agar shell bisa diverifikasi sebelum login ada.
- [x] `components/layout/nav-config.ts` — sumber tunggal menu (grup + ikon).
- [x] `components/layout/sidebar.tsx` — **collapsible** (260↔72px, state
      tersimpan), brand chip gradient (☪️), grup **Monitoring**/**Manajemen**
      dengan ikon lucide, active state + indikator kiri, tooltip saat collapsed.
- [x] `components/layout/topbar.tsx` — judul/breadcrumb, **ThemeToggle**,
      **menu admin** (Avatar → email, Keluar), tombol hamburger (mobile).
- [x] Mobile: sidebar jadi **Sheet** (drawer) dari topbar.
- [ ] (Opsional) **Command palette** (`⌘K`, `Command`) — dilewati untuk sekarang.

## Definition of Done
- [x] Shell tampil di semua halaman dashboard; sidebar **persisten** saat pindah
  halaman (hanya konten berganti).
- [x] Responsif: drawer di layar kecil.
- [x] Auth gate → diaktifkan di Phase 05 (requireAdminPageSession) ✓.

## Selanjutnya
→ [Phase 05 — Autentikasi](./phase-05-auth.md)
