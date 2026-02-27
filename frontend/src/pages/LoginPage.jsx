import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { roleRoutes } from '../utils/formatters.js'

const roles = [
  { label: 'Learner', value: 'learner', icon: '🎓', color: 'from-teal-500 to-emerald-500' },
  { label: 'Instructor', value: 'instructor', icon: '👨‍🏫', color: 'from-purple-500 to-indigo-500' },
  { label: 'Admin', value: 'admin', icon: '⚙️', color: 'from-orange-500 to-red-500' },
]

export const LoginPage = () => {
  const location = useLocation()
  const [form, setForm] = useState({
    email: '',
    password: '',
    role: location.state?.role || 'learner',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      await login(form.role, { email: form.email, password: form.password })
      showToast({
        type: 'success',
        title: 'Welcome back',
        message: 'You are logged in successfully.',
      })
      const redirectTo =
        location.state?.from?.pathname ||
        roleRoutes[form.role] ||
        '/dashboard/learner'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Login failed',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = roles.find(r => r.value === form.role) || roles[0]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Left Panel - Decorative */}
        <div className={`relative bg-gradient-to-br ${selectedRole.color} p-12 flex flex-col justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />

          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 h-32 w-32 rounded-full border-2 border-white/30 animate-float" />
          <div className="absolute bottom-20 left-10 h-24 w-24 rounded-2xl border-2 border-white/30 rotate-12 animate-float delay-200" />

          <div className="relative z-10 text-white space-y-6 animate-fade-in">
            <div className="text-7xl mb-4">{selectedRole.icon}</div>
            <h2 className="text-4xl font-bold">Welcome Back!</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Sign in to access your {selectedRole.label.toLowerCase()} dashboard and continue your learning journey.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">Access your courses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">Track your progress</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">Connect with community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="bg-white p-12 flex flex-col justify-center">
          <div className="space-y-2 mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>
            <p className="text-slate-600">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up delay-100">
            <div className="grid gap-3">
              <Label htmlFor="role">Select Your Role</Label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: role.value }))}
                    className={`p-3 rounded-xl border-2 transition-all ${form.role === role.value
                      ? `border-transparent bg-gradient-to-br ${role.color} text-white shadow-lg`
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                  >
                    <div className="text-2xl mb-1">{role.icon}</div>
                    <div className="text-xs font-medium">{role.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange}
                className="h-12"
              />
            </div>

            <Button
              className={`w-full h-12 bg-gradient-to-r ${selectedRole.color} text-white border-0 shadow-lg hover:shadow-xl transition-all`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              New to StudyHub Academy?{' '}
              <button
                type="button"
                className="font-semibold text-teal-600 underline-offset-2 hover:underline"
                onClick={() => navigate('/signup')}
              >
                Create an account
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
