import Link from 'next/link'
import { logout } from '@/app/actions/auth'

interface NavigationProps {
  currentPage?: 'dashboard' | 'courses' | 'tasks' | 'habits' | 'expenses' | 'analytics' | 'internships' | 'opportunities' | 'discussions' | 'movies'
  userEmail?: string
}

export function Navigation({ currentPage = 'dashboard', userEmail }: NavigationProps) {
  const links = [
    { href: '/dashboard', label: 'Dashboard', key: 'dashboard' },
    { href: '/courses', label: 'Courses', key: 'courses' },
    { href: '/tasks', label: 'Tasks', key: 'tasks' },
    { href: '/habits', label: 'Habits', key: 'habits' },
    { href: '/expenses', label: 'Expenses', key: 'expenses' },
    { href: '/analytics', label: 'Analytics', key: 'analytics' },
    { href: '/internships', label: 'Internships', key: 'internships' },
    { href: '/opportunities', label: 'Opportunities', key: 'opportunities' },
    { href: '/discussions', label: 'Discussions', key: 'discussions' },
    { href: '/movies', label: 'Movies', key: 'movies' },
  ]

  return (
    <nav className="bg-white shadow overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600 whitespace-nowrap">
              Aninditabk
            </Link>
            <div className="flex space-x-4 overflow-x-auto">
              {links.map(link => (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`whitespace-nowrap ${
                    currentPage === link.key
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userEmail && <span className="text-sm text-gray-700 hidden sm:block">{userEmail}</span>}
            <button
              onClick={() => logout()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export function ErrorAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 flex justify-between items-center">
      <span>{message}</span>
      <button onClick={onDismiss} className="font-semibold hover:text-red-900">×</button>
    </div>
  )
}

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message || 'Loading...'}</p>
      </div>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  )
}
