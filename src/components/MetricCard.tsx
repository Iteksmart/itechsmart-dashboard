import type { Metric } from '@/types'
import { StatusBadge } from './StatusBadge'

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-bold tracking-tight text-ink">{metric.value}</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">{metric.label}</div>
        </div>
        <StatusBadge severity={metric.severity || 'gray'}>{metric.severity || 'live'}</StatusBadge>
      </div>
      {metric.helper ? <p className="mt-3 text-sm text-muted">{metric.helper}</p> : null}
    </div>
  )
}
