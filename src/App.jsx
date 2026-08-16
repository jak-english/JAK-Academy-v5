import {
  Route,
  Routes,
} from 'react-router-dom'

import AdminLayout from './features/admin/AdminLayout'
import ProtectedRoute from './features/auth/ProtectedRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import RegisterPage from './pages/RegisterPage'

import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLessonEditorPage from './pages/AdminLessonEditorPage'
import AdminExamsPage from './pages/AdminExamsPage'
import AdminQuestionBankPage from './pages/AdminQuestionBankPage'
import AdminQuestionSetsPage from './pages/AdminQuestionSetsPage'
import AdminResultsPage from './pages/AdminResultsPage'
import AdminUserDetailsPage from './pages/AdminUserDetailsPage'
import AdminUnitsPage from './pages/AdminUnitsPage'
import AdminStudyPlansPage from './pages/AdminStudyPlansPage'
import AdminFoundationsPage from './pages/AdminFoundationsPage'
import AdminFoundationLessonEditorPage from './pages/AdminFoundationLessonEditorPage'
import AdminUsersPage from './pages/AdminUsersPage'

import StudentDashboardPage from './pages/StudentDashboardPage'
import StudentStudyPlanPage from './pages/StudentStudyPlanPage'
import StudentMistakeReviewPage from './pages/StudentMistakeReviewPage'
import StudentSpacedReviewPage from './pages/StudentSpacedReviewPage'
import StudentFoundationsPage from './pages/StudentFoundationsPage'
import StudentFoundationLessonPage from './pages/StudentFoundationLessonPage'
import StudentAchievementsPage from './pages/StudentAchievementsPage'
import StudentProfilePage from './pages/StudentProfilePage'
import StudentLessonPage from './pages/StudentLessonPage'
import StudentUnitPage from './pages/StudentUnitPage'
import StudentExamPage from './pages/StudentExamPage'
import StudentResultsPage from './pages/StudentResultsPage'

function App() {
  return (
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

          <Route path="units" element={<AdminUnitsPage />} />

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
            element={<AdminFoundationLessonEditorPage />}
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
            element={
              <AdminQuestionBankPage />
            }
          />

          <Route
            path="question-sets"
            element={
              <AdminQuestionSetsPage />
            }
          />

          <Route
            path="exams"
            element={
              <AdminExamsPage />
            }
          />

          <Route
            path="results"
            element={<AdminResultsPage />}
          />
          <Route
            path="lessons/:lessonId/edit"
            element={
              <AdminLessonEditorPage />
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default App














