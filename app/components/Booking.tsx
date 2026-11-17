"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { bookingSchema, PLAN_OPTIONS, TIMES } from "@/lib/schema";
import { Reveal, SectionHead } from "./Reveal";
import { useSubmit } from "./useSubmit";
import { Consent, Field, formToObject, Honeypot, StatusLine, SubmitButton, Success } from "./FormBits";

/** Nächste 10 Werktage als Auswahl – schneller als ein Datumsfeld, besonders am Handy. */
type Day = { iso: string; wd: string; d: string; m: string };
function useDays() {
  const [days, setDays] = useState<Day[]>([]);
  // Erst im Browser berechnen – sonst wären die Tage auf den Build-Zeitpunkt eingefroren.
  useEffect(() => setDays(nextWorkdays()), []);
  return days;
}
function nextWorkdays(): Day[] {
  {
    const out: Day[] = [];
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (out.length < 10) {
      const day = d.getDay();
      if (day !== 0 && day !== 6) {
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        out.push({ iso, wd: d.toLocaleDateString("de-DE", { weekday: "short" }), d: String(d.getDate()), m: d.toLocaleDateString("de-DE", { month: "short" }) });
      }
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
}

export function Booking() {
  const days = useDays();
  const [plan, setPlan] = useState<string>("Business");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("14:00");
  const { status, errors, submit, setStatus } = useSubmit(bookingSchema);

  useEffect(() => {
    const on = (e: Event) => setPlan((e as CustomEvent<string>).detail);
    window.addEventListener("vonumo:plan", on);
    return () => window.removeEventListener("vonumo:plan", on);
  }, []);

  const chip = (on: boolean) => `relative rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${on ? "border-a1 bg-a1/15 text-fg" : "border-line text-mute hover:border-white/20 hover:text-fg"}`;

  return (
    <section id="termin" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] [&>*]:min-w-0">
        <div>
          <SectionHead kicker="Termin buchen" title={<>Kostenloses <span className="grad-text">Beratungsgespräch</span>.</>} sub="30 Minuten per Video oder Telefon. Wir melden uns innerhalb von zwei Werktagen mit einer Bestätigung." />
          <Reveal className="mt-8 space-y-3 text-sm text-mute">
            {["Unverbindlich & kostenlos", "Konkrete Einschätzung zu Aufwand und Paket", "Keine Weitergabe Ihrer Daten"].map((t) => (
              <p key={t} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-a2/15 text-a2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>{t}</p>
            ))}
          </Reveal>
        </div>

        <Reveal className="min-w-0">
          <div className="glass relative rounded-3xl p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {status.state === "ok" ? (
                <Success key="ok" title="Anfrage gesendet!" text="Danke! Wir bestätigen Ihren Termin innerhalb von zwei Werktagen per E-Mail." onReset={() => setStatus({ state: "idle" })} />
              ) : (
                <motion.form key="form" exit={{ opacity: 0 }} noValidate className="relative space-y-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const ok = await submit({ ...formToObject(e.currentTarget), kind: "termin", plan, date, time });
                    if (ok) e.currentTarget?.reset?.();
                  }}>
                  <fieldset className="min-w-0">
                    <legend className="mb-2 text-sm font-medium">Paket</legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {PLAN_OPTIONS.map((p) => (
                        <button key={p} type="button" aria-pressed={plan === p} onClick={() => setPlan(p)} className={chip(plan === p)}>{p}</button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="min-w-0">
                    <legend className="mb-2 text-sm font-medium">Wunschtermin</legend>
                    {days.length === 0 && <div className="h-[76px] animate-pulse rounded-2xl bg-white/[0.03]" />}
                    <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]" data-lenis-prevent>
                      {days.map((d) => (
                        <button key={d.iso} type="button" aria-pressed={date === d.iso} aria-label={`${d.wd} ${d.d}. ${d.m}`} onClick={() => setDate(d.iso)}
                          className={`flex w-16 shrink-0 snap-start flex-col items-center rounded-2xl border py-2.5 transition-colors ${date === d.iso ? "border-a1 bg-a1/15" : "border-line hover:border-white/20"}`}>
                          <span className="text-[11px] uppercase text-mute">{d.wd}</span>
                          <span className="text-xl font-bold">{d.d}</span>
                          <span className="text-[11px] text-mute">{d.m}</span>
                        </button>
                      ))}
                    </div>
                    {errors.date && <span className="mt-1 block text-xs text-red-400">{errors.date}</span>}
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {TIMES.map((t) => <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={`${chip(time === t)} font-mono`}>{t}</button>)}
                    </div>
                  </fieldset>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" name="bk-name" error={errors.name}><input id="bk-name" name="name" autoComplete="name" maxLength={120} className="field" aria-invalid={!!errors.name} /></Field>
                    <Field label="E-Mail" name="bk-email" error={errors.email}><input id="bk-email" name="email" type="email" autoComplete="email" maxLength={254} className="field" aria-invalid={!!errors.email} /></Field>
                    <Field label="Telefon" name="bk-phone" optional error={errors.phone}><input id="bk-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} className="field" /></Field>
                    <Field label="Ihr Vorhaben" name="bk-msg" optional className="sm:col-span-2"><textarea id="bk-msg" name="message" rows={3} maxLength={3000} placeholder="z. B. neue Firmenwebsite mit 3D-Startseite" className="field resize-y" /></Field>
                  </div>
                  <Honeypot />
                  <Consent error={errors.consent} />
                  <StatusLine status={status} />
                  <SubmitButton status={status}>Termin anfragen</SubmitButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
