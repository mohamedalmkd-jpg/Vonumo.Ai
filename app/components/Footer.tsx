import { CONTACT, NAV } from "@/lib/content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-ink/80 backdrop-blur">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a href="/" className="flex items-center gap-2"><Logo className="h-7 w-7" /><span className="dot text-xl">VONUMO</span></a>
          <p className="mt-4 max-w-xs text-[11px] uppercase leading-relaxed tracking-wide text-mute">Web, Design und KI aus Deutschland. Websites mit Tiefe – KI mit Wirkung.</p>
        </div>
        <nav aria-label="Fußzeile">
          <h2 className="label">Seite</h2>
          <ul className="mt-4 space-y-2 text-[11px] uppercase tracking-widest">{NAV.map((n) => <li key={n.href}><a href={`/${n.href}`} className="text-fg/80 hover:text-a2">{n.label}</a></li>)}</ul>
        </nav>
        <div>
          <h2 className="label">Kontakt</h2>
          <ul className="mt-4 space-y-2 text-[11px] uppercase tracking-widest">
            <li><a href={`mailto:${CONTACT.email}`} className="break-all normal-case text-fg/80 hover:text-a2">{CONTACT.email}</a></li>
            <li><a href={CONTACT.phoneHref} className="text-fg/80 hover:text-a2">{CONTACT.phone}</a></li>
            <li><a href="/impressum" className="text-fg/80 hover:text-a2">Impressum</a> · <a href="/datenschutz" className="text-fg/80 hover:text-a2">Datenschutz</a></li>
          </ul>
        </div>
      </div>
      <div className="overflow-hidden" aria-hidden="true">
        {/* rein dekorativ: per CSS-Inhalt, damit er nicht als (kontrastarmer) Text zählt */}
        <p data-text="VONUMO" className="dot -mb-[0.12em] select-none text-center text-[23vw] leading-none text-white/[0.06] before:content-[attr(data-text)]" />
      </div>
      <p className="label border-t border-line py-4 text-center">© {new Date().getFullYear()} VONUMO · Alle Rechte vorbehalten</p>
    </footer>
  );
}
