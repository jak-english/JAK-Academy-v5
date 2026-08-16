import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getStudentExamHistory,
} from '../features/student/services/studentExamService'

import './StudentResultsPage.css'

function formatDate(value) {
  if (!value) {
    return 'لم يتم التسليم'
  }

  return new Date(value).toLocaleString(
    'ar-JO',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    },
  )
}

function getStatusLabel(status) {
  const labels = {
    in_progress: 'قيد الحل',
    submitted: 'تم التسليم',
    graded: 'تم التصحيح',
    completed: 'مكتمل',
  }

  return labels[status] || status || 'غير معروف'
}

function getScoreTone(score) {
  if (score >= 85) {
    return 'excellent'
  }

  if (score >= 70) {
    return 'good'
  }

  if (score >= 50) {
    return 'average'
  }

  return 'needs-work'
}

function StudentResultsPage() {
  const navigate = useNavigate()

  const [
    results,
    setResults,
  ] = useState([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    let active = true

    async function loadResults() {
      try {
        const data =
          await getStudentExamHistory()

        if (active) {
          setResults(data)
        }
      } catch (err) {
        if (active) {
          setError(
            err.message ||
              'تعذر تحميل نتائجك.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      active = false
    }
  }, [])

  const submittedResults =
    results.filter(
      (item) => item.submittedAt,
    )

  const averageScore =
    submittedResults.length
      ? Math.round(
          submittedResults.reduce(
            (sum, item) =>
              sum +
              Number(
                item.scorePercent ||
                  0,
              ),
            0,
          ) /
            submittedResults.length,
        )
      : 0

  const bestScore =
    submittedResults.length
      ? Math.max(
          ...submittedResults.map(
            (item) =>
              Number(
                item.scorePercent ||
                  0,
              ),
          ),
        )
      : 0

  return (
    <div
      className="student-results-page"
      dir="rtl"
    >
      <header className="student-results-nav">
        <div className="student-results-nav__inner">
          <div className="student-results-nav__brand">
            <strong>JAK Academy</strong>
            <span>Performance Center</span>
          </div>

          <nav>
            <button
              type="button"
              onClick={() =>
                navigate('/student')
              }
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student?section=units',
                )
              }
            >
              الوحدات
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/study-plan',
                )
              }
            >
              خطتي الدراسية
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/achievements',
                )
              }
            >
              الإنجازات
            </button>

            <button
              type="button"
              className="active"
            >
              النتائج
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/profile',
                )
              }
            >
              الملف الشخصي
            </button>
          </nav>
        </div>
      </header>

      <main className="student-results-shell">
        <section className="student-results-hero">
          <div className="student-results-hero__copy">
            <span className="student-results-eyebrow">
              JAK PERFORMANCE CENTER
            </span>

            <h1>
              نتائجك تحكي قصة تقدمك
            </h1>

            <p>
              راقب أداءك في الاختبارات،
              واكتشف كيف يتحسن مستواك مع
              كل محاولة.
            </p>
          </div>

          {!loading && !error && (
            <div className="student-results-hero__score">
              <span>
                متوسط أدائك
              </span>

              <strong dir="ltr">
                {averageScore}%
              </strong>

              <small>
                من{' '}
                {
                  submittedResults.length
                }{' '}
                اختبار مكتمل
              </small>
            </div>
          )}
        </section>

        {!loading && !error && (
          <section className="student-results-stats">
            <article>
              <span>
                إجمالي المحاولات
              </span>

              <strong>
                {results.length}
              </strong>

              <small>
                كل محاولاتك
              </small>
            </article>

            <article>
              <span>
                اختبارات مكتملة
              </span>

              <strong>
                {
                  submittedResults.length
                }
              </strong>

              <small>
                تم تسليمها
              </small>
            </article>

            <article>
              <span>
                متوسط العلامة
              </span>

              <strong dir="ltr">
                {averageScore}%
              </strong>

              <small>
                متوسط أدائك
              </small>
            </article>

            <article>
              <span>
                أفضل نتيجة
              </span>

              <strong dir="ltr">
                {bestScore}%
              </strong>

              <small>
                أعلى إنجاز
              </small>
            </article>
          </section>
        )}

        {loading && (
          <div className="student-results-state">
            <div className="student-results-loader" />

            <strong>
              جارٍ تحميل نتائجك
            </strong>

            <span>
              نجهّز سجل أدائك الدراسي...
            </span>
          </div>
        )}

        {error && (
          <div className="student-results-state student-results-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          results.length === 0 && (
            <div className="student-results-state">
              <strong>
                لا توجد محاولات بعد
              </strong>

              <span>
                عندما تنهي أول اختبار،
                ستظهر نتيجتك هنا.
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          results.length > 0 && (
            <section className="student-results-list">
              <div className="student-results-section-heading">
                <div>
                  <span>
                    سجل الاختبارات
                  </span>

                  <h2>
                    أداؤك الأخير
                  </h2>
                </div>

                <strong>
                  {results.length}{' '}
                  محاولة
                </strong>
              </div>

              {results.map(
                (item, index) => {
                  const score =
                    Number(
                      item.scorePercent ||
                        0,
                    )

                  const tone =
                    getScoreTone(score)

                  const progress =
                    Math.max(
                      0,
                      Math.min(
                        score,
                        100,
                      ),
                    )

                  return (
                    <article
                      className={[
                        'student-result-card',
                        `student-result-card--${tone}`,
                      ].join(' ')}
                      key={
                        item.attemptId
                      }
                    >
                      <div className="student-result-card__index">
                        {String(
                          index + 1,
                        ).padStart(
                          2,
                          '0',
                        )}
                      </div>

                      <div className="student-result-card__body">
                        <div className="student-result-card__top">
                          <div className="student-result-card__heading">
                            <span className="student-result-card__status">
                              {getStatusLabel(
                                item.status,
                              )}
                            </span>

                            <h2 dir="auto">
                              {
                                item.examTitle
                              }
                            </h2>

                            {item.examDescription && (
                              <p dir="auto">
                                {
                                  item.examDescription
                                }
                              </p>
                            )}
                          </div>

                          <div className="student-result-score">
                            <strong dir="ltr">
                              {score}%
                            </strong>

                            <span>
                              النتيجة
                            </span>
                          </div>
                        </div>

                        <div className="student-result-progress">
                          <div
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="student-result-details">
                          <div>
                            <span>
                              العلامة
                            </span>

                            <strong dir="ltr">
                              {
                                item.earnedPoints
                              }
                              {' / '}
                              {
                                item.totalPoints
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              الإجابات الصحيحة
                            </span>

                            <strong dir="ltr">
                              {
                                item.correctCount
                              }
                              {' / '}
                              {
                                item.questionCount
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              تمت الإجابة
                            </span>

                            <strong dir="ltr">
                              {
                                item.answeredCount
                              }
                              {' / '}
                              {
                                item.questionCount
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              تاريخ التسليم
                            </span>

                            <strong>
                              {formatDate(
                                item.submittedAt,
                              )}
                            </strong>
                          </div>
                        </div>

                        <div className="student-result-card__footer">
                          <span>
                            راجع إجاباتك
                            والشرح بعد
                            الاختبار
                          </span>

                          <button
                            type="button"
                            className="student-result-review"
                            onClick={() =>
                              navigate(
                                `/student/exam-attempts/${item.attemptId}`,
                              )
                            }
                          >
                            مراجعة المحاولة
                            <span>
                              ←
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                },
              )}
            </section>
          )}
      </main>
    </div>
  )
}

export default StudentResultsPage