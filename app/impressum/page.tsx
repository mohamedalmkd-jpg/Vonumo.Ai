import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <LegalShell title="Impressum">
      <section><h2>Angaben gemäß § 5 DDG</h2><p>{"[Vor- und Nachname]\nVONUMO\n[Straße und Hausnummer]\n[PLZ und Ort]\nDeutschland"}</p></section>
      <section><h2>Kontakt</h2><p>{`Telefon: ${CONTACT.phone}\nE-Mail: ${CONTACT.email}`}</p></section>
      <section><h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr., falls vorhanden]</p></section>
      <section><h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2><p>{"[Vor- und Nachname]\nAnschrift wie oben"}</p></section>
      <section><h2>Verbraucherstreitbeilegung</h2><p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p></section>
    </LegalShell>
  );
}
