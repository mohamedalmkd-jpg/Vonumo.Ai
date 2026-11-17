"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DETAILS } from "@/lib/content";
import { Icon } from "./Icon";
import { SectionHead } from "./Reveal";

// Punkte auf dem 3D-Objekt (in Bildschirm-Anteilen), von denen die Linie startet
const SPOTS = [[0.39, 0.55], [0.49, 0.56], [0.43, 0.7], [0.47, 0.5], [0.44, 0.64]];

/** Gepinnte Szene: links Titel, rechts Feature-Liste; eine Leitlinie verbindet Objekt und aktives Feature. */
export function Details() {
  const sec = useRef<HTMLElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const [i, setI] = useState(0);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sec.current, start: "top top", end: "bottom bottom",
      onUpdate: (s) => setI(Math.min(DETAILS.length - 1, Math.floor(s.progress * DETAILS.length * 0.999))),
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    const upd = () => {
      const r = rows.current[i]?.getBoundingClientRect();
      if (!r || window.innerWidth < 1024) return setLine(null);
      const [sx, sy] = SPOTS[i];
      setLine({ x1: sx * innerWidth, y1: sy * innerHeight, x2: r.left - 8, y2: r.top + 22 });
    };
    upd();
    window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, [i]);

  return (
    <section ref={sec} id="details" className="relative h-[320vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="mx-auto grid h-full max-w-[1400px] gap-6 px-4 pb-6 pt-20 sm:px-6 lg:grid-cols-[1fr_minmax(0,26rem)]">
          <div className="flex flex-col">
            <SectionHead index="03" label="Unser Fundament" title="Details zählen." sub="Eine Website ist mehr als ihre Oberfläche: Jede Schicht wird gebaut, um schnell, sicher und auffindbar zu sein." />
            <a href="#leistungen" className="btn mt-6 hidden self-start lg:inline-flex">Leistungen entdecken <span aria-hidden="true">→</span></a>
          </div>
          <ol className="flex flex-col gap-1.5 self-start lg:self-center" aria-label="Was jedes Projekt mitbringt">
            {DETAILS.map((d, n) => {
              const on = n === i;
              return (
                <li key={d.title} ref={(el) => { rows.current[n] = el; }} className={`hud grid grid-cols-[auto_1fr] gap-x-3 p-3 transition-all duration-500 ${on ? "border-line-2 !bg-white/[0.06]" : "opacity-45"}`}>
                  <span className="label row-span-2 pt-0.5">0{n + 1}</span>
                  <div className="flex items-center justify-between gap-3">
                    <b className="text-[12px] font-medium uppercase tracking-[0.14em]">{d.title}</b>
                    <Icon name={d.icon} className={on ? "text-a2" : "text-mute"} />
                  </div>
                  <p className={`grid text-[11px] uppercase leading-relaxed tracking-wide text-mute transition-all duration-500 ${on ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><span className="overflow-hidden">{d.text}</span></p>
                </li>
              );
            })}
          </ol>
        </div>
        {line && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="rgb(255 255 255 / .35)" strokeDasharray="3 4" className="transition-all duration-500" />
            <rect x={line.x1 - 4} y={line.y1 - 4} width="8" height="8" fill="#fff" />
            <rect x={line.x1 - 11} y={line.y1 - 11} width="22" height="22" fill="none" stroke="rgb(255 255 255 / .5)"><animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" /></rect>
          </svg>
        )}
      </div>
    </section>
  );
}
