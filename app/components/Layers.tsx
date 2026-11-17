"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LAYERS } from "@/lib/content";
import { SectionHead } from "./Reveal";
import { Scramble } from "./Scramble";

/** Inhalt jeder Platte – eine Website in fünf Schichten. */
function Plate({ n }: { n: number }) {
  if (n === 0) return <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_30%,#4f6bff,transparent_70%),radial-gradient(60%_60%_at_80%_80%,#ff4fa8,transparent_70%),#0b0b1a]" />;
  if (n === 1) return (
    <div className="absolute inset-x-[8%] top-[8%] flex items-center justify-between border border-white/25 bg-black/50 px-3 py-2">
      <i className="h-1.5 w-10 bg-white" /><span className="flex gap-2">{[0, 1, 2].map((k) => <i key={k} className="h-1 w-6 bg-white/50" />)}</span><i className="h-3 w-8 bg-a2" />
    </div>
  );
  if (n === 2) return <div className="absolute inset-[22%] bg-[conic-gradient(from_200deg,#33e1ff,#4f6bff,#ff4fa8,#c4ff3d,#33e1ff)] shadow-[0_0_60px_rgb(79_107_255/.6)]" />;
  if (n === 3) return (
    <div className="absolute inset-[12%] flex flex-col justify-center gap-2">
      <span className="dot text-6xl text-white">Aa</span><i className="h-1.5 w-4/5 bg-white/70" /><i className="h-1.5 w-3/5 bg-white/40" />
    </div>
  );
  return (
    <div className="absolute inset-x-[12%] bottom-[14%] flex gap-2">
      <i className="h-8 w-24 bg-white shadow-[0_0_30px_rgb(255_255_255/.6)]" /><i className="h-8 w-16 border border-white/60" />
    </div>
  );
}

export function Layers() {
  const sec = useRef<HTMLElement>(null);
  const marks = useRef<(HTMLSpanElement | null)[]>([]);
  const label = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [line, setLine] = useState<number[] | null>(null);
  const i = Math.min(LAYERS.length - 1, Math.floor(p * LAYERS.length * 0.999));
  const spread = Math.min(1, p * 2.2);

  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: sec.current, start: "top top", end: "bottom bottom", onUpdate: (s) => setP(s.progress) });
    return () => st.kill();
  }, []);

  useEffect(() => {
    const m = marks.current[i]?.getBoundingClientRect(), l = label.current?.getBoundingClientRect(), s = sec.current?.querySelector("[data-sticky]")?.getBoundingClientRect();
    if (!m || !l || !s) return;
    const right = l.left > m.right;
    setLine([m.left + 4 - s.left, m.top + 4 - s.top, (right ? l.left : l.left + 24) - s.left, l.top + 14 - s.top]);
  }, [i, p]);

  const L = LAYERS[i];
  return (
    <section ref={sec} id="ebenen" className="relative h-[360vh]" aria-label="Technologie – fünf Ebenen einer Website">
      <div data-sticky className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="mx-auto grid h-full max-w-[1400px] grid-rows-[auto_1fr_auto] px-4 pb-6 pt-20 sm:px-6">
          <SectionHead index="03" label="Technologie" title="Jede Ebene mit Absicht." className="max-w-xl" />

          <div className="relative grid place-items-center [perspective:1600px]">
            <div className="relative h-[min(42vw,320px)] w-[min(42vw,320px)] max-sm:h-[52vw] max-sm:w-[52vw]" style={{ transformStyle: "preserve-3d", transform: `rotateX(58deg) rotateZ(${-42 + p * 18}deg)` }}>
              {LAYERS.map((l, n) => {
                const z = (n - 2) * (14 + spread * 52);
                const on = n === i;
                return (
                  <div key={l.key} className="absolute inset-0 border transition-[border-color,box-shadow,opacity] duration-500"
                    style={{ transform: `translateZ(${z}px)`, borderColor: on ? "rgb(255 255 255 / .9)" : "rgb(255 255 255 / .18)", background: n === 0 ? undefined : "rgb(12 12 20 / .55)", boxShadow: on ? "0 0 50px rgb(79 107 255 / .45)" : "none", opacity: n > i + 1 ? 0.35 : 1 }}>
                    <Plate n={n} />
                    <span ref={(el) => { marks.current[n] = el; }} className={`absolute right-[6%] top-[6%] h-2 w-2 ${on ? "bg-white" : "bg-white/30"}`} />
                    <span className="absolute bottom-1 left-2 text-[9px] uppercase tracking-widest text-white/50">{String(n + 1).padStart(2, "0")} · {l.key}</span>
                  </div>
                );
              })}
            </div>
            <div ref={label} className="hud brackets absolute right-0 top-[8%] w-[min(19rem,80vw)] p-4 max-md:bottom-0 max-md:top-auto max-md:left-0 max-md:right-auto" aria-live="polite">
              <div className="flex items-center justify-between"><span className="label">{String(i + 1).padStart(2, "0")} / 05</span><span className="label text-a2">{L.tag}</span></div>
              <Scramble key={L.key} as="h3" text={L.title} onView={false} className="dot mt-3 block text-3xl" />
              <p className="mt-2 text-[11px] uppercase leading-relaxed tracking-wide text-mute">{L.text}</p>
            </div>
          </div>

          <p className="max-w-sm text-[11px] uppercase leading-relaxed tracking-wide text-mute max-md:hidden">Hintergrund, Navigation, Bild, Typografie, Interaktion – scrollen Sie, und die Website zerlegt sich in ihre Schichten.</p>
        </div>
        {line && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <polyline points={`${line[0]},${line[1]} ${line[0] + (line[2] - line[0]) * 0.35},${line[3]} ${line[2]},${line[3]}`} fill="none" stroke="rgb(255 255 255 / .55)" strokeWidth="1" />
            <rect x={line[0] - 5} y={line[1] - 5} width="10" height="10" fill="none" stroke="#fff" />
          </svg>
        )}
      </div>
    </section>
  );
}
