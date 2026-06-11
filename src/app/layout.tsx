import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'iTechSmart GTM Command Center',
  description: 'Internal analytics dashboard for iTechSmart sales, marketing, platform health, agents, and ProofLink.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
