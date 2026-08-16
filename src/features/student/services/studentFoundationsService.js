import { supabase } from '../../../lib/supabase'

export async function getStudentFoundationsOverview() {
  const { data, error } = await supabase.rpc(
    'get_student_foundations_overview'
  )

  if (error) {
    throw error
  }

  return data ?? []
}

export async function getStudentFoundationLesson(lessonId) {
  const { data, error } = await supabase.rpc(
    'get_student_foundation_lesson',
    {
      p_lesson_id: lessonId,
    }
  )

  if (error) {
    throw error
  }

  return data
}