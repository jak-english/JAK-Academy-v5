import { supabase } from '../../../lib/supabase'

function emptyToNull(value) {
  const text = String(value ?? '').trim()
  return text || null
}

async function listAdminQuestions({
  lessonId = null,
  questionType = null,
  difficulty = null,
  status = null,
  searchText = null,
  limit = 25,
  offset = 0,
} = {}) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 25, 1),
    200,
  )

  const safeOffset = Math.max(
    Number(offset) || 0,
    0,
  )

  const { data, error } = await supabase.rpc(
    'admin_list_questions',
    {
      filter_lesson_id:
        emptyToNull(lessonId),

      filter_question_type:
        emptyToNull(questionType),

      filter_difficulty:
        emptyToNull(difficulty),

      filter_status:
        emptyToNull(status),

      search_text:
        emptyToNull(searchText),

      page_limit:
        safeLimit,

      page_offset:
        safeOffset,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

export {
  listAdminQuestions,
}
