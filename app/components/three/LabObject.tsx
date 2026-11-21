"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, MeshDistortMaterial, MeshTransmissionMaterial, PerspectiveCamera, View } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { applyHdri, makeVGeometry, pointer } from "./env";
import { lab } from "./flight";

const glow = (hex: string, k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

/** Hohlkehle mit Lichtleisten – gibt Glas etwas zu brechen und Chrom etwas zu spiegeln. */
function Cyclorama() {
  const m = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ color: "#07080d", roughness: 0.85, metalness: 0.1, side: THREE.BackSide }),
    a: glow("#4f7bff", 3), b: glow("#8b6bff", 2.6), c: glow("#ffd2a0", 2.4),
  }), []);
  return (
    <group>
      <mesh position={[0, 2.5, 0]} material={m.wall}><cylinderGeometry args={[9, 9, 14, 64, 1, true, Math.PI * 0.75, Math.PI * 1.5]} /></mesh>
      <mesh position={[-3.4, 2.4, -6.2]} material={m.a}><boxGeometry args={[0.08, 7, 0.08]} /></mesh>
      <mesh position={[3.6, 2.4, -6.0]} material={m.b}><boxGeometry args={[0.08, 7, 0.08]} /></mesh>
      <mesh position={[0.4, 5.6, -6.6]} material={m.c}><boxGeometry args={[7, 0.06, 0.06]} /></mesh>
      <mesh position={[-6.2, 1.4, -2.4]} rotation-y={0.9} material={m.c}><boxGeometry args={[0.06, 3.4, 0.06]} /></mesh>
    </group>
  );
}

function Specimen({ mobile }: { mobile: boolean }) {
  const vGeo = useMemo(makeVGeometry, []);
  const group = useRef<THREE.Group>(null);
  const objs = [useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null)];
  const st = useMemo(() => ({ shown: lab.material as number, k: 1, rot: -0.4, reduce: false }), []);
  useEffect(() => { st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, [st]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20), g = group.current;
    if (!g) return;
    // Wechsel: aktuelles Objekt schrumpft mit Drehung weg, neues wächst heran
    if (lab.material !== st.shown) { st.k = Math.max(0, st.k - dt * 4); if (st.k === 0) st.shown = lab.material; }
    else st.k = Math.min(1, st.k + dt * 2.6);
    const e = 1 - Math.pow(1 - st.k, 3);
    objs.forEach((r, i) => { if (r.current) { r.current.visible = i === st.shown; r.current.scale.setScalar((i === 2 ? 1 : 1.25) * Math.max(0.001, e)); } });
    // Ziehen mit Trägheit; ohne Eingabe langsames Eigendrehen
    if (!lab.dragging) lab.vel *= Math.exp(-dt * 2.2);
    const idle = st.reduce ? 0 : 0.18;
    st.rot += lab.vel + (Math.abs(lab.vel) < 0.002 ? idle * dt : 0) + (1 - e) * dt * 6;
    g.rotation.y = st.rot;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.12, 0.05);
    g.position.y = 1.55 + (st.reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.06) - (1 - lab.enter) * 0.8;
  });

  return (
    <group ref={group} position={[0, 1.55, 0]}>
      <mesh ref={objs[0]} geometry={vGeo}>
        <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.035} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.25} />
      </mesh>
      <mesh ref={objs[1]} geometry={vGeo} visible={false}>
        <MeshTransmissionMaterial samples={mobile ? 3 : 6} resolution={mobile ? 256 : 512} transmission={1} thickness={0.7} roughness={0.02} ior={1.5}
          chromaticAberration={0.08} anisotropicBlur={0.12} distortion={0.12} distortionScale={0.4} temporalDistortion={0.05} backside backsideThickness={0.4} color="#eef1ff" />
      </mesh>
      <mesh ref={objs[2]} visible={false}>
        <icosahedronGeometry args={[1.05, mobile ? 32 : 64]} />
        <MeshDistortMaterial color="#d7dcf0" metalness={1} roughness={0.07} envMapIntensity={1.3} distort={0.42} speed={1.6} />
      </mesh>
    </group>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useFrame(() => {
    const narrow = size.width / size.height < 1;
    const z = (narrow ? 9.6 : 7.4) + (1 - lab.enter) * 2.2; // Scroll-Eintritt: Kamera fährt heran
    camera.position.set(pointer.x * 0.35, 2.0 + (1 - lab.enter) * 0.8, z);
    camera.lookAt(0, 1.45, 0);
  });
  return null;
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => applyHdri(gl, scene, "studio", 1), [gl, scene]);
  return null;
}

/** Material-Labor: Echtzeit-PBR mit HDRI-Licht und Kontaktschatten. */
export default function LabObject({ className }: { className?: string }) {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault fov={32} position={[0, 2, 7.4]} />
      <color attach="background" args={["#05060a"]} />
      <Env />
      <Rig />
      <ambientLight intensity={0.15} />
      <spotLight position={[4, 8, 4]} angle={0.3} penumbra={0.9} intensity={34} color="#ffffff" />
      <spotLight position={[-5, 4, -2]} angle={0.5} penumbra={1} intensity={40} color="#6f7bff" />
      <Cyclorama />
      <mesh rotation-x={-Math.PI / 2} position-y={0}><circleGeometry args={[9, 64]} /><meshStandardMaterial color="#040508" roughness={0.22} metalness={0.7} envMapIntensity={0.35} /></mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.75} scale={8} blur={2.4} far={4} resolution={mobile ? 256 : 512} color="#000000" />
      <Specimen mobile={mobile} />
    </View>
  );
}
