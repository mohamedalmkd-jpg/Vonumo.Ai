export const CONTACT = {
  email: "almoakedmohammad@gmail.com",
  phone: "+49 159 06712485",
  phoneHref: "tel:+4915906712485",
};

export const NAV = [
  { href: "#leistungen", label: "Leistungen" },
  { href: "#build", label: "Live-Build" },
  { href: "#preise", label: "Preise" },
  { href: "#ablauf", label: "Ablauf" },
  { href: "#kontakt", label: "Kontakt" },
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
