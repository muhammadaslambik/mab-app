/**
 * GSAP: counter statistik & parallax orb.
 * Scroll TIDAK dimodifikasi → memakai scroll native browser (instan, tanpa jeda).
 */
export async function initMotion() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const { gsap } = await import('gsap');

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