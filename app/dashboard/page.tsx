'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCourses, getTasks, getLatestMood, getUserPreferences, type Course, type Task } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'
import MoodSelector from '@/app/components/MoodSelector'
import RecommendationsDisplay from '@/app/components/RecommendationsDisplay'
import { generateRecommendations, type DailyRecommendations } from '@/lib/recommendations'
import { getWeatherByLocation, getWeatherTheme, type WeatherData, type WeatherTheme } from '@/lib/weather'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface CourseStats {
  courseId: string
  courseName: string
  courseColor: string
  taskCount: number
  completedCount: number
}

type DashboardWeather = WeatherData & {
  location: {
    name: string
    country: string
  }
}

function getWeatherIcon(theme: WeatherTheme, isDaytime: boolean): string {
  if (theme === 'storm') return '⛈️'
  if (theme === 'snow') return '❄️'
  if (theme === 'rain') return '🌧️'
  if (theme === 'cloudy') return '☁️'
  return isDaytime ? '☀️' : '🌙'
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<DailyRecommendations | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherEffect, setWeatherEffect] = useState<WeatherTheme>('clear')
  const [weatherData, setWeatherData] = useState<DashboardWeather | null>(null)
  const [isDaytime, setIsDaytime] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)

        let tasksData: Task[] = []
        let moodData: Awaited<ReturnType<typeof getLatestMood>> = null
        let weatherLocation = 'New York'

        if (data?.user) {
          const [coursesResult, tasksResult, moodResult, preferencesResult] = await Promise.allSettled([
            getCourses(),
            getTasks(),
            getLatestMood(),
            getUserPreferences(),
          ])

          if (coursesResult.status === 'fulfilled') {
            setCourses(coursesResult.value)
          }

          if (tasksResult.status === 'fulfilled') {
            tasksData = tasksResult.value
            setTasks(tasksData)
          }

          if (moodResult.status === 'fulfilled') {
            moodData = moodResult.value
          }

          if (preferencesResult.status === 'fulfilled') {
            weatherLocation = preferencesResult.value?.location?.trim() || weatherLocation
          }
        }

        try {
          setWeatherLoading(true)
          const weather = await getWeatherByLocation(weatherLocation)
          setWeatherData(weather)
          setWeatherEffect(getWeatherTheme(weather))
          setIsDaytime(weather.isDaytime)

          if (moodData) {
            const recs = generateRecommendations(
              moodData.mood,
              moodData.energy_level,
              moodData.stress_level,
              weather,
              tasksData
            )
            setRecommendations(recs)
          }
        } catch (weatherErr) {
          console.warn('Weather API not available:', weatherErr)
          if (moodData) {
            const recs = generateRecommendations(
              moodData.mood,
              moodData.energy_level,
              moodData.stress_level,
              null,
              tasksData
            )
            setRecommendations(recs)
          }
        } finally {
          setWeatherLoading(false)
        }
      } catch {
        setWeatherData(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const completedTasks = tasks.filter((t) => t.status === 'done')
  const overdueTasks = tasks.filter(
    (t) => t.status === 'pending' && new Date(t.due_date) < new Date()
  )

  const dueToday = tasks.filter((t) => {
    const today = new Date().toISOString().split('T')[0]
    return t.due_date.startsWith(today) && t.status === 'pending'
  })

  const dueThisWeek = tasks.filter((t) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const taskDate = new Date(t.due_date)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate > today && taskDate <= nextWeek && t.status === 'pending'
  })

  const nextUpcomingExam = tasks
    .filter((t) => t.type === 'exam' && t.status === 'pending' && new Date(t.due_date) >= new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0] || null

  const calculateStudyStreak = (): number => {
    if (completedTasks.length === 0) return 0
    const completedDates = new Set(
      completedTasks.map((t) => new Date(t.updated_at).toISOString().split('T')[0])
    )
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    while (completedDates.has(currentDate.toISOString().split('T')[0])) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    }
    return streak
  }

  const getCourseStats = (): CourseStats[] => {
    return courses.map((course) => {
      const courseTasks = tasks.filter((t) => t.course_id === course.id)
      const completed = courseTasks.filter((t) => t.status === 'done').length
      return {
        courseId: course.id,
        courseName: course.name,
        courseColor: course.color,
        taskCount: courseTasks.length,
        completedCount: completed,
      }
    })
  }

  const daysUntilExam = nextUpcomingExam
    ? Math.ceil((new Date(nextUpcomingExam.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const streak = calculateStudyStreak()
  const courseStats = getCourseStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="dashboard" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-600">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`weather-dashboard min-h-screen ${isDaytime ? 'weather-day' : 'weather-night'}`}>
      <div className="relative z-20">
        <Navigation currentPage="dashboard" userEmail={user?.email} />
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className={`text-4xl font-bold transition-colors duration-1000 ${isDaytime ? 'text-gray-900' : 'text-white drop-shadow-lg'}`}>
              Welcome, {user?.email?.split('@')[0] || 'Student'}!
            </h1>
            <p className={`mt-2 transition-colors duration-1000 ${isDaytime ? 'text-gray-600' : 'text-slate-200'}`}>
              Track your progress, manage tasks, and stay on top of your goals
            </p>
          </div>

          <div className="weather-status" aria-live="polite">
            {weatherLoading ? (
              <span className="text-sm font-medium text-slate-600">Updating weather…</span>
            ) : weatherData ? (
              <>
                <span className="text-3xl" aria-hidden="true">{getWeatherIcon(weatherEffect, isDaytime)}</span>
                <span>
                  <strong className="block text-lg leading-tight text-slate-900">
                    {Math.round(weatherData.temperature)}°F · {weatherData.condition}
                  </strong>
                  <span className="text-xs font-medium text-slate-600">
                    {weatherData.location.name}{weatherData.location.country ? `, ${weatherData.location.country}` : ''}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-600">Weather unavailable</span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingTasks.length}</p>
              </div>
              <span className="text-4xl">⏳</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Study Streak</p>
                <p className="text-3xl font-bold text-purple-600">{streak}</p>
              </div>
              <span className="text-4xl">🔥</span>
            </div>
          </div>
        </div>

        {/* Mood & Recommendations */}
        {recommendations && <RecommendationsDisplay recommendations={recommendations} />}
        <MoodSelector />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overdue Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              Overdue
            </h3>
            {overdueTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No overdue tasks!</p>
            ) : (
              <div className="space-y-3">
                {overdueTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="p-3 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {courses.find((c) => c.id === task.course_id)?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Due Today */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-yellow-500 mr-2">📅</span>
              Due Today
            </h3>
            {dueToday.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No tasks today!</p>
            ) : (
              <div className="space-y-3">
                {dueToday.slice(0, 4).map((task) => (
                  <div key={task.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:shadow-md transition">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {courses.find((c) => c.id === task.course_id)?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Exam */}
          {nextUpcomingExam && (
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="text-purple-500 mr-2">📝</span>
                Next Exam
              </h3>
              <p className="text-2xl font-bold text-purple-600 mb-2">{nextUpcomingExam.title}</p>
              <p className="text-gray-700 mb-4">
                {courses.find((c) => c.id === nextUpcomingExam.course_id)?.name}
              </p>
              <div className="bg-purple-100 rounded-lg p-3">
                <p className="text-sm font-semibold text-purple-900">
                  {daysUntilExam === 0
                    ? '🚨 Today!'
                    : daysUntilExam === 1
                      ? '⏰ Tomorrow'
                      : `${daysUntilExam} days left`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Due This Week Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-blue-500 mr-2">📆</span>
            Due This Week
          </h3>
          {dueThisWeek.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No tasks this week!</p>
          ) : (
            <div className="space-y-3">
              {dueThisWeek.slice(0, 4).map((task) => (
                <div key={task.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                  <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-600">
                      {courses.find((c) => c.id === task.course_id)?.name}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold">
                      {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
              {dueThisWeek.length > 4 && (
                <p className="text-xs text-gray-500 text-center pt-2">+{dueThisWeek.length - 4} more</p>
              )}
            </div>
          )}
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-green-500 mr-2">📚</span>
            Course Progress
          </h3>
          {courseStats.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              <Link href="/courses" className="text-blue-600 hover:underline">
                Create a course
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {courseStats.slice(0, 4).map((stat) => (
                <div key={stat.courseId}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900">{stat.courseName}</p>
                    <p className="text-xs text-gray-600">
                      {stat.completedCount}/{stat.taskCount}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${stat.taskCount > 0 ? (stat.completedCount / stat.taskCount) * 100 : 0}%`,
                        backgroundColor: stat.courseColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/courses"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
            >
              ➕ Add Course
            </Link>
            <Link
              href="/tasks"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition text-center"
            >
              ➕ Add Task
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
