"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor, View } from "@react-three/drei";
import { useEffect, useState } from "react";

function Pause() {
  const { setFrameloop } = useThree();
  useEffect(() => {
    const on = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [setFrameloop]);
  return null;
}

/**
 * Eine einzige WebGL-Leinwand für die ganze Seite; Views zeichnen hinein, wo ihre DOM-Elemente liegen.
 * Rendert im requestAnimationFrame-Takt des Displays (60/120 Hz).
 * Pixeldichte: startet scharf (Desktop bis 1,8, Telefon bis 1,5) und passt sich laufend an die gemessene
 * Bildrate an – starke Geräte bleiben scharf, schwache flüssig. Kein 3×-Rendering auf dem Telefon:
 * 4×MSAA im Hero-Puffer glättet Kanten auf Apple-GPUs günstiger als mehr Pixel.
 * QA: ?dpr=1.5 erzwingt eine feste Dichte (für Nahaufnahmen im Software-Renderer).
 */
export default function Stage() {
  const w = typeof window !== "undefined" ? window : null;
  const mobile = !!w && w.innerWidth < 768;
  const native = w ? w.devicePixelRatio : 1;
  const params = w ? new URLSearchParams(w.location.search) : null;
  const forced = Number(params?.get("dpr")) || 0;
  const capture = params?.get("capture") === "reel";
  const [min, max] = mobile ? [1, Math.min(native, 1.5)] : [1, Math.min(native, 1.8)];
  const fixed = forced || (capture ? 1.5 : 0);
  const [dpr, setDpr] = useState(fixed || max);
  return (
    <Canvas
      className="!fixed !inset-0 !z-0 !pointer-events-none"
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.1;
        // Messwerte für scripts/fidelity-audit.cjs (echte Renderauflösung, Speicher)
        (window as unknown as { __vonumoAudit?: () => object }).__vonumoAudit = () => ({
          pixelRatio: gl.getPixelRatio(), maxAnisotropy: gl.capabilities.getMaxAnisotropy(), maxSamples: gl.capabilities.maxSamples,
          textures: gl.info.memory.textures, geometries: gl.info.memory.geometries,
        });
      }}
    >
      {!fixed && <PerformanceMonitor
        bounds={(refresh) => (refresh > 90 ? [55, 110] : [45, 58])}
        flipflops={4}
        onChange={({ factor }) => setDpr(Math.round((min + (max - min) * factor) * 10) / 10)}
        onFallback={() => setDpr(min)}
      />}
      <View.Port />
      <Pause />
    </Canvas>
  );
}
