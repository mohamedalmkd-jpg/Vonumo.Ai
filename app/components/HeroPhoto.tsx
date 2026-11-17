"use client";
import { useEffect, useRef } from "react";
import { CHAPTERS, MOVES, flight } from "./three/flight";

/**
 * Foto-Hero nach den Design-Bildern des Inhabers („Image → Scrub → Image“ wie im Referenzvideo).
 * Zwei Aufnahmen werden scroll-gesteuert wie eine Kamera geführt:
 *  Totale → Heranfahrt an die Glasfront → Überblendung „durch das Glas“ → Fahrt auf das V im Innenraum.
 * Nur transform/opacity (keine CSS-Filter auf großen Flächen – ruckelt und malt in Chromium fehlerhaft). Bilder liegen in public/hero/ und werden
 * durch die Originale in voller Auflösung ersetzt, sobald sie vorliegen (gleiche Dateinamen).
 */
const SHOTS = [
  { src: "/hero/exterior.webp", alt: "VONUMO-Studio bei Nacht: Glaspavillon mit hinterleuchtetem Schriftzug vor verschneiten Bergen", origin: "72% 57%" },
  { src: "/hero/interior.webp", alt: "Blick durch die Glasfront in das VONUMO-Studio: Marmorwand mit V-Logo, Arbeitsplätze und Bildschirme", origin: "48.5% 56%" },
] as const;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

export function HeroPhoto({ className = "" }: { className?: string }) {
  const ext = useRef<HTMLDivElement>(null), int = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = performance.now(), p = flight.p, intro = 0;
    const [m1, m2] = MOVES, [, c1, c2] = CHAPTERS;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      // gedämpft folgen → Scroll-Gesten werden zu weichen Kamerafahrten
      p += (flight.p - p) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
      if (flight.started) intro = Math.min(1, intro + dt / (reduce ? 0.01 : 1.8));
      const k = 1 - Math.pow(1 - intro, 3);

      // Außenaufnahme: Atmen → Heranfahrt (Fahrt 1) → leichter Vorschub → tief hinein (Fahrt 2) und ausblenden
      const s1 = seg(p, m1.from, m1.to), r1 = clamp01((p - c1.from) / (c1.to - c1.from)), s2 = seg(p, m2.from, m2.to);
      const extScale = (1.08 - 0.08 * k) + p * 0.15 + s1 * 0.92 + r1 * 0.06 + s2 * 1.4;
      const extOp = 1 - seg(p, m2.from + 0.12, m2.from + 0.24);
      // Innenaufnahme: kommt groß herein (wie hinter dem Glas) und fährt langsam auf das V
      const rc = clamp01((p - c2.from) / (c2.to - c2.from));
      const intScale = 1.45 - s2 * 0.4 + rc * 0.12;
      const intOp = seg(p, m2.from + 0.1, m2.from + 0.26);


      if (ext.current) { ext.current.style.transform = `scale(${extScale})`; ext.current.style.opacity = String(extOp * k); }
      if (int.current) { int.current.style.transform = `scale(${intScale})`; int.current.style.opacity = String(intOp); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={stage} className={`overflow-hidden bg-ink ${className}`}>
      {SHOTS.map((s, i) => (
        <div key={s.src} ref={i === 0 ? ext : int} className="absolute inset-0 will-change-transform" style={{ transformOrigin: s.origin, opacity: 0 }}>
          <img src={s.src} alt={s.alt} className="h-full w-full object-cover" style={{ objectPosition: s.origin }} fetchPriority={i === 0 ? "high" : "low"} decoding="async" draggable={false} />
        </div>
      ))}
      {/* Vignette + leichtes Korn wie im Film */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_60%_50%,transparent_55%,rgb(4_4_6/0.65))]" />
    </div>
  );
}
