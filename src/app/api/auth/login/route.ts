import { NextResponse } from 'next/server'
import { COOKIE_NAME, signDashboardJwt } from '@/lib/auth'
import { fetchJson } from '@/lib/http'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').trim()
  const password = String(body.password || '')
  const next = String(body.next || '/overview')
  const authUrl = process.env.PASSPORT_AUTH_URL || 'https://auth.itechsmart.dev'

  const paths = ['/api/auth/login', '/auth/login', '/api/login', '/login']
  for (const path of paths) {
    const upstream = await fetchJson(`${authUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }, 7000)
    const token = upstream.body?.token || upstream.body?.access_token || upstream.body?.jwt
    if (upstream.ok && token) {
      const res = NextResponse.json({ ok: true, next, source: 'suite-passport' })
      res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60 })
      return res
    }
  }

  const bootstrap = process.env.DASHBOARD_ADMIN_TOKEN || ''
  if (bootstrap && password === bootstrap) {
    const token = signDashboardJwt({ sub: email || 'djuane', role: 'admin', source: 'dashboard-bootstrap' }, 4 * 60 * 60)
    const res = NextResponse.json({ ok: true, next, source: 'dashboard-bootstrap', ttl_hours: 4 })
    res.cookies.set(COOKIE_NAME, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 4 * 60 * 60 })
    return res
  }

  return NextResponse.json({ ok: false, error: 'login failed' }, { status: 401 })
}
