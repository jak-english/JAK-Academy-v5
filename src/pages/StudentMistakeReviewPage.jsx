import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getStudentUnresolvedMistakes,
  submitMistakeRetryAnswer,
} from '../features/student/services/studentStudyPlanService'

import './StudentMistakeReviewPage.css'

function StudentMistakeReviewPage() {
  const navigate = useNavigate()

  const [mistakes, setMistakes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const [selectedAnswer, setSelectedAnswer] =
    useState(null)

  const [result, setResult] = useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  async function loadMistakes() {
    try {
      setIsLoading(true)
      setErrorMessage('')

      const data =
        await getStudentUnresolvedMistakes()

      setMistakes(
        Array.isArray(data?.mistakes)
          ? data.mistakes
          : [],
      )

      setCurrentIndex(0)
      setSelectedAnswer(null)
      setResult(null)
    } catch (error) {
      setErrorMessage(
        error?.message ||
          'تعذر تحميل الأخطاء الآن.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true


    async function loadInitialMistakes() {
      try {
        const data =
          await getStudentUnresolvedMistakes()

        if (!isMounted) {
          return
        }

        setMistakes(
          Array.isArray(data?.mistakes)
            ? data.mistakes
            : [],
        )
      } catch (error) {
        if (!isMounted) {
          return
        }

        setErrorMessage(
          error?.message ||
            'تعذر تحميل الأخطاء الآن.',
        )
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialMistakes()

    return () => {
      isMounted = false
    }
  }, [])

  const currentMistake =
    mistakes[currentIndex] || null

  const totalMistakes =
    mistakes.length

  const completedCount =
    Math.min(
      currentIndex,
      totalMistakes,
    )

  const progressPercent =
    totalMistakes > 0
      ? Math.round(
          (completedCount / totalMistakes) * 100,
        )
      : 100

  async function handleSubmit() {
    if (
      !currentMistake ||
      selectedAnswer === null ||
      isSubmitting
    ) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      let answerJson

      if (
        currentMistake.questionType === 'mcq'
      ) {
        answerJson = {
          selectedOptionId:
            selectedAnswer,
        }
      } else if (
        currentMistake.questionType ===
        'true_false'
      ) {
        answerJson = {
          value: selectedAnswer,
        }
      } else {
        throw new Error(
          'هذا النوع من الأسئلة غير مدعوم في المراجعة حاليًا.',
        )
      }

      const retryResult =
        await submitMistakeRetryAnswer(
          currentMistake.questionId,
          answerJson,
        )

      setResult(retryResult)
    } catch (error) {
      setErrorMessage(
        error?.message ||
          'تعذر تصحيح الإجابة.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleNext() {
    if (!result) {
      return
    }

    if (result.isCorrect) {
      const refreshed =
        await getStudentUnresolvedMistakes()

      const remaining =
        Array.isArray(refreshed?.mistakes)
          ? refreshed.mistakes
          : []

      setMistakes(remaining)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setResult(null)

      return
    }

    setSelectedAnswer(null)
    setResult(null)
  }

  function getCorrectOptionText() {
    if (
      !result ||
      !currentMistake ||
      currentMistake.questionType !== 'mcq'
    ) {
      return null
    }

    const correctOptionId =
      result?.correctAnswer?.correctOptionId

    const option =
      currentMistake.answerConfig?.options?.find(
        (item) =>
          item.id === correctOptionId,
      )

    return option?.text || null
  }

  if (isLoading) {
    return (
      <main
        className="mistake-review-page"
        dir="rtl"
      >
        <div className="mistake-review-state">
          <div className="mistake-review-loader" />

          <h1>نجهّز مراجعتك الذكية...</h1>

          <p>
            JAK يحلل أخطاءك ويجهز أهم سؤال
            تحتاج مراجعته الآن.
          </p>
        </div>
      </main>
    )
  }

  if (errorMessage && !currentMistake) {
    return (
      <main
        className="mistake-review-page"
        dir="rtl"
      >
        <div className="mistake-review-state">
          <span className="mistake-review-state-icon">
            !
          </span>

          <h1>تعذر تحميل المراجعة</h1>

          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={loadMistakes}
          >
            حاول مرة أخرى
          </button>

          <button
            type="button"
            className="secondary"
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

  if (!currentMistake) {
    return (
      <main
        className="mistake-review-page"
        dir="rtl"
      >
        <div className="mistake-review-success">
          <div className="mistake-review-success-mark">
            ✓
          </div>

          <span className="mistake-review-eyebrow">
            JAK Smart Review
          </span>

          <h1>ممتاز! قائمة أخطائك نظيفة</h1>

          <p>
            لا يوجد حاليًا أي خطأ غير محلول
            يحتاج إلى مراجعة.
          </p>

          <div className="mistake-review-success-note">
            عندما يظهر خطأ جديد في أحد
            امتحاناتك، سيضعه JAK هنا تلقائيًا
            حتى تتأكد من فهمه.
          </div>

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
    currentMistake?.answerConfig?.options || []

  const correctOptionText =
    getCorrectOptionText()

  return (
    <main
      className="mistake-review-page"
      dir="rtl"
    >
      <header className="mistake-review-header">
        <button
          type="button"
          className="mistake-review-back"
          onClick={() =>
            navigate('/student/study-plan')
          }
        >
          ← خطة الدراسة
        </button>

        <div>
          <span className="mistake-review-eyebrow">
            JAK Fix Your Mistakes
          </span>

          <h1>حوّل الخطأ إلى نقطة قوة</h1>

          <p>
            لا تحفظ الإجابة. افهم لماذا أخطأت،
            ثم جرّب من جديد.
          </p>
        </div>
      </header>

      <section className="mistake-review-progress">
        <div className="mistake-review-progress-top">
          <span>
            المراجعة الذكية
          </span>

          <strong>
            {totalMistakes} خطأ متبقٍ
          </strong>
        </div>

        <div className="mistake-review-progress-track">
          <span
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </section>

      <section className="mistake-review-card">
        <div className="mistake-review-meta">
          <span>
            {currentMistake.unit?.title ||
              'الوحدة'}
          </span>

          <span>
            {currentMistake.section?.title ||
              currentMistake.section
                ?.sectionType ||
              'مراجعة'}
          </span>

          <span>
            {currentMistake.difficulty ||
              'مستوى عادي'}
          </span>
        </div>

        <div className="mistake-review-question-number">
          السؤال الذي يحتاج انتباهك
        </div>

        <h2>
          {currentMistake.prompt?.text ||
            'السؤال غير متوفر.'}
        </h2>

        {currentMistake.questionType ===
          'mcq' && (
          <div className="mistake-review-options">
            {options.map((option) => {
              const isSelected =
                selectedAnswer === option.id

              const isCorrectOption =
                result?.isCorrect !==
                  undefined &&
                result?.correctAnswer
                  ?.correctOptionId ===
                  option.id

              const isWrongSelected =
                result &&
                !result.isCorrect &&
                isSelected

              let className =
                'mistake-review-option'

              if (isSelected) {
                className += ' selected'
              }

              if (isCorrectOption && result) {
                className += ' correct'
              }

              if (isWrongSelected) {
                className += ' wrong'
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  className={className}
                  disabled={Boolean(result)}
                  onClick={() =>
                    setSelectedAnswer(
                      option.id,
                    )
                  }
                >
                  <span className="mistake-review-option-id">
                    {String(
                      option.id,
                    ).toUpperCase()}
                  </span>

                  <span>
                    {option.text}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {currentMistake.questionType ===
          'true_false' && (
          <div className="mistake-review-options">
            <button
              type="button"
              className={`mistake-review-option ${
                selectedAnswer === true
                  ? 'selected'
                  : ''
              }`}
              disabled={Boolean(result)}
              onClick={() =>
                setSelectedAnswer(true)
              }
            >
              <span className="mistake-review-option-id">
                ✓
              </span>

              <span>صح</span>
            </button>

            <button
              type="button"
              className={`mistake-review-option ${
                selectedAnswer === false
                  ? 'selected'
                  : ''
              }`}
              disabled={Boolean(result)}
              onClick={() =>
                setSelectedAnswer(false)
              }
            >
              <span className="mistake-review-option-id">
                ✕
              </span>

              <span>خطأ</span>
            </button>
          </div>
        )}

        {!result && (
          <button
            type="button"
            className="mistake-review-submit"
            disabled={
              selectedAnswer === null ||
              isSubmitting
            }
            onClick={handleSubmit}
          >
            {isSubmitting
              ? 'جاري التصحيح...'
              : 'تحقق من إجابتي'}
          </button>
        )}

        {result && (
          <div
            className={`mistake-review-feedback ${
              result.isCorrect
                ? 'success'
                : 'error'
            }`}
          >
            <div className="mistake-review-feedback-title">
              {result.isCorrect
                ? 'أحسنت! صححت الخطأ.'
                : 'ليست صحيحة بعد.'}
            </div>

            {!result.isCorrect &&
              correctOptionText && (
                <p>
                  الإجابة الصحيحة:
                  {' '}
                  <strong>
                    {correctOptionText}
                  </strong>
                </p>
              )}

            {result.explanation?.text && (
              <div className="mistake-review-explanation">
                <span>لماذا؟</span>

                <p>
                  {result.explanation.text}
                </p>
              </div>
            )}

            <button
              type="button"
              className="mistake-review-next"
              onClick={handleNext}
            >
              {result.isCorrect
                ? 'أكمل المراجعة'
                : 'حاول مرة أخرى'}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mistake-review-error">
            {errorMessage}
          </div>
        )}
      </section>
    </main>
  )
}

export default StudentMistakeReviewPage