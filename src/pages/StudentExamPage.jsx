import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import logo from '../assets/logo.png'

import {
  getStudentExamAttempt,
  saveStudentExamAnswer,
  startStudentExam,
  submitStudentExamAttempt,
} from '../features/student/services/studentExamService'

import './StudentExamPage.css'

function formatTime(totalSeconds) {
  if (totalSeconds === null) {
    return '--:--'
  }

  const safeSeconds = Math.max(
    0,
    Number(totalSeconds) || 0,
  )

  const minutes = Math.floor(
    safeSeconds / 60,
  )

  const seconds =
    safeSeconds % 60

  return `${String(minutes).padStart(
    2,
    '0',
  )}:${String(seconds).padStart(
    2,
    '0',
  )}`
}

function getPromptText(question) {
  return (
    question?.prompt_json?.text ||
    'سؤال'
  )
}

function getQuestionOptions(question) {
  if (question?.question_type !== 'mcq') {
    return []
  }

  const activeOptions =
    question?.response_config?.options

  if (Array.isArray(activeOptions)) {
    return activeOptions
  }

  const resultOptions =
    question?.correct_answer?.options

  if (Array.isArray(resultOptions)) {
    return resultOptions
  }

  return []
}

function StudentExamPage() {
  const navigate = useNavigate()

  const {
    examId,
    attemptId,
  } = useParams()

  const [
    attempt,
    setAttempt,
  ] = useState(null)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  const [
    savingQuestions,
    setSavingQuestions,
  ] = useState({})

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    remainingSeconds,
    setRemainingSeconds,
  ] = useState(null)

  const autoSubmitStartedRef =
    useRef(false)

  const loadAttempt =
    useCallback(
      async (targetAttemptId) => {
        const data =
          await getStudentExamAttempt(
            targetAttemptId,
          )

        setAttempt(data)

        if (
          data?.status === 'in_progress'
        ) {
          setRemainingSeconds(
            data?.remaining_seconds ??
              null,
          )
        } else {
          setRemainingSeconds(0)
        }

        return data
      },
      [],
    )

  useEffect(() => {
    let isMounted = true

    async function initializeExam() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        if (attemptId) {
          const data =
            await getStudentExamAttempt(
              attemptId,
            )

          if (!isMounted) {
            return
          }

          setAttempt(data)

          if (
            data?.status ===
            'in_progress'
          ) {
            setRemainingSeconds(
              data?.remaining_seconds ??
                null,
            )
          } else {
            setRemainingSeconds(0)
          }

          return
        }

        if (!examId) {
          throw new Error(
            'معرّف الاختبار غير موجود.',
          )
        }

        const started =
          await startStudentExam(examId)

        if (!isMounted) {
          return
        }

        if (!started?.attempt_id) {
          throw new Error(
            'تعذر إنشاء محاولة الاختبار.',
          )
        }

        navigate(
          `/student/exam-attempts/${started.attempt_id}`,
          {
            replace: true,
          },
        )
      } catch (error) {
        console.error(
          'Student exam initialization error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر فتح الاختبار.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeExam()

    return () => {
      isMounted = false
    }
  }, [
    attemptId,
    examId,
    navigate,
  ])

  const submitAttempt =
    useCallback(
      async ({
        skipConfirmation = false,
      } = {}) => {
        if (
          !attempt?.attempt_id ||
          isSubmitting
        ) {
          return
        }

        if (
          !skipConfirmation &&
          !window.confirm(
            'هل تريد تسليم الاختبار؟ لن تتمكن من تغيير إجاباتك بعد التسليم.',
          )
        ) {
          return
        }

        try {
          setIsSubmitting(true)
          setErrorMessage('')

          const result =
            await submitStudentExamAttempt(
              attempt.attempt_id,
            )

          setAttempt(result)
          setRemainingSeconds(0)
        } catch (error) {
          console.error(
            'Student exam submit error:',
            error,
          )

          setErrorMessage(
            error.message ||
              'تعذر تسليم الاختبار.',
          )
        } finally {
          setIsSubmitting(false)
        }
      },
      [
        attempt,
        isSubmitting,
      ],
    )

  useEffect(() => {
    if (
      attempt?.status !==
        'in_progress' ||
      remainingSeconds === null
    ) {
      return undefined
    }

    if (remainingSeconds <= 0) {
      if (
        !autoSubmitStartedRef.current
      ) {
        autoSubmitStartedRef.current =
          true

        submitAttempt({
          skipConfirmation: true,
        })
      }

      return undefined
    }

    const timerId =
      window.setInterval(() => {
        setRemainingSeconds(
          (currentValue) => {
            if (
              currentValue === null
            ) {
              return null
            }

            return Math.max(
              0,
              currentValue - 1,
            )
          },
        )
      }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [
    attempt?.status,
    remainingSeconds,
    submitAttempt,
  ])

  async function handleAnswerChange(
    question,
    answerJson,
  ) {
    if (
      attempt?.status !==
      'in_progress'
    ) {
      return
    }

    const questionId =
      question.attempt_question_id

    setAttempt((currentAttempt) => ({
      ...currentAttempt,
      questions:
        currentAttempt.questions.map(
          (item) =>
            item.attempt_question_id ===
            questionId
              ? {
                  ...item,
                  answer_json:
                    answerJson,
                  is_answered: true,
                }
              : item,
        ),
    }))

    setSavingQuestions(
      (currentState) => ({
        ...currentState,
        [questionId]: true,
      }),
    )

    try {
      setErrorMessage('')

      await saveStudentExamAnswer({
        attemptId:
          attempt.attempt_id,

        attemptQuestionId:
          questionId,

        answerJson,
      })
    } catch (error) {
      console.error(
        'Student answer save error:',
        error,
      )

      setErrorMessage(
        error.message ||
          'تعذر حفظ إجابتك.',
      )

      try {
        await loadAttempt(
          attempt.attempt_id,
        )
      } catch (reloadError) {
        console.error(
          'Attempt reload error:',
          reloadError,
        )
      }
    } finally {
      setSavingQuestions(
        (currentState) => ({
          ...currentState,
          [questionId]: false,
        }),
      )
    }
  }

  if (isLoading) {
    return (
      <main className="student-exam-state">
        <div className="student-exam-loader" />

        <h1>جارٍ تجهيز ساحة الاختبار</h1>

        <p>
          نجهّز الأسئلة ونستعيد تقدمك بأمان...
        </p>
      </main>
    )
  }

  if (errorMessage && !attempt) {
    return (
      <main className="student-exam-state">
        <div className="student-exam-error-icon">
          !
        </div>

        <h1>الاختبار غير متاح</h1>

        <p role="alert">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate('/student')
          }
        >
          العودة إلى الرئيسية
        </button>
      </main>
    )
  }

  if (!attempt) {
    return null
  }

  const isActive =
    attempt.status === 'in_progress'

  const questions =
    Array.isArray(attempt.questions)
      ? attempt.questions
      : []

  const answeredCount =
    isActive
      ? questions.filter(
          (question) =>
            question.is_answered,
        ).length
      : Number(
          attempt.answered_count,
        ) || 0

  return (
    <main
      className="student-exam-page"
      dir="rtl"
    >
      <header className="student-exam-navbar">
        <button
          className="student-exam-brand"
          type="button"
          onClick={() =>
            navigate('/student')
          }
        >
          <img
            src={logo}
            alt="JAK Academy"
          />

          <div>
            <strong>JAK Academy</strong>
            <span>Exam Arena</span>
          </div>
        </button>

        <div className="student-exam-navbar__center">
          <span>
            {isActive
              ? 'الاختبار قيد الحل'
              : 'نتيجة الاختبار'}
          </span>

          <strong dir="auto">
            {attempt.exam_title}
          </strong>
        </div>

        <div className="student-exam-navbar__right">
          {isActive && (
            <div
              className={
                remainingSeconds !== null &&
                remainingSeconds <= 300
                  ? 'student-exam-timer student-exam-timer--danger'
                  : 'student-exam-timer'
              }
            >
              <span>الوقت المتبقي</span>

              <strong dir="ltr">
                {formatTime(
                  remainingSeconds,
                )}
              </strong>
            </div>
          )}

          <button
            className="student-exam-exit"
            type="button"
            onClick={() =>
              navigate('/student')
            }
          >
            الرئيسية
          </button>
        </div>
      </header>

      <section className="student-exam-hero">
        <div className="student-exam-hero__copy">
          <span className="student-exam-eyebrow">
            JAK EXAM ARENA
          </span>

          <h1 dir="auto">
            {attempt.exam_title}
          </h1>

          <p>
            <span>
              {questions.length} سؤال
            </span>

            <i>•</i>

            <span>
              {attempt.total_points} علامة
            </span>
          </p>
        </div>

        {isActive ? (
          <div className="student-exam-progress-card">
            <span>تقدمك</span>

            <strong dir="ltr">
              {answeredCount}
              <small>
                /{questions.length}
              </small>
            </strong>

            <div className="student-exam-progress-track">
              <span
                style={{
                  width: `${
                    questions.length > 0
                      ? Math.round(
                          (answeredCount /
                            questions.length) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>

            <small>تمت الإجابة</small>
          </div>
        ) : (
          <div className="student-exam-score-card">
            <span>النتيجة النهائية</span>

            <strong dir="ltr">
              {attempt.percentage ?? 0}%
            </strong>

            <small>
              {attempt.earned_points ?? 0}
              {' / '}
              {attempt.total_points}
              {' علامة'}
            </small>
          </div>
        )}
      </section>

      {errorMessage && (
        <div
          className="student-exam-alert"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="student-exam-arena-layout">
        <section className="student-exam-content">
          {questions.map(
            (question, index) => {
              const questionId =
                question.attempt_question_id

              const isSaving =
                Boolean(
                  savingQuestions[
                    questionId
                  ],
                )

              return (
                <article
                  id={`exam-question-${index + 1}`}
                  className={[
                    'student-exam-question',
                    isActive
                      ? ''
                      : question.is_correct
                        ? 'student-exam-question--correct'
                        : 'student-exam-question--incorrect',
                    question.is_answered
                      ? 'student-exam-question--answered'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={questionId}
                >
                  <div className="student-exam-question__header">
                    <div className="student-exam-question__identity">
                      <span className="student-exam-question__number">
                        {String(
                          index + 1,
                        ).padStart(2, '0')}
                      </span>

                      <div>
                        <span>
                          السؤال
                        </span>

                        <strong>
                          {question.points}{' '}
                          علامة
                        </strong>
                      </div>
                    </div>

                    {isActive ? (
                      <small
                        className={[
                          'student-exam-question__save',
                          isSaving
                            ? 'student-exam-question__save--saving'
                            : question.is_answered
                              ? 'student-exam-question__save--saved'
                              : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {isSaving
                          ? 'جارٍ الحفظ...'
                          : question.is_answered
                            ? '✓ تم حفظ الإجابة'
                            : 'لم تتم الإجابة'}
                      </small>
                    ) : (
                      <small
                        className={
                          question.is_correct
                            ? 'student-exam-result-badge student-exam-result-badge--correct'
                            : 'student-exam-result-badge student-exam-result-badge--incorrect'
                        }
                      >
                        {question.is_correct
                          ? '✓ إجابة صحيحة'
                          : '✕ إجابة غير صحيحة'}
                      </small>
                    )}
                  </div>

                  <h2 dir="auto">
                    {getPromptText(
                      question,
                    )}
                  </h2>

                  {question.question_type ===
                    'mcq' && (
                    <div className="student-exam-options">
                      {getQuestionOptions(
                        question,
                      ).map(
                        (
                          option,
                          optionIndex,
                        ) => {
                          const selected =
                            question
                              .answer_json
                              ?.selectedOptionId ===
                            option.id

                          const correct =
                            !isActive &&
                            question
                              .correct_answer
                              ?.correctOptionId ===
                              option.id

                          const optionLetter =
                            String.fromCharCode(
                              65 +
                                optionIndex,
                            )

                          return (
                            <label
                              className={[
                                'student-exam-option',
                                selected
                                  ? 'student-exam-option--selected'
                                  : '',
                                correct
                                  ? 'student-exam-option--correct'
                                  : '',
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(' ')}
                              key={
                                option.id
                              }
                            >
                              <input
                                type="radio"
                                name={
                                  questionId
                                }
                                value={
                                  option.id
                                }
                                checked={
                                  selected
                                }
                                disabled={
                                  !isActive ||
                                  isSubmitting
                                }
                                onChange={() =>
                                  handleAnswerChange(
                                    question,
                                    {
                                      selectedOptionId:
                                        option.id,
                                    },
                                  )
                                }
                              />

                              <span className="student-exam-option__letter">
                                {optionLetter}
                              </span>

                              <span
                                className="student-exam-option__text"
                                dir="auto"
                              >
                                {option.text}
                              </span>

                              <span className="student-exam-option__indicator">
                                {selected
                                  ? '✓'
                                  : ''}
                              </span>
                            </label>
                          )
                        },
                      )}
                    </div>
                  )}

                  {question.question_type ===
                    'true_false' && (
                    <div className="student-exam-options student-exam-options--tf">
                      {[true, false].map(
                        (value) => {
                          const selected =
                            question
                              .answer_json
                              ?.value ===
                            value

                          const correct =
                            !isActive &&
                            question
                              .correct_answer
                              ?.correctAnswer ===
                            value

                          return (
                            <label
                              className={[
                                'student-exam-option',
                                selected
                                  ? 'student-exam-option--selected'
                                  : '',
                                correct
                                  ? 'student-exam-option--correct'
                                  : '',
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(' ')}
                              key={String(
                                value,
                              )}
                            >
                              <input
                                type="radio"
                                name={
                                  questionId
                                }
                                checked={
                                  selected
                                }
                                disabled={
                                  !isActive ||
                                  isSubmitting
                                }
                                onChange={() =>
                                  handleAnswerChange(
                                    question,
                                    {
                                      value,
                                    },
                                  )
                                }
                              />

                              <span className="student-exam-option__letter">
                                {value
                                  ? 'T'
                                  : 'F'}
                              </span>

                              <span
                                className="student-exam-option__text"
                                dir="ltr"
                              >
                                {value
                                  ? 'True'
                                  : 'False'}
                              </span>

                              <span className="student-exam-option__indicator">
                                {selected
                                  ? '✓'
                                  : ''}
                              </span>
                            </label>
                          )
                        },
                      )}
                    </div>
                  )}

                  {!isActive &&
                    question.explanation
                      ?.text && (
                      <div className="student-exam-explanation">
                        <div>
                          <span>JAK Insight</span>
                          <strong>
                            شرح الإجابة
                          </strong>
                        </div>

                        <p dir="auto">
                          {
                            question
                              .explanation
                              .text
                          }
                        </p>
                      </div>
                    )}
                </article>
              )
            },
          )}
        </section>

        <aside className="student-exam-navigator">
          <div className="student-exam-navigator__header">
            <span>خريطة الاختبار</span>

            <strong>
              الانتقال إلى سؤال
            </strong>
          </div>

          <div className="student-exam-navigator__progress">
            <span>
              {answeredCount} من{' '}
              {questions.length}
            </span>

            <strong>
              {questions.length > 0
                ? Math.round(
                    (answeredCount /
                      questions.length) *
                      100,
                  )
                : 0}
              %
            </strong>
          </div>

          <div className="student-exam-navigator__grid">
            {questions.map(
              (question, index) => (
                <button
                  key={
                    question.attempt_question_id
                  }
                  type="button"
                  className={[
                    'student-exam-nav-number',
                    question.is_answered
                      ? 'student-exam-nav-number--answered'
                      : '',
                    !isActive &&
                    question.is_correct
                      ? 'student-exam-nav-number--correct'
                      : '',
                    !isActive &&
                    !question.is_correct
                      ? 'student-exam-nav-number--incorrect'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    const target =
                      document.getElementById(
                        `exam-question-${index + 1}`,
                      )

                    if (!target) {
                      return
                    }

                    target.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })

                    target.classList.remove(
                      'student-exam-question--jump-highlight',
                    )

                    window.requestAnimationFrame(
                      () => {
                        target.classList.add(
                          'student-exam-question--jump-highlight',
                        )

                        window.setTimeout(
                          () => {
                            target.classList.remove(
                              'student-exam-question--jump-highlight',
                            )
                          },
                          1250,
                        )
                      },
                    )
                  }}
                >
                  {index + 1}
                </button>
              ),
            )}
          </div>

          <div className="student-exam-navigator__legend">
            {isActive ? (
              <>
                <span>
                  <i className="is-answered" />
                  تمت الإجابة
                </span>

                <span>
                  <i />
                  لم تتم الإجابة
                </span>
              </>
            ) : (
              <>
                <span>
                  <i className="is-correct" />
                  صحيح
                </span>

                <span>
                  <i className="is-incorrect" />
                  غير صحيح
                </span>
              </>
            )}
          </div>

          {isActive && (
            <div className="student-exam-auto-save">
              <span>✓</span>

              <p>
                يتم حفظ إجاباتك تلقائيًا أثناء الحل.
              </p>
            </div>
          )}
        </aside>
      </div>

      {isActive && (
        <footer className="student-exam-submit-bar">
          <div className="student-exam-submit-bar__progress">
            <div>
              <strong>
                {answeredCount} من{' '}
                {questions.length}
                {' تمت الإجابة'}
              </strong>

              <span>
                يتم حفظ إجاباتك تلقائيًا
              </span>
            </div>

            <div className="student-exam-submit-progress">
              <span
                style={{
                  width: `${
                    questions.length > 0
                      ? Math.round(
                          (answeredCount /
                            questions.length) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              submitAttempt()
            }
          >
            {isSubmitting
              ? 'جارٍ تسليم الاختبار...'
              : 'تسليم الاختبار'}
          </button>
        </footer>
      )}

      {!isActive && (
        <footer className="student-exam-result-footer">
          <button
            type="button"
            onClick={() =>
              navigate('/student')
            }
          >
            العودة إلى الرئيسية
          </button>
        </footer>
      )}
    </main>
  )
}

export default StudentExamPage