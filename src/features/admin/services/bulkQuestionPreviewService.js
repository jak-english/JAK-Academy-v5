import { supabase } from '../../../lib/supabase'

async function checkAdminQuestionDuplicates(
  canonicalQuestions,
) {
  const candidates =
    (canonicalQuestions || []).map(
      (question) => ({
        question_type:
          question.question_type,
        prompt_json:
          question.prompt_json,
        answer_config:
          question.answer_config,
      }),
    )

  if (!candidates.length) {
    return []
  }

  const { data, error } =
    await supabase.rpc(
      'admin_check_question_duplicates',
      {
        candidate_questions:
          candidates,
      },
    )

  if (error) {
    throw new Error(error.message)
  }

  return Array.isArray(data)
    ? data
    : []
}

export {
  checkAdminQuestionDuplicates,
}
