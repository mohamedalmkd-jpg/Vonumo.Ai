"use client";
import { useEffect, useRef, useState } from "react";
import { flight, hero, heroProject } from "./three/flight";

/**
 * Interaktive Hotspots auf echten Objekten in den Hero-Fotos. Position je Bild über heroProject()
 * (dieselbe Abbildung wie im Shader inkl. Dolly und Parallaxe) – sie „kleben“ am Objekt.
 * Außen (Kapitel 1) und innen (Kapitel 3) je eigene Punkte. Klick/Tipp öffnet eine Karte.
 */
type Spot = { shot: 0 | 1; u: number; v: number; d: number; title: string; text: string; href: string; cta: string };
const SPOTS: Spot[] = [
  { shot: 0, u: 0.36, v: 0.535, d: 0.62, title: "Marke im Raum", text: "Logo, Licht und Leitsystem – Ihre Marke so gestaltet, dass man sie betreten kann.", href: "#leistungen", cta: "Webdesign" },
  { shot: 0, u: 0.61, v: 0.56, d: 0.45, title: "Oberflächen", text: "Dashboards und Interfaces, die Daten in Sekunden lesbar machen.", href: "#leistungen", cta: "UI/UX-Design" },
  { shot: 0, u: 0.3, v: 0.765, d: 0.72, title: "Licht & 3D", text: "Echtzeit-3D mit physikalischem Licht – flüssig bis aufs Smartphone.", href: "#labor", cta: "Material-Labor" },
  { shot: 1, u: 0.285, v: 0.6, d: 0.3, title: "KI-Systeme", text: "Assistenten und Automationen, die Ihre Abläufe kennen und Ihrem Team Zeit schenken.", href: "#leistungen", cta: "KI-Lösungen" },
  { shot: 1, u: 0.485, v: 0.565, d: 0.3, title: "Identität", text: "Ein Zeichen, eine Haltung: Markenauftritt aus einem Guss – vom Logo bis zur Website.", href: "#arbeiten", cta: "Arbeiten" },
  { shot: 1, u: 0.635, v: 0.6, d: 0.3, title: "Designsystem", text: "Farben, Typografie und Komponenten als System – jedes Projekt bekommt sein eigenes.", href: "#leistungen", cta: "UI/UX-Design" },
  { shot: 1, u: 0.785, v: 0.62, d: 0.3, title: "Entwicklung", text: "Next.js, TypeScript, Edge – schnell, sicher und vollständig Ihr Eigentum.", href: "#leistungen", cta: "Entwicklung" },
];

export function HeroHotspots() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [shot, setShot] = useState<0 | 1 | -1>(-1);

  useEffect(() => {
    let raf = 0, cur: 0 | 1 | -1 = -1;
    const tick = () => {
      // sichtbar nur in den Ruhe-Kapiteln mit passender Aufnahme
      const want: 0 | 1 | -1 = !hero.ready ? -1 : flight.chapter === 0 ? 0 : flight.chapter === 2 ? 1 : -1;
      if (want !== cur) { cur = want; setShot(want); setOpen(null); }
      SPOTS.forEach((s, i) => {
        const el = refs.current[i];
        if (!el || s.shot !== cur) return;
        const [x, y] = heroProject(s.shot, s.u, s.v, s.d);
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", esc);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", esc); };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]" aria-label="Hotspots im Bild">
      {SPOTS.map((s, i) => {
        const vis = s.shot === shot, on = open === i;
        const flip = typeof window !== "undefined" && s.u > 0.6;
        return (
          <div key={i} ref={(el) => { refs.current[i] = el; }} className="absolute left-0 top-0" style={{ visibility: vis ? "visible" : "hidden" }}>
            <button
              type="button"
              aria-expanded={on}
              aria-label={`${s.cta}: ${s.title} – mehr erfahren`}
              onClick={(e) => { e.stopPropagation(); setOpen(on ? null : i); }}
              className={`hotspot pointer-events-auto -translate-x-1/2 -translate-y-1/2 ${vis ? "hotspot-in" : ""}`}
              style={{ animationDelay: `${(i % 4) * 0.12}s` }}
            >
              <span className="hotspot-core" />
              <span className="hotspot-label" aria-hidden="true">{s.cta}</span>
            </button>
            {on && (
              <div role="dialog" aria-label={s.title} className={`pointer-events-auto absolute top-4 hidden w-[min(17rem,72vw)] md:block animate-[rise_.5s_cubic-bezier(.16,1,.3,1)] border border-white/15 bg-ink/80 p-4 backdrop-blur-md ${flip ? "right-4" : "left-4"}`}>
                <p className="label text-a2">{s.cta}</p>
                <p className="mt-2 text-[18px] font-light leading-tight">{s.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-fg/70">{s.text}</p>
                <a href={s.href} className="btn mt-3 !py-1.5 !text-[11px]" onClick={() => setOpen(null)}>Ansehen <span aria-hidden="true">→</span></a>
              </div>
            )}
          </div>
        );
      })}
      {/* Schmale Bildschirme: Karte unten statt neben dem Punkt (kein Abschneiden am Rand) */}
      {open !== null && (
        <div role="dialog" aria-label={SPOTS[open].title} className="pointer-events-auto absolute inset-x-4 bottom-16 animate-[rise_.5s_cubic-bezier(.16,1,.3,1)] border border-white/15 bg-ink/85 p-4 backdrop-blur-md md:hidden">
          <div className="flex items-start justify-between gap-3">
            <p className="label text-a2">{SPOTS[open].cta}</p>
            <button type="button" onClick={() => setOpen(null)} className="label -m-2 p-2 text-fg" aria-label="Schließen">✕</button>
          </div>
          <p className="mt-1 text-[18px] font-light leading-tight">{SPOTS[open].title}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-fg/70">{SPOTS[open].text}</p>
          <a href={SPOTS[open].href} className="btn mt-3 !py-1.5 !text-[11px]" onClick={() => setOpen(null)}>Ansehen <span aria-hidden="true">→</span></a>
        </div>
      )}
    </div>
  );
}
