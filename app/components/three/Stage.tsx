"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { useEffect } from "react";

function Pause() {
  const { setFrameloop } = useThree();
  useEffect(() => {
    const on = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, [setFrameloop]);
  return null;
}

/** Eine einzige WebGL-Leinwand für die ganze Seite; Views zeichnen hinein, wo ihre DOM-Elemente liegen. */
export default function Stage() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <Canvas
      className="!fixed !inset-0 !z-0 !pointer-events-none"
      dpr={mobile ? [1, 1.4] : [1, 1.8]}
      gl={{ antialias: !mobile, alpha: true, powerPreference: "high-performance" }}
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.1; }}
    >
      <View.Port />
      <Pause />
    </Canvas>
  );
}
