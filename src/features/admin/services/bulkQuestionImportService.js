import { supabase } from '../../../lib/supabase'

async function importAdminQuestions(
  canonicalQuestions,
) {
  const candidateQuestions =
    (canonicalQuestions || []).map(
      (question) => ({
        question_type:
          question.question_type,
        source_lesson_id:
          question.source_lesson_id,
        source_block_id:
          question.source_block_id,
        prompt_json:
          question.prompt_json,
        answer_config:
          question.answer_config,
        explanation_json:
          question.explanation_json,
        difficulty:
          question.difficulty,
        status:
          question.status,
        tags:
          question.tags,
        version:
          question.version,
      }),
    )

  if (!candidateQuestions.length) {
    return []
  }

  const { data, error } =
    await supabase.rpc(
      'admin_import_questions',
      {
        candidate_questions:
          candidateQuestions,
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
  importAdminQuestions,
}
