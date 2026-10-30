/**
 * Lenis (smooth scroll) + GSAP (counter & parallax orb).
 * Di-import secara dinamis saat browser idle → tidak membebani render awal.
 */
export async function initMotion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // hormati preferensi pengguna: tanpa smooth scroll & animasi

  const [{ default: Lenis }, { gsap }] = await Promise.all([import('lenis'), import('gsap')]);

  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Anchor link (#vault, /#about, dst.) → scroll halus lewat Lenis
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
    const target = document.querySelector(a.hash);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -72 });
    history.pushState(null, '', a.hash);
  });

  // Counter statistik di hero
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count ?? 0);
    const o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: end, duration: 1.4, delay: 0.6, ease: 'power2.out', onUpdate: () => (el.textContent = String(Math.round(o.v))) });
  });

  // Parallax orb mengikuti pointer (hanya perangkat dengan mouse)
  if (matchMedia('(pointer: fine)').matches) {
    const orbs = [...document.querySelectorAll<HTMLElement>('.orb-wrap')].map((el) => ({
      depth: Number(el.dataset.depth ?? 20),
      x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }),
    }));
    addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      orbs.forEach((o) => { o.x(nx * o.depth * 2); o.y(ny * o.depth * 2); });
    }, { passive: true });
  }
}
