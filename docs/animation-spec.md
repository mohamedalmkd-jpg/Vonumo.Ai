# Animation spec: hero fly-through

Source: the owner's reference clip (`reference/`, 12.9 s, 576×1024, 30 fps; a phone filming a desktop monitor).
Website footage covers 0.0–8.7 s. 8.7–12.9 s is a TikTok end card and is ignored.
Analysis: scene detection (no hard cuts, so one continuous shot) and contact sheets at 2 / 4 / 6 / 10 fps, cropped to the monitor.

## Shot list (reference timestamps)
| t (s) | What happens | Notes |
|---|---|---|
| 0.0–1.6 | **Chapter A: establishing shot.** Wide view, building right of centre, mountains and sky. Nav visible. Text block left (~8 % x, ~35 % y): eyebrow `01 / Arrival`, 2-line thin title, 2-line subtitle, outlined button + text link. | Camera static. |
| 1.6–1.7 | Scroll starts. All chapter-A text and the nav fade out in ~0.1–0.15 s. | Text is not scrubbed; it switches off when motion starts. |
| 1.6–2.3 | **Move 1: push-in + slight orbit right.** Building grows ~2.5×, moves left and down; roof overhang becomes a strong diagonal. Heavy motion blur. Ease-out: fast start, decelerates into rest. | ~0.6 s for one scroll gesture. |
| 2.2–2.6 | **Chapter B in.** Three huge thin uppercase words, rotated −90° (read bottom→top), stacked on the left edge, low-contrast white. Small inset photo card bottom-left, small outlined button below. Nav stays hidden (immersive). | Lines fade in with a small stagger. |
| 2.6–4.6 | Rest. Camera keeps a barely perceptible drift. | |
| 4.6–4.75 | Chapter-B text and card fade out. | |
| 4.7–5.9 | **Move 2: dolly through the glass.** Accelerates towards the window, glass reflections slide across, then a crossfade or pass into the interior. Strong blur at peak speed. | ~1.2 s, longer and faster than move 1. |
| 5.9–6.0 | Interior settles: a centrepiece (spiral stair) with a large back window framing a peak. Nav fades back in. | |
| 6.0–6.6 | **Chapter C in.** Eyebrow `04 / Atmosphere`, then a 2-line thin title revealed **character by character** (opacity + blur → sharp, ~30–40 ms stagger, L→R across both lines). Bottom-left material swatches + caption; bottom-right short list + button. | |

## Visual language observed
- Typography: very thin (≈200 weight) sans, large (title ≈ 4.5 vw), tight leading (≈1.05), white at ~85 %. Eyebrows tiny uppercase, wide tracking.
- Camera: one continuous path, never cuts. Moves are ~0.6–1.2 s; all decelerate (expo/power3-out feel). Low eye level, looking slightly up at the cantilever.
- Lighting: soft daylight exterior; warm interior points (fire, soffit downlights) visible through glass.
- Transitions: radial/forward motion blur proportional to speed; glass reflections during the pass-through.
- UI is minimal: no cards or panels over the image, just type floating on the photo.

## Translation for VONUMO (design-services site, existing brand)
| Reference | VONUMO |
|---|---|
| Alpine chalet photo / video scrub | Real-time R3F scene: a dark cantilevered **studio pavilion** on a plinth, stone wall, glass façade, faceted dark peaks in fog. Brand blue key light, cyan accents. |
| Spiral stair centrepiece | Glossy **V sculpture** (`makeVGeometry`) + floating **design screens** (UI, web, branding, 3D) rendered from canvas textures |
| Fireplace slot | Long emissive cyan light slot |
| Snow | Drifting light particles |
| Ch. A `01 / Arrival` "Chalets Cut From Light" | `01 / Studio` · "Websites mit Tiefe. KI mit Wirkung." + CTAs (Projekt starten, Leistungen) |
| Ch. B "DETAIL HOLDS WEATHER" + inset photo | `02 / Detail` · vertical "JEDES / PIXEL / ZÄHLT" + inset live 3D close-up of the V material + "Leistungen ansehen" |
| Ch. C "Rooms Tuned To Altitude" | `03 / Erlebnis` · "Interfaces, die / man betritt." + brand swatches + service list + "Projekt starten" |

## Implementation mapping
- Sticky section `#top`, height 400 svh (3 viewports of scroll). ScrollTrigger (`scrub`) maps progress `p` 0→1 into `flight.p`.
- Camera keyframes: A `p 0–0.06` (rest) → move 1 `0.06–0.30` → B rest `0.30–0.52` → move 2 `0.52–0.82` (crosses the glass at ≈0.68) → C rest `0.82–1`. Segments use smoothstep. The camera follows with frame-rate-independent damping, so Lenis gestures read as decelerating bursts.
- Direction-aware snap: after 180 ms of scroll idle inside a move, Lenis scrolls to the next rest point in the direction of travel (~1 s, expo). One gesture plays one cinematic move, as in the reference.
- Motion blur: the scene renders into an FBO, then a full-screen radial-zoom-blur pass whose strength is driven by camera speed. Plus a vignette and subtle grain.
- Text: a chapter switch is triggered by entering a rest range. Out: 0.2 s fade. In: per the shot list (char blur reveal for A and C, staggered vertical lines for B). Nav gets `html[data-immersive]` during B.
- Reduced motion: no snap or blur. Text still switches by chapter, with instant transitions.
- Mobile portrait: horizontal FOV is preserved (vertical FOV derived from aspect), text blocks re-laid for 390 px width, FBO without MSAA, DPR ≤ 1.4.
