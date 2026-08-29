import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  hue: "white" | "gold" | "mystic" | "blue";
  cross: boolean; // draws a 4-point sparkle
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}

interface Dust {
  x: number;
  y: number;
  vy: number;
  sway: number;
  phase: number;
  r: number;
  hue: "gold" | "mystic";
}

/**
 * Ambient cosmic sky: twinkling starfield, drifting nebulae,
 * rising glow dust and occasional shooting stars — all on one canvas,
 * capped for mobile and paused when the tab is hidden.
 */
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = () => window.innerWidth < 768;

    let stars: Star[] = [];
    let dust: Dust[] = [];
    let shooters: ShootingStar[] = [];
    let nebulae: Array<{ img: HTMLCanvasElement; x: number; y: number; scale: number; speed: number; phase: number }> = [];
    let raf = 0;
    let running = true;
    let nextShooterAt = performance.now() + 2600;
    let W = 0;
    let H = 0;

    /* ---- pre-render soft nebula sprites once ---- */
    const makeNebula = (color: string, inner: number): HTMLCanvasElement => {
      const c = document.createElement("canvas");
      c.width = 520;
      c.height = 520;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(260, 260, 10, 260, 260, 255);
      grad.addColorStop(0, color.replace("$a", String(inner)));
      grad.addColorStop(0.45, color.replace("$a", String(inner * 0.45)));
      grad.addColorStop(1, color.replace("$a", "0"));
      g.fillStyle = grad;
      g.fillRect(0, 0, 520, 520);
      return c;
    };

    const nebulaSprites = [
      makeNebula("rgba(98,80,159,$a)", 0.13),
      makeNebula("rgba(47,79,174,$a)", 0.11),
      makeNebula("rgba(179,144,44,$a)", 0.07),
    ];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = isMobile() ? 8200 : 5200;
      const count = Math.min(isMobile() ? 150 : 300, Math.floor((W * H) / density));
      stars = Array.from({ length: count }, () => {
        const roll = Math.random();
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.25 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.28,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 1.6 + 0.5,
          hue: roll < 0.1 ? "gold" : roll < 0.2 ? "mystic" : roll < 0.27 ? "blue" : "white",
          cross: Math.random() < 0.045,
        };
      });

      if (!isMobile() && !reduced) {
        dust = Array.from({ length: 34 }, () => ({
          x: Math.random() * W,
          y: Math.random() * H,
          vy: 0.06 + Math.random() * 0.16,
          sway: 12 + Math.random() * 26,
          phase: Math.random() * Math.PI * 2,
          r: 0.8 + Math.random() * 1.4,
          hue: Math.random() < 0.5 ? "gold" : "mystic",
        }));
      } else {
        dust = [];
      }

      nebulae = nebulaSprites.map((img, i) => ({
        img,
        x: Math.random() * W,
        y: Math.random() * H,
        scale: (isMobile() ? 0.7 : 1) + Math.random() * 0.55,
        speed: 0.05 + i * 0.028,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const starColor = (s: Star, alpha: number): string =>
      s.hue === "gold"
        ? `rgba(230,197,106,${alpha})`
        : s.hue === "mystic"
          ? `rgba(179,167,232,${alpha})`
          : s.hue === "blue"
            ? `rgba(140,175,240,${alpha})`
            : `rgba(238,240,255,${alpha})`;

    const spawnShooter = (now: number) => {
      const fromLeft = Math.random() < 0.5;
      const angle = (35 + Math.random() * 20) * (Math.PI / 180);
      const speed = 7 + Math.random() * 6;
      shooters.push({
        x: fromLeft ? -40 : W * (0.25 + Math.random() * 0.6),
        y: Math.random() * H * 0.45,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 55 + Math.random() * 35,
        len: 90 + Math.random() * 70,
      });
      nextShooterAt = now + (isMobile() ? 9000 : 4200) + Math.random() * (isMobile() ? 7000 : 4500);
    };

    const tick = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      /* --- drifting nebulae (deepest layer) --- */
      for (const n of nebulae) {
        const nx = n.x + Math.sin(t / 26000 + n.phase) * 90;
        const ny = n.y + Math.cos(t / 31000 + n.phase) * 60;
        const size = 520 * n.scale;
        ctx.globalAlpha = 0.85 + Math.sin(t / 9000 + n.phase) * 0.15;
        ctx.drawImage(n.img, nx - size / 2, ny - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      /* --- stars --- */
      const twinkleAmp = reduced ? 0.12 : 0.32;
      for (const s of stars) {
        const tw = Math.sin(s.phase + (t / 1000) * s.speed);
        const alpha = Math.max(0.05, s.baseAlpha + tw * twinkleAmp);
        ctx.beginPath();
        ctx.arc(s.x, s.y + Math.sin(s.phase + t / 6200) * 1.4, s.r, 0, Math.PI * 2);
        ctx.fillStyle = starColor(s, alpha);
        ctx.fill();
        if (s.cross && alpha > 0.5) {
          const L = s.r * 6 * (alpha - 0.2);
          ctx.strokeStyle = starColor(s, alpha * 0.55);
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(s.x - L, s.y);
          ctx.lineTo(s.x + L, s.y);
          ctx.moveTo(s.x, s.y - L);
          ctx.lineTo(s.x, s.y + L);
          ctx.stroke();
        } else if (s.r > 1.25) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.7, 0, Math.PI * 2);
          ctx.fillStyle = starColor(s, alpha * 0.1);
          ctx.fill();
        }
      }

      /* --- rising glow dust --- */
      for (const d of dust) {
        d.y -= d.vy;
        if (d.y < -8) {
          d.y = H + 8;
          d.x = Math.random() * W;
        }
        const dx = d.x + Math.sin(t / 2400 + d.phase) * d.sway * 0.35;
        const a = 0.1 + Math.sin(t / 1700 + d.phase) * 0.05;
        ctx.beginPath();
        ctx.arc(dx, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.hue === "gold" ? `rgba(230,197,106,${a})` : `rgba(179,167,232,${a})`;
        ctx.fill();
      }

      /* --- shooting stars --- */
      if (!reduced && t > nextShooterAt && shooters.length < 2) spawnShooter(t);
      shooters = shooters.filter((sh) => {
        sh.life += 1;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const p = sh.life / sh.maxLife;
        if (p >= 1) return false;
        const fade = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;
        const tx = sh.x - (sh.vx / Math.hypot(sh.vx, sh.vy)) * sh.len;
        const ty = sh.y - (sh.vy / Math.hypot(sh.vx, sh.vy)) * sh.len;
        const grad = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        grad.addColorStop(0, `rgba(248,233,189,${0.85 * fade})`);
        grad.addColorStop(0.35, `rgba(212,175,55,${0.4 * fade})`);
        grad.addColorStop(1, "rgba(212,175,55,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 2.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250,240,210,${0.9 * fade})`;
        ctx.fill();
        return true;
      });

      raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    const onVis = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-night-950" aria-hidden="true">
      {/* Deep-space gradient layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,35,84,0.6),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(98,80,159,0.2),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(179,144,44,0.09),transparent_50%)]" />
      {/* slow-breathing cosmic halo */}
      <div className="nebula-breathe absolute left-1/2 top-[-20%] h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(62,50,128,0.22),transparent_60%)]" />
      <div className="nebula-breathe-slow absolute bottom-[-25%] right-[-10%] h-[60vmax] w-[60vmax] rounded-full bg-[radial-gradient(circle,rgba(30,55,120,0.2),transparent_60%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(3,5,18,0.78))]" />
    </div>
  );
};

export default Starfield;
