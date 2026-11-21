# VONUMO reference spec (owner collage, 18 Nov 2026)

Source: owner upload, 1180×1333 collage of 6 panels (each ≈590×435 px). It is a low-resolution AI-rendered concept and serves as the look target.
**Image A** = top-right exterior and middle-right interior (architecture, light, materials). **Image B** = the UI panels (hero, "Jedes Pixel zählt", "03 / Erlebnis").
Full-resolution originals have not been supplied yet. Measurements below are from the crops.

## Palette (sampled from the panels)
| Role | Value | Where |
|---|---|---|
| Sky top → horizon | `#02040c` → `#0b1840` | Clear navy gradient, dense fine stars, no moon disc |
| Mountains | Rock `#0d1426`, snow `#c9d3ea` (moonlit from the upper left) | Jagged alpine ridge band behind the pavilion, far away |
| Wet ground | `#05070d` base, reflections of blue `#2f6bff` and warm `#ffd6a0` | Smooth polished concrete without joints. Reflections are soft and stretched vertically |
| Warm architectural light | `#ffd6a0` (≈3000 K) | Thin LED line on the roof underside, downlights, interior cove lines |
| Blue accent light | `#2f6bff` → `#3d8bff` | Plinth underglow, marble wash, pedestal ring (`#38b8ff` core) |
| Monolith / mullions | `#07080c`, matte | Left box with a backlit white "VONUMO" sign |
| UI text | `#ecedf3` headlines, `#a9abb8` body | — |
| Chips (Erlebnis) | `#22c7ff` `#9b8cff` `#ff4fa8` `#c4ff3d` `#ffffff` | Order as shown |

Violet is not used for architectural light in the reference. Warm and blue only.

## Typography
- Headlines: geometric sans, Light (300), sentence case for chapters 01 and 03, uppercase Light for "JEDES PIXEL ZÄHLT". Tight tracking, line height ≈1.0.
- Eyebrows ("01 / STUDIO", "03 / ERLEBNIS") and "FARBE · LICHT · TIEFE": **monospaced**, uppercase, wide tracking (≈0.18em), 11–12 px.
- Nav: uppercase 11 px medium, tracking ≈0.08em. Order: LEISTUNGEN · PROJEKTE · STUDIO · BLOG · KONTAKT.
- Buttons: uppercase 12 px semibold, tracking 0.12em, arrow "↗". Solid white primary, outlined secondary.

## Layout and spacing
- Nav: logo left ("V" mark and VONUMO), links centred, "TERMIN BUCHEN ↗" outlined and a **round** menu button on the right. A hairline sits under the bar.
- Hero copy column starts at ≈30 % of the height and is ≈40 % of the width. The pavilion sits right of centre in the lower half.
- Chapter 01 bottom row: a V thumbnail card ("VONUMO STUDIO") on the left, 3 square pagination marks in the centre, "2–4 WOCHEN BIS LIVE / WARTUNG INKLUSIVE" on the right.
- Chapter 02: huge uppercase headline at the left, a V card below it, a boxed segmented label "MATERIAL · LICHT · FORM", and an outlined "LEISTUNGEN ANSEHEN ↗".
- Chapter 03: the V sculpture fills the right half and stands upright on a black pedestal with a glowing ring. Copy on the left with a subline. Chips, the label and the system line at the bottom left, the solid CTA at the bottom right.

## Lighting and materials (Image A)
- **Roof:** thin slab, dark fascia, a warm LED line along the underside edge, a warm wood soffit and small crisp downlights.
- **Plinth:** two dark steps. The lower step has a strong blue LED strip at its base that reflects in the wet floor.
- **Glass:** almost invisible, with thin black mullions. The interior is fully readable through it.
- **Interior:**
  - Vertical oak slat wall with warm backlight.
  - White marble with grey veins, washed blue from the right.
  - Recessed dark panel with a glowing white V outline.
  - Long dark desks with dashboard monitors and black office chairs.
  - Kentia palms in grey pots.
  - Warm cove lines at the ceiling and a polished floor.
- **V object:** heavy, chamfered and faceted extrusion (not puffy). Glossy black faces, blue glass-like side facets and a blue rim. It floats above a black cylinder whose top carries a bright cyan-blue LED ring.

## Motion language (derived; the reference is stills only)
- Slow, weighted camera moves between composed frames. No zoom tricks.
- Text arrives after the frame settles: eyebrow, then headline (character blur), then supporting lines.
- Lights feel "on": steady LEDs. No flicker after the intro.
- Hover: bottom-up fill on buttons and a subtle lift on cards.

## Known gaps (assets or tools)
- **Originals:** full-resolution files of the panels are needed to compare at more than 590 px.
- **Furniture:** no CC0 kentia palm or modern mesh office chair exists on Poly Haven. The closest available models are used and noted in the report.
- **Photographic realism:** matching the stills exactly (GI, film response) in real time is not possible. The non-interactive route is Runway image-to-video, which needs a valid key and the owner's credit approval.
- **"BLOG":** there is no blog content, so the nav item is not added as a dead link.
