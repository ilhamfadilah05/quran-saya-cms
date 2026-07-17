# 01 — PRD: Quran Saya CMS

**Product Requirements Document**
Versi 1.0 · Status: Draft untuk implementasi

---

## 1. Latar Belakang & Masalah

Aplikasi Quran Saya sudah live dengan basis pengguna yang tumbuh dan fitur
gamifikasi "Belajar Ngaji" yang mendorong retensi. Namun tim **tidak memiliki
alat untuk**:

- Memantau kesehatan produk (jumlah pengguna, aktif, versi, platform).
- Melihat efektivitas fitur Belajar (progres, streak, retensi).
- Mengirim notifikasi (broadcast, terjadwal, atau re-engagement bertarget).
- Mengelola pengingat harian tanpa deploy ulang app.
- Mengaudit pengiriman notifikasi (terkirim/gagal).

Data perangkat & progres belajar sudah mengalir ke Supabase (lihat
[Analisa App §6](./00-app-analysis.md)), tapi **belum dimanfaatkan**.

## 2. Tujuan Produk (Goals)

| # | Tujuan | Metrik keberhasilan |
|---|--------|---------------------|
| G1 | Visibilitas kesehatan produk | Dashboard KPI real-time dapat diakses admin |
| G2 | Mendorong retensi via notifikasi bertarget | Win-back cron & broadcast tersegmen berjalan |
| G3 | Mengukur fitur Belajar | Halaman analitik menampilkan distribusi level/streak & retensi |
| G4 | Operasional notifikasi tanpa deploy | CRUD reminder & broadcast dari CMS |
| G5 | Akuntabilitas | Semua notifikasi tercatat & bisa diaudit |

## 3. Non-Goals (di luar cakupan)

- **Bukan** tempat mengelola konten Al-Qur'an/tafsir/belajar (konten di-*bundle*
  di app / diambil dari API pihak ketiga).
- **Bukan** aplikasi analitik umum (gunakan Firebase Analytics untuk event
  granular).
- **Tidak** mengubah skema `users`/`adzan_notification` atau RLS yang app
  andalkan.
- **Tidak** ada fitur sosial/leaderboard publik yang menyentuh privasi user.
- **Tidak** menyimpan PII sensitif baru; hanya data perangkat yang sudah ada.

## 4. Persona & Peran

| Persona | Kebutuhan |
|---------|-----------|
| **Admin/Owner** | Melihat kesehatan produk, kirim pengumuman, atur reminder, pantau Belajar |
| **Operator notifikasi** | Menyusun & mengirim broadcast bertarget, kelola jadwal |
| **(Sistem) Cron worker** | Menjalankan adzan/reminder/win-back otomatis |

> Untuk fase awal cukup **satu peran admin** (semua akses). RBAC granular = masa
> depan.

## 5. Prinsip & Batasan (Constraints)

1. **Jangan rusak app live** — skema & RLS `users`/`adzan_notification` tetap.
2. **Service-role key hanya di server** — tak pernah ke browser.
3. **Idempoten & aman** — skrip skema aman dijalankan di DB produksi.
4. **Dedupe notifikasi** — tidak mengirim ganda ke user yang sama.
5. **Bahasa Indonesia** untuk UI.
6. **Offline-first app tidak terpengaruh** — CMS opsional bagi app.

## 5b. Standar Lintas-Fitur (Cross-cutting Requirements)

Berlaku untuk **semua** modul. Detail visual di
[Design System](./02-design-system.md).

- **CC1 — Dual theme**: UI wajib mendukung **Light & Dark mode** (toggle,
  default ikut sistem), semua warna via token tema.
- **CC2 — Pustaka komponen**: gunakan **shadcn/ui** (Tailwind + Radix) sebagai
  basis komponen (boleh RizzUI/lainnya sebagai alternatif). Tidak membangun
  komponen dasar dari nol.
- **CC3 — Standar Tabel/Datagrid (WAJIB)**: setiap tabel data **harus** memiliki
  **filter** (global search + filter kolom relevan), **sorting** (klik header),
  dan **pagination** (prev/next, nomor halaman, info "X–Y dari N", pemilih ukuran
  halaman). Untuk tabel besar (`users`, `notification_logs`) → **server-side**.
  Terstandardisasi via komponen `DataTable` (@tanstack/react-table).
- **CC4 — Loading state**: setiap proses/navigasi menampilkan loading (Skeleton
  untuk halaman, spinner+label untuk aksi); tombol di-disable saat proses.
- **CC5 — Umpan balik**: hasil aksi lewat **toast** (sukses/gagal) + konfirmasi
  (`AlertDialog`) untuk aksi destruktif.
- **CC6 — Navbar/Sidebar premium**: sidebar collapsible bergrup + topbar (theme
  toggle, menu admin, command palette opsional); responsif (drawer di mobile).
- **CC7 — Aksesibilitas**: kontras AA di kedua tema, fokus keyboard, label pada
  tombol ikon.

## 6. Cakupan Fitur (Scope)

### MODUL A — Autentikasi Admin
Login email+password (bcrypt di Supabase), sesi cookie HMAC (TTL 7 hari),
logout. Semua halaman & API admin wajib sesi.

**User stories**
- Sebagai admin, saya login agar hanya saya yang mengakses CMS.
- Sebagai admin, sesi saya otomatis kedaluwarsa demi keamanan.

**Acceptance criteria**
- [ ] Login salah → pesan error, tidak membuat sesi.
- [ ] Login benar → cookie httpOnly di-set, redirect ke dashboard.
- [ ] Akses halaman tanpa sesi → redirect ke `/login`.
- [ ] `last_login_at` admin ter-update.

---

### MODUL B — Dashboard (Monitoring)
KPI ringkas + tren.

**Konten**
- KPI: total pengguna, punya token, aktif 7 hari (`last_opened_at`), reminder
  aktif, pembelajar (`learning_lessons_done > 0`).
- Delivery rate 30 hari (sent / (sent+failed)).
- Distribusi platform (Android/iOS).
- Grafik pengguna baru 7 hari (bucket `created_at`).
- 10 notifikasi terbaru.

**Acceptance criteria**
- [ ] Semua angka dihitung via `count`/agregasi Supabase (bukan fetch massal).
- [ ] Halaman render < 2 detik pada data ribuan baris.
- [ ] Menampilkan skeleton/loading saat memuat.

---

### MODUL C — Analitik Belajar (Monitoring)
Mengukur fitur hero.

**Konten**
- KPI: total pembelajar, aktif 7 hari (`learning_last_active_at`), streak ≥ 7,
  **streak berisiko** (streak≥3 & aktif kemarin, belum hari ini).
- Distribusi **level** (bucket) & **streak** (bucket).
- Top 10 pembelajar (by XP).
- Catatan: jumlah "pasang >2 hari tapi belum mulai" (kandidat ajakan).

**Acceptance criteria**
- [ ] Bucket dihitung via count query per rentang.
- [ ] Segmen "streak berisiko" konsisten dengan definisi win-back.

---

### MODUL D — Pengguna (Monitoring)
Daftar + detail per perangkat.

**Konten**
- Daftar 300 terbaru: terdaftar, platform, versi, reminder, punya token,
  terakhir buka, ringkasan belajar. Link ke detail.
- Detail: perangkat (platform/versi/device/reminder/token/terdaftar/terakhir
  buka/ayat terakhir), belajar (nama/level/xp/streak/rekor/lesson/terakhir
  aktif), adzan (kota + waktu aktif), riwayat notifikasi user.

**Acceptance criteria**
- [ ] Daftar memakai **DataTable** dengan **filter** (search device/nama;
      filter platform, reminder, punya-token), **sorting** kolom, dan
      **pagination server-side** (CC3).
- [ ] Detail dapat diakses via `/users/{id}`.
- [ ] Riwayat notifikasi difilter `user_id`.

---

### MODUL E — Kirim Notifikasi (Management)
Broadcast **bertarget** + preview jumlah.

**Segmen (AND-kombinasi)**
- Hanya `is_reminder=true`.
- Platform (Android/iOS).
- Versi app tepat.
- Min. level / min. streak belajar.
- Vakum ≥ N hari (`last_opened_at`).
- Belum pernah mulai belajar (`learning_lessons_done=0`).

**Alur**
1. Admin isi judul + isi.
2. Pilih segmen → **"Cek jumlah penerima"** (dry-run, hanya hitung).
3. **"Kirim"** → konfirmasi → FCM ke semua token segmen → catat ke
   `notification_logs` (source `manual`).

**Acceptance criteria**
- [ ] "Cek jumlah" tidak mengirim apa pun.
- [ ] Setiap pengiriman punya loading state & konfirmasi.
- [ ] Hasil: jumlah terkirim/gagal ditampilkan.
- [ ] Semua entri tercatat di log.

---

### MODUL F — Reminder Terjadwal (Management)
CRUD `custom_reminders` (dikirim harian ke user reminder-on oleh cron).

**Field**: `title, body, schedule_time (HH:MM), is_active, sort_order`.

**Acceptance criteria**
- [ ] Tambah/aktif-nonaktif/hapus dengan loading state per aksi.
- [ ] Validasi `schedule_time` format `HH:MM`.
- [ ] Reminder nonaktif tidak dikirim cron.

---

### MODUL G — Adzan (Monitoring)
Tabel preferensi adzan per user (kota + waktu aktif). Read-only fase awal
(app yang mengatur). **DataTable** dengan filter (kota), sorting, pagination
server-side (CC3).

---

### MODUL H — Log Notifikasi (Monitoring)
Audit `notification_logs`: waktu, jenis (adzan/reminder/manual/winback),
kategori, judul, status, error.

**Acceptance criteria**
- [ ] **DataTable** dengan **faceted filter** (jenis & status), **search**
      (judul), **sorting** (waktu), **pagination server-side** (CC3).

---

### MODUL I — Cron (Management/Sistem)
Endpoint yang dipicu tiap 1 menit oleh scheduler/worker eksternal.

- **Adzan** — kirim ke user yang waktu sholatnya cocok `HH:MM`.
- **Reminder** — kirim `custom_reminders` aktif pada `schedule_time`.
- **Win-back** — sekali/hari pada `WINBACK_TIME`; segmen: streak-at-risk,
  vakum ≥3 hari, belum-mulai ≥2 hari. Satu pesan/user/hari.
- Semua **dedupe** via `notification_logs.dedupe_key`.
- Auth cron: sesi admin **atau** header `x-cron-secret`.
- Tombol manual di CMS untuk memicu tiap job (win-back punya mode `force`).

**Acceptance criteria**
- [ ] Menjalankan cron dua kali di menit sama tidak mengirim ganda (dedupe).
- [ ] Win-back di luar `WINBACK_TIME` → skip (kecuali `force`).

## 7. Prioritas / Fase

| Fase | Modul | Alasan |
|------|-------|--------|
| P0 (MVP inti) | A, B, D, E, F, I(reminder+adzan) | Login, lihat, kirim, jadwal |
| P1 | C, H, I(winback) | Analitik & retensi |
| P2 | G (edit adzan), template & campaign, RBAC | Penyempurnaan |

> Catatan: implementasi terakhir dibangun **lengkap sekaligus** (A–I). Fase di
> atas untuk panduan jika dibangun bertahap.

## 8. Metrik Keberhasilan Produk

- Admin dapat melihat KPI harian tanpa query manual DB.
- Win-back cron mengirim ke segmen at-risk setiap hari.
- ≥ 95% notifikasi tercatat statusnya (sent/failed).
- Broadcast bertarget dapat "cek jumlah" sebelum kirim (mengurangi salah kirim).

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Merusak app live via skema/RLS | Skrip idempoten, tidak menyentuh RLS |
| Bocor service-role key | Hanya di server; `.env` gitignored |
| Token FCM mati menggelembungkan "sent" | Catat `failed`; roadmap: pembersihan token |
| Kirim ganda | Dedupe `dedupe_key` unik |
| Overload notifikasi user | Win-back 1×/hari/user; segmen ketat |

## 10. Pertanyaan Terbuka

- Perlukah RBAC multi-admin sejak awal? (default: tidak, satu peran)
- Perlukah pembersihan token FCM otomatis? (roadmap P2)
- Perlukah template & campaign terjadwal? (roadmap P2)
