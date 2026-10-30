import type { Platform, Status } from './types';
import { PLATFORM_META, STATUS_META } from './constants';
import { AppIcon } from './icons';

/** Label status. Status "riset" otomatis tampil sebagai "RESEARCH" dengan titik berdenyut. */
export function StatusBadge({ status, className = '' }: { status: Status; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ring-1 ring-inset ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${status === 'riset' ? 'animate-pulse' : ''}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

/** Badge platform (Desktop / Mobile / Web) */
export function PlatformBadge({ platform, className = '' }: { platform: Platform; className?: string }) {
  const meta = PLATFORM_META[platform];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-300 ${className}`}>
      <AppIcon name={meta.icon} size={13} />
      {meta.label}
    </span>
  );
}
