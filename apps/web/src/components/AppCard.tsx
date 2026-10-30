import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { AppIcon, CATEGORY_META, PlatformBadge, StatusBadge } from '@mab/ui';
import type { AppSummary } from '@mab/ui';

interface Props {
  app: AppSummary;
  href: string;
  /** false saat render pertama (SSR/hydrate) agar kartu langsung terlihat; true untuk kartu yang muncul karena filter. */
  animateIn: boolean;
}

const spring = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Kartu aplikasi: 3D tilt mengikuti kursor, glow radial, ikon beranimasi saat hover.
 * Tilt hanya aktif untuk mouse (bukan touch) dan dimatikan bila reduced-motion.
 */
export default function AppCard({ app, href, animateIn }: Props) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), spring);
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), spring);
  const gx = useTransform(x, (v) => `${v * 100}%`);
  const gy = useTransform(y, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(360px circle at ${gx} ${gy}, rgba(124,92,255,0.22), transparent 65%)`;

  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { x.set(0.5); y.set(0.5); };
  const meta = CATEGORY_META[app.category];

  return (
    <m.div
      className={`[perspective:1000px] ${app.featured ? 'lg:col-span-2' : ''}`}
      initial={animateIn ? { opacity: 0, y: 14, scale: 0.97 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      data-card
    >
      <m.a
        href={href}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="glass group relative flex h-full flex-col rounded-3xl p-5 transition-colors duration-300 hover:border-violet-400/40 focus-visible:border-violet-400/60"
      >
        <m.span
          aria-hidden="true"
          style={{ background: glow }}
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />

        <div className="relative flex items-start justify-between gap-3" style={{ transform: 'translateZ(28px)' }}>
          <span
            className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg transition duration-500 group-hover:-rotate-6 group-hover:scale-110 group-hover:shadow-[0_0_28px_-4px_rgba(124,92,255,0.8)]`}
          >
            <AppIcon name={app.icon} size={24} />
          </span>
          <StatusBadge status={app.status} />
        </div>

        <h3 className="relative mt-5 text-lg font-semibold text-white" style={{ transform: 'translateZ(18px)' }}>{app.name}</h3>
        <p className="relative mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-300">{app.description}</p>

        <ul className="relative mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {app.tech_stack.slice(0, 3).map((t) => (<li key={t} className="chip">{t}</li>))}
          {app.tech_stack.length > 3 && <li className="chip">+{app.tech_stack.length - 3}</li>}
        </ul>

        <div className="relative mt-auto flex items-center justify-between border-t border-white/5 pt-4">
          <span className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {app.platform.map((p) => (<PlatformBadge key={p} platform={p} />))}
          </span>
          <span className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-slate-300 transition group-hover:text-white">
            Details <ArrowUpRight size={14} aria-hidden="true" className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </m.a>
    </m.div>
  );
}
