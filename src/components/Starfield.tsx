import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  hue: "white" | "gold" | "mystic";
}

/** Ambient twinkling starfield painted on a fixed canvas behind the app. */
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((window.innerWidth * window.innerHeight) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.3 + 0.3,
        baseAlpha: Math.random() * 0.5 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 1.4 + 0.4,
        hue: Math.random() < 0.12 ? "gold" : Math.random() < 0.2 ? "mystic" : "white",
      }));
    };

    const color = (s: Star, alpha: number): string =>
      s.hue === "gold"
        ? `rgba(230,197,106,${alpha})`
        : s.hue === "mystic"
          ? `rgba(179,167,232,${alpha})`
          : `rgba(238,240,255,${alpha})`;

    const tick = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const s of stars) {
        const tw = Math.sin(s.phase + (t / 1000) * s.speed);
        const alpha = Math.max(0.05, s.baseAlpha + tw * 0.3);
        ctx.beginPath();
        ctx.arc(s.x, s.y + Math.sin(s.phase + t / 6000) * 1.5, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color(s, alpha);
        ctx.fill();
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = color(s, alpha * 0.12);
          ctx.fill();
        }
      }
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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(26,35,84,0.55),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(98,80,159,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(179,144,44,0.08),transparent_50%)]" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(3,5,18,0.75))]" />
    </div>
  );
};

export default Starfield;
