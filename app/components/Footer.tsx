import { CONTACT, NAV } from "@/lib/content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a href="/" className="flex items-center gap-2.5 font-extrabold tracking-[0.2em]"><Logo className="h-8 w-8" />VONUMO</a>
          <p className="mt-4 max-w-xs text-sm text-mute">Web, Design und KI aus Deutschland. Websites mit Tiefe – KI mit Wirkung.</p>
        </div>
        <nav aria-label="Fußzeile">
          <h2 className="font-mono text-xs uppercase tracking-widest text-mute">Seite</h2>
          <ul className="mt-4 space-y-2 text-sm">{NAV.map((n) => <li key={n.href}><a href={`/${n.href}`} className="hover:text-a2">{n.label}</a></li>)}</ul>
        </nav>
        <div>
          <h2 className="font-mono text-xs uppercase tracking-widest text-mute">Kontakt</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a href={`mailto:${CONTACT.email}`} className="break-all hover:text-a2">{CONTACT.email}</a></li>
            <li><a href={CONTACT.phoneHref} className="hover:text-a2">{CONTACT.phone}</a></li>
            <li><a href="/impressum" className="hover:text-a2">Impressum</a> · <a href="/datenschutz" className="hover:text-a2">Datenschutz</a></li>
          </ul>
        </div>
      </div>
      <div className="overflow-hidden" aria-hidden="true">
        <p className="grad-text -mb-[0.18em] select-none text-center text-[22vw] font-extrabold leading-none tracking-[-0.06em] opacity-20">VONUMO</p>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-mute">© {new Date().getFullYear()} VONUMO · Alle Rechte vorbehalten</p>
    </footer>
  );
}
