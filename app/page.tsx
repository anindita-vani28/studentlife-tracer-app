'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      if (data?.user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }

    checkAuth()
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2 text-blue-600">Aninditabk</h1>
        <h2 className="text-3xl font-semibold mb-4 text-gray-800">Student Life AI Assistant</h2>
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    </main>
  )
}
