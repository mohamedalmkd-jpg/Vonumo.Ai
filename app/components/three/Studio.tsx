"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { makeVGeometry } from "./env";
import { makeGrid, makeScreen, makeStone, type ScreenKind } from "./textures";

/*
 * Die VONUMO-Studio-Pavillon-Szene (Gegenstück zum Chalet der Referenz).
 * Koordinaten in Metern. Glasfront zeigt nach +z, Rückfenster nach −z.
 *   Sockel (Stein) · Bodenplatte y≈2.1 · Dach y≈5.6–6.1 mit 1.8 m Auskragung
 *   Innenraum z = 3.4 … −4.7, Rückfenster rahmt den Hauptgipfel
 */
const FLOOR = 2.125, CEIL = 5.625, FRONT = 3.4, BACK = -4.7, LEFT = -5.6, RIGHT = 6.8;

function Sky() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {},
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 top = vec3(0.008,0.010,0.022);
        vec3 hor = vec3(0.075,0.105,0.26);
        vec3 col = mix(hor, top, smoothstep(-0.02, 0.45, h));
        col += vec3(0.10,0.14,0.42) * exp(-abs(h-0.02)*22.0) * 0.55; // Horizontglühen
        gl_FragColor = vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), []);
  return <mesh material={mat} frustumCulled={false}><sphereGeometry args={[300, 32, 16]} /></mesh>;
}

function Peaks() {
  const geo = useMemo(() => {
    const list: [number, number, number, number, number][] = [
      // x, z, Radius, Höhe, Drehung
      [10, -95, 30, 62, 0.4], [-34, -110, 34, 48, 1.1], [42, -120, 36, 44, 2.0], [-70, -90, 30, 38, 0.2],
      [74, -88, 26, 34, 0.9], [-8, -140, 40, 40, 1.7], [-110, -130, 40, 52, 0.6], [110, -140, 44, 50, 2.6],
      [-150, -60, 34, 30, 1.3], [150, -70, 30, 28, 0.1],
    ];
    const geos = list.map(([x, z, r, h, rot]) => {
      const g = new THREE.ConeGeometry(r, h, 11, 7).toNonIndexed();
      // zerklüften: deterministisches Rauschen je Eckpunkt-Position (Nähte bleiben geschlossen)
      const p = g.attributes.position;
      const n = (a: number, b: number, c: number) => { const s = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + x) * 43758.5453; return s - Math.floor(s); };
      for (let i = 0; i < p.count; i++) {
        const px = +p.getX(i).toFixed(3), py = +p.getY(i).toFixed(3), pz = +p.getZ(i).toFixed(3);
        const up = (py + h / 2) / h; // 0 unten … 1 Spitze
        const k = 1 + (n(px, py, pz) - 0.5) * 0.55 * (1 - up * 0.6);
        p.setXYZ(i, px * k, py + (n(pz, px, py) - 0.5) * h * 0.06 * (1 - up), pz * k);
      }
      g.rotateY(rot); g.translate(x, h / 2 - 2, z);
      return g;
    });
    const merged = new THREE.BufferGeometry();
    const pos = geos.flatMap((g) => Array.from(g.attributes.position.array as Float32Array));
    merged.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    merged.computeVertexNormals();
    return merged;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#1a1f33" roughness={0.75} metalness={0.1} flatShading envMapIntensity={0.6} />
    </mesh>
  );
}

function Ground() {
  const grid = useMemo(() => { const t = makeGrid(); t.repeat.set(80, 80); return t; }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[480, 480]} />
        <meshStandardMaterial color="#030407" roughness={0.75} metalness={0.3} emissive="#4f6bff" emissiveMap={grid} emissiveIntensity={0.14} envMapIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Box({ args, position, mat }: { args: [number, number, number]; position: [number, number, number]; mat: THREE.Material }) {
  return <mesh position={position} material={mat}><boxGeometry args={args} /></mesh>;
}

function Screen({ kind, position, rot, w = 2.1 }: { kind: ScreenKind; position: [number, number, number]; rot: number; w?: number }) {
  const tex = useMemo(() => makeScreen(kind), [kind]);
  const ref = useRef<THREE.Group>(null);
  const seed = position[0] * 1.7 + position[2];
  useFrame((s) => { if (ref.current) ref.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 0.6 + seed) * 0.05; });
  const h = w * 0.625;
  return (
    <group ref={ref} position={position} rotation-y={rot}>
      <mesh position-z={-0.02}><planeGeometry args={[w + 0.06, h + 0.06]} /><meshBasicMaterial color="#1b2040" /></mesh>
      <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} toneMapped={false} color="#c9cfe6" /></mesh>
    </group>
  );
}

function Sculpture() {
  const geo = useMemo(makeVGeometry, []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s, dt) => { if (ref.current) { ref.current.rotation.y += dt * 0.35; ref.current.position.y = 3.85 + Math.sin(s.clock.elapsedTime * 0.8) * 0.06; } });
  return (
    <group position={[2.4, 0, -2.4]}>
      <mesh position-y={FLOOR + 0.3}><cylinderGeometry args={[0.9, 0.95, 0.6, 48]} /><meshStandardMaterial color="#0d0f16" roughness={0.3} metalness={0.6} /></mesh>
      <mesh position-y={FLOOR + 0.605} rotation-x={-Math.PI / 2}><ringGeometry args={[0.7, 0.86, 64]} /><meshBasicMaterial color="#33e1ff" toneMapped={false} /></mesh>
      <mesh ref={ref} geometry={geo} scale={0.62} position-y={3.85}>
        <meshPhysicalMaterial color="#05060f" metalness={0.55} roughness={0.14} clearcoat={1} clearcoatRoughness={0.06} iridescence={0.55} iridescenceIOR={1.35} envMapIntensity={2.2} />
      </mesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, speed } = useMemo(() => {
    const p = new Float32Array(count * 3), sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50; p[i * 3 + 1] = Math.random() * 14; p[i * 3 + 2] = -20 + Math.random() * 46;
      sp[i] = 0.08 + Math.random() * 0.25;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return { geo: g, speed: sp };
  }, [count]);
  useFrame((_, dt) => {
    const a = geo.attributes.position as THREE.BufferAttribute, arr = a.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] -= speed[i] * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + i) * dt * 0.05;
      if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 14;
    }
    a.needsUpdate = true;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.045} color="#b8c4ff" transparent opacity={0.6} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

export function Studio({ mobile }: { mobile: boolean }) {
  const m = useMemo(() => {
    const stone = makeStone();
    const stoneMat = (rx: number, ry: number) => { const t = stone.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.92, metalness: 0.05, color: "#9aa0b5" }); };
    return {
      plinth: stoneMat(3, 1),
      wall: stoneMat(1.2, 1.6),
      wallSide: stoneMat(3, 1.6),
      slab: new THREE.MeshStandardMaterial({ color: "#0b0d13", roughness: 0.45, metalness: 0.4 }),
      fascia: new THREE.MeshStandardMaterial({ color: "#1d212c", roughness: 0.3, metalness: 0.75 }),
      soffit: new THREE.MeshStandardMaterial({ color: "#121318", roughness: 0.55, metalness: 0.2 }),
      plaster: new THREE.MeshStandardMaterial({ color: "#14161d", roughness: 0.8, metalness: 0.05 }),
      floor: new THREE.MeshStandardMaterial({ color: "#0b0c11", roughness: 0.55, metalness: 0.2, envMapIntensity: 0.45 }),
      mullion: new THREE.MeshStandardMaterial({ color: "#040508", roughness: 0.35, metalness: 0.8 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#d8deff", roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.1, envMapIntensity: 1.8, side: THREE.DoubleSide, depthWrite: false }),
      slot: new THREE.MeshBasicMaterial({ color: new THREE.Color("#33e1ff").multiplyScalar(2.2), toneMapped: false }),
      blue: new THREE.MeshBasicMaterial({ color: new THREE.Color("#4f6bff").multiplyScalar(2), toneMapped: false }),
      lamp: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffe0b0").multiplyScalar(2.5), toneMapped: false }),
    };
  }, []);

  const W = RIGHT - LEFT, D = FRONT - BACK, H = CEIL - FLOOR, cx = (LEFT + RIGHT) / 2, cz = (FRONT + BACK) / 2;
  const glassL = -3.2; // links davon massive Steinwand in der Front
  const mullions = useMemo(() => { const n = 6, out: number[] = []; for (let i = 0; i <= n; i++) out.push(glassL + ((RIGHT - glassL) * i) / n); return out; }, []);

  return (
    <group>
      <Sky />
      <hemisphereLight args={["#2c3766", "#030407", 0.45]} />
      <directionalLight position={[-20, 25, 18]} intensity={1.1} color="#b8c4ff" />
      <directionalLight position={[12, 18, -40]} intensity={2.6} color="#4f6bff" />
      <pointLight position={[0.6, CEIL - 0.6, -0.8]} intensity={34} distance={14} decay={2} color="#ffc590" />
      <pointLight position={[-3.2, CEIL - 0.7, 1.6]} intensity={14} distance={9} decay={2} color="#ffd2a0" />
      <pointLight position={[LEFT + 0.9, 3.0, -0.6]} intensity={10} distance={8} decay={2} color="#33e1ff" />
      <pointLight position={[3.4, 4.6, -3.6]} intensity={5} distance={7} decay={2} color="#4f6bff" />

      <Peaks />
      <Ground />

      {/* Sockel + untere Terrasse */}
      <Box args={[9.5, FLOOR - 0.15, 7.4]} position={[-0.6, (FLOOR - 0.15) / 2, -0.8]} mat={m.plinth} />
      <Box args={[6, 0.25, 2.6]} position={[-2.4, 1.0, 4.2]} mat={m.slab} />
      {/* Bodenplatte & Dach mit Auskragung */}
      <Box args={[W + 0.6, 0.3, D + 1.2]} position={[cx, FLOOR - 0.15, cz + 0.6]} mat={m.slab} />
      <Box args={[W + 2.2, 0.5, D + 2.6]} position={[cx + 0.3, CEIL + 0.25, cz + 1.0]} mat={m.fascia} />
      <mesh position={[cx + 0.3, CEIL - 0.005, cz + 1.0]} rotation-x={Math.PI / 2} material={m.soffit}><planeGeometry args={[W + 2.2, D + 2.6]} /></mesh>
      {/* Lichtkante unter der Dachkante (Markenblau) */}
      <Box args={[W + 2.2, 0.035, 0.035]} position={[cx + 0.3, CEIL - 0.02, FRONT + 2.29]} mat={m.blue} />
      {/* Downlights in der Auskragung */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[LEFT + 0.6 + i * 1.5, CEIL - 0.012, FRONT + 1.1]} rotation-x={Math.PI / 2} material={m.lamp}><circleGeometry args={[0.07, 16]} /></mesh>
      ))}

      {/* Steinwand links: Front-Pfeiler + Seitenwand */}
      <Box args={[glassL - LEFT, H, 0.5]} position={[(LEFT + glassL) / 2, FLOOR + H / 2, FRONT]} mat={m.wall} />
      <Box args={[0.5, H, D]} position={[LEFT, FLOOR + H / 2, cz]} mat={m.wallSide} />
      {/* Rückwand mit großem Panoramafenster */}
      <Box args={[1.6 - LEFT, H, 0.3]} position={[(LEFT + -1.6) / 2 + 0.05, FLOOR + H / 2, BACK]} mat={m.plaster} />
      <Box args={[RIGHT - 5.8, H, 0.3]} position={[(5.8 + RIGHT) / 2, FLOOR + H / 2, BACK]} mat={m.plaster} />
      <Box args={[7.4, 0.5, 0.3]} position={[2.1, FLOOR + 0.25, BACK]} mat={m.plaster} />
      <Box args={[7.4, 0.35, 0.3]} position={[2.1, CEIL - 0.175, BACK]} mat={m.plaster} />
      <mesh position={[2.1, (FLOOR + 0.5 + CEIL - 0.35) / 2, BACK - 0.05]} material={m.glass}><planeGeometry args={[7.4, CEIL - 0.35 - FLOOR - 0.5]} /></mesh>
      {/* Innenboden */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, FLOOR + 0.005, cz]} material={m.floor}><planeGeometry args={[W, D]} /></mesh>

      {/* Glasfront + Pfosten */}
      <mesh position={[(glassL + RIGHT) / 2, FLOOR + H / 2, FRONT]} material={m.glass}><planeGeometry args={[RIGHT - glassL, H]} /></mesh>
      {mullions.map((x, i) => <Box key={i} args={[0.07, H, 0.12]} position={[x, FLOOR + H / 2, FRONT]} mat={m.mullion} />)}
      {/* Glas-Seite rechts */}
      <mesh position={[RIGHT, FLOOR + H / 2, cz]} rotation-y={Math.PI / 2} material={m.glass}><planeGeometry args={[D, H]} /></mesh>
      <Box args={[0.08, H, 0.08]} position={[RIGHT, FLOOR + H / 2, BACK]} mat={m.mullion} />

      {/* Innenraum: Lichtschlitz (statt Kamin), Skulptur, Arbeiten */}
      <Box args={[0.45, 1.0, 6.4]} position={[LEFT + 0.45, FLOOR + 0.5, -0.9]} mat={m.plaster} />
      <Box args={[0.04, 0.07, 5.9]} position={[LEFT + 0.69, FLOOR + 0.62, -0.9]} mat={m.slot} />
      <Sculpture />
      <Screen kind="web" position={[-4.6, 4.05, -2.6]} rot={1.15} w={1.9} />
      <Screen kind="ui" position={[4.9, 4.2, -3.6]} rot={-0.35} w={2.2} />
      <Screen kind="brand" position={[5.9, 3.75, -0.9]} rot={-1.05} />
      <Screen kind="3d" position={[5.9, 4.0, 1.9]} rot={-1.25} w={1.7} />

      <Dust count={mobile ? 350 : 900} />
    </group>
  );
}
