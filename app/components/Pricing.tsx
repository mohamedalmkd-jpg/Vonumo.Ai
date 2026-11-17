"use client";
import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { PLANS } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";

function Price({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const txt = useTransform(mv, (v) => `${Math.round(v)} €`);
  useEffect(() => { const c = animate(mv, value, { duration: 0.6, ease: [0.16, 1, 0.3, 1] }); return () => c.stop(); }, [mv, value]);
  return <motion.b className="text-5xl font-extrabold tracking-tight tabular-nums">{txt}</motion.b>;
}

export function pickPlan(name: string) {
  window.dispatchEvent(new CustomEvent("vonumo:plan", { detail: name }));
  document.getElementById("termin")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="preise" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <div className="absolute inset-x-0 top-1/3 -z-10 h-96 bg-[radial-gradient(50%_50%_at_50%_50%,rgb(124_92_255/0.18),transparent)]" aria-hidden="true" />
      <SectionHead center kicker="Abos & Preise" title={<>Ihre neue Website – <span className="grad-text">fair im Abo</span>.</>} sub="Bauen, hosten, warten – alles in einem Paket. Monatlich kündbar." />

      <Reveal className="mt-10 flex flex-col items-center gap-3">
        <div role="group" aria-label="Abrechnung" className="glass relative flex rounded-full p-1">
          {[{ k: false, l: "Monatlich" }, { k: true, l: "Jährlich" }].map((o) => (
            <button key={o.l} type="button" aria-pressed={yearly === o.k} onClick={() => setYearly(o.k)} className="relative rounded-full px-5 py-2 text-sm font-semibold">
              {yearly === o.k && <motion.span layoutId="bill" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{o.l}{o.k && <span className="ml-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs text-emerald-300">−20 %</span>}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-mute"><b className="text-fg">Neukunden-Rabatt:</b> 20 % sparen bei jährlicher Zahlung</p>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <article className={`relative flex h-full flex-col rounded-3xl p-7 transition-transform duration-500 hover:-translate-y-1 ${p.popular ? "border border-transparent bg-ink-2 [background:linear-gradient(var(--color-ink-2),var(--color-ink-2))_padding-box,linear-gradient(140deg,var(--color-a2),var(--color-a1),var(--color-a3))_border-box] shadow-[0_30px_90px_-30px_rgb(124_92_255/0.6)]" : "border border-line bg-ink-2/60"}`}>
              {p.popular && <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-a1 to-a2 px-3 py-1 text-xs font-bold">Beliebt</span>}
              <span className="font-mono text-sm uppercase tracking-widest text-mute">{p.name}</span>
              <div className="mt-4 flex items-baseline gap-2">
                <Price value={yearly ? p.yearly : p.monthly} />
                <span className="text-mute">/ Monat</span>
                {yearly && <s className="text-sm text-mute/70">{p.monthly} €</s>}
              </div>
              <p className="mt-2 text-mute">{p.sub}</p>
              <ul className="mt-7 flex-1 space-y-3 text-sm">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-3">
                    <svg className="mt-0.5 shrink-0 text-a2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    {it}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => pickPlan(p.name)} className={`btn mt-8 w-full ${p.popular ? "btn-primary" : "btn-ghost"}`}>Termin für {p.name}</button>
            </article>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-mute">Alle Preise zzgl. MwSt. · Wartung in jedem Paket enthalten · monatlich kündbar (Jahrespaket: 12 Monate)</p>
    </section>
  );
}
