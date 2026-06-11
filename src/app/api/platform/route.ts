import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { checkServices, getPlatformBundle } from '@/lib/data'

export async function GET() {
  const { value, cache } = await cached('gtm:platform', 30, async () => {
    const [platform, services] = await Promise.all([getPlatformBundle(), checkServices()])
    return { ok: true, platform, services }
  })
  return NextResponse.json(value, { headers: { 'x-cache': cache, 'Cache-Control': 'no-store' } })
}
