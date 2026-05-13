export function Sparkline({
  values,
  width = 180,
  height = 40,
  gradientFrom = "#a78bfa",
  gradientTo = "#34d399",
}: {
  values: number[]
  width?: number
  height?: number
  gradientFrom?: string
  gradientTo?: string
}) {
  if (values.length === 0) {
    return (
      <svg width={width} height={height} className="opacity-30">
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#26262d" strokeWidth="1.5" strokeDasharray="3 4" />
      </svg>
    )
  }

  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const range = Math.max(1, max - min)
  const stepX = values.length > 1 ? width / (values.length - 1) : width

  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 6) - 3
    return [x, y] as [number, number]
  })

  // Smooth curve using simple bezier
  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x},${y}`
    const [px, py] = points[i - 1]
    const cx = (px + x) / 2
    return `${acc} Q ${cx},${py} ${cx},${(py + y) / 2} T ${x},${y}`
  }, "")

  const fillPath = `${path} L ${width},${height} L 0,${height} Z`
  const gid = `spark-${Math.random().toString(36).slice(2, 7)}`
  const sid = `spark-stroke-${Math.random().toString(36).slice(2, 7)}`

  const lastX = points[points.length - 1][0]
  const lastY = points[points.length - 1][1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientTo} stopOpacity="0.25" />
          <stop offset="100%" stopColor={gradientTo} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gid})`} />
      <path d={path} stroke={`url(#${sid})`} strokeWidth="1.8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      <circle cx={lastX} cy={lastY} r="3" fill={gradientTo} />
      <circle cx={lastX} cy={lastY} r="6" fill={gradientTo} opacity="0.25" />
    </svg>
  )
}
