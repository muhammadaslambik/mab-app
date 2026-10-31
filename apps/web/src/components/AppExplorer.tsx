import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import { AppIcon, PLATFORMS, PLATFORM_META } from '@mab/ui';
import type { AppSummary, Platform, Status } from '@mab/ui';
import AppCard from './AppCard';
import CategoryFilter, { type CategoryValue } from './CategoryFilter';
import { useT } from '../i18n/react';

interface Props {
  apps: AppSummary[];
  /** Prefix URL halaman detail, mis. "/app/" */
  appBase: string;
}

type PlatformValue = 'all' | Platform;

/** Segmented control platform: satu pilihan, satu baris, pas di layar HP. */
const seg = (on: boolean) =>
  `flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-full px-2 py-2 text-[13px] font-medium sm:flex-none sm:px-4 sm:text-sm ${
    on ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-ink-950' : 'hv-sky text-slate-300'
  }`;

/**
 * Search + filter kategori + filter platform (+ filter status dari kotak statistik di hero).
 * Semua berjalan di browser, tanpa reload.
 */
export default function AppExplorer({ apps, appBase }: Props) {
  const t = useT();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryValue>('all');
  const [platform, setPlatform] = useState<PlatformValue>('all');
  const [status, setStatus] = useState<Status | null>(null);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setQuery(''); setCategory('all'); setPlatform('all'); setStatus(null); };

  useEffect(() => {
    setReady(true);
    const w = window as any;

    // Kotak statistik di hero: ambil filter yang diminta (bisa dikirim sebelum island ini siap)
    const apply = (d?: { status?: Status | null }) => { reset(); setStatus(d?.status ?? null); };
    if (w.__vaultFilter) { apply(w.__vaultFilter); w.__vaultFilter = null; }
    const onFilter = (e: Event) => apply((e as CustomEvent).detail);
    window.addEventListener('vault:filter', onFilter);

    // Shortcut: tekan "/" untuk fokus ke kolom pencarian
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('vault:filter', onFilter);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Index teks pencarian dihitung sekali
  const index = useMemo(
    () => apps.map((a) => ({
      a,
      hay: [a.name, a.description, a.category, a.status, ...a.platform, ...a.tech_stack, ...(a.tags ?? [])].join(' ').toLowerCase(),
    })),
    [apps],
  );

  const q = useDeferredValue(query).trim().toLowerCase();

  // Hasil setelah search + platform + status (dipakai juga untuk hitungan di tab kategori)
  const base = useMemo(() => {
    const terms = q.split(/\s+/).filter(Boolean);
    return index
      .filter(({ a, hay }) =>
        terms.every((x) => hay.includes(x)) &&
        (platform === 'all' || a.platform.includes(platform)) &&
        (!status || a.status === status))
      .map((x) => x.a);
  }, [index, q, platform, status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: base.length };
    base.forEach((a) => { c[a.category] = (c[a.category] ?? 0) + 1; });
    return c;
  }, [base]);

  const results = category === 'all' ? base : base.filter((a) => a.category === category);
  const filtering = query !== '' || category !== 'all' || platform !== 'all' || status !== null;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search */}
      <div className="relative">
        <label htmlFor="app-search" className="sr-only">{t('vault.search.label')}</label>
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id="app-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('vault.search.placeholder')}
          autoComplete="off"
          enterKeyHint="search"
          className="glass w-full rounded-2xl py-3.5 ps-11 pe-11 text-base text-white placeholder:text-slate-400 focus:border-sky-400/60 focus:outline-none"
        />
        {query && (
          <button type="button" aria-label={t('vault.search.clear')} onClick={() => setQuery('')} className="hv-sky absolute end-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-300">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <CategoryFilter value={category} onChange={setCategory} counts={counts} t={t} />

      {/* Platform + ringkasan hasil */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-slate-300 sm:block">{t('vault.filter.platform')}</span>
          <div role="group" aria-label={t('vault.filter.platform')} className="flex w-full gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 sm:w-auto">
            <button type="button" aria-pressed={platform === 'all'} onClick={() => setPlatform('all')} className={seg(platform === 'all')}>
              {t('filter.all')}
            </button>
            {PLATFORMS.map((p) => (
              <button key={p} type="button" aria-pressed={platform === p} onClick={() => setPlatform(p)} className={seg(platform === p)}>
                <AppIcon name={PLATFORM_META[p].icon} size={14} className="hidden sm:block" />
                <span className="truncate">{t(`platform.${p}`)}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300" role="status" aria-live="polite">
          <span>{t('vault.showing', { n: results.length, total: apps.length })}</span>
          {status && (
            <button type="button" onClick={() => setStatus(null)} className="hv-sky inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs">
              {t(`vault.status.${status}`)}
              <X size={12} aria-hidden="true" />
            </button>
          )}
          {filtering && (
            <button type="button" onClick={reset} className="hv-text text-sky-300 underline-offset-4 hover:underline">{t('vault.reset')}</button>
          )}
        </p>
      </div>

      {/* Grid */}
      {results.length > 0 ? (
        <div className="grid grid-flow-dense gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {results.map((app) => (
            <AppCard key={app.id} app={app} href={`${appBase}${app.id}/`} animateIn={ready} t={t} />
          ))}
        </div>
      ) : (
        <div className="glass grid place-items-center rounded-3xl px-6 py-14 text-center">
          <SearchX size={32} aria-hidden="true" className="text-slate-400" />
          <p className="mt-4 text-lg font-semibold text-white">{t('vault.empty.title')}</p>
          <p className="mt-1 text-sm text-slate-300">{t('vault.empty.desc')}</p>
          <button type="button" onClick={reset} className="btn btn-ghost mt-5">{t('vault.reset')}</button>
        </div>
      )}
    </div>
  );
}
