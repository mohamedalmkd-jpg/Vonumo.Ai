"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { NAV } from "@/lib/content";
import { Logo } from "./Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ids = NAV.map((n) => n.href.slice(1));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
          scrolled || open ? "glass shadow-[0_10px_40px_-15px_rgb(0_0_0/0.8)]" : "border border-transparent"
        }`}
      >
        <a href="#top" className="flex items-center gap-2.5 font-extrabold tracking-[0.2em]" aria-label="VONUMO – zum Seitenanfang">
          <Logo className="h-7 w-7" />
          <span className="text-sm">VONUMO</span>
        </a>
        <nav aria-label="Hauptnavigation" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map((n) => {
              const on = active === n.href.slice(1);
              return (
                <li key={n.href} className="relative">
                  {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/8" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <a href={n.href} aria-current={on ? "true" : undefined} className={`relative block rounded-full px-3.5 py-1.5 transition-colors ${on ? "text-fg" : "text-mute hover:text-fg"}`}>
                    {n.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#termin" className="btn btn-primary hidden !py-2 !px-4 text-sm sm:inline-flex">Termin buchen</a>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line md:hidden"
            aria-expanded={open}
            aria-controls="mnav"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mnav"
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass mx-auto mt-2 max-w-6xl rounded-3xl p-3 md:hidden"
          >
            {NAV.map((n, i) => (
              <motion.a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                className="block rounded-2xl px-4 py-3 text-lg font-semibold hover:bg-white/5"
              >
                {n.label}
              </motion.a>
            ))}
            <a href="#termin" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full">Kostenlosen Termin buchen</a>
          </motion.nav>
        )}
      </AnimatePresence>
      <motion.div aria-hidden="true" style={{ scaleX: progress }} className="fixed inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-a2 via-a1 to-a3" />
    </header>
  );
}
