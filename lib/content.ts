export const CONTACT = {
  email: "almoakedmohammad@gmail.com",
  phone: "+49 159 06712485",
  phoneHref: "tel:+4915906712485",
};

export const NAV = [
  { href: "#arbeiten", label: "Arbeiten" },
  { href: "#leistungen", label: "Leistungen" },
  { href: "#ebenen", label: "Technologie" },
  { href: "#preise", label: "Preise" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt" },
] as const;

export const DETAILS = [
  { icon: "bolt", title: "Performance", text: "Ziel: Lighthouse 90+. 3D und Bilder laden erst, wenn sie gebraucht werden – ausgeliefert über ein weltweites Edge-Netzwerk." },
  { icon: "shield", title: "Sicherheit", text: "HTTPS, Sicherheits-Header, Spam-Schutz und Rate-Limiting. Schlüssel liegen nur auf dem Server – nie im Browser." },
  { icon: "lock", title: "DSGVO-konform", text: "Keine Tracking-Cookies, Schriften lokal geladen, Einwilligung vor jeder Verarbeitung. Impressum und Datenschutz inklusive." },
  { icon: "code", title: "Sauberer Code", text: "Typisiert, versioniert in Git, modular. Der Code gehört Ihnen – vollständig und ohne Abhängigkeit von uns." },
  { icon: "spark", title: "KI, die mitarbeitet", text: "Assistenten und Automatisierung, die Ihre Abläufe kennen und Ihrem Team jeden Tag Zeit schenken." },
] as const;

export const CARDS = [
  { kind: "knot", color: "#33e1ff", title: "3D-Websites", tag: "WebGL · Motion", from: "ab 49 €", text: "Echte 3D-Szenen, flüssig bis aufs Smartphone." },
  { kind: "box", color: "#ff4fa8", title: "UI/UX-Design", tag: "Figma · System", from: "ab 49 €", text: "Oberflächen, die Besucher zu Kunden machen." },
  { kind: "blob", color: "#c4ff3d", title: "KI-Systeme", tag: "Assistent · Automatik", from: "ab 199 €", text: "Chatbots und Automationen mit echtem Nutzen." },
  { kind: "capsule", color: "#ff6a2a", title: "Wartung & Hosting", tag: "Backups · Updates", from: "inklusive", text: "Wir halten alles schnell, sicher und aktuell." },
] as const;

export const FAQ = [
  { q: "Wie lange dauert ein Projekt?", a: "Vom ersten Termin bis zum Livegang meist 2–4 Wochen. Größere Projekte mit individuellen 3D-Szenen planen wir gemeinsam im Beratungsgespräch." },
  { q: "Gehört mir die Website?", a: "Ja. Code, Inhalte und Domain gehören Ihnen. Sie können jederzeit mit allem umziehen – ohne Lock-in." },
  { q: "Kann ich Inhalte selbst ändern?", a: "Je nach Paket sind monatliche Änderungen inklusive. Auf Wunsch richten wir ein einfaches Redaktionssystem ein." },
  { q: "Läuft 3D auch auf dem Handy?", a: "Ja. Wir passen Auflösung und Effekte automatisch an das Gerät an, pausieren unsichtbare Szenen und respektieren „reduzierte Bewegung“." },
  { q: "Wie funktioniert die Kündigung?", a: "Monatliche Pakete sind monatlich kündbar. Jahrespakete laufen 12 Monate und sparen 20 %." },
  { q: "Was kostet das Beratungsgespräch?", a: "Nichts. 30 Minuten per Video oder Telefon, unverbindlich – mit einer ehrlichen Einschätzung zu Aufwand und Paket." },
] as const;

export const SERVICES = [
  { tag: "</>", title: "3D-Websites", text: "Echtes WebGL, flüssige Bewegung, blitzschnelle Ladezeit – Websites, an die man sich erinnert." },
  { tag: "{ }", title: "UI/UX-Design", text: "Klare Oberflächen und Nutzerführung, die Besucher zu Kunden machen – getestet auf jedem Gerät." },
  { tag: "fn()", title: "KI-Lösungen", text: "Assistenten, Chatbots und Automatisierungen, die Ihrem Team jeden Tag Zeit schenken." },
] as const;

export const LAYERS = [
  { key: "bg", title: "Das Fundament", tag: "Hintergrund", text: "Farbe, Licht und Tiefe setzen die Stimmung. Der Hintergrund trägt Ihre Marke, noch bevor ein einziges Wort gelesen wird." },
  { key: "nav", title: "Die Orientierung", tag: "Navigation", text: "Wer sich zurechtfindet, bleibt. Eine ruhige, eindeutige Navigation führt Besucher ohne Umwege ans Ziel." },
  { key: "img", title: "Der erste Blick", tag: "Bild", text: "Bilder, 3D und Video erzählen in einer Sekunde, wofür Sie stehen – optimiert, damit nichts bremst." },
  { key: "Aa", title: "Die Stimme", tag: "Typografie", text: "Schrift mit Charakter macht Ihre Botschaft lesbar und unverwechselbar – auf dem Handy wie am Monitor." },
  { key: "btn", title: "Der Moment", tag: "Interaktion", text: "Jeder Klick fühlt sich gut an: Mikro-Animationen und klares Feedback führen zur Anfrage." },
] as const;

export const FEATURES = [
  { tag: "#!", title: "Sicher & DSGVO-konform", text: "HTTPS, Sicherheits-Header, Spam-Schutz und keine Tracker. Schlüssel liegen nur auf dem Server." },
  { tag: "=>", title: "Bewegung ohne Ruckeln", text: "60 fps auch auf dem Smartphone: GPU-Shader, die pausieren, sobald sie nicht sichtbar sind." },
  { tag: "ai;", title: "KI, die mitarbeitet", text: "Assistenten und Automatisierung, die Ihre Abläufe kennen – und Ihrem Team Arbeit abnehmen." },
  { tag: ">>", title: "Performance", text: "Ziel: Lighthouse 90+ und grüne Core Web Vitals. Ausgeliefert über ein weltweites Edge-Netzwerk." },
  { tag: "{ }", title: "Sauberer Code", text: "Versioniert in Git, typisiert, modular. Der Code gehört Ihnen – vollständig." },
  { tag: "§", title: "Zugänglich & auffindbar", text: "Semantisches HTML, Tastaturbedienung, „reduzierte Bewegung“ und saubere Metadaten für Google." },
] as const;

export type Plan = { name: string; monthly: number; yearly: number; sub: string; popular?: boolean; items: string[] };
export const PLANS: Plan[] = [
  { name: "Basic", monthly: 49, yearly: 39, sub: "Für den professionellen Start.", items: ["Website bis 5 Seiten", "Hosting, SSL & eigene Domain", "Wartung & Sicherheits-Updates", "Tägliche Backups", "1 Inhaltsänderung pro Monat", "E-Mail-Support (48 h)"] },
  { name: "Business", monthly: 99, yearly: 79, sub: "Für Unternehmen, die wachsen wollen.", popular: true, items: ["Alles aus Basic", "Website bis 15 Seiten", "3D- & Motion-Elemente", "Kontaktformular mit Benachrichtigung", "SEO-Grundoptimierung", "5 Änderungen pro Monat", "Support innerhalb 24 h & Monatsbericht"] },
  { name: "Premium", monthly: 199, yearly: 159, sub: "Das volle Studio für Ihre Marke.", items: ["Alles aus Business", "Unbegrenzte Seiten", "Individuelle 3D-Szenen", "KI-Assistent für Ihre Kunden", "Kundenkonto & Login", "Priorisierter Support (4 h)", "Performance-Überwachung rund um die Uhr"] },
];

export const STEPS = [
  { title: "Termin & Beratung", text: "30 Minuten, kostenlos – wir verstehen Ihr Ziel.", time: "Tag 1" },
  { title: "Konzept & Design", text: "Struktur, Look und erste Entwürfe zum Anfassen.", time: "Woche 1" },
  { title: "Entwicklung", text: "Wir bauen – Sie sehen jeden Fortschritt live per Vorschau-Link.", time: "Woche 2–3" },
  { title: "Abnahme durch Sie", text: "Feinschliff, bis alles passt.", time: "Woche 3" },
  { title: "Livegang & Wartung", text: "Online gehen – und wir kümmern uns weiter.", time: "Woche 4" },
] as const;

export const STACK = ["Next.js", "React", "TypeScript", "WebGL / GLSL", "Motion", "Tailwind CSS", "Vercel", "GitHub"] as const;

/**
 * Showroom: Designstudien aus dem VONUMO-Studio (keine Kundenprojekte – so auch auf der Seite gekennzeichnet).
 * Bilder entstehen aus scripts/mockups/*.html über scripts/render-mockups.cjs.
 */
export const WORK = [
  { slug: "aera", name: "ÆRA", kind: "Uhrenmanufaktur", headline: "Zeit, präzise geformt.", text: "Ein ruhiger, dunkler Shop für Luxusuhren: große Serifen, viel Raum und Produktbilder, die wie im Schaufenster wirken.", services: ["Webdesign", "E-Commerce", "Art Direction"], accent: "#d8c3a0" },
  { slug: "kora", name: "Kōra", kind: "Gesundheits-App", headline: "Dein Körper. Klar erklärt.", text: "Daten von Uhr, Ring und Waage in einer Oberfläche, die man in drei Sekunden versteht – App-Design und Website aus einem System.", services: ["UI/UX-Design", "Designsystem", "Website"], accent: "#ff6b3d" },
  { slug: "mythos", name: "Mythos", kind: "Kaffeerösterei", headline: "Geröstet für den Moment.", text: "Marke, Verpackung und Shop mit Abo-Funktion – warm, handwerklich und schnell genug für den Kauf am Handy.", services: ["Branding", "Webdesign", "Shop & Abo"], accent: "#b5532d" },
  { slug: "pilot", name: "Pilot", kind: "KI-Software", headline: "Ihr Team. Mit Autopilot.", text: "Landingpage und Produktoberfläche für einen KI-Assistenten – erklärt komplexe Technik in einem Satz und einer Demo.", services: ["KI-Integration", "Produktdesign", "Entwicklung"], accent: "#8f7dff" },
] as const;

/** Die fünf Disziplinen des interaktiven Leistungsbereichs. Preise wie in PLANS/CARDS. */
export const DISCIPLINES = [
  { key: "design", title: "Webdesign", tag: "Art Direction · Konzept", from: "in jedem Paket ab 49 €/Monat", text: "Gestaltung, die Ihre Marke unverwechselbar macht: Typografie, Bildsprache und Bewegung aus einem Guss – kein Baukasten, kein Template.", points: ["Individuelles Design", "Motion & Micro-Interaktionen", "Responsive bis 390 px"] },
  { key: "dev", title: "Entwicklung", tag: "Next.js · React · Edge", from: "in jedem Paket ab 49 €/Monat", text: "Schneller, sauberer Code mit Next.js und TypeScript. Ziel: Lighthouse 90+, ausgeliefert über ein weltweites Edge-Netzwerk.", points: ["Lighthouse 90+", "DSGVO & Sicherheit", "Code gehört Ihnen"] },
  { key: "ux", title: "UI/UX-Design", tag: "Figma · Designsystem", from: "ab 49 €", text: "Oberflächen und Nutzerführung, die Besucher zu Kunden machen – getestet auf jedem Gerät, dokumentiert als Designsystem.", points: ["Nutzerführung", "Prototypen in Figma", "Designsystem"] },
  { key: "3d", title: "3D-Websites", tag: "WebGL · Three.js", from: "ab 49 €", text: "Echte 3D-Szenen und Kamerafahrten, flüssig bis aufs Smartphone. Ihre Produkte zum Drehen, Ihre Marke zum Betreten.", points: ["Echtzeit-3D", "Scroll-Kamerafahrten", "Mobil optimiert"] },
  { key: "ai", title: "KI-Lösungen", tag: "Assistent · Automatik", from: "ab 199 €", text: "Chatbots, Assistenten und Automationen, die Ihre Abläufe kennen und Ihrem Team jeden Tag Zeit schenken – DSGVO-konform.", points: ["KI-Assistent", "Automatisierung", "EU-Hosting"] },
] as const;
