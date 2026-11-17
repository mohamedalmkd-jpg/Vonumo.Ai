import * as THREE from "three";

/** Pseudozufall mit Startwert – Texturen sehen bei jedem Laden gleich aus. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/** Geschichtete Natursteinwand (dunkler Schiefer) – Farb- und Rauheitskarte. */
export function makeStone() {
  const [c, x] = canvas(512, 512);
  const r = rng(7);
  x.fillStyle = "#08090c"; x.fillRect(0, 0, 512, 512);
  let y = 0;
  while (y < 512) {
    const h = 10 + r() * 22;
    let xx = -r() * 40;
    while (xx < 512) {
      const w = 30 + r() * 90;
      const l = 22 + r() * 26;
      x.fillStyle = `rgb(${l},${l + 1},${l + 5})`;
      x.fillRect(xx + 1.5, y + 1.5, w - 3, h - 3);
      // feine Körnung
      for (let i = 0; i < 6; i++) {
        x.fillStyle = `rgba(255,255,255,${r() * 0.04})`;
        x.fillRect(xx + r() * w, y + r() * h, 2 + r() * 10, 1);
      }
      xx += w;
    }
    y += h;
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Feines technisches Raster für den Boden. */
export function makeGrid() {
  const [c, x] = canvas(256, 256);
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 256);
  x.strokeStyle = "rgba(120,140,255,0.55)"; x.lineWidth = 2;
  x.strokeRect(0, 0, 256, 256);
  x.strokeStyle = "rgba(120,140,255,0.16)"; x.lineWidth = 1;
  for (let i = 32; i < 256; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.moveTo(0, i); x.lineTo(256, i); x.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

export type ScreenKind = "ui" | "web" | "brand" | "3d" | "code";
const A1 = "#4f6bff", A2 = "#33e1ff", A3 = "#ff4fa8", LIME = "#c4ff3d", FG = "#ecedf3", MUTE = "#7d7f8f";

function chrome(x: CanvasRenderingContext2D, w: number, h: number, label: string) {
  x.fillStyle = "#07080d"; x.fillRect(0, 0, w, h);
  x.fillStyle = "#0e1018"; x.fillRect(0, 0, w, 44);
  ["#ff5d5d", "#ffbd2e", "#28c840"].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(26 + i * 22, 22, 6, 0, Math.PI * 2); x.fill(); });
  x.fillStyle = "#161926"; x.fillRect(w / 2 - 170, 12, 340, 20);
  x.fillStyle = MUTE; x.font = "500 13px 'Geist Mono Variable', monospace"; x.textAlign = "center"; x.fillText(label, w / 2, 27);
  x.textAlign = "left";
  x.strokeStyle = "rgba(255,255,255,0.12)"; x.lineWidth = 2; x.strokeRect(1, 1, w - 2, h - 2);
}

function draw(kind: ScreenKind, x: CanvasRenderingContext2D, w: number, h: number) {
  const mono = (wt: number, s: number) => `${wt} ${s}px 'Geist Mono Variable', monospace`;
  const dot = (s: number) => `900 ${s}px Doto, 'Geist Mono Variable', monospace`;
  if (kind === "web") {
    chrome(x, w, h, "vonumo.de / projekt");
    const g = x.createLinearGradient(0, 80, w, h);
    g.addColorStop(0, "#101a5a"); g.addColorStop(0.6, "#0a0d24"); g.addColorStop(1, "#05060c");
    x.fillStyle = g; x.fillRect(40, 70, w - 80, h - 110);
    x.fillStyle = FG; x.font = dot(92); x.fillText("WEBSITES", 80, 250);
    x.fillStyle = A2; x.fillText("MIT TIEFE", 80, 340);
    x.fillStyle = MUTE; x.font = mono(400, 20); x.fillText("3D · Motion · Performance", 84, 395);
    x.fillStyle = FG; x.fillRect(84, 440, 210, 52); x.fillStyle = "#07080d"; x.font = mono(600, 17); x.fillText("PROJEKT STARTEN →", 104, 473);
    x.strokeStyle = "rgba(255,255,255,0.35)"; x.strokeRect(310, 440, 160, 52); x.fillStyle = FG; x.fillText("LEISTUNGEN", 330, 473);
    x.strokeStyle = A1; x.lineWidth = 3; x.beginPath(); x.arc(w - 220, 300, 130, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(79,107,255,0.4)"; x.beginPath(); x.ellipse(w - 220, 300, 130, 45, 0.3, 0, Math.PI * 2); x.stroke();
  } else if (kind === "ui") {
    chrome(x, w, h, "figma / dashboard");
    x.fillStyle = "#0c0e16"; x.fillRect(0, 44, 170, h - 44);
    for (let i = 0; i < 7; i++) { x.fillStyle = i === 1 ? A1 : "#1a1e2c"; x.fillRect(24, 84 + i * 46, i === 1 ? 122 : 90 + (i % 3) * 14, 18); }
    x.fillStyle = FG; x.font = mono(300, 40); x.fillText("UI/UX Design", 210, 116);
    const cards = [[210, 150], [470, 150], [730, 150]];
    cards.forEach(([cx, cy], i) => {
      x.fillStyle = "#11131d"; x.fillRect(cx, cy, 240, 130);
      x.fillStyle = MUTE; x.font = mono(400, 14); x.fillText(["Konversion", "Ladezeit", "Nutzer"][i], cx + 18, cy + 34);
      x.fillStyle = [A2, LIME, A3][i]; x.font = mono(300, 44); x.fillText(["+38%", "0,9 s", "12k"][i], cx + 18, cy + 92);
    });
    x.fillStyle = "#11131d"; x.fillRect(210, 300, 760, 290);
    x.strokeStyle = A2; x.lineWidth = 4; x.beginPath();
    for (let i = 0; i <= 20; i++) { const px = 240 + i * 35, py = 540 - (Math.sin(i * 0.55) * 60 + i * 9); if (i) x.lineTo(px, py); else x.moveTo(px, py); }
    x.stroke();
    x.strokeStyle = "rgba(51,225,255,0.12)"; x.lineWidth = 1;
    for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(240, 340 + i * 50); x.lineTo(940, 340 + i * 50); x.stroke(); }
  } else if (kind === "brand") {
    chrome(x, w, h, "brand / system.pdf");
    x.fillStyle = FG; x.font = `200 260px 'Geist Mono Variable', monospace`; x.fillText("Aa", 60, 330);
    x.fillStyle = MUTE; x.font = mono(400, 18); x.fillText("Geist Mono · 100–900", 70, 380);
    x.fillStyle = FG; x.font = dot(64); x.fillText("VONUMO", 70, 470);
    [A1, A2, A3, LIME, FG].forEach((col, i) => { x.fillStyle = col; x.fillRect(560 + (i % 3) * 140, 90 + Math.floor(i / 3) * 170, 120, 150); });
    x.fillStyle = MUTE; x.font = mono(400, 14);
    ["#4F6BFF", "#33E1FF", "#FF4FA8", "#C4FF3D", "#ECEDF3"].forEach((hx, i) => x.fillText(hx, 560 + (i % 3) * 140, 260 + Math.floor(i / 3) * 170));
    x.strokeStyle = "rgba(255,255,255,0.2)"; x.strokeRect(560, 470, 400, 120);
    x.fillStyle = FG; x.font = mono(300, 22); x.fillText("Logo · Farbe · Typo", 584, 540);
  } else if (kind === "code") {
    chrome(x, w, h, "vonumo / app/page.tsx");
    x.fillStyle = "#0b0c13"; x.fillRect(0, 44, 210, h - 44);
    ["app", "  page.tsx", "  layout.tsx", "components", "  Hero.tsx", "  Showroom.tsx", "lib", "  content.ts"].forEach((f, i) => { x.fillStyle = i === 1 ? FG : MUTE; x.font = mono(400, 15); x.fillText(f, 22, 84 + i * 30); });
    const code: [string, string][][] = [
      [["#ff4fa8", "export default "], ["#33e1ff", "function "], ["#ecedf3", "Home() {"]],
      [["#ff4fa8", "  return "], ["#7d7f8f", "("]],
      [["#7d7f8f", "    <"], ["#33e1ff", "Hero "], ["#c4ff3d", "scene"], ["#7d7f8f", "="], ["#ffb547", "\"studio\""], ["#7d7f8f", " />"]],
      [["#7d7f8f", "    <"], ["#33e1ff", "Showroom "], ["#c4ff3d", "work"], ["#7d7f8f", "={"], ["#ecedf3", "WORK"], ["#7d7f8f", "} />"]],
      [["#7d7f8f", "    <"], ["#33e1ff", "Services "], ["#c4ff3d", "fps"], ["#7d7f8f", "={"], ["#ffb547", "60"], ["#7d7f8f", "} />"]],
      [["#7d7f8f", "    <"], ["#33e1ff", "Contact "], ["#c4ff3d", "dsgvo "], ["#7d7f8f", "/>"]],
      [["#7d7f8f", "  );"]],
      [["#ecedf3", "}"]],
      [],
      [["#4a4c58", "// ✓ build 1,2 s · lighthouse 98 · edge: fra1"]],
    ];
    code.forEach((line, li) => {
      let cx = 280; x.font = mono(400, 21);
      x.fillStyle = "#4a4c58"; x.fillText(String(li + 1).padStart(2, "0"), 236, 100 + li * 40);
      line.forEach(([col, t]) => { x.fillStyle = col; x.fillText(t, cx, 100 + li * 40); cx += x.measureText(t).width; });
    });
    x.fillStyle = LIME; x.fillRect(240, h - 76, 260, 40); x.fillStyle = "#07080d"; x.font = mono(600, 16); x.fillText("✓ ERFOLGREICH · LIVE", 258, h - 50);
  } else {
    chrome(x, w, h, "webgl / scene.glb");
    x.fillStyle = "#05060a"; x.fillRect(20, 60, w - 40, h - 80);
    x.strokeStyle = "rgba(79,107,255,0.5)"; x.lineWidth = 1.5;
    const cx = w / 2, cy = h / 2 + 30;
    for (let i = -6; i <= 6; i++) { x.beginPath(); x.ellipse(cx, cy, 210, Math.abs(i) * 17.5, 0, 0, Math.PI * 2); x.stroke(); }
    for (let i = 0; i < 12; i++) { x.beginPath(); x.ellipse(cx, cy, Math.abs(Math.cos((i / 12) * Math.PI)) * 210, 210, 0, 0, Math.PI * 2); x.stroke(); }
    x.strokeStyle = A2; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 210, 0, Math.PI * 2); x.stroke();
    x.fillStyle = FG; x.font = mono(300, 34); x.fillText("3D / WebGL", 50, 110);
    x.fillStyle = MUTE; x.font = mono(400, 15); x.fillText("60 fps · 1,2 MB · drei", 52, 140);
    x.fillStyle = LIME; x.fillText("● LIVE", w - 130, 110);
  }
}

/** Leuchtende „Bildschirme“ mit Design-Arbeiten (UI, Web, Marke, 3D). */
export function makeScreen(kind: ScreenKind) {
  const [c, x] = canvas(1024, 640);
  draw(kind, x, 1024, 640);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  // Schriften können nach dem ersten Zeichnen eintreffen
  document.fonts?.ready.then(() => { draw(kind, x, 1024, 640); t.needsUpdate = true; });
  return t;
}
