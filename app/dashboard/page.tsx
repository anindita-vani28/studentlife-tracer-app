'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCourses, getTasks, getLatestMood, type Course, type Task } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'
import MoodSelector from '@/app/components/MoodSelector'
import RecommendationsDisplay from '@/app/components/RecommendationsDisplay'
import { generateRecommendations, type DailyRecommendations } from '@/lib/recommendations'
import { getWeatherByLocation } from '@/lib/weather'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface CourseStats {
  courseId: string
  courseName: string
  courseColor: string
  taskCount: number
  completedCount: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState<DailyRecommendations | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)

        if (data?.user) {
          const [coursesData, tasksData, moodData] = await Promise.all([
            getCourses(),
            getTasks(),
            getLatestMood(),
          ])
          setCourses(coursesData)
          setTasks(tasksData)

          // Load recommendations if mood exists
          if (moodData) {
            try {
              setWeatherLoading(true)
              // Default to "New York" for now - in production, user would set location
              const weather = await getWeatherByLocation('New York')
              const recs = generateRecommendations(
                moodData.mood,
                moodData.energy_level,
                moodData.stress_level,
                weather,
                tasksData
              )
              setRecommendations(recs)
            } catch (weatherErr) {
              console.warn('Weather API not available:', weatherErr)
              // Generate recommendations without weather
              const recs = generateRecommendations(
                moodData.mood,
                moodData.energy_level,
                moodData.stress_level,
                null,
                tasksData
              )
              setRecommendations(recs)
            } finally {
              setWeatherLoading(false)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
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
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" userEmail={user?.email} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0]}!</h2>
          <p className="text-gray-600 mt-1">Track your study progress and stay on top of deadlines</p>
        </div>

        {/* Mood Selector and Recommendations */}
        <MoodSelector />
        <RecommendationsDisplay recommendations={recommendations} loading={weatherLoading} />

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
            <p className="text-xs text-gray-600 mt-2">Active learning paths</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{completionRate}%</p>
            <p className="text-xs text-gray-600 mt-2">{completedTasks.length} of {tasks.length} tasks done</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <h3 className="text-gray-500 text-sm font-medium">Study Streak 🔥</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{streak}</p>
            <p className="text-xs text-gray-600 mt-2">consecutive days with tasks</p>
          </div>

          <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${overdueTasks.length > 0 ? 'border-red-500' : 'border-green-500'}`}>
            <h3 className="text-gray-500 text-sm font-medium">Overdue Tasks</h3>
            <p className={`text-3xl font-bold mt-2 ${overdueTasks.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {overdueTasks.length}
            </p>
            <p className="text-xs text-gray-600 mt-2">{overdueTasks.length > 0 ? 'Urgent!' : 'All caught up'}</p>
          </div>
        </div>

        {/* Next Upcoming Exam Widget */}
        {nextUpcomingExam && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow p-6 mb-8 text-white">
            <h3 className="text-sm font-medium opacity-90">NEXT UPCOMING EXAM</h3>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold">{nextUpcomingExam.title}</p>
                <p className="text-purple-100 mt-2">{nextUpcomingExam.description || 'No description'}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{daysUntilExam}</p>
                <p className="text-sm opacity-90">days remaining</p>
              </div>
            </div>
            <Link
              href="/tasks"
              className="inline-block mt-4 bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition"
            >
              View Exam Details
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Due Today Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-yellow-500 mr-2">📅</span>
              Due Today
            </h3>
            {dueToday.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No tasks due today!</p>
            ) : (
              <div className="space-y-3">
                {dueToday.map((task) => (
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

          {/* Due This Week Section */}
          <div className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
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
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
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
