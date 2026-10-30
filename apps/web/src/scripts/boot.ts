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

/* 2. Header: glass lebih tegas setelah scroll */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  let state = false;
  const onScroll = () => {
    const next = scrollY > 8;
    if (next !== state) { state = next; header.dataset.scrolled = String(next); }
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

/* 4. PWA: service worker + tombol Install */
function initPwa() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register(`${base}/sw.js`).catch(() => {}));
  }
  let deferred: any = null;
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferred = e;
    document.querySelectorAll('[data-install]').forEach((b) => b.removeAttribute('hidden'));
  });
  document.querySelectorAll('[data-install]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (!deferred) return;
      deferred.prompt(); await deferred.userChoice; deferred = null;
      document.querySelectorAll('[data-install]').forEach((x) => x.setAttribute('hidden', ''));
    }),
  );
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
