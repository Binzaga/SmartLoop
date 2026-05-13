/**
 * Tiny inline SVG sparkline. Deterministic from a numeric series.
 * Used inside product cards to show 7d activity at a glance.
 */
export function Sparkline({
  values,
  width = 120,
  height = 28,
  stroke = "#5eead4",
}: {
  values: number[]
  width?: number
  height?: number
  stroke?: string
}) {
  if (values.length === 0) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#26262d" strokeWidth="1.5" />
      </svg>
    )
  }

  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const range = Math.max(1, max - min)
  const stepX = values.length > 1 ? width / (values.length - 1) : width

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const path = `M ${points.join(" L ")}`
  // Fill polygon under the line
  const fillPath = `${path} L ${width.toFixed(1)},${height} L 0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id="sl-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sl-spark-fill)" />
      <path d={path} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
