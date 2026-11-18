"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getStudioEnv, makeFacetedV, vMaterials } from "./env";
import { flight } from "./flight";

function Macro({ chapters }: { chapters: number[] }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(makeFacetedV, []);
  const mats = useMemo(vMaterials, []);
  const { gl, scene } = useThree();
  const bg = useMemo(() => new THREE.Color("#05060b"), []);
  useEffect(() => { scene.environment = getStudioEnv(gl); }, [gl, scene]);
  useFrame((s) => {
    if (!ref.current) return;
    // nur im Kapitel „Detail“ zeichnen – sonst bleibt der Bereich durchsichtig
    const on = chapters.includes(flight.chapter);
    ref.current.visible = on;
    scene.background = on ? bg : null;
    const t = s.clock.elapsedTime;
    ref.current.rotation.set(0.12 + Math.sin(t * 0.4) * 0.05, -0.45 + Math.sin(t * 0.25) * 0.25, 0.04);
  });
  return <mesh ref={ref} geometry={geo} material={mats} position={[0.35, -0.1, 0]} scale={0.95} />;
}

/** Kleine Inset-Karte (Kapitel „Studio“ und „Detail“): Makro-Aufnahme des facettierten V. */
export default function DetailObject({ className, chapters = [1] }: { className?: string; chapters?: number[] }) {
  return (
    <View className={className} index={2}>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={30} />
      <directionalLight position={[-3, 2, 3]} intensity={2.4} color="#4a63ff" />
      <directionalLight position={[3, 1, 2]} intensity={0.8} />
      <Macro chapters={chapters} />
    </View>
  );
}
