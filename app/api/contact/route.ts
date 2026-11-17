import { NextResponse } from "next/server";
import { requestSchema, type RequestData } from "@/lib/schema";

// Einfaches Rate-Limit pro Instanz (5 Anfragen / 10 Min. pro IP).
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000, LIMIT = 5;
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > LIMIT;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function render(d: RequestData) {
  const rows: [string, string][] = [["Art", d.kind === "termin" ? "Terminanfrage" : "Kontaktanfrage"], ["Name", d.name], ["E-Mail", d.email]];
  if (d.phone) rows.push(["Telefon", d.phone]);
  if (d.kind === "termin") rows.push(["Paket", d.plan], ["Wunschtermin", `${d.date} um ${d.time} Uhr`]);
  if (d.message) rows.push(["Nachricht", d.message]);
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<table cellpadding="6">${rows.map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`;
  return { text, html };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }, { status: 429 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Ungültige Anfrage." }, { status: 400 }); }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    // Honeypot ausgefüllt → still „erfolgreich“ antworten, damit Bots nichts lernen.
    if (fields.website) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: "Bitte prüfen Sie Ihre Angaben.", fields }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY, to = process.env.CONTACT_TO, from = process.env.CONTACT_FROM;
  if (!key || !to || !from) {
    return NextResponse.json({ ok: false, error: "Der Formularversand ist noch nicht eingerichtet.", fallback: true }, { status: 503 });
  }

  const d = parsed.data;
  const { text, html } = render(d);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], reply_to: d.email, subject: `${d.kind === "termin" ? "Terminanfrage" : "Kontakt"}: ${d.name}`, text, html }),
  }).catch(() => null);

  if (!res?.ok) return NextResponse.json({ ok: false, error: "Senden fehlgeschlagen.", fallback: true }, { status: 502 });
  return NextResponse.json({ ok: true });
}
