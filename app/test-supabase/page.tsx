'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Testing connection...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setError(`Error: ${error.message}`)
          setStatus('Connection failed')
        } else {
          setStatus('✓ Supabase connection successful!')
          setError(null)
        }
      } catch (err) {
        setError(`Connection error: ${err}`)
        setStatus('Connection failed')
      }
    }

    testConnection()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>
        <p className={`text-xl ${error ? 'text-red-600' : 'text-green-600'}`}>
          {status}
        </p>
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </main>
  )
}
