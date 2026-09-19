'use client'

import { useState, useEffect } from 'react'
import { getInternshipApplications, addInternshipApplication, updateInternshipApplication, deleteInternshipApplication, InternshipApplication } from '@/lib/supabase/database'
import { Navigation } from '@/app/components/Navigation'

const STATUSES = ['interested', 'applied', 'resume_submitted', 'hr_screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn']
const STATUS_COLORS: Record<string, string> = {
  interested: 'bg-blue-100 text-blue-800',
  applied: 'bg-purple-100 text-purple-800',
  resume_submitted: 'bg-indigo-100 text-indigo-800',
  hr_screening: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-orange-100 text-orange-800',
  offer: 'bg-green-100 text-green-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
}

export default function InternshipsPage() {
  const [applications, setApplications] = useState<InternshipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    position_title: '',
    location: '',
    application_date: new Date().toISOString().split('T')[0],
    deadline: '',
    status: 'interested',
    hr_contact_name: '',
    hr_contact_email: '',
  })

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    try {
      const data = await getInternshipApplications()
      setApplications(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await addInternshipApplication({
        ...formData,
        user_id: '',
      } as any)
      setFormData({
        company_name: '',
        position_title: '',
        location: '',
        application_date: new Date().toISOString().split('T')[0],
        deadline: '',
        status: 'interested',
        hr_contact_name: '',
        hr_contact_email: '',
      })
      setShowForm(false)
      await loadApplications()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updateInternshipApplication(id, { status: newStatus as any })
      await loadApplications()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteInternshipApplication(id)
        await loadApplications()
      } catch (err: any) {
        setError(err.message)
      }
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><Navigation currentPage="internships" /><div className="flex items-center justify-center h-screen"><div className="text-gray-600">Loading...</div></div></div>

  const stats = {
    total: applications.length,
    applied: applications.filter(a => ['applied', 'resume_submitted', 'hr_screening', 'interview'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => ['offer', 'accepted'].includes(a.status)).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="internships" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">{error}</div>}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Internship Tracker</h1>
            <p className="text-gray-600 mt-2">Track your applications and prepare for interviews</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Application'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.applied}</div>
            <div className="text-sm text-gray-600">Applied</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.interviews}</div>
            <div className="text-sm text-gray-600">Interviews</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
            <div className="text-sm text-gray-600">Offers</div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Add New Application</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Company Name" required value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} className="p-2 border rounded-lg" />
              <input type="text" placeholder="Position Title" required value={formData.position_title} onChange={(e) => setFormData({ ...formData, position_title: e.target.value })} className="p-2 border rounded-lg" />
              <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="p-2 border rounded-lg" />
              <input type="date" required value={formData.application_date} onChange={(e) => setFormData({ ...formData, application_date: e.target.value })} className="p-2 border rounded-lg" />
              <input type="date" placeholder="Deadline" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="p-2 border rounded-lg" />
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="p-2 border rounded-lg">
                {STATUSES.map(s => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
              </select>
              <input type="text" placeholder="HR Contact Name" value={formData.hr_contact_name} onChange={(e) => setFormData({ ...formData, hr_contact_name: e.target.value })} className="p-2 border rounded-lg" />
              <input type="email" placeholder="HR Contact Email" value={formData.hr_contact_email} onChange={(e) => setFormData({ ...formData, hr_contact_email: e.target.value })} className="p-2 border rounded-lg" />
              <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Add Application</button>
            </form>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12"><h3 className="text-lg font-semibold text-gray-900">No applications yet</h3><p className="text-gray-600">Start tracking your internship applications</p></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Company</th>
                  <th className="text-left p-4 font-semibold">Position</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Applied</th>
                  <th className="text-left p-4 font-semibold">Deadline</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">{app.company_name}</td>
                    <td className="p-4">{app.position_title}</td>
                    <td className="p-4">
                      <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} className={`px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer ${STATUS_COLORS[app.status]}`}>
                        {STATUSES.map(s => (<option key={s} value={s}>{s.replace('_', ' ')}</option>))}
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{app.application_date}</td>
                    <td className="p-4 text-sm text-gray-600">{app.deadline || 'N/A'}</td>
                    <td className="p-4 text-right"><button onClick={() => handleDelete(app.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
