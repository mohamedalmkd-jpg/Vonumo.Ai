"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, RoundedBox, useTexture, View } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { applyHdri, pointer } from "./env";
import { services } from "./flight";
import { makeScreen } from "./textures";

/*
 * Schwebende Geräte-Mockups (Laptop + Telefon) für die sechs Leistungen.
 * Wechsel: Bildschirm „rollt“ per Wisch-Shader auf das nächste Projekt um, Geräte drehen sich in eine neue Pose.
 */
type Pose = { ry: number; rx: number; phone: [number, number, number]; pr: number };
const POSES: Pose[] = [
  { ry: -0.42, rx: 0.1, phone: [2.15, 0.95, 0.9], pr: -0.35 },  // Web Design & UI/UX
  { ry: 0.5, rx: 0.22, phone: [-1.9, 1.15, 1.2], pr: 0.55 },    // 3D
  { ry: -0.3, rx: 0.12, phone: [2.0, 0.85, 1.1], pr: -0.5 },    // KI
  { ry: 0.32, rx: 0.16, phone: [-2.2, 0.9, 0.7], pr: 0.4 },     // Software
  { ry: -0.18, rx: 0.06, phone: [1.7, 1.05, 1.5], pr: -0.15 },  // Branding
  { ry: 0.24, rx: 0.12, phone: [-2.0, 1.0, 1.0], pr: 0.3 },     // Performance
];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`;
const FRAG = `
  uniform sampler2D tA; uniform sampler2D tB; uniform float uMix; uniform float uBright;
  varying vec2 vUv;
  void main(){
    float y = 1. - vUv.y;                       // Wisch von oben nach unten
    float m = smoothstep(uMix - 0.02, uMix, y);
    vec3 a = texture2D(tA, vUv).rgb, b = texture2D(tB, vUv).rgb;
    vec3 col = mix(b, a, m);
    float edge = exp(-abs(y - uMix) * 160.) * step(0.001, uMix) * step(uMix, 0.999);
    col += vec3(0.2, 0.88, 1.) * edge * 0.9;     // Scanlinie in Cyan
    gl_FragColor = vec4(col * uBright, 1.);
    #include <colorspace_fragment>
  }`;

function useScreenMat() {
  return useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, toneMapped: false,
    uniforms: { tA: { value: null }, tB: { value: null }, uMix: { value: 1 }, uBright: { value: 1 } },
  }), []);
}

function Devices() {
  const [aeraD, aeraM, koraD, koraM, mythosM, pilotD, pilotM] = useTexture([
    "/work/aera-desktop.webp", "/work/aera-mobile.webp", "/work/kora-desktop.webp", "/work/kora-mobile.webp",
    "/work/mythos-mobile.webp", "/work/pilot-desktop.webp", "/work/pilot-mobile.webp",
  ]);
  const code = useMemo(() => makeScreen("code"), []);
  const three = useMemo(() => makeScreen("3d"), []);
  const ui = useMemo(() => makeScreen("ui"), []);
  const desk = useMemo(() => [aeraD, three, pilotD, code, koraD, ui], [aeraD, three, pilotD, code, koraD, ui]);
  const mob = useMemo(() => [aeraM, aeraM, pilotM, mythosM, koraM, koraM], [aeraM, pilotM, mythosM, koraM]);
  const { gl, scene } = useThree();
  useEffect(() => {
    const stop = applyHdri(gl, scene, "studio", 1.1);
    [aeraD, aeraM, koraD, koraM, mythosM, pilotD, pilotM].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; });
    return stop;
  }, [gl, scene, aeraD, aeraM, koraD, koraM, mythosM, pilotD, pilotM]);

  const lapMat = useScreenMat(), phoneMat = useScreenMat();
  const group = useRef<THREE.Group>(null), phone = useRef<THREE.Group>(null), lid = useRef<THREE.Group>(null);
  const st = useMemo(() => ({ shown: -1, mix: 1, intro: 0, reduce: false }), []);
  useEffect(() => { st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, [st]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);
    const i = services.active;
    if (st.shown === -1) { st.shown = i; lapMat.uniforms.tA.value = lapMat.uniforms.tB.value = desk[i]; phoneMat.uniforms.tA.value = phoneMat.uniforms.tB.value = mob[i]; }
    if (i !== st.shown) {
      // neues Ziel: aktuelles Bild wird zur Ausgangsfläche, Wisch beginnt von vorn
      lapMat.uniforms.tA.value = lapMat.uniforms.tB.value; phoneMat.uniforms.tA.value = phoneMat.uniforms.tB.value;
      lapMat.uniforms.tB.value = desk[i]; phoneMat.uniforms.tB.value = mob[i];
      st.mix = 0; st.shown = i;
    }
    st.mix = st.reduce ? 1 : Math.min(1, st.mix + dt / 0.85);
    const e = 1 - Math.pow(1 - st.mix, 3);
    lapMat.uniforms.uMix.value = e; phoneMat.uniforms.uMix.value = Math.min(1, e * 1.15);

    st.intro = Math.min(1, st.intro + dt / 1.6);
    const P = POSES[i], k = 1 - Math.exp(-dt * 3.2), t = state.clock.elapsedTime;
    const g = group.current, ph = phone.current, l = lid.current;
    if (!g || !ph || !l) return;
    const bob = st.reduce ? 0 : Math.sin(t * 0.7) * 0.06;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, P.ry + pointer.x * 0.18, k);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, P.rx - pointer.y * 0.08, k);
    g.position.y = bob;
    // Deckel öffnet sich beim ersten Erscheinen
    l.rotation.x = THREE.MathUtils.lerp(1.45, -0.18, 1 - Math.pow(1 - st.intro, 3));
    ph.position.lerp(_v.set(...P.phone), k);
    ph.position.y += st.reduce ? 0 : Math.sin(t * 0.9 + 1) * 0.08;
    ph.rotation.y = THREE.MathUtils.lerp(ph.rotation.y, P.pr, k);
    ph.rotation.z = THREE.MathUtils.lerp(ph.rotation.z, -P.pr * 0.12, k);
  });

  const alu = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1d26", metalness: 0.85, roughness: 0.28 }), []);
  const deck = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0b0c11", metalness: 0.4, roughness: 0.55 }), []);
  const shadow = useShadowTex();
  return (
    <group ref={group}>
      {/* Laptop */}
      <RoundedBox args={[3.5, 0.1, 2.35]} radius={0.05} smoothness={4} material={alu} position={[0, 0, 0]} />
      <mesh position={[0, 0.052, 0.1]} rotation-x={-Math.PI / 2} material={deck}><planeGeometry args={[3.1, 1.5]} /></mesh>
      <mesh position={[0, 0.053, 0.98]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.2, 0.3]} /><meshStandardMaterial color="#14161e" metalness={0.5} roughness={0.4} /></mesh>
      <group ref={lid} position={[0, 0.05, -1.15]} rotation-x={1.45}>
        <group position={[0, 1.1, 0]}>
          <RoundedBox args={[3.5, 2.22, 0.07]} radius={0.05} smoothness={4} material={alu} />
          <mesh position={[0, 0.02, 0.037]} material={lapMat}><planeGeometry args={[3.3, 2.0625]} /></mesh>
        </group>
      </group>
      {/* Telefon */}
      <group ref={phone} position={POSES[0].phone}>
        <RoundedBox args={[1.02, 2.08, 0.09]} radius={0.13} smoothness={6}><meshStandardMaterial color="#0c0d12" metalness={0.9} roughness={0.25} /></RoundedBox>
        <mesh position={[0, 0, 0.047]} material={phoneMat}><planeGeometry args={[0.93, 2.0]} /></mesh>
      </group>
      {/* weicher Schatten */}
      <mesh position={[0.3, -0.7, 0.2]} rotation-x={-Math.PI / 2}><planeGeometry args={[7, 4.5]} /><meshBasicMaterial map={shadow} transparent depthWrite={false} opacity={0.75} /></mesh>
    </group>
  );
}
const _v = new THREE.Vector3();

function useShadowTex() {
  return useMemo(() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d")!; const g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, "rgba(79,107,255,0.35)"); g.addColorStop(0.5, "rgba(0,0,0,0.25)"); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

function Rig() {
  const { camera, size } = useThree();
  useFrame(() => {
    const narrow = size.width / size.height < 1.05;
    camera.position.set(0, narrow ? 2.0 : 1.7, narrow ? 10.8 : 8.2);
    camera.lookAt(0, 0.65, 0);
  });
  return null;
}

/** Leistungsbereich: Geräte-Bühne. */
export default function ServicesObject({ className }: { className?: string }) {
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 1.7, 8.2]} fov={30} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 5, 4]} intensity={1.8} color="#8fa2ff" />
      <directionalLight position={[5, 2, -3]} intensity={1.2} color="#33e1ff" />
      <Rig />
      <Devices />
    </View>
  );
}
