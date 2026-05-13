/** SmartLoop brand mark — a flowing loop with aurora gradient stroke. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SmartLoop"
    >
      <defs>
        <linearGradient id="sl-brand-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <radialGradient id="sl-brand-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Glow */}
      <circle cx="16" cy="16" r="14" fill="url(#sl-brand-glow)" />
      {/* Outer loop with twist */}
      <path
        d="M 16 5 C 22 5 27 9 27 16 C 27 22 22 27 16 27 C 10 27 5 23 5 17 C 5 13 8 10 12 10 C 15 10 17 12 17 15"
        stroke="url(#sl-brand-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center dot */}
      <circle cx="16" cy="16" r="2.2" fill="url(#sl-brand-grad)" />
    </svg>
  )
}
