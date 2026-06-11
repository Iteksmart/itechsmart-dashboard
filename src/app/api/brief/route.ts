import { NextResponse } from 'next/server'
import { getAgentsBundle, getOutreachBundle, getPlatformBundle, getProoflinkBundle } from '@/lib/data'

export async function POST() {
  const [platform, outreach, agents, prooflink] = await Promise.all([
    getPlatformBundle(),
    getOutreachBundle(),
    getAgentsBundle(),
    getProoflinkBundle()
  ])
  const context = JSON.stringify({ platform, outreach, agents, prooflink }, null, 2).slice(0, 18000)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      source: 'local-analysis-no-anthropic-key',
      brief: [
        'Claude API key is not configured for the dashboard container, so this is a deterministic local brief.',
        `Platform checked at ${platform.checked_at}.`,
        'Priority order: protect ProofLink integrity, fix Apollo/Make blockers, convert pilot bookings into first revenue, and keep compliance caveats explicit.',
        'Configure ANTHROPIC_API_KEY to enable live Claude analysis from this button.'
      ].join('\n')
    })
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: 'You are DJuane Jackson’s evidence-first GTM operations advisor at iTechSmart Inc. Be concise, direct, and never invent metrics.',
      messages: [{ role: 'user', content: context }]
    })
  })
  const data = await response.json()
  return NextResponse.json({ ok: response.ok, source: 'anthropic', brief: data?.content?.[0]?.text || data })
}
