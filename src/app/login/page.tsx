'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function LoginForm() {
  const params = useSearchParams()
  const [email, setEmail] = useState('djuane@itechsmart.dev')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const next = params.get('next') || '/overview'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, next })
    })
    const data = await response.json()
    setBusy(false)
    if (!response.ok) {
      setError(data.error || 'Login failed')
      return
    }
    window.location.href = data.next || '/overview'
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-5">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-2xl font-black text-ink">iTechSmart</div>
          <div className="text-sm font-semibold uppercase tracking-wide text-brand">GTM Command Center</div>
          <p className="mt-3 text-sm text-muted">Sign in with suite-passport credentials. Bootstrap admin token is accepted only server-side when configured.</p>
        </div>
        <label className="block text-sm font-semibold text-ink">Email</label>
        <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <label className="mt-4 block text-sm font-semibold text-ink">Password or dashboard token</label>
        <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error ? <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        <button disabled={busy} className="focus-ring mt-5 w-full rounded-md bg-brand px-4 py-2 font-semibold text-white disabled:opacity-60">{busy ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-5"><div className="text-sm text-muted">Loading sign in...</div></main>}>
      <LoginForm />
    </Suspense>
  )
}
