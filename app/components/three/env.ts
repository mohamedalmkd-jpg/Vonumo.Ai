import * as THREE from "three";

let cached: THREE.Texture | null = null;

/** Eigene Studio-Umgebung aus leuchtenden Flächen (keine HDR-Datei, kein Netzwerk). */
export function getStudioEnv(gl: THREE.WebGLRenderer) {
  if (cached) return cached;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#010103");
  const add = (w: number, h: number, color: string, intensity: number, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); m.lookAt(0, 0, 0); scene.add(m);
  };
  add(10, 3, "#2440ff", 6, [-6, 1, 2]);     // kräftiges Blau von links
  add(6, 2, "#5b7bff", 3, [5, 2, 4]);       // Blau rechts vorne
  add(8, 0.5, "#ffffff", 8, [0, 6, 2]);     // weißer Streifen oben
  add(0.4, 8, "#ffffff", 5, [3, 0, 6]);     // schmale Kante rechts
  add(5, 5, "#ff5a2a", 1.6, [4, -3, -5]);   // warmes Gegenlicht hinten
  add(4, 1, "#9d6bff", 2.5, [-3, -4, 3]);   // Violett von unten
  const pmrem = new THREE.PMREMGenerator(gl);
  cached = pmrem.fromScene(scene, 0.035).texture;
  pmrem.dispose();
  return cached;
}

/** Aufgeblähtes „V“ – wie ein gesteppter Puffer, mit runden Kanten. */
export function makeVGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-1.05, 1); s.lineTo(-0.52, 1); s.lineTo(0, -0.18); s.lineTo(0.52, 1); s.lineTo(1.05, 1); s.lineTo(0.2, -1); s.lineTo(-0.2, -1); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.34, bevelSize: 0.16, bevelOffset: -0.02, bevelSegments: 18, curveSegments: 12 });
  g.center();
  g.computeVertexNormals();
  return g;
}

/** V-Kontur der Referenz (zwei Balken, linker breiter). Koordinaten ≈ −1…1. */
function vShape(inset = 0) {
  const s = new THREE.Shape();
  const i = inset;
  s.moveTo(-1.0 + i, 1 - i); s.lineTo(-0.26 - i * 0.6, 1 - i); s.lineTo(0.04, 0.0 + i * 1.6); s.lineTo(0.36 + i * 0.6, 1 - i);
  s.lineTo(0.92 - i, 1 - i); s.lineTo(0.3 - i * 0.4, -1 + i); s.lineTo(-0.3 + i * 0.4, -1 + i); s.closePath();
  return s;
}

/**
 * Facettiertes V wie im Referenzbild: dicke Extrusion mit flacher 45°-Fase (keine Polster-Rundung).
 * Gruppe 0 = Front/Rückseite (glänzend schwarz), Gruppe 1 = Seiten + Fasen (blaues Glas).
 */
export function makeFacetedV() {
  const g = new THREE.ExtrudeGeometry(vShape(), { depth: 0.62, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelOffset: -0.08, bevelSegments: 1, curveSegments: 1 });
  g.center();
  g.computeVertexNormals();
  return splitFacets(g);
}

/**
 * Teilt das V in drei Materialgruppen nach Flächennormale: 0 = Front/Rückseite (gebürstetes Metall),
 * 1 = Seitenwände (dunkles Hochglanzmetall), 2 = 45°-Fasen (leuchtende blaue Kanten).
 */
function splitFacets(src: THREE.BufferGeometry) {
  const g = src.index ? src.toNonIndexed() : src;
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  const buckets: number[][] = [[], [], []];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < pos.count / 3; t++) {
    a.fromBufferAttribute(pos, t * 3); b.fromBufferAttribute(pos, t * 3 + 1); c.fromBufferAttribute(pos, t * 3 + 2);
    const nz = Math.abs(b.sub(a).cross(c.sub(a)).normalize().z);
    buckets[nz > 0.9 ? 0 : nz < 0.2 ? 1 : 2].push(t);
  }
  const out = new THREE.BufferGeometry();
  const P: number[] = [], N: number[] = [], U: number[] = [];
  let start = 0;
  buckets.forEach((tris, gi) => {
    for (const t of tris) for (let k = 0; k < 3; k++) {
      const i = t * 3 + k;
      P.push(pos.getX(i), pos.getY(i), pos.getZ(i)); N.push(nor.getX(i), nor.getY(i), nor.getZ(i));
      if (uv) U.push(uv.getX(i), uv.getY(i));
    }
    out.addGroup(start, tris.length * 3, gi); start += tris.length * 3;
  });
  out.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
  out.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
  if (uv) out.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
  return out;
}

/** Materialien des facettierten V: gebürstetes dunkles Metall, Hochglanz-Seiten, elektrisch-blaue Kanten (Bloom). */
export function vMaterials() {
  return [
    new THREE.MeshPhysicalMaterial({ color: "#14171e", metalness: 1, roughness: 0.3, anisotropy: 0.85, anisotropyRotation: Math.PI / 2, clearcoat: 0.6, clearcoatRoughness: 0.12, envMapIntensity: 2.2 }),
    new THREE.MeshPhysicalMaterial({ color: "#05070d", metalness: 0.9, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.4 }),
    new THREE.MeshBasicMaterial({ color: new THREE.Color("#2f6bff").multiplyScalar(3.2), toneMapped: false }),
  ];
}

/** Leuchtende V-Kontur (Wandpaneel im Innenraum der Referenz). */
export function makeVOutline(width = 0.07) {
  const s = vShape();
  s.holes.push(new THREE.Path(vShape(width).getPoints().reverse()));
  const g = new THREE.ShapeGeometry(s);
  g.center();
  return g;
}

export const pointer = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; }, { passive: true });
}

/*
 * Echte HDRI-Umgebungen (Poly Haven, CC0 – über @pmndrs/assets, als .exr in public/hdri/).
 * Werden einmal geladen, per PMREM vorgefiltert und zwischengespeichert. Bis sie da sind, gilt getStudioEnv().
 */
export type Hdri = "night" | "night-2k" | "studio" | "city";
const hdris = new Map<Hdri, Promise<THREE.Texture>>();
export function loadHdri(gl: THREE.WebGLRenderer, name: Hdri) {
  let p = hdris.get(name);
  if (!p) {
    p = import("three/examples/jsm/loaders/EXRLoader.js").then(async ({ EXRLoader }) => {
      const eq = await new EXRLoader().loadAsync(`/hdri/${name}.exr`);
      eq.mapping = THREE.EquirectangularReflectionMapping;
      const pm = new THREE.PMREMGenerator(gl);
      const env = pm.fromEquirectangular(eq).texture;
      eq.dispose(); pm.dispose();
      return env;
    });
    hdris.set(name, p);
  }
  return p;
}
/** Setzt sofort die Studio-Umgebung und tauscht sie gegen die HDRI, sobald geladen. */
export function applyHdri(gl: THREE.WebGLRenderer, scene: THREE.Scene, name: Hdri, intensity = 1) {
  scene.environment = getStudioEnv(gl);
  let alive = true;
  loadHdri(gl, name).then((t) => { if (alive) { scene.environment = t; scene.environmentIntensity = intensity; } }).catch(() => {});
  return () => { alive = false; };
}
