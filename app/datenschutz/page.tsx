import type { Metadata } from "next";
import { LegalShell } from "../components/LegalShell";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function Datenschutz() {
  return (
    <LegalShell title="Datenschutzerklärung">
      <section><h2>1. Verantwortlicher</h2><p>{`[Vor- und Nachname], VONUMO\n[Straße und Hausnummer], [PLZ und Ort]\nTelefon: ${CONTACT.phone}\nE-Mail: ${CONTACT.email}`}</p></section>
      <section><h2>2. Hosting und Server-Logfiles</h2><p>Diese Website wird bei Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, USA) betrieben. Beim Aufruf der Seiten werden technisch notwendige Daten verarbeitet: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite und Browsertyp. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, unser berechtigtes Interesse an einem sicheren und stabilen Betrieb.</p></section>
      <section><h2>3. Kontaktaufnahme und Terminanfragen</h2><p>Wenn Sie uns per E-Mail, Telefon oder über ein Formular dieser Website kontaktieren, verarbeiten wir Ihre Angaben, um Ihre Anfrage zu bearbeiten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Formularangaben werden über den Versanddienst Resend (Plus Five Five, Inc., USA) per E-Mail an uns übermittelt und nicht in einer Datenbank dieser Website gespeichert. Zum Schutz vor Missbrauch wird Ihre IP-Adresse kurzzeitig im Arbeitsspeicher des Servers vorgehalten (Begrenzung der Anfragen) und nicht dauerhaft gespeichert. Wir löschen die Daten, sobald sie für die Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.</p></section>
      <section><h2>4. Schriftarten</h2><p>Die Schriftarten dieser Website werden lokal vom eigenen Server geladen. Dabei wird keine Verbindung zu Servern von Google hergestellt.</p></section>
      <section><h2>5. Cookies und Analyse</h2><p>Diese Website verwendet keine Cookies zu Analyse- oder Werbezwecken und setzt keine Tracking-Dienste ein.</p></section>
      <section><h2>6. Ihre Rechte</h2><p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO).</p></section>
      <section><h2>Stand</h2><p>November 2026</p></section>
    </LegalShell>
  );
}
