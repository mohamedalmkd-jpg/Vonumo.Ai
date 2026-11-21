"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Scramble } from "./Scramble";
import { FlightScene } from "./three";
import { Icon } from "./Icon";
import { HeroHotspots } from "./HeroHotspots";
import { CHAPTERS, chapterAt, flight } from "./three/flight";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Zeichen einzeln (für die Unschärfe-Enthüllung). Ganzer Text bleibt für Screenreader lesbar. */
function Chars({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((w, i, a) => (
          <span key={i} className="inline-block whitespace-nowrap">
            {[...w].map((c, j) => <span key={j} data-ch className="inline-block">{c}</span>)}
            {i < a.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </>
  );
}

// Zielpunkte beim Einrasten (innerhalb der Ruhebereiche, damit der leichte Vorschub sichtbar bleibt)
const REST_FWD = CHAPTERS.map((c, i) => (i === 0 ? 0 : c.from + (c.to - c.from) * 0.35));
const REST_BACK = CHAPTERS.map((c, i) => (i === 0 ? 0 : i === CHAPTERS.length - 1 ? 0.985 : c.to - (c.to - c.from) * 0.3));
const TITLES = ["Studio", "Näher am Studio", "Der Einblick", "Im Studio", "Unsere Expertise", "Die Lösung"];

const H2 = "text-[clamp(2.2rem,4.4vw,4.3rem)] font-light leading-[1.04] tracking-[-0.02em] text-fg/95";
const EYEBROW = "label font-mono tracking-[0.2em]";
const Arrow = () => <span aria-hidden="true">↗</span>;

/**
 * Hero als eine durchgehende Kamerafahrt (800svh Scrollweg, Bühne klebt oben) durch das VONUMO-Studio:
 * 01 Totale · 02 näher am Studio · 03 Einblick durch die Fassade · 04 Arbeitsplätze (Bildschirme starten)
 * · 05 V-Skulptur · 06 Schlussbild. Text erscheint erst, wenn die Kamera ruht; rückwärts läuft alles umgekehrt.
 */
export function Hero() {
  const wrap = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = wrap.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ch = gsap.utils.toArray<HTMLElement>("[data-chapter]", el);
    const tls: (gsap.core.Timeline | null)[] = ch.map(() => null);
    const root = document.documentElement;
    let current = -2;
    let loaded = !!(window as unknown as { __vonumoLoaded?: boolean }).__vonumoLoaded;
    gsap.set(ch, { autoAlpha: 0 });

    const enter = (i: number) => {
      const c = ch[i];
      tls[i]?.kill();
      gsap.killTweensOf(c);
      gsap.set(c, { autoAlpha: 1 });
      const tl = gsap.timeline();
      tls[i] = tl;
      if (reduce) return;
      const q = gsap.utils.selector(c);
      const up = { y: 14, opacity: 0, filter: "blur(6px)" };
      const to = { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9, ease: "power3.out" };
      tl.fromTo(q("[data-eyebrow]"), up, to)
        .fromTo(q("[data-ch]"), { opacity: 0, filter: "blur(10px)", x: -6 }, { opacity: 1, filter: "blur(0px)", x: 0, duration: 0.85, stagger: 0.025, ease: "power3.out" }, 0.1)
        .fromTo(q("[data-line]"), { clipPath: "inset(100% 0 0 0)", opacity: 0 }, { clipPath: "inset(0% 0 0 0)", opacity: 1, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 0.1)
        .fromTo(q("[data-up]"), up, { ...to, stagger: 0.08 }, 0.4);
    };
    const leave = (i: number) => {
      tls[i]?.kill();
      gsap.to(ch[i], { autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: "power2.out", overwrite: true });
    };
    const sync = (p: number) => {
      flight.p = p;
      const next = chapterAt(p);
      // Navigation weicht während der Kamerafahrten
      if (next === -1 && p > CHAPTERS[0].to) root.dataset.immersive = ""; else delete root.dataset.immersive;
      if (!loaded) return;
      if (next === current) return;
      if (current >= 0) leave(current);
      if (next >= 0) enter(next);
      current = next;
      flight.chapter = next;
      el.querySelectorAll<HTMLElement>("[data-dot]").forEach((d, k) => { d.dataset.on = k === next ? "1" : "0"; });
    };

    const st = ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", onUpdate: (s) => sync(s.progress) });
    const vis = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (flight.visible = s.isActive) });
    flight.visible = vis.isActive || window.scrollY < el.offsetHeight;

    const onLoaded = () => { loaded = true; flight.started = true; sync(st.progress); };
    if (loaded) onLoaded(); else window.addEventListener("vonumo:loaded", onLoaded, { once: true });

    // Einrasten: eine Scroll-Geste = eine Kamerafahrt (richtungsabhängig, über Lenis). QA: ?nosnap hält jede Zwischenposition.
    const noSnap = new URLSearchParams(window.location.search).has("nosnap");
    let idle = 0, touching = false, dir = 1;
    const snap = () => {
      const lenis = window.__lenis;
      if (!lenis || touching || reduce || noSnap) return;
      const p = st.progress;
      if (p <= 0.001 || p >= 0.999) return;
      if (chapterAt(p) >= 0) return;
      const list = dir > 0 ? REST_FWD : REST_BACK;
      const target = dir > 0 ? list.find((r) => r > p) ?? 1 : [...list].reverse().find((r) => r < p) ?? 0;
      lenis.scrollTo(st.start + target * (st.end - st.start), { duration: 1.35, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    };
    const onScroll = () => {
      const lenis = window.__lenis;
      if (lenis && lenis.direction) dir = lenis.direction;
      clearTimeout(idle);
      idle = window.setTimeout(snap, 180);
    };
    const t0 = () => (touching = true), t1 = () => { touching = false; onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", t0, { passive: true });
    window.addEventListener("touchend", t1, { passive: true });

    return () => {
      clearTimeout(idle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", t0);
      window.removeEventListener("touchend", t1);
      window.removeEventListener("vonumo:loaded", onLoaded);
      delete root.dataset.immersive;
      st.kill(); vis.kill();
    };
  }, { scope: wrap });

  const goto = (k: number) => {
    const el = wrap.current; if (!el) return;
    const y = el.offsetTop + REST_FWD[k] * (el.offsetHeight - window.innerHeight);
    const l = window.__lenis; if (l) l.scrollTo(y, { duration: 1.6 }); else window.scrollTo(0, y);
  };

  return (
    <section ref={wrap} id="top" aria-label="Einleitung" className="relative h-[800svh]">
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        {/* Echte 3D-Szene: Blender-Pavillon, Innenraum, Bildschirme, V-Skulptur – three/FlightScene.tsx + three/Studio.tsx */}
        <FlightScene className="absolute inset-0" />
        {/* Lesbarkeit: weicher Verlauf hinter dem Text */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_4_6/0.55),transparent_45%)] md:bg-[linear-gradient(90deg,rgb(4_4_6/0.5),transparent_48%)]" />

        {/* 01 – Studio (Totale) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="absolute left-4 right-4 top-[11%] sm:left-6 md:top-[22%] md:max-w-[40rem]">
            <p data-eyebrow className={EYEBROW}>01 / VONUMO Studio</p>
            <h1 className="mt-4 text-[clamp(2.2rem,4.2vw,4.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-fg/95">
              <span className="block"><Chars text="Websites, Interfaces" /></span>
              <span className="block"><Chars text="und KI-Systeme" /></span>
              <span className="block font-semibold"><Chars text="mit Wirkung." /></span>
            </h1>
            <p data-up className="mt-4 max-w-[26rem] text-[13px] leading-relaxed text-fg/75 sm:mt-5 sm:text-[15px]">Das digitale Studio für Web Design, Software-Entwicklung und KI-Lösungen für ambitionierte Unternehmen.</p>
            <div data-up className="pointer-events-auto mt-5 flex flex-wrap gap-2 sm:mt-7">
              <a href="#termin" className="btn btn-solid" data-scramble-host><Scramble text="Projekt starten" hover onView={false} /><Arrow /></a>
              <a href="#leistungen" className="btn" data-scramble-host><Scramble text="Leistungen entdecken" hover onView={false} /><Arrow /></a>
            </div>
          </div>
          <ul data-up className="absolute bottom-8 left-6 hidden w-[min(46rem,52%)] grid-cols-4 divide-x divide-line-2 text-center text-[12px] leading-snug text-fg/85 md:grid">
            {[["globe", "Web Design & Experience"], ["code", "Software-Entwicklung"], ["layers", "KI-Systeme & Automatisierung"], ["bars", "Daten, Trading & Analytics"]].map(([i, t]) => (
              <li key={t} className="flex flex-col items-center gap-2 px-3"><Icon name={i} size={20} className="text-fg" />{t}</li>
            ))}
          </ul>
          <p data-up className="label absolute bottom-6 right-4 text-right sm:right-6 md:hidden">2–4 Wochen bis live<br /><span className="text-fg">Wartung inklusive</span></p>
        </div>

        {/* 02 – Näher am Studio */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <p data-eyebrow className={`${EYEBROW} absolute left-4 top-[11%] sm:left-6 md:top-[12%]`}>02 / Näher am Studio</p>
          <p className="absolute bottom-20 right-4 max-w-[19rem] border-l border-line-2 pl-5 text-[clamp(1.25rem,1.9vw,1.6rem)] font-light leading-snug text-fg sm:right-6 md:bottom-24">
            <span className="sr-only">Ein Studio, das Strategie, Design und Technologie vereint.</span>
            {["Ein Studio, das", "Strategie, Design und", "Technologie vereint."].map((l) => <span key={l} aria-hidden="true" data-line className="block">{l}</span>)}
          </p>
        </div>

        {/* 03 – Der Einblick (Fassade) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="absolute left-4 right-4 top-[11%] sm:left-6 md:top-[18%] md:max-w-[30rem]">
            <p data-eyebrow className={EYEBROW}>03 / Der Einblick</p>
            <h2 className={`mt-4 ${H2}`}>
              <span className="block"><Chars text="Digitale Erlebnisse," /></span>
              <span className="block"><Chars text="die Marken stärken." /></span>
            </h2>
            <p data-up className="mt-4 max-w-[24rem] text-[13px] leading-relaxed text-fg/75 sm:text-[15px]">Websites, Interfaces und KI-Lösungen, die nicht nur gut aussehen, sondern messbar Ergebnisse liefern.</p>
            <div data-up className="pointer-events-auto mt-6 flex flex-wrap gap-2">
              <a href="#leistungen" className="btn btn-solid" data-scramble-host><Scramble text="Leistungen ansehen" hover onView={false} /><Arrow /></a>
              <a href="#arbeiten" className="btn" data-scramble-host><Scramble text="Projekte entdecken" hover onView={false} /><Arrow /></a>
            </div>
          </div>
          <ul data-up className="absolute bottom-8 left-4 hidden gap-2 sm:left-6 md:flex">
            {[["bolt", "Performance"], ["layers", "Design & UX"], ["chip", "KI & Automatisierung"]].map(([i, t]) => (
              <li key={t} className="hud flex items-center gap-2 px-4 py-2.5 text-[12px] text-fg/90"><Icon name={i} size={16} />{t}</li>
            ))}
          </ul>
        </div>

        {/* 04 – Im Studio (Arbeitsplätze, Bildschirme starten) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <p data-eyebrow className={`${EYEBROW} absolute left-4 top-[11%] sm:left-6 md:top-[12%]`}>04 / Im Studio</p>
          <h2 className="absolute bottom-24 left-4 max-w-[26rem] text-[clamp(1.9rem,3.2vw,3rem)] font-light leading-[1.06] tracking-[-0.02em] text-fg sm:left-6 md:bottom-12">
            <span className="block"><Chars text="Technologie," /></span>
            <span className="block"><Chars text="Kreativität und KI" /></span>
            <span className="block"><Chars text="unter einem Dach." /></span>
          </h2>
          <p data-up className="absolute bottom-14 right-6 hidden max-w-[22rem] border-l border-line-2 pl-5 text-[13px] leading-relaxed text-fg/80 md:block">Ein interdisziplinäres Team aus Design, Entwicklung und KI – mit einem Ziel: digitale Produkte, die einen echten Unterschied machen.</p>
        </div>

        {/* 05 – Unsere Expertise (V-Skulptur) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="absolute left-4 right-4 top-[11%] sm:left-6 md:top-[16%] md:max-w-[26rem]">
            <p data-eyebrow className={EYEBROW}>05 / Unsere Expertise</p>
            <h2 className={`mt-4 ${H2}`}>
              <span className="block"><Chars text="Von der Idee" /></span>
              <span className="block"><Chars text="zum digitalen" /></span>
              <span className="block"><Chars text="Produkt." /></span>
            </h2>
            <p data-up className="mt-4 hidden text-[13px] leading-relaxed text-fg/75 sm:block sm:text-[14px]">Wir konzipieren, gestalten und entwickeln hochwertige Websites, Plattformen und KI-Systeme – individuell, performant und zukunftssicher.</p>
            <ul data-up className="pointer-events-auto mt-6 hidden w-[17rem] space-y-2 md:block">
              {[["bars", "Web Design & UX"], ["code", "Software-Entwicklung"], ["spark", "KI-Lösungen"], ["bars", "Trading & Analytics"]].map(([i, t]) => (
                <li key={t}><a href="#leistungen" className="hud group flex items-center gap-3 px-4 py-3 text-[13px] text-fg/90 transition-colors hover:border-a2 hover:text-fg"><Icon name={i} size={16} />{t}<span aria-hidden="true" className="ml-auto transition-transform group-hover:translate-x-1">→</span></a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* 06 – Die Lösung (Schlussbild) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="absolute left-4 right-4 top-[11%] sm:left-6 md:top-[13%] md:max-w-[38rem]">
            <p data-eyebrow className={EYEBROW}>06 / Die Lösung</p>
            <h2 className={`mt-4 ${H2}`}>
              <span className="block"><Chars text="Digitale Lösungen für" /></span>
              <span className="block"><Chars text="ambitionierte Unternehmen." /></span>
            </h2>
            <p data-up className="mt-4 max-w-[30rem] text-[13px] leading-relaxed text-fg/75 sm:text-[14px]">Websites, Software, KI-Systeme und datengetriebene Plattformen – integriert, skalierbar und mit messbarem Impact.</p>
            <div data-up className="pointer-events-auto mt-6 flex flex-wrap gap-2">
              <a href="#termin" className="btn btn-solid" data-scramble-host><Scramble text="Projekt starten" hover onView={false} /><Arrow /></a>
              <a href="#termin" className="btn" data-scramble-host><Scramble text="Strategie-Gespräch buchen" hover onView={false} /><Arrow /></a>
            </div>
          </div>
          {/* Fakten statt erfundener Kennzahlen – alles Zusagen aus unseren Leistungen */}
          <ul data-up className="absolute bottom-8 left-1/2 hidden w-[min(64rem,92%)] -translate-x-1/2 grid-cols-4 divide-x divide-line-2 text-center md:grid">
            {[["2–4 Wochen", "bis zum Launch"], ["DSGVO", "konform & ohne Tracking"], ["Ihr Code", "volles Eigentum"], ["∞", "skalierbare Lösungen"]].map(([a, b]) => (
              <li key={b} className="px-4"><p className="text-[clamp(1.4rem,2.2vw,2rem)] font-light text-fg">{a}</p><p className="mt-1 text-[12px] text-fg/70">{b}</p></li>
            ))}
          </ul>
        </div>

        <HeroHotspots />
        {/* Kapitel-Anzeige – klickbar */}
        <div className="pointer-events-auto absolute right-6 top-1/2 z-[6] hidden -translate-y-1/2 flex-col gap-0.5 md:flex" role="group" aria-label="Kapitel">
          {TITLES.map((t, k) => (
            <button key={t} type="button" data-dot data-on={k === 0 ? "1" : "0"} aria-label={`Kapitel ${k + 1}: ${t}`} onClick={() => goto(k)} className="group grid h-6 w-6 place-items-center">
              <span className="block h-2 w-2 border border-fg/60 transition-colors group-hover:border-fg group-data-[on=1]:bg-fg" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
