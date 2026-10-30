// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  site: 'https://mab-app.eu.org', // custom domain → base tetap "/"
  output: 'static', // 100% static → cocok GitHub Pages / Cloudflare Pages
  compressHTML: true,
  prefetch: { defaultStrategy: 'hover' },
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  vite: {
    resolve: {
      alias: {
        '@': r('./src'),
        // Data aplikasi hidup di root monorepo → cukup edit apps-registry/apps.json
        '@registry': r('../../apps-registry/apps.json'),
      },
      dedupe: ['react', 'react-dom'],
    },
    ssr: { noExternal: ['@mab/ui'] }, // package TS workspace ikut dikompilasi
    server: { fs: { allow: ['../..'] } },
  },
});
