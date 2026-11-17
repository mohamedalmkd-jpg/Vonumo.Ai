"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { STEPS } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";

export function Steps() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const h = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <section id="ablauf" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <SectionHead kicker="Ablauf" title={<>Vom Termin bis zum <span className="grad-text">Livegang</span>.</>} sub="In etwa 2–4 Wochen – transparent, mit festen Ansprechpartnern." />
      <ol ref={ref} className="relative mt-14 ml-3 space-y-10 border-l border-line pl-10 sm:ml-6">
        <motion.span aria-hidden="true" style={{ scaleY: h }} className="absolute -left-px top-0 h-full w-px origin-top bg-gradient-to-b from-a2 via-a1 to-a3" />
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <span className="absolute -left-[3.05rem] top-0.5 grid h-6 w-6 place-items-center rounded-full border border-line bg-ink font-mono text-[11px] text-a2">{i + 1}</span>
            <Reveal y={16}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="text-xl font-bold sm:text-2xl">{s.title}</h3>
                <span className="font-mono text-xs text-mute">{s.time}</span>
              </div>
              <p className="mt-2 max-w-lg text-mute">{s.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
