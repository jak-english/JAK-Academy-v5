import {
  QUESTION_CONTRACT_VERSION,
  QUESTION_TYPES,
} from './questionContract.js'

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
}

function nonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function addError(errors, code, path, message) {
  errors.push({
    code,
    path,
    message,
  })
}

function validateCommon(question, errors) {
  if (!isPlainObject(question)) {
    addError(
      errors,
      'QUESTION_NOT_OBJECT',
      '$',
      'Question must be an object.',
    )
    return
  }

  if (question.version !== QUESTION_CONTRACT_VERSION) {
    addError(
      errors,
      'INVALID_VERSION',
      'version',
      `Question version must be ${QUESTION_CONTRACT_VERSION}.`,
    )
  }

  if (
    !Object.values(QUESTION_TYPES).includes(
      question.question_type,
    )
  ) {
    addError(
      errors,
      'UNSUPPORTED_QUESTION_TYPE',
      'question_type',
      'Question type is not supported by Validator v1.',
    )
  }

  if (!isPlainObject(question.prompt_json)) {
    addError(
      errors,
      'INVALID_PROMPT',
      'prompt_json',
      'prompt_json must be an object.',
    )
  } else if (!nonEmptyText(question.prompt_json.text)) {
    addError(
      errors,
      'EMPTY_PROMPT',
      'prompt_json.text',
      'Question prompt cannot be empty.',
    )
  }

  if (!isPlainObject(question.answer_config)) {
    addError(
      errors,
      'INVALID_ANSWER_CONFIG',
      'answer_config',
      'answer_config must be an object.',
    )
  }

  if (!isPlainObject(question.explanation_json)) {
    addError(
      errors,
      'INVALID_EXPLANATION',
      'explanation_json',
      'explanation_json must be an object.',
    )
  } else if (
    typeof question.explanation_json.text !== 'string'
  ) {
    addError(
      errors,
      'INVALID_EXPLANATION_TEXT',
      'explanation_json.text',
      'Explanation text must be a string.',
    )
  }

  if (
    question.source_block_id &&
    !question.source_lesson_id
  ) {
    addError(
      errors,
      'BLOCK_WITHOUT_LESSON',
      'source_block_id',
      'A source block requires a source lesson.',
    )
  }
}

function validateMcq(question, errors) {
  const config = question.answer_config

  if (!isPlainObject(config)) {
    return
  }

  if (!Array.isArray(config.options)) {
    addError(
      errors,
      'MCQ_OPTIONS_NOT_ARRAY',
      'answer_config.options',
      'MCQ options must be an array.',
    )
    return
  }

  if (config.options.length < 2) {
    addError(
      errors,
      'MCQ_TOO_FEW_OPTIONS',
      'answer_config.options',
      'MCQ requires at least 2 options.',
    )
  }

  const ids = new Set()
  const normalizedTexts = new Set()

  config.options.forEach((option, index) => {
    const path = `answer_config.options[${index}]`

    if (!isPlainObject(option)) {
      addError(
        errors,
        'MCQ_OPTION_NOT_OBJECT',
        path,
        'Each MCQ option must be an object.',
      )
      return
    }

    if (!nonEmptyText(option.id)) {
      addError(
        errors,
        'MCQ_OPTION_ID_EMPTY',
        `${path}.id`,
        'Each MCQ option requires a non-empty id.',
      )
    } else {
      const id = option.id.trim().toLowerCase()

      if (ids.has(id)) {
        addError(
          errors,
          'MCQ_DUPLICATE_OPTION_ID',
          `${path}.id`,
          'MCQ option ids must be unique.',
        )
      }

      ids.add(id)
    }

    if (!nonEmptyText(option.text)) {
      addError(
        errors,
        'MCQ_OPTION_TEXT_EMPTY',
        `${path}.text`,
        'Each MCQ option requires non-empty text.',
      )
    } else {
      const normalizedText = option.text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')

      if (normalizedTexts.has(normalizedText)) {
        addError(
          errors,
          'MCQ_DUPLICATE_OPTION_TEXT',
          `${path}.text`,
          'MCQ option texts must be unique.',
        )
      }

      normalizedTexts.add(normalizedText)
    }
  })

  if (!nonEmptyText(config.correctOptionId)) {
    addError(
      errors,
      'MCQ_CORRECT_OPTION_REQUIRED',
      'answer_config.correctOptionId',
      'MCQ requires correctOptionId.',
    )
    return
  }

  const correctId = config.correctOptionId
    .trim()
    .toLowerCase()

  if (!ids.has(correctId)) {
    addError(
      errors,
      'MCQ_CORRECT_OPTION_NOT_FOUND',
      'answer_config.correctOptionId',
      'correctOptionId must reference an existing option id.',
    )
  }
}

function validateTrueFalse(question, errors) {
  const config = question.answer_config

  if (!isPlainObject(config)) {
    return
  }

  if (typeof config.correctAnswer !== 'boolean') {
    addError(
      errors,
      'TF_CORRECT_ANSWER_NOT_BOOLEAN',
      'answer_config.correctAnswer',
      'True/False correctAnswer must be a boolean.',
    )
  }
}

export function validateCanonicalQuestion(question) {
  const errors = []

  validateCommon(question, errors)

  if (
    question?.question_type === QUESTION_TYPES.MCQ
  ) {
    validateMcq(question, errors)
  }

  if (
    question?.question_type ===
    QUESTION_TYPES.TRUE_FALSE
  ) {
    validateTrueFalse(question, errors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function assertValidCanonicalQuestion(question) {
  const report = validateCanonicalQuestion(question)

  if (!report.valid) {
    const error = new Error(
      'Question failed semantic validation.',
    )

    error.name = 'QuestionValidationError'
    error.validation = report

    throw error
  }

  return question
}
