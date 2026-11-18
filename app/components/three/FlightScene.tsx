"use client";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { applyHdri, pointer } from "./env";
import { setMaxAnisotropy } from "./pbr";
import { CHAPTERS, MOVES, chapterAt, flight, hero } from "./flight";
import { Studio } from "./Studio";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Pose = { pos: THREE.Vector3; tgt: THREE.Vector3 };
type Path = { pos: THREE.CatmullRomCurve3; tgt: THREE.CatmullRomCurve3 };
const path = (p: Pose[]): Path => ({
  pos: new THREE.CatmullRomCurve3(p.map((x) => x.pos), false, "centripetal"),
  tgt: new THREE.CatmullRomCurve3(p.map((x) => x.tgt), false, "centripetal"),
});

/*
 * Kamera-Ruhepunkte der sechs Kapitel (Weltkoordinaten in Metern) und Zwischenpunkte der Fahrten.
 * Querformat (WIDE): Motiv rechts, Text links. Hochformat (TALL): Motiv unten, Text oben.
 * Fahrt 3 führt durch die Glasfront (z = 3,4) in den Innenraum – ohne Szenenwechsel.
 */
type Rig = { rests: Pose[]; via: Pose[][] };
const WIDE: Rig = {
  rests: [
    { pos: v(-8.6, 1.05, 17.5), tgt: v(-3.2, 2.9, 0) },     // 01 Totale
    { pos: v(-7.0, 1.0, 11.0), tgt: v(1.0, 2.4, 0.5) },     // 02 näher am Studio
    { pos: v(-4.4, 1.7, 7.6), tgt: v(2.4, 3.0, 0) },        // 03 Fassade, Einblick
    { pos: v(1.2, 2.05, 1.6), tgt: v(-2.4, 1.55, -2.6) },   // 04 Arbeitsplätze
    { pos: v(0.45, 1.5, 0.35), tgt: v(1.55, 2.05, -3.1) },  // 05 V-Skulptur
    { pos: v(2.3, 1.75, 1.7), tgt: v(2.4, 2.15, -2.6) },    // 06 Schlussbild
  ],
  via: [[], [], [{ pos: v(0.2, 2.1, 7.0), tgt: v(1.6, 2.4, -3) }, { pos: v(1.4, 2.15, 4.4), tgt: v(0.4, 2.2, -4) }], [], []],
};
const TALL: Rig = {
  rests: [
    { pos: v(-3.6, 0.6, 19.5), tgt: v(0.7, 5.3, 0) },
    { pos: v(-6.2, 1.5, 13.5), tgt: v(1.5, 3.2, 0) },
    { pos: v(-3.0, 1.6, 9.0), tgt: v(1.6, 2.8, 0) },
    { pos: v(1.6, 2.1, 2.5), tgt: v(-2.0, 2.2, -2.6) },
    { pos: v(1.15, 1.8, 0.75), tgt: v(2.35, 2.75, -2.6) },
    { pos: v(2.4, 1.9, 2.6), tgt: v(2.4, 2.9, -2.6) },
  ],
  via: [[], [], [{ pos: v(-1.0, 2.2, 7.2), tgt: v(1.2, 2.4, -3) }, { pos: v(0.9, 2.3, 4.2), tgt: v(0.4, 2.4, -4) }], [], []],
};
// Kleiner Vorschub während der Ruhephasen (die Kamera „atmet“ beim Weiterscrollen); Teil der Bahn → keine Sprünge
const DRIFT = 0.45;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const drifted = (r: Pose) => r.pos.clone().addScaledVector(r.tgt.clone().sub(r.pos).normalize(), DRIFT);
const buildMoves = (R: Rig): Path[] => R.via.map((via, i) => path([{ pos: drifted(R.rests[i]), tgt: R.rests[i].tgt }, ...via, R.rests[i + 1]]));
const MOVE_PATHS = { wide: buildMoves(WIDE), tall: buildMoves(TALL) };

function poseAt(p: number, R: Rig, paths: Path[], outPos: THREE.Vector3, outTgt: THREE.Vector3) {
  const c = chapterAt(p);
  if (c >= 0) {
    const ch = CHAPTERS[c], r = R.rests[c], k = c === 0 ? 0 : clamp01((p - ch.from) / (ch.to - ch.from));
    outPos.copy(r.pos).lerp(drifted(r), k); outTgt.copy(r.tgt);
    return;
  }
  const m = Math.max(0, MOVES.findIndex((mv) => p > mv.from && p < mv.to));
  const t = smooth(clamp01((p - MOVES[m].from) / (MOVES[m].to - MOVES[m].from)));
  paths[m].pos.getPoint(t, outPos); paths[m].tgt.getPoint(t, outTgt);
}

/*
 * Showreel-Aufnahme (?capture=reel): eigene, durchgehende Kamerafahrt für den vorgerenderten Film
 * (scripts/render-reel.cjs). Zeit kommt aus window.__reelT (0…1), nicht aus der Uhr → deterministisch.
 * Tief über dem nassen Vorplatz → Fahrt entlang der Fassade → um die Ecke → durch das Glas → Orbit um die V-Skulptur.
 */
export const REEL_SECONDS = 10;
const REEL = path([
  { pos: v(-11, 0.35, 15), tgt: v(-1, 1.4, 0) },
  { pos: v(-8, 0.8, 10.8), tgt: v(0, 2.0, 0) },
  { pos: v(-3, 1.3, 8.2), tgt: v(1.5, 2.1, 0) },
  { pos: v(3.4, 1.5, 7.8), tgt: v(2.6, 2.1, -1) },
  { pos: v(7.4, 1.8, 6.4), tgt: v(2.2, 2.3, -2) },
  { pos: v(4.2, 1.9, 4.6), tgt: v(2.3, 2.5, -2.6) },
  { pos: v(2.9, 2.3, 1.3), tgt: v(2.4, 2.6, -2.6) },
  { pos: v(0.5, 2.45, 0.2), tgt: v(2.4, 2.65, -2.6) },
]);
const reelPose = (t: number, pos: THREE.Vector3, tgt: THREE.Vector3) => {
  const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // weich an- und auslaufen
  REEL.pos.getPoint(e, pos); REEL.tgt.getPoint(e, tgt);
};
const _rp = new THREE.Vector3(), _rt = new THREE.Vector3(), _vp = new THREE.Matrix4();
const isCapture = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("capture") === "reel";

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const FRAG = `
  uniform sampler2D tMap; uniform float uBlur; uniform float uTime; uniform float uFade; uniform vec2 uCenter; uniform float uAspect;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    vec2 dir = vUv - uCenter;
    float d = length(dir * vec2(uAspect, 1.));
    float k = uBlur * smoothstep(0.05, 0.7, d);
    vec3 col;
    if (k < 0.002) {
      col = texture2D(tMap, vUv).rgb;                        // Ruhe: ein Abtastpunkt, volle Schärfe
    } else {
      // Bewegungsunschärfe nur während der Kamerafahrt
      col = vec3(0.); float tot = 0.;
      float j = hash(gl_FragCoord.xy + uTime);
      for (int i = 0; i < 14; i++) {
        float t = (float(i) + j) / 14.;
        float w = 1. - t * 0.5;
        vec2 uv = vUv - dir * t * k;
        col += vec3(texture2D(tMap, uv + dir * k * 0.012).r, texture2D(tMap, uv).g, texture2D(tMap, uv - dir * k * 0.012).b) * w;
        tot += w;
      }
      col /= tot;
    }
    col *= mix(1., smoothstep(1.35, 0.25, d), 0.45);       // Vignette (dezent)
    col += (hash(gl_FragCoord.xy * 0.5 + fract(uTime) * 91.) - 0.5) * 0.006; // feines Korn gegen Banding
    gl_FragColor = vec4(col * uFade, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

function Flight() {
  const { gl, size, viewport } = useThree();
  const mobile = size.width < 768;
  const portrait = size.height > size.width;
  const [scene] = useState(() => new THREE.Scene());
  const cam = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.1, 3000), []);
  // Szene → (MSAA) → Bloom; Ergebnis liest die Unschärfe-Fläche als Textur
  const composer = useMemo(() => {
    const w = Math.max(2, Math.round(size.width * viewport.dpr)), h = Math.max(2, Math.round(size.height * viewport.dpr));
    // 4×MSAA auch auf dem Telefon (auf Kachel-GPUs fast kostenlos) → glatte Kanten ohne höhere Pixeldichte
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: Math.min(4, gl.capabilities.maxSamples) });
    const c = new EffectComposer(gl, rt);
    c.renderToScreen = false;
    c.addPass(new RenderPass(scene, cam));
    // Bloom zurückhaltend: nur echte Lichtquellen (Schwelle 1,0) glühen, Details bleiben lesbar
    c.addPass(new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), mobile ? 0.16 : 0.3, 0.35, 1.0));
    return c;
  }, [gl, scene, cam, size.width, size.height, viewport.dpr, mobile]);
  useEffect(() => () => composer.dispose(), [composer]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
    uniforms: { tMap: { value: null }, uBlur: { value: 0 }, uTime: { value: 0 }, uFade: { value: 0 }, uCenter: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: 1 } },
  }), []);
  const st = useMemo(() => ({
    pos: new THREE.Vector3(), tgt: new THREE.Vector3(), wantPos: new THREE.Vector3(), wantTgt: new THREE.Vector3(),
    last: new THREE.Vector3(), init: false, intro: 0, blur: 0, reduce: false,
  }), []);

  useEffect(() => {
    // Nacht-HDRI (Poly Haven) für physikalisch plausible Spiegelungen auf Glas, Metall und Boden
    scene.environmentIntensity = 0.4;
    setMaxAnisotropy(gl.capabilities.getMaxAnisotropy());
    // Desktop: 2k-HDRI (schärfere Spiegelungen auf Glas, Metall und nassem Stein), Telefon: 1k
    const stopHdri = applyHdri(gl, scene, mobile ? "night" : "night-2k", 0.32);
    // Schatten (nur Desktop): Mondlicht wirft den Pavillon auf den nassen Vorplatz
    gl.shadowMap.enabled = !mobile; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.fog = new THREE.Fog("#111c44", 300, 2600); // nur leichte Luftperspektive: Gebirge bleibt klar lesbar
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCapture()) document.documentElement.dataset.capture = "";
    // Shader vorab kompilieren, damit der erste Scroll nicht ruckelt
    gl.compile(scene, cam);
    return stopHdri;
  }, [gl, scene, cam, st, mobile]);

  const capture = useMemo(isCapture, []);
  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    if (capture) {
      const T = (window as unknown as { __reelT?: number }).__reelT ?? 0;
      flight.time = T * REEL_SECONDS; flight.visible = true; st.intro = 1;
      reelPose(T, st.pos, st.tgt);
      reelPose(Math.max(0, T - 1 / (24 * REEL_SECONDS)), _rp, _rt);
      st.blur = Math.min(0.1, Math.max(0, _rp.distanceTo(st.pos) * 24 - 1.5) * 0.008); // analytische Bewegungsunschärfe
    } else {
    flight.time = state.clock.elapsedTime;
    poseAt(flight.p, portrait ? TALL : WIDE, portrait ? MOVE_PATHS.tall : MOVE_PATHS.wide, st.wantPos, st.wantTgt);

    // Intro nach dem Ladebildschirm: aus der Ferne heranfahren, aus Schwarz aufblenden
    if (flight.started) st.intro = Math.min(1, st.intro + dt / (st.reduce ? 0.01 : 2.6));
    const k = 1 - Math.pow(1 - st.intro, 4);
    st.wantPos.x -= (1 - k) * 3; st.wantPos.y += (1 - k) * 2.2; st.wantPos.z += (1 - k) * 10;

    // dezente Parallaxe mit der Maus
    if (!st.reduce) { st.wantTgt.x += pointer.x * 0.5; st.wantTgt.y += pointer.y * 0.25; st.wantPos.x += pointer.x * 0.2; }

    if (!st.init) { st.pos.copy(st.wantPos); st.tgt.copy(st.wantTgt); st.last.copy(st.pos); st.init = true; }
    const damp = st.reduce ? 1 : 1 - Math.exp(-dt * 5.5);
    st.pos.lerp(st.wantPos, damp);
    st.tgt.lerp(st.wantTgt, damp);

    // Geschwindigkeit → Bewegungsunschärfe (nicht während des Intros)
    const speed = st.last.distanceTo(st.pos) / Math.max(dt, 1e-3);
    st.last.copy(st.pos);
    const want = st.reduce || st.intro < 1 ? 0 : Math.min(0.22, Math.max(0, speed - 1.2) * 0.012);
    st.blur += (want - st.blur) * (1 - Math.exp(-dt * 10));
    }

    const aspect = size.width / Math.max(1, size.height);
    const hfov = portrait ? 74 : 64;
    const vfov = Math.min(portrait ? 72 : 48, (2 * Math.atan(Math.tan((hfov * Math.PI) / 360) / aspect) * 180) / Math.PI);
    cam.fov = vfov + st.blur * 30;
    cam.aspect = aspect;
    cam.position.copy(st.pos);
    cam.lookAt(st.tgt);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    // Kamera-Matrix für die DOM-Hotspots (an echte 3D-Objekte geheftet)
    _vp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    hero.vp.set(_vp.elements); hero.w = size.width; hero.h = size.height; hero.ready = st.intro > 0.85;

    mat.uniforms.uBlur.value = st.blur;
    mat.uniforms.uTime.value = flight.time;
    mat.uniforms.uFade.value = st.reduce ? 1 : Math.min(1, st.intro * 1.6);
    mat.uniforms.uAspect.value = aspect;

    if (!flight.visible) return;
    const scissor = gl.getScissorTest();
    gl.setScissorTest(false);
    composer.render(dt);
    mat.uniforms.tMap.value = composer.readBuffer.texture;
    gl.setRenderTarget(null);
    gl.setScissorTest(scissor);
  });

  return (
    <>
      {createPortal(<Studio mobile={mobile} />, scene, { camera: cam })}
      <mesh frustumCulled={false} material={mat} renderOrder={-1}><planeGeometry args={[2, 2]} /></mesh>
    </>
  );
}

/** Hintergrund des Heros: Kamerafahrt durch den VONUMO-Studio-Pavillon. */
export default function FlightScene({ className }: { className?: string }) {
  return (
    <View className={className}>
      <Flight />
    </View>
  );
}
