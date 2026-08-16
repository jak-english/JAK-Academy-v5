import {
  getLessonBlockDefinition,
  isSupportedLessonBlockType,
} from './lessonContentSchema'

function createLessonBlockId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `lesson-block-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`
}

function cloneDefaultData(defaultData) {
  return JSON.parse(
    JSON.stringify(defaultData ?? {}),
  )
}

function createLessonBlock(
  blockType,
  overrides = {},
) {
  if (
    !isSupportedLessonBlockType(blockType)
  ) {
    throw new Error(
      `Unsupported lesson block type: ${blockType}`,
    )
  }

  const definition =
    getLessonBlockDefinition(blockType)

  return {
    id:
      overrides.id ||
      createLessonBlockId(),
    type: blockType,
    data: {
      ...cloneDefaultData(
        definition.defaultData,
      ),
      ...(overrides.data || {}),
    },
  }
}

export {
  createLessonBlock,
  createLessonBlockId,
}