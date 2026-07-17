# 00 — Analisa Menyeluruh: Quran Saya Apps

Analisa ini menjadi **sumber kebutuhan** CMS. CMS hanya berguna bila memahami
apa yang app lakukan, data apa yang dihasilkan, dan bagaimana app terhubung ke
backend.

---

## 1. Ringkasan Produk

- **Nama**: Quran Saya (`quran-saya-apps`)
- **Versi**: 1.0.007+7
- **Platform**: Android & iOS (Flutter)
- **Target pengguna**: Muslim Indonesia
- **Filosofi**: **Offline-first** — seluruh konten Al-Qur'an, tafsir, jadwal
  sholat (per kota), dan konten belajar tersedia offline setelah unduh awal.
- **Distribusi**: live di Play Store & App Store (~puluhan perangkat aktif).

## 2. Stack Teknis Aplikasi

| Aspek | Teknologi |
|-------|-----------|
| Framework | Flutter (Dart 3) |
| State management | flutter_bloc (Bloc & Cubit) + StatefulWidget |
| DI | get_it (`injection.dart`) |
| Routing | go_router (`app_router.dart`, RouteObserver) |
| DB lokal | sqflite (SQLite), skema versi **10**, 21 tabel |
| HTTP | Dio (`dio_client.dart`, client terpisah per API) |
| Audio | just_audio + audio_service (murottal & SFX belajar) |
| Peta | flutter_map + geolocator (cari masjid, qibla) |
| Notifikasi lokal | flutter_local_notifications + timezone |
| Push | Firebase Cloud Messaging |
| Analytics | Firebase Analytics |
| Backend sync | Supabase (supabase_flutter) |
| OTA update | Shorebird code push |
| Font | Poppins (UI), ScheherazadeNew/LPMQ Isep Misbah (Arab) |

## 3. Peta Fitur (21 modul di `lib/features/`)

### 3.1. Inti Al-Qur'an
- **quran** — Reader surah (Arab + Latin + terjemahan + tafsir per ayat),
  daftar 114 surah, pencarian full-text ayat. Menyimpan posisi `last_read`.
- **audio** — Pemutar murottal per ayah/surah (5 qari), cache audio lokal
  (`audio_cache`), pemutaran latar (audio_service).
- **bookmark** — Simpan ayat ke folder (`bookmarks`, `bookmark_folders`).
- **khatam** — Pelacak khatam: target harian/mingguan, progres ayat dibaca
  (`khatam_activity`, `read_progress`).
- **share** — Bagikan ayat sebagai **gambar** (RepaintBoundary → PNG → share).

### 3.2. Ibadah Harian
- **prayer** — Jadwal sholat per kota (MyQuran API, cache `prayer_schedules`),
  pemilihan kota, toggle adzan per waktu → **disinkron ke Supabase**.
- **qibla** — Kompas arah kiblat (geolocator + kompas).
- **mosque** — Cari masjid terdekat (Overpass/OpenStreetMap), favorit lokal.
- **doa** — Katalog doa harian (EQuran API, cache `doas`).
- **tasbih** — Penghitung dzikir digital (Subhanallah/Alhamdulillah/…).
- **asmaul_husna** — 99 Asmaul Husna (aset JSON offline) + pencarian.
- **hijri** — **Kalender Islam**: konversi Masehi→Hijriah (algoritma tabular),
  puasa sunnah (Senin/Kamis, Ayyamul Bidh, Asyura, Arafah), hari besar,
  mode kalender/daftar + filter. Memicu **reminder puasa sunnah** lokal.
- **jurnal** — **Jurnal Ibadah Harian**: checklist shalat/dzikir/sedekah +
  **Tilawah otomatis** (dari aktivitas baca), streak & poin, **Rapor Bulanan**
  (`daily_habits`).
- **ramadhan** — Mode Ramadan + hitung hari (`ramadhan_days`).

### 3.3. Belajar (fitur hero)
- **belajar** — "Belajar Ngaji" bergamifikasi ala Duolingo: 100 unit × 10
  pelajaran × 10 soal (aset JSON offline, contentVersion 11), tipe soal
  beragam (kenal huruf/baca-kata Iqra, arrange ayah, fill missing word,
  listen-choose, tajwid, match-pairs, type-answer), XP "Poin Cahaya", level,
  streak "Istiqomah", badge, Latihan Kilat, profil + Toko Poin (tukar streak
  freeze). Tabel: `learning_user_stats`, `learning_lesson_progress`,
  `learning_daily_activity`, `learning_achievements`.

### 3.4. Engagement & Retensi (lintas fitur)
- **Ayat Hari Ini** (dashboard) — 1 ayat/hari, tombol "Sudah baca" → streak.
- **Streak Istiqomah terpadu** — disuapi Belajar + Ayat Hari Ini + Jurnal/Tilawah.
- **Badge "BARU"** di beranda (3 hari pertama sejak install).

### 3.5. Pendukung
- **dashboard** — Beranda (kartu jadwal sholat, Ayat Hari Ini, Jurnal, Hijri,
  quick actions, banner Belajar), navigasi bawah (Beranda/Al-Qur'an/Sholat/Bookmark).
- **onboarding** / **download** — Unduh data awal (surah, ayah, tafsir, kota).
- **splash** — Routing awal berdasar status sync.
- **settings** — Tema, ukuran font, qari, toggle notifikasi (adzan per waktu,
  Pengingat Qur'an, Belajar, Puasa Sunnah).
- **developer** — Layar debug internal (log notifikasi, dsb).

## 4. Basis Data Lokal (SQLite v10, 21 tabel)

`surahs, ayahs, tafsirs, bookmarks, bookmark_folders, last_read, cities,
prayer_schedules, audio_cache, app_settings, read_progress, ramadhan_days,
mosque_favorites, khatam_activity, notification_logs, doas,
learning_lesson_progress, learning_user_stats, learning_daily_activity,
learning_achievements, daily_habits`

> Ini DB **lokal di perangkat**. CMS **tidak** mengaksesnya. CMS hanya melihat
> subset yang disinkron ke Supabase (lihat §6).

## 5. API Eksternal yang Dipakai App

| API | Base | Endpoint | Fungsi |
|-----|------|----------|--------|
| EQuran.id v2 | `https://equran.id/api/v2` | `/surat`, `/surat/{id}`, `/tafsir/{id}` | Qur'an & tafsir |
| EQuran.id | `https://equran.id/api` | `/doa` | Doa harian |
| MyQuran v2 | `https://api.myquran.com/v2` | `/sholat/kota/semua`, `/sholat/jadwal/{kota}/{th}/{bl}` | Jadwal sholat & kota |
| Overpass (OSM) | `https://overpass-api.de/api` | `/interpreter` | Masjid terdekat |
| Firebase | — | FCM v1, Analytics | Push & analitik |
| Supabase | `https://lzyibxgxrdhwpolrolvt.supabase.co` | tabel `users`, `adzan_notification` | Sync perangkat & progres belajar |

## 6. Kontrak Backend (yang RELEVAN untuk CMS)

App **menulis langsung ke Supabase memakai anon key** (bukan lewat API CMS).
Artinya CMS **berbagi database Supabase yang sama** dan bertindak sebagai
konsumen + pengirim push. Dua tabel yang ditulis app:

### 6.1. `users` (satu baris per perangkat)
Ditulis via `SupabaseSyncService`:

| Kolom | Sumber | Keterangan |
|-------|--------|-----------|
| `id` (uuid) | Supabase | PK |
| `created_at` | Supabase | default now |
| `device_id` | app | ID perangkat unik (native id / generated) |
| `device_name` | app | merk/model |
| `token_firebase` | app | **token FCM** (target push) |
| `is_reminder` | app | opt-in reminder |
| `version` | app | versi app (mis. `1.0.007+7`) |
| `platform` | app | `Android` / `iOS` |
| `last_opened_at` | app | timestamp buka terakhir |
| `last_read_ayat` | app | ayat terakhir dibaca |
| `learning_name` | app | nama profil belajar |
| `learning_avatar` | app | index avatar |
| `learning_level` | app | level |
| `learning_xp` | app | Poin Cahaya |
| `learning_streak` | app | streak saat ini |
| `learning_longest_streak` | app | rekor streak |
| `learning_lessons_done` | app | jumlah pelajaran selesai |
| `learning_last_active_at` | app | tanggal terakhir aktif belajar |

### 6.2. `adzan_notification` (preferensi adzan per user)
`user_id, city_name, is_imsak/subuh/dzuhur/ashar/maghrib/isya,
imsak_time/subuh_time/dzuhur_time/ashar_time/maghrib_time/isya_time`.

### 6.3. Implikasi penting
- **RLS**: karena app menulis via anon key, tabel `users` & `adzan_notification`
  saat ini mengizinkan akses anon (RLS mati/permisif). CMS **tidak boleh**
  mengubah ini agar app tetap berfungsi.
- Data belajar (Jurnal, Tilawah detail, khatam) **tidak** disinkron penuh —
  hanya ringkasan belajar di kolom `learning_*`. CMS memantau lewat kolom itu.

## 7. Arsitektur Notifikasi App

App menerima push (FCM `onMessage`) dan menjadwalkan notifikasi lokal. Sumber:

| Sumber | Jenis | Pemicu |
|--------|-------|--------|
| Adzan | lokal terjadwal / FCM | waktu sholat cocok |
| Custom reminder | **FCM dari CMS** | cron CMS pada `schedule_time` |
| Pengingat Belajar | lokal | tiap ~3 hari (`scheduleBelajarReminders`) |
| Pengingat Puasa Sunnah | lokal | malam sebelum hari puasa (`scheduleFastingReminders`) |
| Win-back | **FCM dari CMS** | cron CMS (streak-at-risk / vakum / belum-mulai) |
| Daily Qur'an reminder | legacy | dinonaktifkan (dialihkan ke backend) |

**Yang dikirim CMS** = custom reminder, win-back, dan broadcast manual — semuanya
via **FCM ke `token_firebase`**.

## 8. Kesimpulan untuk CMS

CMS perlu:
1. **Membaca** tabel `users` (monitoring perangkat, versi, retensi, progres
   belajar) & `adzan_notification` (monitoring preferensi adzan).
2. **Mengirim push** FCM ke `token_firebase` — broadcast bertarget & terjadwal.
3. **Mengelola** konten pengingat (`custom_reminders`) & mencatat audit
   (`notification_logs`).
4. **Menjalankan cron** (adzan, reminder, win-back).
5. **Autentikasi admin** sendiri.
6. **Tidak merusak** kontrak app (skema & RLS `users`/`adzan_notification`).

Kebutuhan detail dijabarkan di [PRD](./01-prd.md).
