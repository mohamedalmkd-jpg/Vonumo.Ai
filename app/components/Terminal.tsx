"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { SectionHead } from "./Reveal";

type Tok = [string, string];
const LINES: Tok[][] = [
  [["c", "// vonumo · build.ts"]],
  [["k", "import"], ["p", " { "], ["f", "scene"], ["p", ", "], ["f", "brand"], ["p", " } "], ["k", "from"], ["s", " \"@vonumo/studio\""]],
  [],
  [["k", "const"], ["v", " site"], ["p", " = "], ["f", "brand"], ["p", "({ "], ["v", "name"], ["p", ": "], ["s", "\"Ihre Firma\""], ["p", " });"]],
  [["v", "site"], ["p", "."], ["f", "hero"], ["p", "("], ["f", "scene"], ["p", "."], ["f", "mesh"], ["p", "({ "], ["v", "fps"], ["p", ": "], ["n", "60"], ["p", " }));"]],
  [["v", "site"], ["p", "."], ["f", "pages"], ["p", "(["], ["s", "\"Start\""], ["p", ", "], ["s", "\"Leistungen\""], ["p", ", "], ["s", "\"Kontakt\""], ["p", "]);"]],
  [["v", "site"], ["p", "."], ["f", "seo"], ["p", "({ "], ["v", "lang"], ["p", ": "], ["s", "\"de\""], ["p", ", "], ["v", "dsgvo"], ["p", ": "], ["n", "true"], ["p", " });"]],
  [],
  [["k", "await"], ["v", " site"], ["p", "."], ["f", "deploy"], ["p", "("], ["s", "\"edge\""], ["p", ");"]],
];
const COLORS: Record<string, string> = { c: "text-dim", k: "text-a3", f: "text-a2", s: "text-lime", v: "text-fg", n: "text-[#ffb547]", p: "text-mute" };
const TOTAL = LINES.reduce((a, l) => a + l.reduce((b, t) => b + t[1].length, 0) + 1, 0);

export function Terminal() {
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const done = n >= TOTAL;

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(TOTAL); return; }
    let raf = 0, last = 0;
    const tick = (t: number) => { if (t - last > 16) { last = t; setN((v) => Math.min(TOTAL, v + 2)); } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  let left = n;
  return (
    <section id="build" className="relative mx-auto max-w-[1400px] px-4 py-28 sm:px-6 sm:py-36">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
        <SectionHead index="05" label="Live-Build" title="Code, der sich selbst schreibt." sub="Vorschau-Links nach jedem Update, automatisches Deployment und Rückkehr zur letzten Version in Sekunden." />
        <div ref={box} className="hud brackets" role="img" aria-label="Animierter Code-Editor, der eine Website baut und veröffentlicht">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex gap-1.5">{[0, 1, 2].map((k) => <i key={k} className="h-2 w-2 bg-white/25" />)}</span>
            <b className="text-[11px] font-normal uppercase tracking-widest text-mute">build.ts</b>
            <span className={`ml-auto px-2 py-0.5 text-[10px] uppercase tracking-widest ${done ? "bg-lime text-ink" : "border border-line text-mute"}`}>{done ? "fertig" : n > 0 ? "baut …" : "bereit"}</span>
          </div>
          <pre className="min-h-[18rem] overflow-x-auto p-4 text-[12px] leading-7 sm:text-[13px]" aria-hidden="true">
            {LINES.map((line, li) => {
              if (left <= 0) return null;
              const out = line.map(([k, s], ti) => { if (left <= 0) return null; const part = s.slice(0, left); left -= s.length; return <span key={ti} className={COLORS[k]}>{part}</span>; });
              left -= 1;
              const caret = left <= 0 && !done;
              return (
                <div key={li} className="flex">
                  <span className="mr-4 w-5 select-none text-right text-dim">{String(li + 1).padStart(2, "0")}</span>
                  <span>{out}{caret && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-[blink_1s_steps(1)_infinite] bg-a2" />}</span>
                </div>
              );
            })}
          </pre>
          <AnimatePresence>
            {done && (
              <motion.div role="status" initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="m-3 mt-0 flex items-center gap-3 border border-lime/40 bg-lime/10 p-3">
                <span className="grid h-7 w-7 place-items-center bg-lime text-ink"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                <span className="text-[11px] uppercase tracking-widest"><b className="font-medium">Erfolgreich</b><span className="text-mute"> · Build 1,2 s · Ihre Website ist online</span></span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
