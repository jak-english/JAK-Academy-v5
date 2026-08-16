import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getStudentDueSpacedReviews,
  submitSpacedReviewAnswer,
} from '../features/student/services/studentStudyPlanService'

import './StudentSpacedReviewPage.css'

function StudentSpacedReviewPage() {
  const navigate = useNavigate()

  const [reviews, setReviews] = useState([])
  const [selectedAnswer, setSelectedAnswer] =
    useState(null)

  const [result, setResult] = useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadInitialReviews() {
      try {
        const data =
          await getStudentDueSpacedReviews()

        if (!isMounted) return

        setReviews(
          Array.isArray(data?.reviews)
            ? data.reviews
            : [],
        )
      } catch (error) {
        if (!isMounted) return

        setErrorMessage(
          error?.message ||
            'تعذر تحميل مراجعات اليوم.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialReviews()

    return () => {
      isMounted = false
    }
  }, [])

  const activeReview =
    reviews[0] || null

  const currentIndex = activeReview
    ? 1
    : 0

  const totalReviews = reviews.length

  async function reloadReviews() {
    const data =
      await getStudentDueSpacedReviews()

    setReviews(
      Array.isArray(data?.reviews)
        ? data.reviews
        : [],
    )

    setSelectedAnswer(null)
    setResult(null)
    setErrorMessage('')
  }

  async function handleSubmit() {
    if (
      !activeReview ||
      selectedAnswer === null ||
      isSubmitting
    ) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const answerJson =
        activeReview.questionType === 'true_false'
          ? {
              value: selectedAnswer,
            }
          : {
              selectedOptionId:
                selectedAnswer,
            }

      const response =
        await submitSpacedReviewAnswer(
          activeReview.questionId,
          answerJson,
        )

      setResult(response)
    } catch (error) {
      setErrorMessage(
        error?.message ||
          'تعذر إرسال إجابة المراجعة.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleContinue() {
    try {
      setIsLoading(true)
      await reloadReviews()
    } catch (error) {
      setErrorMessage(
        error?.message ||
          'تعذر تحديث مراجعات اليوم.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function isCorrectChoice(optionId) {
    if (!result) return false

    if (
      activeReview?.questionType ===
      'true_false'
    ) {
      return (
        result?.correctAnswer
          ?.correctAnswer === optionId
      )
    }

    return (
      result?.correctAnswer
        ?.correctOptionId === optionId
    )
  }

  function isWrongSelectedChoice(optionId) {
    return (
      result &&
      selectedAnswer === optionId &&
      !isCorrectChoice(optionId)
    )
  }

  if (isLoading) {
    return (
      <main
        className="spaced-review-page"
        dir="rtl"
      >
        <div className="spaced-review-state">
          <div className="spaced-review-loader" />

          <h1>
            نحضّر مراجعاتك الذكية...
          </h1>

          <p>
            JAK يختار لك ما حان وقت
            مراجعته الآن.
          </p>
        </div>
      </main>
    )
  }

  if (!activeReview) {
    return (
      <main
        className="spaced-review-page"
        dir="rtl"
      >
        <div className="spaced-review-success">
          <div className="spaced-review-success__icon">
            ✓
          </div>

          <span className="spaced-review-eyebrow">
            SPACED REVIEW
          </span>

          <h1>
            أنهيت مراجعات اليوم
          </h1>

          <p>
            لا توجد مراجعات مستحقة الآن.
            سنعيد لك المعلومات في الوقت
            المناسب قبل أن تبدأ بالنسيان.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/student/study-plan')
            }
          >
            العودة إلى خطة الدراسة
          </button>
        </div>
      </main>
    )
  }

  const options =
    activeReview.questionType === 'mcq'
      ? activeReview.answerConfig
          ?.options || []
      : [
          {
            id: true,
            text: 'صح',
          },
          {
            id: false,
            text: 'خطأ',
          },
        ]

  return (
    <main
      className="spaced-review-page"
      dir="rtl"
    >
      <div className="spaced-review-shell">
        <header className="spaced-review-header">
          <button
            type="button"
            className="spaced-review-back"
            onClick={() =>
              navigate('/student/study-plan')
            }
          >
            ← خطة الدراسة
          </button>

          <div>
            <span className="spaced-review-eyebrow">
              JAK SMART REVIEW
            </span>

            <h1>
              مراجعات اليوم
            </h1>

            <p>
              لا نطلب منك إعادة كل شيء.
              نعيد فقط ما حان وقت تثبيته.
            </p>
          </div>

          <div className="spaced-review-progress">
            <strong>
              {currentIndex}
            </strong>

            <span>
              من {totalReviews}
            </span>
          </div>
        </header>

        <section className="spaced-review-card">
          <div className="spaced-review-meta">
            <span>
              {activeReview.unit?.title ||
                'الوحدة'}
            </span>

            <span>
              {activeReview.sectionType ||
                'مراجعة'}
            </span>

            <span>
              المرحلة {activeReview.stage + 1}
            </span>
          </div>

          <div className="spaced-review-due">
            مراجعة مستحقة الآن
          </div>

          <h2>
            {activeReview.prompt?.text ||
              'راجع السؤال التالي'}
          </h2>

          <div className="spaced-review-options">
            {options.map((option) => {
              const optionId = option.id

              const isSelected =
                selectedAnswer === optionId

              const isCorrect =
                isCorrectChoice(optionId)

              const isWrong =
                isWrongSelectedChoice(
                  optionId,
                )

              const classNames = [
                'spaced-review-option',
              ]

              if (
                isSelected &&
                !result
              ) {
                classNames.push(
                  'spaced-review-option--selected',
                )
              }

              if (isCorrect) {
                classNames.push(
                  'spaced-review-option--correct',
                )
              }

              if (isWrong) {
                classNames.push(
                  'spaced-review-option--wrong',
                )
              }

              return (
                <button
                  key={String(optionId)}
                  type="button"
                  className={
                    classNames.join(' ')
                  }
                  disabled={Boolean(result)}
                  onClick={() =>
                    setSelectedAnswer(
                      optionId,
                    )
                  }
                >
                  <span className="spaced-review-option__marker">
                    {activeReview.questionType ===
                    'mcq'
                      ? String(
                          optionId,
                        ).toUpperCase()
                      : optionId
                        ? '✓'
                        : '✕'}
                  </span>

                  <span>
                    {option.text}
                  </span>
                </button>
              )
            })}
          </div>

          {errorMessage && (
            <div className="spaced-review-error">
              {errorMessage}
            </div>
          )}

          {!result ? (
            <button
              type="button"
              className="spaced-review-submit"
              disabled={
                selectedAnswer === null ||
                isSubmitting
              }
              onClick={handleSubmit}
            >
              {isSubmitting
                ? 'جارٍ التحقق...'
                : 'تحقق من إجابتي'}
            </button>
          ) : (
            <div className="spaced-review-result">
              <div
                className={
                  result.isCorrect
                    ? 'spaced-review-result__status spaced-review-result__status--correct'
                    : 'spaced-review-result__status spaced-review-result__status--wrong'
                }
              >
                {result.isCorrect
                  ? 'أحسنت! ثبتت المعلومة.'
                  : 'تحتاج هذه المعلومة إلى تثبيت أكثر.'}
              </div>

              {result?.explanation?.text && (
                <div className="spaced-review-explanation">
                  <span>
                    لماذا؟
                  </span>

                  <p>
                    {
                      result.explanation
                        .text
                    }
                  </p>
                </div>
              )}

              <div className="spaced-review-next">
                {result.isMastered ? (
                  <>
                    <strong>
                      أتقنت هذه المعلومة 🎯
                    </strong>

                    <p>
                      اكتملت دورة المراجعة
                      لهذا السؤال.
                    </p>
                  </>
                ) : (
                  <>
                    <strong>
                      المراجعة القادمة
                    </strong>

                    <p>
                      {result.isCorrect
                        ? result.nextStage === 1
                          ? 'بعد 3 أيام'
                          : result.nextStage === 2
                            ? 'بعد 7 أيام'
                            : 'بعد 14 يومًا'
                        : 'غدًا'}
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                className="spaced-review-continue"
                onClick={handleContinue}
              >
                أكمل المراجعة
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default StudentSpacedReviewPage