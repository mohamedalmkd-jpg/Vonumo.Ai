import Link from "next/link";
import { Logo } from "./Logo";
import { Footer } from "./Footer";

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="label hover:text-fg">← Zur Startseite</Link>
        <Link href="/" className="flex items-center gap-2"><Logo className="h-6 w-6" /><span className="dot text-lg">VONUMO</span></Link>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <h1 className="dot text-5xl sm:text-6xl">{title}</h1>
        <div className="mt-10 space-y-8 text-[13px] leading-relaxed text-mute [&_h2]:mb-2 [&_h2]:text-[12px] [&_h2]:uppercase [&_h2]:tracking-[0.14em] [&_h2]:text-fg [&_p]:whitespace-pre-line">{children}</div>
      </main>
      <Footer />
    </>
  );
}
