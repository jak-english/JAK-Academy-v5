const LESSON_EDITOR_PROFILES = Object.freeze({
  vocabulary: Object.freeze({
    key: 'vocabulary',
    label: 'VOCABULARY MODE',
    description:
      'Prioritize word, meaning, example, usage notes, and vocabulary practice.',
    primaryBlocks: Object.freeze([
      'Vocabulary table',
      'Paragraph',
      'Note',
    ]),
    richTextTools: Object.freeze([
      'Key Word',
      'Definition',
      'Important',
    ]),
  }),

  reading: Object.freeze({
    key: 'reading',
    label: 'READING MODE',
    description:
      'Prioritize passage formatting, pronouns, key words, answer evidence, and paragraph analysis.',
    primaryBlocks: Object.freeze([
      'Paragraph',
      'Heading',
      'Note',
    ]),
    richTextTools: Object.freeze([
      'Pronoun',
      'Evidence',
      'Key Word',
      'Important',
    ]),
  }),

  grammar: Object.freeze({
    key: 'grammar',
    label: 'GRAMMAR MODE',
    description:
      'Prioritize rules, examples, important forms, definitions, and grammar practice.',
    primaryBlocks: Object.freeze([
      'Paragraph',
      'Note',
      'Heading',
    ]),
    richTextTools: Object.freeze([
      'Important',
      'Definition',
      'Key Word',
      'Evidence',
    ]),
  }),

  writing: Object.freeze({
    key: 'writing',
    label: 'WRITING MODE',
    description:
      'Prioritize model text, structure, useful language, notes, and writing guidance.',
    primaryBlocks: Object.freeze([
      'Paragraph',
      'Heading',
      'Note',
    ]),
    richTextTools: Object.freeze([
      'Key Word',
      'Important',
      'Definition',
    ]),
  }),

  notes: Object.freeze({
    key: 'notes',
    label: 'NOTES MODE',
    description:
      'Prioritize concise notes, reminders, definitions, and important points.',
    primaryBlocks: Object.freeze([
      'Note',
      'Paragraph',
      'Heading',
    ]),
    richTextTools: Object.freeze([
      'Important',
      'Definition',
      'Key Word',
    ]),
  }),

  default: Object.freeze({
    key: 'general',
    label: 'GENERAL MODE',
    description:
      'Use the shared lesson tools for this section.',
    primaryBlocks: Object.freeze([
      'Paragraph',
      'Heading',
      'Note',
      'Vocabulary table',
    ]),
    richTextTools: Object.freeze([
      'Key Word',
      'Important',
      'Definition',
    ]),
  }),
})

function normalizeSectionType(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function getLessonEditorProfile(context) {
  const sectionType =
    normalizeSectionType(
      context?.section?.sectionType,
    )

  return (
    LESSON_EDITOR_PROFILES[
      sectionType
    ] ||
    LESSON_EDITOR_PROFILES.default
  )
}

export {
  LESSON_EDITOR_PROFILES,
  getLessonEditorProfile,
}

