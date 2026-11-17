"""Tiefenkarten (2.5D) für die Hero-Fotos aus der sichtbaren Geometrie (Handrekonstruktion).
Weiß = nah, Schwarz = fern. Koordinaten in Bildanteilen (0…1). Neu erzeugen:
  python3 scripts/hero-depth.py   → public/hero/<name>-depth.png (+ Kontrollüberlagerung in /tmp)
Mit den hochaufgelösten Originalen die Polygone hier nachjustieren (gleiche Proportionen)."""
from PIL import Image, ImageDraw, ImageFilter
import sys

def lerp(a, b, t): return a + (b - a) * t

def build(src, out, shapes, base, blur):
    im = Image.open(src); W, H = 1200, round(1200 * im.height / im.width)
    d = Image.new("L", (W, H)); px = d.load()
    for y in range(H):
        for x in range(W):
            px[x, y] = int(255 * base(x / W, y / H))
    dr = ImageDraw.Draw(d)
    for poly, val in shapes:
        if callable(val):  # Verlauf über x
            m = Image.new("L", (W, H)); ImageDraw.Draw(m).polygon([(u * W, v * H) for u, v in poly], fill=255)
            g = Image.new("L", (W, H)); gp = g.load()
            for y in range(H):
                for x in range(W): gp[x, y] = int(255 * val(x / W, y / H))
            d.paste(g, (0, 0), m)
        else:
            dr.polygon([(u * W, v * H) for u, v in poly], fill=int(255 * val))
    d = d.filter(ImageFilter.GaussianBlur(blur))
    d.save(out)
    prev = Image.blend(im.convert("RGB").resize((W, H)), d.convert("RGB"), 0.55)
    prev.save(f"/tmp/{out.split('/')[-1].replace('.png','-check.jpg')}")

def smooth(e0, e1, x):
    t = min(1, max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

# Außen: Himmel/Berge fern, Boden wird nach unten nah, Pavillon mittig (links näher), Podest davor
build("public/hero/exterior.webp", "public/hero/exterior-depth.png",
  shapes=[
    # Dachplatte + Glasfront + rechte Fassade (perspektivisch: links näher)
    ([(0.155, 0.445), (0.27, 0.315), (0.95, 0.43), (0.975, 0.465), (0.90, 0.47), (0.90, 0.672), (0.43, 0.675), (0.43, 0.47)],
      lambda u, v: lerp(0.58, 0.40, smooth(0.15, 0.98, u))),
    # dunkle Wand mit Schriftzug (vorderste Gebäudekante)
    ([(0.175, 0.455), (0.43, 0.46), (0.43, 0.678), (0.18, 0.678)], 0.62),
    # Podest/Stufen mit Neonkante
    ([(0.05, 0.672), (0.65, 0.672), (0.65, 0.775), (0.08, 0.795)], 0.72),
  ],
  base=lambda u, v: 0.03 + 0.05 * smooth(0.1, 0.45, v) if v < 0.6 else lerp(0.35, 1.0, smooth(0.6, 1.0, v)),
  blur=4)

# Innen: unscharfe Pflanze ganz vorn, Glas-/Pfostenebene, Raum dahinter, Boden-Spiegelung
build("public/hero/interior.webp", "public/hero/interior-depth.png",
  shapes=[
    # Innenraum (Marmorwand, V, Bildschirme, Tische)
    ([(0.15, 0.30), (1.0, 0.36), (1.0, 0.80), (0.15, 0.80)], 0.30),
    # Holzlamellen links (etwas näher)
    ([(0.15, 0.30), (0.35, 0.33), (0.35, 0.78), (0.15, 0.78)], 0.36),
    # Pflanze im Vordergrund
    ([(0.0, 0.0), (0.26, 0.0), (0.27, 0.25), (0.20, 0.55), (0.12, 0.75), (0.0, 0.85)], 1.0),
  ],
  base=lambda u, v: lerp(0.78, 0.5, smooth(0.0, 0.3, v)) if v < 0.3 else (0.5 if v < 0.82 else lerp(0.6, 0.92, smooth(0.82, 1.0, v))),
  blur=10)
print("ok")
