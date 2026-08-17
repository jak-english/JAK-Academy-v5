import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getStudentVocabularySession,
  submitStudentVocabularyAnswer,
} from '../services/studentLessonService'

const SAFE_QUESTION_TYPES = new Set([
  'meaning_en_ar',
  'meaning_ar_en',
])

function getSafeQuestionType(item) {
  const suggestedType =
    item?.suggested_question_type

  if (
    SAFE_QUESTION_TYPES.has(
      suggestedType,
    )
  ) {
    return suggestedType
  }

  const meaningScore =
    Number(item?.dimensions?.meaning) || 0

  const formScore =
    Number(item?.dimensions?.form) || 0

  return formScore < meaningScore
    ? 'meaning_ar_en'
    : 'meaning_en_ar'
}

function getQuestionLabel(questionType) {
  if (questionType === 'meaning_ar_en') {
    return 'اكتب الكلمة بالإنجليزية'
  }

  return 'اكتب المعنى بالعربية'
}

function getPhaseLabel(phase) {
  const labels = {
    encoding: 'بداية التعلّم',
    learning: 'قيد التعلّم',
    reviewing: 'مرحلة المراجعة',
    strong: 'مستوى قوي',
    maintenance: 'مرحلة التثبيت',
    at_risk: 'تحتاج مراجعة',
  }

  return labels[phase] || phase || 'قيد التعلّم'
}

function VocabularyMasteryPanel({
  lessonId,
}) {
  const [session, setSession] = useState(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [answeredItem, setAnsweredItem] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  const loadSession = useCallback(
    async () => {
      if (!lessonId) {
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getStudentVocabularySession(
            lessonId,
            10,
          )

        setSession(data)
        setCurrentIndex(0)
      } catch (error) {
        setErrorMessage(
          error.message ||
            'تعذر تحميل جلسة المفردات.',
        )
      } finally {
        setIsLoading(false)
      }
    },
    [lessonId],
  )

  useEffect(() => {
    let isMounted = true

    async function loadInitialSession() {
      if (!lessonId) {
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getStudentVocabularySession(
            lessonId,
            10,
          )

        if (isMounted) {
          setSession(data)
        setCurrentIndex(0)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل جلسة المفردات.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialSession()

    return () => {
      isMounted = false
    }
  }, [lessonId])


  const sessionItems =
    session?.items ?? []

  const currentItem =
    sessionItems[currentIndex] ?? null

  const questionType = useMemo(
    () => getSafeQuestionType(currentItem),
    [currentItem],
  )

  const displayedPrompt =
    questionType === 'meaning_ar_en'
      ? currentItem?.meaning_ar
      : currentItem?.term

  const inputDirection =
    questionType === 'meaning_ar_en'
      ? 'ltr'
      : 'rtl'

  async function handleSubmit(event) {
    event.preventDefault()

    const cleanAnswer = answer.trim()

    if (
      !currentItem ||
      !cleanAnswer ||
      isSubmitting
    ) {
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')

      const data =
        await submitStudentVocabularyAnswer({
          vocabularyItemId:
            currentItem.id,
          questionType,
          answer: cleanAnswer,
          responseTimeMs: null,
          confidence: null,
        })

      setAnsweredItem(currentItem)
      setResult(data)
      setAnswer('')
    } catch (error) {
      setErrorMessage(
        error.message ||
          'تعذر إرسال الإجابة.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleNext() {
    setResult(null)
    setAnsweredItem(null)
    setAnswer('')

    const nextIndex =
      currentIndex + 1

    if (nextIndex < sessionItems.length) {
      setCurrentIndex(nextIndex)
      return
    }

    await loadSession()
  }

  if (isLoading && !session) {
    return (
      <section
        style={{
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <p>
          جارٍ تجهيز جلسة المفردات...
        </p>
      </section>
    )
  }

  if (errorMessage && !currentItem) {
    return (
      <section
        style={{
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <p role="alert">
          {errorMessage}
        </p>
      </section>
    )
  }

  if (!currentItem) {
    return (
      <section
        style={{
          padding: '32px',
          textAlign: 'center',
        }}
      >
        <h2>Vocabulary Mastery</h2>
        <p>
          لا توجد مفردات متاحة حاليًا.
        </p>
      </section>
    )
  }

  return (
    <section
      style={{
        maxWidth: '760px',
        margin: '0 auto',
        padding: '34px',
        direction: 'rtl',
      }}
    >
      <header
        style={{
          marginBottom: '28px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            marginBottom: '8px',
            opacity: 0.7,
            fontWeight: 700,
          }}
        >
          Vocabulary Mastery
        </p>

        <p
          style={{
            margin: 0,
            fontSize: '14px',
            opacity: 0.7,
          }}
        >
          {getQuestionLabel(
            questionType,
          )}
        </p>
      </header>

      {!result ? (
        <>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                fontSize: '46px',
                lineHeight: 1.2,
                fontWeight: 900,
                direction:
                  questionType ===
                  'meaning_ar_en'
                    ? 'rtl'
                    : 'ltr',
              }}
            >
              {displayedPrompt}
            </div>

            <p
              style={{
                marginTop: '14px',
                opacity: 0.65,
              }}
            >
              فكّر أولًا، ثم اكتب
              إجابتك من الذاكرة.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gap: '14px',
            }}
          >
            <label
              htmlFor="vocabulary-answer"
              style={{
                fontWeight: 800,
              }}
            >
              إجابتك
            </label>

            <input
              id="vocabulary-answer"
              type="text"
              value={answer}
              dir={inputDirection}
              onChange={(event) =>
                setAnswer(
                  event.target.value,
                )
              }
              autoComplete="off"
              autoFocus
              placeholder={
                questionType ===
                'meaning_ar_en'
                  ? 'اكتب الكلمة بالإنجليزية'
                  : 'اكتب المعنى بالعربية'
              }
              style={{
                width: '100%',
                minHeight: '54px',
                padding: '0 16px',
                borderRadius: '12px',
                border:
                  '1px solid rgba(255,255,255,0.16)',
                background:
                  'rgba(255,255,255,0.04)',
                color: 'inherit',
                fontSize: '18px',
                boxSizing: 'border-box',
              }}
            />

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !answer.trim()
              }
              style={{
                minHeight: '52px',
                border: 0,
                borderRadius: '12px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {isSubmitting
                ? 'جارٍ التحقق...'
                : 'تحقق من الإجابة'}
            </button>
          </form>
        </>
      ) : (
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '52px',
              marginBottom: '12px',
            }}
          >
            {result.correct
              ? '✓'
              : '×'}
          </div>

          <h2
            style={{
              marginBottom: '8px',
            }}
          >
            {result.correct
              ? 'إجابة صحيحة'
              : 'إجابة غير صحيحة'}
          </h2>

          <p
            style={{
              marginBottom: '28px',
              opacity: 0.75,
            }}
          >
            {answeredItem?.term}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, minmax(0, 1fr))',
              gap: '10px',
              marginBottom: '26px',
            }}
          >
            <div>
              <small>Mastery</small>
              <strong
                style={{
                  display: 'block',
                  marginTop: '4px',
                }}
              >
                {result.mastery_score}%
              </strong>
            </div>

            <div>
              <small>المرحلة</small>
              <strong
                style={{
                  display: 'block',
                  marginTop: '4px',
                }}
              >
                {getPhaseLabel(
                  result.phase,
                )}
              </strong>
            </div>

            <div>
              <small>السلسلة</small>
              <strong
                style={{
                  display: 'block',
                  marginTop: '4px',
                }}
              >
                {result.streak}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            style={{
              width: '100%',
              minHeight: '52px',
              border: 0,
              borderRadius: '12px',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            {isLoading
              ? 'جارٍ تجهيز التالي...'
              : 'الكلمة التالية'}
          </button>
        </div>
      )}

      {errorMessage && (
        <p
          role="alert"
          style={{
            marginTop: '18px',
            textAlign: 'center',
          }}
        >
          {errorMessage}
        </p>
      )}

      <footer
        style={{
          marginTop: '28px',
          paddingTop: '18px',
          borderTop:
            '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent:
            'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          fontSize: '13px',
          opacity: 0.65,
        }}
      >
        <span>
          الكلمة:{' '}
          {Math.min(
            currentIndex + 1,
            sessionItems.length,
          )}
          {' / '}
          {sessionItems.length}
        </span>

        <span>
          Mastery الحالي:{' '}
          {currentItem.mastery_score ?? 0}%
        </span>
      </footer>
    </section>
  )
}

export default VocabularyMasteryPanel