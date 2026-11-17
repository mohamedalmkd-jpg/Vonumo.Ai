import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { SmoothScroll } from "./components/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://vonumo.vercel.app"),
  title: { default: "VONUMO – 3D-Websites, UI/UX-Design und KI", template: "%s – VONUMO" },
  description:
    "VONUMO ist eine Digitalagentur für 3D-Websites, UI/UX-Design und KI-Lösungen. Beschreiben Sie Ihre Idee – wir bauen Ihre Website.",
  openGraph: {
    title: "VONUMO – Websites mit Tiefe. KI mit Wirkung.",
    description: "3D-Websites, UI/UX-Design und KI-Systeme für Unternehmen.",
    type: "website",
    locale: "de_DE",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="grain">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">
          Zum Inhalt springen
        </a>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
