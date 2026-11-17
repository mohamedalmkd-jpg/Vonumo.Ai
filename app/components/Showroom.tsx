"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { WORK } from "@/lib/content";
import { lenisSnap } from "./lenisSnap";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Showroom (#arbeiten): gepinnte, scroll-gesteuerte Bildfolge – „Image → Scrub → Image“ wie in der Referenz.
 * Intro: riesige Typo, dahinter wächst das erste Projekt aus einem kleinen Fenster auf Vollbild (kontrollierter Zoom).
 * Wechsel: nächstes Projekt schiebt sich per Clip-Maske von unten über das alte, das alte sinkt ab und verdunkelt (Tiefe).
 * Titel laufen durch Masken. Telefon-Mockups schweben mit eigener Parallaxe davor (nur Desktop).
 */
export function Showroom() {
  const wrap = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = wrap.current!;
    const q = gsap.utils.selector(el);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.static = ""; // Projekte untereinander, ohne Zoom und Masken
      return;
    }
    const frames = q<HTMLElement>("[data-frame]");
    const shells = q<HTMLElement>("[data-shell]");
    const media = q<HTMLElement>("[data-media]");
    const shade = q<HTMLElement>("[data-shade]");
    const grads = q<HTMLElement>("[data-grad]");
    const phones = q<HTMLElement>("[data-phone]");
    const lines = frames.map((f) => f.querySelectorAll<HTMLElement>("[data-cl]"));
    const count = q<HTMLElement>("[data-count]")[0], bar = q<HTMLElement>("[data-bar]")[0];
    const narrow = window.innerWidth < 768;
    // Ruhe-Pose: das Projekt setzt sich als gerahmter Bildschirm ab und macht Platz für den Titel
    const SETTLE = narrow
      ? { scale: 0.66, xPercent: 0, yPercent: -9.5, borderRadius: 18 }
      : { scale: 0.66, xPercent: 14, yPercent: -9, borderRadius: 22 };

    gsap.set(frames, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(frames[0], { clipPath: narrow ? "inset(31% 16% 31% 16%)" : "inset(29% 33% 29% 33%)" });
    gsap.set(shells[0], { scale: 1.4 });
    lines.forEach((l) => gsap.set(l, { yPercent: 110 }));
    gsap.set(phones, { yPercent: 50, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    const settle = (i: number, at: number) => {
      tl.to(shells[i], { ...SETTLE, duration: 0.7, ease: "power3.inOut" }, at)
        .to(grads[i], { opacity: 0, duration: 0.5 }, at)
        .to(lines[i], { yPercent: 0, duration: 0.5, stagger: 0.05, ease: "power3.out" }, at + 0.25)
        .to(phones[i], { yPercent: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, at + 0.2)
        .fromTo(media[i], { scale: 1.08 }, { scale: 1, duration: 1.3, ease: "none" }, at);
    };
    tl.to(frames[0], { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" }, 0)
      .to(shells[0], { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
      .to(q("[data-intro]"), { scale: 0.86, opacity: 0, duration: 0.7, ease: "power1.in" }, 0.15);
    settle(0, 1.0);
    const rests: number[] = [];
    let t = 1.75;
    WORK.forEach((_, i) => {
      rests.push(t + 0.25);
      t += 0.55;
      if (i === WORK.length - 1) return;
      // Wechsel: Titel raus, nächstes Projekt schiebt sich vollflächig von unten herein, altes sinkt ab
      tl.to(lines[i], { yPercent: -110, duration: 0.3, stagger: 0.02, ease: "power2.in" }, t)
        .to(phones[i], { yPercent: -50, opacity: 0, duration: 0.5, ease: "power2.in" }, t)
        .to(frames[i + 1], { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut" }, t)
        .fromTo(shells[i + 1], { scale: 1.25, yPercent: 8 }, { scale: 1, yPercent: 0, duration: 1, ease: "power3.inOut" }, t)
        .to(shells[i], { yPercent: SETTLE.yPercent - 14, duration: 1, ease: "power3.inOut" }, t)
        .to(shade[i], { opacity: 0.8, duration: 1, ease: "power2.in" }, t);
      settle(i + 1, t + 0.95);
      t += 1.7;
    });
    tl.to({}, { duration: 0.35 }, t);
    const total = tl.duration();

    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom", animation: tl, scrub: 0.6,
      onUpdate: (s) => {
        const time = s.progress * total;
        const idx = Math.max(0, rests.findLastIndex((r) => time >= r - 0.9));
        if (count) count.textContent = String(idx + 1).padStart(2, "0");
        if (bar) bar.style.transform = `scaleX(${(idx + 1) / WORK.length})`;
      },
    });
    const unsnap = lenisSnap(st, [0, ...rests.map((r) => r / total), 1]);
    return () => { unsnap(); st.kill(); };
  }, { scope: wrap });

  return (
    <section ref={wrap} id="arbeiten" aria-label="Arbeiten – Designstudien aus dem Studio" className="showroom relative" style={{ height: `${WORK.length * 190 + 120}svh` }}>
      <div className="stage sticky top-0 h-[100svh] overflow-hidden">
        {/* Intro: übergroße Typo hinter dem wachsenden Fenster */}
        <div data-intro className="absolute inset-0 mx-auto flex max-w-[1400px] flex-col justify-center px-4 sm:px-6">
          <p className="label flex items-center gap-3"><span className="text-fg">[ 01 ]</span><span className="h-px w-8 bg-line-2" />Ausgewählte Arbeiten</p>
          <h2 className="mt-6 text-[clamp(3.4rem,12.5vw,13rem)] font-extralight leading-[0.88] tracking-[-0.05em]">
            <span className="block">Arbeiten,</span>
            <span className="block pl-[14vw] text-fg/35">die bleiben.</span>
          </h2>
          <p className="label mt-8 max-w-sm normal-case leading-relaxed tracking-normal text-[12px] text-mute">Designstudien aus dem VONUMO-Studio – so arbeiten wir: Marke, Oberfläche und Technik aus einer Hand.</p>
        </div>

        {WORK.map((w, i) => (
          <article key={w.slug} data-frame aria-label={`${w.name} – ${w.kind}`} className="absolute inset-0 overflow-hidden bg-ink">
            <div data-shell className="absolute inset-0 overflow-hidden shadow-[0_50px_120px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.08)] will-change-transform">
              <div data-media className="absolute inset-0 origin-[50%_35%]">
                <picture>
                  <source media="(max-aspect-ratio: 4/5)" srcSet={`/work/${w.slug}-mobile.webp`} />
                  <img src={`/work/${w.slug}-desktop.webp`} alt={`${w.name}: ${w.headline} – Designstudie für ${w.kind}`} className="h-full w-full object-cover object-top" loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable={false} />
                </picture>
              </div>
              <div data-shade className="absolute inset-0 bg-ink opacity-0" />
            </div>
            <div data-grad aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(0deg,rgb(4_4_6/0.85),transparent_45%)]" />

            {/* schwebendes Telefon (eigene Parallaxe) */}
            <div data-phone aria-hidden="true" className="absolute bottom-[-4%] right-[5%] hidden w-[min(14vw,250px)] lg:block">
              <div className="rounded-[2.2rem] bg-[#0c0d12] p-[0.55rem] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_255_255/0.1)]">
                <img src={`/work/${w.slug}-mobile.webp`} alt="" className="block w-full rounded-[1.7rem]" loading="lazy" decoding="async" />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-4 pb-7 sm:px-6 sm:pb-10">
              <div className="overflow-hidden"><p data-cl className="label flex flex-wrap gap-x-3"><span className="text-fg">{String(i + 1).padStart(2, "0")}</span><span>{w.kind}</span><span style={{ color: w.accent }}>Konzeptstudie</span></p></div>
              <h3 className="mt-2 text-[clamp(3.6rem,11vw,11.5rem)] font-extralight leading-[0.9] tracking-[-0.05em]">
                <span className="block overflow-hidden pb-[0.04em]"><span data-cl className="block">{w.name}</span></span>
              </h3>
              <div className="mt-3 grid gap-3 sm:mt-4 lg:max-w-[calc(100%-min(14vw,250px)-4rem)] lg:grid-cols-[minmax(0,28rem)_auto] lg:items-end lg:justify-between">
                <div className="overflow-hidden"><p data-cl className="text-[12px] leading-relaxed text-fg/75 max-sm:line-clamp-3 sm:text-[13px]">{w.text}</p></div>
                <div className="overflow-hidden max-sm:hidden"><ul data-cl className="flex flex-wrap gap-1.5">{w.services.map((s) => <li key={s} className="border border-white/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-fg/80">{s}</li>)}</ul></div>
              </div>
            </div>
          </article>
        ))}

        {/* Zähler + Fortschritt */}
        <div aria-hidden="true" className="counter pointer-events-none absolute left-4 top-[4.5rem] flex items-center gap-3 sm:left-6 md:top-20">
          <span className="label tabular-nums"><span data-count className="text-fg">01</span> / {String(WORK.length).padStart(2, "0")}</span>
          <span className="block h-px w-16 bg-line-2"><span data-bar className="block h-full origin-left bg-fg" style={{ transform: `scaleX(${1 / WORK.length})` }} /></span>
        </div>
      </div>
    </section>
  );
}
