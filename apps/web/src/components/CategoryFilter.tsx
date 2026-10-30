import { AppIcon, CATEGORIES, CATEGORY_META } from '@mab/ui';
import type { Category } from '@mab/ui';

export type CategoryValue = 'all' | Category;

const TABS: { value: CategoryValue; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: 'LayoutGrid' },
  ...CATEGORIES.map((c) => ({ value: c as CategoryValue, label: CATEGORY_META[c].label, icon: CATEGORY_META[c].icon })),
];

interface Props {
  value: CategoryValue;
  onChange: (v: CategoryValue) => void;
  counts: Record<string, number>;
}

/** Tab kategori interaktif — filter tanpa reload halaman. */
export default function CategoryFilter({ value, onChange, counts }: Props) {
  return (
    <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {TABS.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(t.value)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? 'border-transparent bg-gradient-to-r from-brand-violet to-brand-cyan text-ink-950'
                : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
            }`}
          >
            <AppIcon name={t.icon} size={16} />
            {t.label}
            <span className={`rounded-full px-1.5 text-xs tabular-nums ${active ? 'bg-black/15' : 'bg-white/10 text-slate-300'}`}>
              {counts[t.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
