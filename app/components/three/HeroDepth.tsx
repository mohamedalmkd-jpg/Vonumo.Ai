"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, View } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { pointer } from "./env";
import { CHAPTERS, MOVES, flight, hero } from "./flight";

/*
 * 2.5D-Hero aus den Design-Fotos des Inhabers. Ehrlich: Das sind Fotos, keine 3D-Geometrie.
 * Jede Aufnahme hat eine handrekonstruierte Tiefenkarte (scripts/hero-depth.py). Der Shader verschiebt
 * Pixel nach Tiefe (Dolly + Zeiger-Parallaxe), fokussiert per Tiefenunschärfe, schaltet das Licht ein,
 * lässt Sterne funkeln, Neon atmen, Spiegelungen auf dem nassen Boden schimmern und Staub in Tiefenebenen treiben.
 * Bewegungsumfang bleibt klein genug, dass verdeckte Bereiche nicht aufreißen.
 */

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tA, tB, dA, dB;
uniform vec2 uRes, uAspA, uAspB;   // Bildschirm, Bild-Seitenverhältnisse (x = w/h)
uniform vec2 oA, oB;               // Dolly-Ziel (Bild-UV)
uniform vec2 panA, panB;           // Ausschnitt-Verschiebung (Hochformat)
uniform float zA, zB, mixB, focusA, focusB, dof, lights, time, blurAmt, fade;
uniform vec2 ptr;
uniform float mobile;
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+1.), f.x), f.y); }

// Bildschirm-UV → Bild-UV mit Cover-Fit, Tiefen-Dolly (nah zoomt stärker) und Parallaxe
vec2 toImg(vec2 uv, float asp, vec2 o, vec2 pan, float z, sampler2D dmap, float focus, out float depth){
  float r = (uRes.x / uRes.y) / asp;
  vec2 sc = r > 1. ? vec2(1., 1./r) : vec2(r, 1.);
  vec2 base = 0.5 + pan + (uv - 0.5) * sc;
  vec2 q = base; depth = 0.;
  for (int i = 0; i < 3; i++) {           // iterative Parallax-Lösung
    depth = texture2D(dmap, clamp(q, 0., 1.)).r;
    float zz = z * (1. + (z - 1.) * depth * 0.55);
    q = o + (base - o) / zz - ptr * (depth - focus) * 0.022;
  }
  return q;
}

vec3 shade(sampler2D img, sampler2D dmap, vec2 q, float depth, float focus, bool exterior){
  // Tiefenunschärfe: Radius nach Abstand zur Schärfeebene
  float rad = abs(depth - focus) * dof * (mobile > .5 ? 0.6 : 1.);
  vec3 c = texture2D(img, q).rgb; float w = 1.;
  if (rad > 0.0004) {
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 2.39996, rr = sqrt((float(i) + .5) / 8.) * rad;
      c += texture2D(img, q + vec2(cos(a), sin(a)) * rr).rgb; w += 1.;
    }
    c /= w;
  }
  float lum = dot(c, vec3(.299, .587, .114));
  // Licht „einschalten“: helle, gesättigte Flächen (Downlights, Neon, Screens) werden mit uLights hochgefahren
  float lightMask = smoothstep(.42, .8, lum) * step(.2, depth);
  float pulse = 1. + 0.06 * sin(time * 1.3 + q.x * 6.);
  c = mix(c * (0.42 + 0.58 * lights), c * lights * pulse, lightMask);
  if (exterior) {
    // Sterne funkeln (ferner Himmel, helle Punkte)
    float star = step(depth, .07) * smoothstep(.35, .7, lum);
    c += c * star * (noise(q * 900. + time * 2.) - .4) * 1.4;
  }
  return c;
}

void main(){
  vec2 uv = vUv;
  // Bewegungsunschärfe radial (während der Fahrten)
  vec2 dir = uv - 0.5;
  vec3 acc = vec3(0.); float tot = 0.;
  for (int s = 0; s < 6; s++) {
    float t = float(s) / 5.;
    vec2 u = uv - dir * t * blurAmt;
    float da, db;
    vec2 qa = toImg(u, uAspA.x, oA, panA, zA, dA, focusA, da);
    // nasser Boden: feines Schimmern der Spiegelungen
    float ground = (1. - smoothstep(.25, .38, qa.y)) * step(.55, da);
    qa.x += sin(qa.y * 260. + time * 1.6) * 0.0009 * ground;
    vec3 col = shade(tA, dA, qa, da, focusA, true);
    if (mixB > 0.001) {
      vec2 qb = toImg(u, uAspB.x, oB, panB, zB, dB, focusB, db);
      vec3 cb = shade(tB, dB, qb, db, focusB, false);
      col = mix(col, cb, mixB);
    }
    float w = 1. - t * .6; acc += col * w; tot += w;
    if (blurAmt < 0.002) break;
  }
  vec3 col = acc / tot;
  // treibender Staub in drei Tiefenebenen (wandert mit der Parallaxe)
  for (int l = 0; l < 3; l++) {
    float fl = float(l);
    vec2 p = uv * vec2(uRes.x / uRes.y, 1.) * (7. + fl * 5.) + vec2(time * (.02 + fl * .01), -time * (.03 + fl * .02)) - ptr * (.2 + fl * .35);
    vec2 cell = floor(p), f = fract(p) - .5;
    float h = hash(cell + fl * 17.);
    vec2 off = vec2(hash(cell + 3.1), hash(cell + 7.7)) - .5;
    float d = length(f - off * .7);
    col += vec3(.75, .82, 1.) * smoothstep(.035 - fl * .008, 0., d) * step(.86, h) * (.25 + .2 * fl) * lights;
  }
  // Vignette + Korn
  col *= mix(1., smoothstep(1.2, .25, length(dir * vec2(uRes.x / uRes.y, 1.))), .5);
  col += (hash(gl_FragCoord.xy + fract(time) * 91.) - .5) * .02;
  gl_FragColor = vec4(col * fade, 1.);
  #include <colorspace_fragment>
}`;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const ease = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

// Dolly-Ziele und Ausschnitte (Bild-UV) – auf die Glasfront bzw. das V gerichtet
const EXT = { o: new THREE.Vector2(hero.oA[0], 1 - hero.oA[1]), panPortrait: new THREE.Vector2(0.12, 0) };
const INT = { o: new THREE.Vector2(hero.oB[0], 1 - hero.oB[1]), panPortrait: new THREE.Vector2(0.0, 0) };

function Quad() {
  const [tA, tB, dA, dB] = useTexture(["/hero/exterior.webp", "/hero/interior.webp", "/hero/exterior-depth.png", "/hero/interior-depth.png"]);
  const { size } = useThree();
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: {
      tA: { value: null }, tB: { value: null }, dA: { value: null }, dB: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) }, uAspA: { value: new THREE.Vector2(1.34, 0) }, uAspB: { value: new THREE.Vector2(1.37, 0) },
      oA: { value: EXT.o.clone() }, oB: { value: INT.o.clone() }, panA: { value: new THREE.Vector2() }, panB: { value: new THREE.Vector2() },
      zA: { value: 1 }, zB: { value: 1 }, mixB: { value: 0 }, focusA: { value: 0.55 }, focusB: { value: 0.3 }, dof: { value: 0.012 },
      lights: { value: 0 }, time: { value: 0 }, blurAmt: { value: 0 }, fade: { value: 0 }, ptr: { value: new THREE.Vector2() }, mobile: { value: 0 },
    },
  }), []);
  useEffect(() => {
    [tA, tB].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8; t.needsUpdate = true; });
    [dA, dB].forEach((t) => { t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; });
    const u = mat.uniforms;
    u.tA.value = tA; u.tB.value = tB; u.dA.value = dA; u.dB.value = dB;
    const ia = tA.image as HTMLImageElement, ib = tB.image as HTMLImageElement;
    u.uAspA.value.x = ia.width / ia.height; u.uAspB.value.x = ib.width / ib.height;
    window.dispatchEvent(new Event("vonumo:hero-ready"));
  }, [tA, tB, dA, dB, mat]);

  const st = useMemo(() => ({ p: 0, intro: 0, lights: 0, ptr: new THREE.Vector2(), reduce: false, lastP: 0, t0: 0 }), []);
  useEffect(() => { st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }, [st]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20), u = mat.uniforms;
    flight.time = state.clock.elapsedTime;
    const portrait = size.height > size.width;
    st.p += (flight.p - st.p) * (st.reduce ? 1 : 1 - Math.exp(-dt * 5));
    // Intro nach Echtzeit (nicht pro Bild): auch bei Bildeinbrüchen pünktlich fertig
    if (flight.started && !st.t0) st.t0 = performance.now();
    if (st.t0) st.intro = st.reduce ? 1 : Math.min(1, (performance.now() - st.t0) / 2400);
    const k = 1 - Math.pow(1 - st.intro, 3);
    // Licht geht mit kurzem Flackern an (Leuchtstoff-Charakter), danach ruhig
    const flick = st.intro > 0.15 && st.intro < 0.5 && !st.reduce ? (Math.sin(performance.now() * 0.047) > 0.2 ? 1 : 0.4) : 1;
    st.lights = Math.min(1, k * 1.15) * flick;

    const p = st.p, [m1, m2] = MOVES, [, c1, c2] = CHAPTERS;
    const s1 = seg(p, m1.from, m1.to), r1 = clamp01((p - c1.from) / (c1.to - c1.from)), s2 = seg(p, m2.from, m2.to);
    const rc = clamp01((p - c2.from) / (c2.to - c2.from));
    // Kamera: Totale atmet → Fahrt an die Glasfront → durch das Glas (Überblendung) → Fahrt auf das V
    u.zA.value = 1.04 - 0.04 * k + p * 0.1 + s1 * 0.85 + r1 * 0.05 + s2 * 1.6;
    u.zB.value = 1.5 - s2 * 0.45 + rc * 0.1;
    u.mixB.value = seg(p, m2.from + 0.1, m2.from + 0.26);
    // Fokus zieht von der Fassade (Totale) auf die Glasebene und im Innenraum auf die Wand
    u.focusA.value = 0.52 + s1 * 0.06 - (1 - k) * 0.3;
    u.focusB.value = 0.3;
    u.dof.value = (portrait ? 0.005 : 0.007) + (1 - k) * 0.02;
    // Zeiger/Touch-Parallaxe (gedämpft)
    if (!st.reduce) st.ptr.lerp(new THREE.Vector2(pointer.x, pointer.y), 1 - Math.exp(-dt * 3));
    u.ptr.value.copy(st.ptr);
    // Bewegungsunschärfe aus der Fahrtgeschwindigkeit
    const speed = Math.abs(p - st.lastP) / Math.max(dt, 1e-3); st.lastP = p;
    u.blurAmt.value += ((st.reduce ? 0 : Math.min(0.06, speed * 0.12)) - u.blurAmt.value) * (1 - Math.exp(-dt * 10));
    u.panA.value.copy(portrait ? EXT.panPortrait : new THREE.Vector2());
    u.panB.value.copy(portrait ? INT.panPortrait : new THREE.Vector2());
    u.uRes.value.set(size.width, size.height);
    u.lights.value = st.lights; u.time.value = flight.time; u.fade.value = st.reduce ? 1 : Math.min(1, st.intro * 2);
    u.mobile.value = size.width < 768 ? 1 : 0;
    // Zustand für Hotspots (DOM) bereitstellen
    hero.zA = u.zA.value; hero.zB = u.zB.value; hero.mixB = u.mixB.value; hero.ptr = [st.ptr.x, st.ptr.y];
    hero.focusA = u.focusA.value; hero.focusB = u.focusB.value; hero.w = size.width; hero.h = size.height;
    hero.aspA = u.uAspA.value.x; hero.aspB = u.uAspB.value.x; hero.panA = [u.panA.value.x, u.panA.value.y]; hero.panB = [u.panB.value.x, u.panB.value.y];
    hero.ready = st.intro > 0.6;
  });
  return <mesh frustumCulled={false} material={mat}><planeGeometry args={[2, 2]} /></mesh>;
}

/** Bühne des Heros: 2.5D-Fotos mit Tiefe, Licht und Atmosphäre. */
export default function HeroDepth({ className }: { className?: string }) {
  return <View className={className}><Quad /></View>;
}

