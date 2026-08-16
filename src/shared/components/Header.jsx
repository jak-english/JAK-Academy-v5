import { Link } from 'react-router-dom'

import logo from '../../assets/logo.png'
import { useAuth } from '../../features/auth/AuthProvider'
import './Header.css'

const navigationItems = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'units', label: 'Units', href: '#units' },
  {
    id: 'foundations',
    label: 'Foundations',
    href: '#foundations',
  },
  {
    id: 'plans',
    label: 'Study Plans',
    href: '#plans',
  },
  { id: 'games', label: 'Games', href: '#games' },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    href: '#leaderboard',
  },
]

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  super_admin: 'Super Admin',
}

function Header() {
  const {
    isAuthenticated,
    isLoading,
    isSuperAdmin,
    profile,
    user,
    signOut,
  } = useAuth()

  const displayName =
    profile?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'User'

  const roleLabel =
    roleLabels[profile?.role] || 'Student'

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign-out error:', error.message)
    }
  }

  return (
    <header className="site-header">
      <div className="page-container site-header__container">
        <a
          className="site-header__brand"
          href="#home"
          aria-label="JAK Academy home"
        >
          <img
            className="site-header__logo"
            src={logo}
            alt="JAK Academy"
          />
        </a>

        <nav
          className="site-header__navigation"
          aria-label="Main navigation"
        >
          <ul className="site-header__navigation-list">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <a
                  className="site-header__navigation-link"
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <div className="site-header__user">
                    <span
                      className="site-header__user-avatar"
                      aria-hidden="true"
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </span>

                    <div className="site-header__user-details">
                      <strong>{displayName}</strong>
                      <span>{roleLabel}</span>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <Link
                      className="site-header__login"
                      to="/admin"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    className="site-header__login"
                    type="button"
                    onClick={handleSignOut}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  className="site-header__login"
                  to="/login"
                >
                  Log in
                </Link>
              )}
            </>
          )}

          <a
            className="site-header__subscribe"
            href="#subscriptions"
          >
            Subscribe
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header