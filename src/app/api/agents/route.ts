import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getAgentsBundle } from '@/lib/data'

export async function GET() {
  const { value, cache } = await cached('gtm:agents', 60, async () => ({ ok: true, agents: await getAgentsBundle() }))
  return NextResponse.json(value, { headers: { 'x-cache': cache, 'Cache-Control': 'no-store' } })
}
