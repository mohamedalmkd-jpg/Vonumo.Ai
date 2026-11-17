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
