import { supabase } from '../../../lib/supabase'

function normalizeDashboardData(data) {
  return {
    profile: data?.profile ?? null,
    course: data?.course ?? null,

    statistics: {
      totalLessonsStarted: data?.statistics?.totalLessonsStarted ?? 0,
      completedLessons: data?.statistics?.completedLessons ?? 0,
      totalStudySeconds: data?.statistics?.totalStudySeconds ?? 0,
      totalCourseLessons: data?.statistics?.totalCourseLessons ?? 0,
      completedCourseLessons: data?.statistics?.completedCourseLessons ?? 0,
      overallCourseProgress: data?.statistics?.overallCourseProgress ?? 0,
      completedStudySessions: data?.statistics?.completedStudySessions ?? 0,
    },

    continueLearning: data?.continueLearning ?? null,
    activeSession: data?.activeSession ?? null,
    units: Array.isArray(data?.units) ? data.units : [],
    generatedAt: data?.generatedAt ?? null,
  }
}

async function getStudentDashboard() {
  const { data, error } = await supabase.rpc('get_student_dashboard')

  if (error) {
    throw new Error(error.message || 'Student dashboard data could not be loaded.')
  }

  return normalizeDashboardData(data)
}

export {
  getStudentDashboard,
}

