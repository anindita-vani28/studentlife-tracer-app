import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Student Life AI Assistant',
  description: 'Study planner, mood-aware recommendations, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
