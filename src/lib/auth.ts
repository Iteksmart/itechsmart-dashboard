import crypto from 'crypto'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'its_dashboard_jwt'

function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='), 'base64')
}

function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function getSecret(): string {
  return process.env.PASSPORT_JWT_SECRET || process.env.JWT_SECRET || ''
}

export function signDashboardJwt(payload: Record<string, unknown>, ttlSeconds = 8 * 60 * 60): string {
  const secret = getSecret()
  if (!secret) throw new Error('PASSPORT_JWT_SECRET missing')
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + ttlSeconds, aud: 'itechsmart-dashboard' }
  const data = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(body))}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest()
  return `${data}.${base64UrlEncode(sig)}`
}

export function verifyJwt(token: string | undefined): { ok: boolean; payload?: any; error?: string } {
  if (!token) return { ok: false, error: 'missing token' }
  const secret = getSecret()
  if (!secret) return { ok: false, error: 'PASSPORT_JWT_SECRET missing' }
  const parts = token.split('.')
  if (parts.length !== 3) return { ok: false, error: 'malformed token' }
  const expected = base64UrlEncode(crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest())
  try {
    if (!crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))) return { ok: false, error: 'bad signature' }
    const payload = JSON.parse(base64UrlDecode(parts[1]).toString('utf8'))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return { ok: false, error: 'expired token' }
    return { ok: true, payload }
  } catch (error: any) {
    return { ok: false, error: error?.message || 'invalid token' }
  }
}

export async function currentUserFromCookies() {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  return verifyJwt(token)
}

export function requestToken(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
}

export { COOKIE_NAME }
