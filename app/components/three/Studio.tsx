"use client";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeVGeometry } from "./env";
import { flight } from "./flight";
import { makeMarble, makeScreen, makeSign, makeStone, makeTiles, makeWood, type ScreenKind } from "./textures";

/*
 * VONUMO-Studio bei Nacht (Zielbild: Mockups des Inhabers, Nov. 2026): nasser, spiegelnder Vorplatz,
 * warme Holz-Untersicht mit Downlights, Neonkanten in Blau/Violett, Innenraum mit Möbeln,
 * Pflanzen, Bildschirmen, Marmorwand und leuchtender V-Skulptur. Gipfel mit Schnee, Sterne, Nadelbäume.
 * Koordinaten in Metern. Glasfront nach +z.
 */
const FLOOR = 2.125, CEIL = 5.625, FRONT = 3.4, BACK = -4.7, LEFT = -5.6, RIGHT = 6.8;
/** Gebäude wird um SINK abgesenkt (niedriger Sockel wie im Zielbild); Kameras in FlightScene sind darauf abgestimmt. */
export const SINK = 1.4;
const glow = (hex: string, k: number) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

function Sky() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 top = vec3(0.004,0.006,0.02), hor = vec3(0.05,0.07,0.2);
        vec3 col = mix(hor, top, smoothstep(-0.02, 0.5, h));
        col += vec3(0.12,0.16,0.5) * exp(-abs(h-0.03)*18.0) * 0.5;
        gl_FragColor = vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), []);
  return <mesh material={mat} frustumCulled={false}><sphereGeometry args={[300, 32, 16]} /></mesh>;
}

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3), c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2, y = 0.08 + Math.pow(Math.random(), 0.7) * 0.92, rr = Math.sqrt(1 - y * y);
      p.set([Math.cos(th) * rr * 280, y * 280, Math.sin(th) * rr * 280], i * 3);
      const b = 0.4 + Math.random() * 0.9; c.set([b * 0.85, b * 0.9, b * 1.1], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return g;
  }, [count]);
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={1.1} sizeAttenuation={false} vertexColors fog={false} transparent opacity={0.9} toneMapped={false} /></points>;
}

function Peaks() {
  const geo = useMemo(() => {
    const list: [number, number, number, number, number][] = [
      [10, -95, 30, 62, 0.4], [-34, -110, 34, 48, 1.1], [42, -120, 36, 44, 2.0], [-70, -90, 30, 38, 0.2],
      [74, -88, 26, 34, 0.9], [-8, -140, 40, 40, 1.7], [-110, -130, 40, 52, 0.6], [110, -140, 44, 50, 2.6],
      [-150, -60, 34, 30, 1.3], [150, -70, 30, 28, 0.1], [-48, -75, 18, 26, 0.7], [30, -80, 16, 22, 1.9],
    ];
    const pos: number[] = [], col: number[] = [];
    const rock = new THREE.Color("#1a2238"), snow = new THREE.Color("#d4ddff");
    for (const [x, z, r, h, rot] of list) {
      const g = new THREE.ConeGeometry(r, h, 13, 9).toNonIndexed();
      const p = g.attributes.position;
      const n = (a: number, b: number, c: number) => { const s = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719 + x) * 43758.5453; return s - Math.floor(s); };
      for (let i = 0; i < p.count; i++) {
        const px = +p.getX(i).toFixed(3), py = +p.getY(i).toFixed(3), pz = +p.getZ(i).toFixed(3);
        const up = (py + h / 2) / h;
        const k = 1 + (n(px, py, pz) - 0.5) * 0.6 * (1 - up * 0.5);
        p.setXYZ(i, px * k, py + (n(pz, px, py) - 0.5) * h * 0.07 * (1 - up), pz * k);
      }
      g.rotateY(rot); g.translate(x, h / 2 - 2, z);
      const pa = g.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        const up = (pa.getY(i) + 2) / h;
        const s = THREE.MathUtils.smoothstep(up + (n(pa.getX(i), 1, pa.getZ(i)) - 0.5) * 0.25, 0.55, 0.8);
        const cc = rock.clone().lerp(snow, s);
        col.push(cc.r, cc.g, cc.b);
        pos.push(pa.getX(i), pa.getY(i), pa.getZ(i));
      }
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    m.computeVertexNormals();
    return m;
  }, []);
  return <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={0.8} metalness={0.05} flatShading envMapIntensity={0.5} /></mesh>;
}

function Trees() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => {
    const out: [number, number, number][] = [];
    const r = (s: number) => { const v = Math.sin(s * 91.7) * 43758.5453; return v - Math.floor(v); };
    for (let i = 0; i < 46; i++) {
      const side = i % 2 ? 1 : -1;
      out.push([side * (13 + r(i) * 26), -4 - r(i + 50) * 34, 0.7 + r(i + 99) * 0.9]);
    }
    return out;
  }, []);
  const geo = useMemo(() => {
    const parts = [0, 1, 2].map((k) => { const g = new THREE.ConeGeometry(1.6 - k * 0.4, 3.2 - k * 0.5, 7); g.translate(0, 2 + k * 1.6, 0); return g.toNonIndexed(); });
    const trunk = new THREE.CylinderGeometry(0.12, 0.16, 1.4, 6).toNonIndexed(); trunk.translate(0, 0.7, 0);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...parts, trunk].flatMap((x) => Array.from(x.attributes.position.array as Float32Array)), 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D();
    spots.forEach(([x, z, s], i) => { o.position.set(x, 0, z); o.scale.setScalar(s); o.rotation.y = i; o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [spots]);
  return <instancedMesh ref={ref} args={[geo, undefined, spots.length]} frustumCulled={false}><meshStandardMaterial color="#0a1410" roughness={0.9} flatShading /></instancedMesh>;
}

/** Spiegelnder, nasser Vorplatz – Spiegelung nur auf Desktop und nur, solange der Hero sichtbar ist. */
function Plaza({ mobile }: { mobile: boolean }) {
  const tiles = useMemo(() => { const t = makeTiles(); t.repeat.set(14, 14); return t; }, []);
  const [on, setOn] = useState(true);
  useFrame(() => { if (flight.visible !== on) setOn(flight.visible); });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[150, 150]} />
        {mobile || !on ? (
          <meshStandardMaterial color="#05060b" roughness={0.6} metalness={0.15} roughnessMap={tiles} envMapIntensity={0.15} />
        ) : (
          <MeshReflectorMaterial resolution={1024} mirror={0.6} mixBlur={0.6} mixStrength={1.7} mixContrast={1.15} blur={[160, 40]} depthScale={0} 
            roughnessMap={tiles} roughness={0.4} metalness={0.5} color="#080910" envMapIntensity={0.35} />
        )}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}><planeGeometry args={[600, 600]} /><meshStandardMaterial color="#030407" roughness={0.9} /></mesh>
    </group>
  );
}

function Box({ args, position, mat, rotation }: { args: [number, number, number]; position: [number, number, number]; mat: THREE.Material; rotation?: [number, number, number] }) {
  return <mesh position={position} rotation={rotation} material={mat}><boxGeometry args={args} /></mesh>;
}

function Screen({ kind, position, rot, w = 2.1 }: { kind: ScreenKind; position: [number, number, number]; rot: number; w?: number }) {
  const tex = useMemo(() => makeScreen(kind), [kind]);
  const tint = useMemo(() => new THREE.Color(1.25, 1.25, 1.35), []);
  const h = w * 0.625;
  return (
    <group position={position} rotation-y={rot}>
      <mesh position-z={-0.03}><boxGeometry args={[w + 0.08, h + 0.08, 0.04]} /><meshStandardMaterial color="#05060a" metalness={0.8} roughness={0.3} /></mesh>
      <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} toneMapped={false} color={tint} /></mesh>
    </group>
  );
}

function Plant({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  const leaves = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2 + i * 0.3, tilt: 0.35 + (i % 4) * 0.18, len: 0.9 + (i % 3) * 0.35 })), []);
  return (
    <group position={position} scale={s}>
      <mesh position-y={0.35}><cylinderGeometry args={[0.32, 0.26, 0.7, 24]} /><meshStandardMaterial color="#d8d6d0" roughness={0.6} /></mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={[0, 0.75, 0]} rotation={[l.tilt, l.a, 0]}>
          <coneGeometry args={[0.16, l.len * 1.4, 4, 1]} />
          <meshStandardMaterial color={i % 2 ? "#1f4a2c" : "#2b5e36"} roughness={0.6} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Furniture() {
  const mats = useMemo(() => ({
    dark: new THREE.MeshStandardMaterial({ color: "#121318", roughness: 0.45, metalness: 0.5 }),
    fabric: new THREE.MeshStandardMaterial({ color: "#b9bcc6", roughness: 0.9 }),
    desk: new THREE.MeshStandardMaterial({ color: "#1b1d24", roughness: 0.3, metalness: 0.4 }),
  }), []);
  const chair = (x: number, z: number, r: number) => (
    <group key={`${x}${z}`} position={[x, FLOOR, z]} rotation-y={r}>
      <Box args={[0.55, 0.08, 0.55]} position={[0, 0.48, 0]} mat={mats.dark} />
      <Box args={[0.55, 0.6, 0.07]} position={[0, 0.82, -0.26]} mat={mats.dark} />
      <mesh position-y={0.24}><cylinderGeometry args={[0.03, 0.03, 0.46]} /><meshStandardMaterial color="#333" metalness={0.9} roughness={0.3} /></mesh>
    </group>
  );
  return (
    <group>
      <Box args={[3.6, 0.07, 1.0]} position={[-2.0, FLOOR + 0.75, -2.2]} mat={mats.desk} />
      <Box args={[0.06, 0.72, 0.9]} position={[-3.7, FLOOR + 0.37, -2.2]} mat={mats.desk} />
      <Box args={[0.06, 0.72, 0.9]} position={[-0.3, FLOOR + 0.37, -2.2]} mat={mats.desk} />
      <Screen kind="ui" position={[-2.8, FLOOR + 1.12, -2.45]} rot={0.05} w={0.95} />
      <Screen kind="code" position={[-1.6, FLOOR + 1.12, -2.45]} rot={-0.05} w={0.95} />
      {chair(-2.8, -1.35, Math.PI)}{chair(-1.6, -1.35, Math.PI + 0.2)}
      <RoundedBox args={[2.6, 0.45, 0.95]} radius={0.12} smoothness={4} position={[3.6, FLOOR + 0.28, 1.6]} material={mats.fabric} />
      <RoundedBox args={[2.6, 0.55, 0.25]} radius={0.1} smoothness={4} position={[3.6, FLOOR + 0.62, 2.0]} material={mats.fabric} />
      <mesh position={[3.6, FLOOR + 0.22, 0.6]}><cylinderGeometry args={[0.45, 0.45, 0.06, 32]} /><meshStandardMaterial color="#0d0e12" metalness={0.7} roughness={0.2} /></mesh>
      <Plant position={[-4.85, FLOOR, 2.6]} s={1.2} />
      <Plant position={[6.1, FLOOR, -3.9]} s={1.3} />
      <Plant position={[6.15, FLOOR, 2.7]} s={1.0} />
      <Plant position={[0.2, FLOOR, -4.0]} s={0.9} />
    </group>
  );
}

function Sculpture() {
  const geo = useMemo(makeVGeometry, []);
  const ref = useRef<THREE.Group>(null);
  // zeigt zur Kamera im Kapitel „Erlebnis“ und pendelt nur leicht (nie hochkant)
  useFrame((s) => { if (ref.current) { const t = s.clock.elapsedTime; ref.current.rotation.y = -0.62 + Math.sin(t * 0.35) * 0.3; ref.current.position.y = 4.05 + Math.sin(t * 0.8) * 0.06; } });
  const m = useMemo(() => ({
    rim: new THREE.MeshBasicMaterial({ color: new THREE.Color("#7b6bff").multiplyScalar(2.4), side: THREE.BackSide, toneMapped: false }),
    ring: glow("#4f8bff", 3), ring2: glow("#7b6bff", 2),
  }), []);
  return (
    <group position={[2.4, 0, -2.6]}>
      <mesh position-y={FLOOR + 0.3}><cylinderGeometry args={[1.05, 1.1, 0.6, 64]} /><meshStandardMaterial color="#0b0c12" roughness={0.2} metalness={0.8} /></mesh>
      <mesh position-y={FLOOR + 0.605} rotation-x={-Math.PI / 2} material={m.ring}><ringGeometry args={[0.8, 0.98, 96]} /></mesh>
      <mesh position-y={FLOOR + 0.02} rotation-x={-Math.PI / 2} material={m.ring2}><ringGeometry args={[1.12, 1.16, 96]} /></mesh>
      <group ref={ref} position-y={4.05}>
        <mesh geometry={geo} scale={0.72}>
          <meshPhysicalMaterial color="#04050c" metalness={0.6} roughness={0.12} clearcoat={1} clearcoatRoughness={0.05} iridescence={0.5} iridescenceIOR={1.3} envMapIntensity={2.4} />
        </mesh>
        <mesh geometry={geo} scale={0.735} material={m.rim} />
      </group>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const { geo, speed } = useMemo(() => {
    const p = new Float32Array(count * 3), sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50; p[i * 3 + 1] = Math.random() * 14; p[i * 3 + 2] = -20 + Math.random() * 46;
      sp[i] = 0.06 + Math.random() * 0.18;
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return { geo: g, speed: sp };
  }, [count]);
  useFrame((_, dt) => {
    const a = geo.attributes.position as THREE.BufferAttribute, arr = a.array as Float32Array;
    for (let i = 0; i < count; i++) { arr[i * 3 + 1] -= speed[i] * dt; if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 14; }
    a.needsUpdate = true;
  });
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={0.035} color="#c8d2ff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

export function Studio({ mobile }: { mobile: boolean }) {
  const m = useMemo(() => {
    const stone = makeStone(); stone.repeat.set(3, 1);
    const wood = makeWood(); wood.repeat.set(1, 6);
    const woodV = makeWood(true); woodV.repeat.set(3, 1);
    return {
      plinth: new THREE.MeshStandardMaterial({ map: stone, roughness: 0.85, metalness: 0.1, color: "#7d8296" }),
      charcoal: new THREE.MeshStandardMaterial({ color: "#0c0d12", roughness: 0.5, metalness: 0.35 }),
      slab: new THREE.MeshStandardMaterial({ color: "#0b0c11", roughness: 0.35, metalness: 0.55 }),
      fascia: new THREE.MeshStandardMaterial({ color: "#20232c", roughness: 0.25, metalness: 0.85 }),
      soffit: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55, metalness: 0.05, emissive: new THREE.Color("#ff9a55"), emissiveMap: wood, emissiveIntensity: 0.22 }),
      woodWall: new THREE.MeshStandardMaterial({ map: woodV, roughness: 0.6, emissive: new THREE.Color("#ff9a55"), emissiveMap: woodV, emissiveIntensity: 0.15 }),
      marble: new THREE.MeshStandardMaterial({ map: makeMarble(), roughness: 0.25, metalness: 0.05, color: "#9aa0b4" }),
      floor: new THREE.MeshStandardMaterial({ color: "#0d0e13", roughness: 0.3, metalness: 0.5, envMapIntensity: 0.8 }),
      mullion: new THREE.MeshStandardMaterial({ color: "#030305", roughness: 0.3, metalness: 0.85 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#dfe5ff", roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.08, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false }),
      blue: glow("#4f7bff", 2.6), violet: glow("#8b6bff", 2.4), warm: glow("#ffd8a8", 2.2), white: glow("#eef2ff", 1.7),
      sign: new THREE.MeshBasicMaterial({ map: makeSign("VONUMO"), transparent: true, toneMapped: false, color: new THREE.Color(2.4, 2.5, 2.8), depthWrite: false }),
    };
  }, []);

  const W = RIGHT - LEFT, D = FRONT - BACK, H = CEIL - FLOOR, cx = (LEFT + RIGHT) / 2, cz = (FRONT + BACK) / 2;
  const glassL = -3.2;
  const mullions = useMemo(() => { const n = 6, out: number[] = []; for (let i = 0; i <= n; i++) out.push(glassL + ((RIGHT - glassL) * i) / n); return out; }, []);

  return (
    <group>
      <Sky />
      <Stars count={mobile ? 700 : 1600} />
      <hemisphereLight args={["#24305e", "#020306", 0.4]} />
      <directionalLight position={[-30, 40, 30]} intensity={2.2} color="#b8c4ff" />
      <directionalLight position={[12, 18, -40]} intensity={2.2} color="#5a6bff" />
      <group position-y={-SINK}>
      <pointLight position={[-1, CEIL - 0.3, FRONT + 1.2]} intensity={16} distance={9} decay={2} color="#ffb27a" />
      <pointLight position={[4, CEIL - 0.3, FRONT + 1.2]} intensity={16} distance={9} decay={2} color="#ffb27a" />
      <pointLight position={[0.6, CEIL - 0.6, -0.8]} intensity={46} distance={15} decay={2} color="#ffc590" />
      <pointLight position={[-3.2, CEIL - 0.6, -1.2]} intensity={22} distance={9} decay={2} color="#ffd2a0" />
      <pointLight position={[2.4, 3.6, -1.4]} intensity={7} distance={6} decay={2} color="#6f7bff" />


      {/* Sockel mit Stufe und Neonfugen */}
      <Box args={[13.6, FLOOR - 0.15, 8.6]} position={[cx + 0.1, (FLOOR - 0.15) / 2, cz + 0.2]} mat={m.plinth} />
      <Box args={[12, 0.3, 1.1]} position={[cx + 0.4, SINK + 0.15, FRONT + 1.45]} mat={m.charcoal} />
      <Box args={[12, 0.03, 0.03]} position={[cx + 0.4, SINK + 0.31, FRONT + 2.0]} mat={m.violet} />
      <Box args={[13.6, 0.035, 0.035]} position={[cx + 0.1, FLOOR - 0.16, FRONT + 0.65]} mat={m.blue} />
      {/* Bodenplatte & Dach */}
      <Box args={[W + 0.6, 0.3, D + 1.2]} position={[cx, FLOOR - 0.15, cz + 0.6]} mat={m.slab} />
      <Box args={[W + 2.2, 0.42, D + 2.6]} position={[cx + 0.3, CEIL + 0.21, cz + 1.0]} mat={m.fascia} />
      <mesh position={[cx + 0.3, CEIL - 0.005, cz + 1.0]} rotation-x={Math.PI / 2} material={m.soffit}><planeGeometry args={[W + 2.2, D + 2.6]} /></mesh>
      <Box args={[W + 2.2, 0.04, 0.04]} position={[cx + 0.3, CEIL + 0.43, FRONT + 2.29]} mat={m.white} />
      <Box args={[W + 2.2, 0.035, 0.035]} position={[cx + 0.3, CEIL - 0.02, FRONT + 2.29]} mat={m.blue} />
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[LEFT + 0.6 + i * 1.5, CEIL - 0.012, FRONT + 1.1]} rotation-x={Math.PI / 2} material={m.warm}><circleGeometry args={[0.075, 20]} /></mesh>
      ))}

      {/* Front links: dunkle Wand mit hinterleuchtetem Schriftzug; Seitenwand */}
      <Box args={[glassL - LEFT, H, 0.5]} position={[(LEFT + glassL) / 2, FLOOR + H / 2, FRONT]} mat={m.charcoal} />
      <mesh position={[(LEFT + glassL) / 2, FLOOR + H * 0.62, FRONT + 0.26]} material={m.sign}><planeGeometry args={[2.2, 0.55]} /></mesh>
      <Box args={[0.5, H, D]} position={[LEFT, FLOOR + H / 2, cz]} mat={m.charcoal} />
      {/* Rückwand: Marmor */}
      <Box args={[W, H, 0.3]} position={[cx, FLOOR + H / 2, BACK]} mat={m.marble} />
      {/* Innen: Holzlamellen links, Boden, Deckenvouten */}
      <mesh position={[LEFT + 0.26, FLOOR + H / 2, cz]} rotation-y={Math.PI / 2} material={m.woodWall}><planeGeometry args={[D, H]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[cx, FLOOR + 0.005, cz]} material={m.floor}><planeGeometry args={[W, D]} /></mesh>
      <Box args={[W - 0.6, 0.03, 0.03]} position={[cx, CEIL - 0.05, 1.2]} mat={m.violet} />
      <Box args={[W - 0.6, 0.03, 0.03]} position={[cx, CEIL - 0.05, -2.0]} mat={m.blue} />
      <Box args={[0.03, 0.03, D - 0.6]} position={[RIGHT - 0.3, FLOOR + 0.04, cz]} mat={m.violet} />

      {/* Glasfront + Pfosten, Glas rechts */}
      <mesh position={[(glassL + RIGHT) / 2, FLOOR + H / 2, FRONT]} material={m.glass}><planeGeometry args={[RIGHT - glassL, H]} /></mesh>
      {mullions.map((x, i) => <Box key={i} args={[0.07, H, 0.12]} position={[x, FLOOR + H / 2, FRONT]} mat={m.mullion} />)}
      <mesh position={[RIGHT, FLOOR + H / 2, cz]} rotation-y={Math.PI / 2} material={m.glass}><planeGeometry args={[D, H]} /></mesh>
      <Box args={[0.08, H, 0.08]} position={[RIGHT, FLOOR + H / 2, BACK]} mat={m.mullion} />

      {/* Wandbildschirme */}
      <Screen kind="brand" position={[5.2, 4.05, BACK + 0.2]} rot={0} w={2.0} />
      <Screen kind="3d" position={[RIGHT - 0.12, 4.0, -1.4]} rot={-Math.PI / 2} w={1.7} />
      <Furniture />
      <Sculpture />

      </group>
      <Peaks />
      <Trees />
      <Plaza mobile={mobile} />
      <Dust count={mobile ? 250 : 600} />
    </group>
  );
}
