import { supabase } from '../../../lib/supabase'

async function getAdminStudyPlanSettings() {
  const { data, error } = await supabase.rpc(
    'admin_get_study_plan_settings',
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

async function updateAdminStudyPlanSettings({
  courseId,
  dailyStudyMinutes,
  dailyLessonCount,
  upcomingLessonCount,
  isActive,
}) {
  const { data, error } = await supabase.rpc(
    'admin_update_study_plan_settings',
    {
      target_course_id: courseId,
      new_daily_study_minutes: dailyStudyMinutes,
      new_daily_lesson_count: dailyLessonCount,
      new_upcoming_lesson_count: upcomingLessonCount,
      new_is_active: isActive,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export {
  getAdminStudyPlanSettings,
  updateAdminStudyPlanSettings,
}
