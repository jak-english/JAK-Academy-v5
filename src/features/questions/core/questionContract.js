export const QUESTION_CONTRACT_VERSION = 1

export const QUESTION_TYPES = Object.freeze({
  MCQ: 'mcq',
  TRUE_FALSE: 'true_false',
})

export const QUESTION_DIFFICULTIES = Object.freeze({
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
})

export const QUESTION_STATUSES = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
})

export function createCanonicalQuestion(overrides = {}) {
  return {
    question_type: QUESTION_TYPES.MCQ,
    source_lesson_id: null,
    source_block_id: null,
    prompt_json: { text: '' },
    answer_config: {},
    explanation_json: { text: '' },
    difficulty: QUESTION_DIFFICULTIES.MEDIUM,
    status: QUESTION_STATUSES.DRAFT,
    tags: [],
    version: QUESTION_CONTRACT_VERSION,
    ...overrides,
  }
}
