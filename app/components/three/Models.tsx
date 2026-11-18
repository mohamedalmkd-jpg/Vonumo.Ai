"use client";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

/*
 * Echte, professionell modellierte Möbel und Pflanzen (Poly Haven, CC0) statt Grundkörpern.
 * Dateien: public/models/<name>/<name>.gltf (+ .bin, WebP-Texturen 1k). Maße sind reale Meter.
 */
export type ModelName = "sofa_02" | "coffee_table_round_01" | "mid_century_lounge_chair" | "potted_plant_02";
const url = (n: ModelName) => `/models/${n}/${n}.gltf`;

export function Model({ name, position, rotation = 0, scale = 1, envMapIntensity = 1, shadows = true }: {
  name: ModelName; position: [number, number, number]; rotation?: number; scale?: number; envMapIntensity?: number; shadows?: boolean;
}) {
  const { scene } = useGLTF(url(name));
  // jede Instanz bekommt eigene Knoten (Geometrie und Material werden geteilt)
  const obj = useMemo(() => {
    const o = scene.clone(true);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = shadows; m.receiveShadow = shadows;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (mat?.isMeshStandardMaterial) {
        mat.envMapIntensity = envMapIntensity;
        // Blätter: Alpha-Test statt Blending → scharfe Kanten, keine Sortierfehler
        if (mat.alphaMap || mat.transparent) { mat.alphaTest = Math.max(mat.alphaTest, 0.5); mat.transparent = false; mat.side = THREE.DoubleSide; }
        for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap"] as const) { const t = mat[k]; if (t) t.anisotropy = 8; }
      }
    });
    return o;
  }, [scene, envMapIntensity, shadows]);
  return <primitive object={obj} position={position} rotation-y={rotation} scale={scale} />;
}

export const preloadModels = (names: ModelName[]) => names.forEach((n) => useGLTF.preload(url(n)));
