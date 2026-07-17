# 02 — Design System: Quran Saya CMS

Sistem desain untuk UI CMS yang **modern, premium, dan sangat mengutamakan
UI/UX**. Mendukung **Light & Dark mode**, dibangun di atas **shadcn/ui** +
**Tailwind CSS**, dengan font **Plus Jakarta Sans**.

---

## 1. Prinsip Desain

1. **Premium tapi fungsional** — tampilan admin kelas produk SaaS: bersih,
   berjarak enak, hirarki jelas. Data tetap raja.
2. **Dual theme** — Light & Dark, dapat di-toggle, mengikuti preferensi sistem
   secara default. Semua warna via token (tidak ada hardcode).
3. **Umpan balik selalu ada** — setiap proses punya **loading state**; setiap
   aksi punya hasil/konfirmasi (toast).
4. **Tabel = kelas satu** — semua tabel data **wajib** punya
   **filter + sorting + pagination** (terstandardisasi, lihat §9).
5. **Konsisten & dapat diakses** — komponen dari satu pustaka (shadcn/ui),
   patuh WCAG AA, navigasi keyboard.
6. **Bahasa Indonesia**, ramah & lugas.

## 2. Stack UI (Keputusan)

| Kebutuhan | Pilihan | Alasan |
|-----------|---------|--------|
| Komponen | **shadcn/ui** (Radix UI + Tailwind) | Standar de-facto Next.js, dapat di-*copy-in* & dikustom, theming via CSS variable, dark mode kelas satu, aksesibel (Radix) |
| CSS | **Tailwind CSS** | Utility-first, dibutuhkan shadcn, konsisten |
| Theming/dark mode | **next-themes** | Toggle light/dark (+system) via class strategy |
| Tabel data | **@tanstack/react-table** | Mesin sorting/filter/pagination headless (dipakai contoh DataTable shadcn) |
| Ikon | **lucide-react** | Set ikon rapi, selaras shadcn |
| Grafik | **Recharts** (via shadcn Charts) | KPI & tren, terintegrasi tema |
| Notifikasi in-app | **sonner** (toast) | Umpan balik aksi (kirim, simpan, error) |
| Font | **Plus Jakarta Sans** (`next/font`) | Modern, geometris, ramah angka |

> **Alternatif**: RizzUI atau Mantine bila tim lebih nyaman. Dokumen ini memakai
> **shadcn/ui** sebagai acuan utama karena fleksibilitas theming & DataTable.

## 3. Tema & Token Warna

Menggunakan konvensi token shadcn (HSL, CSS variable) dengan override `.dark`.
Brand: **hijau islami** (primary) + **emas** (aksen).

### 3.1. Token semantik (dipakai komponen)
`--background, --foreground, --card, --card-foreground, --popover, --muted,
--muted-foreground, --border, --input, --ring, --primary,
--primary-foreground, --secondary, --accent, --destructive, --success,
--warning, --chart-1..5, --radius`.

### 3.2. Light
| Token | Nilai (contoh) |
|-------|----------------|
| `--background` | `#f6f8fa` |
| `--card` | `#ffffff` |
| `--foreground` | `#0f1b26` |
| `--muted` | `#eef2f6` |
| `--muted-foreground` | `#64748b` |
| `--border` | `#e3e9f0` |
| `--primary` | `#12965d` (hijau) |
| `--primary-foreground` | `#ffffff` |
| `--accent`/emas | `#c9922a` |
| `--destructive` | `#dc4a4f` |
| `--success` | `#16a866` |
| `--warning` | `#d99a2b` |
| `--ring` | `#12965d` |
| `--radius` | `0.9rem` |

### 3.3. Dark
| Token | Nilai (contoh) |
|-------|----------------|
| `--background` | `#0b1016` |
| `--card` | `#111823` |
| `--foreground` | `#e8eef4` |
| `--muted` | `#18222e` |
| `--muted-foreground` | `#93a3b5` |
| `--border` | `#20303f` |
| `--primary` | `#22c07a` |
| `--primary-foreground` | `#04120a` |
| `--accent`/emas | `#e5b64b` |
| `--destructive` | `#f2555a` |
| `--success` | `#22c07a` |
| `--warning` | `#e5b64b` |

### 3.4. Chart palette (5 warna, konsisten kedua tema)
Hijau (primary), emas, biru, ungu, teal — dipakai untuk KPI accent & grafik.

## 4. Tipografi

- **Font**: **Plus Jakarta Sans** (`next/font/google`, self-hosted, `--font-sans`).
- Skala (Tailwind):
  | Elemen | Kelas | Ukuran/Bobot |
  |--------|-------|--------------|
  | Judul halaman | `text-2xl font-extrabold tracking-tight` | 24/800 |
  | Angka KPI | `text-3xl font-extrabold tracking-tight` | 30/800 |
  | Judul kartu | `text-sm font-semibold` | 14/600 |
  | Body | `text-sm` | 14/400 |
  | Meta/small | `text-xs text-muted-foreground` | 12/400 |
  | Header tabel | `text-xs font-medium uppercase tracking-wide` | 12/500 |

## 5. Spasi, Radius, Elevasi

- **Radius**: `--radius: 0.9rem` (kartu), tombol/input `rounded-md/lg`, badge `rounded-full`.
- **Spasi**: konten `p-6/8`, gap grid `gap-4/6`, padding kartu `p-5`.
- **Elevasi**: kartu `shadow-sm` (light) / border lebih terlihat (dark). Hindari
  bayangan berat.

## 6. Layout Aplikasi

### 6.1. Struktur
```
┌──────────────────────────────────────────────┐
│  Sidebar (collapsible)  │      Topbar         │
│  - brand + collapse     ├─────────────────────┤
│  - grup nav (ikon+teks) │   Konten halaman    │
│  - theme toggle         │   (max-w, tengah)   │
│  - menu admin           │                     │
└──────────────────────────────────────────────┘
```

### 6.2. Sidebar (premium)
- **Collapsible** (lebar 260px ↔ 72px ikon-only), state tersimpan.
- Brand: logo chip gradient hijau (☪️) + wordmark; tombol collapse.
- **Grup**: `Monitoring` (Dashboard, Analitik Belajar, Pengguna, Log) &
  `Manajemen` (Kirim Notifikasi, Reminder, Adzan).
- Item: ikon **lucide** + label; state aktif = latar `--primary/10` + teks
  `--primary` + indikator kiri.
- Tooltip saat mode ikon-only.
- Responsif: di layar kecil jadi **drawer** (Sheet shadcn) yang dibuka tombol
  hamburger di topbar.

### 6.3. Topbar
- Breadcrumb / judul halaman.
- **Command palette** (`⌘K`) untuk pindah halaman cepat (nice-to-have).
- **Theme toggle** (Light/Dark/System) — `DropdownMenu`.
- **Menu admin**: avatar + email → Profil / Keluar.

## 7. Inventaris Komponen (shadcn/ui)

Gunakan komponen berikut (jangan bikin dari nol):

| Kebutuhan | Komponen shadcn |
|-----------|-----------------|
| Kartu | `Card` |
| Tombol | `Button` (variant: default/secondary/ghost/destructive/outline) |
| Input/area | `Input`, `Textarea`, `Label` |
| Pilihan | `Select`, `Checkbox`, `Switch`, `RadioGroup` |
| Dialog/konfirmasi | `Dialog`, `AlertDialog` |
| Drawer mobile | `Sheet` |
| Menu | `DropdownMenu`, `Popover`, `Command` (palette) |
| Tabel | `Table` + **`DataTable`** (tanstack) — lihat §9 |
| Status | `Badge` (variant status), `Tooltip` |
| Umpan balik | `Sonner` (toast), `Skeleton` (loading) |
| Tab | `Tabs` (mis. filter jenis log) |
| Grafik | shadcn **Chart** (Recharts) |
| Avatar | `Avatar` |

### KPI Card (pola)
`Card` berisi: chip ikon berwarna (accent) → angka besar → label → delta/sub.

### Badge status
`sent` = hijau, `failed` = merah (destructive), `queued/partial` = emas
(warning). Selalu dengan teks + titik warna.

## 8. Pola Status (State Patterns) — WAJIB di setiap fitur

| State | Pola |
|-------|------|
| **Loading (navigasi)** | `loading.tsx` per-segmen → **Skeleton** menyerupai layout (bukan spinner kosong) |
| **Loading (aksi)** | Tombol `disabled` + spinner + label ("Menyimpan…/Mengirim…"); cegah double-submit |
| **Empty** | Ilustrasi/ikon + teks ramah + CTA bila relevan |
| **Error** | `Alert` destructive / toast error dengan pesan jelas |
| **Success** | **Toast** (sonner) ringkas ("Terkirim 120/130 penerima") |

## 9. STANDAR TABEL / DATAGRID (WAJIB) ⭐

**Setiap halaman yang menampilkan tabel data** (Pengguna, Log Notifikasi,
Adzan, daftar Reminder, Top Pembelajar) **harus** memakai komponen **DataTable**
bersama dengan fitur berikut. Ini **standarisasi**, bukan opsional.

### 9.1. Fitur wajib
1. **Sorting** — klik header kolom untuk urut asc/desc (indikator panah). Kolom
   yang dapat diurutkan ditandai.
2. **Filter**
   - **Global search** (kotak cari di atas tabel).
   - **Filter per kolom** yang relevan: dropdown/faceted filter (mis. Log:
     jenis & status; Pengguna: platform & reminder; Adzan: kota).
   - Chip filter aktif + tombol "Reset".
3. **Pagination**
   - Kontrol: **prev/next**, **nomor halaman**, **info "Menampilkan X–Y dari
     N"**, dan **pemilih ukuran halaman** (10/25/50/100).
   - Default **server-side pagination** untuk tabel besar (Pengguna, Log) via
     Supabase `range()` + `count`. Tabel kecil boleh client-side.
4. **Kolom**
   - **Column visibility** (toggle tampil/sembunyi kolom) via `DropdownMenu`.
   - Lebar & alignment konsisten; kolom aksi di kanan.
5. **Row actions** — menu `⋯` (DropdownMenu) untuk aksi baris (mis. Lihat
   detail, Kirim ke user).
6. **State** — Skeleton saat loading; empty state; sticky header; hover baris.
7. **(Opsional) Export CSV** & **selection** (checkbox) untuk aksi massal.

### 9.2. Implementasi acuan
- Basis: **`@tanstack/react-table`** + pola **DataTable** shadcn.
- Definisi kolom (`ColumnDef[]`) per halaman, komponen `DataTable` generik yang
  menerima `columns`, `data`, konfigurasi filter, dan mode pagination
  (server/client).
- Untuk server-side: query param URL (`?page=&size=&sort=&q=&<filter>=`) →
  Supabase `.order()`, `.range()`, `.ilike()`/`.eq()`, `.select(count:'exact')`.

### 9.3. Contoh penerapan per halaman
| Halaman | Global search | Filter kolom | Sort default | Pagination |
|---------|---------------|--------------|--------------|------------|
| Pengguna | device/nama | platform, reminder, punya-token | `created_at desc` | server |
| Log Notifikasi | judul | jenis, status | `created_at desc` | server |
| Adzan | kota/user | kota, waktu aktif | `created_at desc` | server |
| Reminder | judul | is_active | `schedule_time asc` | client |
| Top Pembelajar | nama | — | `xp desc` | client (limit 10–50) |

## 10. Halaman-Halaman (Page Patterns)

| Halaman | Pola |
|---------|------|
| Login | Kartu tengah, logo besar, judul+subjudul, input, tombol dengan spinner, latar gradient + toggle tema |
| Dashboard | Baris KPI (4) + (2) + grid: grafik tren (Recharts) & tabel notif terbaru (DataTable ringkas) |
| Analitik Belajar | KPI (4) + 2 chart (distribusi level/streak) + DataTable Top Pembelajar |
| Pengguna | **DataTable** penuh (filter/sort/pagination) + row action "Detail" |
| Detail Pengguna | `Tabs` (Perangkat / Belajar / Adzan / Riwayat) atau grid kartu + DataTable riwayat |
| Kirim Notifikasi | 2 kolom: `Card` pesan + `Card` segmen (Select/Switch/Input) + panel kontrol cron; toast hasil |
| Reminder | `Card` form + **DataTable** daftar (aksi toggle/hapus dengan `AlertDialog`) |
| Adzan | **DataTable** per user |
| Log | Tabs jenis + **DataTable** dengan faceted filter status |

## 11. Aksesibilitas & Kualitas

- Kontras AA di kedua tema; jangan andalkan warna saja (badge punya teks).
- Fokus keyboard terlihat (`--ring`); komponen Radix sudah aksesibel.
- Semua tombol ikon punya `aria-label`.
- Waktu format lokal `id-ID`; angka diformat rapi.
- Animasi halus & singkat (transisi tema, hover), hormati `prefers-reduced-motion`.

## 12. Ringkasan Keputusan Desain (untuk implementasi)

- Tailwind + **shadcn/ui** + **next-themes** (light/dark/system).
- **Plus Jakarta Sans** via `next/font`.
- **DataTable** standar (tanstack) dengan **filter + sorting + pagination** di
  semua tabel — **wajib**.
- Sidebar collapsible premium + topbar (theme toggle, command palette, menu
  admin).
- Toast (sonner) untuk hasil aksi; Skeleton untuk loading.
- Detail struktur berkas & dependency di
  [System Architecture](./04-system-architecture.md).
