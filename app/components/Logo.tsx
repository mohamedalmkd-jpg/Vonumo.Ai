export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg-v" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset=".5" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="rgb(255 255 255 / .05)" stroke="rgb(255 255 255 / .1)" />
      <path d="M14 16h9l9 22 9-22h9L36 50h-8z" fill="url(#lg-v)" />
    </svg>
  );
}
