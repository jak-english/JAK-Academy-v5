import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  createLessonBlock,
  createLessonBlockId,
} from '../features/content/createLessonBlock'

import {
  LESSON_BLOCK_TYPES,
} from '../features/content/lessonContentSchema'

import {
  parseLessonSource,
} from '../features/content/parseLessonSource'

import {
  validateLessonContent,
} from '../features/content/validateLessonContent'

import {
  richTextToPlainText,
} from '../features/content/richTextSchema'

import LessonContentRenderer from '../features/student/components/LessonContentRenderer'

import RichTextEditor from '../features/admin/components/RichTextEditor'

import {
  getLessonEditorProfile,
} from '../features/admin/editor/lessonEditorContext'
import './AdminLessonEditorPage.css'

import {
  getAdminLessonById,
  updateAdminLessonContent,
} from '../features/admin/services/adminLessonContentService'

function AdminLessonEditorPage() {
  const { lessonId } = useParams()

  const [lesson, setLesson] =
    useState(null)

  const [draftContent, setDraftContent] =
    useState(null)


  const [smartSource, setSmartSource] =
    useState('')

  const [importReport, setImportReport] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')


  const [isSaving, setIsSaving] =
    useState(false)

  const [saveMessage, setSaveMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadLesson() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const lessonData =
          await getAdminLessonById(
            lessonId,
          )

        if (!isMounted) {
          return
        }

        setLesson(lessonData)

        setDraftContent(
          lessonData.content_json,
        )
      } catch (error) {
        console.error(
          'Admin lesson loading error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'The lesson could not be loaded.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLesson()

    return () => {
      isMounted = false
    }
  }, [lessonId])


  const editorProfile = useMemo(
    () =>
      getLessonEditorProfile(
        lesson?.context,
      ),
    [lesson?.context],
  )
  const draftStats = useMemo(() => {
    const blocks =
      draftContent?.blocks || []

    let vocabularyItems = 0
    let headingCount = 0
    let paragraphCount = 0
    let noteCount = 0
    let dividerCount = 0

    blocks.forEach((block) => {
      if (
        block.type ===
        LESSON_BLOCK_TYPES.HEADING
      ) {
        headingCount += 1
      }

      if (
        block.type ===
        LESSON_BLOCK_TYPES.PARAGRAPH
      ) {
        paragraphCount += 1
      }

      if (
        block.type ===
        LESSON_BLOCK_TYPES.NOTE
      ) {
        noteCount += 1
      }

      if (
        block.type ===
        LESSON_BLOCK_TYPES.DIVIDER
      ) {
        dividerCount += 1
      }

      if (
        block.type ===
        LESSON_BLOCK_TYPES.VOCABULARY_TABLE
      ) {
        vocabularyItems += Array.isArray(
          block.data?.items,
        )
          ? block.data.items.length
          : 0
      }
    })

    return {
      totalBlocks: blocks.length,
      headingCount,
      paragraphCount,
      noteCount,
      dividerCount,
      vocabularyItems,
    }
  }, [draftContent])


  const draftValidation = useMemo(() => {
    if (!draftContent) {
      return null
    }

    return validateLessonContent(
      draftContent,
    )
  }, [draftContent])

  const hasUnsavedChanges = useMemo(() => {
    if (
      !lesson?.content_json ||
      !draftContent
    ) {
      return false
    }

    return (
      JSON.stringify(draftContent) !==
      JSON.stringify(
        lesson.content_json,
      )
    )
  }, [
    draftContent,
    lesson,
  ])

  const hasBlockingErrors =
    (draftValidation?.issues?.errors
      ?.length || 0) > 0

  function handleBuildLesson() {
    const trimmedSource =
      smartSource.trim()

    if (!trimmedSource) {
      setImportReport({
        error:
          'Paste lesson content before building.',
      })

      return
    }

    try {
      const parsedContent =
        parseLessonSource(
          trimmedSource,
        )

      const validationReport =
        validateLessonContent(
          parsedContent,
        )

      if (
        parsedContent.blocks.length === 0
      ) {
        setImportReport({
          ...validationReport,
          error:
            'No lesson blocks were detected.',
        })

        return
      }

      setImportReport({
        ...validationReport,
        error: '',
      })

      setSaveMessage('')

      if (
        validationReport.issues.errors
          .length > 0
      ) {
        return
      }

      setDraftContent(parsedContent)
    } catch (error) {
      console.error(
        'Smart lesson import error:',
        error,
      )

      setImportReport({
        error:
          error.message ||
          'The lesson could not be parsed.',
      })
    }
  }

  function handleResetToSaved() {
    if (!lesson?.content_json) {
      return
    }

    setDraftContent(
      lesson.content_json,
    )

    setImportReport(null)
    setSaveMessage('')
  }

  async function handleSaveLesson() {
    if (
      !draftContent ||
      !lessonId ||
      isSaving
    ) {
      return
    }

    const validationReport =
      validateLessonContent(
        draftContent,
      )

    setImportReport(
      validationReport,
    )

    if (
      validationReport.issues.errors
        .length > 0
    ) {
      setSaveMessage(
        'Fix the blocking errors before saving.',
      )

      return
    }

    try {
      setIsSaving(true)
      setSaveMessage('Saving...')

      const updatedLesson =
        await updateAdminLessonContent(
          lessonId,
          draftContent,
        )

      setLesson(
        (currentLesson) => ({
          ...currentLesson,
          ...updatedLesson,
        }),
      )

      setDraftContent(
        updatedLesson.content_json,
      )

      setImportReport(
        validateLessonContent(
          updatedLesson.content_json,
        ),
      )

      setSaveMessage(
        'Saved successfully.',
      )
    } catch (error) {
      console.error(
        'Admin lesson save error:',
        error,
      )

      setSaveMessage(
        error.message ||
          'The lesson could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function updateBlockData(
    blockId,
    fieldName,
    value,
  ) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks:
          currentContent.blocks.map(
            (block) => {
              if (block.id !== blockId) {
                return block
              }

              return {
                ...block,

                data: {
                  ...block.data,
                  [fieldName]: value,
                },
              }
            },
          ),
      }),
    )
  }

  function updateParagraphRichText(
    blockId,
    richText,
  ) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks:
          currentContent.blocks.map(
            (block) => {
              if (block.id !== blockId) {
                return block
              }

              return {
                ...block,

                data: {
                  ...block.data,

                  richText,

                  // Keep the temporary
                  // compatibility field derived
                  // from the single Rich Text
                  // source of truth.
                  text:
                    richTextToPlainText(
                      richText,
                    ),
                },
              }
            },
          ),
      }),
    )

    setSaveMessage('')
  }

  function addBlock(blockType) {
    const newBlock =
      createLessonBlock(blockType)

    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks: [
          ...currentContent.blocks,
          newBlock,
        ],
      }),
    )
  }

  function deleteBlock(blockId) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks:
          currentContent.blocks.filter(
            (block) =>
              block.id !== blockId,
          ),
      }),
    )
  }

  function moveBlock(
    blockIndex,
    direction,
  ) {
    setDraftContent(
      (currentContent) => {
        const nextIndex =
          blockIndex + direction

        if (
          nextIndex < 0 ||
          nextIndex >=
            currentContent.blocks.length
        ) {
          return currentContent
        }

        const nextBlocks = [
          ...currentContent.blocks,
        ]

        const currentBlock =
          nextBlocks[blockIndex]

        nextBlocks[blockIndex] =
          nextBlocks[nextIndex]

        nextBlocks[nextIndex] =
          currentBlock

        return {
          ...currentContent,
          blocks: nextBlocks,
        }
      },
    )
  }

  function addVocabularyItem(
    blockId,
  ) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks:
          currentContent.blocks.map(
            (block) => {
              if (block.id !== blockId) {
                return block
              }

              const currentItems =
                Array.isArray(
                  block.data?.items,
                )
                  ? block.data.items
                  : []

              return {
                ...block,

                data: {
                  ...block.data,

                  items: [
                    ...currentItems,
                    {
                      id:
                        createLessonBlockId(),

                      word: '',
                      meaning_ar: '',
                      example: '',
                    },
                  ],
                },
              }
            },
          ),
      }),
    )
  }

  function updateVocabularyItem(
    blockId,
    itemId,
    fieldName,
    value,
  ) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks:
          currentContent.blocks.map(
            (block) => {
              if (block.id !== blockId) {
                return block
              }

              return {
                ...block,

                data: {
                  ...block.data,

                  items:
                    block.data.items.map(
                      (item) =>
                        item.id === itemId
                          ? {
                              ...item,
                              [fieldName]:
                                value,
                            }
                          : item,
                    ),
                },
              }
            },
          ),
      }),
    )
  }

  function deleteVocabularyItem(
    blockId,
    itemId,
  ) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,

        blocks:
          currentContent.blocks.map(
            (block) => {
              if (block.id !== blockId) {
                return block
              }

              return {
                ...block,

                data: {
                  ...block.data,

                  items:
                    block.data.items.filter(
                      (item) =>
                        item.id !== itemId,
                    ),
                },
              }
            },
          ),
      }),
    )
  }

  function renderBlockEditor(
    block,
    index,
  ) {
    const data = block.data || {}

    return (
      <article
        key={block.id}
        style={{
          border:
            '1px solid rgba(132, 171, 208, 0.18)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div>
            <strong>
              Block {index + 1}
            </strong>

            <div>
              {block.type}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              disabled={index === 0}
              onClick={() =>
                moveBlock(index, -1)
              }
            >
              {'\u2191'}
            </button>

            <button
              type="button"
              disabled={
                index ===
                draftContent.blocks.length -
                  1
              }
              onClick={() =>
                moveBlock(index, 1)
              }
            >
              {'\u2193'}
            </button>

            <button
              type="button"
              onClick={() =>
                deleteBlock(block.id)
              }
            >
              Delete
            </button>
          </div>
        </div>

        {block.type ===
          LESSON_BLOCK_TYPES.HEADING && (
          <div>
            <label>
              Heading level
            </label>

            <select
              value={data.level || 2}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'level',
                  Number(
                    event.target.value,
                  ),
                )
              }
            >
              <option value={1}>
                H1
              </option>

              <option value={2}>
                H2
              </option>

              <option value={3}>
                H3
              </option>

              <option value={4}>
                H4
              </option>
            </select>

            <br />
            <br />

            <label>
              Heading text
            </label>

            <input
              type="text"
              value={data.text || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'text',
                  event.target.value,
                )
              }
            />
          </div>
        )}

        {block.type ===
          LESSON_BLOCK_TYPES.PARAGRAPH && (
          <div>
            <RichTextEditor
              label={`Paragraph ${index + 1}`}
              value={
                data.richText ||
                data.text ||
                ''
              }
              onChange={(richText) =>
                updateParagraphRichText(
                  block.id,
                  richText,
                )
              }
            sectionType={lesson?.context?.section?.sectionType || 'general'}
                />
          </div>
        )}

        {block.type ===
          LESSON_BLOCK_TYPES.NOTE && (
          <div>
            <label>
              Note type
            </label>

            <select
              value={
                data.variant || 'info'
              }
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'variant',
                  event.target.value,
                )
              }
            >
              <option value="info">
                Info
              </option>

              <option value="tip">
                Tip
              </option>

              <option value="warning">
                Warning
              </option>

              <option value="important">
                Important
              </option>
            </select>

            <br />
            <br />

            <label>
              Note title
            </label>

            <input
              type="text"
              value={data.title || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'title',
                  event.target.value,
                )
              }
            />

            <br />
            <br />

            <label>
              Note text
            </label>

            <textarea
              rows="4"
              value={data.text || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'text',
                  event.target.value,
                )
              }
            />
          </div>
        )}

        {block.type ===
          LESSON_BLOCK_TYPES.VOCABULARY_TABLE && (
          <div>
            <label>
              Table title
            </label>

            <input
              type="text"
              value={data.title || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'title',
                  event.target.value,
                )
              }
            />

            <div
              style={{
                marginTop: '18px',
              }}
            >
              {data.items.map(
                (item, itemIndex) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'grid',
                      gap: '8px',
                      padding: '14px 0',
                      borderBottom:
                        '1px solid rgba(132, 171, 208, 0.12)',
                    }}
                  >
                    <strong>
                      Vocabulary item{' '}
                      {itemIndex + 1}
                    </strong>

                    <input
                      type="text"
                      placeholder="Word"
                      value={
                        item.word || ''
                      }
                      onChange={(event) =>
                        updateVocabularyItem(
                          block.id,
                          item.id,
                          'word',
                          event.target
                            .value,
                        )
                      }
                    />

                    <input
                      type="text"
                      dir="rtl"
                      placeholder="Arabic meaning"
                      value={
                        item.meaning_ar ||
                        ''
                      }
                      onChange={(event) =>
                        updateVocabularyItem(
                          block.id,
                          item.id,
                          'meaning_ar',
                          event.target
                            .value,
                        )
                      }
                    />

                    <textarea
                      rows="2"
                      placeholder="Example"
                      value={
                        item.example || ''
                      }
                      onChange={(event) =>
                        updateVocabularyItem(
                          block.id,
                          item.id,
                          'example',
                          event.target
                            .value,
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        deleteVocabularyItem(
                          block.id,
                          item.id,
                        )
                      }
                    >
                      Delete item
                    </button>
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                addVocabularyItem(
                  block.id,
                )
              }
            >
              + Add vocabulary item
            </button>
          </div>
        )}

        {block.type ===
          LESSON_BLOCK_TYPES.DIVIDER && (
          <p>
            Divider block -
            required.
          </p>
        )}
      </article>
    )
  }

  if (isLoading) {
    return (
      <div>
        <span>Learning Content</span>

        <h1>Loading lesson...</h1>

        <p>
          The lesson content is being
          loaded.
        </p>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div>
        <span>Learning Content</span>

        <h1>
          Lesson could not be loaded
        </h1>

        <p role="alert">
          {errorMessage}
        </p>

        <Link to="/admin/units">
          ← Back to Units
        </Link>
      </div>
    )
  }

  if (!lesson || !draftContent) {
    return (
      <div>
        <h1>Lesson not found</h1>

        <Link to="/admin/units">
          ← Back to Units
        </Link>
      </div>
    )
  }

  return (
    <div className={`admin-lesson-studio studio-mode--${editorProfile.key}`}>
      <div className="lesson-studio__back-row">
        <Link className="lesson-studio__back-link" to="/admin/units">
          ← Back to Units
        </Link>
      </div>
      <section className="studio-hero">
        <span className="studio-kicker">Learning Content</span>

        <h1>
          JAK Smart Lesson Studio
        </h1>

        <p>
          Build the lesson from one smart
          paste, review it, then fine-tune
          individual blocks if needed.
          Nothing is saved yet.
        </p>
      </section>

      <section className="studio-card studio-lesson-meta">
        <h2>{lesson.title}</h2>

        {lesson.context && (
          <div className="studio-context-grid">
            <div className="studio-context-item">
              <span>Course</span>
              <strong>
                {lesson.context.course?.title || 'Not assigned'}
              </strong>
            </div>

            <div className="studio-context-item studio-context-item--unit">
              <span>Unit</span>
              <strong>
                {lesson.context.unit?.unitNumber
                  ? `UNIT ${lesson.context.unit.unitNumber}`
                  : lesson.context.unit?.title || 'Not assigned'}
              </strong>
            </div>

            <div className="studio-context-item studio-context-item--section">
              <span>Section</span>
              <strong>
                {(
                  lesson.context.section?.sectionType ||
                  lesson.context.section?.title ||
                  'Not assigned'
                ).toUpperCase()}
              </strong>
            </div>
          </div>
        )}

        <div className="studio-editor-mode">
          <div>
            <span>Editor mode</span>
            <strong>
              {editorProfile.label}
            </strong>
          </div>

          <p>
            {editorProfile.description}
          </p>

          <div className="studio-editor-mode__tools">
            <span>Recommended:</span>

            {editorProfile.primaryBlocks.map(
              (blockName) => (
                <strong key={blockName}>
                  {blockName}
                </strong>
              ),
            )}
          </div>
        </div>
        {lesson.summary && (
          <p>{lesson.summary}</p>
        )}

        <p>
          <strong>Lesson ID:</strong>{' '}
          {lesson.id}
        </p>
      </section>

      <hr />

      <section className="studio-card studio-import">
        <span className="studio-kicker">Primary workflow</span>

        <h2>Smart Import</h2>

        <p>
          Paste a complete lesson here.
          No HTML is required.
        </p>

        <textarea
          className="studio-smart-source"
          rows="14"
          value={smartSource}
          onChange={(event) =>
            setSmartSource(
              event.target.value,
            )
          }
          placeholder={`# Unit 1 Vocabulary

achievement | \u0625\u0646\u062C\u0627\u0632 | Passing the exam was a great achievement.
challenge | \u062A\u062D\u062F\u064A | Learning a new language can be a challenge.

[NOTE]
Learn vocabulary through context.

[DIVIDER]

## Quick Reminder

Review the words every day.`}
          style={{
            width: '100%',
            resize: 'vertical',
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '12px',
          }}
        >
          <button
            className="studio-button studio-button--primary"
            type="button"
            onClick={handleBuildLesson}
          >
            Build Lesson
          </button>

          <button
            className="studio-button studio-button--secondary"
            type="button"
            onClick={handleResetToSaved}
          >
            Reset to saved version
          </button>
        </div>

        {importReport && (
          <div
            className="studio-validation-report"
            style={{
              marginTop: '18px',
              padding: '16px',
              border:
                '1px solid rgba(132, 171, 208, 0.18)',
              borderRadius: '14px',
            }}
          >
            <details className="studio-validation-details" open={Boolean(importReport.error)}>
              <summary>
                <span>Smart Validation Report</span>

                {!importReport.error && (
                  <span className="studio-validation-summary">
                    {importReport.issues.errors.length} errors
                    {' \u00B7 '}
                    {importReport.issues.warnings.length} warnings
                  </span>
                )}
              </summary>

            {importReport.error ? (
              <p role="alert">
                {importReport.error}
              </p>
            ) : (
              <>
                <p>
                  {importReport.isValid
                    ? '\u2713 Content passed validation'
                    : '\u2715 Content has blocking errors'}
                </p>

                <p>
                  {'\u2713'}{' '}
                  {importReport.counts.blocks}{' '}
                  blocks
                  {' \u00B7 '}
                  {
                    importReport.counts
                      .vocabularyItems
                  }{' '}
                  vocabulary items
                </p>

                <p>
                  Headings:{' '}
                  {
                    importReport.counts
                      .headings
                  }
                  {' \u00B7 '}
                  Paragraphs:{' '}
                  {
                    importReport.counts
                      .paragraphs
                  }
                  {' \u00B7 '}
                  Notes:{' '}
                  {importReport.counts.notes}
                  {' \u00B7 '}
                  Dividers:{' '}
                  {
                    importReport.counts
                      .dividers
                  }
                </p>

                {importReport.issues.errors
                  .length > 0 && (
                  <div>
                    <strong>
                      Errors (
                      {
                        importReport.issues
                          .errors.length
                      }
                      )
                    </strong>

                    <ul>
                      {importReport.issues.errors.map(
                        (issue, index) => (
                          <li
                            key={`${issue.code}-${index}`}
                          >
                            {issue.message}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {importReport.issues.warnings
                  .length > 0 && (
                  <div>
                    <strong>
                      Warnings (
                      {
                        importReport.issues
                          .warnings.length
                      }
                      )
                    </strong>

                    <ul>
                      {importReport.issues.warnings.map(
                        (issue, index) => (
                          <li
                            key={`${issue.code}-${index}`}
                          >
                            {issue.message}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {importReport.issues.errors
                  .length === 0 &&
                  importReport.issues.warnings
                    .length === 0 && (
                    <p>
                      {'\u2713'} No errors or warnings
                      detected.
                    </p>
                  )}

                {importReport.duplicates
                  .vocabularyWords.length >
                  0 && (
                  <p>
                    {'\u26A0'} Duplicate vocabulary:{' '}
                    {importReport.duplicates.vocabularyWords
                      .map(
                        (duplicate) =>
                          `${duplicate.word} (${duplicate.count})`,
                      )
                      .join(', ')}
                  </p>
                )}

                <p>
                  {importReport.issues.errors
                    .length > 0
                    ? 'Preview was not replaced because blocking errors were found.'
                    : 'Preview updated successfully. Nothing has been saved to the database.'}
                </p>
              </>
            )}
            </details>
          </div>
        )}
      </section>

      <hr />

      <section className="studio-card studio-fine-edit">
        <details className="studio-fine-details">
          <summary>
            <div>
              <span className="studio-kicker">Optional fine-tuning</span>
              <h2>Fine Edit</h2>
            </div>

            <span className="studio-fine-summary">
              {draftStats.totalBlocks} blocks
              {' \u00B7 '}
              {draftStats.vocabularyItems} vocabulary items
            </span>
          </summary>

          <div className="studio-fine-body">
            <p>
              {editorProfile.description}
            </p>

            <div className="studio-mode-tools">
              <span>Rich Text focus:</span>

              {editorProfile.richTextTools.map(
                (toolName) => (
                  <strong key={toolName}>
                    {toolName}
                  </strong>
                ),
              )}
            </div>

            {draftContent.blocks.map(
              renderBlockEditor,
            )}

            <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() =>
              addBlock(
                LESSON_BLOCK_TYPES.HEADING,
              )
            }
          >
            + Heading
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock(
                LESSON_BLOCK_TYPES.PARAGRAPH,
              )
            }
          >
            + Paragraph
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock(
                LESSON_BLOCK_TYPES.VOCABULARY_TABLE,
              )
            }
          >
            + Vocabulary table
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock(
                LESSON_BLOCK_TYPES.NOTE,
              )
            }
          >
            + Note
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock(
                LESSON_BLOCK_TYPES.DIVIDER,
              )
            }
          >
            + Divider
          </button>
            </div>
          </div>
        </details>
      </section>

      <hr />

      <section className="studio-card studio-save">
        <div className="studio-save-copy">
          <span className="studio-kicker">Final step</span>

          <h2>Save Lesson</h2>

          <p>
            {hasBlockingErrors
              ? 'Blocking errors must be fixed before saving.'
              : hasUnsavedChanges
                ? 'The lesson has unsaved changes.'
                : 'The saved version is up to date.'}
          </p>
        </div>

        <div className="studio-save-actions">
          <span
            className={`studio-save-status ${
              hasBlockingErrors
                ? 'studio-save-status--error'
                : hasUnsavedChanges
                  ? 'studio-save-status--pending'
                  : 'studio-save-status--saved'
            }`}
          >
            {hasBlockingErrors
              ? 'Needs attention'
              : hasUnsavedChanges
                ? 'Unsaved changes'
                : 'Saved'}
          </span>

        <button
          className="studio-button studio-button--save"
          type="button"
          disabled={
            isSaving ||
            hasBlockingErrors ||
            !hasUnsavedChanges
          }
          onClick={handleSaveLesson}
        >
          {isSaving
            ? 'Saving...'
            : 'Save Lesson'}
        </button>

        {saveMessage && (
          <p role="status">
            {saveMessage}
          </p>
        )}

          <p className="studio-save-meta">
            Errors:{' '}
            {draftValidation?.issues.errors.length || 0}
            {' \u00B7 '}
            Warnings:{' '}
            {draftValidation?.issues.warnings.length || 0}
          </p>
        </div>
      </section>

      <hr />

      <section className="studio-card studio-preview">
        <span className="studio-kicker">Live preview</span>

        <h2>
          Student preview
        </h2>

        <p>
          {draftStats.headingCount}{' '}
          headings {'\u00B7'}{' '}
          {draftStats.paragraphCount}{' '}
          paragraphs {'\u00B7'}{' '}
          {draftStats.noteCount}{' '}
          notes {'\u00B7'}{' '}
          {draftStats.dividerCount}{' '}
          dividers
        </p>

        <div className="studio-preview-frame">
          <div className="studio-preview-browser">
            <span />
            <span />
            <span />
            <strong>Student view</strong>
          </div>

          <LessonContentRenderer
            content={draftContent}
          />
        </div>
      </section>
    </div>

  )
}

export default AdminLessonEditorPage




