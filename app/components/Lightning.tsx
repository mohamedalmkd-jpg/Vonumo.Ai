"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type P = [number, number];
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Gezackter Blitz mit Verzweigungen – liefert SVG-Pfade. */
function bolt(start: P, angle: number, len: number, depth: number, out: { d: string; w: number }[]) {
  let [x, y] = start;
  const steps = Math.max(4, Math.round(len / 14));
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
  for (let i = 0; i < steps; i++) {
    const a = angle + rnd(-0.55, 0.55);
    const l = len / steps;
    x += Math.cos(a) * l; y += Math.sin(a) * l;
    d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    if (depth > 0 && Math.random() < 0.22) bolt([x, y], angle + rnd(-1, 1), len * rnd(0.25, 0.5), depth - 1, out);
  }
  out.push({ d, w: 0.6 + depth * 0.9 });
}

/** Dornenkrone aus Blitzen hinter dem 3D-Objekt: blitzt periodisch und bei schnellen Mausbewegungen. */
export function Lightning({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const flash = useRef<SVGGElement>(null);
  const thorns = useRef<SVGGElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (g: SVGGElement | null, count: number, spread: number) => {
      if (!g) return;
      const paths: { d: string; w: number }[] = [];
      for (let i = 0; i < count; i++) {
        const side = i % 2 ? 1 : -1;
        const a = -Math.PI / 2 + side * rnd(0.25, spread);
        bolt([500 + side * rnd(20, 120), rnd(330, 420)], a, rnd(180, 330), 2, paths);
      }
      g.innerHTML = paths.map((p) => `<path d="${p.d}" stroke-width="${p.w.toFixed(2)}"/>`).join("");
    };
    draw(thorns.current, 10, 1.45);
    if (reduce) return;

    let last = 0;
    const strike = () => {
      const now = performance.now();
      if (now - last < 700) return;
      last = now;
      draw(flash.current, 4, 1.4);
      gsap.fromTo(flash.current, { opacity: 0 }, { keyframes: { opacity: [1, 0.15, 0.9, 0.3, 1, 0] }, duration: 0.55, ease: "none" });
      gsap.fromTo(svg.current, { filter: "brightness(1.8)" }, { filter: "brightness(1)", duration: 0.6 });
    };
    let id = 0;
    const loop = () => { strike(); id = window.setTimeout(loop, rnd(2600, 5200)); };
    id = window.setTimeout(loop, 1800);
    let px = 0, py = 0, pt = 0;
    const move = (e: PointerEvent) => {
      const now = performance.now(), dt = now - pt || 16;
      const v = Math.hypot(e.clientX - px, e.clientY - py) / dt;
      px = e.clientX; py = e.clientY; pt = now;
      if (v > 2.4 && window.scrollY < window.innerHeight * 0.8) strike();
    };
    const regen = window.setInterval(() => draw(thorns.current, 10, 1.45), 9000);
    window.addEventListener("pointermove", move, { passive: true });
    return () => { clearTimeout(id); clearInterval(regen); window.removeEventListener("pointermove", move); };
  }, []);

  return (
    <svg ref={svg} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g ref={thorns} fill="none" stroke="rgb(160 165 190 / 0.16)" strokeLinejoin="miter" />
      <g ref={flash} fill="none" stroke="#dfe6ff" strokeLinejoin="miter" filter="url(#glow)" opacity="0" />
    </svg>
  );
}
