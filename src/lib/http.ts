export async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(init.headers || {})
      },
      cache: 'no-store'
    })
    const text = await response.text()
    let body: any = null
    try { body = text ? JSON.parse(text) : null } catch { body = { raw: text.slice(0, 1000) } }
    return { ok: response.ok, status: response.status, body }
  } catch (error: any) {
    return { ok: false, status: 'error', body: { error: error?.message || 'fetch failed' } }
  } finally {
    clearTimeout(timer)
  }
}

export function compactNumber(value: any): string {
  const n = Number(value || 0)
  if (!Number.isFinite(n)) return '0'
  return Intl.NumberFormat('en-US', { notation: n >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(n)
}

export function pct(value: any): string {
  const n = Number(value)
  return Number.isFinite(n) ? `${n.toFixed(n % 1 ? 2 : 0)}%` : 'n/a'
}
