import { useAuth } from '../features/auth/AuthProvider'
import './AdminDashboardPage.css'

const managementCards = [
  {
    id: 'users',
    label: 'User Management',
    title: 'Students & Teachers',
    description:
      'Manage user accounts, roles, access, grades and activity.',
    status: 'Planned',
  },
  {
    id: 'learning',
    label: 'Learning Content',
    title: 'Units & Foundations',
    description:
      'Build and organize lessons, units, foundations and study plans.',
    status: 'Planned',
  },
  {
    id: 'assessment',
    label: 'Assessment',
    title: 'Questions & Exams',
    description:
      'Create question banks, publish exams and review results.',
    status: 'Planned',
  },
  {
    id: 'subscriptions',
    label: 'Business',
    title: 'Subscriptions',
    description:
      'Control premium access, plans and expiration dates.',
    status: 'Planned',
  },
]

function AdminDashboardPage() {
  const { profile } = useAuth()

  const displayName =
    profile?.full_name?.trim() || 'Super Admin'

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard__welcome">
        <div>
          <span className="admin-dashboard__eyebrow">
            Super Admin Workspace
          </span>

          <h1>Welcome back, {displayName}</h1>

          <p>
            This will be the central control system for every
            important part of JAK Academy.
          </p>
        </div>

        <div className="admin-dashboard__system-status">
          <span className="admin-dashboard__status-dot" />

          <div>
            <strong>Platform status</strong>
            <span>Core systems connected</span>
          </div>
        </div>
      </section>

      <section className="admin-dashboard__stats">
        <article>
          <span>Admin Access</span>
          <strong>Active</strong>
          <small>Protected by role</small>
        </article>

        <article>
          <span>Authentication</span>
          <strong>Connected</strong>
          <small>Supabase Auth</small>
        </article>

        <article>
          <span>Profile Role</span>
          <strong>Super Admin</strong>
          <small>Full platform access</small>
        </article>

        <article>
          <span>Control Modules</span>
          <strong>{managementCards.length}</strong>
          <small>Ready to build</small>
        </article>
      </section>

      <section className="admin-dashboard__section">
        <div className="admin-dashboard__section-heading">
          <div>
            <span>Control Modules</span>
            <h2>Platform management</h2>
          </div>

          <p>
            Each module will be connected separately and tested
            before activation.
          </p>
        </div>

        <div className="admin-dashboard__cards">
          {managementCards.map((card) => (
            <article
              className="admin-dashboard__card"
              key={card.id}
            >
              <div className="admin-dashboard__card-top">
                <span>{card.label}</span>
                <small>{card.status}</small>
              </div>

              <h3>{card.title}</h3>
              <p>{card.description}</p>

              <button type="button" disabled>
                Module not activated yet
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage