"use client";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { makeFacetedV, makeVOutline } from "./env";
import { flight } from "./flight";
import { Model, preloadModels } from "./Models";
import { pbrSet, tex } from "./pbr";
import { makeMarble, makeScreen, makeSign, type ScreenKind } from "./textures";

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
        vec3 top = vec3(0.006,0.011,0.04), hor = vec3(0.05,0.1,0.3);
        vec3 col = mix(hor, top, smoothstep(-0.02, 0.5, h));
        col += vec3(0.08,0.14,0.42) * exp(-abs(h-0.08)*7.0) * 0.5;
        gl_FragColor = vec4(col,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), []);
  return <mesh material={mat} frustumCulled={false}><sphereGeometry args={[950, 48, 24]} /></mesh>;
}

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    const p = new Float32Array(count * 3), c = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2, y = 0.08 + Math.pow(Math.random(), 0.7) * 0.92, rr = Math.sqrt(1 - y * y);
      p.set([Math.cos(th) * rr * 900, y * 900, Math.sin(th) * rr * 900], i * 3); // hinter dem Gebirge (sonst Sterne vor den Gipfeln)
      const b = 0.25 + Math.pow(Math.random(), 3) * 1.1; c.set([b * 0.88, b * 0.93, b * 1.08], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return g;
  }, [count]);
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={1} sizeAttenuation={false} vertexColors fog={false} transparent opacity={0.9} toneMapped={false} /></points>;
}

/** Wertrauschen + „ridged“ fbm für Gebirgskämme (deterministisch). */
function hash2(x: number, y: number) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number) {
  let f = 0, amp = 0.5, fr = 1;
  for (let o = 0; o < 5; o++) { f += vnoise(x * fr, y * fr) * amp; amp *= 0.5; fr *= 2.07; }
  return f;
}
function ridged(x: number, y: number) {
  let f = 0, amp = 0.55, fr = 1, w = 1;
  for (let o = 0; o < 6; o++) {
    let n = 1 - Math.abs(vnoise(x * fr, y * fr) * 2 - 1);
    n = n * n * w; w = Math.min(1, n * 1.6);
    f += n * amp; amp *= 0.5; fr *= 2.03;
  }
  return f;
}

/**
 * Gebirge als echtes Höhenfeld (statt Kegeln): Kämme aus „ridged“ Rauschen, nach hinten höher.
 * Material: echte Fels- und Schneetexturen (Poly Haven) triplanar projiziert – Farbe UND Normalen –,
 * Schnee nach Höhe und Neigung (steile Flanken bleiben Fels).
 */
const TERRAIN_VERT_HEAD = `attribute float snow; varying float vSnow; varying vec3 vWP; varying vec3 vWN;`;
const TERRAIN_FRAG_HEAD = `
  uniform sampler2D tRock; uniform sampler2D tRockN; uniform sampler2D tSnow; uniform sampler2D tSnowN;
  varying float vSnow; varying vec3 vWP; varying vec3 vWN;
  vec3 triW(vec3 n){ vec3 w = pow(abs(n), vec3(4.)); return w / (w.x + w.y + w.z); }
  vec3 tri(sampler2D t, vec3 p, vec3 w){ return texture2D(t, p.zy).rgb * w.x + texture2D(t, p.xz).rgb * w.y + texture2D(t, p.xy).rgb * w.z; }
  vec3 triN(sampler2D t, vec3 p, vec3 w, vec3 n){
    vec3 nx = texture2D(t, p.zy).xyz * 2. - 1., ny = texture2D(t, p.xz).xyz * 2. - 1., nz = texture2D(t, p.xy).xyz * 2. - 1.;
    nx = vec3(nx.xy + n.zy, n.x); ny = vec3(ny.xy + n.xz, n.y); nz = vec3(nz.xy + n.xy, n.z);
    return normalize(nx.zyx * w.x + ny.xzy * w.y + nz.xyz * w.z);
  }`;
function terrainMaterial() {
  const m = new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, envMapIntensity: 0.5 });
  const u = { tRock: { value: tex("rock_diff", { srgb: true }) }, tRockN: { value: tex("rock_nor") }, tSnow: { value: tex("snow_diff", { srgb: true }) }, tSnowN: { value: tex("snow_nor") } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\n${TERRAIN_VERT_HEAD}`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>\nvSnow = snow; vWP = (modelMatrix * vec4(transformed, 1.)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${TERRAIN_FRAG_HEAD}`)
      .replace("#include <map_fragment>", `
        vec3 tw = triW(normalize(vWN)); vec3 tp = vWP / 28.;
        vec3 rockC = tri(tRock, tp, tw) * vec3(0.36, 0.42, 0.6);     // Fels im Mondlicht: kühl, nicht braun
        vec3 snowC = tri(tSnow, tp * 0.6, tw) * vec3(0.9, 0.94, 1.04);
        diffuseColor.rgb = mix(rockC, snowC, vSnow);`)
      .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>\nroughnessFactor = mix(0.94, 0.62, vSnow);`)
      .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
        { vec3 wn0 = normalize(vWN); vec3 tw2 = triW(wn0); vec3 tp2 = vWP / 28.;
          vec3 wn = normalize(mix(triN(tRockN, tp2, tw2, wn0), triN(tSnowN, tp2 * 0.6, tw2, wn0), vSnow * 0.7));
          normal = normalize((viewMatrix * vec4(wn, 0.)).xyz); }`);
  };
  return m;
}

function Peaks({ mobile }: { mobile: boolean }) {
  const mat = useMemo(terrainMaterial, []);
  const geo = useMemo(() => {
    // Referenz: weit entfernte, zackige Alpenkette als Band hinter dem Pavillon (nicht ein naher Fels)
    const segX = mobile ? 360 : 760, segZ = mobile ? 50 : 110;
    const g = new THREE.PlaneGeometry(1900, 340, segX, segZ);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -560); // z ≈ −390 … −730: Band am Horizont, wie in der Referenz
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      const back = THREE.MathUtils.smoothstep(-z, 395, 480);        // vorne flach, hinten hoch
      const ridgeLine = 0.72 + 0.28 * Math.sin(x * 0.009 + 1.3);    // Kammverlauf variiert
      // große Massive (fbm) × Grate (ridged) → Alpenkette statt einzelner Felsnadeln
      const massif = THREE.MathUtils.clamp((fbm(x * 0.0042 + 7.3, z * 0.0042 + 2.1) - 0.2) / 0.45, 0, 1);
      const ridge = THREE.MathUtils.clamp(ridged(x * 0.013 + 3.1, z * 0.013 - 1.7) / 1.1, 0, 1);
      const h = Math.pow(massif, 1.15) * (0.5 + 0.5 * ridge);
      p.setY(i, -4 + h * 175 * back * ridgeLine);
    }
    g.computeVertexNormals();
    const n = g.attributes.normal, snow = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), ny = n.getY(i);
      snow[i] = THREE.MathUtils.smoothstep(y + (hash2(p.getX(i), p.getZ(i)) - 0.5) * 18, 34, 66) * THREE.MathUtils.smoothstep(ny, 0.22, 0.55);
    }
    g.setAttribute("snow", new THREE.BufferAttribute(snow, 1));
    return g;
  }, [mobile]);
  return <mesh geometry={geo} material={mat} receiveShadow={false} />;
}

/** Spot von der Decke senkrecht nach unten: echte Lichtinseln auf Podest und nassem Boden. */
function SpotDown({ position, intensity = 40, color = "#ffc590", angle = 0.75 }: { position: [number, number, number]; intensity?: number; color?: string; angle?: number }) {
  const light = useMemo(() => {
    const l = new THREE.SpotLight(color, intensity, 9, angle, 1, 2);
    l.position.set(...position);
    l.target.position.set(position[0], position[1] - 5, position[2] + 0.6);
    return l;
  }, [position, intensity, color, angle]);
  return <><primitive object={light} /><primitive object={light.target} /></>;
}

/** Dunkles, eingelassenes Paneel in der Marmorwand mit leuchtender V-Kontur (Referenz: Innenraum). */
function WallLogo({ position }: { position: [number, number, number] }) {
  const outline = useMemo(() => makeVOutline(0.075), []);
  return (
    <group position={position}>
      <mesh position-y={-0.2}><boxGeometry args={[1.25, 2.6, 0.06]} /><meshStandardMaterial color="#0a0b10" roughness={0.35} metalness={0.6} /></mesh>
      <mesh geometry={outline} position={[0, 0.25, 0.035]} scale={0.36}><meshBasicMaterial color={new THREE.Color("#eef2ff").multiplyScalar(2.2)} toneMapped={false} /></mesh>
    </group>
  );
}

/** Senkrechte Eichenlamellen mit warmem Licht dahinter (Referenz: linke Innenwand). */
function SlatWall({ x, z0, z1, y0, h, mat, mobile }: { x: number; z0: number; z1: number; y0: number; h: number; mat: THREE.Material; mobile: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const pitch = 0.11, n = Math.floor((z1 - z0) / pitch);
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { o.position.set(x, y0 + h / 2, z0 + pitch * (i + 0.5)); o.updateMatrix(); m.setMatrixAt(i, o.matrix); }
    m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere();
  }, [n, x, z0, y0, h]);
  return <instancedMesh ref={ref} args={[undefined, mat, n]} castShadow={!mobile} receiveShadow><boxGeometry args={[0.06, h, 0.05]} /></instancedMesh>;
}

/** Sichtbare Lichtkegel unter Leuchten (additiv, weich zum Rand und nach unten ausblendend). */
function LightCone({ position, color = "#ffcf9a", radius = 0.9, height = 2.4, strength = 0.12 }: { position: [number, number, number]; color?: string; radius?: number; height?: number; strength?: number }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false, fog: false,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    vertexShader: `varying float vY; varying vec3 vN; varying vec3 vV;
      void main(){ vY = uv.y; vec4 wp = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-wp.xyz); gl_Position = projectionMatrix * wp; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uStrength; varying float vY; varying vec3 vN; varying vec3 vV;
      void main(){ float edge = pow(abs(dot(vN, vV)), 1.6); float a = edge * vY * vY * uStrength; gl_FragColor = vec4(uColor * a, a); }`,
  }), [color, strength]);
  return <mesh position={position} material={mat}><coneGeometry args={[radius, height, 32, 1, true]} /></mesh>;
}

/** Spiegelnder, nasser Vorplatz – Spiegelung nur auf Desktop und nur, solange der Hero sichtbar ist. */
function Plaza({ mobile }: { mobile: boolean }) {
  // nasser, glatter Beton ohne Fugen (Referenz) – Poly-Haven-Normalen/Rauheit geben feine Unruhe in der Spiegelung
  const t = useMemo(() => pbrSet("floor", ["nor", "rough"], [45, 45]), []);
  const [on, setOn] = useState(true);
  useFrame(() => { if (flight.visible !== on) setOn(flight.visible); });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0} receiveShadow>
        <planeGeometry args={[150, 150]} />
        {mobile || !on ? (
          <meshStandardMaterial {...t} color="#0b0d14" roughness={0.42} metalness={0.5} normalScale={new THREE.Vector2(0.25, 0.25)} envMapIntensity={0.45} />
        ) : (
          <MeshReflectorMaterial resolution={1024} mirror={1} mixBlur={0.45} mixStrength={10} mixContrast={1.15} blur={[260, 70]} depthScale={0}
            normalMap={t.normalMap} normalScale={new THREE.Vector2(0.18, 0.18)} roughnessMap={t.roughnessMap} roughness={0.2} metalness={0.6} color="#10131c" envMapIntensity={0.3} />
        )}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}><planeGeometry args={[600, 600]} /><meshStandardMaterial color="#030407" roughness={0.9} /></mesh>
    </group>
  );
}

function Box({ args, position, mat, rotation }: { args: [number, number, number]; position: [number, number, number]; mat: THREE.Material; rotation?: [number, number, number] }) {
  return <mesh position={position} rotation={rotation} material={mat} castShadow receiveShadow><boxGeometry args={args} /></mesh>;
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

preloadModels(["sofa_02", "coffee_table_round_01", "mid_century_lounge_chair", "potted_plant_02"]);

/** Arbeitsplatz, Lounge und Pflanzen: echte Modelle (Poly Haven) + Nussbaum-Tisch mit Fase. */
function Furniture({ mobile }: { mobile: boolean }) {
  const desk = useMemo(() => new THREE.MeshStandardMaterial({ ...pbrSet("walnut", ["diff"], [2, 1]), color: "#6b5a4d", roughness: 0.38, metalness: 0 }), []);
  const leg = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14151a", roughness: 0.3, metalness: 0.9 }), []);
  return (
    <group>
      <RoundedBox args={[3.6, 0.06, 1.0]} radius={0.02} smoothness={3} position={[-2.0, FLOOR + 0.75, -2.2]} material={desk} castShadow receiveShadow />
      <Box args={[0.04, 0.72, 0.86]} position={[-3.65, FLOOR + 0.36, -2.2]} mat={leg} />
      <Box args={[0.04, 0.72, 0.86]} position={[-0.35, FLOOR + 0.36, -2.2]} mat={leg} />
      <Screen kind="ui" position={[-2.8, FLOOR + 1.12, -2.45]} rot={0.05} w={0.95} />
      <Screen kind="code" position={[-1.6, FLOOR + 1.12, -2.45]} rot={-0.05} w={0.95} />
      <Suspense fallback={null}>
        <Model name="mid_century_lounge_chair" position={[-2.8, FLOOR, -1.45]} rotation={Math.PI} envMapIntensity={0.6} />
        <Model name="mid_century_lounge_chair" position={[-1.5, FLOOR, -1.4]} rotation={Math.PI + 0.35} envMapIntensity={0.6} />
        <Model name="sofa_02" position={[3.6, FLOOR, 1.85]} rotation={Math.PI} scale={1.15} envMapIntensity={0.8} />
        <Model name="coffee_table_round_01" position={[3.6, FLOOR, 0.55]} scale={0.85} envMapIntensity={0.9} />
        <Model name="potted_plant_02" position={[-4.85, FLOOR, 2.6]} scale={1.7} rotation={0.6} />
        <Model name="potted_plant_02" position={[6.1, FLOOR, -3.9]} scale={1.9} rotation={2.1} />
        {!mobile && <Model name="potted_plant_02" position={[6.15, FLOOR, 2.7]} scale={1.5} rotation={4.0} />}
        {!mobile && <Model name="potted_plant_02" position={[0.2, FLOOR, -4.0]} scale={1.3} rotation={1.2} />}
      </Suspense>
    </group>
  );
}

/** V-Skulptur der Referenz: facettiert, schwarz glänzend mit blauen Glasfasen, schwebt über Sockel mit LED-Ring. */
function Sculpture() {
  const geo = useMemo(makeFacetedV, []);
  const ref = useRef<THREE.Group>(null);
  const top = FLOOR + 0.6, cy = top + 0.9;
  // leichtes Pendeln um die Ansicht aus Kapitel „Erlebnis“, minimales Schweben
  useFrame(() => { if (ref.current) { const t = flight.time; ref.current.rotation.y = -0.1 + Math.sin(t * 0.3) * 0.14; ref.current.position.y = cy + Math.sin(t * 0.7) * 0.03; } });
  const m = useMemo(() => [
    new THREE.MeshPhysicalMaterial({ color: "#020308", metalness: 0.7, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 2.2 }),
    new THREE.MeshPhysicalMaterial({ color: "#0b1660", metalness: 0.75, roughness: 0.08, clearcoat: 1, emissive: new THREE.Color("#1438ff"), emissiveIntensity: 0.16, envMapIntensity: 2.4 }),
  ], []);
  const ring = useMemo(() => glow("#38b8ff", 4.2), []);
  const ring2 = useMemo(() => glow("#2f6bff", 1.6), []);
  return (
    <group position={[2.4, 0, -2.6]}>
      <mesh position-y={FLOOR + 0.3} castShadow receiveShadow><cylinderGeometry args={[1.05, 1.08, 0.6, 96]} /><meshPhysicalMaterial color="#05060a" roughness={0.18} metalness={0.7} clearcoat={0.8} /></mesh>
      <mesh position-y={top + 0.004} rotation-x={-Math.PI / 2} material={ring}><ringGeometry args={[0.86, 0.99, 128]} /></mesh>
      <mesh position-y={top + 0.003} rotation-x={-Math.PI / 2}><circleGeometry args={[0.86, 96]} /><meshStandardMaterial color="#03040a" roughness={0.12} metalness={0.8} /></mesh>
      <mesh position-y={FLOOR + 0.02} rotation-x={-Math.PI / 2} material={ring2}><ringGeometry args={[1.1, 1.14, 128]} /></mesh>
      <pointLight position={[0, top + 0.25, 0]} intensity={5} distance={2} decay={2} color="#3d8bff" />
      <group ref={ref} position-y={cy}>
        <mesh geometry={geo} material={m} scale={0.7} castShadow />
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
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  useFrame(() => {
    const a = geo.attributes.position as THREE.BufferAttribute, arr = a.array as Float32Array, t = flight.time;
    for (let i = 0; i < count; i++) arr[i * 3 + 1] = (((base[i * 3 + 1] - speed[i] * t) % 14) + 14) % 14;
    a.needsUpdate = true;
  });
  return <points geometry={geo} frustumCulled={false}><pointsMaterial size={0.035} color="#c8d2ff" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

/** Weicher Verlauf: hell an der LED-Kante, nach vorne auslaufend (Lichtschein auf dem Boden). */
function spillTex() {
  const c = document.createElement("canvas"); c.width = 8; c.height = 128;
  const x = c.getContext("2d")!; const g = x.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.75, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0.9)");
  x.fillStyle = g; x.fillRect(0, 0, 8, 128);
  return new THREE.CanvasTexture(c);
}

export function Studio({ mobile }: { mobile: boolean }) {
  const m = useMemo(() => {
    // Holz: echtes Eichenfurnier (Farbe/Normalen/Rauheit), Sockel: Betonplatten – Poly Haven, CC0
    const oak = pbrSet("oak", ["diff", "nor", "rough"], [7, 5]);
    const oakV = pbrSet("oak", ["diff", "nor", "rough"], [0.05, 1.2], true);
    const slab = pbrSet("slab", ["diff", "nor"], [4, 1]);
    const floor = pbrSet("floor", ["nor", "rough"], [4, 3]);
    return {
      plinth: new THREE.MeshStandardMaterial({ ...slab, roughness: 0.7, metalness: 0.15, color: "#2a2d36" }),
      charcoal: new THREE.MeshStandardMaterial({ color: "#0c0d12", roughness: 0.5, metalness: 0.35 }),
      slab: new THREE.MeshStandardMaterial({ color: "#0b0c11", roughness: 0.35, metalness: 0.55 }),
      fascia: new THREE.MeshStandardMaterial({ color: "#20232c", roughness: 0.25, metalness: 0.85 }),
      soffit: new THREE.MeshStandardMaterial({ ...oak, color: "#d39a6a", roughness: 1, metalness: 0, emissive: new THREE.Color("#ff9a55"), emissiveMap: oak.map, emissiveIntensity: 0.16 }),
      // Licht hinter den Lamellen: warm leuchtende Rückwand
      woodWall: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb070").multiplyScalar(0.55) }),
      slat: new THREE.MeshStandardMaterial({ ...oakV, color: "#b98457", roughness: 0.8 }),
      marble: new THREE.MeshStandardMaterial({ map: makeMarble(), roughness: 0.38, metalness: 0.05, color: "#8a8f9e" }),
      floor: new THREE.MeshStandardMaterial({ ...floor, color: "#121318", roughness: 0.75, metalness: 0.25, envMapIntensity: 0.45 }),
      mullion: new THREE.MeshStandardMaterial({ color: "#030305", roughness: 0.3, metalness: 0.85 }),
      ceiling: new THREE.MeshStandardMaterial({ color: "#16171c", roughness: 0.7, metalness: 0.1, side: THREE.DoubleSide }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#dfe5ff", roughness: 0.02, metalness: 0, transparent: true, opacity: 0.05, envMapIntensity: 0.35, specularIntensity: 1, side: THREE.DoubleSide, depthWrite: false }),
      blue: glow("#3d7bff", 2.6), ledBlue: glow("#3d7bff", 4.5), warm: glow("#ffe2bd", 1.6), white: glow("#ffd6a0", 2.6),
      spill: new THREE.MeshBasicMaterial({ map: spillTex(), color: new THREE.Color("#2f6bff").multiplyScalar(0.9), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
      sign: new THREE.MeshBasicMaterial({ map: makeSign("VONUMO"), transparent: true, toneMapped: false, color: new THREE.Color(2.4, 2.5, 2.8), depthWrite: false }),
    };
  }, []);

  const W = RIGHT - LEFT, D = FRONT - BACK, H = CEIL - FLOOR, cx = (LEFT + RIGHT) / 2, cz = (FRONT + BACK) / 2;
  const glassL = -3.2;
  const mullions = useMemo(() => { const n = 6, out: number[] = []; for (let i = 0; i <= n; i++) out.push(glassL + ((RIGHT - glassL) * i) / n); return out; }, []);

  return (
    <group>
      <Sky />
      <Stars count={mobile ? 1800 : 4200} />
      <hemisphereLight args={["#24305e", "#020306", 0.25]} />
      <directionalLight position={[-30, 40, 30]} intensity={2.2} color="#b8c4ff" castShadow={!mobile} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.03} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} shadow-camera-near={10} shadow-camera-far={110} />
      {/* schwaches blaues Gegenlicht – stärker erzeugt einen Glanzfleck im nassen Boden */}
      <directionalLight position={[12, 18, -40]} intensity={0.45} color="#5a6bff" />
      <group position-y={-SINK}>
      <pointLight position={[0.6, FLOOR + 1.6, -0.8]} intensity={6} distance={9} decay={2} color="#ffd2a0" />
      {/* Blau wäscht den Marmor von rechts, links bleibt warm (Referenz) */}
      <pointLight position={[5.8, 3.4, -3.7]} intensity={13} distance={10} decay={2} color="#3f6bff" />
      {/* Innenraum gut lesbar durch das Glas (Referenz): weiche, kühle Grundhelligkeit auf Augenhöhe */}
      <pointLight position={[-1.0, CEIL - 0.6, 0.6]} intensity={7} distance={8} decay={2} color="#cfdcff" />
      <pointLight position={[4.6, CEIL - 0.6, 0.6]} intensity={7} distance={8} decay={2} color="#cfdcff" />
      <pointLight position={[-3.6, CEIL - 0.9, -1.6]} intensity={12} distance={7} decay={2} color="#ffd2a0" />



      {/* Sockel mit Stufe und Neonfugen */}
      <Box args={[13.6, FLOOR - 0.15, 8.6]} position={[cx + 0.1, (FLOOR - 0.15) / 2, cz + 0.2]} mat={m.plinth} />
      <Box args={[12, 0.3, 1.1]} position={[cx + 0.4, SINK + 0.15, FRONT + 1.45]} mat={m.charcoal} />
      {/* Blaues LED-Band am Fuß der unteren Stufe + Lichtschein auf dem nassen Boden (Referenz) */}
      <Box args={[12, 0.045, 0.03]} position={[cx + 0.4, SINK + 0.03, FRONT + 2.02]} mat={m.ledBlue} />
      <mesh position={[cx + 0.4, SINK + 0.006, FRONT + 2.75]} rotation-x={-Math.PI / 2} material={m.spill}><planeGeometry args={[13, 1.5]} /></mesh>
      <Box args={[13.6, 0.035, 0.035]} position={[cx + 0.1, FLOOR - 0.16, FRONT + 0.65]} mat={m.blue} />
      {/* Bodenplatte & Dach */}
      <Box args={[W + 0.6, 0.3, D + 1.2]} position={[cx, FLOOR - 0.15, cz + 0.6]} mat={m.slab} />
      <Box args={[W + 2.2, 0.42, D + 2.6]} position={[cx + 0.3, CEIL + 0.21, cz + 1.0]} mat={m.fascia} />
      <mesh position={[cx + 0.3, CEIL - 0.005, cz + 1.0]} rotation-x={Math.PI / 2} material={m.soffit}><planeGeometry args={[W + 2.2, D + 2.6]} /></mesh>
      {/* warmweiße LED-Linie an der Unterkante des Dachrands, rundum (Referenz) */}
      <Box args={[W + 2.2, 0.035, 0.035]} position={[cx + 0.3, CEIL - 0.02, FRONT + 2.29]} mat={m.white} />
      <Box args={[0.035, 0.035, D + 2.6]} position={[cx + 0.3 - (W + 2.2) / 2 + 0.02, CEIL - 0.02, cz + 1.0]} mat={m.white} />
      <Box args={[0.035, 0.035, D + 2.6]} position={[cx + 0.3 + (W + 2.2) / 2 - 0.02, CEIL - 0.02, cz + 1.0]} mat={m.white} />
      {/* Innendecke dunkel mit Downlights (Referenz), Holz nur am Vordach */}
      <mesh position={[cx, CEIL - 0.03, cz]} rotation-x={Math.PI / 2} material={m.ceiling}><planeGeometry args={[W - 0.5, D - 0.3]} /></mesh>
      {[-3.6, -1.2, 1.2, 3.6, 5.6].flatMap((x) => [-3.2, -0.6, 1.8].map((z) => (
        <mesh key={`dl${x}${z}`} position={[x, CEIL - 0.04, z]} rotation-x={Math.PI / 2} material={m.warm}><circleGeometry args={[0.05, 16]} /></mesh>
      )))}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[LEFT + 0.6 + i * 1.5, CEIL - 0.012, FRONT + 1.1]} rotation-x={Math.PI / 2} material={m.warm}><circleGeometry args={[0.075, 20]} /></mesh>
      ))}

      {/* Front links: dunkle Wand mit hinterleuchtetem Schriftzug; Seitenwand */}
      <Box args={[glassL - LEFT, H, 0.5]} position={[(LEFT + glassL) / 2, FLOOR + H / 2, FRONT]} mat={m.charcoal} />
      <mesh position={[(LEFT + glassL) / 2, FLOOR + H * 0.62, FRONT + 0.26]} material={m.sign}><planeGeometry args={[2.2, 0.55]} /></mesh>
      <Box args={[0.5, H, D]} position={[LEFT, FLOOR + H / 2, cz]} mat={m.charcoal} />
      {/* Rückwand: Marmor */}
      <Box args={[W, H, 0.3]} position={[cx, FLOOR + H / 2, BACK]} mat={m.marble} />
      <WallLogo position={[0.4, FLOOR + 1.5, BACK + 0.18]} />
      {(mobile ? [3, 6] : [1, 3, 5, 7]).map((i) => {
        const x = LEFT + 0.6 + i * 1.5;
        return (
          <group key={`spot${i}`}>
            <SpotDown position={[x, CEIL - 0.06, FRONT + 1.1]} intensity={mobile ? 30 : 38} />
            <LightCone position={[x, CEIL - 1.35, FRONT + 1.1]} height={2.6} radius={0.85} strength={mobile ? 0.04 : 0.05} />
          </group>
        );
      })}
      {/* Innen: Holzlamellen links, Boden, Deckenvouten */}
      <mesh position={[LEFT + 0.26, FLOOR + H / 2, cz]} rotation-y={Math.PI / 2} material={m.woodWall}><planeGeometry args={[D, H]} /></mesh>
      <SlatWall x={LEFT + 0.36} z0={BACK + 0.2} z1={FRONT - 0.3} y0={FLOOR} h={H - 0.08} mat={m.slat} mobile={mobile} />
      <mesh rotation-x={-Math.PI / 2} position={[cx, FLOOR + 0.005, cz]} material={m.floor} receiveShadow><planeGeometry args={[W, D]} /></mesh>
      {/* warme Vouten-Linien an Rück- und Lamellenwand (Referenz) */}
      <Box args={[W - 0.6, 0.03, 0.03]} position={[cx, CEIL - 0.06, BACK + 0.22]} mat={m.white} />
      <Box args={[0.03, 0.03, D - 0.6]} position={[LEFT + 0.42, CEIL - 0.06, cz]} mat={m.white} />

      {/* Glasfront + Pfosten, Glas rechts */}
      <mesh position={[(glassL + RIGHT) / 2, FLOOR + H / 2, FRONT]} material={m.glass}><planeGeometry args={[RIGHT - glassL, H]} /></mesh>
      {mullions.map((x, i) => <Box key={i} args={[0.07, H, 0.12]} position={[x, FLOOR + H / 2, FRONT]} mat={m.mullion} />)}
      <mesh position={[RIGHT, FLOOR + H / 2, cz]} rotation-y={Math.PI / 2} material={m.glass}><planeGeometry args={[D, H]} /></mesh>
      <Box args={[0.08, H, 0.08]} position={[RIGHT, FLOOR + H / 2, BACK]} mat={m.mullion} />

      {/* Wandbildschirme */}
      <Screen kind="brand" position={[5.2, 4.05, BACK + 0.2]} rot={0} w={2.0} />
      <Screen kind="3d" position={[RIGHT - 0.12, 4.0, -1.4]} rot={-Math.PI / 2} w={1.7} />
      <Furniture mobile={mobile} />
      <Sculpture />

      </group>
      <Peaks mobile={mobile} />
      <Plaza mobile={mobile} />
      <Dust count={mobile ? 250 : 600} />
    </group>
  );
}
