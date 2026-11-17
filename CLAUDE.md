# CLAUDE.md – VONUMO

Dauerhafte Regeln für jede Arbeit an diesem Repository. Gilt für alle künftigen Website-Änderungen.

## Rolle & Anspruch
Arbeite als Creative Developer, Art Director, Motion Designer und Senior Frontend Engineer auf Awwwards-Niveau.
Jede Seite soll sich anfühlen wie ein interaktiver Film – nicht wie eine Standard-Landingpage.
Die Bildsprache passt sich immer der jeweiligen Marke und ihrem Zweck an (VONUMO selbst: Techwear/HUD; Referenzen: eigene Welt).

## Gestaltungsregeln
- Keine generischen SaaS-Vorlagen, keine billigen Verläufe, kein übertriebenes Glühen, keine bedeutungslosen Karten, keine Zufallsanimationen, keine Emoji-Icons.
- Filmische, fotografische Bildkompositionen; viel Weißraum; anspruchsvolle Typografie; bewusstes Licht; redaktionelle Layouts.
- Jede Einstellung hat eine Achse, ein Licht, einen Gedanken. Bewegung erzählt – sie dekoriert nicht.
- Typografie: große, ruhige Headlines mit Maskenschnitt; kleine Versal-Metazeilen mit weiter Laufweite als Gegengewicht.

## Motion-Engine (bereits installiert – nicht doppelt installieren)
- `gsap` + `ScrollTrigger` für choreografierte Timelines, gepinnte Abschnitte, gescrubbte Szenen.
- `@gsap/react` → `useGSAP` mit `scope` verwenden; Aufräumen über den Context bzw. `gsap.matchMedia()` + `mm.revert()`.
- `lenis` läuft global in `app/components/SmoothScroll.tsx` und ist an den GSAP-Ticker gekoppelt
  (`lenis.on("scroll", ScrollTrigger.update)`, `gsap.ticker.add`, `lagSmoothing(0)`). Keine zweite Lenis-Instanz anlegen.
- `three` + `@react-three/fiber` + `@react-three/drei` nur, wenn echte 3D-Tiefe einen Mehrwert hat.
  Lässt sich ein Effekt mit CSS/GSAP (clip-path, transform, perspective) gleichwertig lösen, ohne WebGL bauen.
- Alle Scroll-Timelines müssen vollständig umkehrbar sein (scrub, keine einmaligen Callbacks für Zustände).
- `prefers-reduced-motion`: immer eine ruhige, vollständig lesbare Variante ohne Pin und ohne Fahrten liefern.
- Der globale Ladebildschirm (`Loader.tsx`) wartet auf das Event `vonumo:stage-ready`. Seiten ohne WebGL-Bühne senden es selbst
  und starten ihren Auftakt erst nach `vonumo:loaded` (Muster: `app/referenz/alpin/AlpineFilm.tsx`).

## Arbeitsablauf
1. Referenz in exakte Szenen und Übergänge zerlegen, benötigte Assets auflisten.
2. Erste Szene in hoher Qualität fertigstellen, bevor die nächste beginnt.
3. Jeden Übergang als eigene, umkehrbare GSAP-Timeline bauen.
4. Im Browser prüfen: Screenshots in Referenz-Viewport und an mehreren Scroll-Positionen, mit der Referenz vergleichen.
5. Komposition, Bilder, Abstände, Typografie und Timing nachschärfen.
6. Mobil, reduzierte Bewegung, Ladeleistung und Konsolenfehler testen.
7. Nie visuelle Genauigkeit behaupten, ohne das gerenderte Ergebnis gesehen zu haben.
   Fehlen Assets oder Testmöglichkeiten, das klar sagen statt ein fertiges Ergebnis vorzutäuschen.
8. Bestehende Funktionen (Formulare, `/api/contact`, Buchung, Rechtsseiten, 3D-Bühne) nie entfernen oder nebenbei umbauen.

## Git & Deployment
- Kein neuer Branch, kein neues Repository.
- Das Vercel-Projekt `vonumo-v2` baut Production aus dem Standard-Branch `claude/vonumo-improvement-afwz4k`
  (einen Branch `main` gibt es in diesem Repo nicht). Dorthin committen und pushen.
- Nach jeder Änderung: testen, klar benannter Commit, Push, Vercel-Deployment auf „Ready“ prüfen.

## Referenz „Alpin“ (`/referenz/alpin`)
Cineastische Beispiel-Sektion nach einer Chalet-Referenz („Chalets Cut From Light“ / „Rooms Tuned To Altitude“).
Szenen:
1. Außen – Vollbild-Chalet im Schnee, Titel steigt aus der Maske, Metazeile unten.
2. Übergang – gepinnte, gescrubbte Kamerafahrt (Scale um den Mittelpunkt der Glasfassade), Titel verlässt das Bild.
3. Innen – Innenraum öffnet sich per `clip-path` aus der Verglasung, zweiter Titel im Maskenschnitt.
4. Coda – redaktionelles Zwei-Spalten-Layout, Bild öffnet sich von unten.

Assets in `public/alpine/`: `exterior.svg`, `interior.svg` sind **Entwurfsplatten** (Storyboard-Niveau, keine Fotografie).
Für die finale Qualität durch Fotografie ersetzen (mind. 2560 px breit, 16:9, WebP/AVIF) und die Pfade in `PLATES` tauschen:
- Außen: Chalet frontal, Glasgiebel mittig auf ca. 50 % / 60 % der Bildfläche, blaue Stunde, warmes Innenlicht.
- Innen: Wohnraum mit Panoramafenster auf die Gipfel, gleiche Lichtstimmung.
Liegt die Glasfassade im Foto woanders, `GLASS` (Fahrtziel + Startmaske) anpassen.
