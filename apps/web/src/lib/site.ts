/**
 * Pengaturan situs. Sumber data: apps-registry/site.json (bisa diedit lewat CMS di /admin).
 * Nilai cadangan di bawah dipakai bila ada kolom yang kosong, supaya build tidak pernah rusak.
 */
import data from '../../../../apps-registry/site.json';

const d = data as Partial<Record<'name' | 'url' | 'tagline' | 'description' | 'github', string>>;

export const SITE = {
  name: d.name || 'MAB-APP',
  url: (d.url || 'https://mab-app.eu.org').replace(/\/$/, ''),
  tagline: d.tagline || 'Research Lab for Future Applications',
  description:
    d.description ||
    'MAB-APP is a research lab and vault of experimental apps, games, business tools and learning products — from first prototype to public release.',
  github: d.github || 'https://github.com/muhammadaslambik/mab-app',
};
