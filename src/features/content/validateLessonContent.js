import {
  LESSON_BLOCK_TYPES,
} from './lessonContentSchema'

import {
  normalizeLessonContent,
} from './normalizeLessonContent'

function createEmptyReport() {
  return {
    isValid: true,

    counts: {
      blocks: 0,
      headings: 0,
      paragraphs: 0,
      vocabularyTables: 0,
      vocabularyItems: 0,
      notes: 0,
      dividers: 0,
      audioBlocks: 0,
    },

    issues: {
      errors: [],
      warnings: [],
    },

    duplicates: {
      vocabularyWords: [],
    },
  }
}

function addError(
  report,
  code,
  message,
  details = {},
) {
  report.issues.errors.push({
    code,
    message,
    ...details,
  })

  report.isValid = false
}

function addWarning(
  report,
  code,
  message,
  details = {},
) {
  report.issues.warnings.push({
    code,
    message,
    ...details,
  })
}

function validateHeading(
  block,
  blockIndex,
  report,
) {
  report.counts.headings += 1

  const text = String(
    block.data?.text || '',
  ).trim()

  if (!text) {
    addWarning(
      report,
      'empty_heading',
      'A heading block has no text.',
      {
        blockId: block.id,
        blockIndex,
      },
    )
  }
}

function validateParagraph(
  block,
  blockIndex,
  report,
) {
  report.counts.paragraphs += 1

  const text = String(
    block.data?.text || '',
  ).trim()

  if (!text) {
    addWarning(
      report,
      'empty_paragraph',
      'A paragraph block is empty.',
      {
        blockId: block.id,
        blockIndex,
      },
    )
  }
}

function validateNote(
  block,
  blockIndex,
  report,
) {
  report.counts.notes += 1

  const text = String(
    block.data?.text || '',
  ).trim()

  if (!text) {
    addWarning(
      report,
      'empty_note',
      'A note block has no text.',
      {
        blockId: block.id,
        blockIndex,
      },
    )
  }
}

function validateVocabularyTable(
  block,
  blockIndex,
  report,
  vocabularyWordMap,
) {
  report.counts.vocabularyTables += 1

  const items = Array.isArray(
    block.data?.items,
  )
    ? block.data.items
    : []

  report.counts.vocabularyItems +=
    items.length

  if (items.length === 0) {
    addWarning(
      report,
      'empty_vocabulary_table',
      'A vocabulary table has no items.',
      {
        blockId: block.id,
        blockIndex,
      },
    )

    return
  }

  items.forEach(
    (item, itemIndex) => {
      const word = String(
        item.word || '',
      ).trim()

      const meaningAr = String(
        item.meaning_ar || '',
      ).trim()

      const example = String(
        item.example || '',
      ).trim()

      if (!word) {
        addError(
          report,
          'missing_vocabulary_word',
          'A vocabulary item has no word.',
          {
            blockId: block.id,
            blockIndex,
            itemIndex,
          },
        )
      }

      if (!meaningAr) {
        addWarning(
          report,
          'missing_arabic_meaning',
          `Vocabulary item ${
            word || itemIndex + 1
          } has no Arabic meaning.`,
          {
            blockId: block.id,
            blockIndex,
            itemIndex,
            word,
          },
        )
      }

      if (!example) {
        addWarning(
          report,
          'missing_example',
          `Vocabulary item ${
            word || itemIndex + 1
          } has no example sentence.`,
          {
            blockId: block.id,
            blockIndex,
            itemIndex,
            word,
          },
        )
      }

      if (word) {
        const normalizedWord =
          word.toLowerCase()

        const existingItems =
          vocabularyWordMap.get(
            normalizedWord,
          ) || []

        existingItems.push({
          word,
          blockId: block.id,
          blockIndex,
          itemIndex,
        })

        vocabularyWordMap.set(
          normalizedWord,
          existingItems,
        )
      }
    },
  )
}

function validateAudio(
  block,
  blockIndex,
  report,
) {
  report.counts.audioBlocks += 1

  const storagePath = String(
    block.data?.storagePath || '',
  ).trim()

  if (!storagePath) {
    addError(
      report,
      'missing_audio_storage_path',
      'An audio block has no storage path.',
      {
        blockId: block.id,
        blockIndex,
      },
    )
  }
}

function collectDuplicateWords(
  vocabularyWordMap,
) {
  return Array.from(
    vocabularyWordMap.entries(),
  )
    .filter(
      ([, occurrences]) =>
        occurrences.length > 1,
    )
    .map(
      ([normalizedWord, occurrences]) => ({
        normalizedWord,
        word:
          occurrences[0]?.word ||
          normalizedWord,
        count: occurrences.length,
        occurrences,
      }),
    )
}

function validateLessonContent(
  content,
) {
  const normalizedContent =
    normalizeLessonContent(content)

  const report =
    createEmptyReport()

  const blocks =
    normalizedContent.blocks

  report.counts.blocks =
    blocks.length

  const vocabularyWordMap =
    new Map()

  if (blocks.length === 0) {
    addWarning(
      report,
      'empty_lesson',
      'The lesson contains no content blocks.',
    )
  }

  blocks.forEach(
    (block, blockIndex) => {
      switch (block.type) {
        case LESSON_BLOCK_TYPES.HEADING:
          validateHeading(
            block,
            blockIndex,
            report,
          )
          break

        case LESSON_BLOCK_TYPES.PARAGRAPH:
          validateParagraph(
            block,
            blockIndex,
            report,
          )
          break

        case LESSON_BLOCK_TYPES.VOCABULARY_TABLE:
          validateVocabularyTable(
            block,
            blockIndex,
            report,
            vocabularyWordMap,
          )
          break

        case LESSON_BLOCK_TYPES.NOTE:
          validateNote(
            block,
            blockIndex,
            report,
          )
          break

        case LESSON_BLOCK_TYPES.DIVIDER:
          report.counts.dividers += 1
          break

        case LESSON_BLOCK_TYPES.AUDIO:
          validateAudio(
            block,
            blockIndex,
            report,
          )
          break

        default:
          addError(
            report,
            'unsupported_block',
            `Unsupported block type: ${block.type}`,
            {
              blockId: block.id,
              blockIndex,
            },
          )
      }
    },
  )

  report.duplicates.vocabularyWords =
    collectDuplicateWords(
      vocabularyWordMap,
    )

  report.duplicates.vocabularyWords.forEach(
    (duplicate) => {
      addWarning(
        report,
        'duplicate_vocabulary_word',
        `Possible duplicate vocabulary word: ${duplicate.word}`,
        {
          word: duplicate.word,
          count: duplicate.count,
          occurrences:
            duplicate.occurrences,
        },
      )
    },
  )

  return report
}

export {
  validateLessonContent,
}

