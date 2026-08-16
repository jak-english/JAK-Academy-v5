import {
  LESSON_BLOCK_TYPES,
  LESSON_CONTENT_VERSION,
  createEmptyLessonContent,
  getLessonBlockDefinition,
  isSupportedLessonBlockType,
} from './lessonContentSchema'

import {
  createLessonBlock,
  createLessonBlockId,
} from './createLessonBlock'

import {
  createRichTextContent,
  createRichTextSegment,
  isRichTextContent,
  richTextToPlainText,
} from './richTextSchema'

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
}

function normalizeHeadingData(data) {
  const level = Number(data?.level)

  return {
    level:
      level >= 1 && level <= 4
        ? level
        : 2,

    text: String(
      data?.text || '',
    ),

    textAr: String(
      data?.textAr ||
        data?.text_ar ||
        '',
    ),
  }
}

function normalizeRichText(
  richText,
  fallbackText = '',
) {
  if (
    !isRichTextContent(
      richText,
    )
  ) {
    return createRichTextContent(
      fallbackText,
    )
  }

  return {
    version: 1,

    segments:
      richText.segments.map(
        (segment) =>
          createRichTextSegment(
            segment?.text || '',
            segment?.marks || {},
          ),
      ),
  }
}

function normalizeParagraphData(data) {
  const legacyText = String(
    data?.text || '',
  )

  const richText =
    normalizeRichText(
      data?.richText,
      legacyText,
    )

  return {
    richText,

    // Temporary compatibility field.
    // Always derived from richText.
    text:
      richTextToPlainText(
        richText,
      ),

    textAr: String(
      data?.textAr ||
        data?.text_ar ||
        '',
    ),
  }
}

function normalizeVocabularyItem(item) {
  return {
    id:
      item?.id ||
      createLessonBlockId(),

    word: String(
      item?.word || '',
    ),

    meaning_ar: String(
      item?.meaning_ar ||
        item?.meaningAr ||
        '',
    ),

    example: String(
      item?.example || '',
    ),

    example_ar: String(
      item?.example_ar ||
        item?.exampleAr ||
        '',
    ),
  }
}

function normalizeVocabularyTableData(
  data,
) {
  const items = Array.isArray(
    data?.items,
  )
    ? data.items.map(
        normalizeVocabularyItem,
      )
    : []

  return {
    title: String(
      data?.title || '',
    ),

    titleAr: String(
      data?.titleAr ||
        data?.title_ar ||
        '',
    ),

    items,
  }
}

function normalizeNoteData(data) {
  const allowedVariants = [
    'info',
    'tip',
    'warning',
    'important',
  ]

  const variant =
    allowedVariants.includes(
      data?.variant,
    )
      ? data.variant
      : 'info'

  return {
    variant,

    title: String(
      data?.title || 'Note',
    ),

    titleAr: String(
      data?.titleAr ||
        data?.title_ar ||
        '',
    ),

    text: String(
      data?.text || '',
    ),

    textAr: String(
      data?.textAr ||
        data?.text_ar ||
        '',
    ),
  }
}

function normalizeAudioData(data) {
  return {
    title: String(
      data?.title || '',
    ),

    titleAr: String(
      data?.titleAr ||
        data?.title_ar ||
        '',
    ),

    storagePath: String(
      data?.storagePath ||
        data?.storage_path ||
        '',
    ),

    transcript: String(
      data?.transcript || '',
    ),

    transcriptAr: String(
      data?.transcriptAr ||
        data?.transcript_ar ||
        '',
    ),

    pronunciationLabel: String(
      data?.pronunciationLabel ||
        data?.pronunciation_label ||
        '',
    ),

    example: String(
      data?.example || '',
    ),

    exampleAr: String(
      data?.exampleAr ||
        data?.example_ar ||
        '',
    ),
  }
}

function normalizeDividerData() {
  return {}
}

function normalizeBlockData(
  blockType,
  data,
) {
  switch (blockType) {
    case LESSON_BLOCK_TYPES.HEADING:
      return normalizeHeadingData(
        data,
      )

    case LESSON_BLOCK_TYPES.PARAGRAPH:
      return normalizeParagraphData(
        data,
      )

    case LESSON_BLOCK_TYPES.VOCABULARY_TABLE:
      return normalizeVocabularyTableData(
        data,
      )

    case LESSON_BLOCK_TYPES.NOTE:
      return normalizeNoteData(
        data,
      )

    case LESSON_BLOCK_TYPES.DIVIDER:
      return normalizeDividerData()

    case LESSON_BLOCK_TYPES.AUDIO:
      return normalizeAudioData(
        data,
      )

    default:
      return {}
  }
}

function getRawBlockData(block) {
  if (
    isPlainObject(
      block?.data,
    )
  ) {
    return block.data
  }

  return block
}

function normalizeLessonBlock(block) {
  if (!isPlainObject(block)) {
    return null
  }

  const blockType =
    block.type

  if (
    !isSupportedLessonBlockType(
      blockType,
    )
  ) {
    return null
  }

  const definition =
    getLessonBlockDefinition(
      blockType,
    )

  const rawData =
    getRawBlockData(block)

  return createLessonBlock(
    blockType,
    {
      id: block.id,

      data: {
        ...definition.defaultData,

        ...normalizeBlockData(
          blockType,
          rawData,
        ),
      },
    },
  )
}

function normalizeLessonContent(
  content,
) {
  if (!isPlainObject(content)) {
    return createEmptyLessonContent()
  }

  const rawBlocks =
    Array.isArray(
      content.blocks,
    )
      ? content.blocks
      : []

  const blocks =
    rawBlocks
      .map(
        normalizeLessonBlock,
      )
      .filter(Boolean)

  return {
    version:
      LESSON_CONTENT_VERSION,

    blocks,
  }
}

export {
  normalizeLessonBlock,
  normalizeLessonContent,
}
