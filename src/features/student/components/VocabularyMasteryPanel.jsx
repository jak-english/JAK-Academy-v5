import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getStudentVocabularySession,
  getStudentVocabularyLessonSummary,
  submitStudentVocabularyAnswer,
} from '../services/studentLessonService'

const SAFE_QUESTION_TYPES = new Set([
  'meaning_en_ar',
  'meaning_ar_en',
  'definition',
  'word_family',
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

function getQuestionLabel(
  questionType,
  wordFamilyDirection,
) {
  if (questionType === 'meaning_ar_en') {
    return 'اكتب الكلمة بالإنجليزية'
  }

  if (questionType === 'definition') {
    return 'اكتب الكلمة الإنجليزية المناسبة للتعريف'
  }

  if (questionType === 'word_family') {
    return wordFamilyDirection ===
      'noun_to_adjective'
      ? 'اكتب الصفة المناسبة'
      : 'اكتب صيغة الاسم المناسبة'
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

function getVocabularyStrengthInsight(result) {
  if (!result?.dimensions) {
    return null
  }

  const dimensions = result.dimensions

  const dimensionMap = {
    meaning: {
      label: 'فهم المعنى',
      advice:
        'راجع معنى الكلمة وحاول استرجاعه من الذاكرة قبل النظر إلى الإجابة.',
    },
    form: {
      label: 'استرجاع الكلمة',
      advice:
        'ركّز على إنتاج الكلمة الإنجليزية من المعنى بدون مساعدة.',
    },
    connections: {
      label: 'الربط بين الصيغ',
      advice:
        'تدرّب على الربط بين الصفة والاسم في الاتجاهين.',
    },
    retention: {
      label: 'التثبيت طويل المدى',
      advice:
        'هذه الكلمة تحتاج مراجعة متباعدة في موعدها حتى تثبت في الذاكرة.',
    },
  }

  const applicableKeys =
    result.mastery_model === 'word_family'
      ? ['connections', 'retention']
      : result.mastery_model === 'definition'
        ? ['meaning', 'retention']
        : ['meaning', 'form', 'retention']

  const scores = applicableKeys
    .map((key) => ({
      label: dimensionMap[key].label,
      advice: dimensionMap[key].advice,
      score: Number(dimensions[key]) || 0,
    }))
    .sort((a, b) => b.score - a.score)

  const strongest = scores[0]
  const weakest = scores[scores.length - 1]

  return {
    strengthText:
      strongest.score >= 40
        ? `${strongest.label} — ${strongest.score}%`
        : 'نقطة قوتك ما زالت قيد البناء',
    weaknessText:
      `${weakest.label} — ${weakest.score}%`,
    advice: weakest.advice,
  }
}
function VocabularyMasteryPanel({
  lessonId,
  onProgressChange,
}) {
  const [session, setSession] = useState(null)
  const [summary, setSummary] = useState(null)

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

        const [
          data,
          summaryData,
        ] = await Promise.all([
          getStudentVocabularySession(
            lessonId,
            50,
          ),
          getStudentVocabularyLessonSummary(
            lessonId,
          ),
        ])

        setSession(data)
        setSummary(summaryData)
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

        const [
          data,
          summaryData,
        ] = await Promise.all([
          getStudentVocabularySession(
            lessonId,
            50,
          ),
          getStudentVocabularyLessonSummary(
            lessonId,
          ),
        ])

        if (isMounted) {
          setSession(data)
          setSummary(summaryData)
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

  const wordFamilyDirection =
    currentItem?.word_family_direction ?? null

  const displayedPrompt =
    questionType === 'meaning_ar_en'
      ? currentItem?.meaning_ar
      : questionType === 'definition'
        ? currentItem?.definition_en
        : questionType === 'word_family' &&
            wordFamilyDirection ===
              'noun_to_adjective'
          ? currentItem?.extra_json
              ?.noun_form
          : currentItem?.term

  const inputDirection =
    questionType === 'meaning_en_ar'
      ? 'rtl'
      : 'ltr'

  const resultInsight =
    getVocabularyStrengthInsight(result)
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
          answerJson:
            questionType === 'word_family'
              ? {
                  direction:
                    wordFamilyDirection,
                }
              : {},
          responseTimeMs: null,
          confidence: null,
        })

      setAnsweredItem(currentItem)
      setResult(data)

      if (
        data?.lesson_progress &&
        typeof data.lesson_progress === 'object'
      ) {
        setSummary(data.lesson_progress)

        if (
          typeof onProgressChange === 'function'
        ) {
          onProgressChange(
            data.lesson_progress,
          )
        }
      }

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
      {summary && (
        <section
          style={{
            marginBottom: '30px',
            padding: '20px',
            borderRadius: '24px',
            border:
              '1px solid rgba(94, 234, 212, 0.32)',
            background:
              'linear-gradient(135deg, rgba(15, 118, 110, 0.16), rgba(30, 64, 175, 0.10))',
            boxShadow:
              '0 14px 42px rgba(0, 0, 0, 0.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '18px',
              flexWrap: 'wrap',
              marginBottom: '18px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'rgba(94, 234, 212, 0.88)',
                  marginBottom: '5px',
                }}
              >
                VOCABULARY PROGRESS
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                }}
              >
                تقدمك في مفردات الدرس
              </div>
            </div>

            <div
              style={{
                minWidth: '150px',
                padding: '12px 18px',
                borderRadius: '18px',
                border:
                  '1px solid rgba(250, 204, 21, 0.38)',
                background:
                  'rgba(250, 204, 21, 0.10)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  opacity: 0.78,
                  marginBottom: '3px',
                }}
              >
                مستوى التقدم
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: '30px',
                  lineHeight: 1,
                  color: '#fde68a',
                }}
              >
                {summary.learning_progress ?? 0}%
              </strong>
            </div>
          </div>

          <div
            style={{
              height: '9px',
              borderRadius: '999px',
              background:
                'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                width: `${
                  summary.learning_progress ?? 0
                }%`,
                height: '100%',
                borderRadius: '999px',
                background:
                  'linear-gradient(90deg, #2dd4bf, #fde68a)',
                transition: 'width 0.35s ease',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(92px, 1fr))',
              gap: '10px',
            }}
          >
            {[
              {
                label: 'إجمالي العناصر',
                value: summary.total_items ?? 0,
              },
              {
                label: 'بدأت',
                value: summary.started_items ?? 0,
              },
              {
                label: 'متقنة',
                value: summary.mastered_items ?? 0,
              },
              {
                label: 'للمراجعة',
                value: summary.due_items ?? 0,
              },
              {
                label: 'Mastery',
                value:
                  `${summary.average_mastery ?? 0}%`,
              },
              {
                label: 'Coverage',
                value:
                  `${summary.coverage_percent ?? 0}%`,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: '12px 10px',
                  borderRadius: '16px',
                  border:
                    '1px solid rgba(255, 255, 255, 0.08)',
                  background:
                    'rgba(4, 15, 26, 0.34)',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    opacity: 0.68,
                    marginBottom: '6px',
                  }}
                >
                  {stat.label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    fontSize: '21px',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </strong>
              </div>
            ))}
          </div>
        </section>
      )}
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
                wordFamilyDirection,
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
                  questionType === 'meaning_en_ar'
                    ? 'اكتب المعنى بالعربية'
                    : questionType === 'definition'
                      ? 'اكتب الكلمة بالإنجليزية'
                      : questionType === 'word_family'
                        ? wordFamilyDirection ===
                          'noun_to_adjective'
                          ? 'اكتب الصفة بالإنجليزية'
                          : 'اكتب الاسم بالإنجليزية'
                        : 'اكتب الكلمة بالإنجليزية'
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
              opacity: 0.88,
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

          {resultInsight && (
            <div
              dir="rtl"
              style={{
                textAlign: 'right',
                padding: '16px',
                borderRadius: '16px',
                background:
                  'rgba(255,255,255,0.06)',
                marginBottom: '22px',
              }}
            >
              <div
                style={{
                  marginBottom: '10px',
                }}
              >
                <strong>نقطة قوتك الآن</strong>
                <p style={{ margin: '4px 0 0' }}>
                  {resultInsight.strengthText}
                </p>
              </div>

              <div
                style={{
                  marginBottom: '10px',
                }}
              >
                <strong>تحتاج تقوية</strong>
                <p style={{ margin: '4px 0 0' }}>
                  {resultInsight.weaknessText}
                </p>
              </div>

              <div>
                <strong>نصيحة JAK</strong>
                <p style={{ margin: '4px 0 0' }}>
                  {resultInsight.advice}
                </p>
              </div>
            </div>
          )}
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