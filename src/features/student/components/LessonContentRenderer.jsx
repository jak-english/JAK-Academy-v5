import {
  LESSON_BLOCK_TYPES,
} from '../../content/lessonContentSchema'

import {
  normalizeLessonContent,
} from '../../content/normalizeLessonContent'

import {
  isRichTextContent,
} from '../../content/richTextSchema'

import FoundationAudioPlayer from './FoundationAudioPlayer'

import './LessonContentRenderer.css'

function getRichTextSegmentClasses(
  marks = {},
) {
  const classes = [
    'lesson-rich-text__segment',
  ]

  if (marks.bold) {
    classes.push(
      'lesson-rich-text__segment--bold',
    )
  }

  if (marks.italic) {
    classes.push(
      'lesson-rich-text__segment--italic',
    )
  }

  if (marks.underline) {
    classes.push(
      'lesson-rich-text__segment--underline',
    )
  }

  if (
    marks.color &&
    marks.color !== 'default'
  ) {
    classes.push(
      `lesson-rich-text__color--${marks.color}`,
    )
  }

  if (
    marks.highlight &&
    marks.highlight !== 'none'
  ) {
    classes.push(
      `lesson-rich-text__highlight--${marks.highlight}`,
    )
  }

  if (
    marks.size &&
    marks.size !== 'normal'
  ) {
    classes.push(
      `lesson-rich-text__size--${marks.size}`,
    )
  }

  if (
    marks.role &&
    marks.role !== 'none'
  ) {
    classes.push(
      `lesson-rich-text__role--${marks.role}`,
    )
  }

  return classes.join(' ')
}

function renderRichText(
  richText,
  fallbackText = '',
) {
  if (
    !isRichTextContent(
      richText,
    )
  ) {
    return fallbackText
  }

  return richText.segments.map(
    (segment, index) => {
      const marks =
        segment?.marks || {}

      return (
        <span
          key={`rich-text-segment-${index}`}
          className={
            getRichTextSegmentClasses(
              marks,
            )
          }
        >
          {segment?.text || ''}
        </span>
      )
    },
  )
}

function renderArabicText(
  text,
  className = '',
) {
  if (!text) {
    return null
  }

  return (
    <div
      className={'foundation-ar ' + className}
      dir="rtl"
      lang="ar"
    >
      {text}
    </div>
  )
}

function renderHeading(data) {
  const headingLevel =
    Number(data?.level) || 2

  const text =
    data?.text || ''

  let englishHeading

  if (headingLevel === 1) {
    englishHeading = (
      <h1
        className="lesson-content__heading lesson-content__heading--one"
        dir="ltr"
        lang="en"
      >
        {text}
      </h1>
    )
  } else if (headingLevel === 3) {
    englishHeading = (
      <h3
        className="lesson-content__heading lesson-content__heading--three"
        dir="ltr"
        lang="en"
      >
        {text}
      </h3>
    )
  } else if (headingLevel === 4) {
    englishHeading = (
      <h4
        className="lesson-content__heading lesson-content__heading--four"
        dir="ltr"
        lang="en"
      >
        {text}
      </h4>
    )
  } else {
    englishHeading = (
      <h2
        className="lesson-content__heading lesson-content__heading--two"
        dir="ltr"
        lang="en"
      >
        {text}
      </h2>
    )
  }

  return (
    <div className="lesson-content__bilingual-heading">
      {englishHeading}

      {renderArabicText(
        data?.textAr,
        'foundation-ar--heading',
      )}
    </div>
  )
}

function renderParagraph(data) {
  return (
    <div className="lesson-content__bilingual-text">
      <p
        className="lesson-content__paragraph"
        dir="ltr"
        lang="en"
      >
        {renderRichText(
          data?.richText,
          data?.text || '',
        )}
      </p>

      {renderArabicText(
        data?.textAr,
        'foundation-ar--paragraph',
      )}
    </div>
  )
}

function renderVocabularyTable(data) {
  const items =
    Array.isArray(
      data?.items,
    )
      ? data.items
      : []

  return (
    <div className="lesson-content__vocabulary">
      {(data?.title || data?.titleAr) && (
        <div className="lesson-content__vocabulary-heading">
          {data?.title && (
            <h3
              className="lesson-content__vocabulary-title"
              dir="ltr"
              lang="en"
            >
              {data.title}
            </h3>
          )}

          {renderArabicText(
            data?.titleAr,
            'foundation-ar--vocabulary-title',
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="lesson-content__empty-block">
          <p dir="ltr" lang="en">
            No vocabulary items are available.
          </p>

          <p
            className="foundation-ar"
            dir="rtl"
            lang="ar"
          >
            لا توجد كلمات متاحة في هذا الجزء.
          </p>
        </div>
      ) : (
        <table className="lesson-content__vocabulary-table">
          <thead>
            <tr>
              <th>
                <span
                  className="lesson-content__table-en"
                  dir="ltr"
                  lang="en"
                >
                  Word
                </span>

                <span
                  className="lesson-content__table-ar"
                  dir="rtl"
                  lang="ar"
                >
                  الكلمة
                </span>
              </th>

              <th>
                <span
                  className="lesson-content__table-en"
                  dir="ltr"
                  lang="en"
                >
                  Arabic Meaning
                </span>

                <span
                  className="lesson-content__table-ar"
                  dir="rtl"
                  lang="ar"
                >
                  المعنى بالعربية
                </span>
              </th>

              <th>
                <span
                  className="lesson-content__table-en"
                  dir="ltr"
                  lang="en"
                >
                  Example
                </span>

                <span
                  className="lesson-content__table-ar"
                  dir="rtl"
                  lang="ar"
                >
                  المثال
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {items.map(
              (
                item,
                itemIndex,
              ) => (
                <tr
                  key={
                    item?.id ||
                    item?.word ||
                    `vocabulary-item-${itemIndex}`
                  }
                >
                  <td
                    dir="ltr"
                    lang="en"
                  >
                    <strong>
                      {item?.word || '—'}
                    </strong>
                  </td>

                  <td
                    className="lesson-content__arabic"
                    dir="rtl"
                    lang="ar"
                  >
                    {item?.meaning_ar || '—'}
                  </td>

                  <td>
                    <div
                      className="lesson-content__example-en"
                      dir="ltr"
                      lang="en"
                    >
                      {item?.example || '—'}
                    </div>

                    {renderArabicText(
                      item?.example_ar,
                      'foundation-ar--example',
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
function renderNote(data) {
  const noteVariant =
    data?.variant || 'info'

  return (
    <aside
      className={`lesson-content__note lesson-content__note--${noteVariant}`}
    >
      <div className="lesson-content__note-heading">
        <strong
          className="lesson-content__note-title"
          dir="ltr"
          lang="en"
        >
          {data?.title || 'Note'}
        </strong>

        {renderArabicText(
          data?.titleAr,
          'foundation-ar--note-title',
        )}
      </div>

      <p
        dir="ltr"
        lang="en"
      >
        {data?.text || ''}
      </p>

      {renderArabicText(
        data?.textAr,
        'foundation-ar--note',
      )}
    </aside>
  )
}

function renderDivider() {
  return (
    <hr className="lesson-content__divider" />
  )
}

function renderUnsupportedBlock(
  block,
) {
  return (
    <div className="lesson-content__unsupported">
      <strong>
        Unsupported content block
      </strong>

      <p>
        {block?.type || 'unknown'}
      </p>
    </div>
  )
}

function renderBlockContent(
  block,
) {
  const data =
    block?.data || {}

  switch (block?.type) {
    case LESSON_BLOCK_TYPES.HEADING:
      return renderHeading(data)

    case LESSON_BLOCK_TYPES.PARAGRAPH:
      return renderParagraph(data)

    case LESSON_BLOCK_TYPES.VOCABULARY_TABLE:
      return renderVocabularyTable(
        data,
      )

    case LESSON_BLOCK_TYPES.NOTE:
      return renderNote(data)

    case LESSON_BLOCK_TYPES.DIVIDER:
      return renderDivider()

    case LESSON_BLOCK_TYPES.AUDIO:
      return (
        <FoundationAudioPlayer
          data={data}
        />
      )

    default:
      return renderUnsupportedBlock(
        block,
      )
  }
}

function LessonContentRenderer({
  content,
}) {
  const normalizedContent =
    normalizeLessonContent(
      content,
    )

  const blocks =
    normalizedContent.blocks

  if (blocks.length === 0) {
    return (
      <div className="lesson-content__empty">
        <span>ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¦</span>

        <strong>
          Lesson content is coming soon
        </strong>

        <p>
          No content blocks have been
          added to this lesson yet.
        </p>
      </div>
    )
  }

  return (
    <div className="lesson-content">
      {blocks.map(
        (block, index) => (
          <section
            className="lesson-content__block"
            data-lesson-block-index={
              index
            }
            key={
              block.id ||
              `${block.type}-${index}`
            }
          >
            {renderBlockContent(
              block,
            )}
          </section>
        ),
      )}
    </div>
  )
}

export default LessonContentRenderer

