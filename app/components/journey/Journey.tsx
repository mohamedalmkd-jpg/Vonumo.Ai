"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import type { Journey as Engine } from "./scene";

/** Kapitel der Kamera-Fahrt: Sichtfenster im Scroll-Fortschritt (0–1). */
const CHAPTERS = [
  { n: "01", tag: "3D-Websites", title: ["Räume, die man", "betritt."], text: "Echtes WebGL statt flacher Bilder. Besucher bewegen sich durch Ihre Marke – flüssig, schnell, unvergesslich.", word: "TIEFE", at: [0, 0.18] },
  { n: "02", tag: "UI/UX-Design", title: ["Jede Ebene", "mit Absicht."], text: "Hintergrund, Navigation, Bild, Schrift, Interaktion – Schicht für Schicht gestaltet, bis alles zusammenspielt.", word: "FORM", at: [0.27, 0.5] },
  { n: "03", tag: "KI-Lösungen", title: ["Intelligenz", "mit Wirkung."], text: "Assistenten und Automatisierungen, die Ihre Abläufe kennen und Ihrem Team jeden Tag Zeit schenken.", word: "WIRKUNG", at: [0.6, 0.86] },
] as const;

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => engine.current?.setProgress(v));

  // three.js erst laden, wenn der Abschnitt in die Nähe kommt
  useEffect(() => {
    const el = ref.current, cv = canvas.current;
    if (!el || !cv) return;
    let disposed = false;
    let vis: IntersectionObserver | null = null;
    const onMove = (e: PointerEvent) => engine.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));

    const near = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || engine.current) return;
      near.disconnect();
      try {
        const { createJourney } = await import("./scene");
        if (disposed) return;
        const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
        engine.current = createJourney(cv, { reduce: !!window.matchMedia("(prefers-reduced-motion: reduce)").matches, mobile });
        engine.current.setProgress(scrollYProgress.get());
        vis = new IntersectionObserver(([v]) => engine.current?.setActive(v.isIntersecting && !document.hidden));
        vis.observe(el);
        window.addEventListener("pointermove", onMove, { passive: true });
        setReady(true);
      } catch {
        setFailed(true);
      }
    }, { rootMargin: "100% 0px" });
    near.observe(el);
    const onVis = () => engine.current?.setActive(!document.hidden && el.getBoundingClientRect().bottom > 0 && el.getBoundingClientRect().top < window.innerHeight);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true; near.disconnect(); vis?.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      engine.current?.dispose(); engine.current = null;
    };
  }, [scrollYProgress]);

  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const outro = useTransform(scrollYProgress, [0.9, 0.97], [0, 1]);
  const outroY = useTransform(scrollYProgress, [0.9, 0.97], [30, 0]);

  return (
    <section ref={ref} id="leistungen" aria-label="Leistungen – eine Fahrt durch drei Räume" className="relative" style={{ height: "640vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvas} aria-hidden="true" className={`absolute inset-0 h-full w-full transition-opacity duration-[1.4s] ${ready ? "opacity-100" : "opacity-0"}`} />
        {(!ready || failed) && <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_50%,rgb(124_92_255/0.35),transparent_70%)]" />}
        {/* Weiche Ränder oben/unten, damit die Fahrt in die Seite übergeht */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(5_6_11/0.7),transparent_55%)] max-md:bg-[linear-gradient(0deg,rgb(5_6_11/0.85),transparent_60%)]" />

        {CHAPTERS.map((c, i) => <Chapter key={c.n} c={c} i={i} p={scrollYProgress} reduce={!!reduce} />)}

        <motion.div style={{ opacity: outro, y: outroY }} className="absolute inset-x-0 bottom-[16%] mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 sm:px-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2">
          <span className="kicker">Ihr Projekt</span>
          <p className="text-[clamp(2.4rem,6vw,5.5rem)] font-extralight leading-[0.95] tracking-[-0.03em]">Bereit für<br /><span className="grad-text font-bold">Ihre Szene?</span></p>
          <a href="#termin" className="btn btn-primary">Kostenlose Beratung</a>
        </motion.div>

        {/* Fortschritt rechts */}
        <div aria-hidden="true" className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-mute sm:flex">
          {CHAPTERS.map((c, i) => <Dot key={c.n} c={c} i={i} p={scrollYProgress} />)}
          <span className="relative mt-2 h-24 w-px overflow-hidden bg-line"><motion.span style={{ height: bar }} className="absolute inset-x-0 top-0 bg-fg" /></span>
        </div>
      </div>
    </section>
  );
}

type Ch = (typeof CHAPTERS)[number];

function useWindowed(p: MotionValue<number>, [a, b]: readonly [number, number], first: boolean) {
  // Offsets müssen in [0, 1] liegen und aufsteigen (sonst bricht die Web-Animations-API).
  return useTransform(p, first ? [0, b - 0.05, b] : [a, a + 0.05, b - 0.05, b], first ? [1, 1, 0] : [0, 1, 1, 0]);
}

function Chapter({ c, i, p, reduce }: { c: Ch; i: number; p: MotionValue<number>; reduce: boolean }) {
  const [a, b] = c.at;
  const opacity = useWindowed(p, c.at, i === 0);
  const y = useTransform(p, [a, b], reduce ? [0, 0] : [60, -60]);
  const blur = useTransform(p, [a, a + 0.05, b - 0.05, b], i === 0 ? ["blur(0px)", "blur(0px)", "blur(0px)", "blur(10px)"] : ["blur(10px)", "blur(0px)", "blur(0px)", "blur(10px)"]);
  const word = useTransform(p, [Math.max(0, a - 0.05), Math.min(1, b + 0.05)], reduce ? ["0%", "0%"] : ["30%", "-30%"]);
  const line = useTransform(p, [a, a + 0.08], ["0%", "100%"]);
  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      {/* Große senkrechte Schrift am Rand – wie Architektur-Beschriftung */}
      <motion.span aria-hidden="true" style={{ y: word }} className="absolute left-2 top-1/2 hidden origin-center -translate-y-1/2 select-none font-extralight leading-none tracking-[0.05em] text-transparent [-webkit-text-stroke:1px_rgb(238_240_255/0.22)] [writing-mode:vertical-rl] [transform:rotate(180deg)] lg:block lg:text-[9rem] xl:left-6">
        {c.word}
      </motion.span>
      <motion.div style={{ y, filter: blur }} className="absolute inset-x-0 bottom-[12%] mx-auto max-w-6xl px-5 sm:px-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 lg:pl-40">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-mute">
          <span className="text-fg">{c.n}</span>
          <span className="relative h-px w-14 overflow-hidden bg-line"><motion.span style={{ width: line }} className="absolute inset-y-0 left-0 bg-a2" /></span>
          <span>{c.tag}</span>
        </div>
        <h2 className="mt-5 text-[clamp(2.6rem,7vw,6.5rem)] font-extralight leading-[0.95] tracking-[-0.035em]">
          {c.title[0]}<br /><span className="font-bold">{c.title[1]}</span>
        </h2>
        <p className="mt-6 max-w-md text-fg/70 sm:text-lg">{c.text}</p>
      </motion.div>
    </motion.div>
  );
}

function Dot({ c, i, p }: { c: Ch; i: number; p: MotionValue<number> }) {
  const o = useWindowed(p, c.at, i === 0);
  const color = useTransform(o, [0, 1], ["rgb(154 160 189)", "rgb(238 240 255)"]);
  const w = useTransform(o, [0, 1], [8, 28]);
  return (
    <motion.span style={{ color }} className="flex items-center gap-3">
      {c.tag}
      <motion.span style={{ width: w }} className="h-px bg-current" />
    </motion.span>
  );
}
