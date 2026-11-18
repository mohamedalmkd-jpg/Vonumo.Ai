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

/**
 * Ruhebereiche (Kapitel) und Kamerafahrten auf der Fortschrittsachse 0…1 (eine durchgehende Kamerafahrt):
 * 01 Totale → 02 näher am Studio → 03 Fassade/Einblick → durch das Glas → 04 Arbeitsplätze (Bildschirme starten)
 * → 05 V-Skulptur mit Bildschirmwand → 06 Schlussbild. Gleicher Fortschritt = gleicher Szenenzustand (deterministisch).
 */
export const CHAPTERS = [
  { from: 0, to: 0.04 },
  { from: 0.15, to: 0.24 },
  { from: 0.35, to: 0.44 },
  { from: 0.6, to: 0.7 },
  { from: 0.8, to: 0.87 },
  { from: 0.95, to: 1 },
] as const;
export const MOVES = CHAPTERS.slice(0, -1).map((c, i) => ({ from: c.to, to: CHAPTERS[i + 1].from }));

/** Kapitel zum Fortschritt p (−1 = Kamerafahrt). */
export const chapterAt = (p: number) => CHAPTERS.findIndex((c) => p >= c.from && p <= c.to);

/**
 * Start-Zustand eines Bildschirms 0…1 aus dem Scroll-Fortschritt (deterministisch, rückwärts umkehrbar).
 * 0 = aus, bis 0,35 Hintergrundlicht, bis 0,7 VONUMO-Startbild, darüber Inhalt.
 */
export const bootAt = (p: number, start: number, len = 0.05) => Math.min(1, Math.max(0, (p - start) / len));

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
