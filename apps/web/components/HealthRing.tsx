export function HealthRing({
  score,
  size = 96,
  showLabel = true,
}: {
  score: number
  size?: number
  showLabel?: boolean
}) {
  const stroke = 7
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - score / 100)

  const tone =
    score >= 80
      ? { from: "#34d399", to: "#10b981", text: "text-emerald-400", glow: "rgba(52,211,153,0.30)" }
      : score >= 60
        ? { from: "#fbbf24", to: "#f59e0b", text: "text-amber-400", glow: "rgba(251,191,36,0.30)" }
        : { from: "#f87171", to: "#ef4444", text: "text-red-400", glow: "rgba(248,113,113,0.30)" }

  const gradId = `health-grad-${score}-${size}`

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        aria-hidden
        className="absolute inset-0 rounded-full blur-2xl opacity-50"
        style={{ background: tone.glow }}
      />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative -rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tone.from} />
            <stop offset="100%" stopColor={tone.to} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-semibold tabular-nums tracking-tight ${tone.text}`}>{score}</span>
        {showLabel && (
          <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
            HEALTH
          </span>
        )}
      </div>
    </div>
  )
}
