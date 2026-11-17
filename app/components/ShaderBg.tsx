"use client";
import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Flüssige Aurora-Kugel: Domain-Warping-Rauschen, reagiert sanft auf die Maus.
const FRAG = `precision highp float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
 vec2 c=vec2(.38,.05)+(m-.5)*vec2(.18,-.12);
 if(r.x<r.y) c=vec2(0.,.22)+(m-.5)*vec2(.1,-.08);
 float tt=t*.07;
 vec2 q=vec2(fbm(uv*1.6+tt),fbm(uv*1.6-tt+3.1));
 vec2 w=vec2(fbm(uv*2.+q*2.+tt*1.3),fbm(uv*2.+q*2.-tt));
 float f=fbm(uv*1.4+w*1.6);
 float d=length(uv-c+(w-.5)*.25);
 float orb=smoothstep(.62,.0,d);
 vec3 a1=vec3(.486,.361,1.),a2=vec3(.133,.827,.933),a3=vec3(.957,.447,.714);
 vec3 col=mix(a1,a2,smoothstep(.25,.8,f));
 col=mix(col,a3,smoothstep(.55,.95,w.x)*.55);
 col*=orb*1.25+f*.18;
 col+=pow(orb,6.)*.35;
 float vig=smoothstep(1.4,.2,length(uv));
 col*=vig;
 col+= (h(gl_FragCoord.xy+t)-.5)*.02;
 gl_FragColor=vec4(col,1.);
}`;

export function ShaderBg({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) { cv.dataset.fallback = "1"; return; }

    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.dataset.fallback = "1"; return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uM = gl.getUniformLocation(pr, "m");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Auf schwächeren Geräten in niedrigerer Auflösung rendern – das Bild ist ohnehin weich.
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * (window.innerWidth < 768 ? 0.5 : 0.65);
    const resize = () => {
      const w = Math.max(1, Math.floor(cv.clientWidth * scale)), h = Math.max(1, Math.floor(cv.clientHeight * scale));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(uR, w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => { mouse.tx = e.clientX / window.innerWidth; mouse.ty = e.clientY / window.innerHeight; };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true, raf = 0;
    const start = performance.now();
    const frame = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04; mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(uT, reduce ? 12 : (now - start) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(frame);
    });
    io.observe(cv);
    const onVis = () => { cancelAnimationFrame(raf); visible = !document.hidden; if (visible) raf = requestAnimationFrame(frame); };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);
    cv.dataset.ready = "1";

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_45%,rgb(124_92_255/0.45),transparent_70%)]" />
      <canvas ref={ref} className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1.6s] data-[ready]:opacity-100" />
    </div>
  );
}
