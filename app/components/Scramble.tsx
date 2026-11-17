"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrambleTextPlugin, ScrollTrigger);

export const GLYPHS = "!<>-_\\/[]{}—=+*^?#░▒▓01";

let loaded = false;
if (typeof window !== "undefined") window.addEventListener("vonumo:loaded", () => (loaded = true), { once: true });
/** Erst nach dem Ladebildschirm animieren, sonst verpufft der Effekt unsichtbar. */
function afterLoad(fn: () => void) {
  if (loaded) fn(); else window.addEventListener("vonumo:loaded", fn, { once: true });
}

export function scramble(el: HTMLElement, text: string, duration = 0.8) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = text; return; }
  gsap.to(el, { duration, scrambleText: { text, chars: GLYPHS, speed: 0.6, revealDelay: 0.1 }, ease: "none", overwrite: true });
}

type Props = {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p" | "b";
  className?: string;
  /** beim Erscheinen im Bild entschlüsseln */
  onView?: boolean;
  /** beim Hover (auch auf dem Eltern-Element mit [data-scramble-host]) neu mischen */
  hover?: boolean;
  delay?: number;
  duration?: number;
};

/** Text, der sich wie ein Terminal „entschlüsselt“. Der echte Text steht immer im DOM (SEO, Screenreader). */
export function Scramble({ text, as: Tag = "span", className, onView = true, hover = false, delay = 0, duration = 1 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanups: (() => void)[] = [];
    if (!onView && !hover) afterLoad(() => scramble(el, text, duration * 0.7));
    if (onView) {
      const st = ScrollTrigger.create({
        trigger: el, start: "top 92%", once: true,
        onEnter: () => afterLoad(() => gsap.delayedCall(delay, () => scramble(el, text, duration))),
      });
      cleanups.push(() => st.kill());
    }
    if (hover) {
      const host = (el.closest("[data-scramble-host]") as HTMLElement) ?? el;
      const on = () => scramble(el, text, 0.6);
      host.addEventListener("pointerenter", on);
      cleanups.push(() => host.removeEventListener("pointerenter", on));
    }
    return () => cleanups.forEach((c) => c());
  }, [text, onView, hover, delay, duration]);

  return <Tag ref={ref as never} className={className} aria-label={text}>{text}</Tag>;
}
