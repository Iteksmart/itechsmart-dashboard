import type { AlertItem } from '@/types'

const styles = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  yellow: 'border-amber-200 bg-amber-50 text-amber-900',
  red: 'border-red-200 bg-red-50 text-red-900'
}

export function AlertBanner({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={`${alert.severity}-${alert.title}`} className={`rounded-lg border px-4 py-3 ${styles[alert.severity]}`}>
          <div className="text-sm font-bold">{alert.title}</div>
          <div className="mt-1 text-sm opacity-80">{alert.body}</div>
        </div>
      ))}
    </div>
  )
}
