import {
  normalizeQuestionDraft,
} from '../core/normalizeQuestion.js'

import {
  validateCanonicalQuestion,
} from '../core/validateQuestion.js'

function splitTextBlocks(input) {
  return String(input || '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n(?=\s*(?:Q(?:uestion)?\s*:|\d+\s*[).:-]))/i)
    .map((block) => block.trim())
    .filter(Boolean)
}

function stripQuestionPrefix(text) {
  return String(text || '')
    .replace(/^\s*(?:Q(?:uestion)?\s*:|\d+\s*[).:-])\s*/i, '')
    .trim()
}

function parseOptionLine(line) {
  const match = String(line || '').match(
    /^\s*([A-Ha-h]|\d+)\s*[).:-]\s*(.+?)\s*$/,
  )

  if (!match) {
    return null
  }

  return {
    label: match[1],
    text: match[2].trim(),
  }
}

function parseLabeledTextBlock(block) {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    throw new Error('Empty question block.')
  }

  const raw = {
    prompt: '',
    options: [],
    answer: '',
    explanation: '',
    type: 'mcq',
  }

  const promptLines = [
    stripQuestionPrefix(lines[0]),
  ]

  let mode = 'prompt'

  for (const line of lines.slice(1)) {
    const answerMatch = line.match(
      /^(?:answer|correct(?:\s+answer)?|ans)\s*:\s*(.+)$/i,
    )

    if (answerMatch) {
      raw.answer = answerMatch[1].trim()
      mode = 'after-answer'
      continue
    }

    const explanationMatch = line.match(
      /^(?:explanation|reason|feedback|solution)\s*:\s*(.*)$/i,
    )

    if (explanationMatch) {
      raw.explanation = explanationMatch[1].trim()
      mode = 'explanation'
      continue
    }

    const typeMatch = line.match(
      /^(?:type)\s*:\s*(.+)$/i,
    )

    if (typeMatch) {
      raw.type = typeMatch[1].trim()
      continue
    }

    const option = parseOptionLine(line)

    if (option && mode !== 'explanation') {
      raw.options.push(option.text)
      mode = 'options'
      continue
    }

    if (mode === 'explanation') {
      raw.explanation = [
        raw.explanation,
        line,
      ].filter(Boolean).join(' ')
      continue
    }

    if (mode === 'prompt') {
      promptLines.push(line)
    }
  }

  raw.prompt = stripQuestionPrefix(
    promptLines.join(' '),
  )

  const tfAnswer = String(raw.answer)
    .trim()
    .toLowerCase()

  if (
    raw.options.length === 0 &&
    [
      'true',
      'false',
      't',
      'f',
      'صح',
      'صحيح',
      'خطأ',
      'خطا',
    ].includes(tfAnswer)
  ) {
    raw.type = 'true_false'
  }

  return raw
}

function parseJsonInput(input) {
  const parsed = JSON.parse(input)

  if (Array.isArray(parsed)) {
    return parsed
  }

  if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray(parsed.questions)
  ) {
    return parsed.questions
  }

  if (
    parsed &&
    typeof parsed === 'object'
  ) {
    return [parsed]
  }

  throw new Error(
    'JSON must contain a question object or an array of questions.',
  )
}

function parseBulkQuestionInput(input) {
  const text = String(input || '').trim()

  if (!text) {
    return []
  }

  if (
    text.startsWith('[') ||
    text.startsWith('{')
  ) {
    return parseJsonInput(text)
  }

  return splitTextBlocks(text)
    .map(parseLabeledTextBlock)
}

function prepareBulkQuestionPreview(
  input,
  {
    lessonId = null,
    blockId = null,
    difficulty = 'medium',
    status = 'draft',
    tags = '',
  } = {},
) {
  let parsedItems

  try {
    parsedItems =
      parseBulkQuestionInput(input)
  } catch (error) {
    return {
      items: [],
      parseError:
        error.message ||
        'Bulk input could not be parsed.',
    }
  }

  const items = parsedItems.map(
    (rawQuestion, index) => {
      try {
        const merged = {
          ...rawQuestion,
          lessonId:
            rawQuestion.lessonId ??
            rawQuestion.lesson_id ??
            rawQuestion.source_lesson_id ??
            lessonId,
          blockId:
            rawQuestion.blockId ??
            rawQuestion.block_id ??
            rawQuestion.source_block_id ??
            blockId,
          difficulty:
            rawQuestion.difficulty ??
            difficulty,
          status:
            rawQuestion.status ??
            status,
          tags:
            rawQuestion.tags ??
            tags,
        }

        const canonicalQuestion =
          normalizeQuestionDraft(merged)

        const validation =
          validateCanonicalQuestion(
            canonicalQuestion,
          )

        if (!validation.valid) {
          return {
            index,
            status: 'error',
            rawQuestion,
            canonicalQuestion,
            errors:
              validation.errors ||
              ['Invalid question.'],
          }
        }

        return {
          index,
          status: 'valid',
          rawQuestion,
          canonicalQuestion,
          errors: [],
        }
      } catch (error) {
        return {
          index,
          status: 'error',
          rawQuestion,
          canonicalQuestion: null,
          errors: [
            error.message ||
              'Question could not be normalized.',
          ],
        }
      }
    },
  )

  return {
    items,
    parseError: '',
  }
}

export {
  parseBulkQuestionInput,
  prepareBulkQuestionPreview,
}



