/** Entry script global (dipanggil dari BaseLayout). Semua ringan & tanpa dependensi besar. */
import { initParticles } from './particles';
import { detectLang, getLang, setLang, subscribe, type LangCode } from '../i18n';

/* 1. Scroll reveal dengan Intersection Observer */
function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window)) return els.forEach((el) => el.classList.add('is-visible'));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/* 2. Header + tandai "sedang scroll" (animasi latar dijeda saat scroll) */
function initHeader() {
  const header = document.getElementById('site-header');
  const root = document.documentElement;
  let state = false, timer = 0;
  const onScroll = () => {
    if (header) {
      const next = scrollY > 8;
      if (next !== state) { state = next; header.dataset.scrolled = String(next); }
    }
    root.classList.add('is-scrolling');
    clearTimeout(timer);
    timer = window.setTimeout(() => root.classList.remove('is-scrolling'), 140);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* 3. Menu hamburger: tutup saat klik di luar menu, saat memilih link, atau tekan Esc */
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const set = (open: boolean) => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', () => set(false)));
  document.addEventListener('pointerdown', (e) => {
    if (menu.hidden) return;
    const target = e.target as Node;
    if (menu.contains(target) || btn.contains(target)) return; // klik di dalam menu/tombolnya: biarkan
    set(false);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* 4. Pemilih bahasa (ikon bumi) */
async function initLang() {
  const btn = document.getElementById('lang-btn');
  const menu = document.getElementById('lang-menu');
  const mark = () =>
    menu?.querySelectorAll<HTMLElement>('[data-lang]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.lang === getLang())));
  const setOpen = (open: boolean) => {
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };

  btn?.addEventListener('click', () => setOpen(!!menu?.hidden));
  menu?.addEventListener('click', async (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-lang]');
    if (!b) return;
    setOpen(false);
    await setLang(b.dataset.lang as LangCode);
  });
  document.addEventListener('pointerdown', (e) => {
    if (menu && !menu.hidden && !(e.target as Element).closest('#lang-root')) setOpen(false);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  subscribe(mark);
  mark();
  const initial = detectLang();
  if (initial !== 'en') await setLang(initial, false); // bahasa browser/tersimpan
}

/* 5. Kotak statistik hero → saring vault; prefetch halaman detail saat jari/mouse menekan kartu */
function initLinks() {
  document.addEventListener('click', (e) => {
    const tile = (e.target as Element).closest<HTMLElement>('[data-stat]');
    if (!tile) return;
    const detail = { status: tile.dataset.stat === 'research' ? 'riset' : null };
    (window as any).__vaultFilter = detail; // jika island belum siap, dibaca saat mount
    window.dispatchEvent(new CustomEvent('vault:filter', { detail }));
  });

  const done = new Set<string>();
  document.addEventListener('pointerdown', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-prefetch]');
    if (!a || done.has(a.href)) return;
    done.add(a.href);
    const l = document.createElement('link');
    l.rel = 'prefetch';
    l.href = a.href;
    document.head.append(l);
  }, { passive: true });
}

/* 6. PWA: service worker + tombol Install untuk SEMUA browser */
function detectPlatform(): string {
  const ua = navigator.userAgent;
  const coarse = navigator.maxTouchPoints > 1 || matchMedia('(pointer: coarse)').matches;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua) || (navigator as any).userAgentData?.platform === 'Android';
  const isOpera = /opr\/|opera|opt\//i.test(ua);
  const isEdge = /edga|edgios|edg\//i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const isSamsung = /samsungbrowser/i.test(ua);
  const isSafariMac = !isIOS && !isAndroid && /safari/i.test(ua) && !/chrome|crios|chromium|edg|opr/i.test(ua);

  if (isIOS) return 'ios';
  if (isAndroid || (coarse && innerWidth < 820 && !isSafariMac)) {
    if (isFirefox) return 'android-firefox';
    if (isOpera) return 'android-opera';
    if (isEdge) return 'android-edge';
    if (isSamsung) return 'android-samsung';
    return 'android';
  }
  if (isSafariMac) return 'safari-mac';
  if (isFirefox) return 'firefox';
  return 'desktop';
}

function openInstallHelp() {
  const dlg = document.getElementById('install-help') as HTMLDialogElement | null;
  if (!dlg) return;
  const key = detectPlatform();
  dlg.querySelectorAll<HTMLElement>('[data-help]').forEach((el) => { el.hidden = el.dataset.help !== key; });
  dlg.showModal();
}

function initPwa() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {}));
  }

  const w = window as any;
  const buttons = document.querySelectorAll<HTMLElement>('[data-install]');
  const hideAll = () => buttons.forEach((b) => b.setAttribute('hidden', ''));

  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  if (standalone) return hideAll();

  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); w.__pwaPrompt = e; });
  addEventListener('appinstalled', () => { w.__pwaPrompt = null; hideAll(); });

  buttons.forEach((b) => {
    b.removeAttribute('hidden');
    b.addEventListener('click', async () => {
      const p = w.__pwaPrompt;
      if (p) { p.prompt(); await p.userChoice; w.__pwaPrompt = null; return; }
      openInstallHelp();
    });
  });

  const dlg = document.getElementById('install-help') as HTMLDialogElement | null;
  dlg?.querySelector('[data-install-close]')?.addEventListener('click', () => dlg.close());
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

initReveal();
initHeader();
initMenu();
initLinks();
initPwa();
initLang();

/* 7. Non-kritis → tunggu browser idle */
const idle: (cb: () => void) => void = (cb) =>
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 300);

idle(() => {
  const canvas = document.getElementById('particles') as HTMLCanvasElement | null;
  if (canvas) initParticles(canvas);
  import('./motion').then((m) => m.initMotion());
});
