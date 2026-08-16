import {
  normalizeQuestionDraft,
} from '../../questions/core/normalizeQuestion.js'

import {
  assertValidCanonicalQuestion,
} from '../../questions/core/validateQuestion.js'

function normalizeQuestionId(questionId) {
  const value = String(questionId ?? '').trim()
  return value || null
}

function buildRpcPayload(
  questionId,
  canonicalQuestion,
) {
  return {
    target_question_id:
      normalizeQuestionId(questionId),

    new_question_type:
      canonicalQuestion.question_type,

    new_source_lesson_id:
      canonicalQuestion.source_lesson_id,

    new_source_block_id:
      canonicalQuestion.source_block_id,

    new_prompt_json:
      canonicalQuestion.prompt_json,

    new_answer_config:
      canonicalQuestion.answer_config,

    new_explanation_json:
      canonicalQuestion.explanation_json,

    new_difficulty:
      canonicalQuestion.difficulty,

    new_status:
      canonicalQuestion.status,

    new_tags:
      canonicalQuestion.tags,

    new_version:
      canonicalQuestion.version,
  }
}

export function prepareAdminQuestionSave(
  rawQuestion,
  questionId = null,
) {
  const canonicalQuestion =
    normalizeQuestionDraft(rawQuestion)

  assertValidCanonicalQuestion(
    canonicalQuestion,
  )

  return {
    canonicalQuestion,
    rpcPayload: buildRpcPayload(
      questionId,
      canonicalQuestion,
    ),
  }
}
