import {
  lazy,
  Suspense,
} from 'react'
import {
  Route,
  Routes,
} from 'react-router-dom'

import ProtectedRoute from './features/auth/ProtectedRoute'

const AdminLayout = lazy(
  () => import('./features/admin/AdminLayout'),
)

const HomePage = lazy(
  () => import('./pages/HomePage'),
)
const LoginPage = lazy(
  () => import('./pages/LoginPage'),
)
const ForgotPasswordPage = lazy(
  () => import('./pages/ForgotPasswordPage'),
)
const ResetPasswordPage = lazy(
  () => import('./pages/ResetPasswordPage'),
)
const RegisterPage = lazy(
  () => import('./pages/RegisterPage'),
)

const AdminDashboardPage = lazy(
  () => import('./pages/AdminDashboardPage'),
)
const AdminLessonEditorPage = lazy(
  () => import('./pages/AdminLessonEditorPage'),
)
const AdminExamsPage = lazy(
  () => import('./pages/AdminExamsPage'),
)
const AdminQuestionBankPage = lazy(
  () => import('./pages/AdminQuestionBankPage'),
)
const AdminQuestionSetsPage = lazy(
  () => import('./pages/AdminQuestionSetsPage'),
)
const AdminResultsPage = lazy(
  () => import('./pages/AdminResultsPage'),
)
const AdminUserDetailsPage = lazy(
  () => import('./pages/AdminUserDetailsPage'),
)
const AdminUnitsPage = lazy(
  () => import('./pages/AdminUnitsPage'),
)
const AdminStudyPlansPage = lazy(
  () => import('./pages/AdminStudyPlansPage'),
)
const AdminFoundationsPage = lazy(
  () => import('./pages/AdminFoundationsPage'),
)
const AdminFoundationLessonEditorPage = lazy(
  () => import('./pages/AdminFoundationLessonEditorPage'),
)
const AdminUsersPage = lazy(
  () => import('./pages/AdminUsersPage'),
)

const StudentDashboardPage = lazy(
  () => import('./pages/StudentDashboardPage'),
)
const StudentStudyPlanPage = lazy(
  () => import('./pages/StudentStudyPlanPage'),
)
const StudentMistakeReviewPage = lazy(
  () => import('./pages/StudentMistakeReviewPage'),
)
const StudentSpacedReviewPage = lazy(
  () => import('./pages/StudentSpacedReviewPage'),
)
const StudentFoundationsPage = lazy(
  () => import('./pages/StudentFoundationsPage'),
)
const StudentFoundationLessonPage = lazy(
  () => import('./pages/StudentFoundationLessonPage'),
)
const StudentAchievementsPage = lazy(
  () => import('./pages/StudentAchievementsPage'),
)
const StudentProfilePage = lazy(
  () => import('./pages/StudentProfilePage'),
)
const StudentLessonPage = lazy(
  () => import('./pages/StudentLessonPage'),
)
const StudentUnitPage = lazy(
  () => import('./pages/StudentUnitPage'),
)
const StudentExamPage = lazy(
  () => import('./pages/StudentExamPage'),
)
const StudentResultsPage = lazy(
  () => import('./pages/StudentResultsPage'),
)

function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: '35vh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px',
        fontWeight: 700,
      }}
    >
      Loading...
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

        {/* Student routes */}
        <Route
          element={
            <ProtectedRoute requireStudent />
          }
        >
          <Route
            path="/student"
            element={<StudentDashboardPage />}
          />

          <Route
            path="/student/profile"
            element={<StudentProfilePage />}
          />

          <Route
            path="/student/foundations"
            element={<StudentFoundationsPage />}
          />

          <Route
            path="/student/foundations/lessons/:lessonId"
            element={<StudentFoundationLessonPage />}
          />

          <Route
            path="/student/results"
            element={<StudentResultsPage />}
          />

          <Route
            path="/student/study-plan"
            element={<StudentStudyPlanPage />}
          />

          <Route
            path="/student/mistakes"
            element={<StudentMistakeReviewPage />}
          />

          <Route
            path="/student/reviews"
            element={<StudentSpacedReviewPage />}
          />

          <Route
            path="/student/achievements"
            element={<StudentAchievementsPage />}
          />

          <Route
            path="/student/units/:unitSlug"
            element={<StudentUnitPage />}
          />

          <Route
            path="/student/lessons/:lessonSlug"
            element={<StudentLessonPage />}
          />

          <Route
            path="/student/exams/:examId"
            element={<StudentExamPage />}
          />

          <Route
            path="/student/exam-attempts/:attemptId"
            element={<StudentExamPage />}
          />
        </Route>

        {/* Super Admin routes */}
        <Route
          element={
            <ProtectedRoute requireSuperAdmin />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminDashboardPage />}
            />

            <Route
              path="units"
              element={<AdminUnitsPage />}
            />

            <Route
              path="study-plans"
              element={<AdminStudyPlansPage />}
            />

            <Route
              path="foundations"
              element={<AdminFoundationsPage />}
            />

            <Route
              path="foundations/lessons/:lessonId/edit"
              element={
                <AdminFoundationLessonEditorPage />
              }
            />

            <Route
              path="users"
              element={<AdminUsersPage />}
            />

            <Route
              path="users/:userId"
              element={<AdminUserDetailsPage />}
            />

            <Route
              path="questions"
              element={<AdminQuestionBankPage />}
            />

            <Route
              path="question-sets"
              element={<AdminQuestionSetsPage />}
            />

            <Route
              path="exams"
              element={<AdminExamsPage />}
            />

            <Route
              path="results"
              element={<AdminResultsPage />}
            />

            <Route
              path="lessons/:lessonId/edit"
              element={<AdminLessonEditorPage />}
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
