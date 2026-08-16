import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getUsers } from '../features/admin/services/adminUsersService'
import './AdminUsersPage.css'

const roleLabels = {
  student: 'Student',
  teacher: 'Teacher',
  super_admin: 'Super Admin',
}

function formatDate(dateValue) {
  if (!dateValue) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}

function getPremiumStatus(user) {
  if (!user.is_premium) {
    return {
      label: 'Free',
      className: 'admin-users__badge--free',
    }
  }

  if (
    user.premium_until &&
    new Date(user.premium_until) < new Date()
  ) {
    return {
      label: 'Expired',
      className: 'admin-users__badge--expired',
    }
  }

  return {
    label: 'Premium',
    className: 'admin-users__badge--premium',
  }
}

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const usersData = await getUsers()

        if (isMounted) {
          setUsers(usersData)
        }
      } catch (error) {
        if (isMounted) {
          console.error(
            'Admin users loading error:',
            error.message,
          )

          setErrorMessage(
            'Unable to load users. Check the profiles RLS policy.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const statistics = useMemo(() => {
    return {
      total: users.length,

      students: users.filter(
        (user) => user.role === 'student',
      ).length,

      teachers: users.filter(
        (user) => user.role === 'teacher',
      ).length,

      premium: users.filter((user) => {
        if (!user.is_premium) return false

        if (!user.premium_until) return true

        return new Date(user.premium_until) >= new Date()
      }).length,
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase()

    return users.filter((user) => {
      const matchesRole =
        roleFilter === 'all' || user.role === roleFilter

      const searchableContent = [
        user.full_name,
        user.role,
        user.grade_level,
        user.cohort,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        searchableContent.includes(normalizedSearch)

      return matchesRole && matchesSearch
    })
  }, [users, searchTerm, roleFilter])

  return (
    <div className="admin-users">
      <header className="admin-users__header">
        <div>
          <span className="admin-users__eyebrow">
            User Management
          </span>

          <h1>Users</h1>

          <p>
            Review students, teachers, roles, grade levels and
            subscription access.
          </p>
        </div>

        <div className="admin-users__mode">
          <span aria-hidden="true" />
          Read-only mode
        </div>
      </header>

      <section
        className="admin-users__statistics"
        aria-label="User statistics"
      >
        <article>
          <span>Total users</span>
          <strong>{statistics.total}</strong>
          <small>All registered profiles</small>
        </article>

        <article>
          <span>Students</span>
          <strong>{statistics.students}</strong>
          <small>Student accounts</small>
        </article>

        <article>
          <span>Teachers</span>
          <strong>{statistics.teachers}</strong>
          <small>Teacher accounts</small>
        </article>

        <article>
          <span>Premium</span>
          <strong>{statistics.premium}</strong>
          <small>Active premium access</small>
        </article>
      </section>

      <section className="admin-users__panel">
        <div className="admin-users__toolbar">
          <label className="admin-users__search">
            <span className="sr-only">
              Search users
            </span>

            <input
              type="search"
              value={searchTerm}
              placeholder="Search by name, role, grade or cohort..."
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </label>

          <label className="admin-users__filter">
            <span>Role</span>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value)
              }
            >
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="super_admin">
                Super Admins
              </option>
            </select>
          </label>
        </div>

        {isLoading && (
          <div className="admin-users__state">
            <span className="admin-users__loader" />

            <strong>Loading users...</strong>

            <p>
              Reading profile data from Supabase.
            </p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="admin-users__state admin-users__state--error">
            <strong>Users could not be loaded</strong>

            <p>{errorMessage}</p>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          filteredUsers.length === 0 && (
            <div className="admin-users__state">
              <strong>No users found</strong>

              <p>
                Try changing the search text or role filter.
              </p>
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          filteredUsers.length > 0 && (
            <>
              <div className="admin-users__result-count">
                Showing {filteredUsers.length} of {users.length}{' '}
                users
              </div>

              <div className="admin-users__table-wrapper">
                <table className="admin-users__table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Academic profile</th>
                      <th>Subscription</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => {
                      const premiumStatus =
                        getPremiumStatus(user)

                      const displayName =
                        user.full_name?.trim() ||
                        'Unnamed user'

                      return (
                        <tr key={user.id}>
                          <td>
                            <div className="admin-users__identity">
                              <span
                                className="admin-users__avatar"
                                aria-hidden="true"
                              >
                                {displayName
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>

                              <div>
                                <strong>
                                  {displayName}
                                </strong>

                                <small>
                                  {user.id.slice(0, 8)}…
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`admin-users__role admin-users__role--${user.role}`}
                            >
                              {roleLabels[user.role] ||
                                user.role}
                            </span>
                          </td>

                          <td>
                            <strong className="admin-users__academic">
                              {user.grade_level ||
                                'Grade not set'}
                            </strong>

                            <small>
                              {user.cohort
                                ? `Cohort ${user.cohort}`
                                : 'Cohort not set'}
                            </small>
                          </td>

                          <td>
                            <span
                              className={`admin-users__badge ${premiumStatus.className}`}
                            >
                              {premiumStatus.label}
                            </span>

                            <small>
                              {user.premium_until
                                ? `Until ${formatDate(
                                    user.premium_until,
                                  )}`
                                : 'No expiry date'}
                            </small>
                          </td>

                          <td>
                            <strong>
                              {formatDate(user.created_at)}
                            </strong>
                          </td>

                          <td>
                            <Link
                              className="admin-users__view-link"
                              to={`/admin/users/${user.id}`}
                            >
                              View profile
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
      </section>
    </div>
  )
}

export default AdminUsersPage