"use client";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DISCIPLINES } from "@/lib/content";
import { ServicesObject } from "./three";
import { services } from "./three/flight";
import { lenisSnap } from "./lenisSnap";
import { Scramble } from "./Scramble";

gsap.registerPlugin(ScrollTrigger, useGSAP);
const N = DISCIPLINES.length;

/**
 * Leistungen (#leistungen): gepinnte Szene mit fünf Disziplinen.
 * Links eine übergroße Liste (Scrollen oder Klicken wählt aus), rechts schwebende Geräte,
 * deren Bildschirme per Wisch-Shader auf das passende Projekt umschalten.
 */
export function Services() {
  const wrap = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    const el = wrap.current!;
    let cur = 0;
    st.current = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom",
      onUpdate: (s) => {
        const i = Math.min(N - 1, Math.floor(s.progress * N * 0.9999));
        if (i !== cur) { cur = i; services.active = i; setActive(i); }
      },
    });
    const unsnap = lenisSnap(st.current, DISCIPLINES.map((_, i) => (i + 0.5) / N));
    // Kopfzeile + Liste laufen durch Masken ins Bild
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intro = reduce ? null : gsap.from(gsap.utils.toArray<HTMLElement>("[data-mask]", el), {
      yPercent: 110, duration: 1.1, stagger: 0.06, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 70%", once: true },
    });
    return () => { unsnap(); st.current?.kill(); intro?.scrollTrigger?.kill(); intro?.kill(); };
  }, { scope: wrap });

  const go = (i: number) => {
    const s = st.current;
    if (!s) return;
    const y = s.start + ((i + 0.5) / N) * (s.end - s.start);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const D = DISCIPLINES[active];
  return (
    <section ref={wrap} id="leistungen" aria-label="Leistungen" className="relative" style={{ height: `${N * 75 + 25}svh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(50%_60%_at_72%_55%,rgb(79_107_255/0.16),transparent_70%)]" />
        <div className="relative mx-auto grid h-full max-w-[1400px] grid-rows-[minmax(0,34svh)_auto] gap-2 px-4 pb-5 pt-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:grid-rows-1 lg:gap-8 lg:pb-8 lg:pt-20">
          {/* Liste */}
          <div className="order-2 flex min-h-0 flex-col lg:order-1 lg:justify-center">
            <div className="overflow-hidden"><p data-mask className="label flex items-center gap-3"><span className="text-fg">[ 02 ]</span><span className="h-px w-8 bg-line-2" />Was wir bauen</p></div>
            <ol className="mt-4 lg:mt-8" aria-label="Disziplinen">
              {DISCIPLINES.map((d, i) => {
                const on = i === active;
                return (
                  <li key={d.key} className="border-b border-line">
                    <button type="button" onClick={() => go(i)} aria-current={on ? "true" : undefined} aria-controls="leistung-detail" className="group flex w-full items-baseline gap-3 py-1.5 text-left sm:gap-5 lg:py-2.5">
                      <span className={`label w-7 shrink-0 tabular-nums transition-colors ${on ? "text-a2" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="block overflow-hidden pr-4">
                        <span data-mask className="block">
                          <span className={`block whitespace-nowrap text-[clamp(1.55rem,4.6vw,4.4rem)] font-light leading-[1.04] tracking-[-0.025em] transition-[color,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)] ${on ? "translate-x-2 text-fg" : "text-fg/25 group-hover:translate-x-1 group-hover:text-fg/60"}`}>{d.title}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* Detail der aktiven Disziplin */}
            <div id="leistung-detail" aria-live="polite" className="mt-4 grid gap-3 lg:mt-7 lg:max-w-[34rem]">
              <p key={D.key + "g"} className="label animate-[rise_.6s_cubic-bezier(.16,1,.3,1)] text-a2">{D.tag}</p>
              <p key={D.key + "t"} className="animate-[rise_.7s_cubic-bezier(.16,1,.3,1)] text-[12px] leading-relaxed text-fg/75 sm:text-[13px]">{D.text}</p>
              <div key={D.key + "p"} className="flex flex-wrap items-center gap-1.5 animate-[rise_.8s_cubic-bezier(.16,1,.3,1)]">
                {D.points.map((p) => <span key={p} className="border border-line-2 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fg/80">{p}</span>)}
                <span className="label ml-1 text-a2">{D.from}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                <a href="#preise" className="btn !py-2" data-scramble-host><Scramble text="Pakete & Preise" hover onView={false} /> <span aria-hidden="true">→</span></a>
                <a href="#termin" className="btn btn-solid !py-2 max-sm:hidden" data-scramble-host><Scramble text="Beratung buchen" hover onView={false} /></a>
              </div>
            </div>
          </div>
          {/* Geräte-Bühne */}
          <div className="relative order-1 min-h-0 lg:order-2">
            <ServicesObject className="absolute inset-0" />
            <p aria-hidden="true" className="label absolute bottom-0 right-0 hidden lg:block"><span className="text-fg">{String(active + 1).padStart(2, "0")}</span> / 0{N} · {D.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
