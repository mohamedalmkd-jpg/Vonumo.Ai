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

export const pointer = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("pointermove", (e) => { pointer.x = (e.clientX / window.innerWidth) * 2 - 1; pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; }, { passive: true });
}
