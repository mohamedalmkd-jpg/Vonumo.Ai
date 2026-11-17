"use client";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { useFBO, View } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { getStudioEnv, pointer } from "./env";
import { CHAPTERS, MOVES, flight } from "./flight";
import { Studio } from "./Studio";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
type Pose = { pos: THREE.Vector3; tgt: THREE.Vector3 };
type Path = { pos: THREE.CatmullRomCurve3; tgt: THREE.CatmullRomCurve3 };
const path = (p: Pose[]): Path => ({
  pos: new THREE.CatmullRomCurve3(p.map((x) => x.pos), false, "centripetal"),
  tgt: new THREE.CatmullRomCurve3(p.map((x) => x.tgt), false, "centripetal"),
});

/*
 * Kamera-Keyframes (Referenz: Totale → Fassade → durch das Glas → Innenraum).
 * Querformat: Gebäude rechts der Mitte, Text links. Hochformat: Gebäude unten, Text oben.
 */
const WIDE = {
  move1: path([
    { pos: v(-9.4, 2.3, 17.5), tgt: v(-2.9, 4.5, 0) },
    { pos: v(-8.2, 2.7, 14), tgt: v(-1.0, 4.7, 0) },
    { pos: v(-6.4, 3.0, 10.8), tgt: v(1.6, 4.9, 0) },
  ]),
  move2: path([
    { pos: v(-6.4, 3.0, 10.8), tgt: v(1.6, 4.9, 0) },
    { pos: v(-1.2, 3.7, 6.8), tgt: v(1.2, 3.9, -3) },
    { pos: v(0.4, 3.7, 3.9), tgt: v(1.4, 3.8, -4) },
    { pos: v(-2.0, 3.5, 2.2), tgt: v(2.6, 3.9, -5) },
  ]),
};
const TALL = {
  move1: path([
    { pos: v(-4.2, 1.9, 24.5), tgt: v(0.6, 7.6, 0) },
    { pos: v(-5.3, 2.5, 19), tgt: v(0.9, 6.0, 0) },
    { pos: v(-6.2, 2.9, 13.5), tgt: v(1.5, 4.6, 0) },
  ]),
  move2: path([
    { pos: v(-6.2, 2.9, 13.5), tgt: v(1.5, 4.6, 0) },
    { pos: v(-1.0, 3.6, 7.2), tgt: v(1.2, 3.8, -3) },
    { pos: v(0.6, 3.7, 3.9), tgt: v(1.6, 3.8, -4) },
    { pos: v(-1.6, 3.7, 2.8), tgt: v(1.9, 3.1, -5) },
  ]),
};
// Kleiner Vorschub während der Ruhephasen (Referenz: Kamera „atmet“ beim Weiterscrollen)
const DRIFT = 0.6;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function poseAt(p: number, P: typeof WIDE, outPos: THREE.Vector3, outTgt: THREE.Vector3) {
  const [m1, m2] = MOVES;
  const [, c1, c2] = CHAPTERS;
  let curve: Path, t: number, drift = 0;
  if (p < m1.to) { curve = P.move1; t = smooth(clamp01((p - m1.from) / (m1.to - m1.from))); drift = p < m1.from ? (p / m1.from) * 0.5 : 0; }
  else if (p < m2.from) { curve = P.move1; t = 1; drift = (p - c1.from) / (c1.to - c1.from); }
  else if (p < m2.to) { curve = P.move2; t = smooth(clamp01((p - m2.from) / (m2.to - m2.from))); }
  else { curve = P.move2; t = 1; drift = (p - c2.from) / (c2.to - c2.from); }
  curve.pos.getPoint(t, outPos);
  curve.tgt.getPoint(t, outTgt);
  if (drift) {
    const dir = _d.subVectors(outTgt, outPos).normalize();
    outPos.addScaledVector(dir, drift * DRIFT);
  }
}
const _d = new THREE.Vector3();

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const FRAG = `
  uniform sampler2D tMap; uniform float uBlur; uniform float uTime; uniform float uFade; uniform vec2 uCenter; uniform float uAspect;
  varying vec2 vUv;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    vec2 dir = vUv - uCenter;
    float d = length(dir * vec2(uAspect, 1.));
    float k = uBlur * smoothstep(0.05, 0.7, d);
    vec3 col = vec3(0.); float tot = 0.;
    float j = hash(gl_FragCoord.xy + uTime);
    for (int i = 0; i < 14; i++) {
      float t = (float(i) + j) / 14.;
      float w = 1. - t * 0.5;
      vec2 uv = vUv - dir * t * k;
      col += vec3(texture2D(tMap, uv + dir * k * 0.012).r, texture2D(tMap, uv).g, texture2D(tMap, uv - dir * k * 0.012).b) * w;
      tot += w;
    }
    col /= tot;
    col *= mix(1., smoothstep(1.25, 0.2, d), 0.6);         // Vignette
    col += (hash(gl_FragCoord.xy * 0.5 + fract(uTime) * 91.) - 0.5) * 0.018; // Korn
    gl_FragColor = vec4(col * uFade, 1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

function Flight() {
  const { gl, size, viewport } = useThree();
  const mobile = size.width < 768;
  const portrait = size.height > size.width;
  const fbo = useFBO(Math.max(2, Math.round(size.width * viewport.dpr)), Math.max(2, Math.round(size.height * viewport.dpr)), { samples: mobile ? 0 : 4 });
  const [scene] = useState(() => new THREE.Scene());
  const cam = useMemo(() => new THREE.PerspectiveCamera(40, 1, 0.1, 600), []);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
    uniforms: { tMap: { value: null }, uBlur: { value: 0 }, uTime: { value: 0 }, uFade: { value: 0 }, uCenter: { value: new THREE.Vector2(0.5, 0.5) }, uAspect: { value: 1 } },
  }), []);
  const st = useMemo(() => ({
    pos: new THREE.Vector3(), tgt: new THREE.Vector3(), wantPos: new THREE.Vector3(), wantTgt: new THREE.Vector3(),
    last: new THREE.Vector3(), init: false, intro: 0, blur: 0, reduce: false,
  }), []);

  useEffect(() => {
    scene.environment = getStudioEnv(gl);
    scene.fog = new THREE.Fog("#0a0f24", 30, 150);
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Shader vorab kompilieren, damit der erste Scroll nicht ruckelt
    gl.compile(scene, cam);
  }, [gl, scene, cam, st]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const P = portrait ? TALL : WIDE;
    poseAt(flight.p, P, st.wantPos, st.wantTgt);

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

    const aspect = size.width / Math.max(1, size.height);
    const hfov = portrait ? 74 : 64;
    const vfov = Math.min(portrait ? 72 : 48, (2 * Math.atan(Math.tan((hfov * Math.PI) / 360) / aspect) * 180) / Math.PI);
    cam.fov = vfov + st.blur * 30;
    cam.aspect = aspect;
    cam.position.copy(st.pos);
    cam.lookAt(st.tgt);
    cam.updateProjectionMatrix();

    mat.uniforms.uBlur.value = st.blur;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uFade.value = st.reduce ? 1 : Math.min(1, st.intro * 1.6);
    mat.uniforms.uAspect.value = aspect;
    mat.uniforms.tMap.value = fbo.texture;

    if (!flight.visible) return;
    const scissor = gl.getScissorTest();
    gl.setScissorTest(false);
    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, cam);
    gl.setRenderTarget(null);
    gl.setScissorTest(scissor);
  });

  return (
    <>
      {createPortal(<Studio mobile={mobile} />, scene)}
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
