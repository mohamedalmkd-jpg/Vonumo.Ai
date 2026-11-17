import { FEATURES, STACK } from "@/lib/content";
import { Reveal, SectionHead } from "./Reveal";
import { SpotCard } from "./Services";

export function Features() {
  return (
    <section id="fundament" className="relative mx-auto max-w-6xl px-5 py-28 sm:px-6 sm:py-36">
      <SectionHead center kicker="Unser Fundament" title={<>Leistungsstarkes <span className="grad-text">Studio</span>.</>} sub="Die Basis jedes VONUMO-Projekts – schön, schnell und für alle nutzbar." />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.07}>
            <SpotCard className="!p-6">
              <span className="font-mono text-sm text-a2">{f.tag}</span>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">{f.text}</p>
            </SpotCard>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14">
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-label="Technische Grundlagen">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-3 hover:[animation-play-state:paused]">
            {[...STACK, ...STACK].map((s, i) => (
              <span key={i} aria-hidden={i >= STACK.length || undefined} className="rounded-full border border-line bg-white/[0.03] px-4 py-2 font-mono text-sm text-mute">{s}</span>
            ))}
          </div>
        </div>
        <style>{`@keyframes marquee{to{transform:translateX(-50%)}}`}</style>
      </Reveal>
    </section>
  );
}
