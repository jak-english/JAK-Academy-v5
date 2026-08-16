import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  listAdminQuestionLocations,
} from '../features/admin/services/adminQuestionLocationService'

import {
  getAdminQuestionSet,
  listAdminQuestionSets,
  saveAdminQuestionSet,
} from '../features/admin/services/adminQuestionSetService'

import QuestionSetManagerModal from '../features/admin/components/QuestionSetManagerModal'

import './AdminQuestionSetsPage.css'

const purposeLabels = {
  practice: 'Practice',
  block_practice: 'Block Practice',
  lesson_exam: 'Lesson Exam',
  custom: 'Custom',
}

function uniqueBy(items, key) {
  const seen = new Set()

  return items.filter((item) => {
    const value = item[key]

    if (!value || seen.has(value)) {
      return false
    }

    seen.add(value)
    return true
  })
}

function AdminQuestionSetsPage() {
  const [questionSets, setQuestionSets] =
    useState([])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [purpose, setPurpose] = useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [isEditorOpen, setIsEditorOpen] =
    useState(false)

  const [editingSet, setEditingSet] =
    useState(null)

  const [managingSet, setManagingSet] =
    useState(null)

  const [locations, setLocations] =
    useState([])

  const [isLoadingLocations, setIsLoadingLocations] =
    useState(false)

  const [isSaving, setIsSaving] =
    useState(false)

  const [editorError, setEditorError] =
    useState('')

  const [selectedCourseId, setSelectedCourseId] =
    useState('')

  const [selectedUnitId, setSelectedUnitId] =
    useState('')

  const [selectedSectionId, setSelectedSectionId] =
    useState('')

  const [selectedLessonId, setSelectedLessonId] =
    useState('')

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [editorPurpose, setEditorPurpose] =
    useState('practice')

  const [editorStatus, setEditorStatus] =
    useState('draft')

  const loadQuestionSets = useCallback(
    async () => {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await listAdminQuestionSets({
            status: status || null,
            purpose: purpose || null,
            search: search.trim() || null,
            limit: 100,
            offset: 0,
          })

        setQuestionSets(data)
      } catch (error) {
        setErrorMessage(
          error.message ||
            'Unable to load question sets.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [purpose, search, status],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadQuestionSets()
    }, 0)

    return () => {
      window.clearTimeout(timer)
    }
  }, [loadQuestionSets])

  const courses = useMemo(
    () =>
      uniqueBy(
        locations,
        'course_id',
      ),
    [locations],
  )

  const units = useMemo(
    () =>
      uniqueBy(
        locations.filter(
          (item) =>
            item.course_id ===
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
    () =>
      uniqueBy(
        locations.filter(
          (item) =>
            item.unit_id ===
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
    () =>
      uniqueBy(
        locations.filter(
          (item) =>
            item.section_id ===
            selectedSectionId,
        ),
        'lesson_id',
      ),
    [
      locations,
      selectedSectionId,
    ],
  )

  function resetEditor() {
    setEditingSet(null)
    setSelectedCourseId('')
    setSelectedUnitId('')
    setSelectedSectionId('')
    setSelectedLessonId('')
    setTitle('')
    setDescription('')
    setEditorPurpose('practice')
    setEditorStatus('draft')
    setEditorError('')
  }

  async function openCreateEditor() {
    resetEditor()
    setIsEditorOpen(true)

    if (locations.length) {
      return
    }

    try {
      setIsLoadingLocations(true)

      const data =
        await listAdminQuestionLocations()

      setLocations(data)
    } catch (error) {
      setEditorError(
        error.message ||
          'Unable to load lesson locations.',
      )
    } finally {
      setIsLoadingLocations(false)
    }
  }

  async function openEditEditor(questionSet) {
    resetEditor()
    setIsEditorOpen(true)
    setIsLoadingLocations(true)
    setEditorError('')

    try {
      const [
        details,
        locationRows,
      ] = await Promise.all([
        getAdminQuestionSet(
          questionSet.id,
        ),

        locations.length
          ? Promise.resolve(locations)
          : listAdminQuestionLocations(),
      ])

      if (!locations.length) {
        setLocations(locationRows)
      }

      const location =
        locationRows.find(
          (item) =>
            item.lesson_id ===
            details.lesson_id,
        )

      if (!location) {
        throw new Error(
          'The Question Set lesson location could not be found.',
        )
      }

      setEditingSet(details)

      setSelectedCourseId(
        location.course_id,
      )

      setSelectedUnitId(
        location.unit_id,
      )

      setSelectedSectionId(
        location.section_id,
      )

      setSelectedLessonId(
        location.lesson_id,
      )

      setTitle(
        details.title || '',
      )

      setDescription(
        details.description || '',
      )

      setEditorPurpose(
        details.purpose ||
          'practice',
      )

      setEditorStatus(
        details.status ||
          'draft',
      )
    } catch (error) {
      setEditorError(
        error.message ||
          'Unable to load Question Set.',
      )
    } finally {
      setIsLoadingLocations(false)
    }
  }
  function closeEditor() {
    if (isSaving) {
      return
    }

    setIsEditorOpen(false)
    resetEditor()
  }

  function handleCourseChange(event) {
    setSelectedCourseId(event.target.value)
    setSelectedUnitId('')
    setSelectedSectionId('')
    setSelectedLessonId('')
  }

  function handleUnitChange(event) {
    setSelectedUnitId(event.target.value)
    setSelectedSectionId('')
    setSelectedLessonId('')
  }

  function handleSectionChange(event) {
    setSelectedSectionId(event.target.value)
    setSelectedLessonId('')
  }

  async function handleSaveQuestionSet(
    event,
  ) {
    event.preventDefault()

    if (!selectedLessonId) {
      setEditorError(
        'Please select a lesson.',
      )
      return
    }

    if (!title.trim()) {
      setEditorError(
        'Question Set title is required.',
      )
      return
    }

    try {
      setIsSaving(true)
      setEditorError('')

      await saveAdminQuestionSet({
        id: editingSet?.id || null,
        lessonId: selectedLessonId,
        title: title.trim(),
        description:
          description.trim() || null,
        purpose: editorPurpose,
        status: editorStatus,
      })

      setIsEditorOpen(false)
      resetEditor()

      await loadQuestionSets()
    } catch (error) {
      setEditorError(
        error.message ||
          'Unable to save question set.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="question-sets-page">
      <header className="question-sets-hero">
        <div>
          <span className="question-sets-eyebrow">
            Assessment
          </span>

          <h1>Question Sets</h1>

          <p>
            Organize Question Bank items into
            reusable practices and exams without
            duplicating the original questions.
          </p>
        </div>

        <button
          type="button"
          className="question-sets-primary"
          onClick={openCreateEditor}
        >
          + New Question Set
        </button>
      </header>

      <section className="question-sets-toolbar">
        <label>
          <span>Search</span>

          <input
            type="search"
            value={search}
            placeholder="Search sets..."
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </label>

        <label>
          <span>Status</span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
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

        <label>
          <span>Purpose</span>

          <select
            value={purpose}
            onChange={(event) =>
              setPurpose(event.target.value)
            }
          >
            <option value="">
              All purposes
            </option>

            <option value="practice">
              Practice
            </option>

            <option value="block_practice">
              Block Practice
            </option>

            <option value="lesson_exam">
              Lesson Exam
            </option>

            <option value="custom">
              Custom
            </option>
          </select>
        </label>

        <button
          type="button"
          className="question-sets-refresh"
          onClick={loadQuestionSets}
          disabled={isLoading}
        >
          {isLoading
            ? 'Loading...'
            : 'Refresh'}
        </button>
      </section>

      {errorMessage ? (
        <div className="question-sets-alert">
          {errorMessage}
        </div>
      ) : null}

      <section className="question-sets-panel">
        <div className="question-sets-panel__header">
          <div>
            <h2>Available Sets</h2>

            <span>
              {questionSets.length} set
              {questionSets.length === 1
                ? ''
                : 's'}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="question-sets-empty">
            Loading question sets...
          </div>
        ) : questionSets.length === 0 ? (
          <div className="question-sets-empty">
            No question sets match the current
            filters.
          </div>
        ) : (
          <div className="question-sets-grid">
            {questionSets.map((set) => (
              <article
                className="question-set-card"
                key={set.id}
              >
                <div className="question-set-card__top">
                  <span
                    className={
                      'question-set-status ' +
                      'question-set-status--' +
                      set.status
                    }
                  >
                    {set.status}
                  </span>

                  <span className="question-set-version">
                    v{set.version}
                  </span>
                </div>

                <h3>{set.title}</h3>

                <p>
                  {set.description ||
                    'No description provided.'}
                </p>

                <div className="question-set-meta">
                  <div>
                    <span>Questions</span>

                    <strong>
                      {set.question_count}
                    </strong>
                  </div>

                  <div>
                    <span>Total points</span>

                    <strong>
                      {Number(
                        set.total_points || 0,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Purpose</span>

                    <strong>
                      {purposeLabels[
                        set.purpose
                      ] || set.purpose}
                    </strong>
                  </div>
                </div>

                <div className="question-set-card__footer">
                  <span>Lesson ID</span>

                  <code>
                    {set.lesson_id}
                  </code>

                  <div className="question-set-card__actions">
                    <button
                      type="button"
                      className="question-set-edit-button"
                      onClick={() =>
                        openEditEditor(set)
                      }
                    >
                      Edit Set
                    </button>

                    <button
                      type="button"
                      className="question-set-manage-button"
                      onClick={() =>
                        setManagingSet(set)
                      }
                    >
                      Manage Questions
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {managingSet ? (
        <QuestionSetManagerModal
          questionSet={managingSet}
          onClose={() =>
            setManagingSet(null)
          }
          onSaved={async () => {
            setManagingSet(null)
            await loadQuestionSets()
          }}
        />
      ) : null}

      {isEditorOpen ? (
        <div
          className="question-set-editor-backdrop"
          role="presentation"
        >
          <section
            className="question-set-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-set-editor-title"
          >
            <header className="question-set-editor__header">
              <div>
                <span>
                  Question Sets
                </span>

                <h2 id="question-set-editor-title">
                  {editingSet
                    ? 'Edit Question Set'
                    : 'New Question Set'}
                </h2>

                <p>
                  Choose the lesson first, then
                  define the set information.
                </p>
              </div>

              <button
                type="button"
                className="question-set-editor__close"
                onClick={closeEditor}
                disabled={isSaving}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            <form
              className="question-set-editor__body"
              onSubmit={
                handleSaveQuestionSet
              }
            >
              {editorError ? (
                <div className="question-sets-alert">
                  {editorError}
                </div>
              ) : null}

              {isLoadingLocations ? (
                <div className="question-set-editor__loading">
                  Loading locations...
                </div>
              ) : (
                <>
                  <div className="question-set-editor__section">
                    <div className="question-set-editor__section-heading">
                      <span>1</span>

                      <div>
                        <h3>
                          Lesson Location
                        </h3>

                        <p>
                          Course → Unit → Section → Lesson
                        </p>
                      </div>
                    </div>

                    <div className="question-set-editor__location-grid">
                      <label>
                        <span>
                          Course
                        </span>

                        <select
                          value={
                            selectedCourseId
                          }
                          onChange={
                            handleCourseChange
                          }
                          required
                        >
                          <option value="">
                            Select course
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
                                {
                                  course.course_title
                                }
                                {' — '}
                                {
                                  course.cohort
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <label>
                        <span>
                          Unit
                        </span>

                        <select
                          value={
                            selectedUnitId
                          }
                          onChange={
                            handleUnitChange
                          }
                          disabled={
                            !selectedCourseId
                          }
                          required
                        >
                          <option value="">
                            Select unit
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
                                {
                                  unit.unit_title
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <label>
                        <span>
                          Section
                        </span>

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
                          required
                        >
                          <option value="">
                            Select section
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
                                {
                                  section.section_title
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </label>

                      <label>
                        <span>
                          Lesson
                        </span>

                        <select
                          value={
                            selectedLessonId
                          }
                          onChange={(
                            event,
                          ) =>
                            setSelectedLessonId(
                              event.target.value,
                            )
                          }
                          disabled={
                            !selectedSectionId
                          }
                          required
                        >
                          <option value="">
                            Select lesson
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
                                {
                                  lesson.lesson_title
                                }
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="question-set-editor__section">
                    <div className="question-set-editor__section-heading">
                      <span>2</span>

                      <div>
                        <h3>
                          Set Details
                        </h3>

                        <p>
                          Basic information for
                          this Question Set.
                        </p>
                      </div>
                    </div>

                    <div className="question-set-editor__fields">
                      <label className="question-set-editor__wide">
                        <span>
                          Title
                        </span>

                        <input
                          type="text"
                          value={title}
                          onChange={(
                            event,
                          ) =>
                            setTitle(
                              event.target.value,
                            )
                          }
                          placeholder="Example: Unit 1 Grammar Practice"
                          maxLength={160}
                          required
                        />
                      </label>

                      <label className="question-set-editor__wide">
                        <span>
                          Description
                        </span>

                        <textarea
                          value={
                            description
                          }
                          onChange={(
                            event,
                          ) =>
                            setDescription(
                              event.target.value,
                            )
                          }
                          placeholder="Optional description..."
                          rows={3}
                        />
                      </label>

                      <label>
                        <span>
                          Purpose
                        </span>

                        <select
                          value={
                            editorPurpose
                          }
                          onChange={(
                            event,
                          ) =>
                            setEditorPurpose(
                              event.target.value,
                            )
                          }
                        >
                          <option value="practice">
                            Practice
                          </option>

                          <option value="block_practice">
                            Block Practice
                          </option>

                          <option value="lesson_exam">
                            Lesson Exam
                          </option>

                          <option value="custom">
                            Custom
                          </option>
                        </select>
                      </label>

                      <label>
                        <span>
                          Status
                        </span>

                        <select
                          value={
                            editorStatus
                          }
                          onChange={(
                            event,
                          ) =>
                            setEditorStatus(
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
                  </div>
                </>
              )}

              <footer className="question-set-editor__footer">
                <button
                  type="button"
                  className="question-set-editor__cancel"
                  onClick={closeEditor}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="question-sets-primary"
                  disabled={
                    isSaving ||
                    isLoadingLocations ||
                    !selectedLessonId ||
                    !title.trim()
                  }
                >
                  {isSaving
                    ? 'Saving...'
                    : editingSet
                      ? 'Save Changes'
                      : 'Create Question Set'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default AdminQuestionSetsPage


