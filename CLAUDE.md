# VONUMO — Visual & Motion Standards

Persistent rules for anyone (human or agent) working on this site. Read before touching UI, motion or 3D.
VONUMO is a premium web design, development, UI/UX, 3D and AI agency. The site must look and feel like an award-level interactive studio.

## Master design rules (permanent, set by the owner)
Act as VONUMO's Senior Creative Director, UI/UX Architect, 3D Engineer and Visual Quality Controller on every design or build task.

### Workflow for every visual task
**ANALYZE → DESIGN → BUILD → ANIMATE → RENDER → TEST → COMPARE → REFINE.**
When the owner supplies an image, concept or video:
1. Understand the intended visual result.
2. Pick the fitting skills/tools yourself; the owner should not have to name them.
3. Analyse the reference carefully (frames, crops).
4. Plan the structure and motion.
5. Implement working code.
6. Use realistic assets where appropriate.
7. Verify in a real browser.
8. Refine before reporting.

Never finish substantial visual work without the available verification steps.

### Toolchain & quality gate
- **Full tool inventory (npm / skill / MCP / CLI / app / paid service, with verified status): `docs/toolchain.md`.** Re-audit and update it when tools change. Never claim a tool is connected unless verified.
- Project skills (auto-loaded): **`vonumo-workflow`** (standard workflow + QA gate, use for every visual task), **`frontend-design`** (Anthropic, creative direction), **`reanimate`** (reference cloning + frame-by-frame verification).
- QA commands: `npm run qa:visual` (pixel diff vs `tests/visual/baseline`), `npm run qa:lighthouse` / `qa:lighthouse:mobile`. Accessibility, Best Practices and SEO must stay at 100. Update baselines (`qa:visual:update`) only for intended changes.
- Connected services (verified 2026-11-18): Figma MCP (View seat, so read-only), Framer MCP, GitHub, Vercel (`vonumo-v2` previews), Poly Haven API. Still need owner action: Runway (valid API key), Spline (scene URL), Krea, Magnific, Topaz, Adobe apps, Cloudinary, Supabase.

### Permanent production rules (owner brief, 2026-11-18)
- **Verified toolchain:** `docs/toolchain.md` (re-verified 2026-11-18). Ready: Three/R3F/drei, GSAP+ScrollTrigger, Lenis, FFmpeg, Playwright, GitHub, Vercel previews, Poly Haven, Framer MCP. Figma MCP is read-only (View seat). Spline needs an owner-made scene URL. Runway needs a valid `key_…` API key.
- **Branches & deploys:** every redesign is done on its own branch (`claude/<topic>`) with a Vercel **preview** of `vonumo-v2`. Never deploy to production or merge into the production branch without the owner's explicit approval.
- **Paid services and credentials** (Runway credits, Figma AI, Krea, Magnific, Topaz, Cloudinary): ask first. Keys only via the secure credential form, never in chat or code.
- **Asset-production plan before building:** for each section, list every asset, its source (procedural / Poly Haven / owner-supplied / Runway / Spline / Blender), resolution and format, and what is missing.
- **Image → scene decision** for every owner image:
  1. Camera must travel *through or around* it → **genuine 3D reconstruction** (R3F geometry, PBR, HDRI, real lights and shadows). List the geometry and views a single image can't show.
  2. Maximum realism without interaction → **image-to-video** (Runway, with approval) or an offline-rendered film (`scripts/render-reel.cjs`).
  3. Subtle depth only → layered composition or shaders. **Never call 2.5D or zoom "3D".**
- **References:** study award-level sites and the owner's references for composition, typography, transitions, 3D, hover/pointer, scroll storytelling, easing and mobile gestures. Reproduce interaction patterns with original or licensed assets and code only.
- **Section-by-section:** analyse the reference → build one section → render it (Playwright) → compare side by side → fix → test desktop and mobile separately → only then the next section.
- **One art-directed system:** hero, navigation, transitions, hover/cursor/touch, cards, buttons and 3D must feel like one experience. No random effects, generic AI layouts or clutter. Accessibility (Lighthouse a11y 100) and conversion stay intact.

### The five design systems (apply whenever relevant)
| # | System | What it means here | Tool status (re-checked 2026-11-17) |
|---|---|---|---|
| 1 | **Taste — creative direction** | Clear visual hierarchy, distinctive premium concepts, elegant type, layout, spacing and composition. No generic "AI website" look. | Not found. Covered by the **`frontend-design`** skill (Anthropic, installed) + these principles. |
| 2 | **Impeccable — visual quality** | Review alignment, spacing, contrast and consistency. Remove clutter. Responsive + accessible (WCAG AA contrast, focus states, reduced motion). | Not found. Enforced via `qa:lighthouse` (a11y 100) + `qa:visual` + manual checklist. |
| 3 | **Awesome Design — references** | Consult strong design patterns and keep one VONUMO language. Never copy references blindly. | No such skill installed. Use owner references in `reference/` and `docs/`. |
| 4 | **img2threejs — 3D reconstruction** | Rebuild suitable objects from references in Three.js with real materials, light and motion. Use real assets (GLB, HDRI, PBR) when procedural is not enough. | No skill of that name. The **`reanimate`** skill (`.claude/skills/reanimate`) covers reference capture, three.js/WebGL inspection and frame-by-frame verification. |
| 5 | **Playwright — visual verification** | Open the running site, screenshot new/changed sections, compare with references, fix and retest. | ✅ Playwright 1.63 + Chromium installed. Scripts: `scripts/flythrough-shots.cjs`, `scripts/section-shots.cjs`. `reanimate` adds `compare.ts`/`sheet.ts`. |

Re-check tool status at the start of a session if it matters, and update this table. **Never claim to have used a tool or skill that was not available.**

### Photorealism standard
- Prioritise realistic lighting, PBR textures, reflections and cinematic composition. Use Blender renders, HDRIs, image generation and video when available and appropriate (see `docs/integrations.md`).
- **Never present a still image as an interactive 3D object.** Label concept work as such ("Konzeptstudie").
- Mobile performance is part of quality: adaptive DPR, cheaper materials, restrained bloom.

### Execution rules
- These are standards, not a mandate to run every tool on every task. Use what the task needs.
- Review third-party code (skills, scripts, packages) before installing or running it. Paid services (e.g. Figma AI credits) only with owner approval.
- Never overwrite existing features or configuration. Keep `npm run lint` and `npm run build` green.
- State verification limits plainly. In this cloud container WebGL is software-rendered (SwiftShader), so fps is not representative and iPhone is emulated at 1×.
- Reply to the owner in the language they write in (German or Arabic). Site copy stays German.

## Role & bar
We build premium, cinematic, highly interactive websites. Quality target = the owner's reference videos.
- **Never** replace a complex reference animation with a generic fade, basic card, or template layout. If an effect can't be matched, say so and propose the closest faithful technique — don't silently simplify.
- **Never** claim a visual change is done until it has been rendered in a real browser (Playwright/Chromium) and screenshotted on **desktop (1440×900)** and **iPhone (Playwright `devices['iPhone 15']`)**, and compared with the reference.
- If a reference can't be inspected (file missing, unreadable) or a browser can't run, state that limitation explicitly.
- Preserve all existing features: contact/booking forms + `/api/contact` (Zod, honeypot, rate limit, Resend), legal pages, redirects, security headers, loader, cursor, reduced‑motion support, German copy in `lib/content.ts`.

## Stack (do not swap)
- Next.js 16 App Router · React 19 · TypeScript strict · Tailwind 4 (tokens in `app/globals.css` `@theme`)
- **GSAP 3** (+ ScrollTrigger, ScrambleText) — all scroll-linked and timeline choreography
- **Lenis** — the only smooth scroller, driven by `gsap.ticker` in `app/components/SmoothScroll.tsx`. Use `window.__lenis` / `scrollToId()`; never add a second scroll loop or native `scroll-behavior: smooth`.
- **three + @react-three/fiber + drei** — one shared `<Canvas>` (`three/Stage.tsx`), content rendered via drei `<View>`. Do not mount extra Canvases.
- **motion** — small UI state transitions only (menus, accordions, form states), not scroll choreography.
- Fonts are local (Fontsource): **Outfit** (UI + display, from the owner's mockups), Geist Mono (code only), Doto (legacy, loader). No Google Fonts requests.

## Visual language (current)
- Night studio / premium dark (owner mockups, Nov 2026): deep navy-black, warm wood light, blue/violet neon edges, glossy black V. Background `--color-ink #040406`, subtle 96px/12px grid. Scanline overlay removed for sharpness.
- Accents: `a1 #4f6bff` (primary blue), `a2 #33e1ff` (cyan focus/hover), `a3 #ff4fa8`, `lime #c4ff3d`. Accents are light, not fill — use sparingly as rim lights, edges, focus.
- Text: `fg #ecedf3`, `mute #7d7f8f`, `dim #4a4c58`. Labels 11px uppercase, tracking 0.12em.
- Display type: Outfit Light (300), tight tracking (−0.02 to −0.03em). `.dot` now maps to Outfit Light uppercase. Body: Outfit 15px.
- Components: `.hud` panels (1px line border, blurred panel bg), `.brackets` corner ticks, `.btn` with bottom‑up fill on hover.
- 3D: glossy dark physical material, blue key light + warm fill, real HDRIs via `applyHdri` (procedural studio env as fallback).
- Real assets (CC0, Poly Haven): PBR textures in `public/tex/*.webp` (loaded via `three/pbr.ts`, max anisotropy), models in `public/models/<name>/` (glTF + WebP, `three/Models.tsx`), night HDRI `moonlit_golf` as half-float DWAA EXR (`night.exr` 1k mobile, `night-2k.exr` desktop). No primitive stand-ins for furniture or plants.
- Layout: max width 1400px, gutters 16px (mobile) / 24px (≥sm). No horizontal scroll at any width.

## Motion rules
- Easing: `expo.out` / `cubic-bezier(0.16,1,0.3,1)` for entrances; `none` for scrubbed timelines; smoothstep for 3D state blends.
- Entrance timing: 0.8–1.2s, stagger 0.06–0.1s. Hero waits for the `vonumo:loaded` event.
- Scroll scenes: GSAP ScrollTrigger with `scrub` (true or 0.5–1) and `pin` where the reference holds a frame. Always `kill()` triggers on unmount (use `useGSAP` from `@gsap/react` or explicit cleanup).
- 3D follows pointer (`pointer` in `three/env.ts`) and Lenis velocity; lerp with frame‑rate‑independent damping (`1 - Math.pow(k, dt)`).
- `prefers-reduced-motion`: no Lenis, no scrubbed transforms, 3D static; content must still be fully visible.

## Performance budget
- 60fps on desktop, stable ≥45fps on recent iPhone. DPR adaptive between 1 and the cap (mobile ≤1.5, desktop ≤1.8), never below 1 CSS pixel. The hero render target uses 4×MSAA on all devices (cheap on Apple tile GPUs) instead of rendering at 3×. `?dpr=1.5` forces a fixed DPR for QA close-ups.
- Pause rendering when tab hidden (already done) and when the 3D object is off‑screen / invisible.
- Animate only `transform`/`opacity` in DOM; avoid animating layout, `filter` on large areas, or `backdrop-filter` during scroll.
- Lazy‑load three.js (`next/dynamic`, `ssr:false`); no blocking assets above the fold; compress any new textures/models (KTX2/Draco/meshopt).

## Hero fly-through (section 1) — how it works
- **Current hero = 2.5D reconstruction of the owner's design photos** (`three/HeroDepth.tsx`, View behind the DOM).
  - Each photo has a hand-built depth map (`scripts/hero-depth.py` → `public/hero/*-depth.png`). The shader does a depth-dependent dolly, pointer/touch parallax, depth of field with focus pulls, a light switch-on with flicker, star twinkle, neon breathing, wet-ground shimmer, depth-layered dust and speed-based radial motion blur.
  - Hotspots (`HeroHotspots.tsx`) are pinned to real objects via `heroProject()` (`three/flight.ts`, the same mapping as the shader). They open service cards, which become a bottom sheet on phones.
  - It is honestly 2.5D, not real 3D geometry: motion is kept small so hidden areas never tear open.
  - The images are interim crops from the owner's collage. With full-res originals (same filenames), re-tune the polygons in `hero-depth.py` and add shots.
  - `HeroPhoto.tsx` is the old DOM-only fallback. The 3D pavilion stays for `?capture=reel`.
- `app/components/Hero.tsx`: `#top` is 400svh with a sticky 100svh stage. ScrollTrigger writes progress into `flight.p` (`three/flight.ts`). Chapters (`CHAPTERS`) and camera moves (`MOVES`) share that progress axis. Chapter text switches on entering a rest range: it is not scrubbed, it leaves in 0.2 s, and it enters with a char blur reveal or line clip reveal. `html[data-immersive]` hides the nav during moves and chapter 2.
- Direction-aware snap: 180 ms after scrolling stops, Lenis glides to the next rest point, so one gesture = one cinematic move.
- `three/FlightScene.tsx`: the camera rig follows Catmull-Rom keyframes (`WIDE` for landscape, `TALL` for portrait) with damping. The scene renders into an FBO; a full-screen pass applies speed-driven radial blur, chromatic offset, vignette and grain. The global `HeroObject` V is hidden (`v: 0`) while the hero is on screen.
- `three/Studio.tsx`: the procedural pavilion, peaks, interior, screens (`three/textures.ts`, canvas-drawn) and dust. No external assets.
- Adjust framing via keyframes in `FlightScene.tsx`, timing via `CHAPTERS`/`MOVES` in `flight.ts`, and snap targets via `REST_FWD`/`REST_BACK` in `Hero.tsx`.
- **Never** give the sticky hero stage an opaque background: the WebGL canvas sits *behind* `<main>`.

## Showroom & services (sections 2–3)
- **Showroom** (`Showroom.tsx`, `#arbeiten`) is a sticky stage with one scrubbed GSAP timeline.
  - Intro: the first project grows from a small clip window over the oversized "Arbeiten, die bleiben." type.
  - Each project bursts in full-bleed (clip from below, scale 1.25→1), then **settles** into a framed screen (`SETTLE` pose). Its title rises through masks and the phone mockup floats with its own parallax.
  - The previous project sinks and darkens underneath.
  - Snap via `lenisSnap.ts` (shared helper: one gesture = one scene).
  - Reduced motion: `data-static` stacks the projects in the framed pose (CSS in `globals.css`).
- **Projects are concept studies, not client work.** Always label them "Konzeptstudie". Data lives in `WORK` (`lib/content.ts`).
  - Images: `public/work/*.webp`, rendered from `scripts/mockups/*.html` with `node scripts/render-mockups.cjs`. Fonts come from `@fontsource*` devDependencies and are only used for rendering.
  - To add real client work, drop desktop (1600×1000) and mobile (430×932) images into `public/work/` and add an entry to `WORK`.
- **Services** (`Services.tsx`, `#leistungen`) is a sticky stage with five `DISCIPLINES`. Scroll or click selects one.
  - `three/ServicesObject.tsx` shows a floating laptop and phone. Screens switch with a wipe shader (cyan scanline) and the devices turn into a new pose per discipline.
  - Do not put CSS `transition` on an element that GSAP transforms: wrap it instead, otherwise the mask reveal stalls.
- **Hero wordmark:** the giant "VONUMO" is a plane in the 3D landscape (`Studio.tsx` → `Wordmark`), so it gets real parallax and fog.

## Rendering pipeline (pass 3)
- Integration status (what works and what needs external tools) lives in `docs/integrations.md`. Keep it current.
- **HDRI:** `applyHdri(gl, scene, "night" | "studio" | "city", intensity)` in `three/env.ts`. It falls back to the procedural studio env until the EXR is loaded. In the night hero keep intensity low (~0.3): HDRIs are for reflections, not fill.
- **Material-Labor** (`MaterialLab.tsx` + `three/LabObject.tsx`, `#labor`): chrome, glass and liquid metal with drag/touch. State lives in `lab` (`three/flight.ts`).
- **Film:** `scripts/render-reel.cjs` with `?capture=reel` (deterministic time via `window.__reelT`, `flight.time`). The section mounts only if `public/film/reel-1080.mp4` exists. Never commit placeholder or low-res video.
- **Bloom must stay restrained** (threshold 1.0; mobile strength ≤0.25). Emissive materials use `toneMapped:false` with color > 1 to bloom selectively.
- Animations that must be deterministic (film) read `flight.time`, not `clock`/`dt`.

## Verification workflow
1. `npm run lint` (tsc) and `npm run build` must pass.
2. `npx next start -p 3100`, then `node scripts/flythrough-shots.cjs <out> [desktop|iphone]`, or `node scripts/section-shots.cjs <out> <desktop|iphone> <id:p1,p2> …` for any pinned section. Snap moves jumped-to positions to the next rest point, which is expected. Playwright Chromium with SwiftShader software GL: expect ~1 fps at 1440×900, so wait for the camera damping to settle before trusting a frame. Emulate iPhone at `deviceScaleFactor: 1`, because software GL at 3× is too slow for the loader. Close each browser context before opening the next. Software fps numbers are not real-device performance.
3. Compare side‑by‑side with reference frames; list mismatches; fix; repeat.
4. Check console errors, horizontal overflow, and frame time.

## Reference material
Put reference videos in `reference/` (e.g. `reference/hero.mp4`). Extracted frames go to `reference/frames/` (git‑ignored). The animation spec lives in `docs/animation-spec.md` once a reference has been analysed.
