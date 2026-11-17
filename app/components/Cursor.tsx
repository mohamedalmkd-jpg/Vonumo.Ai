"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Fadenkreuz-Cursor mit Koordinaten – nur bei Maus/Trackpad. */
export function Cursor() {
  const box = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const b = box.current!, d = dot.current!;
    gsap.set([b, d], { xPercent: -50, yPercent: -50, opacity: 1 });
    const bx = gsap.quickTo(b, "x", { duration: 0.35, ease: "power3" }), by = gsap.quickTo(b, "y", { duration: 0.35, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.06 }), dy = gsap.quickTo(d, "y", { duration: 0.06 });
    const move = (e: PointerEvent) => {
      bx(e.clientX); by(e.clientY); dx(e.clientX); dy(e.clientY);
      if (coord.current) coord.current.textContent = `${String(Math.round(e.clientX)).padStart(4, "0")}·${String(Math.round(e.clientY)).padStart(4, "0")}`;
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest("a,button,input,textarea,select,label,[data-cursor]");
      gsap.to(b, { width: t ? 46 : 22, height: t ? 46 : 22, rotate: t ? 45 : 0, duration: 0.35, ease: "power3" });
    };
    const down = () => gsap.to(b, { scale: 0.7, duration: 0.15 });
    const up = () => gsap.to(b, { scale: 1, duration: 0.3 });
    const leave = () => gsap.to([b, d], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to([b, d], { opacity: 1, duration: 0.2 });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    document.addEventListener("pointerenter", enter);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      document.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] hidden mix-blend-difference [@media(pointer:fine)]:block">
      <div ref={box} className="fixed left-0 top-0 h-[22px] w-[22px] border border-white opacity-0">
        <span ref={coord} className="absolute left-full top-full ml-1 mt-1 whitespace-nowrap text-[9px] tracking-widest text-white/70" />
      </div>
      <div ref={dot} className="fixed left-0 top-0 h-[4px] w-[4px] bg-white opacity-0" />
    </div>
  );
}
