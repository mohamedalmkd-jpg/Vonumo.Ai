# VONUMO AI — Toolchain inventory

**Re-verified 2026-11-18** with real calls (not just installed packages). Cloud environment: **„Vonumo.Ai“** (personal), which allows `prod.spline.design`, `api.dev.runwayml.com`, `api.polyhaven.com` and `dl.polyhaven.org` in addition to the package registries.

## Core toolchain (owner brief, 2026-11-18)
| Tool | Kind | Status | Verified by |
|---|---|---|---|
| Figma | MCP (official) | 🔌 connected, **read-only** | `whoami`: account "Mo Hans", Starter plan, **View seat**. Reading designs works; writing into Figma files needs a Full/Dev seat (owner decision) |
| Framer | MCP (official) | 🔌 connected | `list_projects` + `open_project` on "Welcomed Blackberry": session opens, tree/API available. Nothing modified |
| Spline | npm runtime + web app | ⚠️ partly | No official MCP exists. `@splinetool/runtime` 2.0 / `@splinetool/react-spline` 4.2 installable; `prod.spline.design` reachable. **Needs:** a scene built in the owner's Spline account, exported as a public scene URL (or GLB). Spline has no API to create scenes |
| Three.js + R3F + drei | npm | ✅ | three 0.187, R3F 9.8, drei 10.7; production build passes |
| GSAP + ScrollTrigger + @gsap/react | npm | ✅ | gsap 3.15, @gsap/react 2.1 |
| Lenis | npm | ✅ | lenis 1.3 (one scroll loop via gsap.ticker) |
| Runway | REST API (SDK `@runwayml/sdk`) | ⏳ key invalid | Host reachable; key saved via the secure form is **rejected by Runway** ("must start with `key_`"). Owner: create an API key at dev.runwayml.com (API Keys) and save it again. Every generation costs Runway credits, so only with approval |
| FFmpeg | CLI | ✅ | 6.1; AV1 (svt/aom), VP9, H.264, WebP, AVIF encoders |
| Playwright | CLI + lib | ✅ | 1.63, Chromium launches. Software GL only (no GPU), see CLAUDE.md |
| GitHub | MCP + git | 🔌 | `get_me`: mohamedalmkd-jpg. Push to feature branches works |
| Vercel | MCP | 🔌 | Preview deploys of `vonumo-v2` from feature branches work. Production is never touched without approval |
| Poly Haven | HTTP API | ✅ | `api.polyhaven.com` 200; HDRI download verified (moonless_golf 1k). 4K/8K HDRIs and PBR textures can now be fetched |
| Awwwards / CSS Design Awards | websites | ⚠️ | Not on the network allowlist. Study references the owner sends (URLs, recordings); add a host only for a concrete reference |

## Earlier inventory (2026-11-17)

## A. Design intelligence & skills
| Tool | Kind | Status | Notes |
|---|---|---|---|
| Frontend Design | skill | ✅ | Anthropic's official skill (Apache-2.0), vendored in `.claude/skills/frontend-design`. Loads automatically. |
| reanimate | skill | ✅ | Reviewed (MIT), `.claude/skills/reanimate`. Reference capture, three.js/WebGL inspection, frame-by-frame compare. Its scripts need a one-off `bash .claude/skills/reanimate/scripts/setup.sh` (~250 MB). |
| vonumo-workflow | skill | ✅ | Project skill (this repo): the VONUMO workflow + QA gate, `.claude/skills/vonumo-workflow`. |
| Taste Skill · Impeccable · Awesome Design · img2threejs | skill | ❌ | Not found in any registry reachable here. Applied as principles (see CLAUDE.md). Send exact install sources to add them after review. |
| Claude Vision | built-in | ✅ | Image/frame analysis is native (reference sheets, screenshots). |
| Figma (MCP) | MCP | 🔌 | Authenticated as "Mo Hans", Starter plan, **View seat**: reading designs works, writing into Figma files needs a Full/Dev seat. Image generation uses Figma AI credits, so only with approval. |
| Framer (MCP) | MCP | 🔌 | Authenticated. 1 project ("Welcomed Blackberry"). |

## B. Motion & animation
| Tool | Kind | Status | Notes |
|---|---|---|---|
| GSAP 3.15 + ScrollTrigger + ScrambleText | npm | ✅ | All scroll choreography |
| @gsap/react 2.1 | npm | ✅ | `useGSAP` cleanup |
| Lenis 1.3 | npm | ✅ | Only smooth scroller (`lenisSnap.ts` for scene snap) |
| Motion 14 | npm | ✅ | UI state transitions |
| Rive | npm | ⏸ | `@rive-app/react-canvas` available on npm. Install when `.riv` files are supplied. |
| Theatre.js | npm | ⏸ | `@theatre/core` + `@theatre/r3f` available. Install if hand-keyed camera timelines in a visual editor are wanted. |

## C. 3D & rendering
| Tool | Kind | Status | Notes |
|---|---|---|---|
| three 0.187 · R3F 9.8 · drei 10.7 · @types/three | npm | ✅ | One shared canvas + `View`s |
| WebGL2 + GLSL | runtime | ✅ | Custom shaders (motion blur, wipe, sky) |
| Post-processing | npm (three addons) | ✅ | three `EffectComposer` + `UnrealBloomPass`. `postprocessing`/`@react-three/postprocessing` ⏸ (available; not needed yet). |
| WebGPU | runtime | ⏸ | Custom GLSL + drei WebGL-only materials would not run on `WebGPURenderer`. Revisit with a TSL rewrite. |
| Poly Haven | assets | ✅ partial | 3 CC0 HDRIs via `@pmndrs/assets` → `public/hdri/`. polyhaven.com itself is blocked from this container: download 4K/8K HDRIs/PBR on your machine. |
| Blender / Cycles | app | ❌ here | Not installable in this container. Render on a workstation → drop GLB/EXR/MP4 into `public/`. |
| Spline | service | ⏳ | Needs a Spline account. Export as GLB (preferred) or `@splinetool/react-spline`. |

## D. Realistic images & video
| Tool | Kind | Status | Notes |
|---|---|---|---|
| FFmpeg 7 (AV1/VP9/H.264, WebP, AVIF) | CLI | ✅ | Used for frames, mockups, film pipeline |
| ImageMagick (`convert`) | CLI | ✅ | Batch image ops |
| Playwright HTML→image | CLI | ✅ | Concept mockups (`npm run render:mockups`) |
| Krea AI · Magnific AI · Topaz Video AI | service | ⏳ | Paid accounts. Upscale/generate on your side, then send the files. |
| Adobe Photoshop · After Effects | app | ⏳ | Desktop apps on your machine. Export PNG/EXR/MP4 into `public/`. |
| Cloudinary | service | ⏳ | Needs account + cloud name. Until then Vercel's edge serves `public/` (+ `next/image` optimisation). |

## E. Website development
| Tool | Kind | Status | Notes |
|---|---|---|---|
| Next.js 16 · React 19 · TypeScript 5.9 · Tailwind 4 | npm | ✅ | |
| npm 10 · Node 22 · bun | CLI | ✅ | |
| GitHub (git + MCP) | MCP/CLI | 🔌 | `mohamedalmkd-jpg`, repo `Vonumo.Ai` |
| Vercel (MCP) | MCP | 🔌 | Team `mohamedalmkd-jpg`, project `vonumo-v2`; preview deploys work. The `vercel` CLI is not installed (MCP covers it). |
| Supabase | service | ⏳ | Not connected and not used yet. Needs project URL + anon key (only when a feature needs a DB/auth). |
| VS Code | app | — | On your machine. This repo works as-is in it. |

## F. Testing & visual quality
| Tool | Kind | Status | Notes |
|---|---|---|---|
| Playwright 1.63 + Chromium | CLI | ✅ | `scripts/flythrough-shots.cjs`, `scripts/section-shots.cjs` |
| Visual regression | npm (pixelmatch, pngjs) | ✅ | `npm run qa:visual` / `qa:visual:update`. Baselines in `tests/visual/baseline` (Preise, Termin, FAQ, Kontakt × desktop/iPhone) |
| Lighthouse 13 | npm | ✅ | `npm run qa:lighthouse` / `qa:lighthouse:mobile` → `docs/lighthouse/`. Accessibility, Best Practices, SEO 100 (2026-11-17). Performance here is **not** representative (no GPU). |
| Chrome DevTools | app | — | Use locally for real-device profiling (Performance panel, Rendering → FPS meter). |

## Honesty rules (from CLAUDE.md)
No 4K/8K/120 fps claims without measurement on real hardware. In this container WebGL is software-rendered: fps and Lighthouse performance numbers are not real-device values.
