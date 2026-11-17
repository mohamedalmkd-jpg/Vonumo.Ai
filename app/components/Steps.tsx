"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { STEPS } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";

export function Steps() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const w = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <section id="ablauf" className="relative mx-auto max-w-[1400px] px-4 py-28 sm:px-6 sm:py-36">
      <SectionHead index="07" label="Ablauf" title="Vom Termin zum Livegang." sub="In etwa 2–4 Wochen – transparent, mit festen Ansprechpartnern." />
      <ol ref={ref} className="relative mt-14 grid gap-3 md:grid-cols-5">
        <span className="absolute inset-x-0 top-0 h-px bg-line max-md:hidden" />
        <motion.span aria-hidden="true" style={{ scaleX: w }} className="absolute inset-x-0 top-0 h-px origin-left bg-fg max-md:hidden" />
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative pt-6">
            <span className="absolute -top-1 left-0 h-2 w-2 bg-fg max-md:hidden" />
            <Reveal delay={i * 0.06} className="hud brackets h-full p-4">
              <div className="flex justify-between"><span className="label">0{i + 1}</span><span className="label text-a2">{s.time}</span></div>
              <h3 className="dot mt-4 text-2xl">{s.title}</h3>
              <p className="mt-2 text-[11px] uppercase leading-relaxed tracking-wide text-mute">{s.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
