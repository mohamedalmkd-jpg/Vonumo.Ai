"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FAQ } from "@/lib/content";
import { SectionHead } from "./Reveal";
import { Icon } from "./Icon";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative mx-auto min-h-[100svh] max-w-[1400px] px-4 py-28 sm:px-6 sm:py-36">
      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,40rem)]">
        <SectionHead index="10" label="FAQ" title="Gut zu wissen." sub="Die häufigsten Fragen – kurz und ehrlich beantwortet." />
        <div className="border-t border-line">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q} className="border-b border-line bg-ink/60 backdrop-blur-sm">
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`faq-${i}`} onClick={() => setOpen(on ? null : i)} className="group flex w-full items-center gap-4 py-4 text-left">
                    <span className="label w-6">0{i + 1}</span>
                    <span className={`flex-1 text-[12px] uppercase tracking-[0.12em] transition-colors ${on ? "text-fg" : "text-fg/70 group-hover:text-fg"}`}>{f.q}</span>
                    <Icon name="plus" size={14} className={`transition-transform duration-500 ${on ? "rotate-45 text-a2" : "text-mute"}`} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="pb-5 pl-10 pr-8 text-[11px] uppercase leading-relaxed tracking-wide text-mute">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
