import {
  AppWindow, Bot, Box, Brain, Briefcase, Calculator, Camera, Database, Gamepad2, Gauge, Globe,
  GraduationCap, Heart, Languages, Layers, LayoutGrid, Map as MapIcon, MessageSquare, Monitor, Music,
  Package, Palette, Puzzle, Rocket, Shield, ShoppingCart, Smartphone, Sparkles, Star, Swords, Terminal,
  TrendingUp, Trophy, Wallet, Wrench, Zap, FlaskConical, Cpu, BookOpen,
  type LucideIcon,
} from 'lucide-react';

/**
 * Registry ikon yang diizinkan. Kita import ikon satu per satu (bukan `import *`)
 * supaya tree-shaking tetap bekerja → bundle kecil.
 * Mau ikon baru? Tambahkan di sini lalu pakai namanya di apps.json.
 */
const ICONS: Record<string, LucideIcon> = {
  AppWindow, Bot, Box, Brain, Briefcase, Calculator, Camera, Database, Gamepad2, Gauge, Globe,
  GraduationCap, Heart, Languages, Layers, LayoutGrid, Map: MapIcon, MessageSquare, Monitor, Music,
  Package, Palette, Puzzle, Rocket, Shield, ShoppingCart, Smartphone, Sparkles, Star, Swords, Terminal,
  TrendingUp, Trophy, Wallet, Wrench, Zap, FlaskConical, Cpu, BookOpen,
};

export const ICON_NAMES = Object.keys(ICONS);

export function AppIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const Icon = ICONS[name] ?? Box; // fallback aman jika nama ikon salah
  return <Icon size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}
