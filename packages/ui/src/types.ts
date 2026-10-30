/** Tipe & enum yang dipakai bersama oleh registry, web, dan komponen UI. */
export const CATEGORIES = ['application', 'game', 'business', 'education'] as const;
export const PLATFORMS = ['desktop', 'mobile', 'web'] as const;
export const STATUSES = ['riset', 'beta', 'rilis'] as const;

export type Category = (typeof CATEGORIES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Status = (typeof STATUSES)[number];

/** Satu entri aplikasi di apps-registry/apps.json */
export interface AppEntry {
  id: string; // slug unik → URL /app/[id]
  name: string;
  category: Category;
  platform: Platform[];
  status: Status;
  description: string; // ringkas, tampil di kartu
  icon: string; // nama ikon Lucide (lihat packages/ui/src/icons.tsx)
  link: string; // URL publik, "" jika belum rilis
  tech_stack: string[];
  long_description?: string; // opsional, tampil di halaman detail
  tags?: string[];
  featured?: boolean; // true → kartu lebih lebar di grid
  updated?: string; // "2026-10-29"
}

/** Versi ringan untuk dikirim ke island React (tanpa long_description) */
export type AppSummary = Omit<AppEntry, 'long_description'>;
