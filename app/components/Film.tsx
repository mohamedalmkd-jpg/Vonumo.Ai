"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Vollbild-Film (#film): vorgerenderter Studio-Film aus scripts/render-reel.cjs.
 * Wächst beim Scrollen aus einem Fenster auf Vollbild (wie der Showroom), spielt nur im Bild,
 * lädt AV1 → VP9 → H.264 und auf schmalen Bildschirmen die 720p-Fassung.
 * Bei „reduzierte Bewegung“ kein Autoplay – Poster mit Wiedergabe-Knopf.
 */
export function Film() {
  const sec = useRef<HTMLElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [reduce, setReduce] = useState(false);
  const [playing, setPlaying] = useState(false);

  useGSAP(() => {
    const el = sec.current!;
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    if (r) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 } });
    tl.fromTo("[data-film-frame]", { clipPath: "inset(22% 26% 22% 26% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "power2.inOut" })
      .fromTo("[data-film-video]", { scale: 1.25 }, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
      .fromTo("[data-film-title]", { yPercent: 0, opacity: 1 }, { yPercent: -40, opacity: 0, duration: 0.5 }, 0.1)
      .to({}, { duration: 1.2 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, { scope: sec });

  useEffect(() => {
    const v = vid.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => {}); else { v.pause(); setPlaying(false); } }, { threshold: 0.2 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  const toggle = () => { const v = vid.current; if (!v) return; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } };

  return (
    <section ref={sec} id="film" aria-label="Studio-Film" className="relative h-[260svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div data-film-title className="absolute inset-x-0 top-[12%] z-10 mx-auto max-w-[1400px] px-4 sm:px-6">
          <p className="label">Studio-Film · in Echtzeit-3D gebaut, offline gerendert</p>
          <h2 className="mt-4 text-[clamp(2.6rem,6vw,6rem)] font-light leading-[0.95] tracking-[-0.03em]">Ein Ort, den man betritt.</h2>
        </div>
        <div data-film-frame className="absolute inset-0 overflow-hidden">
          <video ref={vid} data-film-video muted loop playsInline preload="metadata" poster="/film/reel-poster.webp" className="h-full w-full object-cover" aria-label="Kamerafahrt durch das VONUMO-Studio bei Nacht">
            <source src="/film/reel-720.av1.webm" type='video/webm; codecs="av01.0.05M.08"' media="(max-width: 767px)" />
            <source src="/film/reel-720.vp9.webm" type='video/webm; codecs="vp9"' media="(max-width: 767px)" />
            <source src="/film/reel-720.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/film/reel-1080.av1.webm" type='video/webm; codecs="av01.0.08M.08"' />
            <source src="/film/reel-1080.vp9.webm" type='video/webm; codecs="vp9"' />
            <source src="/film/reel-1080.mp4" type="video/mp4" />
          </video>
          <button type="button" onClick={toggle} className="btn absolute bottom-6 right-4 z-10 !py-2 sm:right-6" aria-pressed={playing}>{playing ? "Pause" : "Abspielen"}</button>
        </div>
      </div>
    </section>
  );
}
