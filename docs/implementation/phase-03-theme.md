# Phase 03 — Fondasi Tema & Desain (Light/Dark)

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 00](./phase-00-setup.md).
> Acuan: [Design System](../02-design-system.md). (Memenuhi CC1, CC2)

## Tujuan
Token tema light+dark, font Plus Jakarta Sans, toggle tema, komponen shadcn
dasar.

## Checklist
- [x] `app/globals.css` — direktif Tailwind + **token light** (`:root`) &
      **token dark** (`.dark`) sesuai Design System §3.
- [x] Font **Plus Jakarta Sans** via `next/font/google` di `app/layout.tsx`
      (`--font-sans`) + map ke `tailwind.config`.
- [x] Integrasi **next-themes**: `ThemeProvider` (`attribute="class"`,
      `defaultTheme="system"`, `enableSystem`) membungkus `body`
      (+ `suppressHydrationWarning`).
- [x] Komponen `components/layout/theme-toggle.tsx` (`DropdownMenu`:
      Light/Dark/System, ikon lucide).
- [x] `Toaster` (sonner) di root layout.
- [x] Tarik komponen shadcn inti: `button, card, input, textarea, label, select,
      checkbox, switch, badge, dropdown-menu, dialog, alert-dialog, sheet,
      table, tabs, tooltip, skeleton, avatar, popover, command, separator`.
- [x] Verifikasi kontras AA light & dark pada komponen dasar.

## Definition of Done
- Toggle tema bekerja (light/dark/system), **tanpa flash** saat load.
- Komponen shadcn tampil benar di kedua tema.

## Selanjutnya
→ [Phase 04 — App Shell](./phase-04-shell.md)
