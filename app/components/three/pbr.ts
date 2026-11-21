import * as THREE from "three";

/*
 * Echte PBR-Texturen (Poly Haven, CC0) aus public/tex/*.webp – Farbe, Normalen, Rauheit.
 * Lädt ohne Suspense: das Material ist sofort da und bekommt die Bilder, sobald sie ankommen
 * (das passiert hinter dem Ladebildschirm). Anisotrope Filterung = maximale Schärfe bei flachem Blickwinkel.
 */
const loader = typeof window !== "undefined" ? new THREE.TextureLoader() : null;
const cache = new Map<string, THREE.Texture>();
let maxAniso = 8;
export const setMaxAnisotropy = (n: number) => { maxAniso = Math.max(1, Math.min(16, n)); cache.forEach((t) => { t.anisotropy = maxAniso; }); };

export function tex(name: string, opts: { srgb?: boolean; repeat?: [number, number]; rotate?: boolean } = {}) {
  const key = `${name}|${opts.repeat?.join("x") ?? "1x1"}|${opts.rotate ? 1 : 0}`;
  let t = cache.get(key);
  if (t) return t;
  t = loader ? loader.load(`/tex/${name}.webp`) : new THREE.Texture();
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = opts.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = maxAniso;
  if (opts.repeat) t.repeat.set(...opts.repeat);
  if (opts.rotate) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
  cache.set(key, t);
  return t;
}

/** Satz aus Farbe/Normalen/Rauheit mit gemeinsamer Wiederholung. Fehlende Karten werden weggelassen. */
export function pbrSet(base: string, maps: ("diff" | "nor" | "rough")[], repeat: [number, number], rotate = false) {
  const o: { map?: THREE.Texture; normalMap?: THREE.Texture; roughnessMap?: THREE.Texture } = {};
  if (maps.includes("diff")) o.map = tex(`${base}_diff`, { srgb: true, repeat, rotate });
  if (maps.includes("nor")) o.normalMap = tex(`${base}_nor`, { repeat, rotate });
  if (maps.includes("rough")) o.roughnessMap = tex(`${base}_rough`, { repeat, rotate });
  return o;
}
