import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getAdminQuestionSet,
  replaceAdminQuestionSetItems,
} from '../services/adminQuestionSetService'

import {
  listAdminQuestions,
} from '../services/adminQuestionReadService'

import './QuestionSetManagerModal.css'

function QuestionSetManagerModal({
  questionSet,
  onClose,
  onSaved,
}) {
  const [setDetails, setSetDetails] =
    useState(null)

  const [questions, setQuestions] =
    useState([])

  const [selectedItems, setSelectedItems] =
    useState([])

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

          const [
            details,
            availableQuestions,
          ] = await Promise.all([
            getAdminQuestionSet(
              questionSet.id,
            ),

            listAdminQuestions({
              lessonId:
                questionSet.lesson_id,
              limit: 200,
              offset: 0,
            }),
          ])

          setSetDetails(details)

          setQuestions(
            availableQuestions,
          )

          setSelectedItems(
            (details?.items || []).map(
              (item) => ({
                question_id:
                  item.question_id,

                points: Number(
                  item.points || 1,
                ),

                is_required:
                  item.is_required !==
                  false,
              }),
            ),
          )
        } catch (error) {
          setErrorMessage(
            error.message ||
              'Unable to load Question Set.',
          )
        } finally {
          setIsLoading(false)
        }
      },
      0,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [
    questionSet.id,
    questionSet.lesson_id,
  ])

  const selectedMap = useMemo(
    () =>
      new Map(
        selectedItems.map(
          (item) => [
            item.question_id,
            item,
          ],
        ),
      ),
    [selectedItems],
  )

  function toggleQuestion(questionId) {
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
            question_id: questionId,
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
    const numericValue =
      Number(value)

    setSelectedItems(
      (current) =>
        current.map((item) =>
          item.question_id ===
          questionId
            ? {
                ...item,
                points:
                  Number.isFinite(
                    numericValue,
                  ) &&
                  numericValue > 0
                    ? numericValue
                    : 1,
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
                is_required: checked,
              }
            : item,
        ),
    )
  }

  async function saveQuestions() {
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
              Number(item.points) || 1,

            is_required:
              item.is_required !== false,
          }),
        )

      await replaceAdminQuestionSetItems(
        questionSet.id,
        items,
      )

      await onSaved()
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Unable to save Question Set questions.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="question-set-manager-backdrop"
      role="presentation"
    >
      <section
        className="question-set-manager"
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-set-manager-title"
      >
        <header className="question-set-manager__header">
          <div>
            <span>
              Question Set Builder
            </span>

            <h2 id="question-set-manager-title">
              Manage Questions
            </h2>

            <p>
              {setDetails?.title ||
                questionSet.title}
            </p>
          </div>

          <button
            type="button"
            className="question-set-manager__close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="question-set-manager__summary">
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
              {selectedItems.reduce(
                (
                  total,
                  item,
                ) =>
                  total +
                  Number(
                    item.points || 0,
                  ),
                0,
              )}
            </strong>
          </div>
        </div>

        {errorMessage ? (
          <div className="question-set-manager__error">
            {errorMessage}
          </div>
        ) : null}

        <div className="question-set-manager__content">
          {isLoading ? (
            <div className="question-set-manager__empty">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="question-set-manager__empty">
              No questions were found for
              this lesson.
            </div>
          ) : (
            <div className="question-set-manager__questions">
              {questions.map(
                (question) => {
                  const selected =
                    selectedMap.get(
                      question.id,
                    )

                  return (
                    <article
                      className={
                        selected
                          ? 'question-set-manager__question question-set-manager__question--selected'
                          : 'question-set-manager__question'
                      }
                      key={question.id}
                    >
                      <div className="question-set-manager__question-main">
                        <label className="question-set-manager__check">
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

                          <span />
                        </label>

                        <div className="question-set-manager__question-text">
                          <div className="question-set-manager__badges">
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
                        <div className="question-set-manager__controls">
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

                          <label className="question-set-manager__required">
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
                        </div>
                      ) : null}
                    </article>
                  )
                },
              )}
            </div>
          )}
        </div>

        <footer className="question-set-manager__footer">
          <button
            type="button"
            className="question-set-manager__cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className="question-set-manager__save"
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

export default QuestionSetManagerModal
