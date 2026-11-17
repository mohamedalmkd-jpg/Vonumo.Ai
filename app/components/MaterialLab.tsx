"use client";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { LabObject } from "./three";
import { lab } from "./three/flight";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MATS = [
  { name: "Chrom", spec: [["Metallizität", "1,00"], ["Rauheit", "0,035"], ["Klarlack", "1,00"]], text: "Spiegelnd poliertes Metall – jede Spiegelung kommt aus einer echten HDRI-Umgebung." },
  { name: "Glas", spec: [["Transmission", "1,00"], ["IOR", "1,50"], ["Dispersion", "0,08"]], text: "Brechung, Rückseiten und Farbsäume in Echtzeit – wie Kristallglas unter Studiolicht." },
  { name: "Flüssigmetall", spec: [["Metallizität", "1,00"], ["Verformung", "0,42"], ["Rauheit", "0,07"]], text: "Eine lebendige Oberfläche, die sich ständig neu formt – berechnet auf der Grafikkarte." },
] as const;

/**
 * Material-Labor (#labor): interaktive Echtzeit-3D-Probe in Chrom, Glas und Flüssigmetall.
 * Ziehen (Maus oder Finger) dreht das Objekt mit Trägheit; vertikales Scrollen bleibt auf Touch frei.
 */
export function MaterialLab() {
  const sec = useRef<HTMLElement>(null);
  const [m, setM] = useState(0);

  useGSAP(() => {
    const el = sec.current!;
    const st = ScrollTrigger.create({ trigger: el, start: "top 85%", end: "top 15%", scrub: true, onUpdate: (s) => { lab.enter = s.progress; } });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) lab.enter = 1;
    const tw = reduce ? null : gsap.from(gsap.utils.toArray<HTMLElement>("[data-mask]", el), {
      yPercent: 110, duration: 1.1, stagger: 0.07, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 70%", once: true },
    });
    return () => { st.kill(); tw?.scrollTrigger?.kill(); tw?.kill(); };
  }, { scope: sec });

  const pick = (i: number) => { setM(i); lab.material = i as 0 | 1 | 2; };
  const drag = useRef({ x: 0, t: 0, id: -1 });
  const down = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, t: performance.now(), id: e.pointerId };
    lab.dragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!lab.dragging || e.pointerId !== drag.current.id) return;
    const dx = e.clientX - drag.current.x;
    drag.current.x = e.clientX;
    lab.vel = dx * 0.006;
  };
  const up = () => { lab.dragging = false; };
  const M = MATS[m];

  return (
    <section ref={sec} id="labor" aria-label="Material-Labor" className="relative overflow-hidden">
      <div className="relative mx-auto grid min-h-[100svh] max-w-[1400px] gap-6 px-4 py-24 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:items-center lg:gap-10">
        <div className="relative z-10">
          <div className="overflow-hidden"><p data-mask className="label flex items-center gap-3"><span className="text-fg">[ 03 ]</span><span className="h-px w-8 bg-line-2" />Material-Labor</p></div>
          <h2 className="mt-5 text-[clamp(2.4rem,4.4vw,4.6rem)] font-light leading-[0.98] tracking-[-0.03em]">
            <span className="block overflow-hidden pb-[0.05em]"><span data-mask className="block">Material, das man</span></span>
            <span className="block overflow-hidden pb-[0.05em]"><span data-mask className="block text-fg/45">anfassen will.</span></span>
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-fg/70">Echtzeit-3D mit physikalisch korrektem Licht: dieselbe Technik, mit der wir Produkte, Marken und Räume im Browser erlebbar machen.</p>

          <div role="radiogroup" aria-label="Material wählen" className="mt-8 flex flex-wrap gap-2">
            {MATS.map((x, i) => (
              <button key={x.name} type="button" role="radio" aria-checked={m === i} onClick={() => pick(i)} className={`btn !py-2 ${m === i ? "btn-solid" : ""}`}>{x.name}</button>
            ))}
          </div>
          <div key={M.name} className="mt-6 animate-[rise_.7s_cubic-bezier(.16,1,.3,1)]" aria-live="polite">
            <p className="max-w-md text-[13px] leading-relaxed text-fg/70">{M.text}</p>
            <dl className="mt-4 grid max-w-md grid-cols-3 border-t border-line">
              {M.spec.map(([k, v]) => (
                <div key={k} className="border-r border-line py-3 pr-3 last:border-r-0 [&:not(:first-child)]:pl-3">
                  <dt className="label">{k}</dt><dd className="mt-1 text-[22px] font-light tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div
          className="relative h-[58svh] min-h-[380px] cursor-grab touch-pan-y select-none active:cursor-grabbing lg:h-[78svh]"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}
          role="img" aria-label={`3D-Probe aus ${M.name}, mit Maus oder Finger drehbar`}
        >
          <LabObject className="absolute inset-0 overflow-hidden rounded-[22px]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
          <p aria-hidden="true" className="label pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">← Ziehen zum Drehen →</p>
          <p aria-hidden="true" className="label pointer-events-none absolute right-4 top-4">HDRI · PBR · Echtzeit</p>
        </div>
      </div>
    </section>
  );
}
