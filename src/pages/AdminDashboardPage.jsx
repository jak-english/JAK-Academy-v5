import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/AuthProvider'
import './AdminDashboardPage.css'

function AdminDashboardPage() {
  const { profile } = useAuth()

  const displayName =
    profile?.full_name?.trim() || 'Super Admin'

  return (
    <main className="admin-page">
      <div className="admin-page__shell">
        <div className="admin-page__topbar">
          <div className="admin-page__identity">
            <span
              className="admin-page__avatar"
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>

            <div className="admin-page__identity-text">
              <span>Super Admin</span>
              <strong>{displayName}</strong>
            </div>
          </div>

          <Link className="admin-page__home-link" to="/">
            ← Back to home
          </Link>
        </div>

        <section className="admin-page__hero">
          <span className="admin-page__eyebrow">
            JAK Academy Administration
          </span>

          <h1>Super Admin Dashboard</h1>

          <p>
            Manage the platform, students, teachers, subscriptions,
            content, exams, and learning progress from one central
            workspace.
          </p>
        </section>

        <section className="admin-page__grid">
          <Link className="admin-page__card" to="/admin/users">
            <span>Users</span>
            <h2>Students and Teachers</h2>
            <p>
              Review accounts, roles, access levels, and activity.
            </p>
          </Link>

          <Link className="admin-page__card" to="/admin/questions">
            <span>Content</span>
            <h2>Units and Exams</h2>
            <p>
              Manage lessons, questions, exams, and published content.
            </p>
          </Link>

          <Link className="admin-page__card" to="/admin/users">
            <span>Business</span>
            <h2>Subscriptions</h2>
            <p>
              Review premium access, plans, payments, and expiry dates.
            </p>
          </Link>
        </section>
      </div>
    </main>
  )
}

export default AdminDashboardPage