"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getStudioEnv, makeVGeometry } from "./env";
import { flight } from "./flight";

function Macro() {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(makeVGeometry, []);
  const { gl, scene } = useThree();
  const bg = useMemo(() => new THREE.Color("#05060b"), []);
  useEffect(() => { scene.environment = getStudioEnv(gl); }, [gl, scene]);
  useFrame((s) => {
    if (!ref.current) return;
    // nur im Kapitel „Detail“ zeichnen – sonst bleibt der Bereich durchsichtig
    const on = flight.chapter === 1;
    ref.current.visible = on;
    scene.background = on ? bg : null;
    const t = s.clock.elapsedTime;
    ref.current.rotation.set(0.25 + Math.sin(t * 0.4) * 0.08, -0.6 + Math.sin(t * 0.25) * 0.35, 0.12);
  });
  return (
    <mesh ref={ref} geometry={geo} position={[0.55, -0.35, 0]} scale={1.35}>
      <meshPhysicalMaterial color="#05060f" metalness={0.55} roughness={0.14} clearcoat={1} clearcoatRoughness={0.06} iridescence={0.55} iridescenceIOR={1.35} envMapIntensity={1.9} />
    </mesh>
  );
}

/** Kleine Inset-Karte im Kapitel „Detail“: Makro-Aufnahme des V-Materials. */
export default function DetailObject({ className }: { className?: string }) {
  return (
    <View className={className} index={2}>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={30} />
      <directionalLight position={[-3, 2, 3]} intensity={2.4} color="#4a63ff" />
      <directionalLight position={[3, 1, 2]} intensity={0.8} />
      <Macro />
    </View>
  );
}
