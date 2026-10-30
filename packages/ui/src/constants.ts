import type { Category, Platform, Status } from './types';

export const CATEGORY_META: Record<Category, { label: string; icon: string; gradient: string }> = {
  application: { label: 'Application', icon: 'AppWindow', gradient: 'from-violet-500 to-indigo-500' },
  game: { label: 'Game', icon: 'Gamepad2', gradient: 'from-pink-500 to-orange-400' },
  business: { label: 'Business', icon: 'Briefcase', gradient: 'from-emerald-400 to-cyan-500' },
  education: { label: 'Education', icon: 'GraduationCap', gradient: 'from-amber-400 to-rose-400' },
};

export const PLATFORM_META: Record<Platform, { label: string; icon: string }> = {
  desktop: { label: 'Desktop', icon: 'Monitor' },
  mobile: { label: 'Mobile', icon: 'Smartphone' },
  web: { label: 'Web', icon: 'Globe' },
};

export const STATUS_META: Record<Status, { label: string; badge: string; dot: string }> = {
  riset: { label: 'RESEARCH', badge: 'text-amber-300 bg-amber-400/10 ring-amber-400/30', dot: 'bg-amber-300' },
  beta: { label: 'BETA', badge: 'text-cyan-300 bg-cyan-400/10 ring-cyan-400/30', dot: 'bg-cyan-300' },
  rilis: { label: 'RELEASE', badge: 'text-emerald-300 bg-emerald-400/10 ring-emerald-400/30', dot: 'bg-emerald-300' },
};
