'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getExpenses, addExpense, deleteExpense, getExpenseStats, type Expense } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'
import { ErrorAlert } from '@/app/components/ErrorAlert'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const EXPENSE_CATEGORIES = [
  { id: 'tuition', label: '🎓 Tuition', color: '#3B82F6' },
  { id: 'books', label: '📚 Books & Materials', color: '#10B981' },
  { id: 'tech', label: '💻 Technology & Software', color: '#8B5CF6' },
  { id: 'transport', label: '🚗 Transportation', color: '#F59E0B' },
  { id: 'accommodation', label: '🏠 Accommodation', color: '#EC4899' },
  { id: 'lab', label: '🧪 Lab & Supplies', color: '#14B8A6' },
  { id: 'exams', label: '📝 Exams & Certification', color: '#EF4444' },
  { id: 'other', label: '📦 Other', color: '#6B7280' },
]

export default function ExpensesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({ total: 0, byCategory: {} as Record<string, number> })

  const [formData, setFormData] = useState({
    category: 'tuition',
    description: '',
    amount: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    vendor: '',
    notes: '',
  })

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)

        if (data?.user) {
          const [expensesData, statsData] = await Promise.all([
            getExpenses(12), // Last 12 months
            getExpenseStats(),
          ])
          setExpenses(expensesData)
          setStats(statsData)
        }
      } catch (err) {
        console.error('Failed to load expenses:', err)
        setError('Failed to load expenses')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.description.trim() || !formData.amount) {
      setError('Description and amount are required')
      return
    }

    try {
      const newExpense = await addExpense(
        formData.category,
        formData.description,
        parseFloat(formData.amount),
        formData.purchaseDate,
        formData.vendor || undefined,
        formData.notes || undefined
      )

      setExpenses([newExpense, ...expenses])
      const newStats = await getExpenseStats()
      setStats(newStats)

      setFormData({
        category: 'tuition',
        description: '',
        amount: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        vendor: '',
        notes: '',
      })
      setShowForm(false)
      setError(null)
    } catch (err) {
      console.error('Error adding expense:', err)
      setError('Failed to add expense')
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense?')) return

    try {
      await deleteExpense(id)
      setExpenses(expenses.filter(e => e.id !== id))
      const newStats = await getExpenseStats()
      setStats(newStats)
      setError(null)
    } catch (err) {
      console.error('Error deleting expense:', err)
      setError('Failed to delete expense')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your expenses..." />
  }

  const categoryLabel = (catId: string) => EXPENSE_CATEGORIES.find(c => c.id === catId)?.label || catId
  const categoryColor = (catId: string) => EXPENSE_CATEGORIES.find(c => c.id === catId)?.color || '#6B7280'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="expenses" userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Education Expenses</h1>
            <p className="text-gray-600 mt-1">Track your education investment</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : '➕ Add Expense'}
          </button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-gray-500 text-sm font-medium">Total Education Spending</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">${stats.total.toFixed(2)}</p>
            <p className="text-xs text-gray-600 mt-2">{expenses.length} expenses tracked</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-medium">Top Categories</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{categoryLabel(cat)}</span>
                    <span className="font-semibold text-gray-900">${(amount as number).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Physics Textbook"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g., Amazon, Barnes & Noble"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Add Expense
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

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No expenses yet. Start tracking your education spending!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition inline-block"
            >
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map(expense => (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow p-4 border-l-4"
                style={{ borderLeftColor: categoryColor(expense.category) }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {categoryLabel(expense.category)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      {expense.vendor && <span>📍 {expense.vendor}</span>}
                      <span>📅 {new Date(expense.purchase_date).toLocaleDateString()}</span>
                      {expense.notes && <span>📝 {expense.notes}</span>}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition p-2"
                    >
                      ✕
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
