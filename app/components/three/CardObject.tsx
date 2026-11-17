"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera, RoundedBox, View } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getStudioEnv } from "./env";

export type Kind = "knot" | "box" | "blob" | "capsule";

function Obj({ kind, color, host }: { kind: Kind; color: string; host: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<THREE.Group>(null);
  const hover = useRef(false);
  const spin = useRef(0);
  const { gl, scene } = useThree();
  useEffect(() => {
    scene.environment = getStudioEnv(gl);
    const el = host.current;
    if (!el) return;
    const on = () => (hover.current = true), off = () => (hover.current = false);
    el.addEventListener("pointerenter", on); el.addEventListener("pointerleave", off);
    return () => { el.removeEventListener("pointerenter", on); el.removeEventListener("pointerleave", off); };
  }, [gl, scene, host]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    spin.current = THREE.MathUtils.lerp(spin.current, hover.current ? 3.2 : 0.35, 0.06);
    ref.current.rotation.y += dt * spin.current;
    const s = THREE.MathUtils.lerp(ref.current.scale.x, hover.current ? 1.12 : 1, 0.1);
    ref.current.scale.setScalar(s);
  });
  const mat = useMemo(() => ({ color, metalness: 0.25, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5 }), [color]);
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
      <group ref={ref} rotation={[0.35, 0, 0.1]}>
        {kind === "knot" && <mesh><torusKnotGeometry args={[0.62, 0.24, 220, 32]} /><meshPhysicalMaterial {...mat} /></mesh>}
        {kind === "box" && <RoundedBox args={[1.25, 1.25, 1.25]} radius={0.32} smoothness={8}><meshPhysicalMaterial {...mat} /></RoundedBox>}
        {kind === "blob" && <mesh><icosahedronGeometry args={[0.95, 24]} /><MeshDistortMaterial {...mat} distort={0.38} speed={2.2} /></mesh>}
        {kind === "capsule" && <mesh rotation={[0, 0, 0.9]}><capsuleGeometry args={[0.45, 0.9, 16, 32]} /><meshPhysicalMaterial {...mat} /></mesh>}
      </group>
    </Float>
  );
}

export default function CardObject({ kind, color, host, className }: { kind: Kind; color: string; host: React.RefObject<HTMLElement | null>; className?: string }) {
  return (
    <View className={className}>
      <PerspectiveCamera makeDefault position={[0, 0, 4.2]} fov={35} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 4, 2]} intensity={1.6} />
      <Obj kind={kind} color={color} host={host} />
    </View>
  );
}
