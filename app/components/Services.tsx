"use client";
import { useRef } from "react";
import { SERVICES } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";

/** Karte mit Licht, das dem Zeiger folgt (nur CSS-Variablen, kein Re-Render). */
export function SpotCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`);
        ref.current!.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`group relative h-full overflow-hidden rounded-3xl border border-line bg-ink-2/60 p-7 transition-colors duration-500 hover:border-white/15 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(400px_circle_at_var(--x)_var(--y),rgb(124_92_255/0.16),transparent_60%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function Services() {
  return (
    <section id="leistungen" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <SectionHead kicker="Leistungen" title={<>Alles, was Ihre Marke <span className="grad-text">online</span> braucht.</>} sub="Drei Disziplinen, ein Team – von der ersten Idee bis zur fertigen, gewarteten Website." />
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <SpotCard>
              <span className="inline-grid h-12 min-w-12 place-items-center rounded-2xl border border-line bg-white/[0.03] px-3 font-mono text-sm text-a2">{s.tag}</span>
              <h3 className="mt-8 text-2xl font-bold">{s.title}</h3>
              <p className="mt-3 text-mute">{s.text}</p>
            </SpotCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
