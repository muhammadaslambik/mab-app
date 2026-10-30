import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Check, Search, SearchX, X } from 'lucide-react';
import { AppIcon, PLATFORMS, PLATFORM_META } from '@mab/ui';
import type { AppSummary, Platform } from '@mab/ui';
import AppCard from './AppCard';
import CategoryFilter, { type CategoryValue } from './CategoryFilter';

interface Props {
  apps: AppSummary[];
  /** Prefix URL halaman detail, mis. "/app/" */
  appBase: string;
}

/** Tombol platform: aktif = putih solid + centang, nonaktif = transparan */
const platformChip = (on: boolean) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
    on ? 'border-transparent bg-white text-ink-950' : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
  }`;

/**
 * Search + filter kategori + filter platform — semuanya client-side & instan.
 */
export default function AppExplorer({ apps, appBase }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryValue>('all');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setReady(true);
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '/' && !typing) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const index = useMemo(
    () => apps.map((a) => ({
      a,
      hay: [a.name, a.description, a.category, a.status, ...a.platform, ...a.tech_stack, ...(a.tags ?? [])].join(' ').toLowerCase(),
    })),
    [apps],
  );

  const q = useDeferredValue(query).trim().toLowerCase();

  const base = useMemo(() => {
    const terms = q.split(/\s+/).filter(Boolean);
    return index
      .filter(({ a, hay }) => terms.every((t) => hay.includes(t)) && (platforms.length === 0 || a.platform.some((p) => platforms.includes(p))))
      .map((x) => x.a);
  }, [index, q, platforms]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: base.length };
    base.forEach((a) => { c[a.category] = (c[a.category] ?? 0) + 1; });
    return c;
  }, [base]);

  const results = category === 'all' ? base : base.filter((a) => a.category === category);
  const filtering = query !== '' || category !== 'all' || platforms.length > 0;
  const togglePlatform = (p: Platform) => setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
  const reset = () => { setQuery(''); setCategory('all'); setPlatforms([]); };

  return (
    <LazyMotion features={domAnimation}>
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <label htmlFor="app-search" className="sr-only">Search apps</label>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="app-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, tech or tag…  (press / )"
            autoComplete="off"
            className="glass w-full rounded-2xl py-3.5 pl-11 pr-11 text-base text-white placeholder:text-slate-400 focus:border-violet-400/50 focus:outline-none"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-300 hover:bg-white/10">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <CategoryFilter value={category} onChange={setCategory} counts={counts} />

        {/* Platform filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Filter by platform" className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-slate-300">Platform:</span>
            <button type="button" aria-pressed={platforms.length === 0} onClick={() => setPlatforms([])} className={platformChip(platforms.length === 0)}>
              {platforms.length === 0 && <Check size={14} aria-hidden="true" />}
              All
            </button>
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p);
              return (
                <button key={p} type="button" aria-pressed={on} onClick={() => togglePlatform(p)} className={platformChip(on)}>
                  {on ? <Check size={14} aria-hidden="true" /> : <AppIcon name={PLATFORM_META[p].icon} size={14} />}
                  {PLATFORM_META[p].label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-slate-300" role="status" aria-live="polite">
            Showing {results.length} of {apps.length} apps
            {filtering && (
              <button type="button" onClick={reset} className="ml-3 text-violet-300 underline-offset-4 hover:underline">Reset filters</button>
            )}
          </p>
        </div>

        {/* Grid */}
        {results.length > 0 ? (
          <div className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((app) => (
              <AppCard key={app.id} app={app} href={`${appBase}${app.id}/`} animateIn={ready} />
            ))}
          </div>
        ) : (
          <div className="glass grid place-items-center rounded-3xl px-6 py-16 text-center">
            <SearchX size={32} aria-hidden="true" className="text-slate-400" />
            <p className="mt-4 text-lg font-semibold text-white">No apps match these filters</p>
            <p className="mt-1 text-sm text-slate-300">Try a different keyword or clear the filters.</p>
            <button type="button" onClick={reset} className="btn btn-ghost mt-5">Reset filters</button>
          </div>
        )}
      </div>
    </LazyMotion>
  );
}