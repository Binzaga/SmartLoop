/**
 * Health score ring — circular progress with a gradient and a centered score.
 */
export function HealthRing({
  score,
  size = 80,
}: {
  score: number
  size?: number
}) {
  const stroke = 6
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - score / 100)

  const tone =
    score >= 80
      ? { color: "#10b981", glow: "rgba(16, 185, 129, 0.35)" }
      : score >= 60
        ? { color: "#f59e0b", glow: "rgba(245, 158, 11, 0.35)" }
        : { color: "#ef4444", glow: "rgba(239, 68, 68, 0.35)" }

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{ background: tone.glow }}
        aria-hidden="true"
      />
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`Health score ${score}`}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="#26262d"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={tone.color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums" style={{ color: tone.color }}>
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
          health
        </span>
      </div>
    </div>
  )
}
