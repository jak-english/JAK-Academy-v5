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
  normalizeLessonContent,
} from '../features/content/normalizeLessonContent'

import {
  validateLessonContent,
} from '../features/content/validateLessonContent'

import {
  richTextToPlainText,
} from '../features/content/richTextSchema'

import RichTextEditor from '../features/admin/components/RichTextEditor'
import LessonContentRenderer from '../features/student/components/LessonContentRenderer'

import {
  getAdminFoundationLesson,
  updateAdminFoundationLessonContent,
} from '../features/admin/services/adminFoundationsService'

import { supabase } from '../lib/supabase'

import './AdminFoundationsPage.css'
import './AdminFoundationLessonEditorPage.css'

const FOUNDATION_AUDIO_BUCKET =
  'foundation-audio'

const MAX_AUDIO_SIZE =
  15 * 1024 * 1024

const ALLOWED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
])

function getFoundationSectionType(lesson) {
  const moduleSlug =
    lesson?.module?.slug || ''

  if (moduleSlug === 'basic-vocabulary') {
    return 'vocabulary'
  }

  if (moduleSlug === 'basic-grammar') {
    return 'grammar'
  }

  if (moduleSlug === 'reading-from-zero') {
    return 'reading'
  }

  if (moduleSlug === 'writing-from-zero') {
    return 'writing'
  }

  return 'general'
}

function safePathPart(value) {
  return String(value || 'item')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item'
}

function getFileExtension(file) {
  const name = String(file?.name || '')
  const extension =
    name.includes('.')
      ? name.split('.').pop()
      : ''

  if (extension) {
    return extension
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
  }

  const byType = {
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
  }

  return byType[file?.type] || 'audio'
}

function AdminFoundationLessonEditorPage() {
  const { lessonId } = useParams()

  const [lesson, setLesson] =
    useState(null)

  const [draftContent, setDraftContent] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSaving, setIsSaving] =
    useState(false)

  const [uploadingBlockId, setUploadingBlockId] =
    useState(null)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [saveMessage, setSaveMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadLesson() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const lessonData =
          await getAdminFoundationLesson(
            lessonId,
          )

        if (!isMounted) {
          return
        }

        const normalized =
          normalizeLessonContent(
            lessonData?.contentJson ??
              lessonData?.content_json,
          )

        setLesson({
          ...lessonData,
          contentJson: normalized,
        })

        setDraftContent(normalized)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'Foundation lesson could not be loaded.',
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

  const validation = useMemo(() => {
    if (!draftContent) {
      return null
    }

    return validateLessonContent(
      draftContent,
    )
  }, [draftContent])

  const hasBlockingErrors =
    (validation?.issues?.errors?.length ||
      0) > 0

  const hasUnsavedChanges = useMemo(() => {
    if (
      !lesson?.contentJson ||
      !draftContent
    ) {
      return false
    }

    return (
      JSON.stringify(lesson.contentJson) !==
      JSON.stringify(draftContent)
    )
  }, [lesson, draftContent])

  const sectionType =
    getFoundationSectionType(lesson)

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
            (block) =>
              block.id === blockId
                ? {
                    ...block,
                    data: {
                      ...block.data,
                      [fieldName]: value,
                    },
                  }
                : block,
          ),
      }),
    )

    setSaveMessage('')
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
            (block) =>
              block.id === blockId
                ? {
                    ...block,
                    data: {
                      ...block.data,
                      richText,
                      text:
                        richTextToPlainText(
                          richText,
                        ),
                    },
                  }
                : block,
          ),
      }),
    )

    setSaveMessage('')
  }

  function addBlock(blockType) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,
        blocks: [
          ...currentContent.blocks,
          createLessonBlock(blockType),
        ],
      }),
    )

    setSaveMessage('')
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

    setSaveMessage('')
  }

  function moveBlock(index, direction) {
    setDraftContent(
      (currentContent) => {
        const nextIndex =
          index + direction

        if (
          nextIndex < 0 ||
          nextIndex >=
            currentContent.blocks.length
        ) {
          return currentContent
        }

        const blocks = [
          ...currentContent.blocks,
        ]

        const current = blocks[index]

        blocks[index] =
          blocks[nextIndex]

        blocks[nextIndex] = current

        return {
          ...currentContent,
          blocks,
        }
      },
    )

    setSaveMessage('')
  }

  function addVocabularyItem(blockId) {
    setDraftContent(
      (currentContent) => ({
        ...currentContent,
        blocks:
          currentContent.blocks.map(
            (block) => {
              if (block.id !== blockId) {
                return block
              }

              const items =
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
                    ...items,
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

  async function uploadAudio(
    blockId,
    file,
  ) {
    if (!file) {
      return
    }

    if (
      !ALLOWED_AUDIO_TYPES.has(
        file.type,
      )
    ) {
      setErrorMessage(
        'Unsupported audio format.',
      )
      return
    }

    if (file.size > MAX_AUDIO_SIZE) {
      setErrorMessage(
        'Audio file must be 15 MB or smaller.',
      )
      return
    }

    try {
      setUploadingBlockId(blockId)
      setErrorMessage('')

      const levelSlug =
        safePathPart(
          lesson?.level?.slug,
        )

      const moduleSlug =
        safePathPart(
          lesson?.module?.slug,
        )

      const lessonSlug =
        safePathPart(
          lesson?.slug,
        )

      const extension =
        getFileExtension(file)

      const storagePath =
        `${levelSlug}/${moduleSlug}/${lessonSlug}/${blockId}.${extension}`

      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          FOUNDATION_AUDIO_BUCKET,
        )
        .upload(
          storagePath,
          file,
          {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600',
          },
        )

      if (uploadError) {
        throw uploadError
      }

      updateBlockData(
        blockId,
        'storagePath',
        storagePath,
      )

      setSaveMessage(
        'Audio uploaded. Save the lesson to store the audio reference.',
      )
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Audio upload failed.',
      )
    } finally {
      setUploadingBlockId(null)
    }
  }

  async function handleSave() {
    if (
      !draftContent ||
      isSaving
    ) {
      return
    }

    const report =
      validateLessonContent(
        draftContent,
      )

    if (
      report.issues.errors.length > 0
    ) {
      setSaveMessage(
        'Fix blocking errors before saving.',
      )
      return
    }

    try {
      setIsSaving(true)
      setSaveMessage('Saving...')

      const result =
        await updateAdminFoundationLessonContent(
          lessonId,
          draftContent,
        )

      const normalized =
        normalizeLessonContent(
          result?.contentJson ??
            result?.content_json ??
            draftContent,
        )

      setLesson(
        (current) => ({
          ...current,
          contentJson: normalized,
        }),
      )

      setDraftContent(normalized)

      setSaveMessage(
        'Saved successfully.',
      )
    } catch (error) {
      setSaveMessage(
        error.message ||
          'Lesson could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function resetToSaved() {
    if (!lesson?.contentJson) {
      return
    }

    setDraftContent(
      normalizeLessonContent(
        lesson.contentJson,
      ),
    )

    setSaveMessage('')
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
          padding: '20px',
          marginBottom: '16px',
          border:
            '1px solid rgba(23,109,104,.16)',
          borderRadius: '18px',
          background: '#fffdf7',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div>
            <strong>
              Block {index + 1}
            </strong>
            <div>{block.type}</div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              type="button"
              disabled={index === 0}
              onClick={() =>
                moveBlock(index, -1)
              }
            >
              &#8593;
            </button>

            <button
              type="button"
              disabled={
                index ===
                draftContent.blocks
                  .length -
                  1
              }
              onClick={() =>
                moveBlock(index, 1)
              }
            >
              &#8595;
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
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>

            <label>
              Heading text
            </label>

            <input
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
            sectionType={sectionType}
          />
        )}

        {block.type ===
          LESSON_BLOCK_TYPES.NOTE && (
          <div>
            <label>Note type</label>

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

            <label>Note title</label>
            <input
              value={data.title || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'title',
                  event.target.value,
                )
              }
            />

            <label>Note text</label>
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
            <label>Table title</label>

            <input
              value={data.title || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'title',
                  event.target.value,
                )
              }
            />

            {(data.items || []).map(
              (item, itemIndex) => (
                <div
                  key={item.id}
                  style={{
                    padding:
                      '14px 0',
                    borderBottom:
                      '1px solid rgba(23,109,104,.12)',
                  }}
                >
                  <strong>
                    Item {itemIndex + 1}
                  </strong>

                  <input
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
          LESSON_BLOCK_TYPES.AUDIO && (
          <div>
            <label>Audio title</label>
            <input
              value={data.title || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'title',
                  event.target.value,
                )
              }
            />

            <label>
              Pronunciation label
            </label>
            <input
              placeholder="/æ/"
              value={
                data.pronunciationLabel ||
                ''
              }
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'pronunciationLabel',
                  event.target.value,
                )
              }
            />

            <label>Transcript</label>
            <textarea
              rows="3"
              value={
                data.transcript || ''
              }
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'transcript',
                  event.target.value,
                )
              }
            />

            <label>Example</label>
            <textarea
              rows="2"
              value={data.example || ''}
              onChange={(event) =>
                updateBlockData(
                  block.id,
                  'example',
                  event.target.value,
                )
              }
            />

            <label>Audio file</label>
            <input
              type="file"
              accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm"
              disabled={
                uploadingBlockId ===
                block.id
              }
              onChange={(event) => {
                const file =
                  event.target
                    .files?.[0]

                uploadAudio(
                  block.id,
                  file,
                )

                event.target.value =
                  ''
              }}
            />

            {uploadingBlockId ===
              block.id && (
              <p>
                Uploading audio...
              </p>
            )}

            {data.storagePath && (
              <p>
                Stored securely:
                {' '}
                <code>
                  {data.storagePath}
                </code>
              </p>
            )}
          </div>
        )}

        {block.type ===
          LESSON_BLOCK_TYPES.DIVIDER && (
          <p>
            Divider block
          </p>
        )}
      </article>
    )
  }

  if (isLoading) {
    return (
      <section className="admin-foundations admin-foundation-editor-page">
        <p>
          Loading foundation lesson...
        </p>
      </section>
    )
  }

  if (errorMessage && !lesson) {
    return (
      <section className="admin-foundations admin-foundation-editor-page">
        <h1>
          Foundation lesson could not
          be loaded
        </h1>

        <p>{errorMessage}</p>

        <Link to="/admin/foundations">
          Back to Foundations
        </Link>
      </section>
    )
  }

  return (
    <section className="admin-foundations admin-foundation-editor-page">
      <header className="admin-foundations__header">
        <span>
          Foundation Content Studio
        </span>

        <h1>
          {lesson?.title ||
            'Foundation Lesson'}
        </h1>

        <p>
          {lesson?.level?.title}
          {' / '}
          {lesson?.module?.title}
        </p>
      </header>

      {errorMessage && (
        <div className="admin-foundations__message admin-foundations__message--error">
          {errorMessage}
        </div>
      )}

      {saveMessage && (
        <div className="admin-foundations__message admin-foundations__message--success">
          {saveMessage}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          margin: '20px 0',
        }}
      >
        {[
          [
            'Heading',
            LESSON_BLOCK_TYPES.HEADING,
          ],
          [
            'Paragraph',
            LESSON_BLOCK_TYPES.PARAGRAPH,
          ],
          [
            'Vocabulary',
            LESSON_BLOCK_TYPES.VOCABULARY_TABLE,
          ],
          [
            'Note',
            LESSON_BLOCK_TYPES.NOTE,
          ],
          [
            'Audio',
            LESSON_BLOCK_TYPES.AUDIO,
          ],
          [
            'Divider',
            LESSON_BLOCK_TYPES.DIVIDER,
          ],
        ].map(([label, type]) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              addBlock(type)
            }
          >
            + {label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0,1.15fr) minmax(320px,.85fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div>
          {draftContent?.blocks.map(
            renderBlockEditor,
          )}

          {draftContent?.blocks
            .length === 0 && (
            <p>
              No blocks yet. Add the
              first content block above.
            </p>
          )}
        </div>

        <aside
          style={{
            position: 'sticky',
            top: '20px',
            padding: '20px',
            borderRadius: '20px',
            background: '#f8f5ea',
          }}
        >
          <h2>Live Preview</h2>

          <LessonContentRenderer
            content={draftContent}
          />
        </aside>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '24px',
        }}
      >
        <button
          type="button"
          disabled={
            isSaving ||
            hasBlockingErrors ||
            !hasUnsavedChanges
          }
          onClick={handleSave}
        >
          {isSaving
            ? 'Saving...'
            : 'Save Content'}
        </button>

        <button
          type="button"
          disabled={
            !hasUnsavedChanges ||
            isSaving
          }
          onClick={resetToSaved}
        >
          Reset
        </button>

        <Link to="/admin/foundations">
          Back to Foundations
        </Link>
      </div>

      {validation && (
        <div
          style={{
            marginTop: '18px',
          }}
        >
          <strong>
            Validation:
          </strong>{' '}
          {
            validation.issues.errors
              .length
          }{' '}
          errors /{' '}
          {
            validation.issues.warnings
              .length
          }{' '}
          warnings
        </div>
      )}
    </section>
  )
}

export default AdminFoundationLessonEditorPage
