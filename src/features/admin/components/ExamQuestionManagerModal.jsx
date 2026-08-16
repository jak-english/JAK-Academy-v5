import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getAdminExam,
  replaceAdminExamItems,
} from '../services/adminExamService'

import {
  getAdminQuestionSet,
} from '../services/adminQuestionSetService'

import {
  listAdminQuestions,
} from '../services/adminQuestionReadService'

import './ExamQuestionManagerModal.css'

function ExamQuestionManagerModal({
  exam,
  onClose,
  onSaved,
}) {
  const [examDetails, setExamDetails] =
    useState(null)

  const [questions, setQuestions] =
    useState([])

  const [selectedItems, setSelectedItems] =
    useState([])

  const [search, setSearch] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

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

          const details =
            await getAdminExam(
              exam.id,
            )

          setExamDetails(details)

          let lessonId = null

          if (
            details.source_question_set_id
          ) {
            const sourceSet =
              await getAdminQuestionSet(
                details.source_question_set_id,
              )

            lessonId =
              sourceSet?.lesson_id || null
          }

          const availableQuestions =
            await listAdminQuestions({
              lessonId,
              limit: 200,
              offset: 0,
            })

          setQuestions(
            availableQuestions,
          )

          setSelectedItems(
            (details.items || []).map(
              (item) => ({
                question_id:
                  item.question_id,

                points:
                  Number(item.points) || 1,

                is_required:
                  item.is_required !== false,
              }),
            ),
          )
        } catch (error) {
          setErrorMessage(
            error.message ||
              'Unable to load exam questions.',
          )
        } finally {
          setIsLoading(false)
        }
      },
      0,
    )

    return () =>
      window.clearTimeout(timer)
  }, [exam.id])

  const selectedMap = useMemo(
    () =>
      new Map(
        selectedItems.map(
          (item, index) => [
            item.question_id,
            {
              ...item,
              index,
            },
          ],
        ),
      ),
    [selectedItems],
  )

  const visibleQuestions =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase()

      if (!normalizedSearch) {
        return questions
      }

      return questions.filter(
        (question) =>
          String(
            question.prompt_json
              ?.text || '',
          )
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      )
    }, [
      questions,
      search,
    ])

  const totalPoints =
    useMemo(
      () =>
        selectedItems.reduce(
          (total, item) =>
            total +
            Number(
              item.points || 0,
            ),
          0,
        ),
      [selectedItems],
    )

  function toggleQuestion(
    questionId,
  ) {
    setSelectedItems(
      (current) => {
        const exists =
          current.some(
            (item) =>
              item.question_id ===
              questionId,
          )

        if (exists) {
          return current.filter(
            (item) =>
              item.question_id !==
              questionId,
          )
        }

        return [
          ...current,
          {
            question_id:
              questionId,
            points: 1,
            is_required: true,
          },
        ]
      },
    )
  }

  function changePoints(
    questionId,
    value,
  ) {
    setSelectedItems(
      (current) =>
        current.map((item) =>
          item.question_id ===
          questionId
            ? {
                ...item,
                points: value,
              }
            : item,
        ),
    )
  }

  function changeRequired(
    questionId,
    checked,
  ) {
    setSelectedItems(
      (current) =>
        current.map((item) =>
          item.question_id ===
          questionId
            ? {
                ...item,
                is_required:
                  checked,
              }
            : item,
        ),
    )
  }

  function moveQuestion(
    questionId,
    direction,
  ) {
    setSelectedItems(
      (current) => {
        const index =
          current.findIndex(
            (item) =>
              item.question_id ===
              questionId,
          )

        if (index < 0) {
          return current
        }

        const targetIndex =
          index + direction

        if (
          targetIndex < 0 ||
          targetIndex >=
            current.length
        ) {
          return current
        }

        const next = [
          ...current,
        ]

        const temp =
          next[index]

        next[index] =
          next[targetIndex]

        next[targetIndex] =
          temp

        return next
      },
    )
  }

  async function saveQuestions() {
    for (
      const item
      of selectedItems
    ) {
      const points =
        Number(item.points)

      if (
        !Number.isFinite(points) ||
        points <= 0
      ) {
        setErrorMessage(
          'Every selected question must have points greater than 0.',
        )
        return
      }
    }

    try {
      setIsSaving(true)
      setErrorMessage('')

      const items =
        selectedItems.map(
          (item, index) => ({
            question_id:
              item.question_id,

            sort_order:
              index + 1,

            points:
              Number(item.points),

            is_required:
              item.is_required !== false,
          }),
        )

      await replaceAdminExamItems(
        exam.id,
        items,
      )

      await onSaved()
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Unable to save exam questions.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="exam-question-manager-backdrop"
      role="presentation"
    >
      <section
        className="exam-question-manager"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-question-manager-title"
      >
        <header className="exam-question-manager__header">
          <div>
            <span>
              Exam Builder
            </span>

            <h2 id="exam-question-manager-title">
              Manage Questions
            </h2>

            <p>
              {examDetails?.title ||
                exam.title}
            </p>
          </div>

          <button
            type="button"
            className="exam-question-manager__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="exam-question-manager__summary">
          <div>
            <span>Available</span>

            <strong>
              {questions.length}
            </strong>
          </div>

          <div>
            <span>Selected</span>

            <strong>
              {selectedItems.length}
            </strong>
          </div>

          <div>
            <span>Total Points</span>

            <strong>
              {totalPoints}
            </strong>
          </div>
        </div>

        {errorMessage ? (
          <div className="exam-question-manager__error">
            {errorMessage}
          </div>
        ) : null}

        <div className="exam-question-manager__toolbar">
          <input
            type="search"
            value={search}
            placeholder="Search questions..."
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />
        </div>

        <div className="exam-question-manager__content">
          {isLoading ? (
            <div className="exam-question-manager__empty">
              Loading questions...
            </div>
          ) : visibleQuestions.length ===
            0 ? (
            <div className="exam-question-manager__empty">
              No questions found.
            </div>
          ) : (
            <div className="exam-question-manager__questions">
              {visibleQuestions.map(
                (question) => {
                  const selected =
                    selectedMap.get(
                      question.id,
                    )

                  return (
                    <article
                      key={question.id}
                      className={
                        selected
                          ? 'exam-question-manager__question exam-question-manager__question--selected'
                          : 'exam-question-manager__question'
                      }
                    >
                      <div className="exam-question-manager__question-main">
                        <label className="exam-question-manager__check">
                          <input
                            type="checkbox"
                            checked={
                              Boolean(
                                selected,
                              )
                            }
                            onChange={() =>
                              toggleQuestion(
                                question.id,
                              )
                            }
                          />
                        </label>

                        <div className="exam-question-manager__question-text">
                          <div className="exam-question-manager__badges">
                            <span>
                              {
                                question.question_type
                              }
                            </span>

                            <span>
                              {
                                question.difficulty
                              }
                            </span>

                            {selected ? (
                              <span>
                                #
                                {selected.index +
                                  1}
                              </span>
                            ) : null}
                          </div>

                          <strong>
                            {
                              question
                                .prompt_json
                                ?.text
                            }
                          </strong>
                        </div>
                      </div>

                      {selected ? (
                        <div className="exam-question-manager__controls">
                          <label>
                            <span>
                              Points
                            </span>

                            <input
                              type="number"
                              min="0.25"
                              step="0.25"
                              value={
                                selected.points
                              }
                              onChange={(
                                event,
                              ) =>
                                changePoints(
                                  question.id,
                                  event.target
                                    .value,
                                )
                              }
                            />
                          </label>

                          <label className="exam-question-manager__required">
                            <input
                              type="checkbox"
                              checked={
                                selected.is_required
                              }
                              onChange={(
                                event,
                              ) =>
                                changeRequired(
                                  question.id,
                                  event.target
                                    .checked,
                                )
                              }
                            />

                            <span>
                              Required
                            </span>
                          </label>

                          <div className="exam-question-manager__order">
                            <button
                              type="button"
                              onClick={() =>
                                moveQuestion(
                                  question.id,
                                  -1,
                                )
                              }
                              disabled={
                                selected.index ===
                                0
                              }
                            >
                              ↑ Up
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveQuestion(
                                  question.id,
                                  1,
                                )
                              }
                              disabled={
                                selected.index ===
                                selectedItems.length -
                                  1
                              }
                            >
                              ↓ Down
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                },
              )}
            </div>
          )}
        </div>

        <footer className="exam-question-manager__footer">
          <button
            type="button"
            className="exam-question-manager__cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="exam-question-manager__save"
            onClick={saveQuestions}
            disabled={
              isLoading ||
              isSaving
            }
          >
            {isSaving
              ? 'Saving...'
              : 'Save Questions'}
          </button>
        </footer>
      </section>
    </div>
  )
}

export default ExamQuestionManagerModal
