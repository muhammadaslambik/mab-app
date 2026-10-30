# MAB-App

**Research Lab for Future Applications** — hub untuk semua aplikasi riset buatan Anda.
Live: https://mab-app.eu.org

Stack 100% gratis (tanpa kartu): **pnpm workspaces + Turborepo · Astro · Tailwind · React islands · Framer Motion · GSAP · Lenis · Lucide**.

## Struktur

```
mab-app/
├── apps/web/            Landing page + halaman /app/[id] (Astro, static)
├── packages/ui/         Komponen reusable + tipe (AppIcon, StatusBadge, PlatformBadge)
├── packages/config/     Tailwind preset & tsconfig bersama
├── apps-registry/       apps.json  ← PUSAT DATA APLIKASI
├── .github/workflows/   deploy.yml (GitHub Pages + Cloudflare opsional)
└── wrangler.toml        Cloudflare Pages
```

## Menjalankan

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # hasil di apps/web/dist
pnpm preview
pnpm typecheck
```

## Menambah aplikasi baru (tanpa coding)

Edit `apps-registry/apps.json`, tambahkan objek baru:

```json
{
  "id": "my-new-app",
  "name": "My New App",
  "category": "application",      // application | game | business | education
  "platform": ["desktop", "web"], // desktop | mobile | web
  "status": "riset",              // riset | beta | rilis
  "description": "Satu kalimat ringkas.",
  "icon": "Rocket",               // nama ikon Lucide, daftar di packages/ui/src/icons.tsx
  "link": "",                     // kosong = belum publik
  "tech_stack": ["Rust", "React"]
}
```

Kartu, filter, pencarian, halaman `/app/my-new-app/`, dan sitemap otomatis ikut. Data divalidasi saat build
(id ganda, kategori salah, dll. → build berhenti dengan pesan jelas). Ikon baru: tambahkan di `packages/ui/src/icons.tsx`.

## Deploy ke GitHub Pages

1. Ganti `YOUR-USERNAME` di `apps/web/src/lib/site.ts`.
2. Push ke GitHub (branch `main`). Commit juga `pnpm-lock.yaml`.
3. Repo → **Settings → Pages → Source: GitHub Actions**.
4. Workflow `deploy.yml` berjalan otomatis setiap push.

### Domain mab-app.eu.org
- File `apps/web/public/CNAME` sudah berisi domain Anda.
- eu.org butuh nameserver: pakai DNS gratis Cloudflare (tanpa kartu), lalu isi NS Cloudflare di panel eu.org.
- Di DNS tambahkan 4 record **A** untuk `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  (dan opsional AAAA `2606:50c0:8000::153` … `8003::153`). Set proxy ke **DNS only**.
- Pages → Custom domain `mab-app.eu.org` → centang **Enforce HTTPS**.

## Deploy ke Cloudflare Pages (opsional)

Repo → Settings → Secrets and variables → Actions:
- Variable `DEPLOY_CLOUDFLARE` = `true`
- Secrets `CLOUDFLARE_API_TOKEN` (izin *Cloudflare Pages: Edit*) dan `CLOUDFLARE_ACCOUNT_ID`

Atau hubungkan repo langsung di dashboard Cloudflare Pages: build command `pnpm build`, output `apps/web/dist`.

## Catatan performa & aksesibilitas
- Halaman 100% statis; JS hanya untuk island React (filter/kartu) dan script kecil.
- Font self-hosted (Fontsource: Inter + Space Grotesk dari Google Fonts), tanpa request ke pihak ketiga.
- Lenis + GSAP dimuat dinamis saat browser idle; particles = canvas vanilla.
- `prefers-reduced-motion` dihormati (tanpa smooth scroll, tilt, dan partikel bergerak).
- Ukur dengan Chrome DevTools → Lighthouse (mode Incognito, build production via `pnpm build && pnpm preview`).
