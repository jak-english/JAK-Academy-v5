import { NavLink, Outlet } from 'react-router-dom'

import logo from '../../assets/logo.png'
import { useAuth } from '../auth/AuthProvider'
import './AdminLayout.css'

const adminSections = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '⌂',
        to: '/admin',
        enabled: true,
        end: true,
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        id: 'users',
        label: 'Users',
        icon: 'U',
        to: '/admin/users',
        enabled: true,
      },
      {
        id: 'roles',
        label: 'Roles & Access',
        icon: 'R',
        enabled: false,
      },
    ],
  },
  {
    title: 'Learning',
    items: [
      {
        id: 'units',
        label: 'Units',
        icon: 'U',
        to: '/admin/units',
        enabled: true,
      },
      {
        id: 'foundations',
        label: 'Foundations',
        icon: 'F',
        to: '/admin/foundations',
        enabled: true,
      },
      {
        id: 'study-plans',
        label: 'Study Plans',
        icon: 'P',
        to: '/admin/study-plans',
        enabled: true,
      },
    ],
  },
  {
    title: 'Assessment',
    items: [
      {
        id: 'questions',
        label: 'Question Bank',
        icon: 'Q',
        to: '/admin/questions',
        enabled: true,
      },
      {
        id: 'question-sets',
        label: 'Question Sets',
        icon: 'S',
        to: '/admin/question-sets',
        enabled: true,
      },
      {
        id: 'exams',
        label: 'Exams',
        icon: 'E',
        to: '/admin/exams',
        enabled: true,
      },
      {
        id: 'results',
        label: 'Results',
        icon: 'A',
        to: '/admin/results',
        enabled: true,
      },
    ],
  },
  {
    title: 'Platform',
    items: [
      {
        id: 'subscriptions',
        label: 'Subscriptions',
        icon: '$',
        enabled: false,
      },
      {
        id: 'games',
        label: 'Games',
        icon: 'G',
        enabled: false,
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: 'L',
        enabled: false,
      },
      {
        id: 'settings',
        label: 'Site Settings',
        icon: '⚙',
        enabled: false,
      },
    ],
  },
]

function AdminLayout() {
  const { profile, user, signOut } = useAuth()

  const displayName =
    profile?.full_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Super Admin'

  async function handleSignOut() {
    try {
      await signOut()
    } catch (error) {
      console.error('Admin sign-out error:', error.message)
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src={logo} alt="JAK Academy" />

          <div>
            <strong>JAK Academy</strong>
            <span>Control Center</span>
          </div>
        </div>

        <nav
          className="admin-sidebar__navigation"
          aria-label="Admin navigation"
        >
          {adminSections.map((section) => (
            <section
              className="admin-sidebar__section"
              key={section.title}
            >
              <h2>{section.title}</h2>

              <div className="admin-sidebar__items">
                {section.items.map((item) =>
                  item.enabled ? (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        [
                          'admin-sidebar__link',
                          isActive
                            ? 'admin-sidebar__link--active'
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')
                      }
                    >
                      <span
                        className="admin-sidebar__icon"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>
                    </NavLink>
                  ) : (
                    <button
                      className="admin-sidebar__link admin-sidebar__link--disabled"
                      type="button"
                      disabled
                      key={item.id}
                    >
                      <span
                        className="admin-sidebar__icon"
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>

                      <small>Next</small>
                    </button>
                  ),
                )}
              </div>
            </section>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <NavLink
            className="admin-sidebar__home-link"
            to="/"
          >
            ← View website
          </NavLink>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar__heading">
            <span>Administration</span>
            <strong>Platform Management</strong>
          </div>

          <div className="admin-topbar__account">
            <div className="admin-topbar__avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="admin-topbar__user">
              <strong>{displayName}</strong>
              <span>Super Administrator</span>
            </div>

            <button
              className="admin-topbar__logout"
              type="button"
              onClick={handleSignOut}
            >
              Log out
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout





