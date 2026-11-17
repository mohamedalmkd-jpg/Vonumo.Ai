"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { LAYERS } from "@/lib/content";

/** Gepinnte Szene: beim Scrollen baut sich eine Website Ebene für Ebene auf. */
export function Layers() {
  const ref = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setI(Math.min(LAYERS.length - 1, Math.max(0, Math.floor(v * LAYERS.length)))));

  const jump = (n: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.offsetTop + ((n + 0.5) / LAYERS.length) * (el.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: "smooth" });
  };

  const L = LAYERS[i];
  return (
    <section ref={ref} id="ebenen" aria-label="Die fünf Ebenen einer Website" className="relative" style={{ height: `${LAYERS.length * 70 + 60}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 pt-16 sm:px-6 md:grid-cols-[1fr_1.1fr] md:gap-10 md:pt-0 [&>*]:min-w-0">
          <div>
            <span className="kicker hidden sm:inline">Unsere Mission · Jede Ebene mit Absicht</span>
            <div className="flex items-center gap-3 font-mono text-sm text-mute sm:mt-6">
              <span>{String(i + 1).padStart(2, "0")} / 05</span>
              <span className="h-px w-10 bg-line" />
              <span className="text-fg">{L.tag}</span>
            </div>
            <div className="relative mt-3 min-h-[9.5rem] sm:mt-4 sm:min-h-[13rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={L.key} initial={{ opacity: 0, y: 20, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -20, filter: "blur(6px)" }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-6xl">{L.title}</h2>
                  <p className="mt-3 max-w-md text-mute sm:mt-5 sm:text-lg">{L.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <ol className="mt-4 flex gap-2 sm:mt-6" aria-label="Ebenen">
              {LAYERS.map((l, n) => (
                <li key={l.key}>
                  <button type="button" onClick={() => jump(n)} aria-label={l.tag} aria-current={n === i ? "step" : undefined}
                    className={`h-10 min-w-12 rounded-xl border px-3 font-mono text-xs transition-all duration-300 ${n === i ? "border-a1 bg-a1/15 text-fg" : n < i ? "border-line text-fg/70" : "border-line text-mute hover:text-fg"}`}>
                    {l.key}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <Mock step={i} />
        </div>
      </div>
    </section>
  );
}

function Mock({ step }: { step: number }) {
  const show = (n: number) => ({ opacity: step >= n ? 1 : 0, y: step >= n ? 0 : 24, scale: step >= n ? 1 : 0.96 });
  const t = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[min(100%,52svh)] [perspective:1400px] md:max-w-none" aria-hidden="true">
      <motion.div animate={{ rotateX: 10 - step * 2, rotateY: -16 + step * 3 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0 overflow-hidden rounded-3xl border border-line bg-ink-2 shadow-[0_40px_120px_-30px_rgb(124_92_255/0.5)] [transform-style:preserve-3d]">
        <motion.div animate={{ opacity: step >= 0 ? 1 : 0 }} className="absolute inset-0 bg-[radial-gradient(80%_80%_at_80%_20%,rgb(124_92_255/0.55),transparent_60%),radial-gradient(60%_60%_at_10%_90%,rgb(34_211_238/0.35),transparent_60%)]" />
        <motion.div animate={show(1)} transition={t} className="absolute inset-x-4 top-4 flex items-center justify-between rounded-full border border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur">
          <span className="h-2.5 w-16 rounded-full bg-white/80" />
          <span className="flex gap-3">{[0, 1, 2].map((k) => <span key={k} className="h-2 w-9 rounded-full bg-white/30" />)}</span>
          <span className="h-5 w-14 rounded-full bg-a1" />
        </motion.div>
        <motion.div animate={show(2)} transition={t} className="absolute right-5 top-[22%] h-[52%] w-[40%] rounded-2xl bg-[conic-gradient(from_200deg,#22d3ee,#7c5cff,#f472b6,#22d3ee)] opacity-90 shadow-2xl">
          <div className="absolute inset-3 rounded-xl bg-[radial-gradient(circle_at_30%_30%,rgb(255_255_255/0.5),transparent_50%)]" />
        </motion.div>
        <motion.div animate={show(3)} transition={t} className="absolute left-6 top-[28%] w-[48%] space-y-3">
          <span className="block h-6 w-[90%] rounded-md bg-white" />
          <span className="block h-6 w-[70%] rounded-md bg-gradient-to-r from-a2 to-a1" />
          <span className="block h-2 w-[85%] rounded bg-white/30" />
          <span className="block h-2 w-[65%] rounded bg-white/30" />
        </motion.div>
        <motion.div animate={show(4)} transition={t} className="absolute bottom-[14%] left-6 flex gap-3">
          <motion.span animate={step >= 4 ? { boxShadow: ["0 0 0 0 rgb(124 92 255/.6)", "0 0 0 14px rgb(124 92 255/0)"] } : {}} transition={{ repeat: Infinity, duration: 1.6 }} className="h-9 w-28 rounded-full bg-gradient-to-r from-a1 to-a2" />
          <span className="h-9 w-24 rounded-full border border-white/20" />
        </motion.div>
      </motion.div>
    </div>
  );
}
