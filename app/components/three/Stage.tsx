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
 * Rendert im requestAnimationFrame-Takt des Displays (60/120 Hz). Die Pixeldichte passt sich laufend an
 * die gemessene Bildrate an: starke Geräte bekommen schärfere Pixel, schwache bleiben flüssig.
 */
export default function Stage() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  const native = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const [min, max] = mobile ? [0.85, Math.min(native, 1.6)] : [1, Math.min(native, 2)];
  const capture = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("capture") === "reel";
  const [dpr, setDpr] = useState(capture ? 1.5 : Math.min(max, mobile ? 1.2 : 1.5));
  return (
    <Canvas
      className="!fixed !inset-0 !z-0 !pointer-events-none"
      dpr={dpr}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.1; }}
    >
      {!capture && <PerformanceMonitor
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
