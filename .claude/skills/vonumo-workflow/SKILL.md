---
name: vonumo-workflow
description: VONUMO's standard design-to-production workflow and quality gate. Use for any visual, UI/UX, motion, 3D or asset task on the VONUMO website (new section, redesign, reference image/video to recreate, animation, 3D object, image/video assets), and before reporting such work as done.
---

# VONUMO workflow

Follow **ANALYZE → DESIGN → BUILD → ANIMATE → RENDER → TEST → COMPARE → REFINE**. Project rules live in `CLAUDE.md`. Tool availability lives in `docs/toolchain.md`. Read both if not already in context.

## 1. Analyze
- **Reference video or GIF:** `ffprobe`, scene detection, contact sheets (`ffmpeg … tile=`), and read every sheet. For timing-accurate clones of a site, video or WebGL scene, use the **reanimate** skill.
- **Reference images:** crop the relevant frames and note composition, light, type, spacing and colour. Check resolution: low-res collages are not final assets, so ask for originals.
- Write or update a spec (`docs/animation-spec.md`) when motion matters.

## 2. Design
- Apply the **frontend-design** skill's principles (distinct, not templated) inside the VONUMO language: night studio, Outfit, blue/violet light edges, warm wood light.
- Choose the technique per need: photo/video sequence for maximum realism; R3F for interaction; DOM + GSAP for type and layout.

## 3. Build · Animate · Render
- Stack and rules: see `CLAUDE.md` (one canvas + `View`, Lenis + GSAP, transform/opacity only in DOM, restrained bloom, adaptive DPR, reduced-motion fallback).
- Assets: WebP/AVIF images, HDRIs in `public/hdri`, models as compressed GLB. Never commit placeholder or low-res video. Label concept work "Konzeptstudie".
- Paid services (Figma AI, Krea, Magnific, Topaz, Cloudinary) only with the owner's approval and credentials.

## 4. Test (quality gate, all must pass)
```bash
npm run lint && npm run build
npx next start -p 3100 &
node scripts/section-shots.cjs /tmp/shots desktop <id:p,…>   # and: iphone
npm run qa:visual            # pixel diff vs tests/visual/baseline; intended changes → qa:visual:update
npm run qa:lighthouse        # Accessibility / Best Practices / SEO must stay 100
```
- Look at every screenshot yourself (desktop 1440×900 and iPhone 15). Check console errors and horizontal overflow.
- For pinned or scroll scenes, also test with real wheel scrolling (instant jumps produce artefacts).

## 5. Compare · Refine
- Put the result side by side with the reference and list concrete mismatches (framing, light, type, timing). Fix, then re-shoot.
- Report honestly: what was verified, what could not be (software GL: fps and Lighthouse performance are not real-device values), and which assets or credentials are still needed.

## 6. Ship
Commit on the working branch, push, and deploy a Vercel preview (`vonumo-v2`) when the owner wants a link. Confirm the deployment is READY and the page loads before sharing it.
