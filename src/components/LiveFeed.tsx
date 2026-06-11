export function LiveFeed({ items }: { items: Array<{ title: string; body?: string; time?: string; href?: string }> }) {
  return (
    <div className="divide-y divide-line rounded-lg border border-line bg-panel">
      {items.length ? items.map((item) => (
        <a key={`${item.title}-${item.time}`} href={item.href || '#'} target={item.href ? '_blank' : undefined} className="block px-4 py-3 hover:bg-slate-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-ink">{item.title}</div>
              {item.body ? <div className="mt-1 text-sm text-muted">{item.body}</div> : null}
            </div>
            {item.time ? <div className="whitespace-nowrap text-xs text-muted">{item.time}</div> : null}
          </div>
        </a>
      )) : <div className="px-4 py-6 text-sm text-muted">No live events available from this source yet.</div>}
    </div>
  )
}
