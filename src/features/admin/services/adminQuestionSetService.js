import { supabase } from '../../../lib/supabase'

async function listAdminQuestionSets({
  lessonId = null,
  status = null,
  purpose = null,
  search = null,
  limit = 50,
  offset = 0,
} = {}) {
  const { data, error } = await supabase.rpc(
    'admin_list_question_sets',
    {
      p_lesson_id: lessonId,
      p_status: status,
      p_purpose: purpose,
      p_search: search,
      p_limit: limit,
      p_offset: offset,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

async function getAdminQuestionSet(questionSetId) {
  const { data, error } = await supabase.rpc(
    'admin_get_question_set',
    {
      p_question_set_id: questionSetId,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function saveAdminQuestionSet({
  id = null,
  lessonId,
  title,
  description = null,
  purpose = 'practice',
  status = 'draft',
}) {
  const { data, error } = await supabase.rpc(
    'admin_save_question_set',
    {
      p_id: id,
      p_lesson_id: lessonId,
      p_title: title,
      p_description: description,
      p_purpose: purpose,
      p_status: status,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

async function replaceAdminQuestionSetItems(
  questionSetId,
  items,
) {
  const { data, error } = await supabase.rpc(
    'admin_replace_question_set_items',
    {
      p_question_set_id: questionSetId,
      p_items: items,
    },
  )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data) ? data : []
}

export {
  getAdminQuestionSet,
  listAdminQuestionSets,
  replaceAdminQuestionSetItems,
  saveAdminQuestionSet,
}
