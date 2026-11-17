import type { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Richtungsabhängiges Einrasten für gepinnte Szenen (Showroom, Leistungen):
 * 180 ms nach dem letzten Scroll gleitet Lenis zum nächsten Ruhepunkt in Scrollrichtung.
 * Eine Geste = ein Szenenwechsel – wie die Kamerafahrten der Referenz.
 * `rests`: Fortschrittswerte 0…1 innerhalb des Triggers. Gibt eine Aufräumfunktion zurück.
 */
export function lenisSnap(st: ScrollTrigger, rests: number[], tolerance = 0.012) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  let idle = 0, touching = false, dir = 1;
  const snap = () => {
    const lenis = window.__lenis;
    if (!lenis || touching || !st.isActive) return;
    const p = st.progress;
    if (rests.some((r) => Math.abs(r - p) < tolerance)) return;
    const target = dir > 0 ? rests.find((r) => r > p) : [...rests].reverse().find((r) => r < p);
    if (target === undefined) return;
    lenis.scrollTo(st.start + target * (st.end - st.start), { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  };
  const onScroll = () => {
    const d = window.__lenis?.direction;
    if (d) dir = d;
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
  };
}
