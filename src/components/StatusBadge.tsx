import type { Severity } from '@/types'

const styles: Record<Severity, string> = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-red-200 bg-red-50 text-red-700',
  gray: 'border-slate-200 bg-slate-50 text-slate-600'
}

export function StatusBadge({ children, severity = 'gray' }: { children: React.ReactNode; severity?: Severity }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[severity]}`}>{children}</span>
}
