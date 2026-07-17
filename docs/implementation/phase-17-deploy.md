# Phase 17 — Deployment

> [← Daftar Fase](./README.md) · Prasyarat: [Phase 16](./phase-16-qa.md).

## Tujuan
CMS live di produksi + cron berjalan.

## Checklist
- [ ] Set env produksi (Supabase service-role, FCM, `ADMIN_SESSION_SECRET`,
      `CRON_SECRET`, `WINBACK_TIME`, dll) di host (Vercel/Node).
- [ ] Jalankan `supabase/schema.sql` di DB produksi (bila belum) + buat admin.
- [ ] `npm run build` + deploy (Vercel disarankan).
- [ ] Aktifkan cron:
  - [ ] **Vercel Cron** / **GitHub Action** → `POST /api/cron/run` tiap menit
        dengan header `x-cron-secret`, **atau**
  - [ ] jalankan `npm run cron:worker` di server yang selalu hidup.
- [ ] **Smoke test produksi**: login admin, dashboard tampil, kirim uji ke 1
      device, cek entri di Log.
- [ ] Dokumentasikan: URL CMS, jadwal cron, cara rollback.

## Definition of Done
- CMS live & login berfungsi.
- Cron berjalan otomatis; notifikasi uji terkirim & tercatat.
- Runbook singkat terdokumentasi.

## Selesai 🎉
Kembali ke [Daftar Fase](./README.md) untuk verifikasi **Definition of Done
(Global)**.
