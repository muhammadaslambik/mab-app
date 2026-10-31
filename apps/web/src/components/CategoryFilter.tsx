import { AppIcon, CATEGORIES, CATEGORY_META } from '@mab/ui';
import type { Category } from '@mab/ui';
import type { TFn } from '../i18n';

export type CategoryValue = 'all' | Category;

const TABS: { value: CategoryValue; key: string; icon: string }[] = [
  { value: 'all', key: 'filter.all', icon: 'LayoutGrid' },
  ...CATEGORIES.map((c) => ({ value: c as CategoryValue, key: `cat.${c}`, icon: CATEGORY_META[c].icon })),
];

interface Props {
  value: CategoryValue;
  onChange: (v: CategoryValue) => void;
  counts: Record<string, number>;
  t: TFn;
}

/** Tab kategori: satu baris yang bisa digeser di HP (tanpa ikon & angka → lebih ringkas). */
export default function CategoryFilter({ value, onChange, counts, t }: Props) {
  return (
    <div
      role="group"
      aria-label={t('vault.filter.category')}
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 py-0.5 [mask-image:linear-gradient(to_right,#000_90%,transparent)] rtl:[mask-image:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:[mask-image:none]"
    >
      {TABS.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(tab.value)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium sm:px-4 ${
              active
                ? 'border-transparent bg-gradient-to-r from-brand-violet to-brand-cyan text-ink-950'
                : 'hv-sky border-white/10 bg-white/5 text-slate-200'
            }`}
          >
            <AppIcon name={tab.icon} size={16} className="hidden sm:block" />
            {t(tab.key)}
            <span className={`hidden rounded-full px-1.5 text-xs tabular-nums sm:inline ${active ? 'bg-black/15' : 'bg-white/10 text-slate-300'}`}>
              {counts[tab.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
