"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getStudioEnv, makeVGeometry, pointer } from "./env";

type S = { x: number; y: number; s: number; v: number };
/** Zustände pro Abschnitt: Position in Bildschirm-Anteilen (−1…1), Größe, Sichtbarkeit. */
const DESK: Record<string, S> = {
  arbeiten: { x: 0, y: -1.6, s: 0.6, v: 0 },
  labor: { x: 0, y: -1.6, s: 0.6, v: 0 },
  top: { x: 0, y: -0.3, s: 0.6, v: 0 }, // Hero zeigt die Kamerafahrt – das V wartet
  details: { x: -0.12, y: -0.3, s: 1.05, v: 1 },
  leistungen: { x: 0, y: -1.6, s: 0.6, v: 0 },
  ebenen: { x: 0, y: 1.5, s: 0.6, v: 0 },
  ablauf: { x: -0.7, y: -1.7, s: 1.1, v: 0 },
  faq: { x: -0.6, y: -0.4, s: 1.15, v: 1 },
  kontakt: { x: -0.9, y: -1.6, s: 1, v: 0 },
};
const MOB: Record<string, S> = {
  arbeiten: { x: 0, y: -1.6, s: 0.5, v: 0 },
  labor: { x: 0, y: -1.6, s: 0.5, v: 0 },
  top: { x: 0, y: -0.4, s: 0.5, v: 0 },
  details: { x: 0, y: -0.62, s: 0.8, v: 1 },
  leistungen: { x: 0, y: -1.6, s: 0.5, v: 0 },
  ebenen: { x: 0, y: 1.5, s: 0.5, v: 0 },
  ablauf: { x: 0.6, y: -1.7, s: 0.75, v: 0 },
  faq: { x: 0.55, y: -0.78, s: 0.75, v: 1 },
  kontakt: { x: 0.8, y: -1.6, s: 0.7, v: 0 },
};
const ORDER = ["top", "arbeiten", "leistungen", "labor", "details", "ebenen", "ablauf", "faq", "kontakt"];
const ease = (t: number) => t * t * (3 - 2 * t);

function useScrollState() {
  const anchors = useRef<{ at: number; key: string }[]>([]);
  useEffect(() => {
    const measure = () => {
      anchors.current = ORDER.map((k) => {
        const el = document.getElementById(k);
        return el ? { key: k, at: el.getBoundingClientRect().top + window.scrollY } : null;
      }).filter(Boolean) as { at: number; key: string }[];
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("vonumo:loaded", measure);
    return () => { ro.disconnect(); window.removeEventListener("vonumo:loaded", measure); };
  }, []);
  return (out: S) => {
    const T = window.innerWidth < 768 ? MOB : DESK;
    const list = anchors.current;
    const y = window.scrollY, win = window.innerHeight * 0.85;
    let a = list[0]?.key ?? "top", b = a, t = 0;
    for (let i = 0; i < list.length; i++) {
      const next = list[i + 1];
      if (!next || y < next.at - win) { a = list[i].key; b = next ? next.key : a; t = next ? ease(Math.min(1, Math.max(0, (y - (next.at - win * 1.6)) / win))) : 0; break; }
    }
    const A = T[a], B = T[b];
    out.x = A.x + (B.x - A.x) * t; out.y = A.y + (B.y - A.y) * t; out.s = A.s + (B.s - A.s) * t; out.v = A.v + (B.v - A.v) * t;
    return out;
  };
}

function Mark() {
  const ref = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const geo = useMemo(makeVGeometry, []);
  const { gl, scene, size } = useThree();
  const read = useScrollState();
  const target = useMemo<S>(() => ({ x: 0, y: 0, s: 1, v: 1 }), []);
  const intro = useRef(0);
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  useEffect(() => {
    scene.environment = getStudioEnv(gl);
    const go = () => { if (intro.current === 0) intro.current = 0.0001; };
    // Falls der Ladebildschirm schon fertig war, bevor dieses Modul geladen wurde
    if ((window as unknown as { __vonumoLoaded?: boolean }).__vonumoLoaded) go();
    window.addEventListener("vonumo:loaded", go);
    return () => window.removeEventListener("vonumo:loaded", go);
  }, [gl, scene]);

  const signalled = useRef(false);
  useFrame((state, dt) => {
    const g = ref.current, m = inner.current;
    if (!g || !m) return;
    if (!signalled.current) {
      // Erst wenn das Objekt wirklich gezeichnet wird, darf der Ladebildschirm verschwinden
      signalled.current = true;
      (window as unknown as { __stageReady?: boolean }).__stageReady = true;
      window.dispatchEvent(new Event("vonumo:stage-ready"));
    }
    read(target);
    if (intro.current > 0 && intro.current < 1) intro.current = Math.min(1, intro.current + dt * 0.7);
    const k = reduce ? 1 : ease(intro.current);
    // Sichtbarer Bereich der eigenen Kamera (z = 6, fov 35) in Welt-Einheiten
    const vh = 2 * 6 * Math.tan((35 * Math.PI) / 360), vw = vh * (size.width / size.height);
    const viewport = { width: vw, height: vh };
    const unit = Math.min(vw, vh) * 0.3;
    const d = 1 - Math.pow(0.0015, dt);
    g.position.x = THREE.MathUtils.lerp(g.position.x, (target.x * viewport.width) / 2, d);
    g.position.y = THREE.MathUtils.lerp(g.position.y, (target.y * viewport.height) / 2 - (1 - k) * 1.2, d);
    const sc = Math.max(0.0001, unit * target.s * target.v * (0.6 + 0.4 * k));
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, sc, d));
    g.visible = g.scale.x > 0.01;
    const t = state.clock.elapsedTime;
    const vel = window.__lenis?.velocity ?? 0;
    m.rotation.y = THREE.MathUtils.lerp(m.rotation.y, (reduce ? 0 : Math.sin(t * 0.35) * 0.35) + pointer.x * 0.6 + (1 - k) * 2.4, 0.06) + vel * 0.004;
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, -pointer.y * 0.25 + (reduce ? 0 : Math.sin(t * 0.5) * 0.06), 0.06);
    m.rotation.z = THREE.MathUtils.lerp(m.rotation.z, -pointer.x * 0.08, 0.05);
    m.position.y = reduce ? 0 : Math.sin(t * 0.8) * 0.04;
  });

  return (
    <group ref={ref} scale={0.0001}>
      <mesh ref={inner} geometry={geo}>
        <meshPhysicalMaterial color="#05060f" metalness={0.55} roughness={0.14} clearcoat={1} clearcoatRoughness={0.06} iridescence={0.55} iridescenceIOR={1.35} envMapIntensity={1.7} />
      </mesh>
    </group>
  );
}

/** Feste, bildschirmfüllende View mit dem Haupt-Objekt. */
export default function HeroObject() {
  return (
    <View className="pointer-events-none fixed inset-0 z-[1]">
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={35} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[-4, 3, 3]} intensity={2.2} color="#4a63ff" />
      <directionalLight position={[4, 2, 2]} intensity={0.8} color="#ffffff" />
      <Mark />
    </View>
  );
}
