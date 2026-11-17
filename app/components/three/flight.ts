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
