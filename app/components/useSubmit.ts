"use client";
import { useState } from "react";
import type { ZodType } from "zod";

export type Status = { state: "idle" | "sending" | "ok" | "error"; msg?: string; fallback?: boolean };

export function useSubmit<T>(schema: ZodType<T>) {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(data: unknown) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      setStatus({ state: "error", msg: "Bitte prüfen Sie die markierten Felder." });
      return false;
    }
    setErrors({});
    setStatus({ state: "sending" });
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { setStatus({ state: "ok" }); return true; }
      if (j.fields) setErrors(j.fields);
      setStatus({ state: "error", msg: j.error ?? "Senden fehlgeschlagen.", fallback: !!j.fallback });
    } catch {
      setStatus({ state: "error", msg: "Keine Verbindung. Bitte versuchen Sie es erneut.", fallback: true });
    }
    return false;
  }
  return { status, errors, submit, setStatus };
}
