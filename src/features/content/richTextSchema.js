const RICH_TEXT_VERSION = 1

const RICH_TEXT_COLORS = {
  DEFAULT: 'default',
  NAVY: 'navy',
  GOLD: 'gold',
  RED: 'red',
  GREEN: 'green',
  PURPLE: 'purple',
}

const RICH_TEXT_HIGHLIGHTS = {
  NONE: 'none',
  YELLOW: 'yellow',
  GREEN: 'green',
  BLUE: 'blue',
  PINK: 'pink',
}

const RICH_TEXT_SIZES = {
  NORMAL: 'normal',
  LARGE: 'large',
  XL: 'xl',
}

const RICH_TEXT_ROLES = {
  NONE: 'none',

  // Reading tools
  KEY_WORD: 'key_word',
  PRONOUN: 'pronoun',
  ANSWER_EVIDENCE: 'answer_evidence',

  // General teaching tools
  IMPORTANT: 'important',
  DEFINITION: 'definition',
}

function createRichTextMark(
  overrides = {},
) {
  return {
    bold: false,
    italic: false,
    underline: false,

    color:
      RICH_TEXT_COLORS.DEFAULT,

    highlight:
      RICH_TEXT_HIGHLIGHTS.NONE,

    size:
      RICH_TEXT_SIZES.NORMAL,

    role:
      RICH_TEXT_ROLES.NONE,

    ...overrides,
  }
}

function createRichTextSegment(
  text = '',
  marks = {},
) {
  return {
    text: String(text),

    marks: createRichTextMark(
      marks,
    ),
  }
}

function createRichTextContent(
  text = '',
) {
  return {
    version: RICH_TEXT_VERSION,

    segments: text
      ? [
          createRichTextSegment(
            text,
          ),
        ]
      : [],
  }
}

function isRichTextContent(
  value,
) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      Array.isArray(
        value.segments,
      ),
  )
}

function richTextToPlainText(
  richText,
) {
  if (
    !isRichTextContent(
      richText,
    )
  ) {
    return ''
  }

  return richText.segments
    .map(
      (segment) =>
        String(
          segment?.text || '',
        ),
    )
    .join('')
}

export {
  RICH_TEXT_VERSION,
  RICH_TEXT_COLORS,
  RICH_TEXT_HIGHLIGHTS,
  RICH_TEXT_SIZES,
  RICH_TEXT_ROLES,

  createRichTextMark,
  createRichTextSegment,
  createRichTextContent,
  isRichTextContent,
  richTextToPlainText,
}