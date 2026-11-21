const WORDS = ["3D-Websites", "UI/UX-Design", "KI-Systeme", "WebGL", "Motion", "DSGVO-konform", "Edge-Hosting", "Lighthouse 90+", "Made in Germany"];

export function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="relative border-y border-line bg-ink/70 py-3 backdrop-blur" role="marquee" aria-label={WORDS.join(", ")}>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-[marquee_32s_linear_infinite] items-center gap-6" aria-hidden="true">
          {row.map((w, i) => <span key={i} className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-mute">{w}<span className="h-1 w-1 bg-a2" /></span>)}
        </div>
      </div>
    </div>
  );
}
