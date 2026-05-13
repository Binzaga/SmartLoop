/** SmartLoop brand mark — a stylised loop with a gradient stroke. */
export function BrandMark({ size = 28 }: { size?: number }) {
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
        <linearGradient id="sl-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b7cff" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
      </defs>
      {/* Outer loop */}
      <path
        d="M16 4 C24 4 28 10 28 16 C28 22 24 28 16 28 C8 28 4 22 4 16"
        stroke="url(#sl-grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Inner accent dot */}
      <circle cx="16" cy="16" r="2.6" fill="url(#sl-grad)" />
    </svg>
  )
}
