# VONUMO 2.0

Website der Digitalagentur VONUMO – komplett neu gebaut: schneller, flüssiger, moderner.

## Stack
- **Next.js 16** (App Router, statisch vorgerendert) · **React 19** · **TypeScript**
- **Tailwind CSS 4** – Design-Tokens in `app/globals.css`
- **Motion** für Animationen, **Lenis** für weiches Scrollen
- **Eigener WebGL-Shader** im Hero (statt Three.js): wenige KB, pausiert außerhalb des Sichtfelds und im Hintergrund-Tab, reduzierte Auflösung auf Handys
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
