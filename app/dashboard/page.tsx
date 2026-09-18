'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/app/actions/auth'
import { getCourses, getTasks, type Course, type Task } from '@/lib/supabase/database'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)

        if (data?.user) {
          const [coursesData, tasksData] = await Promise.all([getCourses(), getTasks()])
          setCourses(coursesData)
          setTasks(tasksData)
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
  const overdueTasks = tasks.filter(
    (t) => t.status === 'pending' && new Date(t.due_date) < new Date()
  )
  const dueToday = tasks.filter((t) => {
    const today = new Date().toISOString().split('T')[0]
    return t.due_date.startsWith(today)
  })
  const dueThisWeek = tasks.filter((t) => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const taskDate = new Date(t.due_date)
    return taskDate > today && taskDate <= nextWeek
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">Aninditabk</h1>
              <div className="flex space-x-6">
                <Link href="/dashboard" className="text-blue-600 font-semibold">
                  Dashboard
                </Link>
                <Link href="/courses" className="text-gray-600 hover:text-gray-900">
                  Courses
                </Link>
                <Link href="/tasks" className="text-gray-600 hover:text-gray-900">
                  Tasks
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user?.email}</span>
              <button
                onClick={() => logout()}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Welcome back!</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Pending Tasks</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{pendingTasks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Due Today</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{dueToday.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Overdue</h3>
            <p className={`text-3xl font-bold mt-2 ${overdueTasks.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {overdueTasks.length}
            </p>
          </div>
        </div>

        {/* Due Today Section */}
        {dueToday.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Due Today</h3>
            <div className="space-y-3">
              {dueToday.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-gray-900">{task.title}</span>
                  <Link
                    href="/tasks"
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due This Week Section */}
        {dueThisWeek.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Due This Week</h3>
            <div className="space-y-3">
              {dueThisWeek.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                  <Link
                    href="/tasks"
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              href="/courses"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
            >
              Manage Courses
            </Link>
            <Link
              href="/tasks"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-center"
            >
              Manage Tasks
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
