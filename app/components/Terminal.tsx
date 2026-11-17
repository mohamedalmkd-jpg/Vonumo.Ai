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
  [["v", "site"], ["p", "."], ["f", "hero"], ["p", "("], ["f", "scene"], ["p", "."], ["f", "orb"], ["p", "({ "], ["v", "fps"], ["p", ": "], ["n", "60"], ["p", " }));"]],
  [["v", "site"], ["p", "."], ["f", "pages"], ["p", "(["], ["s", "\"Start\""], ["p", ", "], ["s", "\"Leistungen\""], ["p", ", "], ["s", "\"Kontakt\""], ["p", "]);"]],
  [["v", "site"], ["p", "."], ["f", "seo"], ["p", "({ "], ["v", "lang"], ["p", ": "], ["s", "\"de\""], ["p", ", "], ["v", "dsgvo"], ["p", ": "], ["n", "true"], ["p", " });"]],
  [],
  [["k", "await"], ["v", " site"], ["p", "."], ["f", "deploy"], ["p", "("], ["s", "\"edge\""], ["p", ");"]],
];
const COLORS: Record<string, string> = { c: "text-mute/70", k: "text-a3", f: "text-a2", s: "text-emerald-300", v: "text-fg", n: "text-amber-300", p: "text-mute" };
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
    const tick = (t: number) => {
      if (t - last > 16) { last = t; setN((v) => Math.min(TOTAL, v + 2)); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  let left = n;
  const status = done ? "fertig" : n > 0 ? "baut …" : "bereit";

  return (
    <section id="build" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] [&>*]:min-w-0">
        <SectionHead kicker="Live-Build" title={<>Code, der sich <span className="grad-text">selbst schreibt</span>.</>} sub="Sie sehen jeden Schritt: Vorschau-Links nach jedem Update, automatisches Deployment und Rückkehr zur letzten Version in Sekunden." />
        <div ref={box} className="relative">
          <div className="absolute -inset-y-6 inset-x-0 -z-10 rounded-[2.5rem] bg-a1/20 blur-3xl" aria-hidden="true" />
          <div className="overflow-hidden rounded-3xl border border-line bg-[#080a12]/90 shadow-2xl" role="img" aria-label="Animierter Code-Editor, der eine Website baut und veröffentlicht">
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <span className="flex gap-1.5">{["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"].map((c) => <i key={c} className={`h-3 w-3 rounded-full ${c}`} />)}</span>
              <b className="font-mono text-xs font-medium text-mute">vonumo · build.ts</b>
              <span className={`ml-auto rounded-full px-2.5 py-0.5 font-mono text-[11px] ${done ? "bg-emerald-400/15 text-emerald-300" : "bg-white/5 text-mute"}`}>{status}</span>
            </div>
            <pre className="min-h-[19rem] overflow-x-auto p-5 font-mono text-[13px] leading-7 sm:text-sm" aria-hidden="true">
              {LINES.map((line, li) => {
                if (left <= 0) return null;
                const out = line.map(([k, s], ti) => {
                  if (left <= 0) return null;
                  const part = s.slice(0, left);
                  left -= s.length;
                  return <span key={ti} className={COLORS[k]}>{part}</span>;
                });
                left -= 1;
                const caret = left <= 0 && !done;
                return (
                  <div key={li} className="flex">
                    <span className="mr-5 w-5 select-none text-right text-mute/40">{li + 1}</span>
                    <span>{out}{caret && <span className="ml-px inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-a2" />}</span>
                  </div>
                );
              })}
            </pre>
            <AnimatePresence>
              {done && (
                <motion.div role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="m-4 mt-0 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 }} className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-ink">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.4 }} /></svg>
                  </motion.span>
                  <span><b className="block">Erfolgreich</b><small className="text-mute">Build fertig in 1,2 s · Ihre Website ist online</small></span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
