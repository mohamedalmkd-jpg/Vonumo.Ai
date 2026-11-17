"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Lightning } from "./Lightning";
import { Scramble } from "./Scramble";
import { Icon } from "./Icon";

/** Hintergrund-Ebene des Heros (unter der 3D-Leinwand): Blitze + riesiger Schriftzug. */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100svh] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(45%_55%_at_50%_48%,rgb(79_107_255/0.22),transparent_70%)]" />
      <Lightning className="absolute inset-0 h-full w-full" />
      <p className="dot absolute inset-x-0 top-[16%] select-none text-center text-[24vw] leading-none text-white/[0.035]">VONUMO</p>
    </div>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = el.querySelectorAll("[data-in]");
    gsap.set(items, { opacity: 0, y: reduce ? 0 : 18 });
    const go = () => gsap.to(items, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out", delay: 0.2 });
    window.addEventListener("vonumo:loaded", go, { once: true });
    // Parallaxe beim Herausscrollen
    const tw = gsap.to(el.querySelector("[data-par]"), { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    return () => { window.removeEventListener("vonumo:loaded", go); tw.scrollTrigger?.kill(); tw.kill(); };
  }, []);

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[620px]">
      <div data-par className="relative mx-auto flex h-full max-w-[1400px] flex-col px-4 pb-6 pt-20 sm:px-6">
        <div data-in className="flex items-start justify-between">
          <p className="label">[ Digitalagentur ]<br /><span className="text-fg">Web · Design · KI</span></p>
          <p className="label text-right">EST. 2026<br /><span className="text-fg">Aus Deutschland</span></p>
        </div>

        {/* HUD-Ecken links und rechts */}
        <div className="pointer-events-none absolute inset-x-4 top-[42%] hidden justify-between sm:inset-x-6 md:flex">
          <div data-in className="brackets max-w-[15rem] px-3 py-2 text-[11px] uppercase leading-snug tracking-wider text-fg/80">Entwickelt für Bewegung.<br />Gebaut, um zu wirken.</div>
          <div data-in className="brackets max-w-[15rem] px-3 py-2 text-right text-[11px] uppercase leading-snug tracking-wider text-fg/80">Designt für morgen.<br />Bereit für alles.</div>
        </div>

        <div className="mt-auto grid items-end gap-6 md:grid-cols-[1fr_auto_1fr]">
          <div data-in className="hud brackets hidden items-center gap-3 p-3 md:flex md:max-w-[16rem]">
            <Icon name="globe" size={22} className="shrink-0 text-mute" />
            <p className="text-[10px] uppercase leading-snug tracking-wider text-mute">Websites, die man fühlt.<br /><span className="text-fg">3D · UI/UX · KI-Systeme</span></p>
          </div>
          <div className="text-center">
            <h1 data-in className="dot text-[clamp(1.9rem,4.6vw,3.6rem)]">
              <Scramble text="Websites mit Tiefe." onView={false} className="block" />
              <span className="block text-mute"><Scramble text="KI mit Wirkung." onView={false} /></span>
            </h1>
            <div data-in className="mt-5 flex flex-wrap justify-center gap-2">
              <a href="#termin" className="btn btn-solid" data-scramble-host><Scramble text="Projekt starten" hover onView={false} /><span aria-hidden="true">→</span></a>
              <a href="#leistungen" className="btn" data-scramble-host><Scramble text="Leistungen" hover onView={false} /></a>
            </div>
          </div>
          <div data-in className="hud brackets ml-auto hidden items-center gap-3 p-3 md:flex md:max-w-[16rem]">
            <Icon name="target" size={22} className="shrink-0 text-mute" />
            <p className="text-[10px] uppercase leading-snug tracking-wider text-mute">2–4 Wochen bis live.<br /><span className="text-fg">Wartung inklusive</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
