import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getOutreachBundle } from '@/lib/data'

export async function GET() {
  const { value, cache } = await cached('gtm:outreach', 120, async () => ({ ok: true, outreach: await getOutreachBundle() }))
  return NextResponse.json(value, { headers: { 'x-cache': cache, 'Cache-Control': 'no-store' } })
}
