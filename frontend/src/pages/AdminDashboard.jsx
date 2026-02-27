import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { currency } from '../utils/formatters.js'

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await adminService.stats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="animate-pulse text-slate-500">Loading admin dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-100 bg-rose-50 p-6 text-rose-700">
          {error}
        </div>
      </div>
    )
  }

  const overview = stats?.overview || {}

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
        <p className="text-lg text-slate-600">Platform overview and system metrics</p>
      </div>

      <StatsGrid
        stats={[
          { label: 'Total students', value: overview.totalLearners, format: 'number' },
          { label: 'Total instructors', value: overview.totalInstructors, format: 'number' },
          { label: 'LMS Bank Balance', value: overview.lmsBankBalance, format: 'currency' },
        ]}
      />

      <DashboardSection title="Platform Overview" description="High-level KPIs updated in real-time">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Courses', value: overview.totalCourses, icon: '📚' },
            { label: 'Total Enrollments', value: overview.totalEnrollments, icon: '📝' },
            { label: 'Total Revenue', value: currency(overview.totalRevenue), icon: '💰' },
            { label: 'Admin Income', value: currency(overview.adminIncome || 0), icon: '🛡️' },
          ].map((item) => (
            <div key={item.label} className="card-elevated rounded-2xl bg-gradient-to-br from-white to-slate-50 p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Monthly Revenue" description="Bar chart visualizing the last 12 months">
        <div className="h-80 w-full rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.monthlyRevenueChart || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardSection>
    </div>
  )
}
