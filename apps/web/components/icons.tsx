/** Inline icon set, all 16x16 currentColor. Inspired by Phosphor / Lucide. */

type IconProps = { size?: number; className?: string }

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
})

export const IconSparkle = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 3v6m0 6v6M3 12h6m6 0h6" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconBolt = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
)

export const IconActivity = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

export const IconAlert = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
)

export const IconCheck = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="m5 13 4 4L19 7" />
  </svg>
)

export const IconRobot = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <rect x="3" y="8" width="18" height="12" rx="3" />
    <path d="M12 2v6" />
    <circle cx="9" cy="14" r="1" fill="currentColor" />
    <circle cx="15" cy="14" r="1" fill="currentColor" />
    <path d="M9 18h6" />
    <path d="M1 14h2M21 14h2" />
  </svg>
)

export const IconMessage = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

export const IconClock = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

export const IconArrowRight = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
)

export const IconSearch = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

export const IconThumbsUp = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L15 2c1.66 0 3 1.34 3 3v.88z" />
  </svg>
)

export const IconThumbsDown = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L9 22c-1.66 0-3-1.34-3-3v-.88z" />
  </svg>
)

export const IconChart = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 3v18h18" />
    <path d="m7 14 4-4 4 4 5-5" />
  </svg>
)

export const IconBrain = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 5a3 3 0 1 0-5.99.1A3 3 0 0 0 4 12a3 3 0 0 0 .19 5.5 3 3 0 0 0 5.81 1A3 3 0 0 0 12 21a3 3 0 0 0 2-1 3 3 0 0 0 5.81-1A3 3 0 0 0 20 12a3 3 0 0 0-2.01-6.9A3 3 0 0 0 12 5Z" />
    <path d="M12 5v16" />
  </svg>
)

export const IconHeart = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

export const IconShield = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
