import Link from 'next/link'
import { logout } from '@/app/actions/auth'

interface NavigationProps {
  currentPage: 'dashboard' | 'courses' | 'tasks' | 'habits' | 'expenses' | 'analytics'
  userEmail?: string
}

export function Navigation({ currentPage, userEmail }: NavigationProps) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              Aninditabk
            </Link>
            <div className="flex space-x-6">
              <Link
                href="/dashboard"
                className={`${
                  currentPage === 'dashboard'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/courses"
                className={`${
                  currentPage === 'courses'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Courses
              </Link>
              <Link
                href="/tasks"
                className={`${
                  currentPage === 'tasks'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tasks
              </Link>
              <Link
                href="/habits"
                className={`${
                  currentPage === 'habits'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Habits
              </Link>
              <Link
                href="/expenses"
                className={`${
                  currentPage === 'expenses'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Expenses
              </Link>
              <Link
                href="/analytics"
                className={`${
                  currentPage === 'analytics'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userEmail && <span className="text-sm text-gray-700 hidden sm:block">{userEmail}</span>}
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
  )
}
