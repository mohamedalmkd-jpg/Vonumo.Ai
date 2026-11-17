import type { MetadataRoute } from "next";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vonumo.vercel.app";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/impressum", "/datenschutz"].map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly", priority: p ? 0.3 : 1 }));
}
