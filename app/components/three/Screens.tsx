"use client";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { bootAt, flight } from "./flight";

/*
 * Arbeitende Bildschirme im Studio: Canvas-Texturen, die echte Demo-Oberflächen zeichnen
 * (Code-Editor tippt, Analytics-Dashboard, Trading-Demo mit Kerzen, KI-Netz mit Impulsen, Datenwellen).
 * Startsequenz aus dem Scroll-Fortschritt (bootAt): aus → Hintergrundlicht → VONUMO-Startbild → Inhalt.
 * Gleicher Fortschritt = gleicher Zustand; rückwärts scrollen schaltet sie wieder ab.
 * Alle Zahlen sind sichtbar als „Demo“ gekennzeichnete, erfundene Beispieldaten.
 */
export type DemoKind = "code" | "dash" | "trade" | "ai" | "wave";
const W = 768, H = 432;
const FONT = "'Geist Mono Variable', ui-monospace, monospace";
const UI = "'Outfit Variable', system-ui, sans-serif";

function rnd(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

const CODE = [
  ["k", "import"], ["t", " { createAgent } "], ["k", "from"], ["s", " \"@vonumo/ai\""], ["n", ";"],
  ["n", ""], ["k", "export async function"], ["f", " handleLead"], ["t", "(lead: Lead) {"],
  ["t", "  const score = "], ["k", "await"], ["f", " agent.rank"], ["t", "(lead);"],
  ["t", "  if (score > "], ["s", "0.82"], ["t", ") {"],
  ["t", "    "], ["k", "await"], ["f", " crm.create"], ["t", "({ ...lead, score });"],
  ["t", "    "], ["k", "await"], ["f", " notify"], ["t", "(\"vertrieb\", lead.name);"],
  ["t", "  }"], ["t", "  "], ["k", "return"], ["t", " { ok: true, score };"], ["t", "}"],
  ["n", ""], ["c", "// Edge-Funktion · 38 ms · Demo"],
] as const;
const CODE_COL: Record<string, string> = { k: "#c792ea", t: "#d6deeb", s: "#c3e88d", f: "#82aaff", n: "#d6deeb", c: "#5f7e97" };
// Zeilen aus Tokens bauen (Zeilenumbruch nach ";", "{", "}" und leeren Tokens)
const CODE_LINES: [string, string][][] = (() => {
  const out: [string, string][][] = [[]];
  for (const [k, v] of CODE) {
    if (v === "") { out.push([]); continue; }
    out[out.length - 1].push([k, v]);
    if (/[;{}]$/.test(v) || k === "c") out.push([]);
  }
  return out.filter((l) => l.length);
})();

function header(x: CanvasRenderingContext2D, title: string, accent: string) {
  x.fillStyle = "#0b0f1d"; x.fillRect(0, 0, W, 34);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(18 + i * 16, 17, 5, 0, 7); x.fill(); });
  x.fillStyle = "#9aa3c7"; x.font = `500 13px ${UI}`; x.fillText(title, 76, 22);
  x.fillStyle = accent; x.font = `500 11px ${FONT}`; x.textAlign = "right"; x.fillText("DEMO", W - 14, 22); x.textAlign = "left";
}

function drawCode(x: CanvasRenderingContext2D, t: number) {
  x.fillStyle = "#070a14"; x.fillRect(0, 0, W, H);
  header(x, "vonumo-studio — lead-agent.ts", "#82aaff");
  x.fillStyle = "#0a0e1b"; x.fillRect(0, 34, 46, H - 34);
  const total = CODE_LINES.reduce((a, l) => a + l.reduce((b, [, v]) => b + v.length, 0), 0);
  let budget = Math.floor((t * 28) % (total + 60));
  x.font = `15px ${FONT}`;
  CODE_LINES.forEach((line, i) => {
    const y = 62 + i * 24;
    x.fillStyle = "#3b4766"; x.textAlign = "right"; x.fillText(String(i + 1), 36, y); x.textAlign = "left";
    let cx = 60;
    for (const [k, v] of line) {
      if (budget <= 0) break;
      const s = v.slice(0, budget); budget -= v.length;
      x.fillStyle = CODE_COL[k]; x.fillText(s, cx, y); cx += x.measureText(s).width;
      if (budget <= 0 && Math.floor(t * 2) % 2) { x.fillStyle = "#82aaff"; x.fillRect(cx + 1, y - 14, 8, 17); }
    }
  });
  x.fillStyle = "#0b0f1d"; x.fillRect(0, H - 26, W, 26);
  x.fillStyle = "#5f7e97"; x.font = `12px ${FONT}`; x.fillText("TypeScript  ·  UTF-8  ·  ✓ 0 Fehler  ·  Vercel Edge", 14, H - 9);
}

function sparkPath(x: CanvasRenderingContext2D, pts: number[], x0: number, y0: number, w: number, h: number, lo: number, hi: number) {
  x.beginPath();
  pts.forEach((v, i) => { const px = x0 + (i / (pts.length - 1)) * w, py = y0 + h - ((v - lo) / (hi - lo)) * h; if (i) x.lineTo(px, py); else x.moveTo(px, py); });
}

function drawDash(x: CanvasRenderingContext2D, t: number) {
  x.fillStyle = "#080b16"; x.fillRect(0, 0, W, H);
  header(x, "Analytics · Live-Ansicht", "#33e1ff");
  const kpi = [["Besucher heute", 1840 + Math.round(Math.sin(t * 0.7) * 40)], ["Conversion", `${(4.6 + Math.sin(t * 0.5) * 0.2).toFixed(1)} %`], ["Ladezeit", `${(0.8 + Math.sin(t) * 0.05).toFixed(2)} s`]] as const;
  kpi.forEach(([k, v], i) => {
    const bx = 16 + i * 248;
    x.fillStyle = "#0e1428"; x.fillRect(bx, 48, 234, 74);
    x.fillStyle = "#7f88ad"; x.font = `500 12px ${UI}`; x.fillText(k, bx + 14, 70);
    x.fillStyle = "#ecedf3"; x.font = `300 30px ${UI}`; x.fillText(String(v), bx + 14, 108);
  });
  const pts = Array.from({ length: 60 }, (_, i) => 50 + Math.sin(i * 0.25 + t * 0.9) * 14 + Math.sin(i * 0.07 + t * 0.3) * 18 + i * 0.4);
  x.fillStyle = "#0e1428"; x.fillRect(16, 136, 488, 280);
  const g = x.createLinearGradient(0, 160, 0, 400); g.addColorStop(0, "rgba(51,225,255,0.35)"); g.addColorStop(1, "rgba(51,225,255,0)");
  sparkPath(x, pts, 30, 170, 460, 220, 10, 110); x.lineTo(490, 390); x.lineTo(30, 390); x.closePath(); x.fillStyle = g; x.fill();
  sparkPath(x, pts, 30, 170, 460, 220, 10, 110); x.strokeStyle = "#33e1ff"; x.lineWidth = 2.5; x.stroke();
  x.fillStyle = "#7f88ad"; x.font = `500 12px ${UI}`; x.fillText("Sitzungen · 60 Min.", 30, 160);
  x.fillStyle = "#0e1428"; x.fillRect(516, 136, 236, 280);
  x.fillStyle = "#7f88ad"; x.fillText("Kanäle", 530, 160);
  ["#4f6bff", "#33e1ff", "#9b8cff", "#c4ff3d", "#ff4fa8"].forEach((c, i) => {
    const v = 0.35 + 0.55 * Math.abs(Math.sin(i * 1.7 + t * 0.4));
    x.fillStyle = c; x.fillRect(536 + i * 42, 396 - v * 210, 26, v * 210);
  });
}

function candles(seed: number) {
  const r = rnd(seed); let p = 100; const out: { o: number; c: number; h: number; l: number }[] = [];
  for (let i = 0; i < 400; i++) { const o = p; p = Math.max(60, p + (r() - 0.46) * 3.2); out.push({ o, c: p, h: Math.max(o, p) + r() * 1.6, l: Math.min(o, p) - r() * 1.6 }); }
  return out;
}
const CANDLES = candles(7);
function drawTrade(x: CanvasRenderingContext2D, t: number) {
  x.fillStyle = "#070a12"; x.fillRect(0, 0, W, H);
  header(x, "VNM/EUR · Trading-Demo · 15 Min.", "#c4ff3d");
  const n = 48, start = Math.floor(t * 1.5) % (CANDLES.length - n), view = CANDLES.slice(start, start + n);
  const lo = Math.min(...view.map((c) => c.l)) - 1, hi = Math.max(...view.map((c) => c.h)) + 1;
  const cw = (W - 120) / n, Y = (v: number) => 50 + (1 - (v - lo) / (hi - lo)) * (H - 90);
  x.strokeStyle = "rgba(127,136,173,0.12)"; x.lineWidth = 1;
  for (let i = 0; i < 6; i++) { const y = 50 + i * ((H - 90) / 5); x.beginPath(); x.moveTo(16, y); x.lineTo(W - 100, y); x.stroke(); }
  view.forEach((c, i) => {
    const cx = 20 + i * cw + cw / 2, up = c.c >= c.o, col = up ? "#28d98a" : "#ff4f6d";
    x.strokeStyle = col; x.beginPath(); x.moveTo(cx, Y(c.h)); x.lineTo(cx, Y(c.l)); x.stroke();
    x.fillStyle = col; x.fillRect(cx - cw * 0.32, Y(Math.max(c.o, c.c)), cw * 0.64, Math.max(1.5, Math.abs(Y(c.o) - Y(c.c))));
  });
  const last = view[view.length - 1].c, first = view[0].o, chg = ((last - first) / first) * 100;
  x.fillStyle = "#0e1428"; x.fillRect(W - 92, Y(last) - 12, 84, 24);
  x.fillStyle = "#ecedf3"; x.font = `500 13px ${FONT}`; x.fillText(last.toFixed(2), W - 84, Y(last) + 5);
  x.fillStyle = chg >= 0 ? "#28d98a" : "#ff4f6d"; x.font = `300 26px ${UI}`; x.fillText(`${chg >= 0 ? "+" : ""}${chg.toFixed(1)} %`, W - 150, H - 14);
}

const NET = [4, 6, 6, 3];
function drawAI(x: CanvasRenderingContext2D, t: number) {
  x.fillStyle = "#070814"; x.fillRect(0, 0, W, H);
  header(x, "KI-Modell · Inferenz", "#9b8cff");
  const pos = NET.map((n, l) => Array.from({ length: n }, (_, i) => [110 + l * 180, 70 + ((i + 0.5) / n) * (H - 110)] as const));
  for (let l = 0; l < NET.length - 1; l++) for (const a of pos[l]) for (const b of pos[l + 1]) {
    x.strokeStyle = "rgba(155,140,255,0.16)"; x.lineWidth = 1; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
  }
  for (let k = 0; k < 18; k++) {
    const l = k % (NET.length - 1), ph = (t * 0.6 + k * 0.137) % 1;
    const a = pos[l][k % NET[l]], b = pos[l + 1][(k * 3) % NET[l + 1]];
    const px = a[0] + (b[0] - a[0]) * ph, py = a[1] + (b[1] - a[1]) * ph;
    const g = x.createRadialGradient(px, py, 0, px, py, 10); g.addColorStop(0, "rgba(120,200,255,0.95)"); g.addColorStop(1, "rgba(120,200,255,0)");
    x.fillStyle = g; x.fillRect(px - 10, py - 10, 20, 20);
  }
  pos.forEach((layer, l) => layer.forEach(([px, py], i) => {
    const on = 0.5 + 0.5 * Math.sin(t * 2 + l + i * 1.3);
    x.fillStyle = `rgba(79,107,255,${0.35 + on * 0.6})`; x.beginPath(); x.arc(px, py, 11, 0, 7); x.fill();
    x.strokeStyle = "#b9c4ff"; x.lineWidth = 1.5; x.stroke();
  }));
  x.fillStyle = "#7f88ad"; x.font = `12px ${FONT}`; x.fillText(`Konfidenz ${(0.91 + Math.sin(t) * 0.03).toFixed(2)} · Latenz ${(120 + Math.sin(t * 1.3) * 12).toFixed(0)} ms`, 16, H - 12);
}

function drawWave(x: CanvasRenderingContext2D, t: number) {
  x.fillStyle = "#060716"; x.fillRect(0, 0, W, H);
  header(x, "Datenströme · Echtzeit", "#ff4fa8");
  for (let k = 0; k < 7; k++) {
    x.beginPath();
    for (let i = 0; i <= 120; i++) {
      const px = (i / 120) * W, ph = i * 0.06 + t * (0.5 + k * 0.08) + k;
      const py = H * 0.58 + Math.sin(ph) * (40 + k * 9) * Math.sin(i * 0.02 + k) + k * 6 - 20;
      if (i) x.lineTo(px, py); else x.moveTo(px, py);
    }
    x.strokeStyle = `hsla(${235 + k * 14}, 90%, ${60 + k * 3}%, ${0.55 - k * 0.05})`; x.lineWidth = 2; x.stroke();
  }
}

function drawBoot(x: CanvasRenderingContext2D, k: number) {
  // k: 0…1 innerhalb der Startphase
  x.fillStyle = "#04060e"; x.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2 - 18, s = 34;
  x.fillStyle = `rgba(236,237,243,${Math.min(1, k * 2)})`;
  x.beginPath(); x.moveTo(cx - s, cy - s); x.lineTo(cx - s * 0.38, cy - s); x.lineTo(cx, cy + s * 0.45); x.lineTo(cx + s * 0.38, cy - s); x.lineTo(cx + s, cy - s); x.lineTo(cx + s * 0.18, cy + s); x.lineTo(cx - s * 0.18, cy + s); x.closePath(); x.fill();
  x.font = `500 18px ${UI}`; x.textAlign = "center"; x.fillText("VONUMO", cx, cy + s + 34); x.textAlign = "left";
  x.fillStyle = "rgba(127,136,173,0.25)"; x.fillRect(cx - 90, cy + s + 52, 180, 3);
  x.fillStyle = "#33e1ff"; x.fillRect(cx - 90, cy + s + 52, 180 * k, 3);
}

const DRAW: Record<DemoKind, (x: CanvasRenderingContext2D, t: number) => void> = { code: drawCode, dash: drawDash, trade: drawTrade, ai: drawAI, wave: drawWave };

/** Eine Bildschirmfläche: zeichnet nur, wenn der Hero sichtbar ist (≈20 Bilder/s); Material leuchtet mit dem Start. */
export function useDemoScreen(kind: DemoKind, start: number, len = 0.03) {
  const st = useMemo(() => {
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d")!;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0, 0, 0) });
    return { x, tex, mat, last: -1, boot: -1 };
  }, []);
  useFrame(() => {
    if (!flight.visible) return;
    const b = bootAt(flight.p, start, len);
    const t = flight.time;
    if (b === st.boot && (b === 0 || t - st.last < 0.05)) return;
    st.boot = b; st.last = t;
    const x = st.x;
    if (b <= 0) { x.fillStyle = "#010103"; x.fillRect(0, 0, W, H); }
    else if (b < 0.35) { x.fillStyle = "#04060e"; x.fillRect(0, 0, W, H); }
    else if (b < 0.7) drawBoot(x, (b - 0.35) / 0.35);
    else { DRAW[kind](x, t); if (b < 1) { x.globalAlpha = 1 - (b - 0.7) / 0.3; drawBoot(x, 1); x.globalAlpha = 1; } }
    // Helligkeit: aus = spiegelndes Schwarz, dann Hintergrundlicht hochfahren
    const lum = b <= 0 ? 0.02 : Math.min(1.15, 0.15 + b * 1.0);
    st.mat.color.setScalar(lum);
    st.tex.needsUpdate = true;
  });
  return st.mat;
}

/** Kurzform für die Bildschirmhelligkeit (für Raumlicht, das vom Bildschirm kommt). */
export const bootLevel = (starts: number[], len = 0.03) => starts.reduce((a, s) => a + bootAt(flight.p, s, len), 0) / starts.length;

const MONITOR = "/models/monitor/monitor.glb";
/** Monitor aus Blender (scripts/blender/props.py) mit animiertem Panel. `stand=false` blendet Fuß und Hals aus. */
export function Monitor({ kind, start, position, rotation = 0, scale = 1, stand = true, shadows = true }: {
  kind: DemoKind; start: number; position: [number, number, number]; rotation?: number; scale?: number; stand?: boolean; shadows?: boolean;
}) {
  const { scene } = useGLTF(MONITOR);
  const screen = useDemoScreen(kind, start);
  const obj = useMemo(() => {
    const o = scene.clone(true);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      if (m.name === "screen") m.material = screen;
      else {
        m.castShadow = shadows; m.receiveShadow = shadows;
        if (!stand && /neck|base|joint/.test(m.name)) m.visible = false;
      }
    });
    return o;
  }, [scene, screen, stand, shadows]);
  const ref = useRef<THREE.Group>(null);
  return <group ref={ref} position={position} rotation-y={rotation} scale={scale}><primitive object={obj} /></group>;
}
useGLTF.preload(MONITOR);

/** Licht, das von hochfahrenden Bildschirmen in den Raum fällt (kühl, folgt dem Start). */
export function ScreenGlow({ position, starts, intensity = 6, color = "#9fb8ff", distance = 5 }: { position: [number, number, number]; starts: number[]; intensity?: number; color?: string; distance?: number }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(() => { if (ref.current) ref.current.intensity = intensity * bootLevel(starts); });
  return <pointLight ref={ref} position={position} intensity={0} distance={distance} decay={2} color={color} />;
}
