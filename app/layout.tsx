import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Detective incident.io - Collaborative Post-Mortem Investigation',
  description: 'A multi-player detective game for incident post-mortems that transforms incident data into collaborative investigations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-detective-cream">
        {children}
      </body>
    </html>
  )
}