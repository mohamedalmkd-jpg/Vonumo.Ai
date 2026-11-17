"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ShaderBg } from "./ShaderBg";

const words = ["Digitale", "Marken"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  // Kamera-Fahrt in die Aurora hinein – leitet nahtlos in die 3D-Fahrt über
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.9]);
  const bgFade = useTransform(scrollYProgress, [0.5, 1], [1, 0]);
  const bgBlur = useTransform(scrollYProgress, [0, 1], reduce ? ["blur(0px)", "blur(0px)"] : ["blur(0px)", "blur(14px)"]);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section ref={ref} id="top" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-24">
      <motion.div style={{ scale, opacity: bgFade, filter: bgBlur }} className="absolute inset-0 -z-10 will-change-transform">
        <ShaderBg className="absolute inset-0" />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(5_6_11/0.75),rgb(5_6_11/0.35)_60%,transparent)] md:bg-[linear-gradient(90deg,rgb(5_6_11/0.6),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-ink" />

      <motion.div style={{ y, opacity: fade }} className="mx-auto w-full max-w-6xl px-5 sm:px-6">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="kicker inline-flex items-center gap-2 !text-[0.68rem] sm:!text-xs">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-a2 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-a2" /></span>
          Digitalagentur für Web, Design und KI
        </motion.span>
        <h1 className="mt-6 max-w-4xl text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          {words.map((w, i) => (
            <span key={w} className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.1 + i * 0.08, ease }}>
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
          <br />
          <span className="inline-block overflow-hidden pb-3 align-bottom">
            <motion.em className="grad-text inline-block not-italic" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.3, ease }}>
              mit Tiefe.
            </motion.em>
          </span>
        </h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55, ease }} className="mt-6 max-w-xl text-lg text-fg/75 text-pretty sm:text-xl">
          3D-Websites, UI/UX-Design und KI-Systeme – gebaut für Unternehmen, die online herausstechen wollen.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.7, ease }} className="mt-10 flex flex-wrap gap-3">
          <a href="#termin" className="btn btn-primary">
            Kostenlose Beratung
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <a href="#preise" className="btn btn-ghost">Pakete ansehen</a>
        </motion.div>
        <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }} className="mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
          {[["2–4", "Wochen bis live"], ["90+", "Lighthouse-Ziel"], ["0", "Tracking-Cookies"]].map(([v, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd className="font-mono text-2xl font-bold sm:text-3xl">{v}</dd>
              <dd className="mt-1 text-xs text-mute sm:text-sm">{l}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <motion.a href="#leistungen" style={{ opacity: fade }} className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mute sm:flex" aria-label="Weiter scrollen">
        Scrollen
        <span className="relative h-10 w-px overflow-hidden bg-line"><span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-fg" /></span>
      </motion.a>
      <style>{`@keyframes scrollcue{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}`}</style>
    </section>
  );
}
