import Link from "next/link";
import { Logo } from "./Logo";
import { Footer } from "./Footer";

export function LegalShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-sm text-mute hover:text-fg">← Zur Startseite</Link>
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-[0.2em]"><Logo className="h-7 w-7" />VONUMO</Link>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-5 pb-20 pt-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <div className="mt-10 space-y-8 leading-relaxed text-mute [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-fg [&_p]:whitespace-pre-line">{children}</div>
      </main>
      <Footer />
    </>
  );
}
