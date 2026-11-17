"use client";
import { AnimatePresence, motion } from "motion/react";
import { CONTACT } from "@/lib/content";
import type { Status } from "./useSubmit";

export function Field({ label, name, error, optional, children, className = "" }: { label: string; name: string; error?: string; optional?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`} htmlFor={name}>
      <span className="label mb-1.5 block">{label}{optional && <span className="text-dim"> (optional)</span>}</span>
      {children}
      <AnimatePresence>
        {error && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-[11px] uppercase tracking-wide text-[#ff5d5d]">{error}</motion.span>}
      </AnimatePresence>
    </label>
  );
}

export function Honeypot() {
  return <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />;
}

export function Consent({ error }: { error?: string }) {
  return (
    <label className="flex items-start gap-3 text-[11px] uppercase leading-relaxed tracking-wide text-mute">
      <input type="checkbox" name="consent" aria-invalid={!!error} className="mt-0.5 h-4 w-4 shrink-0 accent-[#4f6bff]" />
      <span>Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden (<a href="/datenschutz" target="_blank" className="text-fg underline underline-offset-2">Datenschutz</a>).{error && <b className="block font-normal text-[#ff5d5d]">{error}</b>}</span>
    </label>
  );
}

export function SubmitButton({ status, children }: { status: Status; children: React.ReactNode }) {
  const sending = status.state === "sending";
  return (
    <button type="submit" disabled={sending} className="btn btn-solid w-full disabled:opacity-60 sm:w-auto">
      {sending ? <>Wird gesendet <span className="animate-[blink_1s_steps(1)_infinite]">_</span></> : children}
    </button>
  );
}

export function StatusLine({ status }: { status: Status }) {
  return (
    <p role="status" aria-live="polite" className="min-h-4 text-[11px] uppercase tracking-wide">
      {status.state === "error" && (
        <span className="text-[#ff5d5d]">{status.msg}{status.fallback && <> Schreiben Sie uns direkt: <a className="text-fg underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></>}</span>
      )}
    </p>
  );
}

export function Success({ title, text, onReset }: { title: string; text: string; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center py-12 text-center" role="status">
      <span className="grid h-14 w-14 place-items-center bg-lime text-ink"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.45 }} /></svg></span>
      <h3 className="dot mt-6 text-4xl">{title}</h3>
      <p className="mt-3 max-w-sm text-[11px] uppercase leading-relaxed tracking-wide text-mute">{text}</p>
      <button type="button" onClick={onReset} className="btn mt-6">Neue Anfrage</button>
    </motion.div>
  );
}

export function formToObject(form: HTMLFormElement) {
  const fd = new FormData(form);
  const o: Record<string, unknown> = Object.fromEntries(fd.entries());
  o.consent = fd.get("consent") === "on";
  return o;
}
