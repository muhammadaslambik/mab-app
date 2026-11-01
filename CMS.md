# CMS MAB-APP

CMS: **Sveltia CMS** (gratis, berbasis Git). Setiap perubahan = 1 commit ke GitHub → GitHub Actions membangun & men-deploy
situs otomatis (±1–2 menit). Alamat: `https://mab-app.eu.org/admin/` (lokal: `http://localhost:4321/admin/`).

## Login (sekali, pakai token GitHub)
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories → mab-app**. Permissions → Repository → **Contents: Read and write**.
3. Buka `/admin/`, pilih masuk dengan GitHub **token**, tempel token. Token tersimpan di browser Anda saja.
   (Jika ditolak, coba token *classic* dengan scope `public_repo`.)

Mengedit lokal tanpa token: buka `http://localhost:4321/admin/` di Chrome/Edge, pilih **Work with Local Repository**,
lalu pilih folder `mab-app`. Hasil edit langsung berupa perubahan file; commit & push seperti biasa.

## Yang bisa diatur
| Menu | File yang diubah | Isi |
|---|---|---|
| Aplikasi | `apps-registry/apps.json` | tambah/ubah/hapus/urutkan aplikasi, kategori, platform, status, ikon, tautan, teknologi |
| Pengaturan Situs | `apps-registry/site.json` | nama situs, tagline & deskripsi (SEO), tautan GitHub |
| Teks & Terjemahan | `apps/web/src/i18n/locales/*.json` | semua teks antarmuka untuk 7 bahasa |

## Perlu kode (bukan lewat CMS)
- **Ikon baru** → tambah di `packages/ui/src/icons.tsx`. **Kategori/platform/status baru** → `packages/ui/src/types.ts` & `constants.ts`.
- **Bahasa baru** → buat `locales/xx.json`, daftarkan di `LANGS` (`apps/web/src/i18n/index.ts`).
- **Kunci teks baru** → tambah di `en.json` (dan dipakai lewat `data-i18n`).
- Setelah salah satunya, jalankan: `node scripts/gen-cms-config.mjs` lalu commit `apps/web/public/admin/config.yml`.

## Jika deploy gagal setelah edit
Buka GitHub → tab **Actions** → run terbaru yang merah. Penyebab paling umum: **ID aplikasi ganda** atau data tidak valid
(pesan jelas muncul di log). Situs lama tetap aktif; perbaiki datanya di CMS lalu simpan lagi.
