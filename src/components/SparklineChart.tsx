export function SparklineChart({ values }: { values: number[] }) {
  const safe = values.length ? values : [0, 0]
  const max = Math.max(...safe, 1)
  const points = safe.map((v, i) => `${(i / Math.max(safe.length - 1, 1)) * 100},${40 - (v / max) * 36}`).join(' ')
  return (
    <svg viewBox="0 0 100 44" className="h-16 w-full" role="img" aria-label="trend sparkline">
      <polyline fill="none" stroke="#0f766e" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
