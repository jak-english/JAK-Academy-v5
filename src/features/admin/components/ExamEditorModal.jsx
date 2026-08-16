import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getAdminQuestionSet,
  listAdminQuestionSets,
} from '../services/adminQuestionSetService'

import {
  getAdminExam,
  replaceAdminExamItems,
  saveAdminExam,
} from '../services/adminExamService'

import {
  listAdminQuestionLocations,
} from '../services/adminQuestionLocationService'

import './ExamEditorModal.css'

function ExamEditorModal({
  exam = null,
  onClose,
  onSaved,
}) {
  const [questionSets, setQuestionSets] =
    useState([])

  const [courses, setCourses] =
    useState([])

  const [selectedCourseId, setSelectedCourseId] =
    useState('')

  const [selectedQuestionSetId, setSelectedQuestionSetId] =
    useState('')

  const [selectedQuestionSet, setSelectedQuestionSet] =
    useState(null)

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [durationMinutes, setDurationMinutes] =
    useState(30)

  const [status, setStatus] =
    useState('draft')

  const [maxAttempts, setMaxAttempts] =
    useState(1)

  const [availableFrom, setAvailableFrom] =
    useState('')

  const [availableUntil, setAvailableUntil] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isLoadingSet, setIsLoadingSet] =
    useState(false)

  const [isSaving, setIsSaving] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    const timer = window.setTimeout(
      async () => {
        try {
          setIsLoading(true)
          setErrorMessage('')

          const [
            sets,
            locations,
            examDetails,
          ] = await Promise.all([
            listAdminQuestionSets({
              limit: 200,
              offset: 0,
            }),

            listAdminQuestionLocations(),

            exam
              ? getAdminExam(exam.id)
              : Promise.resolve(null),
          ])

          setQuestionSets(sets)

          const uniqueCourses = Array.from(
            new Map(
              locations.map((location) => [
                location.course_id,
                {
                  id: location.course_id,
                  title: location.course_title,
                  gradeLevel: location.grade_level,
                  cohort: location.cohort,
                  isActive: location.course_is_active,
                },
              ]),
            ).values(),
          )

          setCourses(uniqueCourses)

          if (examDetails) {
            setSelectedCourseId(
              examDetails.course_id || '',
            )

            setTitle(
              examDetails.title || '',
            )

            setDescription(
              examDetails.description || '',
            )

            setDurationMinutes(
              examDetails.duration_minutes || 30,
            )

            setStatus(
              examDetails.status || 'draft',
            )

            setMaxAttempts(
              examDetails.max_attempts || 1,
            )

            setAvailableFrom(
              examDetails.available_from
                ? new Date(examDetails.available_from)
                    .toISOString()
                    .slice(0, 16)
                : '',
            )

            setAvailableUntil(
              examDetails.available_until
                ? new Date(examDetails.available_until)
                    .toISOString()
                    .slice(0, 16)
                : '',
            )

            const sourceId =
              examDetails.source_question_set_id ||
              ''

            setSelectedQuestionSetId(
              sourceId,
            )

            if (sourceId) {
              try {
                setIsLoadingSet(true)

                const setDetails =
                  await getAdminQuestionSet(
                    sourceId,
                  )

                setSelectedQuestionSet(
                  setDetails,
                )
              } finally {
                setIsLoadingSet(false)
              }
            }
          }
        } catch (error) {
          setErrorMessage(
            error.message ||
              'Unable to load exam editor.',
          )
        } finally {
          setIsLoading(false)
        }
      },
      0,
    )

    return () =>
      window.clearTimeout(timer)
  }, [exam])
  const selectedSummary = useMemo(
    () => {
      if (!selectedQuestionSet) {
        return {
          questions: 0,
          points: 0,
        }
      }

      const items =
        Array.isArray(
          selectedQuestionSet.items,
        )
          ? selectedQuestionSet.items
          : []

      return {
        questions: items.length,

        points: items.reduce(
          (total, item) =>
            total +
            Number(item.points || 0),
          0,
        ),
      }
    },
    [selectedQuestionSet],
  )

  async function handleQuestionSetChange(
    event,
  ) {
    const questionSetId =
      event.target.value

    setSelectedQuestionSetId(
      questionSetId,
    )

    setSelectedQuestionSet(null)
    setErrorMessage('')

    if (!questionSetId) {
      return
    }


    try {
      setIsLoadingSet(true)

      const details =
        await getAdminQuestionSet(
          questionSetId,
        )

      setSelectedQuestionSet(
        details,
      )

      if (!title.trim()) {
        setTitle(
          details?.title
            ? details.title + ' Exam'
            : '',
        )
      }
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Unable to load Question Set.',
      )
    } finally {
      setIsLoadingSet(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedCourseId) {
      setErrorMessage(
        'Please select a Course.',
      )
      return
    }

    if (!title.trim()) {
      setErrorMessage(
        'Exam title is required.',
      )
      return
    }

    if (!selectedQuestionSetId) {
      setErrorMessage(
        'Please select a Question Set.',
      )
      return
    }

    if (!selectedQuestionSet) {
      setErrorMessage(
        'Question Set details are not loaded.',
      )
      return
    }

    const safeDuration =
      Number(durationMinutes)

    const safeMaxAttempts =
      Number(maxAttempts)

    if (
      !Number.isInteger(safeDuration) ||
      safeDuration <= 0
    ) {
      setErrorMessage(
        'Duration must be a positive whole number.',
      )
      return
    }


    try {
      setIsSaving(true)
      setErrorMessage('')

      const savedExam =
        await saveAdminExam({
          id: exam?.id || null,
          title: title.trim(),
          description:
            description.trim() || null,
          questionSetId:
            selectedQuestionSetId,
          durationMinutes:
            safeDuration,
          status,
          courseId:
            selectedCourseId,
          availableFrom:
            availableFrom
              ? new Date(availableFrom).toISOString()
              : null,
          availableUntil:
            availableUntil
              ? new Date(availableUntil).toISOString()
              : null,
          maxAttempts:
            safeMaxAttempts,
        })

      const examId =
        savedExam?.id

      if (!examId) {
        throw new Error(
          'Exam was saved but no exam ID was returned.',
        )
      }

      if (!exam) {
        const sourceItems =
          Array.isArray(
            selectedQuestionSet.items,
          )
            ? selectedQuestionSet.items
            : []

        const examItems =
          sourceItems.map(
            (item, index) => ({
              question_id:
                item.question_id,

              sort_order:
                index + 1,

              points:
                Number(item.points) || 1,

              is_required:
                item.is_required !== false,
            }),
          )

        await replaceAdminExamItems(
          examId,
          examItems,
        )
      }
      await onSaved()
    } catch (error) {
      setErrorMessage(
        error.message ||
          exam ? 'Unable to update exam.' : 'Unable to create exam.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="exam-editor-backdrop"
      role="presentation"
    >
      <section
        className="exam-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-editor-title"
      >
        <header className="exam-editor__header">
          <div>
            <span>
              Assessment Builder
            </span>

            <h2 id="exam-editor-title">
              {exam
                ? 'Edit Exam'
                : 'New Exam'}
            </h2>

            <p>
              {exam
                ? 'Update exam details without changing its questions.'
                : 'Create an exam from an existing Question Set.'}
            </p>
          </div>

          <button
            type="button"
            className="exam-editor__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <form
          className="exam-editor__body"
          onSubmit={handleSubmit}
        >
          {errorMessage ? (
            <div className="exam-editor__error">
              {errorMessage}
            </div>
          ) : null}

          <div className="exam-editor__section">
            <div className="exam-editor__section-title">
              <span>1</span>

              <div>
                <strong>
                  Source Question Set
                </strong>

                <small>
                  Questions remain linked to
                  the central Question Bank.
                </small>
              </div>
            </div>

            <label className="exam-editor__field">
              <span>Question Set</span>

              <select
                value={
                  selectedQuestionSetId
                }
                onChange={
                  handleQuestionSetChange
                }
                disabled={
                  isLoading ||
                  isSaving ||
                  Boolean(exam)
                }
              >
                <option value="">
                  {isLoading
                    ? 'Loading Question Sets...'
                    : 'Select Question Set'}
                </option>

                {questionSets.map(
                  (questionSet) => (
                    <option
                      key={questionSet.id}
                      value={questionSet.id}
                    >
                      {questionSet.title +
                        ' — ' +
                        Number(
                          questionSet.question_count ||
                            0,
                        ) +
                        ' questions'}
                    </option>
                  ),
                )}
              </select>
            </label>

            {isLoadingSet ? (
              <div className="exam-editor__loading">
                Loading Question Set...
              </div>
            ) : null}

            {selectedQuestionSet ? (
              <div className="exam-editor__source-summary">
                <div>
                  <span>Questions</span>
                  <strong>
                    {
                      selectedSummary.questions
                    }
                  </strong>
                </div>

                <div>
                  <span>Total Points</span>
                  <strong>
                    {
                      selectedSummary.points
                    }
                  </strong>
                </div>

                <div>
                  <span>Purpose</span>
                  <strong>
                    {
                      selectedQuestionSet.purpose
                    }
                  </strong>
                </div>

                <div>
                  <span>Set Version</span>
                  <strong>
                    v{
                      selectedQuestionSet.version
                    }
                  </strong>
                </div>
              </div>
            ) : null}
          </div>

          <div className="exam-editor__section">
            <div className="exam-editor__section-title">
              <span>2</span>

              <div>
                <strong>
                  Exam Details
                </strong>

                <small>
                  Configure the exam itself.
                </small>
              </div>
            </div>

            <label className="exam-editor__field">
              <span>Course</span>

              <select
                value={selectedCourseId}
                onChange={(event) =>
                  setSelectedCourseId(
                    event.target.value,
                  )
                }
                disabled={
                  isLoading ||
                  isSaving
                }
              >
                <option value="">
                  {isLoading
                    ? 'Loading Courses...'
                    : 'Select Course'}
                </option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title +
                      ' - ' +
                      course.gradeLevel +
                      ' - Cohort ' +
                      course.cohort +
                      (course.isActive
                        ? ''
                        : ' - Inactive')}
                  </option>
                ))}
              </select>
            </label>

            <label className="exam-editor__field">
              <span>Title</span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Exam title"
                disabled={isSaving}
              />
            </label>

            <label className="exam-editor__field">
              <span>Description</span>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Optional description"
                rows="3"
                disabled={isSaving}
              />
            </label>

            <div className="exam-editor__row">
              <label className="exam-editor__field">
                <span>
                  Duration (minutes)
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={durationMinutes}
                  onChange={(event) =>
                    setDurationMinutes(
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
                />
              </label>

              <label className="exam-editor__field">
                <span>Status</span>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
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

            <div className="exam-editor__row">
              <label className="exam-editor__field">
                <span>Max Attempts</span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={maxAttempts}
                  onChange={(event) =>
                    setMaxAttempts(
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
                />
              </label>

              <label className="exam-editor__field">
                <span>Available From</span>

                <input
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(event) =>
                    setAvailableFrom(
                      event.target.value,
                    )
                  }
                  disabled={isSaving}
                />
              </label>
            </div>

            <label className="exam-editor__field">
              <span>Available Until</span>

              <input
                type="datetime-local"
                value={availableUntil}
                onChange={(event) =>
                  setAvailableUntil(
                    event.target.value,
                  )
                }
                disabled={isSaving}
              />
            </label>
          </div>

          <footer className="exam-editor__footer">
            <button
              type="button"
              className="exam-editor__cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="exam-editor__save"
              disabled={
                isSaving ||
                isLoading ||
                isLoadingSet ||
                !selectedCourseId ||
                !selectedQuestionSetId ||
                !selectedQuestionSet ||
                !title.trim()
              }
            >
              {isSaving
                ? exam
                  ? 'Saving Changes...'
                  : 'Creating Exam...'
                : exam
                  ? 'Save Changes'
                  : 'Create Exam'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default ExamEditorModal