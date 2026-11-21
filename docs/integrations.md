# Integration status (Nov 2026)

What is actually wired into the site, what is prepared, and what needs an external tool or asset.

| Area | Status | Notes |
|---|---|---|
| Next.js 16 · React 19 · TypeScript · Tailwind 4 | ✅ in use | `npm run lint` + `npm run build` pass |
| Three.js · React Three Fiber · Drei | ✅ in use | One shared WebGL2 canvas + `View`s (hero, services, lab, detail inset) |
| GLSL / custom shaders | ✅ in use | Motion-blur/vignette/grain pass, screen wipe shader, sky shader |
| Post-processing | ✅ in use | three's `EffectComposer` + `UnrealBloomPass` (restrained: threshold 1.0, lower on mobile). No extra library needed |
| PBR + **HDRI** lighting | ✅ in use | Real Poly Haven HDRIs (CC0) via `@pmndrs/assets`, extracted to `public/hdri/*.exr` (512×256; fine for IBL, not for visible backdrops). `night` → hero, `studio` → services + lab |
| Photoreal materials | ✅ in use | Chrome (metalness 1, clearcoat), glass (`MeshTransmissionMaterial`: transmission, IOR, dispersion, backside), liquid metal (GPU displacement) in **Material-Labor** |
| Reflections / shadows | ✅ in use | Planar mirror on the wet plaza (desktop), contact shadows in the lab. Mobile uses cheaper materials |
| Pointer + touch interaction | ✅ in use | Lab: drag with inertia (`touch-action: pan-y` keeps vertical scroll), pointer parallax in hero/services |
| GSAP · ScrollTrigger · Lenis | ✅ in use | All scroll scenes; shared Lenis snap (`lenisSnap.ts`) |
| Motion for React | ✅ in use | UI transitions (nav, FAQ, forms) |
| Adaptive pixel ratio | ✅ in use | drei `PerformanceMonitor` in `Stage.tsx`: DPR moves between a floor and the device ceiling based on measured fps. Bounds widen on >90 Hz displays. Rendering follows rAF (display refresh) |
| AVIF / WebP images | ✅ in use | Project mockups as WebP. Film poster pipeline outputs AVIF + WebP |
| FFmpeg · H.264 / VP9 / AV1 | ✅ pipeline ready | `scripts/render-reel.cjs` renders the studio film deterministically (24 fps, 1.5× supersampled) and encodes AV1 + VP9 + H.264 at 1080p and 720p, plus posters |
| Full-screen film section | ✅ built, ⏸ hidden | `Film.tsx` (scroll clip-reveal, plays in view, AV1→VP9→H.264, 720p on phones, reduced-motion = poster + button). Appears automatically once `public/film/reel-1080.mp4` exists |
| **Rendering the film itself** | ⏳ needs a GPU machine | In this cloud container WebGL runs in software (~2 min per frame → ~8 h). On a normal computer with a GPU: `npm run build && npx next start -p 3100`, then `npm run render:reel` (minutes) |
| WebGPU | ❌ not enabled (deliberate) | Custom GLSL shaders and drei's WebGL-only materials (transmission, reflector, View) do not run on `WebGPURenderer`. WebGL2 is the compatible choice today |
| KTX2 textures | ❌ not used | No KTX2 encoder (`toktx`/`basisu`) available here, and current textures are procedural or WebP. Worth adding once real photographic PBR textures arrive |
| GLB / glTF models | ⏳ no assets yet | Loader-ready (drei `useGLTF`). No real models were supplied, and Poly Haven/Sketchfab downloads are blocked from this container. Furniture and plants are procedural |
| Poly Haven direct downloads (8K HDRI/PBR) | ❌ blocked here | Network policy blocks `polyhaven.com`. Only the CC0 HDRIs bundled in `@pmndrs/assets` were usable |
| Blender / Cycles, Unreal, Runway, Kling, Spline | ❌ external | Not installed or reachable here. They need their own accounts or workstations. Their output (MP4/WebM, GLB, EXR) drops straight into `public/film`, `public/models`, `public/hdri` |
| Rive | ⏸ not installed | Only useful with supplied `.riv` files. None provided |
| Theatre.js | ⏸ not installed | GSAP timelines + scroll-driven camera paths already cover the sequences. Add only if hand-keyed camera animation in a visual editor is wanted |
| Cloudinary / media CDN | ⏸ not connected | Needs an account. Vercel serves `public/` from its edge network meanwhile |
| Figma image generation | ⏸ available, unused | Costs Figma AI credits. Only with the owner's approval |
