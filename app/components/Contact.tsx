"use client";
import { AnimatePresence, motion } from "motion/react";
import { contactSchema } from "@/lib/schema";
import { CONTACT } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";
import { useSubmit } from "./useSubmit";
import { Consent, Field, formToObject, Honeypot, StatusLine, SubmitButton, Success } from "./FormBits";

export function Contact() {
  const { status, errors, submit, setStatus } = useSubmit(contactSchema);
  return (
    <section id="kontakt" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <div className="relative overflow-hidden rounded-[2rem] border border-line bg-ink-2/70 p-6 sm:p-12">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-a1/25 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-a2/15 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-12 lg:grid-cols-2 [&>*]:min-w-0">
          <div>
            <SectionHead kicker="Kontakt" title={<>Wie können wir <span className="grad-text">helfen?</span></>} sub="Schreiben Sie uns – wir antworten innerhalb von zwei Werktagen." />
            <Reveal className="mt-10 space-y-4">
              <a href={`mailto:${CONTACT.email}`} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition-colors hover:bg-white/[0.03]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-a1/15 text-a1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg></span>
                <span className="min-w-0"><small className="block text-mute">E-Mail</small><b className="block truncate">{CONTACT.email}</b></span>
              </a>
              <a href={CONTACT.phoneHref} className="group flex items-center gap-4 rounded-2xl border border-line p-4 transition-colors hover:bg-white/[0.03]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-a2/15 text-a2"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" /></svg></span>
                <span><small className="block text-mute">Telefon</small><b>{CONTACT.phone}</b></span>
              </a>
            </Reveal>
          </div>
          <Reveal>
            <AnimatePresence mode="wait">
              {status.state === "ok" ? (
                <Success key="ok" title="Nachricht gesendet!" text="Danke für Ihre Nachricht – wir melden uns in Kürze." onReset={() => setStatus({ state: "idle" })} />
              ) : (
                <motion.form key="f" exit={{ opacity: 0 }} noValidate className="relative space-y-4"
                  onSubmit={async (e) => { e.preventDefault(); const f = e.currentTarget; if (await submit({ ...formToObject(f), kind: "kontakt" })) f.reset(); }}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" name="ct-name" error={errors.name}><input id="ct-name" name="name" autoComplete="name" maxLength={120} className="field" aria-invalid={!!errors.name} /></Field>
                    <Field label="E-Mail" name="ct-email" error={errors.email}><input id="ct-email" name="email" type="email" autoComplete="email" maxLength={254} className="field" aria-invalid={!!errors.email} /></Field>
                  </div>
                  <Field label="Telefon" name="ct-phone" optional><input id="ct-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="field" /></Field>
                  <Field label="Nachricht" name="ct-msg" error={errors.message}><textarea id="ct-msg" name="message" rows={4} maxLength={3000} className="field resize-y" aria-invalid={!!errors.message} /></Field>
                  <Honeypot />
                  <Consent error={errors.consent} />
                  <StatusLine status={status} />
                  <SubmitButton status={status}>Kontakt aufnehmen</SubmitButton>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
