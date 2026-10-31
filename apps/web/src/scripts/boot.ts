/** Entry script global (dipanggil dari BaseLayout). Semua ringan & tanpa dependensi besar. */
import { initParticles } from './particles';

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

/* 3. Menu mobile */
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  const set = (open: boolean) => { btn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* 4. PWA: service worker + tombol Install untuk SEMUA browser */
function detectPlatform(): string {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isFirefox = /firefox|fxios/i.test(ua);
  const isSafariMac = !isIOS && /safari/i.test(ua) && !/chrome|crios|chromium|edg/i.test(ua);
  if (isIOS) return 'ios';
  if (isAndroid) return isFirefox ? 'android-firefox' : 'android';
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

  const buttons = document.querySelectorAll<HTMLElement>('[data-install]');
  const hideAll = () => buttons.forEach((b) => b.setAttribute('hidden', ''));

  // Sudah dibuka sebagai aplikasi terpasang → tidak perlu tombol
  const standalone = matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  if (standalone) return hideAll();

  let deferred: any = null;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; });
  addEventListener('appinstalled', () => { deferred = null; hideAll(); });

  buttons.forEach((b) => {
    b.removeAttribute('hidden');
    b.addEventListener('click', async () => {
      if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; return; } // Chromium: pasang langsung
      openInstallHelp(); // Safari / Firefox / lainnya: tampilkan panduan
    });
  });

  // Dialog panduan: tombol tutup + klik area gelap
  const dlg = document.getElementById('install-help') as HTMLDialogElement | null;
  dlg?.querySelector('[data-install-close]')?.addEventListener('click', () => dlg.close());
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

initReveal();
initHeader();
initMenu();
initPwa();

/* 5. Non-kritis → tunggu browser idle */
const idle: (cb: () => void) => void = (cb) =>
  'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 300);

idle(() => {
  const canvas = document.getElementById('particles') as HTMLCanvasElement | null;
  if (canvas) initParticles(canvas);
  import('./motion').then((m) => m.initMotion());
});