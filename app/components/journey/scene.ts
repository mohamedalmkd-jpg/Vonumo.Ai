import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Kamera-Fahrt: Start-Z, End-Z und die Kapitel-Mitten entlang der Achse. */
export const PATH = { start: 9, end: -116 };
export const CHAPTERS = [0, -46, -92];
const PORTALS = [-23, -69];
const TINTS = [new THREE.Color("#7c5cff"), new THREE.Color("#22d3ee"), new THREE.Color("#f472b6")];

/** Fahrplan: Fortschritt → Kamera-Z. Langsam bei den Kapiteln, schnell durch die Portale. */
const KEYS: [number, number][] = [[0, 9], [0.15, 5.5], [0.3, -30], [0.47, -35.5], [0.63, -76], [0.82, -81.5], [1, -116]];
const camZ = (p: number) => {
  for (let i = 1; i < KEYS.length; i++) {
    const [p1, z1] = KEYS[i];
    if (p <= p1) { const [p0, z0] = KEYS[i - 1]; const t = (p - p0) / (p1 - p0); const e = t * t * (3 - 2 * t); return z0 + (z1 - z0) * e; }
  }
  return KEYS[KEYS.length - 1][1];
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

export type Journey = { setProgress: (p: number) => void; setPointer: (x: number, y: number) => void; setActive: (on: boolean) => void; dispose: () => void };

export function createJourney(canvas: HTMLCanvasElement, opts: { reduce: boolean; mobile: boolean }): Journey {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.mobile, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.25 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const bg = new THREE.Color("#05060b");
  scene.background = bg;
  scene.fog = new THREE.FogExp2(bg.getHex(), 0.034);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(opts.mobile ? 62 : 48, 1, 0.1, 140);
  camera.position.set(0, 0, PATH.start);

  const key = new THREE.PointLight("#ffffff", 60, 40, 1.6);
  scene.add(key);
  const rim = new THREE.PointLight(TINTS[0], 120, 30, 1.4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight("#ffffff", 0.15));

  const disposables: { dispose: () => void }[] = [env, pmrem];
  const track = <T extends { dispose: () => void }>(x: T) => { disposables.push(x); return x; };

  // ── Kapitel 1: das VONUMO-V als glänzende Skulptur ────────────────────────
  const ch1 = new THREE.Group();
  ch1.position.z = CHAPTERS[0];
  const vShape = new THREE.Shape();
  vShape.moveTo(-2.2, 2); vShape.lineTo(-1.15, 2); vShape.lineTo(0, -0.9); vShape.lineTo(1.15, 2);
  vShape.lineTo(2.2, 2); vShape.lineTo(0.62, -2); vShape.lineTo(-0.62, -2); vShape.closePath();
  const vGeo = track(new THREE.ExtrudeGeometry(vShape, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.28, bevelSegments: 10, curveSegments: 4 }));
  vGeo.center();
  const chrome = track(new THREE.MeshPhysicalMaterial({ color: "#14121f", metalness: 1, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 0.6, iridescenceIOR: 1.4 }));
  const vMesh = new THREE.Mesh(vGeo, chrome);
  vMesh.scale.setScalar(0.85);
  ch1.add(vMesh);
  // Ringe um das V
  const ringMat = track(new THREE.MeshBasicMaterial({ color: TINTS[0], transparent: true, opacity: 0.55 }));
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(track(new THREE.TorusGeometry(3.6 + i * 0.9, 0.012, 8, 160)), ringMat);
    r.rotation.x = Math.PI / 2 + (i - 1) * 0.35; r.rotation.y = i * 0.6;
    rings.push(r); ch1.add(r);
  }
  scene.add(ch1);

  // ── Portale (Fenster), durch die die Kamera fliegt ────────────────────────
  const portals = PORTALS.map((z, i) => {
    const g = new THREE.Group();
    g.position.z = z;
    const frameMat = track(new THREE.MeshStandardMaterial({ color: "#0c0d16", metalness: 0.9, roughness: 0.35 }));
    const W = 7.4, H = 4.6, T = 0.45, D = 1.4;
    const bars: [number, number, number, number][] = [[0, H / 2, W + T, T], [0, -H / 2, W + T, T], [-W / 2, 0, T, H], [W / 2, 0, T, H]];
    for (const [x, y, w, h] of bars) { const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, D)), frameMat); m.position.set(x, y, 0); g.add(m); }
    // Mittelpfosten wie ein Fensterrahmen
    const mull = new THREE.Mesh(track(new THREE.BoxGeometry(0.12, H, 0.2)), frameMat); g.add(mull);
    const edgeMat = track(new THREE.MeshBasicMaterial({ color: TINTS[i + 1] }));
    // Rechteckige Leuchtkante aus vier dünnen Streifen
    for (const [x, y, w, h] of [[0, H / 2 - T / 2, W - T, 0.03], [0, -H / 2 + T / 2, W - T, 0.03], [-W / 2 + T / 2, 0, 0.03, H - T], [W / 2 - T / 2, 0, 0.03, H - T]] as const) {
      const s = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), edgeMat); s.position.set(x, y, D / 2 + 0.01); g.add(s);
    }
    const glassMat = track(new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.12, envMapIntensity: 2 }));
    const glass = new THREE.Mesh(track(new THREE.PlaneGeometry(W - T, H - T)), glassMat);
    g.add(glass);
    // Wände links/rechts, damit das Portal wie eine Öffnung wirkt
    const wallMat = track(new THREE.MeshStandardMaterial({ color: "#090a12", metalness: 0.3, roughness: 0.8 }));
    for (const sx of [-1, 1]) { const w = new THREE.Mesh(track(new THREE.BoxGeometry(30, 26, 0.6)), wallMat); w.position.set(sx * (W / 2 + 15 + T / 2), 0, 0); g.add(w); }
    for (const sy of [-1, 1]) { const w = new THREE.Mesh(track(new THREE.BoxGeometry(W + T, 12, 0.6)), wallMat); w.position.set(0, sy * (H / 2 + 6 + T / 2), 0); g.add(w); }
    scene.add(g);
    return { g, glassMat };
  });

  // ── Kapitel 2: schwebende UI-Ebenen, die sich auffächern ───────────────────
  const ch2 = new THREE.Group();
  ch2.position.z = CHAPTERS[1];
  const panels: THREE.Mesh[] = [];
  const panelColors = ["#1b1d33", "#22d3ee", "#7c5cff", "#eef0ff", "#f472b6"];
  const rounded = (w: number, h: number, r: number) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return track(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 }));
  };
  const panelGeo = rounded(4.2, 2.7, 0.22);
  panelColors.forEach((c, i) => {
    const m = new THREE.Mesh(panelGeo, track(new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.1, roughness: 0.25, transparent: true, opacity: i === 0 ? 0.95 : 0.78, clearcoat: 1, emissive: c, emissiveIntensity: i === 0 ? 0 : 0.12 })));
    m.geometry.center();
    panels.push(m); ch2.add(m);
  });
  ch2.scale.setScalar(1.05);
  scene.add(ch2);

  // ── Kapitel 3: KI-Kern aus Teilchen ─────────────────────────────────────────
  const ch3 = new THREE.Group();
  ch3.position.z = CHAPTERS[2];
  const N = opts.mobile ? 2200 : 4200;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = 2.6 + Math.pow(Math.random(), 3) * 1.6;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = s * Math.cos(th) * r; pos[i * 3 + 1] = u * r; pos[i * 3 + 2] = s * Math.sin(th) * r;
  }
  const pGeo = track(new THREE.BufferGeometry());
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = track(new THREE.PointsMaterial({ color: TINTS[2], size: 0.045, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  const cloud = new THREE.Points(pGeo, pMat);
  ch3.add(cloud);
  const core = new THREE.Mesh(track(new THREE.IcosahedronGeometry(1.5, 1)), track(new THREE.MeshPhysicalMaterial({ color: "#1a0f22", metalness: 1, roughness: 0.2, clearcoat: 1, iridescence: 1, flatShading: true })));
  ch3.add(core);
  const wire = new THREE.LineSegments(track(new THREE.WireframeGeometry(track(new THREE.IcosahedronGeometry(2.1, 1)))), track(new THREE.LineBasicMaterial({ color: TINTS[2], transparent: true, opacity: 0.35 })));
  ch3.add(wire);
  scene.add(ch3);

  // ── Staub entlang der ganzen Strecke für Tiefe und Tempo ───────────────────
  const D = opts.mobile ? 900 : 1800;
  const dust = new Float32Array(D * 3);
  for (let i = 0; i < D; i++) { dust[i * 3] = (Math.random() - 0.5) * 30; dust[i * 3 + 1] = (Math.random() - 0.5) * 18; dust[i * 3 + 2] = PATH.start + 4 - Math.random() * (PATH.start - PATH.end + 20); }
  const dGeo = track(new THREE.BufferGeometry());
  dGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  scene.add(new THREE.Points(dGeo, track(new THREE.PointsMaterial({ color: "#c9ccff", size: 0.03, transparent: true, opacity: 0.6, depthWrite: false }))));

  // Spiegelnder Boden mit feinem Raster
  const grid = new THREE.GridHelper(260, 130, "#2a2d48", "#151729");
  grid.position.set(0, -4.2, (PATH.start + PATH.end) / 2);
  (grid.material as THREE.Material).transparent = true; (grid.material as THREE.Material).opacity = 0.5;
  track(grid.geometry); track(grid.material as THREE.Material);
  scene.add(grid);

  // ── Zustand & Schleife ─────────────────────────────────────────────────────
  let target = 0, cur = 0, px = 0, py = 0, tpx = 0, tpy = 0, active = false, raf = 0;
  const clock = new THREE.Clock();
  const tint = new THREE.Color();
  const look = new THREE.Vector3();

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < h ? 62 : 48;
    camera.updateProjectionMatrix();
    // Querformat: Objekte rechts, Text links. Hochformat: Objekte oben, Text unten.
    const side = w > h ? Math.min(3.2, 2.2 * (w / h) / 1.6) : 0, up = w > h ? 0 : 1.4;
    for (const g of [ch1, ch2, ch3]) g.position.set(side, up, g.position.z);
    ch2.position.x = side + (w > h ? 1.8 : 0);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = opts.reduce ? 1 : 1 - Math.pow(0.0009, dt);
    cur += (target - cur) * k;
    px += (tpx - px) * (1 - Math.pow(0.02, dt)); py += (tpy - py) * (1 - Math.pow(0.02, dt));

    const z = camZ(cur);
    // Leichtes Schweben wie eine Handkamera + Maus-Parallaxe
    const sway = opts.reduce ? 0 : 1;
    camera.position.set(px * 0.9 + Math.sin(t * 0.4) * 0.12 * sway, py * 0.5 + Math.cos(t * 0.33) * 0.08 * sway, z);
    look.set(px * 0.3, py * 0.15, z - 10);
    camera.lookAt(look);
    camera.rotation.z = -px * 0.03;

    // Farbe der Szene wechselt je nach Kapitel
    const seg = clamp((PATH.start - z) / (PATH.start - PATH.end)) * 2;
    const a = Math.min(1, Math.floor(seg)), f = smooth(0.35, 0.65, seg - a);
    tint.copy(TINTS[a]).lerp(TINTS[Math.min(2, a + 1)], f);
    rim.color.copy(tint); ringMat.color.copy(tint);
    key.position.set(4, 3, z - 4); rim.position.set(-5, -1, z - 12);

    // Kapitel 1: V dreht sich, Ringe kreisen
    const l1 = clamp((PATH.start - z) / (PATH.start - PORTALS[0]));
    vMesh.rotation.y = (opts.reduce ? 0 : t * 0.25) + l1 * Math.PI * 0.9 + px * 0.4;
    vMesh.rotation.x = -py * 0.2 + Math.sin(t * 0.5) * 0.05 * sway;
    rings.forEach((r, i) => { r.rotation.z = t * (0.1 + i * 0.05) * sway + l1 * (i + 1); });

    // Portale: Glas blitzt auf, wenn man hindurchfliegt
    portals.forEach((p, i) => {
      const d = z - PORTALS[i];
      p.glassMat.opacity = 0.05 + 0.4 * Math.exp(-(d * d) / 6);
    });

    // Kapitel 2: Ebenen fächern sich mit der Annäherung auf
    const l2 = smooth(PORTALS[0], CHAPTERS[1] + 2, z);
    panels.forEach((m, i) => {
      const o = i - 2;
      m.position.set(o * 0.55 * l2, o * 0.18 * l2 + Math.sin(t * 0.8 + i) * 0.04 * sway, o * (0.35 + 1.1 * l2));
      m.rotation.set(-0.25 * l2 - py * 0.1, (0.55 * l2 + px * 0.2) * (1 - 0.3 * Math.abs(o) / 2), 0.04 * o * l2);
    });

    // Kapitel 3: Teilchen atmen und ziehen sich beim Näherkommen zusammen
    const l3 = smooth(PORTALS[1], CHAPTERS[2] + 3, z);
    const pulse = 1 + Math.sin(t * 1.6) * 0.04 * sway;
    cloud.scale.setScalar((1.9 - 0.9 * l3) * pulse);
    cloud.rotation.y = t * 0.08 * sway + l3; wire.rotation.y = -t * 0.15 * sway; wire.rotation.x = t * 0.07 * sway;
    core.rotation.y = t * 0.3 * sway; core.scale.setScalar(0.8 + 0.2 * l3 * pulse);

    renderer.render(scene, camera);
    if (active) raf = requestAnimationFrame(frame);
  };

  return {
    setProgress: (p) => { target = clamp(p); if (!active) { cur = target; frame(); } },
    setPointer: (x, y) => { if (!opts.reduce) { tpx = x; tpy = y; } },
    setActive: (on) => {
      if (on === active) return;
      active = on; cancelAnimationFrame(raf);
      if (on) { clock.getDelta(); raf = requestAnimationFrame(frame); }
    },
    dispose: () => {
      active = false; cancelAnimationFrame(raf); ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
