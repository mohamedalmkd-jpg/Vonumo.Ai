/**
 * Gemeinsamer Zustand des Kamera-Flugs im Hero (siehe docs/animation-spec.md).
 * DOM (ScrollTrigger) schreibt, die 3D-Szene liest – ohne React-Renders.
 */
export const flight = {
  /** Scroll-Fortschritt durch den gepinnten Hero, 0…1 */
  p: 0,
  /** Hero ist im Bild → Szene rendern */
  visible: true,
  /** Intro nach dem Ladebildschirm gestartet */
  started: false,
  /** Szenenzeit in s (Uhr; im Aufnahmemodus aus dem Bildindex) – für deterministische Animationen */
  time: 0,
  /** aktuelles Kapitel (−1 = Kamerafahrt) */
  chapter: 0,
};

/** Ruhebereiche (Kapitel) und Kamerafahrten auf der Fortschrittsachse. */
export const CHAPTERS = [
  { from: 0, to: 0.06 },
  { from: 0.3, to: 0.52 },
  { from: 0.82, to: 1 },
] as const;
export const MOVES = [
  { from: 0.06, to: 0.3 },
  { from: 0.52, to: 0.82 },
] as const;

/** Aktive Disziplin im Leistungsbereich (DOM schreibt, ServicesObject liest). */
export const services = { active: 0 };

/** Material-Labor: gewähltes Material (0 Chrom, 1 Glas, 2 Flüssigmetall), Zieh-Geschwindigkeit, Scroll-Eintritt 0…1. */
export const lab = { material: 0 as 0 | 1 | 2, vel: 0, dragging: false, enter: 0 };

/**
 * 2.5D-Hero (HeroDepth.tsx) → DOM-Hotspots: dieselbe Abbildung Bild-UV ↔ Bildschirm.
 * oA/oB = Dolly-Ziele der beiden Aufnahmen (Glasfront, V-Logo), Werte in Bild-UV.
 */
export const hero = {
  oA: [0.66, 0.56] as [number, number], oB: [0.485, 0.565] as [number, number],
  panA: [0, 0] as [number, number], panB: [0, 0] as [number, number],
  zA: 1, zB: 1.5, mixB: 0, focusA: 0.55, focusB: 0.3, ptr: [0, 0] as [number, number],
  aspA: 1.34, aspB: 1.37, w: 1, h: 1, ready: false,
};

/** Bild-UV + Tiefe → Bildschirmposition in px (inverse der Shader-Abbildung, ohne Iteration nötig). */
export function heroProject(shot: 0 | 1, u: number, v: number, depth: number) {
  const asp = shot ? hero.aspB : hero.aspA, o = shot ? hero.oB : hero.oA, pan = shot ? hero.panB : hero.panA;
  const z = shot ? hero.zB : hero.zA, focus = shot ? hero.focusB : hero.focusA;
  const r = hero.w / hero.h / asp;
  const sc = r > 1 ? [1, 1 / r] : [r, 1];
  const zz = z * (1 + (z - 1) * depth * 0.55);
  // v kommt „von oben“ (wie in Bildbearbeitung); Textur- und Bildschirm-V laufen nach oben
  const tv = 1 - v, ov = 1 - o[1];
  const qx = u + hero.ptr[0] * (depth - focus) * 0.022, qy = tv + hero.ptr[1] * (depth - focus) * 0.022;
  const bx = o[0] + (qx - o[0]) * zz, by = ov + (qy - ov) * zz;
  const sx = (bx - 0.5 - pan[0]) / sc[0] + 0.5, sy = (by - 0.5 - pan[1]) / sc[1] + 0.5;
  return [sx * hero.w, (1 - sy) * hero.h] as const;
}
