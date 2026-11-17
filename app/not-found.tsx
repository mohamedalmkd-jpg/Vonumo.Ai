import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center px-5 text-center">
      <div>
        <p className="grad-text font-mono text-8xl font-extrabold">404</p>
        <h1 className="mt-4 text-2xl font-bold">Diese Seite gibt es nicht.</h1>
        <Link href="/" className="btn btn-primary mt-8">Zur Startseite</Link>
      </div>
    </main>
  );
}
