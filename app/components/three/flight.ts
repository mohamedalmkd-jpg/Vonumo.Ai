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
 * Hero-Kamera → DOM-Hotspots: FlightScene schreibt jedes Bild die View-Projektions-Matrix der echten
 * 3D-Kamera. heroProject() bildet einen Weltpunkt (Meter, Szenenkoordinaten) auf Bildschirm-Pixel ab.
 */
export const hero = { vp: new Float32Array(16), w: 1, h: 1, ready: false };

/** Weltpunkt → [x, y] in px; null, wenn hinter der Kamera. */
export function heroProject(x: number, y: number, z: number): readonly [number, number] | null {
  const m = hero.vp;
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw <= 0.01) return null;
  return [((cx / cw) * 0.5 + 0.5) * hero.w, (1 - ((cy / cw) * 0.5 + 0.5)) * hero.h] as const;
}
