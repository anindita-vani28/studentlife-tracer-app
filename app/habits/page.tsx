'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getHabits, addHabit, deleteHabit, logHabit, getHabitLogs, getHabitStreak, type Habit, type HabitLog } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'
import { ErrorAlert } from '@/app/components/ErrorAlert'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const HABIT_CATEGORIES = [
  { id: 'study_hours', label: '📚 Study Hours', unit: 'hours' },
  { id: 'exercise', label: '🏃 Exercise', unit: 'minutes' },
  { id: 'sleep', label: '😴 Sleep', unit: 'hours' },
  { id: 'water', label: '💧 Water Intake', unit: 'glasses' },
  { id: 'meditation', label: '🧘 Meditation', unit: 'minutes' },
  { id: 'reading', label: '📖 Reading', unit: 'pages' },
  { id: 'coding', label: '💻 Coding Practice', unit: 'minutes' },
  { id: 'custom', label: '⭐ Custom', unit: 'count' },
]

const HABIT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]

interface HabitWithStreak extends Habit {
  streak?: number
  todayLog?: HabitLog | null
}

export default function HabitsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [habits, setHabits] = useState<HabitWithStreak[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'study_hours',
    goalValue: 1,
    description: '',
    color: HABIT_COLORS[0],
  })

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)

        if (data?.user) {
          const habitsData = await getHabits()

          // Load streaks and today's logs
          const habitsWithMeta = await Promise.all(
            habitsData.map(async (habit) => {
              const [streak, logs] = await Promise.all([
                getHabitStreak(habit.id),
                getHabitLogs(habit.id, 1),
              ])
              const todayLog = logs.find(log => log.log_date === new Date().toISOString().split('T')[0])
              return { ...habit, streak, todayLog: todayLog || null }
            })
          )

          setHabits(habitsWithMeta)
        }
      } catch (err) {
        console.error('Failed to load habits:', err)
        setError('Failed to load habits')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Habit name is required')
      return
    }

    try {
      const newHabit = await addHabit(
        formData.name,
        formData.category,
        formData.goalValue,
        HABIT_CATEGORIES.find(c => c.id === formData.category)?.unit || 'count',
        formData.description,
        formData.color
      )

      setHabits([...habits, { ...newHabit, streak: 0, todayLog: null }])
      setFormData({ name: '', category: 'study_hours', goalValue: 1, description: '', color: HABIT_COLORS[0] })
      setShowForm(false)
      setError(null)
    } catch (err) {
      console.error('Error adding habit:', err)
      setError('Failed to add habit')
    }
  }

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Delete this habit?')) return

    try {
      await deleteHabit(id)
      setHabits(habits.filter(h => h.id !== id))
      setError(null)
    } catch (err) {
      console.error('Error deleting habit:', err)
      setError('Failed to delete habit')
    }
  }

  const handleLogHabit = async (habitId: string, value: number) => {
    try {
      await logHabit(habitId, value)

      // Reload habit data
      const habitsData = await getHabits()
      const habitsWithMeta = await Promise.all(
        habitsData.map(async (habit) => {
          const [streak, logs] = await Promise.all([
            getHabitStreak(habit.id),
            getHabitLogs(habit.id, 1),
          ])
          const todayLog = logs.find(log => log.log_date === new Date().toISOString().split('T')[0])
          return { ...habit, streak, todayLog: todayLog || null }
        })
      )
      setHabits(habitsWithMeta)
      setError(null)
    } catch (err) {
      console.error('Error logging habit:', err)
      setError('Failed to log habit')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your habits..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="habits" userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
            <p className="text-gray-600 mt-1">Build consistency, one day at a time</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : '➕ Add Habit'}
          </button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Add Habit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habit Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Morning Exercise"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {HABIT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Goal ({HABIT_CATEGORIES.find(c => c.id === formData.category)?.unit})
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={formData.goalValue}
                    onChange={(e) => setFormData({ ...formData, goalValue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex gap-2">
                    {HABIT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg border-2 ${formData.color === color ? 'border-gray-900' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Why is this habit important?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Create Habit
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No habits yet. Start building consistency today!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition inline-block"
            >
              Create Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map(habit => (
              <div
                key={habit.id}
                className="bg-white rounded-lg shadow p-6 border-l-4"
                style={{ borderLeftColor: habit.color }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Streak */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">🔥 Streak</span>
                    <span className="text-2xl font-bold text-orange-600">{habit.streak || 0}</span>
                  </div>

                  {/* Daily Goal */}
                  <div className="text-sm text-gray-600">
                    Daily Goal: <span className="font-semibold text-gray-900">{habit.goal_value} {habit.goal_unit}</span>
                  </div>

                  {/* Today's Log */}
                  {habit.todayLog ? (
                    <div className="bg-green-50 rounded p-3">
                      <p className="text-sm font-medium text-green-800">✅ Logged Today</p>
                      <p className="text-sm text-green-700 mt-1">{habit.todayLog.value} {habit.goal_unit}</p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 rounded p-3">
                      <p className="text-sm font-medium text-blue-800">📝 Log Today</p>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder={`0 ${habit.goal_unit}`}
                          id={`log-${habit.id}`}
                          className="flex-1 px-3 py-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`log-${habit.id}`) as HTMLInputElement
                            if (input.value) {
                              handleLogHabit(habit.id, parseFloat(input.value))
                              input.value = ''
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition"
                        >
                          Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
