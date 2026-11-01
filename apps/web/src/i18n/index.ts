/**
 * Sistem alih bahasa tanpa API & tanpa library.
 * - Kamus ada di ./locales/*.json (satu berkas per bahasa) dan bisa diedit lewat CMS (/admin).
 * - Teks HTML statis ditandai data-i18n="kunci"; komponen React memakai useT() (lihat ./react.ts).
 * - Kunci yang kosong / belum diterjemahkan otomatis memakai bahasa Inggris.
 */
import en from './locales/en.json';

export type Dict = Record<string, string>;
export type Vars = Record<string, string | number>;
export type TFn = (key: string, vars?: Vars) => string;

/** 6 bahasa resmi PBB + Bahasa Indonesia. Tambah bahasa baru: buat locales/xx.json, daftarkan di sini,
 *  lalu jalankan `node scripts/gen-cms-config.mjs` agar CMS ikut mengenalinya. */
export const LANGS = [
  { code: 'en', native: 'English', dir: 'ltr' },
  { code: 'id', native: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'ar', native: 'العربية', dir: 'rtl' },
  { code: 'zh', native: '中文（简体）', dir: 'ltr' },
  { code: 'es', native: 'Español', dir: 'ltr' },
  { code: 'fr', native: 'Français', dir: 'ltr' },
  { code: 'ru', native: 'Русский', dir: 'ltr' },
] as const;
export type LangCode = (typeof LANGS)[number]['code'];

/** {hero:{badge:"x"}} → {"hero.badge":"x"}; teks kosong dilewati agar jatuh ke bahasa Inggris */
function flatten(obj: Record<string, unknown>, prefix = '', out: Dict = {}): Dict {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      if (v.trim()) out[key] = v;
    } else if (v && typeof v === 'object') {
      flatten(v as Record<string, unknown>, key, out);
    }
  }
  return out;
}

const enDict = flatten(en);
const load = (p: Promise<{ default: Record<string, unknown> }>) => p.then((m) => ({ default: flatten(m.default) }));

const loaders: Record<LangCode, () => Promise<{ default: Dict }>> = {
  en: () => Promise.resolve({ default: enDict }),
  id: () => load(import('./locales/id.json')),
  ar: () => load(import('./locales/ar.json')),
  zh: () => load(import('./locales/zh.json')),
  es: () => load(import('./locales/es.json')),
  fr: () => load(import('./locales/fr.json')),
  ru: () => load(import('./locales/ru.json')),
};

const STORAGE_KEY = 'mab-lang';
let code: LangCode = 'en';
let dict: Dict = enDict;
const listeners = new Set<() => void>();

const isLang = (v: string): v is LangCode => Object.prototype.hasOwnProperty.call(loaders, v);
const fmt = (s: string, vars?: Vars) =>
  vars ? s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : s;

/** Terjemahan bahasa aktif (fallback: Inggris) */
export const t: TFn = (key, vars) => fmt(dict[key] ?? enDict[key] ?? key, vars);
/** Selalu Inggris — dipakai untuk render pertama React agar cocok dengan HTML server */
export const tEn: TFn = (key, vars) => fmt(enDict[key] ?? key, vars);

export const getLang = () => code;
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

/** Bahasa tersimpan → bahasa browser → Inggris */
export function detectLang(): LangCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isLang(saved)) return saved;
  } catch { /* storage diblokir: abaikan */ }
  for (const l of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    let base = (l || '').toLowerCase().split('-')[0] ?? '';
    if (base === 'in') base = 'id'; // kode lama Android untuk Indonesia
    if (isLang(base)) return base;
  }
  return 'en';
}

/** Terapkan terjemahan ke elemen HTML yang bertanda data-i18n / data-i18n-attr */
export function applyDom(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    let vars: Vars | undefined;
    try { vars = el.dataset.i18nVars ? JSON.parse(el.dataset.i18nVars) : undefined; } catch { /* abaikan */ }
    el.textContent = t(el.dataset.i18n ?? '', vars);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    (el.dataset.i18nAttr ?? '').split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}

export async function setLang(next: LangCode, persist = true) {
  try {
    const mod = await loaders[next]();
    code = next;
    dict = mod.default;
  } catch {
    return; // gagal memuat (offline): tetap di bahasa sekarang
  }
  const meta = LANGS.find((l) => l.code === next)!;
  document.documentElement.lang = next;
  document.documentElement.dir = meta.dir;
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* abaikan */ }
  }
  applyDom();
  listeners.forEach((fn) => fn());
}
