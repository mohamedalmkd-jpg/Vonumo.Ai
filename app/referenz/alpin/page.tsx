import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { AlpineFilm } from "./AlpineFilm";

// Wird beim Build heruntergeladen und lokal ausgeliefert – keine Verbindung zu Google im Browser.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: "Referenz Alpin – Chalets Cut From Light",
  description: "Cineastische Scroll-Referenz: Kamerafahrt in ein Chalet, Maskenschnitte und redaktionelle Typografie.",
  robots: { index: false, follow: true },
};

export default function AlpinPage() {
  return (
    <main id="main" className="relative z-10">
      <AlpineFilm serif={serif.className} />
    </main>
  );
}
