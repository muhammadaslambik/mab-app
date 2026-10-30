/** Particle dots canvas — vanilla, ±1.5 KB. Berhenti saat tab tersembunyi; statis jika reduced-motion. */
interface P { x: number; y: number; vx: number; vy: number; r: number }

export function initParticles(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LINK = 110;
  let w = 0, h = 0, pts: P[] = [], raf = 0;

  const draw = () => {
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
    if (!reduce) raf = requestAnimationFrame(draw);
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(40, Math.floor((w * h) / 30000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.4 + 0.4,
    }));
    cancelAnimationFrame(raf); draw();
  };

  let timer = 0, lastW = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth === lastW) return; // abaikan perubahan tinggi (address bar mobile)
    lastW = innerWidth; clearTimeout(timer); timer = window.setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduce) raf = requestAnimationFrame(draw);
  });
  resize();
}
