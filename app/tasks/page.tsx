'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  getTasks,
  getCourses,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  type Task,
  type Course,
} from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'
import { ErrorAlert } from '@/app/components/ErrorAlert'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'
import { EmptyState } from '@/app/components/EmptyState'

export const dynamic = 'force-dynamic'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    type: 'assignment' as 'assignment' | 'exam' | 'other',
    dueDate: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        window.location.href = '/auth/login'
        return
      }
      const [tasksData, coursesData] = await Promise.all([getTasks(), getCourses()])
      setTasks(tasksData)
      setCourses(coursesData)
      if (coursesData.length > 0 && !formData.courseId) {
        setFormData((prev) => ({ ...prev, courseId: coursesData[0].id }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }
    if (!formData.courseId) {
      setError('Please select a course')
      return
    }
    if (!formData.dueDate) {
      setError('Due date is required')
      return
    }

    const dueDateTime = new Date(formData.dueDate)
    const now = new Date()
    if (!editingId && dueDateTime < now) {
      setError('Due date cannot be in the past')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      if (editingId) {
        await updateTask(
          editingId,
          formData.title,
          formData.description || null,
          formData.type,
          formData.dueDate,
          formData.difficulty
        )
      } else {
        await addTask(
          formData.courseId,
          formData.title,
          formData.description || null,
          formData.type,
          formData.dueDate,
          formData.difficulty
        )
      }
      setFormData({
        courseId: courses[0]?.id || '',
        title: '',
        description: '',
        type: 'assignment',
        dueDate: '',
        difficulty: 'medium',
      })
      setEditingId(null)
      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return

    try {
      setError(null)
      await deleteTask(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  async function handleToggleStatus(task: Task) {
    try {
      setError(null)
      await updateTaskStatus(task.id, task.status === 'pending' ? 'done' : 'pending')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  function handleEdit(task: Task) {
    setEditingId(task.id)
    setFormData({
      courseId: task.course_id,
      title: task.title,
      description: task.description || '',
      type: task.type,
      dueDate: task.due_date.split('T')[0],
      difficulty: task.difficulty,
    })
    setShowForm(true)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      courseId: courses[0]?.id || '',
      title: '',
      description: '',
      type: 'assignment',
      dueDate: '',
      difficulty: 'medium',
    })
  }

  const getCourseColor = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.color || '#3B82F6'
  }

  const getCourseName = (courseId: string) => {
    return courses.find((c) => c.id === courseId)?.name || 'Unknown'
  }

  if (loading) {
    return <LoadingSpinner message="Loading tasks..." />
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="tasks" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon="📝"
            title="No Courses Yet"
            description="Create a course first before adding tasks."
            actionLabel="Create Course"
            actionHref="/courses"
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="tasks" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Tasks</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showForm ? 'Cancel' : 'Add Task'}
          </button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'assignment' | 'exam' | 'other',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 5 Assignment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any notes or instructions..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {tasks.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No Tasks Yet"
            description="Create your first task to organize your study schedule."
            actionLabel="Create Task"
            actionHref="/tasks"
          />
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 border-l-4"
                style={{ borderColor: getCourseColor(task.course_id) }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={() => handleToggleStatus(task)}
                        className="w-5 h-5 text-blue-600 border border-gray-300 rounded cursor-pointer"
                      />
                      <h3
                        className={`text-lg font-semibold ${
                          task.status === 'done'
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 mt-2 ml-8">{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 ml-8 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{getCourseName(task.course_id)}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {task.type}
                      </span>
                      <span className={`px-2 py-1 rounded capitalize ${
                        task.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        task.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {task.difficulty}
                      </span>
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
