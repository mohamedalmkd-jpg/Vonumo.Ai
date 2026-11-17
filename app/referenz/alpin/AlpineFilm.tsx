"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Referenz „Alpin“ – ein Architekturfilm in drei Einstellungen.
 * Szene 1: Außenaufnahme, Titel im Maskenschnitt.
 * Übergang: Kamerafahrt in die Glasfassade, das Innere öffnet sich als Maske aus der Verglasung.
 * Szene 2: Innenraum, zweiter Titel.
 * Bilder liegen in /public/alpine – für echte Fotografie nur die Pfade unten tauschen.
 */
const PLATES = { exterior: "/alpine/exterior.svg", interior: "/alpine/interior.svg" };

/** Lage der Verglasung im Außenbild (in % der Bildfläche) – Ziel der Kamerafahrt und Startmaske des Innenraums. */
const GLASS = { x: 50, y: 60.5, inset: "inset(46% 29% 16.5% 29%)" };

function Words({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <span data-word className="inline-block will-change-transform">{w}&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

export function AlpineFilm({ serif }: { serif: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      // Diese Seite hat keine WebGL-Bühne: dem globalen Ladebildschirm sofort „bereit“ melden.
      const w = window as unknown as { __stageReady?: boolean; __vonumoLoaded?: boolean };
      w.__stageReady = true;
      window.dispatchEvent(new Event("vonumo:stage-ready"));
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { reduce } = ctx.conditions as { motion: boolean; reduce: boolean };

          if (reduce) {
            // Ohne Bewegung: beide Einstellungen ruhig untereinander, alles sofort sichtbar.
            gsap.set(q("[data-word]"), { yPercent: 0 });
            gsap.set(q("[data-interior]"), { clipPath: "inset(0% 0% 0% 0%)" });
            return;
          }

          // 1 · Auftakt: Titel steigt aus der Maske, Bild atmet leicht nach.
          const intro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
          intro
            .from(q("[data-exterior] img"), { scale: 1.12, duration: 2.4, ease: "power3.out" })
            .from(q("[data-title-1] [data-word]"), { yPercent: 110, duration: 1.4, stagger: 0.08 }, 0.35)
            .from(q("[data-meta-1] > *"), { autoAlpha: 0, y: 12, duration: 1, stagger: 0.06 }, 0.9);

          // Auftakt erst, wenn der Ladebildschirm weg ist.
          const play = () => intro.play();
          if (w.__vonumoLoaded) play();
          else window.addEventListener("vonumo:loaded", play, { once: true });

          // 2 · Gescrubbte Kamerafahrt – vollständig umkehrbar.
          const film = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: q("[data-stage]")[0],
              start: "top top",
              end: "+=320%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          gsap.set(q("[data-title-2] [data-word]"), { yPercent: 110 });
          gsap.set(q("[data-meta-2] > *"), { autoAlpha: 0, y: 12 });

          film
            // Titel verlässt das Bild nach oben, Meta blendet aus
            .to(q("[data-title-1]"), { yPercent: -40, autoAlpha: 0, duration: 0.25, ease: "power2.in" }, 0)
            .to(q("[data-meta-1]"), { autoAlpha: 0, duration: 0.15 }, 0)
            // Push-in auf die Glasfassade
            .to(q("[data-exterior] img"), { scale: 3.4, duration: 0.65, ease: "power2.in" }, 0.05)
            .to(q("[data-exterior]"), { filter: "brightness(1.25)", duration: 0.2 }, 0.5)
            // Innenraum öffnet sich aus der Verglasung heraus
            .fromTo(
              q("[data-interior]"),
              { clipPath: GLASS.inset },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.32, ease: "power3.inOut" },
              0.4,
            )
            .fromTo(q("[data-interior] img"), { scale: 1.35 }, { scale: 1.04, duration: 0.6, ease: "power2.out" }, 0.4)
            // Zweiter Titel
            .to(q("[data-title-2] [data-word]"), { yPercent: 0, duration: 0.2, stagger: 0.025, ease: "expo.out" }, 0.72)
            .to(q("[data-meta-2] > *"), { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.02 }, 0.78)
            // Haltepunkt, damit die Einstellung steht
            .to({}, { duration: 0.12 });

          // 3 · Schluss-Einstellung: Bild öffnet sich von unten.
          gsap.fromTo(
            q("[data-coda-img]"),
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: { trigger: q("[data-coda]")[0], start: "top 85%", end: "top 25%", scrub: 1 },
            },
          );
          gsap.fromTo(
            q("[data-coda-img] img"),
            { scale: 1.3 },
            { scale: 1, ease: "none", scrollTrigger: { trigger: q("[data-coda]")[0], start: "top bottom", end: "bottom top", scrub: true } },
          );
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative bg-[#0e0c0a] text-[#f3efe8]">
      {/* Bühne: Szene 1 + Übergang + Szene 2 in einer gepinnten Leinwand */}
      <section data-stage aria-label="Chalets Cut From Light" className="relative h-[100svh] overflow-hidden motion-reduce:h-auto">
        <div data-exterior className="absolute inset-0 motion-reduce:relative motion-reduce:h-[100svh]">
          <img
            src={PLATES.exterior}
            alt="Chalet mit Glasgiebel vor verschneiten Gipfeln in der blauen Stunde"
            className="h-full w-full object-cover will-change-transform"
            style={{ transformOrigin: `${GLASS.x}% ${GLASS.y}%` }}
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(14_12_10/.55)_0%,transparent_38%,transparent_70%,rgb(14_12_10/.35)_100%)]" />
        </div>

        <header className="absolute inset-x-0 top-0 z-10 px-[5vw] pt-[clamp(5rem,12vh,8rem)]">
          <h1 data-title-1 className={`${serif} max-w-[14ch] text-[clamp(3rem,9.2vw,9.5rem)] leading-[0.9] tracking-[-0.02em]`}>
            <Words text="Chalets Cut From Light" />
          </h1>
        </header>
        <div data-meta-1 className="motion-reduce:hidden absolute bottom-[clamp(1.5rem,5vh,3rem)] left-[5vw] right-[5vw] z-10 flex items-end justify-between gap-6 text-[11px] uppercase tracking-[0.18em] text-white/70">
          <span>N° 01 — Außen</span>
          <span className="max-sm:hidden">1.840 m · Blaue Stunde</span>
          <span>Scrollen</span>
        </div>

        <div
          data-interior
          className="absolute inset-0 z-20 will-change-[clip-path] motion-reduce:relative motion-reduce:h-[100svh]"
          style={{ clipPath: GLASS.inset }}
        >
          <img src={PLATES.interior} alt="Wohnraum mit Panoramafenster, Kamin und Blick auf die Gipfel" className="h-full w-full object-cover will-change-transform" loading="eager" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,rgb(14_12_10/.7)_0%,transparent_45%)]" />
          <div className="absolute inset-x-[5vw] bottom-[clamp(2rem,9vh,6rem)] flex flex-wrap items-end justify-between gap-8">
            <h2 data-title-2 className={`${serif} max-w-[12ch] text-[clamp(2.6rem,7.4vw,7.5rem)] leading-[0.92] tracking-[-0.02em]`}>
              <Words text="Rooms Tuned To Altitude" />
            </h2>
            <div data-meta-2 className="max-w-[30ch] space-y-3 text-[12px] uppercase leading-relaxed tracking-[0.14em] text-white/70">
              <p>N° 02 — Innen</p>
              <p className="normal-case tracking-normal text-[15px] leading-relaxed text-white/80">Lärche, Loden und ein Fenster, das den Berg zum Möbel macht.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Schluss-Einstellung: redaktionelles Layout mit Weißraum */}
      <section data-coda className="relative mx-auto grid max-w-[1400px] gap-[6vw] px-[5vw] py-[18vh] md:grid-cols-[1fr_1.4fr]">
        <div className="self-end">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">N° 03 — Ankommen</p>
          <h3 className={`${serif} mt-6 text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[0.95]`}>Stille als Material.</h3>
          <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed text-white/65">
            Jede Einstellung ist gebaut wie ein Filmbild: eine Achse, ein Licht, ein Gedanke. Die Bewegung folgt dem Scrollen –
            vorwärts wie rückwärts.
          </p>
        </div>
        <figure data-coda-img className="relative aspect-[4/5] overflow-hidden md:aspect-[5/6]">
          <img src={PLATES.exterior} alt="" className="h-full w-full object-cover" style={{ objectPosition: "50% 62%" }} loading="lazy" />
        </figure>
      </section>
    </div>
  );
}
