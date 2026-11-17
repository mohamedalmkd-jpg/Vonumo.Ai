"use client";
import { AnimatePresence, motion } from "motion/react";
import { contactSchema } from "@/lib/schema";
import { CONTACT } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";
import { useSubmit } from "./useSubmit";
import { Consent, Field, formToObject, Honeypot, StatusLine, SubmitButton, Success } from "./FormBits";
import { Icon } from "./Icon";

export function Contact() {
  const { status, errors, submit, setStatus } = useSubmit(contactSchema);
  return (
    <section id="kontakt" className="relative mx-auto max-w-[1400px] px-4 py-28 sm:px-6 sm:py-36">
      <div className="grid gap-10 lg:grid-cols-2 [&>*]:min-w-0">
        <div>
          <SectionHead index="09" label="Kontakt" title="Wie können wir helfen?" sub="Schreiben Sie uns – wir antworten innerhalb von zwei Werktagen." />
          <Reveal className="mt-10 grid gap-2">
            {[{ i: "mail", l: "E-Mail", v: CONTACT.email, h: `mailto:${CONTACT.email}` }, { i: "phone", l: "Telefon", v: CONTACT.phone, h: CONTACT.phoneHref }].map((c) => (
              <a key={c.l} href={c.h} className="hud brackets group flex items-center gap-4 p-4">
                <Icon name={c.i} size={20} className="text-mute transition-colors group-hover:text-a2" />
                <span className="min-w-0"><span className="label block">{c.l}</span><span className="block truncate text-[13px]">{c.v}</span></span>
                <span className="ml-auto text-mute transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </a>
            ))}
          </Reveal>
        </div>
        <Reveal className="min-w-0">
          <div className="hud brackets relative p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {status.state === "ok" ? (
                <Success key="ok" title="Gesendet." text="Danke für Ihre Nachricht – wir melden uns in Kürze." onReset={() => setStatus({ state: "idle" })} />
              ) : (
                <motion.form key="f" exit={{ opacity: 0 }} noValidate className="relative space-y-4"
                  onSubmit={async (e) => { e.preventDefault(); const f = e.currentTarget; if (await submit({ ...formToObject(f), kind: "kontakt" })) f.reset(); }}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Name" name="ct-name" error={errors.name}><input id="ct-name" name="name" autoComplete="name" maxLength={120} className="field" aria-invalid={!!errors.name} /></Field>
                    <Field label="E-Mail" name="ct-email" error={errors.email}><input id="ct-email" name="email" type="email" autoComplete="email" maxLength={254} className="field" aria-invalid={!!errors.email} /></Field>
                  </div>
                  <Field label="Telefon" name="ct-phone" optional><input id="ct-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="field" /></Field>
                  <Field label="Nachricht" name="ct-msg" error={errors.message}><textarea id="ct-msg" name="message" rows={4} maxLength={3000} className="field resize-y" aria-invalid={!!errors.message} /></Field>
                  <Honeypot />
                  <Consent error={errors.consent} />
                  <StatusLine status={status} />
                  <SubmitButton status={status}>Kontakt aufnehmen →</SubmitButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
