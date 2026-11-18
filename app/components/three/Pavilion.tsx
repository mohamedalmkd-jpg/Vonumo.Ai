"use client";
import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { pbrSet } from "./pbr";

/*
 * Detailliertes Pavillon-Modell aus Blender (scripts/blender/pavilion.py):
 * Sockel und Stufe mit Schattenfuge, Dachkern mit Metall-Attika und Tropfkante, LED-Profile,
 * 17-cm-Eichendielen mit Schattenfugen, Downlight-Ringe, Monolith und Seitenwand mit Paneelfugen,
 * vier gespiegelte Marmorplatten, Pfosten-, Kopf- und Sockelprofile, Lamellenwand und Schreibtisch.
 * UV0 = Meter (Kachelmaterialien), UV1 = Lightmap-Atlas mit in Cycles gebackener Umgebungsverdeckung (ao.webp).
 * Die Materialien werden hier per Slot-Name durch echte PBR-Materialien (Poly Haven) ersetzt.
 */
const URL = "/models/pavilion/pavilion.glb";

export function PavilionModel({ mobile, marble }: { mobile: boolean; marble: THREE.Material }) {
  const { scene } = useGLTF(URL);
  const obj = useMemo(() => {
    const ao = new THREE.TextureLoader().load("/models/pavilion/ao.webp");
    ao.channel = 1; ao.flipY = false; ao.anisotropy = 8;
    const withAo = <T extends THREE.MeshStandardMaterial>(m: T) => { m.aoMap = ao; m.aoMapIntensity = 1; return m; };
    const std = (p: THREE.MeshStandardMaterialParameters) => withAo(new THREE.MeshStandardMaterial(p));
    // Kachelgrößen in Metern (UV0 ist in Metern)
    const mats: Record<string, THREE.Material> = {
      plinth: std({ ...pbrSet("slab", ["diff", "nor"], [0.5, 0.5]), color: "#2a2d36", roughness: 0.72, metalness: 0.12 }),
      dark: std({ color: "#050508", roughness: 0.5, metalness: 0.4 }),
      slab: std({ color: "#0b0c11", roughness: 0.35, metalness: 0.55 }),
      fascia: std({ color: "#1c1f27", roughness: 0.28, metalness: 0.9 }),
      oak: std({ ...pbrSet("oak", ["diff", "nor", "rough"], [0.8, 0.8]), color: "#d39a6a", roughness: 1, metalness: 0, emissive: new THREE.Color("#ff9a55"), emissiveIntensity: 0.12 }),
      cladding: std({ ...pbrSet("slab", ["nor"], [0.7, 0.7]), color: "#0c0d12", roughness: 0.55, metalness: 0.35, normalScale: new THREE.Vector2(0.35, 0.35) }),
      marble: withAo((marble as THREE.MeshStandardMaterial).clone()),
      mullion: std({ color: "#030305", roughness: 0.3, metalness: 0.85 }),
      metal: std({ color: "#8a8d95", roughness: 0.32, metalness: 1 }),
      walnut: std({ ...pbrSet("walnut", ["diff"], [0.6, 0.6]), color: "#6b5a4d", roughness: 0.38, metalness: 0 }),
    };
    const oak = mats.oak as THREE.MeshStandardMaterial; oak.emissiveMap = oak.map ?? null;
    const o = scene.clone(true);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh) return;
      const name = (m.material as THREE.Material).name;
      m.material = mats[name] ?? m.material;
      m.castShadow = !mobile; m.receiveShadow = !mobile;
    });
    return o;
  }, [scene, mobile, marble]);
  return <primitive object={obj} />;
}

useGLTF.preload(URL);
