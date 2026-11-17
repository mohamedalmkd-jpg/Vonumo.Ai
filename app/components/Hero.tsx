"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Scramble } from "./Scramble";
import { DetailObject, FlightScene } from "./three";
import { HeroHotspots } from "./HeroHotspots";
import { HeroDepth } from "./three";
import { CHAPTERS, flight } from "./three/flight";
import { DISCIPLINES } from "@/lib/content";

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

const SWATCHES = ["#4f6bff", "#33e1ff", "#ff4fa8", "#c4ff3d", "#ecedf3"];
// Zielpunkte beim Einrasten (innerhalb der Ruhebereiche, damit der leichte Vorschub sichtbar bleibt)
const REST_FWD = [0, 0.34, 0.86];
const REST_BACK = [0, 0.48, 0.97];

/**
 * Hero als Kamerafahrt (docs/animation-spec.md): 400svh Scrollweg, Bühne klebt oben.
 * Drei Kapitel – Studio (Totale), Detail (Fassade), Erlebnis (Innenraum).
 */
export function Hero() {
  const photo = typeof window === "undefined" || new URLSearchParams(window.location.search).get("capture") !== "reel";
  const wrap = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = wrap.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ch = gsap.utils.toArray<HTMLElement>("[data-chapter]", el);
    const tls: (gsap.core.Timeline | null)[] = [null, null, null];
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
      if (i === 1) {
        tl.fromTo(q("[data-line]"), { clipPath: "inset(100% 0 0 0)", opacity: 0 }, { clipPath: "inset(0% 0 0 0)", opacity: 1, duration: 1.15, stagger: 0.12, ease: "expo.out" })
          .fromTo(q("[data-card]"), { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out" }, 0.15)
          .fromTo(q("[data-up]"), up, { ...to, stagger: 0.08 }, 0.3);
      } else {
        tl.fromTo(q("[data-eyebrow]"), up, to)
          .fromTo(q("[data-ch]"), { opacity: 0, filter: "blur(10px)", x: -6 }, { opacity: 1, filter: "blur(0px)", x: 0, duration: 0.85, stagger: 0.03, ease: "power3.out" }, 0.1)
          .fromTo(q("[data-up]"), up, { ...to, stagger: 0.08 }, 0.45);
      }
    };
    const leave = (i: number) => {
      tls[i]?.kill();
      gsap.to(ch[i], { autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: "power2.out", overwrite: true });
    };
    const chapterAt = (p: number) => (p < CHAPTERS[0].to ? 0 : p >= CHAPTERS[1].from && p <= CHAPTERS[1].to ? 1 : p >= CHAPTERS[2].from ? 2 : -1);
    const sync = (p: number) => {
      flight.p = p;
      // Navigation weicht während der Fahrt und im Kapitel „Detail“ (wie in der Referenz)
      const immersive = p > CHAPTERS[0].to && p < CHAPTERS[2].from;
      if (immersive) root.dataset.immersive = ""; else delete root.dataset.immersive;
      if (!loaded) return;
      const next = chapterAt(p);
      if (next === current) return;
      if (current >= 0) leave(current);
      if (next >= 0) enter(next);
      current = next;
      flight.chapter = next;
    };

    const poster = el.querySelector<HTMLElement>("[data-hero-poster]");
    const hidePoster = () => { if (poster) poster.style.opacity = "0"; };
    // The WebGL view can become ready before this effect subscribes.
    if ((window as unknown as { __vonumoHeroReady?: boolean }).__vonumoHeroReady) hidePoster();
    else window.addEventListener("vonumo:hero-ready", hidePoster, { once: true });
    const st = ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", onUpdate: (s) => sync(s.progress) });
    const vis = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (flight.visible = s.isActive) });
    flight.visible = vis.isActive || window.scrollY < el.offsetHeight;

    const onLoaded = () => { loaded = true; flight.started = true; sync(st.progress); };
    if (loaded) onLoaded(); else window.addEventListener("vonumo:loaded", onLoaded, { once: true });

    // Einrasten: eine Scroll-Geste = eine Kamerafahrt (richtungsabhängig, über Lenis)
    let idle = 0, touching = false, dir = 1;
    const snap = () => {
      const lenis = window.__lenis;
      if (!lenis || touching || reduce) return;
      const p = st.progress;
      if (p <= 0.001 || p >= 0.999) return;
      if (CHAPTERS.some((c) => p >= c.from && p <= c.to)) return;
      const list = dir > 0 ? REST_FWD : REST_BACK;
      const target = dir > 0 ? list.find((r) => r > p) ?? 1 : [...list].reverse().find((r) => r < p) ?? 0;
      lenis.scrollTo(st.start + target * (st.end - st.start), { duration: 1.25, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
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
      window.removeEventListener("vonumo:hero-ready", hidePoster);
      delete root.dataset.immersive;
      st.kill(); vis.kill();
    };
  }, { scope: wrap });

  return (
    <section ref={wrap} id="top" aria-label="Einleitung" className="relative h-[400svh]">
      <div className="sticky top-0 h-[100svh] min-h-[560px] overflow-hidden">
        {/* Foto-Hero nach den Design-Bildern; der 3D-Pavillon bleibt für die Film-Aufnahme (?capture=reel) */}
        {photo ? (
          <>
            {/* 2.5D-Bühne (WebGL, hinter dem DOM). Poster deckt nur bis zur ersten gerenderten Szene ab. */}
            <HeroDepth className="absolute inset-0" />
            <img data-hero-poster src="/hero/exterior.webp" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" />
          </>
        ) : <FlightScene className="absolute inset-0" />}
        {/* Lesbarkeit: weicher Verlauf hinter dem Text */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(4_4_6/0.55),transparent_45%)] md:bg-[linear-gradient(90deg,rgb(4_4_6/0.6),transparent_55%)]" />

        {/* Kapitel 01 – Studio */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="absolute left-4 right-4 top-[11%] sm:left-6 md:top-[30%] md:max-w-[52rem]">
            <p data-eyebrow className="label">01 / Studio</p>
            <h1 className="mt-4 text-[clamp(2.2rem,4.2vw,4.2rem)] font-light leading-[1.04] tracking-[-0.02em] text-fg/95">
              <span className="block"><Chars text="Websites mit Tiefe." /></span>
              <span className="block text-fg/60"><Chars text="KI mit Wirkung." /></span>
            </h1>
            <p data-up className="mt-4 max-w-[26rem] text-[12px] leading-relaxed text-mute sm:mt-5 sm:text-[13px]">3D-Websites, UI/UX-Design und KI-Systeme für Unternehmen. Entworfen und gebaut in Deutschland.</p>
            <div data-up className="pointer-events-auto mt-5 flex flex-wrap gap-2 sm:mt-7">
              <a href="#termin" className="btn btn-solid" data-scramble-host><Scramble text="Projekt starten" hover onView={false} /><span aria-hidden="true">→</span></a>
              <a href="#leistungen" className="btn" data-scramble-host><Scramble text="Leistungen" hover onView={false} /></a>
            </div>
          </div>
          <p data-up className="label absolute bottom-6 left-4 sm:left-6">Scrollen <span aria-hidden="true">↓</span></p>
          <p data-up className="label absolute bottom-6 right-4 text-right sm:right-6">2–4 Wochen bis live<br /><span className="text-fg">Wartung inklusive</span></p>
        </div>

        {/* Kapitel 02 – Detail (senkrechte Typo + Inset) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <p className="label absolute left-4 top-6 sm:left-6">02 / Detail</p>
          <h2 className="absolute left-4 top-[24%] text-[clamp(2.8rem,5.6vw,6rem)] font-light uppercase leading-[0.98] tracking-[-0.01em] text-fg sm:left-6 md:top-[22%]">
            <span className="sr-only">Jedes Pixel zählt.</span>
            {["Jedes", "Pixel", "zählt."].map((w) => (
              <span key={w} aria-hidden="true" data-line className="block">{w}</span>
            ))}
          </h2>
          <div className="absolute bottom-6 left-4 sm:left-6">
            <div data-card className="brackets relative h-[7.5rem] w-[12rem] border border-line-2 sm:h-[8.5rem] sm:w-[14rem]">
              {photo
                ? <div aria-hidden="true" className="absolute inset-0 bg-[url(/hero/interior.webp)] bg-[length:520%_auto] bg-[position:48.5%_58%]" />
                : <DetailObject className="absolute inset-0" />}
              <span className="label absolute bottom-2 left-2 text-[10px] text-fg/80">Material · Licht · Form</span>
            </div>
            <a data-up href="#leistungen" className="btn pointer-events-auto mt-3 !py-2" data-scramble-host><Scramble text="Leistungen ansehen" hover onView={false} /></a>
          </div>
        </div>

        {/* Kapitel 03 – Erlebnis (Innenraum) */}
        <div data-chapter className="invisible absolute inset-0 mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="absolute left-4 right-4 top-[14%] sm:left-6 md:top-[30%] md:max-w-[44rem]">
            <p data-eyebrow className="label">03 / Erlebnis</p>
            <h2 className="mt-4 text-[clamp(2.5rem,5vw,5rem)] font-light leading-[1.04] tracking-[-0.02em] text-fg/90">
              <span className="block"><Chars text="Interfaces, die" /></span>
              <span className="block"><Chars text="man betritt." /></span>
            </h2>
          </div>
          <div data-up className="absolute bottom-6 left-4 sm:left-6">
            <div className="flex gap-1.5">{SWATCHES.map((c) => <span key={c} className="block h-6 w-6 border border-line" style={{ background: c }} />)}</div>
            <p className="label mt-3 max-w-[16rem] leading-relaxed">Farbe · Licht · Tiefe<span className="hidden sm:inline"><br /><span className="text-fg/80">Jedes Projekt bekommt sein eigenes Designsystem.</span></span></p>
          </div>
          <div data-up className="absolute bottom-6 right-4 text-right sm:right-6">
            <ul className="hidden space-y-1 text-[11px] uppercase tracking-[0.14em] text-fg/80 sm:block">
              {DISCIPLINES.map((d) => <li key={d.key}>{d.title}</li>)}
            </ul>
            <a href="#termin" className="btn btn-solid pointer-events-auto mt-4 !py-2" data-scramble-host><Scramble text="Projekt starten" hover onView={false} /><span aria-hidden="true">→</span></a>
          </div>
        </div>
        {photo && <HeroHotspots />}
      </div>
    </section>
  );
}
