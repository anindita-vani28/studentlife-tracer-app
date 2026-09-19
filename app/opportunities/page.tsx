'use client'

import { useState, useEffect } from 'react'
import { getOpportunities, getSavedOpportunities, saveOpportunity, unsaveOpportunity } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

const CATEGORIES = ['hackathon', 'coding_competition', 'olympiad', 'scholarship', 'research', 'volunteering', 'conference', 'internship', 'workshop']

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  async function loadData() {
    try {
      const opps = await getOpportunities(selectedCategory || undefined)
      const savedOpps = await getSavedOpportunities()
      setOpportunities(opps)
      setSaved(new Set(savedOpps.map(s => s.id)))
    } finally {
      setLoading(false)
    }
  }

  async function toggleSave(opportunityId: string, isSaved: boolean) {
    try {
      if (isSaved) {
        await unsaveOpportunity(opportunityId)
        setSaved(prev => { const next = new Set(prev); next.delete(opportunityId); return next })
      } else {
        await saveOpportunity(opportunityId)
        setSaved(prev => new Set([...prev, opportunityId]))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="opportunities" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Opportunities</h1>
        <p className="text-gray-600 mb-8">Discover hackathons, competitions, scholarships, and more</p>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12"><h3 className="text-lg font-semibold text-gray-900">No opportunities found</h3></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{opp.title}</h3>
                    <p className="text-gray-600 text-sm">{opp.organizer}</p>
                  </div>
                  <button onClick={() => toggleSave(opp.id, saved.has(opp.id))} className={`text-2xl ${saved.has(opp.id) ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-700"><strong>Category:</strong> {opp.category.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-700"><strong>Type:</strong> {opp.event_type}</p>
                  {opp.location && <p className="text-sm text-gray-700"><strong>Location:</strong> {opp.location}</p>}
                  <p className="text-sm text-gray-700"><strong>Deadline:</strong> {new Date(opp.deadline).toLocaleDateString()}</p>
                  {opp.cost_amount > 0 && <p className="text-sm text-gray-700"><strong>Cost:</strong> ${opp.cost_amount}</p>}
                </div>
                {opp.description && <p className="text-gray-600 text-sm mb-4">{opp.description}</p>}
                {opp.official_url && (
                  <a href={opp.official_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold">
                    Learn More →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
