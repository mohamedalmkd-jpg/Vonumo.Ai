"use client";
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { PLANS } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";
import { Scramble } from "./Scramble";
import { scrollToId } from "./SmoothScroll";

function Price({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const txt = useTransform(mv, (v) => `${Math.round(v)}€`);
  useEffect(() => { const c = animate(mv, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] }); return () => c.stop(); }, [mv, value]);
  return <motion.b className="dot text-6xl tabular-nums">{txt}</motion.b>;
}

export function pickPlan(name: string) {
  window.dispatchEvent(new CustomEvent("vonumo:plan", { detail: name }));
  scrollToId("termin");
}

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="preise" className="relative mx-auto max-w-[1400px] px-4 py-28 sm:px-6 sm:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead index="07" label="Abos & Preise" title="Pakete." sub="Bauen, hosten, warten – alles in einem Abo. Monatlich kündbar." />
        <Reveal className="flex flex-col items-start gap-2">
          <div role="group" aria-label="Abrechnung" className="flex gap-1">
            <button type="button" className="chip" aria-pressed={!yearly} onClick={() => setYearly(false)}>Monatlich</button>
            <button type="button" className="chip" aria-pressed={yearly} onClick={() => setYearly(true)}>Jährlich <span className={yearly ? "" : "text-lime"}>−20 %</span></button>
          </div>
          <p className="label">Neukunden: 20 % sparen bei jährlicher Zahlung</p>
        </Reveal>
      </div>
      <div className="mt-12 grid gap-3 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <article data-scramble-host className={`hud brackets flex h-full flex-col p-5 ${p.popular ? "!border-a1 shadow-[0_0_80px_-30px_#4f6bff]" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="label">0{i + 1} / {p.name}</span>
                {p.popular && <span className="bg-a1 px-2 py-0.5 text-[10px] uppercase tracking-widest text-white">Beliebt</span>}
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <Price value={yearly ? p.yearly : p.monthly} />
                <span className="label">/ Monat</span>
                {yearly && <s className="text-[11px] text-dim">{p.monthly}€</s>}
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-mute">{p.sub}</p>
              <ul className="mt-6 flex-1 divide-y divide-line border-y border-line">
                {p.items.map((it) => <li key={it} className="flex gap-3 py-2 text-[11px] uppercase tracking-wide"><span className="text-a2">+</span>{it}</li>)}
              </ul>
              <button type="button" onClick={() => pickPlan(p.name)} className={`btn mt-6 w-full ${p.popular ? "btn-solid" : ""}`}><Scramble text={`Termin für ${p.name}`} hover onView={false} /></button>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="label mt-6 text-center">Alle Preise zzgl. MwSt. · Wartung inklusive · monatlich kündbar (Jahrespaket: 12 Monate)</p>
    </section>
  );
}
