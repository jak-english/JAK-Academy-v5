import { supabase } from '../../../lib/supabase'

function normalizeAchievementsData(data) {
  return {
    statistics: {
      completedLessons:
        data?.statistics?.completedLessons ?? 0,

      completedFocusSessions:
        data?.statistics?.completedFocusSessions ?? 0,

      totalStudySeconds:
        data?.statistics?.totalStudySeconds ?? 0,

      totalCourseLessons:
        data?.statistics?.totalCourseLessons ?? 0,

      completedCourseLessons:
        data?.statistics?.completedCourseLessons ?? 0,

      overallCourseProgress:
        data?.statistics?.overallCourseProgress ?? 0,
    },

    achievements:
      Array.isArray(data?.achievements)
        ? data.achievements
        : [],

    generatedAt:
      data?.generatedAt ?? null,
  }
}

async function getStudentAchievements() {
  const { data, error } = await supabase.rpc(
    'get_student_achievements',
  )

  if (error) {
    throw new Error(
      error.message ||
      'Achievements could not be loaded.',
    )
  }

  return normalizeAchievementsData(data)
}

export {
  getStudentAchievements,
}
