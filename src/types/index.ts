export type Severity = 'green' | 'yellow' | 'red' | 'gray'

export interface Metric {
  label: string
  value: string | number
  helper?: string
  severity?: Severity
}

export interface AlertItem {
  title: string
  body: string
  severity: Exclude<Severity, 'gray'>
}

export interface ServiceStatus {
  name: string
  url: string
  ok: boolean
  status: number | string
  checked_at: string
}

export interface ScenarioStatus {
  id: string
  name: string
  status: string
  severity: Severity
  action_url: string
  last_run?: string
}
