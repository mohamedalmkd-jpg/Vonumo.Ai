# VONUMO 2.0

Website der Digitalagentur VONUMO – komplett neu gebaut: schneller, flüssiger, moderner.

## Stack
- **Next.js 16** (App Router, statisch vorgerendert) · **React 19** · **TypeScript**
- **Tailwind CSS 4** – Design-Tokens in `app/globals.css`
- **three.js + React Three Fiber + drei**: eine einzige WebGL-Leinwand für die ganze Seite.
  Das aufgeblähte 3D-„V“ folgt der Maus und wandert beim Scrollen zwischen den Abschnitten (`app/components/three/HeroObject.tsx`, Zustände in `DESK`/`MOB`).
  Die Leistungs-Karten zeichnen ihre Objekte per `View` in dieselbe Leinwand. Eigene Studio-Beleuchtung ohne HDR-Download (`three/env.ts`).
- **GSAP** (ScrollTrigger, ScrambleText) für Scroll-Szenen und Text-Entschlüsselung, **Motion** für UI-Übergänge, **Lenis** für weiches Scrollen
- Blitze (`Lightning.tsx`) als prozedurales SVG, eigener Fadenkreuz-Cursor, Ladebildschirm 000→100
- Schriften: Doto (Punktmatrix) und Geist Mono
- **Zod** – dieselbe Validierung im Browser und auf dem Server
- Schriften lokal (Fontsource) – keine Verbindung zu Google

## Struktur
```
app/
  page.tsx              Startseite (Abschnitte)
  components/           Hero, Layers, Terminal, Pricing, Booking, Contact …
  api/contact/route.ts  Formular-Endpunkt (Validierung, Honeypot, Rate-Limit, Versand per Resend)
  impressum/ datenschutz/
lib/
  content.ts            Alle Texte, Preise und Kontaktdaten an einer Stelle
  schema.ts             Formular-Schemas
```

## Entwicklung
```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Formulare einrichten
Variablen aus `.env.example` in Vercel (Project → Settings → Environment Variables) setzen:
`RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`. Ohne diese Werte zeigt das Formular einen direkten E-Mail-Link an, statt Anfragen zu verlieren.

## Vor dem Livegang
- Platzhalter in `app/impressum/page.tsx` und `app/datenschutz/page.tsx` (Name, Anschrift, USt-IdNr.) ausfüllen.
- Optional `NEXT_PUBLIC_SITE_URL` auf die eigene Domain setzen (Sitemap, Metadaten).
