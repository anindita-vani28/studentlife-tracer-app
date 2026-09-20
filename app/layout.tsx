import type { Metadata } from 'next'
import './globals.css'
import { WeatherAppShell } from '@/app/components/WeatherAppShell'

export const metadata: Metadata = {
  title: 'Aninditabk - Student Life AI Assistant',
  description: 'AI-powered study planner, mood-aware recommendations, and student life management by Aninditabk',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 text-gray-900">
        <WeatherAppShell>{children}</WeatherAppShell>
      </body>
    </html>
  )
}
