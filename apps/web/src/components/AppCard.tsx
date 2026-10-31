import { useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AppIcon, CATEGORY_META, PLATFORM_META, StatusBadge } from '@mab/ui';
import type { AppSummary } from '@mab/ui';
import type { TFn } from '../i18n';

interface Props {
  app: AppSummary;
  href: string;
  /** false saat render pertama agar kartu langsung terlihat; true untuk kartu yang muncul karena filter. */
  animateIn: boolean;
  t: TFn;
}

/**
 * Kartu aplikasi — TANPA library animasi: tilt 3D, glow, dan ikon digerakkan CSS murni
 * (variabel --rx/--ry/--gx/--gy diisi saat mouse bergerak). Di layar sentuh tidak ada tilt;
 * warna berubah instan saat disentuh (:active) dan halaman terbuka saat ditap.
 */
export default function AppCard({ app, href, animateIn, t }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const meta = CATEGORY_META[app.category];

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((x - 0.5) * 10).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div className={`${animateIn ? 'card-in' : ''} ${app.featured ? 'lg:col-span-2' : ''}`} data-card>
      <a
        ref={ref}
        href={href}
        data-prefetch
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="app-card glass relative flex h-full flex-col gap-3 rounded-3xl p-4 sm:p-5"
      >
        <span aria-hidden="true" className="app-glow pointer-events-none absolute inset-0 rounded-3xl" />

        <div className="relative flex items-center gap-3">
          <span className={`app-icon grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg`}>
            <AppIcon name={app.icon} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="app-title truncate text-base font-semibold text-white sm:text-lg">{app.name}</h3>
            <p className="truncate text-xs text-slate-400">{t(`cat.${app.category}`)}</p>
          </div>
          <StatusBadge status={app.status} />
        </div>

        <p className="relative line-clamp-2 text-sm leading-relaxed text-slate-300">{app.description}</p>

        {/* Tech stack hanya di layar lebar → kartu HP lebih ringkas */}
        <ul className="relative hidden flex-wrap gap-1.5 sm:flex" aria-label="Tech stack">
          {app.tech_stack.slice(0, 3).map((x) => (<li key={x} className="chip">{x}</li>))}
          {app.tech_stack.length > 3 && <li className="chip">+{app.tech_stack.length - 3}</li>}
        </ul>

        <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {app.platform.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                <AppIcon name={PLATFORM_META[p].icon} size={13} />
                {t(`platform.${p}`)}
              </span>
            ))}
          </span>
          <span className="app-more inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-300">
            {t('card.details')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </div>
      </a>
    </div>
  );
}
