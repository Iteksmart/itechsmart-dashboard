import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getPipelineBundle } from '@/lib/data'

export async function GET() {
  const { value, cache } = await cached('gtm:pipeline', 60, async () => ({ ok: true, pipeline: await getPipelineBundle() }))
  return NextResponse.json(value, { headers: { 'x-cache': cache, 'Cache-Control': 'no-store' } })
}
