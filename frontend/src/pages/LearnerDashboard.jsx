import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { learnerService } from '../services/api.js'
import { DashboardSection } from '../components/dashboard/DashboardSection.jsx'
import { CourseCard } from '../components/dashboard/CourseCard.jsx'
import { StatsGrid } from '../components/dashboard/StatsGrid.jsx'
import { Button } from '../components/ui/button.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'
import { getInitials } from '../utils/formatters.js'
import { CertificateModal } from '../components/certificate/CertificateModal.jsx'
import { BankSetupModal } from '../components/common/BankSetupModal.jsx'

export const LearnerDashboard = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCertificate, setSelectedCertificate] = useState(null)
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, updateUser } = useAuth()
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)
  const [balance, setBalance] = useState(null)

  // check if user has bank details
  useEffect(() => {
    if (user && !user.bank_account_number) {
      // Delay slightly to default to "Welcome" feel
      const timer = setTimeout(() => setIsBankModalOpen(true), 1000)
      return () => clearTimeout(timer)
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await learnerService.myCourses()
        setCourses(Array.isArray(data) ? data : [])
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Unable to load courses',
          message: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [showToast])

  const stats = useMemo(() => {
    if (!courses.length) {
      return [
        { label: 'Active Courses', value: 0, format: 'number' },
        { label: 'Completed', value: 0, format: 'number' },
        { label: 'Average Progress', value: 0, format: 'number', subtext: '% completed' },
      ]
    }
    const completed = courses.filter(
      (course) => (course.status || '').toLowerCase() === 'completed',
    )
    const avgProgress = Math.round(
      courses.reduce((sum, course) => sum + (course.progress_percentage || 0), 0) /
      courses.length,
    )
    return [
      { label: 'Active Courses', value: courses.length, format: 'number' },
      { label: 'Completed', value: completed.length, format: 'number' },
      { label: 'Average Progress', value: avgProgress, format: 'number', subtext: '% completed' },
    ]
  }, [courses])

  const inProgress = courses
    .filter((course) => (course.status || '').toLowerCase() !== 'completed')
    .slice(0, 3)
  const completedCourses = courses.filter(
    (course) => (course.status || '').toLowerCase() === 'completed',
  )

  const handleContinueCourse = (course) => {
    navigate(`/dashboard/learner/course/${course.courseId}`)
  }

  const handleViewCertificate = (course) => {
    setSelectedCertificate({
      studentName: user?.fullName,
      courseName: course.title,
      instructorName: course.instructorName,
      date: new Date(), // In a real app, this should be the completion date from the backend
      certificateId: 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase() // Should come from backend
    })
    setIsCertificateModalOpen(true)
  }

  if (loading) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="animate-pulse text-slate-500">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row animate-fade-in">
      <aside className="flex flex-col gap-6 lg:w-80">
        <div className="card-elevated rounded-3xl bg-white p-6">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-xl font-bold text-white shadow-lg">
              {getInitials(user?.fullName || user?.userName)}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Learner</p>
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

        <div className="card-elevated rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 p-6 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-100">Explore More</p>
            <h3 className="mt-2 text-2xl font-bold">Buy Courses</h3>
            <p className="mt-2 text-sm text-teal-50 leading-relaxed">
              Browse all courses and enroll instantly to expand your knowledge.
            </p>
            <Button
              className="mt-4 w-full bg-white text-teal-600 hover:bg-teal-50 border-0 shadow-lg"
              onClick={() => navigate('/dashboard/learner/buy')}
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Welcome Back!</h1>
            <p className="text-lg text-slate-600 mt-1">Continue where you left off or start something new</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-2" onClick={() => navigate('/dashboard/learner/courses')}>
              View All
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0"
              onClick={() => navigate('/dashboard/learner/buy')}
            >
              Discover Courses
            </Button>
          </div>
        </div>

        <StatsGrid stats={stats} />

        <DashboardSection
          title="Continue learning"
          description="Pick up right where you stopped last time"
          action={
            <Button variant="ghost" onClick={() => navigate('/dashboard/learner/courses')}>
              Manage courses
            </Button>
          }
        >
          {inProgress.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {inProgress.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  onPrimary={handleContinueCourse}
                  primaryLabel="Continue course"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-50">
              <div className="text-5xl mb-4">📚</div>
              <p className="text-slate-500">No active courses yet. Explore the catalog to begin.</p>
              <Button
                className="mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0"
                onClick={() => navigate('/dashboard/learner/buy')}
              >
                Browse Courses
              </Button>
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Completed certificates" description="Celebrate your wins">
          {completedCourses.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {completedCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  onPrimary={handleContinueCourse}
                  primaryLabel="Revisit content"
                  secondaryAction={
                    <Button
                      variant="outline"
                      className="w-full mt-2 border-[#caa45f] text-[#caa45f] hover:bg-[#caa45f] hover:text-white"
                      onClick={() => handleViewCertificate(course)}
                    >
                      View Certificate
                    </Button>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-50">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-slate-500">Complete a course to unlock your first certificate.</p>
            </div>
          )}
        </DashboardSection>
      </div>
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        data={selectedCertificate}
      />

      {/* Bank Setup Modal */}
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
