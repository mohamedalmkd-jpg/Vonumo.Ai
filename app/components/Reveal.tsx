"use client";
import { motion, useReducedMotion } from "motion/react";
import { Scramble } from "./Scramble";

export function Reveal({ children, delay = 0, className, y = 24 }: { children: React.ReactNode; delay?: number; className?: string; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Abschnittskopf: Index-Label + großer Punktmatrix-Titel, der sich entschlüsselt. */
export function SectionHead({ index, label, title, sub, className = "", as = "h2" }: { index: string; label: string; title: string; sub?: string; className?: string; as?: "h1" | "h2" }) {
  return (
    <div className={className}>
      <p className="label flex items-center gap-3"><span className="text-fg">[ {index} ]</span><span className="h-px w-8 bg-line-2" />{label}</p>
      <Scramble as={as} text={title} className="dot mt-5 block text-[clamp(2.6rem,7vw,6rem)] text-fg" />
      {sub && <Reveal delay={0.15}><p className="mt-5 max-w-md text-[13px] uppercase leading-relaxed tracking-wide text-mute">{sub}</p></Reveal>}
    </div>
  );
}
