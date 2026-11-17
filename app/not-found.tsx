import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[100svh] place-items-center px-5 text-center">
      <div>
        <p className="dot text-[10rem] leading-none">404</p>
        <h1 className="label mt-4">Diese Seite gibt es nicht.</h1>
        <Link href="/" className="btn btn-solid mt-8">Zur Startseite</Link>
      </div>
    </main>
  );
}
