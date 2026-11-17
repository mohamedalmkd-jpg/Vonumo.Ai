"use client";
import { useRef } from "react";
import { CARDS } from "@/lib/content";
import { CardObject } from "./three";
import type { Kind } from "./three/CardObject";
import { Reveal, SectionHead } from "./Reveal";
import { Scramble } from "./Scramble";
import { Icon } from "./Icon";

function Card({ c, n }: { c: (typeof CARDS)[number]; n: number }) {
  const host = useRef<HTMLAnchorElement>(null);
  return (
    <a ref={host} href="#preise" data-scramble-host className="brackets group flex h-full flex-col border border-line p-4 transition-colors duration-300 hover:border-line-2 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between">
        <span className="label">0{n + 1}</span>
        <Icon name="plus" size={14} className="text-mute transition-transform duration-500 group-hover:rotate-90 group-hover:text-fg" />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <Scramble as="h3" text={c.title} hover className="text-[13px] font-medium uppercase leading-tight tracking-[0.14em]" />
        <span className="shrink-0 text-[11px] text-mute">{c.from}</span>
      </div>
      <div className="relative my-2 aspect-square w-full">
        <div className="absolute inset-[18%] rounded-full opacity-25 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: c.color }} />
        <CardObject kind={c.kind as Kind} color={c.color} host={host} className="absolute inset-0" />
      </div>
      <p className="text-[11px] uppercase leading-relaxed tracking-wide text-mute">{c.text}</p>
      <div className="mt-3 flex gap-1.5"><span className="chip !py-1 !text-[10px]">{c.tag}</span></div>
    </a>
  );
}

export function Services() {
  return (
    <section id="leistungen" className="relative mx-auto max-w-[1400px] px-4 py-28 sm:px-6 sm:py-36">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead index="02" label="Was wir bauen" title="Leistungen." />
        <Reveal><p className="max-w-xs text-[11px] uppercase leading-relaxed tracking-wide text-mute">Vier Disziplinen, ein Team. Fahren Sie über eine Karte – jedes Modul lebt.</p></Reveal>
      </div>
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c, n) => <Reveal key={c.title} delay={n * 0.07}><Card c={c} n={n} /></Reveal>)}
      </div>
      <div className="mt-10 flex justify-center"><a href="#preise" className="btn" data-scramble-host><Scramble text="Alle Pakete ansehen" hover onView={false} /> <span aria-hidden="true">→</span></a></div>
    </section>
  );
}
