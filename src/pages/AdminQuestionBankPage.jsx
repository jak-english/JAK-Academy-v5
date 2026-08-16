import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  listAdminQuestions,
} from '../features/admin/services/adminQuestionReadService'

import {
  listAdminQuestionLocations,
} from '../features/admin/services/adminQuestionLocationService'

import {
  saveAdminQuestion,
} from '../features/admin/services/adminQuestionService'

import {
  prepareBulkQuestionPreview,
} from '../features/questions/import/bulkQuestionParser'

import {
  checkAdminQuestionDuplicates,
} from '../features/admin/services/bulkQuestionPreviewService'

import {
  importAdminQuestions,
} from '../features/admin/services/bulkQuestionImportService'

import './AdminQuestionBankPage.css'

const PAGE_SIZE = 25

function createEmptyDraft() {
  return {
    type: 'mcq',
    prompt: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    trueFalseAnswer: true,
    explanation: '',
    difficulty: 'medium',
    status: 'draft',
    tags: '',
    lessonId: '',
    blockId: '',
  }
}

function questionTypeLabel(type) {
  if (type === 'true_false') {
    return 'True / False'
  }

  return 'MCQ'
}

function difficultyLabel(value) {
  const labels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  }

  return labels[value] || value
}

function statusLabel(value) {
  const labels = {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  }

  return labels[value] || value
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  ).format(date)
}

function getQuestionPrompt(question) {
  return (
    question?.prompt_json?.text ||
    'Untitled question'
  )
}

function uniqueBy(items, keyName) {
  const seen = new Set()

  return items.filter((item) => {
    const value = item?.[keyName]

    if (!value || seen.has(value)) {
      return false
    }

    seen.add(value)
    return true
  })
}

function buildDraftFromQuestion(question) {
  const isTrueFalse =
    question.question_type === 'true_false'

  const options = Array.isArray(
    question.answer_config?.options,
  )
    ? question.answer_config.options
    : []

  const correctOptionId =
    question.answer_config?.correctOptionId

  const correctIndex = Math.max(
    options.findIndex(
      (option) =>
        String(option?.id ?? '').toLowerCase() ===
        String(correctOptionId ?? '').toLowerCase(),
    ),
    0,
  )

  return {
    type: isTrueFalse
      ? 'true_false'
      : 'mcq',

    prompt:
      question.prompt_json?.text || '',

    options: isTrueFalse
      ? ['', '', '', '']
      : [
          ...options.map(
            (option) => option?.text || '',
          ),
          '',
          '',
          '',
          '',
        ].slice(
          0,
          Math.max(options.length, 4),
        ),

    correctIndex,

    trueFalseAnswer:
      question.answer_config?.correctAnswer ??
      true,

    explanation:
      question.explanation_json?.text || '',

    difficulty:
      question.difficulty || 'medium',

    status:
      question.status || 'draft',

    tags: Array.isArray(question.tags)
      ? question.tags.join(', ')
      : '',

    lessonId:
      question.source_lesson_id || '',

    blockId:
      question.source_block_id || '',
  }
}

function AdminQuestionBankPage() {
  const [questions, setQuestions] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [filters, setFilters] =
    useState({
      searchText: '',
      questionType: '',
      difficulty: '',
      status: '',
    })

  const [appliedFilters, setAppliedFilters] =
    useState(filters)

  const [offset, setOffset] =
    useState(0)

  const [isEditorOpen, setIsEditorOpen] =
    useState(false)

  const [editingQuestion, setEditingQuestion] =
    useState(null)

  const [draft, setDraft] =
    useState(createEmptyDraft)

  const [isSaving, setIsSaving] =
    useState(false)

  const [saveMessage, setSaveMessage] =
    useState('')

  const [locations, setLocations] =
    useState([])

  const [locationsLoading, setLocationsLoading] =
    useState(true)

  const [locationsError, setLocationsError] =
    useState('')

  const [selectedCourseId, setSelectedCourseId] =
    useState('')

  const [selectedUnitId, setSelectedUnitId] =
    useState('')

  const [selectedSectionId, setSelectedSectionId] =
    useState('')

  const [isBulkOpen, setIsBulkOpen] =
    useState(false)

  const [bulkText, setBulkText] =
    useState('')

  const [bulkPreview, setBulkPreview] =
    useState([])

  const [bulkParseError, setBulkParseError] =
    useState('')

  const [bulkIsChecking, setBulkIsChecking] =
    useState(false)

  const [bulkIsImporting, setBulkIsImporting] =
    useState(false)

  const [bulkImportMessage, setBulkImportMessage] =
    useState('')

  const [bulkLessonId, setBulkLessonId] =
    useState('')

  const [bulkCourseId, setBulkCourseId] =
    useState('')

  const [bulkUnitId, setBulkUnitId] =
    useState('')

  const [bulkSectionId, setBulkSectionId] =
    useState('')

  const loadQuestions = useCallback(
    async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await listAdminQuestions({
            ...appliedFilters,
            limit: PAGE_SIZE,
            offset,
          })

        setQuestions(data)
      } catch (error) {
        console.error(
          'Question Bank loading error:',
          error,
        )

        setErrorMessage(
          error.message ||
            'The Question Bank could not be loaded.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [
      appliedFilters,
      offset,
    ],
  )

  useEffect(() => {
    let isMounted = true

    listAdminQuestions({
      ...appliedFilters,
      limit: PAGE_SIZE,
      offset,
    })
      .then((data) => {
        if (!isMounted) {
          return
        }

        setQuestions(data)
        setErrorMessage('')
      })
      .catch((error) => {
        console.error(
          'Question Bank loading error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'The Question Bank could not be loaded.',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [appliedFilters, offset])

  useEffect(() => {
    let isMounted = true

    listAdminQuestionLocations()
      .then((data) => {
        if (!isMounted) {
          return
        }

        setLocations(data)
        setLocationsError('')
      })
      .catch((error) => {
        console.error(
          'Question location loading error:',
          error,
        )

        if (isMounted) {
          setLocationsError(
            error.message ||
              'Question locations could not be loaded.',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setLocationsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const courses = useMemo(
    () => uniqueBy(
      locations,
      'course_id',
    ),
    [locations],
  )

  const units = useMemo(
    () => uniqueBy(
      locations.filter(
        (location) =>
          location.course_id ===
          selectedCourseId,
      ),
      'unit_id',
    ),
    [
      locations,
      selectedCourseId,
    ],
  )

  const sections = useMemo(
    () => uniqueBy(
      locations.filter(
        (location) =>
          location.unit_id ===
          selectedUnitId,
      ),
      'section_id',
    ),
    [
      locations,
      selectedUnitId,
    ],
  )

  const lessons = useMemo(
    () => uniqueBy(
      locations.filter(
        (location) =>
          location.section_id ===
          selectedSectionId,
      ),
      'lesson_id',
    ),
    [
      locations,
      selectedSectionId,
    ],
  )

  const selectedLocation = useMemo(
    () =>
      locations.find(
        (location) =>
          location.lesson_id ===
          draft.lessonId,
      ) || null,
    [
      locations,
      draft.lessonId,
    ],
  )

  const bulkUnits = useMemo(
    () => uniqueBy(
      locations.filter(
        (location) =>
          location.course_id ===
          bulkCourseId,
      ),
      'unit_id',
    ),
    [locations, bulkCourseId],
  )

  const bulkSections = useMemo(
    () => uniqueBy(
      locations.filter(
        (location) =>
          location.unit_id ===
          bulkUnitId,
      ),
      'section_id',
    ),
    [locations, bulkUnitId],
  )

  const bulkLessons = useMemo(
    () => uniqueBy(
      locations.filter(
        (location) =>
          location.section_id ===
          bulkSectionId,
      ),
      'lesson_id',
    ),
    [locations, bulkSectionId],
  )

  const bulkCounts = useMemo(() => ({
    total: bulkPreview.length,
    valid: bulkPreview.filter(
      (item) => item.status === 'valid',
    ).length,
    duplicate: bulkPreview.filter(
      (item) => item.status === 'duplicate',
    ).length,
    error: bulkPreview.filter(
      (item) => item.status === 'error',
    ).length,
  }), [bulkPreview])

  const hasNextPage =
    questions.length === PAGE_SIZE

  const pageNumber =
    Math.floor(offset / PAGE_SIZE) + 1

  const summary = useMemo(() => {
    return {
      visible: questions.length,
      mcq: questions.filter(
        (question) =>
          question.question_type === 'mcq',
      ).length,
      trueFalse: questions.filter(
        (question) =>
          question.question_type ===
          'true_false',
      ).length,
      published: questions.filter(
        (question) =>
          question.status === 'published',
      ).length,
    }
  }, [questions])

  function resetLocationSelection() {
    setSelectedCourseId('')
    setSelectedUnitId('')
    setSelectedSectionId('')
  }

  function syncLocationFromLessonId(lessonId) {
    const location =
      locations.find(
        (item) =>
          item.lesson_id === lessonId,
      )

    if (!location) {
      resetLocationSelection()
      return
    }

    setSelectedCourseId(
      location.course_id,
    )
    setSelectedUnitId(
      location.unit_id,
    )
    setSelectedSectionId(
      location.section_id,
    )
  }

  function openBulkImport() {
    setBulkText('')
    setBulkPreview([])
    setBulkParseError('')
    setBulkImportMessage('')
    setBulkCourseId('')
    setBulkUnitId('')
    setBulkSectionId('')
    setBulkLessonId('')
    setIsBulkOpen(true)
  }

  function closeBulkImport() {
    if (
      bulkIsChecking ||
      bulkIsImporting
    ) {
      return
    }

    setIsBulkOpen(false)
  }

  function handleBulkCourseChange(event) {
    setBulkCourseId(event.target.value)
    setBulkUnitId('')
    setBulkSectionId('')
    setBulkLessonId('')
    setBulkPreview([])
  }

  function handleBulkUnitChange(event) {
    setBulkUnitId(event.target.value)
    setBulkSectionId('')
    setBulkLessonId('')
    setBulkPreview([])
  }

  function handleBulkSectionChange(event) {
    setBulkSectionId(event.target.value)
    setBulkLessonId('')
    setBulkPreview([])
  }

  async function runBulkPreview() {
    setBulkParseError('')
    setBulkPreview([])

    if (!bulkLessonId) {
      setBulkParseError(
        'Choose a lesson before previewing the import.',
      )
      return
    }

    const prepared =
      prepareBulkQuestionPreview(
        bulkText,
        {
          lessonId: bulkLessonId,
          difficulty: 'medium',
          status: 'draft',
        },
      )

    if (prepared.parseError) {
      setBulkParseError(
        prepared.parseError,
      )
      return
    }

    if (!prepared.items.length) {
      setBulkParseError(
        'No questions were found in the pasted text.',
      )
      return
    }

    const validItems =
      prepared.items.filter(
        (item) =>
          item.status === 'valid',
      )

    try {
      setBulkIsChecking(true)

      const duplicateRows =
        await checkAdminQuestionDuplicates(
          validItems.map(
            (item) =>
              item.canonicalQuestion,
          ),
        )

      const duplicateByCandidateIndex =
        new Map(
          duplicateRows.map(
            (row) => [
              row.item_index,
              row,
            ],
          ),
        )

      let validCursor = 0

      const nextItems =
        prepared.items.map((item) => {
          if (item.status !== 'valid') {
            return item
          }

          const duplicateRow =
            duplicateByCandidateIndex.get(
              validCursor,
            )

          validCursor += 1

          if (
            duplicateRow?.is_duplicate
          ) {
            return {
              ...item,
              status: 'duplicate',
              existingQuestionId:
                duplicateRow
                  .existing_question_id,
              fingerprint:
                duplicateRow.fingerprint,
            }
          }

          return {
            ...item,
            fingerprint:
              duplicateRow?.fingerprint ||
              '',
          }
        })

      setBulkPreview(nextItems)
    } catch (error) {
      setBulkParseError(
        error.message ||
          'Duplicate checking failed.',
      )
    } finally {
      setBulkIsChecking(false)
    }
  }

  async function importValidBulkQuestions() {
    const validItems =
      bulkPreview.filter(
        (item) =>
          item.status === 'valid',
      )

    if (!validItems.length) {
      setBulkImportMessage(
        'There are no valid questions ready to import.',
      )
      return
    }

    try {
      setBulkIsImporting(true)
      setBulkImportMessage('')

      const results =
        await importAdminQuestions(
          validItems.map(
            (item) =>
              item.canonicalQuestion,
          ),
        )

      const importedCount =
        results.filter(
          (row) =>
            row.import_status === 'imported',
        ).length

      const duplicateCount =
        results.filter(
          (row) =>
            row.import_status === 'duplicate',
        ).length

      setBulkImportMessage(
        `Import completed: ${importedCount} imported, ${duplicateCount} duplicates skipped.`,
      )

      await loadQuestions()

      const resultByValidIndex =
        new Map(
          results.map(
            (row) => [
              row.item_index,
              row,
            ],
          ),
        )

      let validCursor = 0

      setBulkPreview(
        (current) =>
          current.map((item) => {
            if (
              item.status !== 'valid'
            ) {
              return item
            }

            const result =
              resultByValidIndex.get(
                validCursor,
              )

            validCursor += 1

            if (
              result?.import_status ===
              'imported'
            ) {
              return {
                ...item,
                status: 'imported',
                importedQuestionId:
                  result.question_id,
              }
            }

            if (
              result?.import_status ===
              'duplicate'
            ) {
              return {
                ...item,
                status: 'duplicate',
                existingQuestionId:
                  result.existing_question_id,
              }
            }

            return item
          }),
      )
    } catch (error) {
      setBulkImportMessage(
        error.message ||
          'Bulk import failed.',
      )
    } finally {
      setBulkIsImporting(false)
    }
  }

  function openCreateEditor() {
    setEditingQuestion(null)
    setDraft(createEmptyDraft())
    resetLocationSelection()
    setSaveMessage('')
    setIsEditorOpen(true)
  }

  function openEditEditor(question) {
    const nextDraft =
      buildDraftFromQuestion(question)

    setEditingQuestion(question)
    setDraft(nextDraft)
    syncLocationFromLessonId(
      nextDraft.lessonId,
    )
    setSaveMessage('')
    setIsEditorOpen(true)
  }

  function closeEditor() {
    if (isSaving) {
      return
    }

    setIsEditorOpen(false)
    setEditingQuestion(null)
    setSaveMessage('')
  }

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateOption(index, value) {
    setDraft((current) => ({
      ...current,
      options: current.options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? value
            : option,
      ),
    }))
  }

  function addOption() {
    setDraft((current) => ({
      ...current,
      options: [
        ...current.options,
        '',
      ],
    }))
  }

  function removeOption(index) {
    setDraft((current) => {
      if (current.options.length <= 2) {
        return current
      }

      const nextOptions =
        current.options.filter(
          (_, optionIndex) =>
            optionIndex !== index,
        )

      let nextCorrectIndex =
        current.correctIndex

      if (
        index === current.correctIndex
      ) {
        nextCorrectIndex = 0
      } else if (
        index < current.correctIndex
      ) {
        nextCorrectIndex -= 1
      }

      return {
        ...current,
        options: nextOptions,
        correctIndex:
          nextCorrectIndex,
      }
    })
  }

  function applyFilters(event) {
    event.preventDefault()
    setOffset(0)
    setAppliedFilters({
      ...filters,
    })
  }

  function clearFilters() {
    const emptyFilters = {
      searchText: '',
      questionType: '',
      difficulty: '',
      status: '',
    }

    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setOffset(0)
  }

  function handleCourseChange(event) {
    const courseId =
      event.target.value

    setSelectedCourseId(courseId)
    setSelectedUnitId('')
    setSelectedSectionId('')

    setDraft((current) => ({
      ...current,
      lessonId: '',
      blockId: '',
    }))
  }

  function handleUnitChange(event) {
    const unitId =
      event.target.value

    setSelectedUnitId(unitId)
    setSelectedSectionId('')

    setDraft((current) => ({
      ...current,
      lessonId: '',
      blockId: '',
    }))
  }

  function handleSectionChange(event) {
    const sectionId =
      event.target.value

    setSelectedSectionId(
      sectionId,
    )

    setDraft((current) => ({
      ...current,
      lessonId: '',
      blockId: '',
    }))
  }

  function handleLessonChange(event) {
    const lessonId =
      event.target.value

    setDraft((current) => ({
      ...current,
      lessonId,
      blockId:
        current.lessonId === lessonId
          ? current.blockId
          : '',
    }))
  }

  async function handleSave(event) {
    event.preventDefault()

    try {
      setIsSaving(true)
      setSaveMessage('')

      const cleanedOptions =
        draft.options.map(
          (option) => option.trim(),
        )

      const rawQuestion = {
        type: draft.type,
        prompt: draft.prompt,
        explanation:
          draft.explanation,
        difficulty:
          draft.difficulty,
        status: draft.status,
        tags: draft.tags,
        lessonId:
          draft.lessonId || null,
        blockId:
          draft.blockId || null,
      }

      if (draft.type === 'mcq') {
        rawQuestion.options =
          cleanedOptions

        rawQuestion.answer =
          String.fromCharCode(
            65 +
              Math.max(
                draft.correctIndex,
                0,
              ),
          )
      } else {
        rawQuestion.answer =
          draft.trueFalseAnswer
      }

      await saveAdminQuestion(
        rawQuestion,
        editingQuestion?.id || null,
      )

      setSaveMessage(
        editingQuestion
          ? 'Question updated successfully.'
          : 'Question created successfully.',
      )

      await loadQuestions()

      setTimeout(() => {
        setIsEditorOpen(false)
        setEditingQuestion(null)
        setSaveMessage('')
      }, 500)
    } catch (error) {
      console.error(
        'Question save error:',
        error,
      )

      setSaveMessage(
        error.message ||
          'The question could not be saved.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="question-bank-page">
      <section className="question-bank-hero">
        <div>
          <span className="question-bank-eyebrow">
            Assessment
          </span>

          <h1>Question Bank</h1>

          <p>
            Create, review, search, and manage
            canonical JAK Academy questions from
            one controlled system.
          </p>
        </div>

        <div className="question-bank-hero-actions">
          <button
            className="question-bank-secondary"
            type="button"
            onClick={openBulkImport}
          >
            Bulk Import
          </button>

          <button
            className="question-bank-primary"
            type="button"
            onClick={openCreateEditor}
          >
            + New Question
          </button>
        </div>
      </section>

      <section className="question-bank-stats">
        <article>
          <span>Visible</span>
          <strong>{summary.visible}</strong>
        </article>

        <article>
          <span>MCQ</span>
          <strong>{summary.mcq}</strong>
        </article>

        <article>
          <span>True / False</span>
          <strong>
            {summary.trueFalse}
          </strong>
        </article>

        <article>
          <span>Published</span>
          <strong>
            {summary.published}
          </strong>
        </article>
      </section>

      <section className="question-bank-panel">
        <form
          className="question-bank-filters"
          onSubmit={applyFilters}
        >
          <label className="question-bank-search">
            <span>Search</span>

            <input
              value={filters.searchText}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  searchText:
                    event.target.value,
                }))
              }
              placeholder="Prompt or tag..."
            />
          </label>

          <label>
            <span>Type</span>

            <select
              value={filters.questionType}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  questionType:
                    event.target.value,
                }))
              }
            >
              <option value="">
                All types
              </option>
              <option value="mcq">
                MCQ
              </option>
              <option value="true_false">
                True / False
              </option>
            </select>
          </label>

          <label>
            <span>Difficulty</span>

            <select
              value={filters.difficulty}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  difficulty:
                    event.target.value,
                }))
              }
            >
              <option value="">
                All levels
              </option>
              <option value="easy">
                Easy
              </option>
              <option value="medium">
                Medium
              </option>
              <option value="hard">
                Hard
              </option>
            </select>
          </label>

          <label>
            <span>Status</span>

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  status:
                    event.target.value,
                }))
              }
            >
              <option value="">
                All statuses
              </option>
              <option value="draft">
                Draft
              </option>
              <option value="published">
                Published
              </option>
              <option value="archived">
                Archived
              </option>
            </select>
          </label>

          <div className="question-bank-filter-actions">
            <button
              type="submit"
              className="question-bank-secondary"
            >
              Apply
            </button>

            <button
              type="button"
              className="question-bank-ghost"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {errorMessage ? (
        <div className="question-bank-alert question-bank-alert--error">
          {errorMessage}
        </div>
      ) : null}

      <section className="question-bank-panel">
        <div className="question-bank-table-heading">
          <div>
            <h2>Questions</h2>
            <p>
              Page {pageNumber} ·{' '}
              {questions.length} shown
            </p>
          </div>

          <button
            type="button"
            className="question-bank-ghost"
            onClick={loadQuestions}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="question-bank-empty">
            Loading Question Bank...
          </div>
        ) : questions.length === 0 ? (
          <div className="question-bank-empty">
            <strong>
              No questions found.
            </strong>
            <span>
              Create a question or change the
              active filters.
            </span>
          </div>
        ) : (
          <div className="question-bank-table-wrap">
            <table className="question-bank-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {questions.map(
                  (question) => (
                    <tr key={question.id}>
                      <td>
                        <div className="question-bank-question-cell">
                          <strong>
                            {getQuestionPrompt(
                              question,
                            )}
                          </strong>

                          <div className="question-bank-tags">
                            {(
                              question.tags ||
                              []
                            )
                              .slice(0, 4)
                              .map((tag) => (
                                <span key={tag}>
                                  {tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </td>

                      <td>
                        {questionTypeLabel(
                          question.question_type,
                        )}
                      </td>

                      <td>
                        <span
                          className={`question-bank-badge question-bank-badge--${question.difficulty}`}
                        >
                          {difficultyLabel(
                            question.difficulty,
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`question-bank-status question-bank-status--${question.status}`}
                        >
                          {statusLabel(
                            question.status,
                          )}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          question.updated_at,
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="question-bank-edit"
                          onClick={() =>
                            openEditEditor(
                              question,
                            )
                          }
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="question-bank-pagination">
          <button
            type="button"
            className="question-bank-ghost"
            disabled={
              offset === 0 ||
              isLoading
            }
            onClick={() =>
              setOffset((current) =>
                Math.max(
                  current - PAGE_SIZE,
                  0,
                ),
              )
            }
          >
            ← Previous
          </button>

          <span>Page {pageNumber}</span>

          <button
            type="button"
            className="question-bank-ghost"
            disabled={
              !hasNextPage ||
              isLoading
            }
            onClick={() =>
              setOffset(
                (current) =>
                  current + PAGE_SIZE,
              )
            }
          >
            Next →
          </button>
        </div>
      </section>

      {isBulkOpen ? (
        <div
          className="question-editor-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeBulkImport()
            }
          }}
        >
          <section
            className="question-editor question-bulk-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-import-title"
          >
            <header className="question-editor__header">
              <div>
                <span>Safe preview only</span>
                <h2 id="bulk-import-title">
                  Bulk Import
                </h2>
              </div>

              <button
                type="button"
                onClick={closeBulkImport}
                disabled={bulkIsChecking}
                aria-label="Close bulk import"
              >
                ×
              </button>
            </header>

            <div className="question-editor__form">
              <section className="question-editor__location-card">
                <div className="question-editor__location-heading">
                  <div>
                    <span>Import location</span>
                    <strong>
                      Choose once for all pasted questions
                    </strong>
                  </div>
                </div>

                <div className="question-editor__location-grid">
                  <label>
                    <span>Course / Cohort</span>
                    <select
                      value={bulkCourseId}
                      onChange={handleBulkCourseChange}
                    >
                      <option value="">
                        Choose course
                      </option>

                      {courses.map((course) => (
                        <option
                          key={course.course_id}
                          value={course.course_id}
                        >
                          {course.course_title}
                          {' — '}
                          {course.grade_level}
                          {' — Cohort '}
                          {course.cohort}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Unit</span>
                    <select
                      value={bulkUnitId}
                      onChange={handleBulkUnitChange}
                      disabled={!bulkCourseId}
                    >
                      <option value="">
                        Choose unit
                      </option>

                      {bulkUnits.map((unit) => (
                        <option
                          key={unit.unit_id}
                          value={unit.unit_id}
                        >
                          {unit.unit_number
                            ? `Unit ${unit.unit_number} — `
                            : ''}
                          {unit.unit_title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Section</span>
                    <select
                      value={bulkSectionId}
                      onChange={handleBulkSectionChange}
                      disabled={!bulkUnitId}
                    >
                      <option value="">
                        Choose section
                      </option>

                      {bulkSections.map((section) => (
                        <option
                          key={section.section_id}
                          value={section.section_id}
                        >
                          {section.section_title}
                          {' — '}
                          {section.section_type}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Lesson</span>
                    <select
                      value={bulkLessonId}
                      onChange={(event) => {
                        setBulkLessonId(
                          event.target.value,
                        )
                        setBulkPreview([])
                      }}
                      disabled={!bulkSectionId}
                    >
                      <option value="">
                        Choose lesson
                      </option>

                      {bulkLessons.map((lesson) => (
                        <option
                          key={lesson.lesson_id}
                          value={lesson.lesson_id}
                        >
                          {lesson.lesson_title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <label className="question-editor__full">
                <span>Paste questions</span>

                <textarea
                  className="question-bulk-textarea"
                  rows="14"
                  value={bulkText}
                  onChange={(event) => {
                    setBulkText(
                      event.target.value,
                    )
                    setBulkPreview([])
                  }}
                  placeholder={`1) She ___ every day.
A) study
B) studies
C) studied
D) studying
Answer: B
Explanation: Present simple routine.

2) Water boils at 100°C.
Answer: True
Explanation: At standard atmospheric pressure.`}
                />
              </label>

              <div className="question-bulk-help">
                Supports MCQ and True/False. Separate questions with a blank line.
                You can also paste a JSON array.
              </div>

              {bulkParseError ? (
                <div className="question-bank-alert question-bank-alert--error">
                  {bulkParseError}
                </div>
              ) : null}

              {bulkPreview.length ? (
                <>
                  <section className="question-bulk-summary">
                    <article>
                      <span>Total</span>
                      <strong>{bulkCounts.total}</strong>
                    </article>

                    <article>
                      <span>Valid</span>
                      <strong>{bulkCounts.valid}</strong>
                    </article>

                    <article>
                      <span>Duplicates</span>
                      <strong>{bulkCounts.duplicate}</strong>
                    </article>

                    <article>
                      <span>Errors</span>
                      <strong>{bulkCounts.error}</strong>
                    </article>
                  </section>

                  <div className="question-bulk-preview-list">
                    {bulkPreview.map((item) => (
                      <article
                        key={item.index}
                        className={`question-bulk-preview-item question-bulk-preview-item--${item.status}`}
                      >
                        <div>
                          <strong>
                            #{item.index + 1}{' '}
                            {item.canonicalQuestion?.prompt_json?.text ||
                              item.rawQuestion?.prompt ||
                              'Invalid question'}
                          </strong>

                          <span>
                            {item.status === 'duplicate'
                              ? `Duplicate of ${item.existingQuestionId || 'existing question'}`
                              : item.status === 'error'
                                ? item.errors.map((error) => error.message || String(error)).join(' · ')
                                : 'Ready for import'}
                          </span>
                        </div>

                        <b>{item.status}</b>
                      </article>
                    ))}
                  </div>
                </>
              ) : null}

              {bulkImportMessage ? (
                <div
                  className={
                    'question-bank-alert ' +
                    (
                      bulkImportMessage.startsWith(
                        'Import completed:',
                      )
                        ? 'question-bank-alert--success'
                        : 'question-bank-alert--error'
                    )
                  }
                >
                  {bulkImportMessage}
                </div>
              ) : null}

              <footer className="question-editor__footer">
                <button
                  type="button"
                  className="question-bank-ghost"
                  onClick={closeBulkImport}
                  disabled={
                    bulkIsChecking ||
                    bulkIsImporting
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="question-bank-secondary"
                  onClick={runBulkPreview}
                  disabled={
                    bulkIsChecking ||
                    bulkIsImporting
                  }
                >
                  {bulkIsChecking
                    ? 'Checking...'
                    : 'Preview questions'}
                </button>

                <button
                  type="button"
                  className="question-bank-primary"
                  onClick={importValidBulkQuestions}
                  disabled={
                    bulkIsChecking ||
                    bulkIsImporting ||
                    bulkCounts.valid === 0
                  }
                >
                  {bulkIsImporting
                    ? 'Importing...'
                    : 'Import ' +
                      bulkCounts.valid +
                      ' valid questions'}
                </button>
              </footer>

              <div className="question-bulk-safety-note">
                Only questions marked Valid are sent to the server.
                Duplicates and errors are never imported.
              </div>
            </div>
          </section>
        </div>
      ) : null}
      {isEditorOpen ? (
        <div
          className="question-editor-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditor()
            }
          }}
        >
          <section
            className="question-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-editor-title"
          >
            <header className="question-editor__header">
              <div>
                <span>
                  Question Contract v1
                </span>

                <h2 id="question-editor-title">
                  {editingQuestion
                    ? 'Edit Question'
                    : 'New Question'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                disabled={isSaving}
                aria-label="Close editor"
              >
                ×
              </button>
            </header>

            <form
              className="question-editor__form"
              onSubmit={handleSave}
            >
              <section className="question-editor__location-card">
                <div className="question-editor__location-heading">
                  <div>
                    <span>Question location</span>
                    <strong>
                      Choose the original lesson
                    </strong>
                  </div>

                  {selectedLocation ? (
                    <small>
                      {selectedLocation.course_title}
                      {' · '}
                      {selectedLocation.cohort}
                      {' · '}
                      {selectedLocation.unit_title}
                      {' · '}
                      {selectedLocation.section_title}
                    </small>
                  ) : null}
                </div>

                {locationsError ? (
                  <div className="question-bank-alert question-bank-alert--error">
                    {locationsError}
                  </div>
                ) : null}

                <div className="question-editor__location-grid">
                  <label>
                    <span>
                      Course / Cohort
                    </span>

                    <select
                      value={
                        selectedCourseId
                      }
                      onChange={
                        handleCourseChange
                      }
                      disabled={
                        locationsLoading
                      }
                    >
                      <option value="">
                        {locationsLoading
                          ? 'Loading...'
                          : 'Choose course'}
                      </option>

                      {courses.map(
                        (course) => (
                          <option
                            key={
                              course.course_id
                            }
                            value={
                              course.course_id
                            }
                          >
                            {course.course_title}
                            {' — '}
                            {course.grade_level}
                            {' — '}
                            Cohort{' '}
                            {course.cohort}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Unit</span>

                    <select
                      value={selectedUnitId}
                      onChange={
                        handleUnitChange
                      }
                      disabled={
                        !selectedCourseId
                      }
                    >
                      <option value="">
                        Choose unit
                      </option>

                      {units.map(
                        (unit) => (
                          <option
                            key={
                              unit.unit_id
                            }
                            value={
                              unit.unit_id
                            }
                          >
                            {unit.unit_number
                              ? `Unit ${unit.unit_number} — `
                              : ''}
                            {unit.unit_title}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Section</span>

                    <select
                      value={
                        selectedSectionId
                      }
                      onChange={
                        handleSectionChange
                      }
                      disabled={
                        !selectedUnitId
                      }
                    >
                      <option value="">
                        Choose section
                      </option>

                      {sections.map(
                        (section) => (
                          <option
                            key={
                              section.section_id
                            }
                            value={
                              section.section_id
                            }
                          >
                            {section.section_title}
                            {' — '}
                            {section.section_type}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Lesson</span>

                    <select
                      value={draft.lessonId}
                      onChange={
                        handleLessonChange
                      }
                      disabled={
                        !selectedSectionId
                      }
                    >
                      <option value="">
                        Choose lesson
                      </option>

                      {lessons.map(
                        (lesson) => (
                          <option
                            key={
                              lesson.lesson_id
                            }
                            value={
                              lesson.lesson_id
                            }
                          >
                            {lesson.lesson_title}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                </div>

                {draft.blockId ? (
                  <div className="question-editor__preserved-block">
                    Existing lesson-block link will be preserved unless the lesson is changed.
                  </div>
                ) : null}
              </section>

              <div className="question-editor__grid">
                <label>
                  <span>Question type</span>

                  <select
                    value={draft.type}
                    onChange={(event) =>
                      updateDraft(
                        'type',
                        event.target.value,
                      )
                    }
                  >
                    <option value="mcq">
                      Multiple choice
                    </option>

                    <option value="true_false">
                      True / False
                    </option>
                  </select>
                </label>

                <label>
                  <span>Difficulty</span>

                  <select
                    value={
                      draft.difficulty
                    }
                    onChange={(event) =>
                      updateDraft(
                        'difficulty',
                        event.target.value,
                      )
                    }
                  >
                    <option value="easy">
                      Easy
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="hard">
                      Hard
                    </option>
                  </select>
                </label>

                <label>
                  <span>Status</span>

                  <select
                    value={draft.status}
                    onChange={(event) =>
                      updateDraft(
                        'status',
                        event.target.value,
                      )
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                    <option value="archived">
                      Archived
                    </option>
                  </select>
                </label>
              </div>

              <label className="question-editor__full">
                <span>Question prompt</span>

                <textarea
                  rows="4"
                  value={draft.prompt}
                  onChange={(event) =>
                    updateDraft(
                      'prompt',
                      event.target.value,
                    )
                  }
                  placeholder="Write the question..."
                  autoFocus
                />
              </label>

              {draft.type === 'mcq' ? (
                <fieldset className="question-editor__options">
                  <legend>
                    Answer options
                  </legend>

                  {draft.options.map(
                    (option, index) => (
                      <div
                        className="question-editor__option"
                        key={index}
                      >
                        <input
                          type="radio"
                          name="correct-option"
                          checked={
                            draft.correctIndex ===
                            index
                          }
                          onChange={() =>
                            updateDraft(
                              'correctIndex',
                              index,
                            )
                          }
                          aria-label={`Mark option ${index + 1} as correct`}
                        />

                        <span>
                          {String.fromCharCode(
                            65 + index,
                          )}
                        </span>

                        <input
                          value={option}
                          onChange={(event) =>
                            updateOption(
                              index,
                              event.target
                                .value,
                            )
                          }
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeOption(index)
                          }
                          disabled={
                            draft.options
                              .length <= 2
                          }
                          aria-label={`Remove option ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ),
                  )}

                  <button
                    type="button"
                    className="question-bank-ghost question-editor__add-option"
                    onClick={addOption}
                  >
                    + Add option
                  </button>
                </fieldset>
              ) : (
                <fieldset className="question-editor__true-false">
                  <legend>
                    Correct answer
                  </legend>

                  <label>
                    <input
                      type="radio"
                      name="tf-answer"
                      checked={
                        draft.trueFalseAnswer ===
                        true
                      }
                      onChange={() =>
                        updateDraft(
                          'trueFalseAnswer',
                          true,
                        )
                      }
                    />
                    True
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="tf-answer"
                      checked={
                        draft.trueFalseAnswer ===
                        false
                      }
                      onChange={() =>
                        updateDraft(
                          'trueFalseAnswer',
                          false,
                        )
                      }
                    />
                    False
                  </label>
                </fieldset>
              )}

              <label className="question-editor__full">
                <span>Explanation</span>

                <textarea
                  rows="3"
                  value={draft.explanation}
                  onChange={(event) =>
                    updateDraft(
                      'explanation',
                      event.target.value,
                    )
                  }
                  placeholder="Optional explanation..."
                />
              </label>

              <label className="question-editor__full">
                <span>Tags</span>

                <input
                  value={draft.tags}
                  onChange={(event) =>
                    updateDraft(
                      'tags',
                      event.target.value,
                    )
                  }
                  placeholder="grammar, unit-1, ministry"
                />
              </label>

              {saveMessage ? (
                <div
                  className={`question-bank-alert ${
                    saveMessage.includes(
                      'successfully',
                    )
                      ? 'question-bank-alert--success'
                      : 'question-bank-alert--error'
                  }`}
                >
                  {saveMessage}
                </div>
              ) : null}

              <footer className="question-editor__footer">
                <button
                  type="button"
                  className="question-bank-ghost"
                  onClick={closeEditor}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="question-bank-primary"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : editingQuestion
                      ? 'Save changes'
                      : 'Create question'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default AdminQuestionBankPage






