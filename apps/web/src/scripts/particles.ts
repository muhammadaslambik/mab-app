/**
 * Particle dots canvas — vanilla. Hanya layar ≥ md (HP: tidak dibuat sama sekali).
 * Dibatasi 30 fps, DPR 1, dan DIJEDA saat halaman sedang di-scroll.
 */
interface P { x: number; y: number; vx: number; vy: number; r: number }

export function initParticles(canvas: HTMLCanvasElement) {
  if (innerWidth < 768) { canvas.remove(); return; } // HP → lebih ringan
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const LINK = 100, FRAME = 1000 / 30;
  let w = 0, h = 0, pts: P[] = [], raf = 0, last = 0;

  const draw = (t = 0) => {
    if (!reduce) raf = requestAnimationFrame(draw);
    if (!reduce && (root.classList.contains('is-scrolling') || t - last < FRAME)) return;
    last = t;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]!;
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
      }
      ctx.fillStyle = 'rgba(190,180,255,0.65)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j]!, dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
        if (d < LINK * LINK) {
          ctx.strokeStyle = `rgba(150,140,255,${0.12 * (1 - Math.sqrt(d) / LINK)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
  };

  const resize = () => {
    w = innerWidth; h = innerHeight;
    canvas.width = w; canvas.height = h; // DPR 1: titik kecil tidak butuh resolusi tinggi
    const n = Math.min(36, Math.floor((w * h) / 32000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45, r: Math.random() * 1.4 + 0.4,
    }));
    cancelAnimationFrame(raf); draw();
  };

  let timer = 0, lastW = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth; clearTimeout(timer); timer = window.setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduce) raf = requestAnimationFrame(draw);
  });
  resize();
}
