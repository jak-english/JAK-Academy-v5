import {
  createRichTextContent,
  createRichTextSegment,
  isRichTextContent,
  richTextToPlainText,
} from './richTextSchema'

function normalizeRange(
  start,
  end,
  textLength,
) {
  const safeStart =
    Math.max(
      0,
      Math.min(
        Number(start) || 0,
        textLength,
      ),
    )

  const safeEnd =
    Math.max(
      safeStart,
      Math.min(
        Number(end) || 0,
        textLength,
      ),
    )

  return {
    start: safeStart,
    end: safeEnd,
  }
}

function getRichTextLength(
  richText,
) {
  if (
    !isRichTextContent(
      richText,
    )
  ) {
    return 0
  }

  return richText.segments.reduce(
    (total, segment) =>
      total +
      String(
        segment?.text || '',
      ).length,
    0,
  )
}

function getSegmentKey(
  segment,
) {
  return JSON.stringify(
    segment?.marks || {},
  )
}

function mergeAdjacentSegments(
  segments,
) {
  const merged = []

  segments.forEach(
    (segment) => {
      const text =
        String(
          segment?.text || '',
        )

      if (!text) {
        return
      }

      const previous =
        merged[
          merged.length - 1
        ]

      if (
        previous &&
        getSegmentKey(
          previous,
        ) ===
          getSegmentKey(
            segment,
          )
      ) {
        previous.text += text
        return
      }

      merged.push(
        createRichTextSegment(
          text,
          segment?.marks || {},
        ),
      )
    },
  )

  return merged
}

function getMarksAtOffset(
  richText,
  offset,
) {
  if (
    !isRichTextContent(
      richText,
    )
  ) {
    return {}
  }

  let cursor = 0

  for (
    const segment
    of richText.segments
  ) {
    const text =
      String(
        segment?.text || '',
      )

    const end =
      cursor +
      text.length

    if (
      offset >= cursor &&
      offset <= end
    ) {
      return {
        ...(segment?.marks ||
          {}),
      }
    }

    cursor = end
  }

  const lastSegment =
    richText.segments[
      richText.segments.length - 1
    ]

  return {
    ...(lastSegment?.marks ||
      {}),
  }
}

function applyMarkToRange(
  richText,
  start,
  end,
  markName,
  markValue,
) {
  const content =
    isRichTextContent(
      richText,
    )
      ? richText
      : createRichTextContent('')

  const textLength =
    getRichTextLength(
      content,
    )

  const range =
    normalizeRange(
      start,
      end,
      textLength,
    )

  if (
    range.start ===
    range.end
  ) {
    return content
  }

  const nextSegments = []

  let cursor = 0

  content.segments.forEach(
    (segment) => {
      const segmentText =
        String(
          segment?.text || '',
        )

      const segmentStart =
        cursor

      const segmentEnd =
        cursor +
        segmentText.length

      cursor =
        segmentEnd

      const overlaps =
        range.start <
          segmentEnd &&
        range.end >
          segmentStart

      if (!overlaps) {
        nextSegments.push(
          createRichTextSegment(
            segmentText,
            segment?.marks ||
              {},
          ),
        )

        return
      }

      const localStart =
        Math.max(
          range.start -
            segmentStart,
          0,
        )

      const localEnd =
        Math.min(
          range.end -
            segmentStart,
          segmentText.length,
        )

      const before =
        segmentText.slice(
          0,
          localStart,
        )

      const selected =
        segmentText.slice(
          localStart,
          localEnd,
        )

      const after =
        segmentText.slice(
          localEnd,
        )

      if (before) {
        nextSegments.push(
          createRichTextSegment(
            before,
            segment?.marks ||
              {},
          ),
        )
      }

      if (selected) {
        nextSegments.push(
          createRichTextSegment(
            selected,
            {
              ...(segment?.marks ||
                {}),

              [markName]:
                markValue,
            },
          ),
        )
      }

      if (after) {
        nextSegments.push(
          createRichTextSegment(
            after,
            segment?.marks ||
              {},
          ),
        )
      }
    },
  )

  return {
    version:
      content.version || 1,

    segments:
      mergeAdjacentSegments(
        nextSegments,
      ),
  }
}

function clearMarksFromRange(
  richText,
  start,
  end,
) {
  const content =
    isRichTextContent(
      richText,
    )
      ? richText
      : createRichTextContent('')

  const textLength =
    getRichTextLength(
      content,
    )

  const range =
    normalizeRange(
      start,
      end,
      textLength,
    )

  if (
    range.start ===
    range.end
  ) {
    return content
  }

  const nextSegments = []

  let cursor = 0

  content.segments.forEach(
    (segment) => {
      const segmentText =
        String(
          segment?.text || '',
        )

      const segmentStart =
        cursor

      const segmentEnd =
        cursor +
        segmentText.length

      cursor =
        segmentEnd

      const overlaps =
        range.start <
          segmentEnd &&
        range.end >
          segmentStart

      if (!overlaps) {
        nextSegments.push(
          createRichTextSegment(
            segmentText,
            segment?.marks ||
              {},
          ),
        )

        return
      }

      const localStart =
        Math.max(
          range.start -
            segmentStart,
          0,
        )

      const localEnd =
        Math.min(
          range.end -
            segmentStart,
          segmentText.length,
        )

      const before =
        segmentText.slice(
          0,
          localStart,
        )

      const selected =
        segmentText.slice(
          localStart,
          localEnd,
        )

      const after =
        segmentText.slice(
          localEnd,
        )

      if (before) {
        nextSegments.push(
          createRichTextSegment(
            before,
            segment?.marks ||
              {},
          ),
        )
      }

      if (selected) {
        nextSegments.push(
          createRichTextSegment(
            selected,
          ),
        )
      }

      if (after) {
        nextSegments.push(
          createRichTextSegment(
            after,
            segment?.marks ||
              {},
          ),
        )
      }
    },
  )

  return {
    version:
      content.version || 1,

    segments:
      mergeAdjacentSegments(
        nextSegments,
      ),
  }
}

function replaceTextRange(
  richText,
  start,
  end,
  replacementText,
) {
  const content =
    isRichTextContent(
      richText,
    )
      ? richText
      : createRichTextContent('')

  const textLength =
    getRichTextLength(
      content,
    )

  const range =
    normalizeRange(
      start,
      end,
      textLength,
    )

  const insertText =
    String(
      replacementText || '',
    )

  const inheritedMarks =
    getMarksAtOffset(
      content,
      range.start,
    )

  const nextSegments = []

  let cursor = 0
  let inserted = false

  content.segments.forEach(
    (segment) => {
      const segmentText =
        String(
          segment?.text || '',
        )

      const segmentStart =
        cursor

      const segmentEnd =
        cursor +
        segmentText.length

      cursor =
        segmentEnd

      if (
        segmentEnd <=
        range.start
      ) {
        nextSegments.push(
          createRichTextSegment(
            segmentText,
            segment?.marks ||
              {},
          ),
        )

        return
      }

      if (
        segmentStart >=
        range.end
      ) {
        if (
          !inserted &&
          insertText
        ) {
          nextSegments.push(
            createRichTextSegment(
              insertText,
              inheritedMarks,
            ),
          )

          inserted = true
        }

        nextSegments.push(
          createRichTextSegment(
            segmentText,
            segment?.marks ||
              {},
          ),
        )

        return
      }

      const beforeLength =
        Math.max(
          range.start -
            segmentStart,
          0,
        )

      const afterStart =
        Math.min(
          Math.max(
            range.end -
              segmentStart,
            0,
          ),
          segmentText.length,
        )

      const before =
        segmentText.slice(
          0,
          beforeLength,
        )

      const after =
        segmentText.slice(
          afterStart,
        )

      if (before) {
        nextSegments.push(
          createRichTextSegment(
            before,
            segment?.marks ||
              {},
          ),
        )
      }

      if (
        !inserted &&
        insertText
      ) {
        nextSegments.push(
          createRichTextSegment(
            insertText,
            inheritedMarks,
          ),
        )

        inserted = true
      }

      if (after) {
        nextSegments.push(
          createRichTextSegment(
            after,
            segment?.marks ||
              {},
          ),
        )
      }
    },
  )

  if (
    !inserted &&
    insertText
  ) {
    nextSegments.push(
      createRichTextSegment(
        insertText,
        inheritedMarks,
      ),
    )
  }

  return {
    version:
      content.version || 1,

    segments:
      mergeAdjacentSegments(
        nextSegments,
      ),
  }
}

function updateRichTextFromPlainText(
  richText,
  newPlainText,
) {
  const content =
    isRichTextContent(
      richText,
    )
      ? richText
      : createRichTextContent('')

  const oldText =
    richTextToPlainText(
      content,
    )

  const nextText =
    String(
      newPlainText || '',
    )

  if (
    oldText === nextText
  ) {
    return content
  }

  let prefixLength = 0

  while (
    prefixLength <
      oldText.length &&
    prefixLength <
      nextText.length &&
    oldText[prefixLength] ===
      nextText[prefixLength]
  ) {
    prefixLength += 1
  }

  let oldSuffixIndex =
    oldText.length - 1

  let newSuffixIndex =
    nextText.length - 1

  while (
    oldSuffixIndex >=
      prefixLength &&
    newSuffixIndex >=
      prefixLength &&
    oldText[
      oldSuffixIndex
    ] ===
      nextText[
        newSuffixIndex
      ]
  ) {
    oldSuffixIndex -= 1
    newSuffixIndex -= 1
  }

  const replacement =
    nextText.slice(
      prefixLength,
      newSuffixIndex + 1,
    )

  return replaceTextRange(
    content,
    prefixLength,
    oldSuffixIndex + 1,
    replacement,
  )
}

export {
  applyMarkToRange,
  clearMarksFromRange,
  getRichTextLength,
  mergeAdjacentSegments,
  replaceTextRange,
  updateRichTextFromPlainText,
}