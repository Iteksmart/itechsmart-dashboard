import { NextResponse } from 'next/server'
import { cached } from '@/lib/cache'
import { getProoflinkBundle } from '@/lib/data'

export async function GET() {
  const { value, cache } = await cached('gtm:prooflink', 60, async () => ({ ok: true, prooflink: await getProoflinkBundle() }))
  return NextResponse.json(value, { headers: { 'x-cache': cache, 'Cache-Control': 'no-store' } })
}
