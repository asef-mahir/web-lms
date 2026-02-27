import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HeroSection } from '../components/home/HeroSection.jsx'
import { FeaturesSection } from '../components/home/FeaturesSection.jsx'
import { MostViewedGrid } from '../components/home/MostViewedGrid.jsx'
import { StatsSection } from '../components/home/StatsSection.jsx'
import { CTASection } from '../components/home/CTASection.jsx'
import { courseService } from '../services/api.js'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'

export const HomePage = () => {
  const navigate = useNavigate()
  const [mostViewed, setMostViewed] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [trending, grouped] = await Promise.all([
          courseService.getMostViewed(6),
          courseService.getByTitleGroup(),
        ])
        setMostViewed(trending || [])
        setCategories(grouped || [])
      } catch (err) {
        setError(err.message)
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

  const scrollToCourses = () => {
    document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExplore = () => {
    if (isAuthenticated && user?.role === 'Learner') {
      navigate('/dashboard/learner/buy')
      return
    }
    scrollToCourses()
  }

  const handleViewCourse = (course) => {
    navigate(`/courses/${course?._id || ''}`, { state: { preview: course } })
  }

  const handleGetStarted = () => {
    if (isAuthenticated) {
      handleExplore()
    } else {
      navigate('/signup')
    }
  }

  return (
    <div className="space-y-0 pb-20">
      <HeroSection onExplore={handleExplore} />

      {error && (
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-100 bg-rose-50 px-6 py-4 text-rose-700 animate-fade-in">
          {error}
        </div>
      )}

      <FeaturesSection />

      {loading ? (
        <div className="mx-auto max-w-6xl px-6 text-center text-slate-500 py-12">
          <div className="animate-pulse">Loading courses...</div>
        </div>
      ) : (
        <MostViewedGrid
          courses={mostViewed.slice(0, 3)}
          onSelectCourse={handleViewCourse}
          onViewAll={handleExplore}
        />
      )}

      <StatsSection />

      <CTASection onGetStarted={handleGetStarted} />
    </div>
  )
}
