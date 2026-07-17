# Phase 15 — Polish UX

> [← Daftar Fase](./README.md) · Prasyarat: Phase 07–14.
> (Memenuhi CC4, CC5, CC7)

## Tujuan
Rapikan seluruh pengalaman: loading, umpan balik, empty/error, responsif, a11y.

## Checklist
- [x] `loading.tsx` per-segmen (Skeleton menyerupai konten, bukan spinner kosong).
      → `components/skeletons.tsx` (Header/Table/KpiRow/Card) + `loading.tsx`
      untuk users/logs/adzan/learning/notifications/reminders; dashboard sudah ada.
- [x] Semua aksi async: tombol **disable + spinner + label** (Menyimpan…/
      Mengirim…/Menjalankan…). → login, composer, cron-controls, reminder-manager.
- [x] **Toast** (sonner) untuk semua hasil aksi; `AlertDialog` untuk aksi
      destruktif. → send notification + delete reminder pakai AlertDialog.
- [x] **Empty state** ramah (ikon + teks + CTA bila relevan) di semua
      tabel/daftar. → `DataTable` `emptyText` di semua tabel.
- [x] **Error state** informatif (Alert/toast); halaman tidak "putih/blank".
      → `app/(dashboard)/error.tsx` (retry) + `app/not-found.tsx` (404).
- [x] **Responsif**: sidebar drawer, tabel scroll horizontal, grid adaptif.
      → AppShell Sheet drawer, DataTable `overflow-x-auto`, grid `sm/xl`.
- [x] **A11y**: `aria-label` tombol ikon, fokus terlihat (`--ring`), kontras AA
      light+dark. → tombol ikon ber-`aria-label`/`sr-only`, `--ring` aktif.
- [x] Transisi tema mulus (no flash); hormati `prefers-reduced-motion`.
      → `disableTransitionOnChange`, transisi warna body, media query reduce.

## Definition of Done
- 4 state (loading/empty/error/success) tertangani di **setiap** fitur.
- Mulus & konsisten di light & dark; nyaman di mobile.

## Selanjutnya
→ [Phase 16 — QA & Pengujian](./phase-16-qa.md)
