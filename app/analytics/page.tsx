'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getExpenseStats,
  getCareerGoal,
  setCareerGoal,
  getSalaryData,
  calculateEducationROI,
  type EducationROI,
  type CareerGoal,
  type SalaryData,
} from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'
import { LoadingSpinner } from '@/app/components/LoadingSpinner'
import { ErrorAlert } from '@/app/components/ErrorAlert'
import type { User } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const CAREERS = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'Business Analyst',
  'Accountant',
  'Teacher',
  'Nurse',
  'Doctor',
  'Lawyer',
  'Consultant',
  'Marketing Manager',
  'UX Designer',
]

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [totalSpending, setTotalSpending] = useState(0)
  const [careerGoal, setCareerGoalState] = useState<CareerGoal | null>(null)
  const [roi, setROI] = useState<EducationROI | null>(null)
  const [salaryData, setSalaryData] = useState<SalaryData[]>([])

  const [formData, setFormData] = useState({
    careerTitle: '',
    targetSalary: '',
    salaryAfter5: '',
    industry: '',
    location: '',
    graduationYear: new Date().getFullYear() + 3,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        setUser(data?.user ?? null)

        if (data?.user) {
          const [stats, career] = await Promise.all([getExpenseStats(), getCareerGoal()])

          setTotalSpending(stats.total)
          setCareerGoalState(career)

          if (career && career.target_salary > 0) {
            const roiData = await calculateEducationROI(stats.total, career.target_salary)
            setROI(roiData)

            const salaries = await getSalaryData(career.career_title)
            setSalaryData(salaries)
          }

          if (career) {
            setFormData({
              careerTitle: career.career_title,
              targetSalary: career.target_salary.toString(),
              salaryAfter5: career.expected_salary_after_5yr.toString(),
              industry: career.industry || '',
              location: career.location || '',
              graduationYear: career.graduation_year || new Date().getFullYear() + 3,
            })
          }
        }
      } catch (err) {
        console.error('Failed to load analytics:', err)
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSetCareerGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.careerTitle.trim() || !formData.targetSalary) {
      setError('Career title and salary are required')
      return
    }

    try {
      const goal = await setCareerGoal(
        formData.careerTitle,
        parseFloat(formData.targetSalary),
        formData.salaryAfter5 ? parseFloat(formData.salaryAfter5) : undefined,
        formData.industry || undefined,
        formData.location || undefined,
        formData.graduationYear
      )

      setCareerGoalState(goal)

      const roiData = await calculateEducationROI(totalSpending, goal.target_salary)
      setROI(roiData)

      const salaries = await getSalaryData(goal.career_title)
      setSalaryData(salaries)

      setShowForm(false)
      setError(null)
    } catch (err) {
      console.error('Error setting career goal:', err)
      setError('Failed to set career goal')
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading your analytics..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="analytics" userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Education ROI Analytics</h1>
            <p className="text-gray-600 mt-1">Calculate the return on your education investment</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : careerGoal ? '✏️ Edit Goal' : '➕ Set Career Goal'}
          </button>
        </div>

        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

        {/* Career Goal Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleSetCareerGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Title *</label>
                  <input
                    type="text"
                    list="careers-list"
                    value={formData.careerTitle}
                    onChange={(e) => setFormData({ ...formData, careerTitle: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="careers-list">
                    {CAREERS.map(career => (
                      <option key={career} value={career} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Starting Salary ($) *</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.targetSalary}
                    onChange={(e) => setFormData({ ...formData, targetSalary: e.target.value })}
                    placeholder="70000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary After 5 Years ($)</label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formData.salaryAfter5}
                    onChange={(e) => setFormData({ ...formData, salaryAfter5: e.target.value })}
                    placeholder="100000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation Year</label>
                  <input
                    type="number"
                    min="2026"
                    max="2040"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Technology"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  {careerGoal ? 'Update Goal' : 'Set Career Goal'}
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

        {!careerGoal && !showForm ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">Set a career goal to see your education ROI analysis!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition inline-block"
            >
              Set Your Career Goal
            </button>
          </div>
        ) : careerGoal && roi ? (
          <div className="space-y-8">
            {/* ROI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-medium">Total Investment</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">${totalSpending.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-2">Education spending</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-medium">Target Salary</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">${roi.targetSalary.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-2">Annual starting salary</p>
              </div>

              <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${roi.investmentCategory === 'excellent' ? 'border-green-500' : roi.investmentCategory === 'good' ? 'border-blue-500' : 'border-yellow-500'}`}>
                <h3 className="text-gray-500 text-sm font-medium">Break-Even Period</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{roi.monthsToBreakEven}</p>
                <p className="text-xs text-gray-600 mt-2">months at target salary</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <h3 className="text-gray-500 text-sm font-medium">Career ROI</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{roi.careySalaryMultiplier}x</p>
                <p className="text-xs text-gray-600 mt-2">lifetime earnings multiple</p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Education ROI Analysis</h2>

              <div className="space-y-4 text-gray-800">
                <p className="text-lg">
                  You've invested <span className="font-bold text-blue-600">${totalSpending.toFixed(0)}</span> in your education with a target career as a{' '}
                  <span className="font-bold text-purple-600">{careerGoal.career_title}</span> earning{' '}
                  <span className="font-bold text-green-600">${roi.targetSalary.toLocaleString()}/year</span>.
                </p>

                <p className="text-lg">
                  At your target salary, you'll recover your education investment in approximately{' '}
                  <span className="font-bold text-blue-600">{roi.monthsToBreakEven} months</span> ({Math.round(roi.monthsToBreakEven / 12)} years).
                </p>

                <p className="text-lg">
                  Over a 40-year career, your target salary will generate approximately{' '}
                  <span className="font-bold text-green-600">${(roi.targetSalary * 40).toLocaleString()}</span> in total earnings, making your education investment{' '}
                  <span className={`font-bold ${roi.careySalaryMultiplier > 100 ? 'text-green-600' : 'text-blue-600'}`}>
                    {roi.careySalaryMultiplier}x
                  </span>{' '}
                  the initial cost.
                </p>

                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900 mb-2">Investment Category: {roi.investmentCategory.toUpperCase()}</p>
                  <p className="text-sm text-gray-700">
                    {roi.investmentCategory === 'excellent'
                      ? '🎯 Excellent investment! Your break-even period is within 1 year.'
                      : roi.investmentCategory === 'good'
                        ? '✅ Good investment! Your break-even period is within 2 years.'
                        : roi.investmentCategory === 'fair'
                          ? '📊 Fair investment. Break-even in 3 years. Consider career growth opportunities.'
                          : '⚠️ This career path may require careful consideration. Break-even period exceeds 3 years.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Salary Benchmarks */}
            {salaryData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Salary Benchmarks: {careerGoal.career_title}</h3>
                <div className="space-y-3">
                  {salaryData.map(salary => (
                    <div key={salary.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{salary.career_title}</p>
                        {salary.industry && <p className="text-sm text-gray-600">{salary.industry}</p>}
                      </div>
                      <div className="text-right">
                        {salary.entry_level_salary && (
                          <p className="text-sm text-gray-700">
                            Entry: <span className="font-bold">${salary.entry_level_salary.toLocaleString()}</span>
                          </p>
                        )}
                        {salary.mid_level_salary && (
                          <p className="text-sm text-gray-700">
                            Mid (5yr): <span className="font-bold">${salary.mid_level_salary.toLocaleString()}</span>
                          </p>
                        )}
                        {salary.senior_level_salary && (
                          <p className="text-sm text-gray-700">
                            Senior (10yr): <span className="font-bold">${salary.senior_level_salary.toLocaleString()}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
