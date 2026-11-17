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

## Verification workflow
1. `npm run lint` (tsc) and `npm run build` must pass.
2. `npx next start -p 3100`, then `node scripts/flythrough-shots.cjs <out> [desktop|iphone]`. Playwright Chromium with SwiftShader software GL: expect ~1 fps at 1440×900, so wait for the camera damping to settle before trusting a frame. Emulate iPhone at `deviceScaleFactor: 1`, because software GL at 3× is too slow for the loader. Close each browser context before opening the next. Software fps numbers are not real-device performance.
3. Compare side‑by‑side with reference frames; list mismatches; fix; repeat.
4. Check console errors, horizontal overflow, and frame time.

## Reference material
Put reference videos in `reference/` (e.g. `reference/hero.mp4`). Extracted frames go to `reference/frames/` (git‑ignored). The animation spec lives in `docs/animation-spec.md` once a reference has been analysed.
