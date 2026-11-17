"use client";
import { AnimatePresence, motion } from "motion/react";
import { CONTACT } from "@/lib/content";
import type { Status } from "./useSubmit";

export function Field({ label, name, error, optional, children, className = "" }: { label: string; name: string; error?: string; optional?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`} htmlFor={name}>
      <span className="mb-1.5 block text-sm font-medium">{label}{optional && <small className="ml-1 text-mute">(optional)</small>}</span>
      {children}
      <AnimatePresence>
        {error && <motion.span id={`${name}-err`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1 block text-xs text-red-400">{error}</motion.span>}
      </AnimatePresence>
    </label>
  );
}

export function Honeypot() {
  return <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />;
}

export function Consent({ error }: { error?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-mute">
      <input type="checkbox" name="consent" aria-invalid={!!error} className="mt-0.5 h-4 w-4 shrink-0 accent-[#7c5cff]" />
      <span>Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden (<a href="/datenschutz" target="_blank" className="underline decoration-a1 underline-offset-2 hover:text-fg">Datenschutz</a>).{error && <b className="block font-normal text-red-400">{error}</b>}</span>
    </label>
  );
}

export function SubmitButton({ status, children }: { status: Status; children: React.ReactNode }) {
  const sending = status.state === "sending";
  return (
    <button type="submit" disabled={sending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
      {sending ? (
        <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M21 12a9 9 0 11-6.2-8.56" /></svg>Wird gesendet …</>
      ) : children}
    </button>
  );
}

export function StatusLine({ status }: { status: Status }) {
  return (
    <p role="status" aria-live="polite" className="min-h-5 text-sm">
      {status.state === "error" && (
        <span className="text-red-400">
          {status.msg}
          {status.fallback && <> Schreiben Sie uns direkt: <a className="underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></>}
        </span>
      )}
    </p>
  );
}

export function Success({ title, text, onReset }: { title: string; text: string; onReset: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center py-10 text-center" role="status">
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.1 }} className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-a2 to-a1 shadow-[0_0_60px_-10px_rgb(124_92_255)]">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.45 }} /></svg>
      </motion.span>
      <h3 className="mt-6 text-2xl font-bold">{title}</h3>
      <p className="mt-2 max-w-sm text-mute">{text}</p>
      <button type="button" onClick={onReset} className="btn btn-ghost mt-6 text-sm">Neue Anfrage</button>
    </motion.div>
  );
}

export function formToObject(form: HTMLFormElement) {
  const fd = new FormData(form);
  const o: Record<string, unknown> = Object.fromEntries(fd.entries());
  o.consent = fd.get("consent") === "on";
  return o;
}
