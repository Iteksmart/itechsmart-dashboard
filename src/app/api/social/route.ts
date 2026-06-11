import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getSocialBundle } from '@/lib/data'

export async function GET() {
  const { value, cache } = await cached('gtm:social', 120, async () => ({ ok: true, social: await getSocialBundle() }))
  return NextResponse.json(value, { headers: { 'x-cache': cache, 'Cache-Control': 'no-store' } })
}
