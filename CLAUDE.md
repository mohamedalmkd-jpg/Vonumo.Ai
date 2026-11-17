# VONUMO — Visual & Motion Standards

Persistent rules for anyone (human or agent) working on this site. Read before touching UI, motion or 3D.

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
- Fonts are local (Fontsource): Doto (dot‑matrix display) + Geist Mono. No Google Fonts requests.

## Visual language (current)
- Dark techwear / HUD. Background `--color-ink #040406`, fine 96px/12px grid, scanline overlay (`.scan`).
- Accents: `a1 #4f6bff` (primary blue), `a2 #33e1ff` (cyan focus/hover), `a3 #ff4fa8`, `lime #c4ff3d`. Accents are light, not fill — use sparingly as rim lights, edges, focus.
- Text: `fg #ecedf3`, `mute #7d7f8f`, `dim #4a4c58`. Labels 11px uppercase, tracking 0.12em.
- Display type: `.dot` (Doto 900, uppercase, line-height .92). Body: Geist Mono 14px.
- Components: `.hud` panels (1px line border, blurred panel bg), `.brackets` corner ticks, `.btn` with bottom‑up fill on hover.
- 3D: glossy dark physical material, blue key light + white fill, procedural studio env (`three/env.ts`, no HDR download).
- Layout: max width 1400px, gutters 16px (mobile) / 24px (≥sm). No horizontal scroll at any width.

## Motion rules
- Easing: `expo.out` / `cubic-bezier(0.16,1,0.3,1)` for entrances; `none` for scrubbed timelines; smoothstep for 3D state blends.
- Entrance timing: 0.8–1.2s, stagger 0.06–0.1s. Hero waits for the `vonumo:loaded` event.
- Scroll scenes: GSAP ScrollTrigger with `scrub` (true or 0.5–1) and `pin` where the reference holds a frame. Always `kill()` triggers on unmount (use `useGSAP` from `@gsap/react` or explicit cleanup).
- 3D follows pointer (`pointer` in `three/env.ts`) and Lenis velocity; lerp with frame‑rate‑independent damping (`1 - Math.pow(k, dt)`).
- `prefers-reduced-motion`: no Lenis, no scrubbed transforms, 3D static; content must still be fully visible.

## Performance budget
- 60fps on desktop, stable ≥45fps on recent iPhone. DPR capped (mobile ≤1.4, desktop ≤1.8).
- Pause rendering when tab hidden (already done) and when the 3D object is off‑screen / invisible.
- Animate only `transform`/`opacity` in DOM; avoid animating layout, `filter` on large areas, or `backdrop-filter` during scroll.
- Lazy‑load three.js (`next/dynamic`, `ssr:false`); no blocking assets above the fold; compress any new textures/models (KTX2/Draco/meshopt).

## Hero fly-through (section 1) — how it works
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
