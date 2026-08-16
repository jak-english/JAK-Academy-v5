import {
  QUESTION_CONTRACT_VERSION,
  QUESTION_DIFFICULTIES,
  QUESTION_STATUSES,
  QUESTION_TYPES,
  createCanonicalQuestion,
} from './questionContract.js'

const TYPE_ALIASES = new Map([
  ['mcq', QUESTION_TYPES.MCQ],
  ['multiple choice', QUESTION_TYPES.MCQ],
  ['multiple-choice', QUESTION_TYPES.MCQ],
  ['multiple_choice', QUESTION_TYPES.MCQ],
  ['multiplechoice', QUESTION_TYPES.MCQ],
  ['choice', QUESTION_TYPES.MCQ],
  ['true false', QUESTION_TYPES.TRUE_FALSE],
  ['true/false', QUESTION_TYPES.TRUE_FALSE],
  ['true-false', QUESTION_TYPES.TRUE_FALSE],
  ['true_false', QUESTION_TYPES.TRUE_FALSE],
  ['truefalse', QUESTION_TYPES.TRUE_FALSE],
  ['tf', QUESTION_TYPES.TRUE_FALSE],
  ['t/f', QUESTION_TYPES.TRUE_FALSE],
])

const TRUE_VALUES = new Set(['true', 't', '1', 'yes', 'y', 'صح', 'صحيح'])
const FALSE_VALUES = new Set(['false', 'f', '0', 'no', 'n', 'خطأ', 'خطا', 'غير صحيح'])

const PROMPT_KEYS = ['prompt_json', 'prompt', 'question', 'questionText', 'question_text', 'text', 'stem']
const EXPLANATION_KEYS = ['explanation_json', 'explanation', 'reason', 'feedback', 'solution']
const OPTIONS_KEYS = ['options', 'choices', 'answers', 'alternatives']
const CORRECT_KEYS = [
  'correctOptionId',
  'correct_option_id',
  'correctOption',
  'correct_option',
  'correctAnswer',
  'correct_answer',
  'correct',
  'answer',
]

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value
    : null
}

function firstDefined(object, keys) {
  if (!object) return undefined

  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      object[key] !== undefined
    ) {
      return object[key]
    }
  }

  return undefined
}

function normalizeWhitespace(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim()
}

function normalizeKey(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function normalizeQuestionType(value, input) {
  const normalized = normalizeKey(value)

  if (TYPE_ALIASES.has(normalized)) {
    return TYPE_ALIASES.get(normalized)
  }

  const config =
    asObject(input?.answer_config) ||
    asObject(input?.answerConfig)

  const options =
    firstDefined(input, OPTIONS_KEYS) ??
    firstDefined(config, OPTIONS_KEYS)

  if (options !== undefined) {
    return QUESTION_TYPES.MCQ
  }

  const correct =
    firstDefined(input, CORRECT_KEYS) ??
    firstDefined(config, CORRECT_KEYS)

  if (
    typeof correct === 'boolean' ||
    typeof correct === 'number' ||
    TRUE_VALUES.has(normalizeKey(correct)) ||
    FALSE_VALUES.has(normalizeKey(correct))
  ) {
    return QUESTION_TYPES.TRUE_FALSE
  }

  return normalized || ''
}

function normalizeTextContainer(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return {
      ...value,
      text: normalizeWhitespace(
        value.text ?? value.value ?? value.content ?? '',
      ),
    }
  }

  return { text: normalizeWhitespace(value) }
}

function normalizePrompt(input) {
  return normalizeTextContainer(
    firstDefined(input, PROMPT_KEYS),
  )
}

function normalizeExplanation(input) {
  const raw = firstDefined(input, EXPLANATION_KEYS)
  return raw === undefined
    ? { text: '' }
    : normalizeTextContainer(raw)
}

function optionIdFromIndex(index) {
  return String.fromCharCode(97 + index)
}

function cleanOptionText(value) {
  return normalizeWhitespace(value)
    .replace(
      /^\s*(?:option|choice)?\s*([a-z]|\d+)\s*[.):-]\s*/i,
      '',
    )
    .trim()
}

function parseStringOption(value, index) {
  const text = normalizeWhitespace(value)
  const match = text.match(
    /^(?:option|choice)?\s*([a-z]|\d+)\s*[.):-]\s*(.+)$/i,
  )

  if (!match) {
    return {
      id: optionIdFromIndex(index),
      text,
    }
  }

  const token = match[1]
  const id = /^\d+$/.test(token)
    ? optionIdFromIndex(Number(token) - 1)
    : normalizeKey(token)

  return {
    id,
    text: normalizeWhitespace(match[2]),
  }
}

function normalizeOptions(rawOptions) {
  if (rawOptions == null) return []

  let items = rawOptions

  if (typeof rawOptions === 'string') {
    items = rawOptions
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (!Array.isArray(items) && typeof items === 'object') {
    items = Object.entries(items).map(([id, text]) => ({
      id,
      text,
    }))
  }

  if (!Array.isArray(items)) return []

  return items
    .map((item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const rawId =
          item.id ??
          item.key ??
          item.code ??
          item.label ??
          optionIdFromIndex(index)

        const rawText =
          item.text ??
          item.value ??
          item.content ??
          item.label ??
          ''

        const normalizedId = /^\d+$/.test(String(rawId))
          ? optionIdFromIndex(Number(rawId) - 1)
          : normalizeKey(rawId)

        return {
          id: normalizedId || optionIdFromIndex(index),
          text: cleanOptionText(rawText),
        }
      }

      return parseStringOption(item, index)
    })
    .filter((option) => option.text)
}

function getOptionsSource(input) {
  const direct = firstDefined(input, OPTIONS_KEYS)
  if (direct !== undefined) return direct

  const config =
    asObject(input.answer_config) ||
    asObject(input.answerConfig)

  return firstDefined(config, OPTIONS_KEYS)
}

function getCorrectSource(input) {
  const direct = firstDefined(input, CORRECT_KEYS)
  if (direct !== undefined) return direct

  const config =
    asObject(input.answer_config) ||
    asObject(input.answerConfig)

  return firstDefined(config, CORRECT_KEYS)
}

function resolveCorrectOptionId(rawCorrect, options) {
  if (rawCorrect === null || rawCorrect === undefined) {
    return null
  }

  if (rawCorrect && typeof rawCorrect === 'object') {
    rawCorrect =
      rawCorrect.id ??
      rawCorrect.key ??
      rawCorrect.value ??
      rawCorrect.text
  }

  const normalized = normalizeKey(rawCorrect)
  const wrapped = normalized.match(
    /^(?:option|choice|answer)?\s*([a-z]|\d+)$/i,
  )

  if (wrapped) {
    const token = wrapped[1]

    if (/^\d+$/.test(token)) {
      return options[Number(token) - 1]?.id ?? null
    }

    const byToken = options.find(
      (option) => normalizeKey(option.id) === normalizeKey(token),
    )

    if (byToken) return byToken.id
  }

  const byId = options.find(
    (option) => normalizeKey(option.id) === normalized,
  )
  if (byId) return byId.id

  const byText = options.find(
    (option) => normalizeKey(option.text) === normalized,
  )

  return byText?.id ?? null
}

function normalizeTrueFalseAnswer(value) {
  if (typeof value === 'boolean') return value
  if (value === 1) return true
  if (value === 0) return false

  const normalized = normalizeKey(value)

  if (TRUE_VALUES.has(normalized)) return true
  if (FALSE_VALUES.has(normalized)) return false

  return null
}

function normalizeDifficulty(value) {
  const normalized = normalizeKey(value)

  return Object.values(QUESTION_DIFFICULTIES).includes(normalized)
    ? normalized
    : QUESTION_DIFFICULTIES.MEDIUM
}

function normalizeStatus(value) {
  const normalized = normalizeKey(value)

  return Object.values(QUESTION_STATUSES).includes(normalized)
    ? normalized
    : QUESTION_STATUSES.DRAFT
}

function normalizeTags(value) {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,;]+/)
      : []

  return [
    ...new Set(
      values
        .map(normalizeWhitespace)
        .filter(Boolean),
    ),
  ]
}

export function normalizeQuestionDraft(rawInput) {
  const input = asObject(rawInput) || {}

  const questionType = normalizeQuestionType(
    input.question_type ??
      input.questionType ??
      input.type,
    input,
  )

  let answerConfig = {}

  if (questionType === QUESTION_TYPES.MCQ) {
    const options = normalizeOptions(
      getOptionsSource(input),
    )

    answerConfig = {
      options,
      correctOptionId: resolveCorrectOptionId(
        getCorrectSource(input),
        options,
      ),
    }
  }

  if (questionType === QUESTION_TYPES.TRUE_FALSE) {
    answerConfig = {
      correctAnswer: normalizeTrueFalseAnswer(
        getCorrectSource(input),
      ),
    }
  }

  return createCanonicalQuestion({
    question_type: questionType,
    source_lesson_id:
      input.source_lesson_id ??
      input.sourceLessonId ??
      input.lessonId ??
      null,
    source_block_id:
      input.source_block_id ??
      input.sourceBlockId ??
      input.blockId ??
      null,
    prompt_json: normalizePrompt(input),
    answer_config: answerConfig,
    explanation_json: normalizeExplanation(input),
    difficulty: normalizeDifficulty(input.difficulty),
    status: normalizeStatus(input.status),
    tags: normalizeTags(input.tags),
    version: QUESTION_CONTRACT_VERSION,
  })
}

