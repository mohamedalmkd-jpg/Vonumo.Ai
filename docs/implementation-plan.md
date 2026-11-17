# Implementation plan — cinematic rebuild

## 0. Audit (done 2026-11-17)
| Check | Result |
|---|---|
| Dependencies | All imports resolve. gsap 3.15.1, @gsap/react 2.1.2, lenis 1.3.27, three 0.187, R3F 9.8.2, drei 10.7.9, motion 14, @types/three. Nothing missing. |
| `tsc --noEmit` | passes |
| `next build` | passes, all routes static except `/api/contact` |
| Browser (Chromium, desktop 1440×900 + iPhone 15) | renders, 0 console errors, no horizontal overflow |
| Lenis ↔ ScrollTrigger | correctly wired through `gsap.ticker` |
| Single WebGL canvas + drei `View` | yes |

Findings to address while rebuilding:
1. **Desktop hero:** the 3D "V" sits behind the headline, and the strokes run through "TIEFE." (needs a composition fix or an intentional depth effect).
2. **`@gsap/react` installed but unused:** effects use manual `useEffect` cleanup. Switch new scroll scenes to `useGSAP`.
3. **Hero 3D state is measured by hand** (`useScrollState` in `HeroObject.tsx`) and not driven by ScrollTrigger. That is fine for section-to-section drift, but pinned cinematic sequences should be ScrollTrigger timelines that write into a shared progress ref.
4. **Render loop keeps running when the object is invisible** (`v: 0` states). Gate it with `frameloop="demand"`, or skip work when the object is hidden.
5. **No post-processing installed.** If the reference has bloom, chromatic aberration or DOF, add `@react-three/postprocessing` (only once the reference confirms it).
6. **Load is ~20 s to network-idle in headless SwiftShader.** That is mostly software GL, not representative. Profile on a real GPU and iPhone before optimising.

## 1. Reference video: received
`reference/hero-reference.mp4`, analysed in `docs/animation-spec.md`. Frame sheets are in `docs/screens/`.

## 2. Frame analysis → `docs/animation-spec.md`
- `ffprobe`: duration, fps, resolution.
- `ffmpeg`: scene-change detection (`select='gt(scene,0.3)'`), plus a frame every 0.25 s for the first section, plus every frame across each transition.
- Contact sheets per shot, inspected visually.
- The spec captures, per shot and timestamp: camera (dolly, orbit, FOV, parallax layers), scroll binding (pinned or free, scrub length in viewport heights), typography (face, size relative to the viewport, tracking, reveal method such as mask, split chars or scramble), transitions (wipes, masks, morphs), lighting (key, rim, colour, env, bloom), 3D objects (shape, material, motion), spacing grid, and timing and easing curves (estimated from frame deltas).

## 3. Build section 1 (hero) to match: done in the first pass, see CLAUDE.md § Hero fly-through
- Map each spec shot to a GSAP master timeline driven by ScrollTrigger (pin + scrub) feeding the R3F scene through a progress ref.
- Camera moves happen in R3F (camera rig lerped to timeline values), not as CSS transforms on the canvas.
- Typography reveals use GSAP SplitText (bundled free in gsap 3.13+), masks, or ScrambleText, chosen per the reference.
- Lighting and materials are tuned against reference frames. Add post-processing only if the reference shows it.

## 4. Verify in the browser
- Playwright script: desktop + iPhone, screenshots at the scroll positions matching each reference timestamp, assembled side by side.
- Mismatch list → fix → re-shoot until matching. Check console errors, overflow and frame timing (`performance` + `requestAnimationFrame` sampling).

## 5. Then continue section by section
Same loop for each later section. Keep all forms, the API, legal pages and redirects intact. Re-run lint, build and screenshots after every section.

## 6. Agency transformation (pass 2)
Done and visually tested (desktop 1440×900, iPhone 15 layout at 1×, reduced motion):
- Showroom `#arbeiten` with 4 concept studies (ÆRA, Kōra, Mythos, Pilot): cinematic burst → framed settle, masked titles, floating phone mockups, snap.
- Services `#leistungen` with 5 disciplines and an R3F device stage (laptop + phone, wipe-shader screens).
- Hero: 3D wordmark in the landscape.
- Nav: "Arbeiten" link. Section numbering updated. Old 4-card services and `CardObject` removed.

Next passes (not yet done):
- Details / Layers / Terminal / Pricing / Steps / FAQ / Contact: replace scramble-only headings with masked line reveals. Give section seams continuity (shared background light that travels, colour hand-off).
- Real client projects in `WORK` once available. Optional photographic assets (e.g. via an image generator, with the owner's approval).
- Real-device performance profiling (iPhone Safari, mid-range Android).
