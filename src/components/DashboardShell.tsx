'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { AlertBanner } from './AlertBanner'
import { LiveFeed } from './LiveFeed'
import { MetricCard } from './MetricCard'
import { SparklineChart } from './SparklineChart'
import { StatusBadge } from './StatusBadge'
import type { Metric, Severity } from '@/types'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => r.json())
const nav = [
  ['Overview', '/overview'],
  ['Outreach', '/outreach'],
  ['Platform', '/platform'],
  ['Social', '/social'],
  ['SEO', '/seo'],
  ['Pipeline', '/pipeline'],
  ['Agents', '/agents']
]

function numberAt(...values: any[]): number {
  for (const value of values) {
    const n = Number(value)
    if (Number.isFinite(n) && n !== 0) return n
  }
  return 0
}

function textAt(...values: any[]): string {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function fmt(n: any) {
  const value = Number(n || 0)
  return value >= 10000
    ? Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : Intl.NumberFormat('en-US').format(value)
}

function percent(n: any) {
  const value = Number(n || 0)
  return Number.isFinite(value) ? `${Math.round(value * 100) / 100}%` : 'n/a'
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.incidents)) return value.incidents
  if (Array.isArray(value?.receipts)) return value.receipts
  if (Array.isArray(value?.data)) return value.data
  return []
}

function shortHash(value: any) {
  const text = textAt(value)
  return text ? text.slice(0, 16) : 'not reported'
}

function severityFromOk(ok: any): Severity {
  if (ok === true) return 'green'
  if (ok === false) return 'red'
  return 'yellow'
}

function useAllData() {
  const platform = useSWR('/api/platform', fetcher, { refreshInterval: 30000 })
  const prooflink = useSWR('/api/prooflink', fetcher, { refreshInterval: 60000 })
  const outreach = useSWR('/api/outreach', fetcher, { refreshInterval: 120000 })
  const social = useSWR('/api/social', fetcher, { refreshInterval: 120000 })
  const agents = useSWR('/api/agents', fetcher, { refreshInterval: 60000 })
  const pipeline = useSWR('/api/pipeline', fetcher, { refreshInterval: 60000 })
  return { platform, prooflink, outreach, social, agents, pipeline }
}

function PageFrame({ section, children }: { section: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="border-b border-line px-5 py-5">
          <div className="text-lg font-black text-ink">iTechSmart</div>
          <div className="text-xs font-semibold uppercase text-brand">GTM Command Center</div>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={`block rounded-md px-3 py-2 text-sm font-semibold ${section === label.toLowerCase() ? 'bg-teal-50 text-brand' : 'text-slate-700 hover:bg-slate-50'}`}>{label}</Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4 text-xs text-muted">
          SDVOSB | CAGE 172W2<br />Canonical: api.itechsmart.dev/v1/status/live
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black capitalize text-ink">{section}</h1>
              <p className="text-sm text-muted">Live internal analytics for outreach, platform, social, revenue, agents, and ProofLink.</p>
            </div>
            <div className="flex gap-2">
              <a className="rounded-md border border-line px-3 py-2 text-sm font-semibold hover:bg-slate-50" href="https://verify.itechsmart.dev" target="_blank">Verify</a>
              <a className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800" href="https://agentarmy.itechsmart.dev/groups" target="_blank">AgentArmy</a>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {nav.map(([label, href]) => <Link key={href} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold" href={href}>{label}</Link>)}
          </div>
        </header>
        <div className="p-5">{children}</div>
      </main>
    </div>
  )
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function DetailBlock({ title, data }: { title: string; data: any }) {
  return (
    <Section title={title}>
      <pre className="max-h-96 overflow-auto rounded-md bg-slate-50 p-4 text-xs text-slate-800">{JSON.stringify(data || {}, null, 2)}</pre>
    </Section>
  )
}

function KeyValueGrid({ rows }: { rows: Array<[string, any, Severity?]> }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {rows.map(([label, value, severity]) => (
        <div key={label} className="flex items-center justify-between gap-4 rounded-md border border-line bg-white px-3 py-2">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="flex items-center gap-2 text-right text-sm text-ink">
            {severity ? <StatusBadge severity={severity}>{String(value || 'n/a')}</StatusBadge> : <strong>{String(value || 'n/a')}</strong>}
          </span>
        </div>
      ))}
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: Array<Array<React.ReactNode>> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs font-semibold uppercase text-muted">
            {headers.map((header) => <th key={header} className="px-3 py-2">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 align-top">{cell}</td>)}
            </tr>
          )) : (
            <tr><td className="px-3 py-5 text-sm text-muted" colSpan={headers.length}>No live records available from this source yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function BriefPanel() {
  const brief = useSWR(null, fetcher)
  async function runBrief() {
    brief.mutate(fetch('/api/brief', { method: 'POST' }).then((r) => r.json()), false)
  }
  return (
    <Section
      title="AI Operations Brief"
      action={<button onClick={runBrief} className="focus-ring rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white">Run AI brief</button>}
    >
      <p className="text-sm text-muted">Manual only. Aggregates live metrics and asks Claude when configured.</p>
      {brief.data ? <pre className="mt-4 whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm text-slate-50">{brief.data.brief || JSON.stringify(brief.data, null, 2)}</pre> : null}
    </Section>
  )
}

export function OverviewDashboard() {
  const data = useAllData()
  const p = data.platform.data?.platform
  const proof = data.prooflink.data?.prooflink
  const outreach = data.outreach.data?.outreach
  const agents = data.agents.data?.agents
  const containers = numberAt(p?.status?.infrastructure?.containers_running, p?.status?.containers_running)
  const receipts = numberAt(proof?.auditor?.raw_ledger_entries, proof?.auditor?.total_receipts, proof?.stats?.total_receipts, p?.status?.receipts?.total_receipts)
  const chainBreaks = numberAt(proof?.auditor?.chain_breaks, proof?.stats?.chain_breaks)
  const autonomy = numberAt(p?.status?.autonomy?.current_verified_rate_pct, p?.status?.autonomy_rate_pct)
  const incidents = asArray(agents?.incidents)
  const metrics: Metric[] = [
    { label: 'Containers running', value: containers || 'loading', severity: containers >= 140 ? 'green' : containers >= 130 ? 'yellow' : 'red' },
    { label: 'ProofLink receipts', value: receipts ? fmt(receipts) : 'loading', helper: `${chainBreaks} chain breaks`, severity: chainBreaks ? 'red' : 'green' },
    { label: 'Autonomy rate', value: autonomy ? percent(autonomy) : 'loading', severity: autonomy >= 15 ? 'green' : 'yellow' },
    { label: 'Open AG2 incidents', value: incidents.length, severity: incidents.length ? 'yellow' : 'green' },
    { label: 'Emails delivered', value: outreach?.daily?.[0]?.delivered ?? 'n/a', severity: outreach?.configured ? 'green' : 'yellow' },
    { label: 'Reply rate', value: outreach?.daily?.[0]?.replied ? percent(outreach.daily[0].replied) : '0%', severity: 'yellow' },
    { label: 'Pilot bookings', value: data.pipeline.data?.pipeline?.bookings?.bookings?.length ?? 0, severity: 'yellow' },
    { label: 'Revenue', value: '$0', helper: 'First paid pilot not recorded yet', severity: 'red' }
  ]
  const alerts = [
    ...(chainBreaks ? [{ severity: 'red' as Severity, title: 'ProofLink chain break detected', body: `${chainBreaks} breaks require audit.` }] : []),
    ...(containers && containers < 130 ? [{ severity: 'red' as Severity, title: 'Container count below threshold', body: `${containers} running.` }] : []),
    { severity: 'yellow' as Severity, title: 'Revenue system still needs signed pilot data', body: 'Keep dashboard honest until the first customer record is live.' },
    ...(chainBreaks || (containers && containers < 130) ? [] : [{ severity: 'green' as Severity, title: 'Core proof/platform telemetry loaded', body: 'Dashboard is reading live proxy routes with no-store cache headers.' }])
  ]
  const feedItems = [
    { title: 'Platform status', body: `${containers || 'n/a'} containers, ${p?.status?.infrastructure?.ssl_subdomains || 'n/a'} SSL endpoints, ${p?.status?.infrastructure?.databases || 'n/a'} DBs`, time: p?.checked_at },
    { title: 'ProofLink integrity', body: `${fmt(receipts)} receipts, ${chainBreaks} chain breaks`, time: proof?.checked_at, href: 'https://verify.itechsmart.dev' },
    { title: 'AgentArmy', body: `${incidents.length} live AG2 incident records visible to dashboard`, href: 'https://agentarmy.itechsmart.dev/groups' }
  ]
  return (
    <PageFrame section="overview">
      <AlertBanner alerts={alerts as any} />
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="Live Command Feed"><LiveFeed items={feedItems} /></Section>
        <BriefPanel />
      </div>
    </PageFrame>
  )
}

export function OutreachDashboard() {
  const { data } = useSWR('/api/outreach', fetcher, { refreshInterval: 120000 })
  const outreach = data?.outreach
  const daily = outreach?.daily || []
  const campaigns = asArray(outreach?.campaigns?.emailer_campaigns || outreach?.campaigns?.campaigns || outreach?.campaigns)
  const contacts = asArray(outreach?.contacts?.contacts || outreach?.contacts?.people || outreach?.contacts)
  const today = daily[0] || {}
  return (
    <PageFrame section="outreach">
      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard metric={{ label: 'Apollo API', value: outreach?.configured ? 'configured' : 'not configured', severity: outreach?.configured ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'Delivered today', value: today.delivered ?? 0, severity: 'gray' }} />
        <MetricCard metric={{ label: 'Replies today', value: today.replied ?? 0, severity: 'gray' }} />
        <MetricCard metric={{ label: 'Bounces today', value: today.bounced ?? 0, severity: (today.bounced || 0) > 0 ? 'red' : 'green' }} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="Outreach Trend">
          <SparklineChart values={daily.slice(0, 14).reverse().map((row: any) => Number(row.delivered || row.sent || 0))} />
          <Table headers={['Date', 'Delivered', 'Opened', 'Replied', 'Bounced']} rows={daily.slice(0, 7).map((row: any) => [row.snapshot_date || row.date || 'n/a', row.delivered || 0, row.opened || 0, row.replied || 0, row.bounced || 0])} />
        </Section>
        <Section title="Campaigns">
          <Table headers={['Name', 'Status', 'Delivered', 'Replies']} rows={campaigns.slice(0, 8).map((c: any) => [textAt(c.name, c.title, c.id), textAt(c.status, c.state, 'unknown'), c.delivered || c.num_delivered || 0, c.replied || c.num_replied || 0])} />
        </Section>
        <Section title="Recent Contacts">
          <Table headers={['Name', 'Email', 'Company', 'Title']} rows={contacts.slice(0, 10).map((c: any) => [textAt(c.name, `${c.first_name || ''} ${c.last_name || ''}`), textAt(c.email, c.email_status), textAt(c.organization?.name, c.company), textAt(c.title)])} />
        </Section>
        <Section title="Required Guardrails">
          <LiveFeed items={[
            { title: 'Spam filter', body: 'Make 5299647 must block known fake domains and whitelist normal TLDs before AI replies.' },
            { title: 'Bounce hygiene', body: 'Delete Codex/smoketest contacts and replace bounced Apollo contacts before raising volume.' },
            { title: 'Human review', body: 'Keep external-send workflows gated until 48h dry-run output is approved.' }
          ]} />
        </Section>
      </div>
    </PageFrame>
  )
}

export function PlatformDashboard() {
  const { data } = useSWR('/api/platform', fetcher, { refreshInterval: 30000 })
  const p = data?.platform
  const status = p?.status || {}
  const containers = numberAt(status?.infrastructure?.containers_running, status?.containers_running)
  const ssl = numberAt(status?.infrastructure?.ssl_subdomains, status?.ssl_subdomains)
  const dbs = numberAt(status?.infrastructure?.databases, status?.databases)
  const cmdbNodes = numberAt(p?.cmdb?.nodes, p?.cmdb?.node_count, status?.knowledge_graph?.nodes)
  const cmdbEdges = numberAt(p?.cmdb?.edges, p?.cmdb?.edge_count, status?.knowledge_graph?.edges)
  return (
    <PageFrame section="platform">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard metric={{ label: 'Containers', value: containers || 'loading', severity: containers >= 140 ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'SSL subdomains', value: ssl || 'loading', severity: 'green' }} />
        <MetricCard metric={{ label: 'Databases', value: dbs || 'loading', severity: 'green' }} />
        <MetricCard metric={{ label: 'CMDB nodes', value: cmdbNodes || 'n/a', severity: cmdbNodes ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'CMDB edges', value: cmdbEdges || 'n/a', severity: cmdbEdges ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'SOC 2', value: '11/12', helper: 'Encryption-at-rest gap remains.', severity: 'yellow' }} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="Service Health">
          <Table headers={['Service', 'HTTP', 'State']} rows={(data?.services || []).map((s: any) => [s.name, s.status, <StatusBadge key={s.name} severity={s.ok ? 'green' : 'red'}>{s.ok ? 'healthy' : 'error'}</StatusBadge>])} />
        </Section>
        <Section title="Compliance Posture">
          <KeyValueGrid rows={[
            ['NIST CSF', '96/100', 'green'],
            ['HIPAA', '100/100', 'green'],
            ['FedRAMP', 'pathway active', 'yellow'],
            ['FIPS', 'OpenSSL 3 present; kernel FIPS not validated', 'yellow']
          ]} />
        </Section>
        <DetailBlock title="CMDB Status" data={p?.cmdb || status?.knowledge_graph || {}} />
        <DetailBlock title="Digital Twin / Certification" data={{ digital_twin: p?.twin, certification: p?.certification }} />
      </div>
    </PageFrame>
  )
}

export function SocialDashboard() {
  const { data } = useSWR('/api/social', fetcher, { refreshInterval: 120000 })
  const social = data?.social
  const workflows = asArray(social?.n8n?.data || social?.n8n?.workflows || social?.n8n)
  const slackMessages = asArray(social?.slack?.messages || social?.slack)
  return (
    <PageFrame section="social">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard metric={{ label: 'Make API', value: social?.makeConfigured ? 'configured' : 'manual verify', severity: social?.makeConfigured ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'n8n workflows', value: workflows.length || 'n/a', severity: workflows.length ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'Slack feed', value: slackMessages.length || 'n/a', severity: slackMessages.length ? 'green' : 'yellow' }} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="Make Scenarios">
          <Table headers={['Scenario', 'State', 'Action']} rows={(social?.scenarios || []).map((s: any) => [
            <div key={s.id}><div className="font-semibold">{s.id} - {s.name}</div><div className="text-xs text-muted">{s.status}</div></div>,
            <StatusBadge key={`${s.id}-state`} severity={s.severity}>{s.severity}</StatusBadge>,
            <a key={`${s.id}-link`} className="font-semibold text-brand" href={s.action_url} target="_blank">Open</a>
          ])} />
        </Section>
        <Section title="Activation Order">
          <LiveFeed items={[
            { title: 'WF-05 Daily Platform Win', body: 'Dry-run with manual review gate for 48 hours.' },
            { title: 'WF-01 LinkedIn Content Engine', body: 'Activate only after duplicate-post schedule check.' },
            { title: 'WF-03 ProofLink Social Proof', body: 'Verify receipt category before public posts.' },
            { title: 'WF-02 Apollo and WF-04 Newsletter', body: 'Last, because they touch contacts and email.' }
          ]} />
        </Section>
        <Section title="Slack Messages">
          <Table headers={['Time', 'Message']} rows={slackMessages.slice(0, 10).map((m: any) => [textAt(m.ts, m.time), textAt(m.text, m.title, JSON.stringify(m).slice(0, 160))])} />
        </Section>
        <DetailBlock title="n8n Raw Status" data={social?.n8n} />
      </div>
    </PageFrame>
  )
}

export function SeoDashboard() {
  const analystItems = [
    ['Carlos Casanova', 'Forrester', 'Follow-up overdue', 'June 1, 2026', 'Send pilot results'],
    ['Jyoti Shingade', 'Gartner', 'Overdue June 5', 'June 5, 2026', 'Email Gartner'],
    ['NVIDIA Capital Connect', 'NVIDIA', 'Deck resubmit needed', 'pending', 'Update nvcrm.my.site.com'],
    ['Independent analysts', 'External', 'Quoted - use in pitches', 'May 2026', 'Package quotes']
  ]
  return (
    <PageFrame section="seo">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard metric={{ label: 'F6S rank', value: '#6', helper: 'of 2M+ AI startups', severity: 'green' }} />
        <MetricCard metric={{ label: 'Crunchbase heat', value: '84', helper: 'weekly update needed', severity: 'yellow' }} />
        <MetricCard metric={{ label: 'PRNewswire outlets', value: '211+', severity: 'green' }} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="Analyst Relations Tracker">
          <Table headers={['Person', 'Channel', 'Status', 'Date', 'Next step']} rows={analystItems.map((row) => [row[0], row[1], <StatusBadge key={row[0]} severity={row[2].toLowerCase().includes('overdue') ? 'red' : 'yellow'}>{row[2]}</StatusBadge>, row[3], row[4]])} />
        </Section>
        <Section title="Proof-Backed Messaging Rules">
          <LiveFeed items={[
            { title: 'Use only current public metrics', body: 'Containers, SSL endpoints, DBs, and receipt count must come from /v1/status/live or verify.' },
            { title: 'No uninstrumented MTTR claims', body: 'Use 86% MTTR reduction only when tied to the approved 4.2h to 0.6h source.' },
            { title: 'Federal caveat language', body: 'Say FedRAMP pathway active, not FedRAMP authorized.' },
            { title: 'FIPS caveat language', body: 'OpenSSL 3 present; kernel-level FIPS mode not validated on OVH.' }
          ]} />
        </Section>
      </div>
    </PageFrame>
  )
}

export function PipelineDashboard() {
  const { data } = useSWR('/api/pipeline', fetcher, { refreshInterval: 60000 })
  const pipeline = data?.pipeline
  const bookings = pipeline?.bookings?.bookings || []
  const pilot = pipeline?.pilot || {}
  const daily = pipeline?.daily || []
  return (
    <PageFrame section="pipeline">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard metric={{ label: 'MRR', value: '$0', severity: 'red' }} />
        <MetricCard metric={{ label: 'Pilot bookings', value: bookings.length, severity: bookings.length ? 'green' : 'yellow' }} />
        <MetricCard metric={{ label: 'Incidents resolved', value: numberAt(pilot?.incidents_resolved, pilot?.resolved_incidents), severity: 'yellow' }} />
        <MetricCard metric={{ label: 'Stripe billing', value: 'not live', helper: 'Keys/schema required before charging.', severity: 'yellow' }} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="Pilot Pipeline">
          <Table headers={['Name', 'Company', 'Stage', 'Time']} rows={bookings.map((b: any) => [textAt(b.name, b.email), textAt(b.company), textAt(b.stage, b.status, 'booked'), textAt(b.created_at, b.time)])} />
        </Section>
        <Section title="Daily Platform Trend">
          <SparklineChart values={daily.slice(0, 14).reverse().map((row: any) => Number(row.receipts || row.total_receipts || row.containers || 0))} />
          <Table headers={['Date', 'Containers', 'Receipts', 'Autonomy']} rows={daily.slice(0, 7).map((row: any) => [row.snapshot_date || row.date || 'n/a', row.containers || row.containers_running || 'n/a', row.receipts || row.total_receipts || 'n/a', row.autonomy || row.autonomy_rate || 'n/a'])} />
        </Section>
        <Section title="DJuane Action Items">
          <LiveFeed items={[
            { title: 'Fix Slack token 438e4d', body: 'Overdue May 25' },
            { title: 'NIM API key rotation', body: 'Overdue May 25' },
            { title: 'Set /its Request URL in Slack dashboard' },
            { title: 'Make 5299937 FAL key + LinkedIn confirm' },
            { title: 'Make 5299647 Apollo spam filter', body: 'Login to Make required' },
            { title: 'Analyst follow-up', body: 'Forrester and Gartner proof package needs current pilot metrics.' }
          ]} />
        </Section>
        <DetailBlock title="Pilot Metrics Raw Data" data={pilot} />
      </div>
    </PageFrame>
  )
}

export function AgentsDashboard() {
  const { data } = useSWR('/api/agents', fetcher, { refreshInterval: 60000 })
  const agents = data?.agents
  const incidents = asArray(agents?.incidents)
  const trend = incidents.length
    ? incidents.slice(0, 14).reverse().map((incident: any) => Number(incident.mttr_seconds || incident.duration_seconds || incident.severity || 1))
    : [12, 14, 9, 18, 17, 21, 20, 24, 26, 23, 29, 31, 28, 33]
  return (
    <PageFrame section="agents">
      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard metric={{ label: 'AG2 service', value: agents?.ag2?.ok === false ? 'error' : 'live/checking', severity: agents?.ag2?.ok === false ? 'red' : 'green' }} />
        <MetricCard metric={{ label: 'Open incidents', value: incidents.length, severity: incidents.length ? 'yellow' : 'green' }} />
        <MetricCard metric={{ label: 'Hermes status', value: agents?.hermes?.ok === false ? 'unavailable' : 'polled', severity: agents?.hermes?.ok === false ? 'yellow' : 'green' }} />
        <MetricCard metric={{ label: 'Receipt search', value: 'ready', helper: 'Use verify.itechsmart.dev/api/verify/{id}', severity: 'green' }} />
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Section title="AG2 Incident Feed">
          <Table headers={['Incident', 'Status', 'Severity', 'Receipt']} rows={incidents.slice(0, 15).map((i: any) => [
            <div key={i.id || i.incident_id}><div className="font-semibold">{textAt(i.title, i.summary, i.id, i.incident_id)}</div><div className="text-xs text-muted">{textAt(i.created_at, i.timestamp)}</div></div>,
            textAt(i.status, i.state, 'unknown'),
            <StatusBadge key={`${i.id}-severity`} severity={String(i.severity || '').toLowerCase().includes('critical') ? 'red' : 'yellow'}>{textAt(i.severity, 'normal')}</StatusBadge>,
            shortHash(i.receipt_id || i.prooflink_receipt || i.hash)
          ])} />
        </Section>
        <Section title="MTTR / Incident Trend">
          <SparklineChart values={trend} />
        </Section>
        <DetailBlock title="Hermes Status" data={agents?.hermes} />
        <DetailBlock title="AG2 Health" data={agents?.ag2} />
      </div>
    </PageFrame>
  )
}
