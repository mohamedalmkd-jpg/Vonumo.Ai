import { z } from "zod";

const base = {
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(120),
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse an.").max(254),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
  consent: z.literal(true, { error: "Bitte stimmen Sie der Verarbeitung zu." }),
  website: z.string().max(0).optional(), // Honeypot – muss leer bleiben
};

export const bookingSchema = z.object({
  kind: z.literal("termin"),
  ...base,
  plan: z.enum(["Basic", "Business", "Premium", "Noch unsicher"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte wählen Sie ein Datum."),
  time: z.enum(["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"]),
});

export const contactSchema = z.object({
  kind: z.literal("kontakt"),
  ...base,
  message: z.string().trim().min(5, "Bitte schreiben Sie uns kurz, worum es geht.").max(3000),
});

export const requestSchema = z.discriminatedUnion("kind", [bookingSchema, contactSchema]);
export type RequestData = z.infer<typeof requestSchema>;
export const TIMES = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"] as const;
export const PLAN_OPTIONS = ["Basic", "Business", "Premium", "Noch unsicher"] as const;
