import { Link, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Button } from '../ui/button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { roleRoutes } from '../../utils/formatters.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import logo from '../../assets/logo.png'

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const dashboardRoute = useMemo(() => {
    if (!user?.role) return '/login'
    return roleRoutes[user.role.toLowerCase()] || '/login'
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="app-header sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="StudyHub Academy Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-violet-500 transition-all">
            StudyHub Academy
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="dark-toggle"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </Button>
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                className="hover:border-indigo-200"
                onClick={() => navigate(dashboardRoute)}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
