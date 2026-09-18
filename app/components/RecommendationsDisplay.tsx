'use client'

import { DailyRecommendations, StudyRecommendation } from '@/lib/recommendations'

type Props = {
  recommendations: DailyRecommendations | null
  loading?: boolean
}

export default function RecommendationsDisplay({ recommendations, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-6 mb-6 border border-blue-100">
      {/* Header with weather and mood */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Study Plan
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {recommendations.weather} • Mood: <span className="font-medium">{recommendations.mood}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{Math.round(recommendations.totalStudyTime / 60)}</p>
          <p className="text-sm text-gray-600">hours recommended</p>
        </div>
      </div>

      {/* Daily message */}
      <p className="text-gray-700 mb-6 p-4 bg-white rounded-lg border border-blue-200">
        {recommendations.dailyMessage}
      </p>

      {/* Recommendations list */}
      <div className="space-y-3">
        {recommendations.recommendations.map((rec, idx) => (
          <StudyRecommendationCard key={idx} recommendation={rec} index={idx} />
        ))}
      </div>

      {/* Study tips */}
      <div className="mt-6 pt-4 border-t border-blue-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">💡 Study Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Start with your highest priority task</li>
          <li>• Take a {recommendations.recommendations[0]?.duration || 60}-minute focused session</li>
          <li>• Use 10-15 minute breaks between sessions</li>
          <li>• Keep water and snacks nearby</li>
        </ul>
      </div>
    </div>
  )
}

function StudyRecommendationCard({ recommendation, index }: { recommendation: StudyRecommendation; index: number }) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  const priorityIcon = {
    high: '🔥',
    medium: '⚡',
    low: '📌',
  }

  return (
    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">
            {index + 1}. {recommendation.subject}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{recommendation.reason}</p>
        </div>
        <span className="text-xl">{priorityIcon[recommendation.priority]}</span>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColor[recommendation.difficulty]}`}>
          {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
        </span>
        <span className="text-sm font-medium text-gray-700">
          ⏱️ {recommendation.duration} minutes
        </span>
      </div>
    </div>
  )
}
