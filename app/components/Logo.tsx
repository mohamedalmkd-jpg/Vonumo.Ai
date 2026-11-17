export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M8 12h12l12 26 12-26h12L37 54H27z" fill="currentColor" />
      <path d="M8 12h12l12 26 12-26h12" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" transform="translate(0 -6)" />
    </svg>
  );
}
