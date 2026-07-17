-- ============================================================================
-- Buat admin PERTAMA untuk login CMS.
-- Jalankan SEKALI di Supabase → SQL Editor SETELAH schema.sql.
-- Ganti email & password di bawah dengan milikmu (password kuat).
-- Password di-hash bcrypt oleh DB; plaintext tidak disimpan.
-- ============================================================================

insert into public.admin (email, password_hash, full_name)
values (
  'admin@quransaya.id',                                   -- ← ganti email
  extensions.crypt('GANTI_PASSWORD_KUAT', extensions.gen_salt('bf')),  -- ← ganti password
  'Admin'                                                 -- ← nama (opsional)
)
on conflict (email) do nothing;

-- Verifikasi (opsional):
-- select id, email, full_name, is_active, created_at from public.admin;

-- Ganti password admin yang sudah ada (opsional):
-- update public.admin
-- set password_hash = extensions.crypt('PASSWORD_BARU', extensions.gen_salt('bf'))
-- where email = 'admin@quransaya.id';
