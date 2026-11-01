#!/usr/bin/env node
/**
 * Membuat apps/web/public/admin/config.yml (konfigurasi Sveltia CMS) langsung dari kode proyek,
 * jadi CMS selalu sinkron dengan situs:
 *   - kategori / platform / status  ← packages/ui/src/types.ts
 *   - daftar ikon                   ← packages/ui/src/icons.tsx
 *   - daftar bahasa                 ← apps/web/src/i18n/index.ts
 *   - kolom teks terjemahan         ← apps/web/src/i18n/locales/en.json
 *
 * Jalankan ulang setiap kali Anda menambah ikon, kategori, bahasa, atau kunci teks baru:
 *   node scripts/gen-cms-config.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

// ───────── Pengaturan repo (ubah jika repo/branch berbeda) ─────────
const REPO = 'muhammadaslambik/mab-app';
const BRANCH = 'main';
const SITE_URL = 'https://mab-app.eu.org';

// ───────── Baca data dari kode ─────────
const enumOf = (name) => {
  const m = read('packages/ui/src/types.ts').match(new RegExp(`export const ${name} = \\[([^\\]]*)\\]`));
  if (!m) throw new Error(`Tidak menemukan ${name} di packages/ui/src/types.ts`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
};
const CATEGORIES = enumOf('CATEGORIES');
const PLATFORMS = enumOf('PLATFORMS');
const STATUSES = enumOf('STATUSES');

const iconBlock = read('packages/ui/src/icons.tsx').match(/const ICONS[^=]*=\s*\{([\s\S]*?)\n\};/);
if (!iconBlock) throw new Error('Tidak menemukan daftar ICONS di packages/ui/src/icons.tsx');
const ICONS = iconBlock[1].split(',').map((s) => s.trim().split(':')[0].trim()).filter(Boolean).sort();

const LOCALES = [...read('apps/web/src/i18n/index.ts').matchAll(/code:\s*'([a-z-]+)'/g)].map((m) => m[1]);
const EN = JSON.parse(read('apps/web/src/i18n/locales/en.json'));

// ───────── Label berbahasa Indonesia untuk editor CMS ─────────
const CATEGORY_LABEL = { application: 'Aplikasi', game: 'Game', business: 'Bisnis', education: 'Edukasi' };
const PLATFORM_LABEL = { desktop: 'Desktop', mobile: 'Mobile (HP)', web: 'Web' };
const STATUS_LABEL = { riset: 'Riset (tampil: RESEARCH)', beta: 'Beta (tampil: BETA)', rilis: 'Rilis (tampil: RELEASE)' };
const GROUP_LABEL = {
  a11y: 'Aksesibilitas', nav: 'Navigasi & menu', hero: 'Hero (bagian paling atas)',
  bento: 'Bagian "Why MAB-APP"', vault: 'Koleksi / pencarian aplikasi', filter: 'Filter',
  cat: 'Nama kategori', platform: 'Nama platform', card: 'Kartu aplikasi', footer: 'Footer',
  detail: 'Halaman detail aplikasi', notfound: 'Halaman 404',
};
const humanize = (k) => k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

// ───────── Kolom editor terjemahan (dari en.json, bersarang) ─────────
function textFields(obj, depth = 0) {
  return Object.entries(obj).map(([key, val]) => {
    if (typeof val === 'string') {
      const vars = [...val.matchAll(/\{(\w+)\}/g)].map((m) => `{${m[1]}}`);
      return {
        label: humanize(key),
        name: key,
        widget: val.length > 60 ? 'text' : 'string',
        required: false,
        i18n: true,
        ...(vars.length ? { hint: `Pertahankan ${[...new Set(vars)].join(', ')} apa adanya — nilainya diisi otomatis.` } : {}),
      };
    }
    return {
      label: depth === 0 ? (GROUP_LABEL[key] ?? humanize(key)) : humanize(key),
      name: key,
      widget: 'object',
      collapsed: true,
      i18n: true,
      fields: textFields(val, depth + 1),
    };
  });
}

// ───────── Konfigurasi ─────────
const config = {
  backend: { name: 'github', repo: REPO, branch: BRANCH },
  site_url: SITE_URL,
  display_url: SITE_URL,
  media_folder: 'apps/web/public/uploads',
  public_folder: '/uploads',
  i18n: { structure: 'multiple_files', locales: LOCALES, default_locale: LOCALES[0] },
  collections: [
    {
      name: 'apps',
      label: 'Aplikasi',
      description: 'Daftar aplikasi yang tampil di vault. Urutan di sini = urutan di situs (seret untuk mengubah).',
      files: [
        {
          name: 'registry',
          label: 'Daftar Aplikasi',
          file: 'apps-registry/apps.json',
          format: 'json',
          fields: [
            {
              label: 'Aplikasi',
              label_singular: 'Aplikasi',
              name: 'apps',
              widget: 'list',
              summary: '{{fields.name}} · {{fields.status}}',
              fields: [
                { label: 'ID (alamat halaman)', name: 'id', widget: 'string',
                  pattern: ['^[a-z0-9]+(?:-[a-z0-9]+)*$', 'Huruf kecil, angka, dan tanda minus. Contoh: mab-music'],
                  hint: 'Jadi alamat /app/ID-aplikasi/. Harus unik dan sebaiknya tidak diubah setelah dipublikasikan.' },
                { label: 'Nama', name: 'name', widget: 'string' },
                { label: 'Kategori', name: 'category', widget: 'select', options: CATEGORIES.map((v) => ({ label: CATEGORY_LABEL[v] ?? v, value: v })) },
                { label: 'Platform', name: 'platform', widget: 'select', multiple: true, min: 1,
                  options: PLATFORMS.map((v) => ({ label: PLATFORM_LABEL[v] ?? v, value: v })) },
                { label: 'Status', name: 'status', widget: 'select', options: STATUSES.map((v) => ({ label: STATUS_LABEL[v] ?? v, value: v })) },
                { label: 'Deskripsi singkat', name: 'description', widget: 'text',
                  pattern: ['^[\\s\\S]{1,160}$', 'Wajib diisi, maksimal 160 karakter'],
                  hint: 'Tampil di kartu (maks. 160 karakter).' },
                { label: 'Ikon', name: 'icon', widget: 'select', options: ICONS,
                  hint: 'Nama ikon Lucide. Perlu ikon lain? Tambahkan di packages/ui/src/icons.tsx lalu jalankan node scripts/gen-cms-config.mjs.' },
                { label: 'Tautan aplikasi', name: 'link', widget: 'string', required: false,
                  pattern: ['^$|^https?://', 'Kosongkan, atau awali dengan https://'],
                  hint: 'Kosongkan jika belum publik (halaman detail menampilkan "Not public yet").' },
                { label: 'Teknologi (tech stack)', name: 'tech_stack', widget: 'list', required: false, hint: 'Satu teknologi per baris, mis. React, Rust.' },
                { label: 'Deskripsi panjang', name: 'long_description', widget: 'text', required: false, hint: 'Opsional. Tampil di halaman detail.' },
                { label: 'Tag', name: 'tags', widget: 'list', required: false, hint: 'Opsional. Membantu pencarian.' },
                { label: 'Unggulan (kartu lebih lebar)', name: 'featured', widget: 'boolean', required: false, default: false },
                { label: 'Terakhir diperbarui', name: 'updated', widget: 'string', required: false,
                  pattern: ['^$|^\\d{4}-\\d{2}-\\d{2}$', 'Format: 2026-10-31'], hint: 'Format TAHUN-BULAN-TANGGAL, mis. 2026-10-31.' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'settings',
      label: 'Pengaturan Situs',
      files: [
        {
          name: 'site',
          label: 'Info Situs',
          file: 'apps-registry/site.json',
          format: 'json',
          fields: [
            { label: 'Nama situs', name: 'name', widget: 'string', hint: 'Dipakai di judul tab, footer, dan hasil pencarian.' },
            { label: 'Tagline (judul tab & SEO)', name: 'tagline', widget: 'string',
              hint: 'Teks besar di hero diatur di "Teks & Terjemahan → Hero".' },
            { label: 'Deskripsi situs (SEO)', name: 'description', widget: 'text', hint: 'Tampil di Google & media sosial. Idealnya di bawah 160 karakter.' },
            { label: 'Tautan GitHub', name: 'github', widget: 'string', pattern: ['^https://', 'Harus diawali https://'] },
            { label: 'URL situs', name: 'url', widget: 'hidden', default: SITE_URL },
          ],
        },
      ],
    },
    {
      name: 'texts',
      label: 'Teks & Terjemahan',
      description: 'Semua teks antarmuka. Kolom English adalah acuan; bahasa lain yang dikosongkan otomatis memakai English.',
      i18n: true,
      files: [
        {
          name: 'ui',
          label: 'Teks situs (semua bahasa)',
          file: 'apps/web/src/i18n/locales/{{locale}}.json',
          format: 'json',
          i18n: true,
          fields: textFields(EN),
        },
      ],
    },
  ],
};

// ───────── Penulis YAML sederhana (nilai teks memakai kutip ganda JSON = YAML valid) ─────────
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const scalar = (v) => (typeof v === 'string' ? JSON.stringify(v) : String(v));
const isScalar = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);

function emit(v, ind = 0) {
  const pad = ' '.repeat(ind);
  if (Array.isArray(v)) {
    return v.map((item) => (isScalar(item) ? `${pad}- ${scalar(item)}` : `${pad}- ${emit(item, ind + 2).trimStart()}`)).join('\n');
  }
  return Object.entries(v).map(([k, val]) => {
    if (Array.isArray(val) && val.length && val.every(isScalar) && JSON.stringify(val).length <= 90) return `${pad}${k}: ${JSON.stringify(val)}`;
    if (Array.isArray(val) && !val.length) return `${pad}${k}: []`;
    if (Array.isArray(val) || isObj(val)) return `${pad}${k}:\n${emit(val, ind + 2)}`;
    return `${pad}${k}: ${scalar(val)}`;
  }).join('\n');
}

const header = `# ============================================================================
# KONFIGURASI SVELTIA CMS — dibuat otomatis oleh: node scripts/gen-cms-config.mjs
# Jangan edit manual (akan tertimpa). Ubah scripts/gen-cms-config.mjs lalu jalankan ulang.
# ============================================================================
`;
const out = path.join(root, 'apps/web/public/admin/config.yml');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, header + emit(config) + '\n');
console.log(`config.yml dibuat: ${LOCALES.length} bahasa, ${ICONS.length} ikon, ${CATEGORIES.length} kategori, ${PLATFORMS.length} platform, ${STATUSES.length} status.`);
