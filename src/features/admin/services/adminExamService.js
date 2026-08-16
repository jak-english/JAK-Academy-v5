import { supabase } from '../../../lib/supabase'

async function listAdminExams({
  status = null,
  questionSetId = null,
  search = null,
  limit = 50,
  offset = 0,
} = {}) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    200,
  )

  const safeOffset = Math.max(
    Number(offset) || 0,
    0,
  )

  const { data, error } = await supabase.rpc(
    'admin_list_exams',
    {
      filter_status: status || null,
      filter_question_set_id:
        questionSetId || null,
      search_text: search || null,
      page_limit: safeLimit,
      page_offset: safeOffset,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

async function getAdminExam(examId) {
  const { data, error } = await supabase.rpc(
    'admin_get_exam',
    {
      p_exam_id: examId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function saveAdminExam({
  id = null,
  title,
  description = null,
  questionSetId = null,
  durationMinutes = null,
  status = 'draft',
  courseId,
  availableFrom = null,
  availableUntil = null,
  maxAttempts = 1,
}) {
  const { data, error } = await supabase.rpc(
    'admin_save_exam',
    {
      p_id: id,
      p_title: title,
      p_description: description,
      p_source_question_set_id:
        questionSetId,
      p_duration_minutes:
        durationMinutes,
      p_status: status,
      p_course_id: courseId,
      p_available_from: availableFrom,
      p_available_until: availableUntil,
      p_max_attempts: maxAttempts,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function replaceAdminExamItems(
  examId,
  items,
) {
  const { data, error } = await supabase.rpc(
    'admin_replace_exam_items',
    {
      p_exam_id: examId,
      p_items: items,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

export {
  getAdminExam,
  listAdminExams,
  replaceAdminExamItems,
  saveAdminExam,
}

