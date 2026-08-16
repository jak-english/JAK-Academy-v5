const LESSON_CONTENT_VERSION = 1

const LESSON_BLOCK_TYPES = Object.freeze({
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  VOCABULARY_TABLE: 'vocabulary_table',
  NOTE: 'note',
  DIVIDER: 'divider',
  AUDIO: 'audio',
})

const LESSON_BLOCK_TYPE_VALUES = Object.freeze(
  Object.values(LESSON_BLOCK_TYPES),
)

const LESSON_HEADING_LEVELS = Object.freeze([
  1,
  2,
  3,
  4,
])

const LESSON_NOTE_VARIANTS = Object.freeze([
  'info',
  'tip',
  'warning',
  'important',
])

const LESSON_BLOCK_DEFINITIONS = Object.freeze({
  [LESSON_BLOCK_TYPES.HEADING]: {
    type: LESSON_BLOCK_TYPES.HEADING,
    label: 'Heading',
    description:
      'A title or section heading inside the lesson.',
    defaultData: {
      level: 2,
      text: '',
    },
  },

  [LESSON_BLOCK_TYPES.PARAGRAPH]: {
    type: LESSON_BLOCK_TYPES.PARAGRAPH,
    label: 'Paragraph',
    description:
      'A standard explanatory text paragraph.',
    defaultData: {
      text: '',
    },
  },

  [LESSON_BLOCK_TYPES.VOCABULARY_TABLE]: {
    type: LESSON_BLOCK_TYPES.VOCABULARY_TABLE,
    label: 'Vocabulary table',
    description:
      'A table containing words, Arabic meanings, and examples.',
    defaultData: {
      title: '',
      items: [],
    },
  },

  [LESSON_BLOCK_TYPES.NOTE]: {
    type: LESSON_BLOCK_TYPES.NOTE,
    label: 'Note',
    description:
      'A highlighted note, tip, warning, or important message.',
    defaultData: {
      variant: 'info',
      title: 'Note',
      text: '',
    },
  },

  [LESSON_BLOCK_TYPES.DIVIDER]: {
    type: LESSON_BLOCK_TYPES.DIVIDER,
    label: 'Divider',
    description:
      'A visual separator between lesson sections.',
    defaultData: {},
  },
})

function isSupportedLessonBlockType(blockType) {
  return LESSON_BLOCK_TYPE_VALUES.includes(
    blockType,
  )
}

function getLessonBlockDefinition(blockType) {
  return (
    LESSON_BLOCK_DEFINITIONS[blockType] ??
    null
  )
}

function createEmptyLessonContent() {
  return {
    version: LESSON_CONTENT_VERSION,
    blocks: [],
  }
}

export {
  LESSON_BLOCK_DEFINITIONS,
  LESSON_BLOCK_TYPES,
  LESSON_BLOCK_TYPE_VALUES,
  LESSON_CONTENT_VERSION,
  LESSON_HEADING_LEVELS,
  LESSON_NOTE_VARIANTS,
  createEmptyLessonContent,
  getLessonBlockDefinition,
  isSupportedLessonBlockType,
}
