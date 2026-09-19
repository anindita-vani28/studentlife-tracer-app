'use client'

import { useState, useEffect } from 'react'
import { getOpportunities, getSavedOpportunities, saveOpportunity, unsaveOpportunity } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

const CATEGORIES = ['hackathon', 'coding_competition', 'olympiad', 'scholarship', 'research', 'volunteering', 'conference', 'internship', 'workshop']

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [toggling, setToggling] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [selectedCategory])

  async function loadData() {
    try {
      setError(null)
      const opps = await getOpportunities(selectedCategory || undefined)
      const savedOpps = await getSavedOpportunities()
      setOpportunities(opps)
      setSaved(new Set(savedOpps.map(s => s.id)))
    } catch (err: any) {
      setError(`Failed to load opportunities: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function toggleSave(opportunityId: string, isSaved: boolean) {
    if (toggling.has(opportunityId)) return

    setToggling(prev => new Set([...prev, opportunityId]))
    try {
      setError(null)
      if (isSaved) {
        await unsaveOpportunity(opportunityId)
        setSaved(prev => {
          const next = new Set(prev)
          next.delete(opportunityId)
          return next
        })
      } else {
        await saveOpportunity(opportunityId)
        setSaved(prev => new Set([...prev, opportunityId]))
      }
    } catch (err: any) {
      console.error('Save toggle error:', err)
      const errorMsg = err.message || 'Unknown error'
      if (errorMsg.includes('duplicate key')) {
        setSaved(prev => new Set([...prev, opportunityId]))
      } else {
        setError(isSaved ? `Failed to unsave: ${errorMsg}` : `Failed to save: ${errorMsg}`)
      }
    } finally {
      setToggling(prev => {
        const next = new Set(prev)
        next.delete(opportunityId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="opportunities" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 flex justify-between items-center">
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="font-semibold hover:text-red-900">×</button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Opportunities</h1>
          <p className="text-gray-600 mt-2">Discover hackathons, competitions, scholarships, and more</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}>
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">No opportunities found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{opp.title}</h3>
                    <p className="text-gray-600 text-sm">{opp.organizer}</p>
                  </div>
                  <button 
                    onClick={() => toggleSave(opp.id, saved.has(opp.id))}
                    disabled={toggling.has(opp.id)}
                    className={`text-2xl ml-2 transition ${saved.has(opp.id) ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'} ${toggling.has(opp.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={saved.has(opp.id) ? 'Remove from saved' : 'Save opportunity'}
                  >
                    ★
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-700"><strong>Category:</strong> {opp.category.replace('_', ' ')}</p>
                  {opp.event_type && <p className="text-sm text-gray-700"><strong>Type:</strong> {opp.event_type}</p>}
                  {opp.location && <p className="text-sm text-gray-700"><strong>Location:</strong> {opp.location}</p>}
                  <p className="text-sm text-gray-700"><strong>Deadline:</strong> {new Date(opp.deadline).toLocaleDateString()}</p>
                  {opp.cost_amount > 0 && <p className="text-sm text-gray-700"><strong>Cost:</strong> ${opp.cost_amount}</p>}
                </div>

                {opp.description && <p className="text-gray-600 text-sm mb-4">{opp.description}</p>}

                {opp.official_url && (
                  <a 
                    href={opp.official_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
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
