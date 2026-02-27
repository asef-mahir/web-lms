import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input } from '../components/ui/input.jsx'
import { Label } from '../components/ui/label.jsx'
import { useToast } from '../hooks/useToast.js'
import { useAuth } from '../hooks/useAuth.js'

const roles = [
  { label: 'Learner', value: 'learner', icon: '🎓', color: 'from-teal-500 to-emerald-500' },
  { label: 'Instructor', value: 'instructor', icon: '👨‍🏫', color: 'from-purple-500 to-indigo-500' },
  { label: 'Admin', value: 'admin', icon: '⚙️', color: 'from-orange-500 to-red-500' },
]

export const SignupPage = () => {
  const [form, setForm] = useState({
    role: 'learner',
    fullName: '',
    userName: '',
    phoneNumber: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
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
      await signup(form.role, form)
      showToast({
        type: 'success',
        title: 'Account created',
        message: 'Sign in with your credentials to get started.',
      })
      navigate('/login', { state: { role: form.role } })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Signup failed',
        message: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = roles.find(r => r.value === form.role) || roles[0]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-5 gap-0 rounded-[2.5rem] overflow-hidden shadow-2xl">
        {/* Left Panel - Decorative */}
        <div className={`md:col-span-2 relative bg-gradient-to-br ${selectedRole.color} p-12 flex flex-col justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />

          {/* Floating decorative elements */}
          <div className="absolute top-10 right-10 h-32 w-32 rounded-full border-2 border-white/30 animate-float" />
          <div className="absolute bottom-20 left-10 h-24 w-24 rounded-2xl border-2 border-white/30 rotate-12 animate-float delay-200" />

          <div className="relative z-10 text-white space-y-6 animate-fade-in">
            <div className="text-7xl mb-4">{selectedRole.icon}</div>
            <h2 className="text-4xl font-bold">Join StudyHub Academy</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Create your {selectedRole.label.toLowerCase()} account and unlock access to world-class learning resources.
            </p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">150+ expert-led courses</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">Learn at your own pace</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-white" />
                <span className="text-white/90">Earn certificates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="md:col-span-3 bg-white p-12 flex flex-col justify-center max-h-[90vh] overflow-y-auto">
          <div className="space-y-2 mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
            <p className="text-slate-600">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up delay-100">
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

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Jane Doe"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userName">Username</Label>
                <Input
                  id="userName"
                  name="userName"
                  placeholder="janedoe"
                  required
                  value={form.userName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+1 555 123 4567"
                  required
                  value={form.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <Button
              className={`w-full h-12 bg-gradient-to-r ${selectedRole.color} text-white border-0 shadow-lg hover:shadow-xl transition-all`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-teal-600 underline-offset-2 hover:underline"
                onClick={() => navigate('/login')}
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
