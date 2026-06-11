import { queryJson } from './db'
import { fetchJson } from './http'
import type { AlertItem, ScenarioStatus, ServiceStatus } from '@/types'

const PLATFORM_API_URL = process.env.PLATFORM_API_URL || 'https://api.itechsmart.dev'
const VERIFY_URL = process.env.VERIFY_URL || 'https://verify.itechsmart.dev'
const AG2_URL = process.env.AG2_URL || 'https://ag2.itechsmart.dev'

export async function getPlatformBundle() {
  const [status, cmdb, twin, cert, pilot] = await Promise.all([
    fetchJson(`${PLATFORM_API_URL}/v1/status/live`, {}, 9000),
    fetchJson(`${PLATFORM_API_URL}/v1/knowledge-graph/cmdb/status`, {}, 9000),
    fetchJson(`${PLATFORM_API_URL}/api/v1/digital-twin/status`, {}, 9000),
    fetchJson(`${PLATFORM_API_URL}/api/v1/uaio-certification/status`, {}, 9000),
    fetchJson(`${PLATFORM_API_URL}/api/v1/pilot/metrics`, {}, 9000)
  ])
  return {
    status: status.body,
    cmdb: cmdb.body,
    twin: twin.body,
    certification: cert.body,
    pilot: pilot.body,
    checked_at: new Date().toISOString()
  }
}

export async function getProoflinkBundle() {
  const [stats, auditor] = await Promise.all([
    fetchJson(`${VERIFY_URL}/api/stats`, {}, 7000),
    fetchJson(`${PLATFORM_API_URL}/api/v1/verify/auditor-report`, {}, 9000)
  ])
  return {
    stats: stats.body,
    auditor: auditor.body,
    checked_at: new Date().toISOString()
  }
}

export async function getOutreachBundle() {
  const apiKey = process.env.APOLLO_API_KEY
  const headers: Record<string, string> = apiKey ? { 'x-api-key': apiKey, 'Content-Type': 'application/json' } : {}
  const [campaigns, contacts, messages, daily] = await Promise.all([
    apiKey ? fetchJson('https://api.apollo.io/v1/emailer_campaigns', { headers }, 9000) : Promise.resolve({ ok: false, body: { configured: false } }),
    apiKey ? fetchJson('https://api.apollo.io/v1/contacts/search', { method: 'POST', headers, body: JSON.stringify({ per_page: 10 }) }, 9000) : Promise.resolve({ ok: false, body: { configured: false } }),
    apiKey ? fetchJson('https://api.apollo.io/v1/emailer_messages', { headers }, 9000) : Promise.resolve({ ok: false, body: { configured: false } }),
    queryJson('select * from outreach_daily order by snapshot_date desc limit 14').catch(() => [])
  ])
  return {
    campaigns: campaigns.body,
    contacts: contacts.body,
    messages: messages.body,
    daily,
    configured: Boolean(apiKey),
    checked_at: new Date().toISOString()
  }
}

export async function getSocialBundle() {
  const scenarios: ScenarioStatus[] = [
    { id: '5300055', name: 'Image posts', status: 'active / verify Make API', severity: 'green', action_url: 'https://us2.make.com/2401426/scenarios/5300055/edit' },
    { id: '5299937', name: '24/7 Social Engine', status: 'blocked - FAL key + LinkedIn confirm', severity: 'red', action_url: 'https://us2.make.com/2401426/scenarios/5299937/edit' },
    { id: '5299959', name: 'ProofLink blast', status: 'blocked - LinkedIn/Slack confirm', severity: 'red', action_url: 'https://us2.make.com/2401426/scenarios/5299959/edit' },
    { id: '5299647', name: 'Apollo inbox watcher', status: 'broken - spam filter pending', severity: 'red', action_url: 'https://us2.make.com/2401426/scenarios/5299647/edit' }
  ]
  const makeConfigured = Boolean(process.env.MAKE_API_KEY)
  const slack = process.env.SLACK_BOT_TOKEN
    ? await fetchJson('https://slack.com/api/conversations.history?limit=20', { headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` } }, 9000)
    : { ok: false, body: { configured: false } }
  const n8n = await fetchJson('http://suite-n8n:5678/rest/workflows', {
    headers: process.env.N8N_API_KEY ? { 'X-N8N-API-KEY': process.env.N8N_API_KEY } : {}
  }, 7000)
  return { scenarios, makeConfigured, slack: slack.body, n8n: n8n.body, checked_at: new Date().toISOString() }
}

export async function getAgentsBundle() {
  const [ag2Health, ag2Incidents, hermes] = await Promise.all([
    fetchJson(`${AG2_URL}/api/v1/ag2/health`, {}, 9000),
    fetchJson(`${AG2_URL}/api/v1/ag2/incidents`, {}, 9000),
    fetchJson('http://djuane-ai:3202/api/v1/hermes/status', {}, 5000)
  ])
  return {
    ag2: ag2Health.body,
    incidents: ag2Incidents.body,
    hermes: hermes.body,
    checked_at: new Date().toISOString()
  }
}

export async function getPipelineBundle() {
  const [pilot, bookings, daily] = await Promise.all([
    fetchJson(`${PLATFORM_API_URL}/api/v1/pilot/metrics`, {}, 9000),
    fetchJson('http://djuane-ai:3202/api/v1/onboarding/pilot-pipeline', {}, 5000),
    queryJson('select * from platform_daily order by snapshot_date desc limit 14').catch(() => [])
  ])
  return { pilot: pilot.body, bookings: bookings.body, daily, checked_at: new Date().toISOString() }
}

export async function getAlerts(platform: any, prooflink: any, outreach: any): Promise<AlertItem[]> {
  const alerts: AlertItem[] = []
  const chainBreaks = Number(prooflink?.auditor?.chain_breaks ?? prooflink?.stats?.chain_breaks ?? 0)
  if (chainBreaks > 0) alerts.push({ severity: 'red', title: 'ProofLink chain break detected', body: `${chainBreaks} chain breaks require immediate audit.` })
  const containers = Number(platform?.status?.infrastructure?.containers_running ?? platform?.status?.containers_running ?? 0)
  if (containers && containers < 130) alerts.push({ severity: 'red', title: 'Container count below threshold', body: `${containers} containers running; expected at least 130.` })
  if (!outreach?.configured) alerts.push({ severity: 'yellow', title: 'Apollo API not configured', body: 'Outreach page will show cached/manual values until APOLLO_API_KEY is present.' })
  alerts.push({ severity: 'yellow', title: 'Carlos Casanova follow-up overdue', body: 'Forrester follow-up is past the June 1 reference date.' })
  if (!alerts.some((a) => a.severity === 'red')) alerts.push({ severity: 'green', title: 'Core systems operational', body: 'No red dashboard alert is active from live platform/proof data.' })
  return alerts
}

export async function checkServices(): Promise<ServiceStatus[]> {
  const services = [
    ['iTechSmart API', `${PLATFORM_API_URL}/v1/status/live`],
    ['ProofLink Verify', `${VERIFY_URL}/api/stats`],
    ['AG2', `${AG2_URL}/api/v1/ag2/health`],
    ['Digital Twin', `${PLATFORM_API_URL}/api/v1/digital-twin/status`],
    ['UAIO Certification', `${PLATFORM_API_URL}/api/v1/uaio-certification/status`],
    ['djuane-ai', 'http://djuane-ai:3202/health']
  ]
  const checked_at = new Date().toISOString()
  return Promise.all(services.map(async ([name, url]) => {
    const r = await fetchJson(url, {}, 5000)
    return { name, url, ok: r.ok, status: r.status, checked_at }
  }))
}
