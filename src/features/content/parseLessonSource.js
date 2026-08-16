import {
  LESSON_BLOCK_TYPES,
  LESSON_CONTENT_VERSION,
} from './lessonContentSchema'

import {
  createLessonBlock,
} from './createLessonBlock'

function splitLines(source) {
  return String(source || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
}

function isBlankLine(line) {
  return !String(line || '').trim()
}

function isHeadingLine(line) {
  return /^#{1,4}\s+/.test(
    String(line || '').trim(),
  )
}

function getHeadingLevel(line) {
  const match = String(line || '')
    .trim()
    .match(/^(#{1,4})\s+/)

  return match
    ? match[1].length
    : 2
}

function getHeadingText(line) {
  return String(line || '')
    .trim()
    .replace(/^#{1,4}\s+/, '')
    .trim()
}

function isDirective(line, name) {
  return (
    String(line || '')
      .trim()
      .toUpperCase() ===
    `[${name}]`
  )
}

function isVocabularyLine(line) {
  const parts = String(line || '')
    .split('|')
    .map((part) => part.trim())

  return parts.length >= 2
}

function parseVocabularyLine(line) {
  const parts = String(line || '')
    .split('|')
    .map((part) => part.trim())

  return {
    word: parts[0] || '',
    meaning_ar: parts[1] || '',
    example:
      parts.slice(2).join(' | ') || '',
  }
}

function flushParagraph(
  paragraphLines,
  blocks,
) {
  const text = paragraphLines
    .join(' ')
    .trim()

  if (!text) {
    return []
  }

  blocks.push(
    createLessonBlock(
      LESSON_BLOCK_TYPES.PARAGRAPH,
      {
        data: {
          text,
        },
      },
    ),
  )

  return []
}

function flushVocabulary(
  vocabularyItems,
  blocks,
) {
  if (vocabularyItems.length === 0) {
    return []
  }

  blocks.push(
    createLessonBlock(
      LESSON_BLOCK_TYPES.VOCABULARY_TABLE,
      {
        data: {
          title: '',
          items: vocabularyItems,
        },
      },
    ),
  )

  return []
}

function parseLessonSource(source) {
  const lines = splitLines(source)

  const blocks = []

  let paragraphLines = []
  let vocabularyItems = []

  let mode = 'normal'
  let noteLines = []
  let noteVariant = 'info'

  function flushOpenContent() {
    paragraphLines = flushParagraph(
      paragraphLines,
      blocks,
    )

    vocabularyItems =
      flushVocabulary(
        vocabularyItems,
        blocks,
      )
  }

  function flushNote() {
    const noteText = noteLines
      .join(' ')
      .trim()

    if (noteText) {
      blocks.push(
        createLessonBlock(
          LESSON_BLOCK_TYPES.NOTE,
          {
            data: {
              variant: noteVariant,
              title: 'Note',
              text: noteText,
            },
          },
        ),
      )
    }

    noteLines = []
    noteVariant = 'info'
    mode = 'normal'
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index]
    const line = rawLine.trim()

    if (mode === 'note') {
      const nextDirective =
        isDirective(line, 'DIVIDER') ||
        isDirective(line, 'NOTE') ||
        isDirective(line, 'TIP') ||
        isDirective(line, 'WARNING') ||
        isDirective(line, 'IMPORTANT')

      if (nextDirective) {
        flushNote()
        index -= 1
        continue
      }

      if (isBlankLine(line)) {
        flushNote()
        continue
      }

      noteLines.push(line)
      continue
    }

    if (isBlankLine(line)) {
      flushOpenContent()
      continue
    }

    if (isHeadingLine(line)) {
      flushOpenContent()

      blocks.push(
        createLessonBlock(
          LESSON_BLOCK_TYPES.HEADING,
          {
            data: {
              level:
                getHeadingLevel(line),
              text:
                getHeadingText(line),
            },
          },
        ),
      )

      continue
    }

    if (isDirective(line, 'DIVIDER')) {
      flushOpenContent()

      blocks.push(
        createLessonBlock(
          LESSON_BLOCK_TYPES.DIVIDER,
        ),
      )

      continue
    }

    if (
      isDirective(line, 'NOTE') ||
      isDirective(line, 'TIP') ||
      isDirective(line, 'WARNING') ||
      isDirective(line, 'IMPORTANT')
    ) {
      flushOpenContent()

      if (isDirective(line, 'TIP')) {
        noteVariant = 'tip'
      } else if (
        isDirective(line, 'WARNING')
      ) {
        noteVariant = 'warning'
      } else if (
        isDirective(line, 'IMPORTANT')
      ) {
        noteVariant = 'important'
      } else {
        noteVariant = 'info'
      }

      mode = 'note'
      continue
    }

    if (isVocabularyLine(line)) {
      paragraphLines =
        flushParagraph(
          paragraphLines,
          blocks,
        )

      vocabularyItems.push(
        parseVocabularyLine(line),
      )

      continue
    }

    vocabularyItems =
      flushVocabulary(
        vocabularyItems,
        blocks,
      )

    paragraphLines.push(line)
  }

  if (mode === 'note') {
    flushNote()
  }

  flushOpenContent()

  return {
    version:
      LESSON_CONTENT_VERSION,
    blocks,
  }
}

export {
  parseLessonSource,
}