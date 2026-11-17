"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV } from "@/lib/content";
import { Logo } from "./Logo";
import { Scramble } from "./Scramble";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.href.slice(1)); if (el) io.observe(el); });
    const on = () => setPct(Math.round((window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100));
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", on); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  return (
    <>
      <header className="site-header fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2" aria-label="VONUMO – zum Seitenanfang">
            <Logo className="h-6 w-6 text-fg" />
            <span className="dot text-lg">VONUMO</span>
          </a>
          <nav aria-label="Hauptnavigation" className="hidden md:block">
            <ul className="flex items-center gap-7 text-[11px] uppercase tracking-[0.16em]">
              {NAV.map((n) => {
                const on = active === n.href.slice(1);
                return (
                  <li key={n.href}>
                    <a href={n.href} data-scramble-host aria-current={on ? "true" : undefined} className={`relative py-2 transition-colors ${on ? "text-fg" : "text-mute hover:text-fg"}`}>
                      <Scramble text={n.label} hover onView={false} />
                      {on && <motion.span layoutId="nav-mark" className="absolute -bottom-0.5 left-0 h-px w-full bg-fg" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] tabular-nums text-mute lg:inline">[ {String(pct).padStart(3, "0")}% ]</span>
            <a href="#termin" className="btn hidden !py-2 sm:inline-flex" data-scramble-host><Scramble text="Termin [ → ]" hover onView={false} /></a>
            <button type="button" className="grid h-9 w-9 place-items-center border border-line md:hidden" aria-expanded={open} aria-controls="mnav" aria-label={open ? "Menü schließen" : "Menü öffnen"} onClick={() => setOpen((o) => !o)}>
              <span className="relative block h-2.5 w-4">
                <span className={`absolute left-0 h-px w-4 bg-current transition-all ${open ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-4 bg-current transition-all ${open ? "top-1 -rotate-45" : "top-2"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav id="mnav" aria-label="Mobile Navigation" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid-bg fixed inset-x-0 top-14 z-40 border-b border-line bg-ink p-4 md:hidden">
            {NAV.map((n, i) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between border-b border-line py-4">
                <span className="dot text-4xl">{n.label}</span><span className="label">0{i + 1}</span>
              </a>
            ))}
            <a href="#termin" onClick={() => setOpen(false)} className="btn btn-solid mt-4 w-full">Kostenlosen Termin buchen</a>
          </motion.nav>
        )}
      </AnimatePresence>
      <div aria-hidden="true" className="fixed right-2 top-1/2 z-40 hidden h-40 w-px -translate-y-1/2 bg-line md:block">
        <span className="absolute left-0 top-0 w-px bg-fg transition-[height] duration-200" style={{ height: `${pct}%` }} />
      </div>
    </>
  );
}
