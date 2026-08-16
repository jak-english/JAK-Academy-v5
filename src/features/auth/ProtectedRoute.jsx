import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from './AuthProvider'

function ProtectedRoute({
  requireStudent = false,
  requireTeacher = false,
  requireSuperAdmin = false,
}) {
  const {
    isAuthenticated,
    isLoading,
    isStudent,
    isTeacher,
    isSuperAdmin,
  } = useAuth()

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#020914',
          color: '#ffffff',
        }}
      >
        <p>Loading your account...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/" replace />
  }

  if (requireTeacher && !isTeacher) {
    return <Navigate to="/" replace />
  }

  if (requireStudent && !isStudent) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute