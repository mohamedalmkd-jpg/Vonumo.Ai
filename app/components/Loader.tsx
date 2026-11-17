"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/** Ladebildschirm 000→100. Wartet auf Schriften und die 3D-Bühne (max. 3,5 s). */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { p: 0 };
    window.__lenis?.stop();
    const stage = new Promise<void>((res) => {
      if ((window as unknown as { __stageReady?: boolean }).__stageReady) return res();
      window.addEventListener("vonumo:stage-ready", () => res(), { once: true });
    });
    const ready = Promise.race([Promise.all([document.fonts.ready, stage]), new Promise((r) => setTimeout(r, 3500))]);
    const render = () => {
      if (num.current) num.current.textContent = String(Math.round(state.p)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${state.p / 100})`;
    };
    const tl = gsap.timeline();
    tl.to(state, { p: 82, duration: reduce ? 0.1 : 1.1, ease: "power2.out", onUpdate: render });
    let cancelled = false;
    ready.then(() => {
      if (cancelled) return;
      gsap.timeline({ onComplete: () => { setGone(true); window.__lenis?.start(); (window as unknown as { __vonumoLoaded?: boolean }).__vonumoLoaded = true; window.dispatchEvent(new Event("vonumo:loaded")); } })
        .to(state, { p: 100, duration: reduce ? 0.05 : 0.45, ease: "power2.inOut", onUpdate: render }, tl.isActive() ? `+=${Math.max(0, tl.duration() - tl.time())}` : 0)
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: reduce ? 0.05 : 0.9, ease: "expo.inOut" }, "+=0.1");
    });
    return () => { cancelled = true; tl.kill(); };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} aria-hidden="true" className="grid-bg fixed inset-0 z-[95] flex flex-col items-center justify-center gap-6 bg-ink [clip-path:inset(0_0_0_0)]">
      <span ref={num} className="dot text-[22vw] leading-none text-fg sm:text-[12rem]">000</span>
      <span className="block h-px w-56 bg-line"><span ref={bar} className="block h-full origin-left scale-x-0 bg-fg" /></span>
      <span className="label">VONUMO · Bühne wird geladen</span>
    </div>
  );
}
