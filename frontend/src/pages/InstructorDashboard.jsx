import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import api, { instructorService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'
import { BankSetupModal } from '../components/common/BankSetupModal.jsx'

export const InstructorDashboard = () => {
  const [overview, setOverview] = useState({ courses: [], totalEarnings: 0 })
  const [earningsBreakdown, setEarningsBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const { user, updateUser } = useAuth()
  // ... (lines in between not shown, but tool handles chunks)

  // I will use two chunks.

  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [balance, setBalance] = useState(null)

  // check if user has bank details
  useEffect(() => {
    if (user && !user.bank_account_number) {
      setTimeout(() => setIsBankModalOpen(true), 1000)
    }
  }, [user])

  const handleCheckBalance = async () => {
    try {
      const response = await api.get('/auth/user/balance')
      const balance = response.data.data.balance
      setBalance(balance)
      showToast({ title: 'Balance', message: `Your current balance is $${balance}` })
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: err.response?.data?.message || err.message || 'Could not fetch balance' })
    }
  }

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const [coursesPayload, earningsPayload] = await Promise.all([
        instructorService.myCourses(),
        instructorService.earningsChart(),
      ])
      setOverview({
        courses: coursesPayload?.courses || [],
        totalEarnings: coursesPayload?.totalEarnings || 0,
      })
      setEarningsBreakdown(earningsPayload || [])
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Unable to load dashboard',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const stats = useMemo(() => {
    const activeCourses = overview.courses.length
    const totalLearners = overview.courses.reduce(
      (sum, course) => sum + (course.studentsEnrolled || 0),
      0,
    )
    return [
      { label: 'Live courses', value: activeCourses, format: 'number' },
      { label: 'Total learners', value: totalLearners, format: 'number' },
      { label: 'Lifetime earnings', value: overview.totalEarnings, format: 'currency' },
    ]
  }, [overview])

  if (loading) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="animate-pulse text-slate-500">Loading instructor dashboard...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row animate-fade-in">
      <aside className="flex flex-col gap-6 lg:w-80">
        <div className="card-elevated rounded-3xl bg-white p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-xl font-bold text-white shadow-lg">
              {getInitials(user?.fullName || user?.userName)}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Instructor</p>
              <p className="font-bold text-slate-900 text-lg">{user?.fullName}</p>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Username</dt>
              <dd className="font-semibold text-slate-900 mt-1">{user?.userName}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</dt>
              <dd className="font-semibold text-slate-900 break-words mt-1">{user?.email}</dd>
            </div>
          </dl>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <Button variant="outline" className="w-full text-xs" onClick={handleCheckBalance}>
              {balance !== null ? `Balance: $${balance}` : 'Check Bank Balance'}
            </Button>
          </div>
        </div>

        <div className="card-elevated rounded-3xl bg-white p-6 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">Launch a new cohort whenever you're ready.</p>
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg"
            onClick={() => navigate('/dashboard/instructor/new-course')}
          >
            New course
          </Button>
          <Button
            variant="outline"
            className="w-full border-2"
            onClick={fetchDashboard}
          >
            Refresh stats
          </Button>
        </div>
      </aside>

      <div className="flex-1 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Instructor Dashboard
            </h1>
            <p className="text-lg text-slate-600 mt-1">Monitor course performance and launch new cohorts</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-2"
              onClick={() => navigate('/dashboard/instructor/new-course')}
            >
              Launch course
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0"
              onClick={fetchDashboard}
            >
              Refresh
            </Button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <DashboardSection title="Your courses" description="Track engagement and earnings per course">
          {overview.courses.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {overview.courses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={{
                    ...course,
                    title: course.title,
                    description: `Enrolled students: ${course.studentsEnrolled}`,
                  }}
                  primaryLabel="Manage course"
                  meta={{
                    students: course.studentsEnrolled,
                    earnings: course.earningsFromThisCourse,
                  }}
                  onPrimary={() => navigate(`/dashboard/instructor/course/${course.courseId}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-50">
              <div className="text-5xl mb-4">🎓</div>
              <p className="text-slate-500">No courses yet. Launch your first course today.</p>
              <Button
                className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0"
                onClick={() => navigate('/dashboard/instructor/new-course')}
              >
                Create Course
              </Button>
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Earnings insights" description="Understand which courses perform the best">
          {earningsBreakdown.length ? (
            <div className="h-80 w-full rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="title" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="totalEarning" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-50">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-slate-500">No earnings data yet.</p>
            </div>
          )}
        </DashboardSection>
      </div>

      <BankSetupModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        onSuccess={(updatedUser) => {
          updateUser(updatedUser)
          setIsBankModalOpen(false)
        }}
      />
    </div>
  )
}
