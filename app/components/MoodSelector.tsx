'use client'

import { useState } from 'react'
import { logMood } from '@/lib/supabase/database'

const MOODS = [
  { id: 'energetic', emoji: '⚡', label: 'Energetic' },
  { id: 'motivated', emoji: '💪', label: 'Motivated' },
  { id: 'focused', emoji: '🎯', label: 'Focused' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'stressed', emoji: '😰', label: 'Stressed' },
  { id: 'distracted', emoji: '🙃', label: 'Distracted' },
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed' },
]

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [energyLevel, setEnergyLevel] = useState(3)
  const [stressLevel, setStressLevel] = useState(3)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!selectedMood) return

    setLoading(true)
    try {
      await logMood(selectedMood, energyLevel, stressLevel)
      setSubmitted(true)
      setTimeout(() => {
        setSelectedMood(null)
        setSubmitted(false)
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Error logging mood:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling today?</h2>

      {/* Mood selector grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {MOODS.map(mood => (
          <button
            key={mood.id}
            onClick={() => setSelectedMood(mood.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${
              selectedMood === mood.id
                ? 'bg-blue-100 border-2 border-blue-500 scale-105'
                : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <span className="text-3xl mb-1">{mood.emoji}</span>
            <span className="text-xs text-center font-medium text-gray-700">{mood.label}</span>
          </button>
        ))}
      </div>

      {selectedMood && (
        <div className="space-y-4 pt-4 border-t">
          {/* Energy level slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Energy Level: {energyLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={e => setEnergyLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Stress level slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Stress Level: {stressLevel}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={stressLevel}
              onChange={e => setStressLevel(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Calm</span>
              <span>Stressed</span>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading || submitted}
            className={`w-full py-2 rounded-lg font-medium transition-all ${
              submitted
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400'
            }`}
          >
            {submitted ? '✓ Submitted!' : loading ? 'Saving...' : 'Get Recommendations'}
          </button>
        </div>
      )}
    </div>
  )
}
