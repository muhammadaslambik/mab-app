/**
 * Loader + validator untuk apps-registry/apps.json.
 * Kesalahan data (id ganda, kategori salah, dll.) menghentikan build dengan pesan jelas,
 * jadi data rusak tidak pernah ikut ter-deploy.
 */
import raw from '@registry';
import { CATEGORIES, PLATFORMS, STATUSES } from '@mab/ui';
import type { AppEntry, Category, Platform, Status } from '@mab/ui';

const fail = (i: number, id: string, msg: string): never => {
  throw new Error(`[apps-registry] apps[${i}] "${id}": ${msg}`);
};

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T => list.includes(v as T);

function normalize(item: any, i: number, seen: Set<string>): AppEntry {
  const id = String(item?.id ?? '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) fail(i, id, 'id harus slug huruf kecil, mis. "my-app"');
  if (seen.has(id)) fail(i, id, 'id duplikat');
  seen.add(id);

  if (!item.name) fail(i, id, 'name wajib diisi');
  if (!isOneOf(CATEGORIES, item.category)) fail(i, id, `category harus salah satu: ${CATEGORIES.join(', ')}`);
  if (!isOneOf(STATUSES, item.status)) fail(i, id, `status harus salah satu: ${STATUSES.join(', ')}`);

  const platform: Platform[] = (Array.isArray(item.platform) ? item.platform : [item.platform]).filter(Boolean);
  if (!platform.length || !platform.every((p) => isOneOf(PLATFORMS, p)))
    fail(i, id, `platform harus berisi: ${PLATFORMS.join(', ')}`);

  if (!item.description) fail(i, id, 'description wajib diisi');
  const link = String(item.link ?? '');
  if (link && !/^https?:\/\//.test(link)) fail(i, id, 'link harus diawali http(s):// atau dikosongkan');

  return {
    id,
    name: String(item.name),
    category: item.category as Category,
    platform,
    status: item.status as Status,
    description: String(item.description),
    icon: String(item.icon ?? 'Box'),
    link,
    tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack.map(String) : [],
    long_description: item.long_description ? String(item.long_description) : undefined,
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    featured: Boolean(item.featured),
    updated: item.updated ? String(item.updated) : undefined,
  };
}

export function getApps(): AppEntry[] {
  const seen = new Set<string>();
  return (raw as { apps: unknown[] }).apps.map((item, i) => normalize(item, i, seen));
}

export function getStats(apps: AppEntry[]) {
  return {
    total: apps.length,
    research: apps.filter((a) => a.status === 'riset').length,
    categories: new Set(apps.map((a) => a.category)).size,
  };
}
