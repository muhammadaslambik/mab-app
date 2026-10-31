/**
 * Animasi ringan:
 *  - counter statistik di hero: JavaScript murni (±0.3 KB), semua perangkat
 *  - parallax orb: GSAP dimuat HANYA di desktop dengan mouse → HP tidak mengunduh GSAP sama sekali
 */
function counters() {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count ?? 0);
    if (!end) return;
    const dur = 1100;
    const start = performance.now() + 350;
    el.textContent = '0';
    const tick = (now: number) => {
      const p = Math.min(Math.max((now - start) / dur, 0), 1);
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export async function initMotion() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  counters();

  if (!matchMedia('(pointer: fine)').matches || innerWidth < 1024) return;
  const { gsap } = await import('gsap');
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
