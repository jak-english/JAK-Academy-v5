import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../features/auth/AuthProvider'
import { getStudentFoundationsOverview } from '../features/student/services/studentFoundationsService'

import './StudentFoundationsPage.css'

function hasActivePremiumAccess(profile) {
  if (!profile) return false

  if (profile.role === 'super_admin') {
    return true
  }

  if (profile.is_premium !== true) {
    return false
  }

  if (!profile.premium_until) {
    return true
  }

  return (
    new Date(
      profile.premium_until,
    ).getTime() > Date.now()
  )
}

function StudentFoundationsPage() {
  const {
    profile,
    isLoading: isAuthLoading,
  } = useAuth()

  const [levels, setLevels] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const hasPremiumAccess =
    hasActivePremiumAccess(profile)

  useEffect(() => {
    if (
      isAuthLoading ||
      !hasPremiumAccess
    ) {
      return
    }

    let isMounted = true

    async function loadFoundations() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getStudentFoundationsOverview()

        if (isMounted) {
          setLevels(
            Array.isArray(data)
              ? data
              : [],
          )
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              'تعذر تحميل مسار التأسيس حاليًا.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadFoundations()

    return () => {
      isMounted = false
    }
  }, [
    hasPremiumAccess,
    isAuthLoading,
  ])

  if (isAuthLoading) {
    return (
      <main
        className="student-foundations"
        dir="rtl"
      >
        <div className="student-foundations__state">
          <p>
            جارٍ التحقق من حسابك...
          </p>

          <Link
            className="student-foundations__back-link"
            to="/student"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </main>
    )
  }

  if (!hasPremiumAccess) {
    return (
      <main
        className="student-foundations"
        dir="rtl"
      >
        <div className="student-foundations__state student-foundations__state--error">
          <p>
            يتطلب مسار التأسيس اشتراك Premium.
          </p>

          <Link
            className="student-foundations__back-link"
            to="/student"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main
        className="student-foundations"
        dir="rtl"
      >
        <div className="student-foundations__state">
          <p>
            جارٍ تجهيز مسار التأسيس...
          </p>

          <Link
            className="student-foundations__back-link"
            to="/student"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main
        className="student-foundations"
        dir="rtl"
      >
        <div className="student-foundations__state student-foundations__state--error">
          <p>
            {error}
          </p>

          <Link
            className="student-foundations__back-link"
            to="/student"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="student-foundations"
      dir="rtl"
    >
      <section className="student-foundations__hero">
        <div>
          <span className="student-foundations__eyebrow">
            JAK FOUNDATIONS
          </span>

          <h1>
            ابنِ لغتك من الأساس
          </h1>

          <p>
            لا تحفظ القواعد والكلمات بشكل
            عشوائي. ابدأ من الأساس الصحيح،
            وتقدّم خطوة بخطوة حتى تصبح
            مهاراتك أقوى وأكثر ثباتًا.
          </p>
        </div>

        <Link
          className="student-foundations__back-link"
          to="/student"
        >
          العودة إلى الرئيسية
        </Link>
      </section>

      <section className="student-foundations__levels">
        {levels.length > 0 ? (
          levels.map((level) => {
            const modules =
              Array.isArray(
                level.modules,
              )
                ? level.modules
                : []

            return (
              <article
                className="student-foundations__level"
                key={level.id}
              >
                <div className="student-foundations__level-header">
                  <span className="student-foundations__level-label">
                    المستوى{' '}
                    {level.sortOrder}
                  </span>

                  <h2 dir="auto">
                    {level.title}
                  </h2>

                  {level.description && (
                    <p dir="auto">
                      {level.description}
                    </p>
                  )}
                </div>

                {modules.length > 0 ? (
                  <div className="student-foundations__modules">
                    {modules.map(
                      (module) => {
                        const lessons =
                          Array.isArray(
                            module.lessons,
                          )
                            ? module.lessons
                            : []

                        return (
                          <section
                            className="student-foundations__module"
                            key={module.id}
                          >
                            <div className="student-foundations__module-header">
                              <div>
                                <span className="student-foundations__eyebrow">
                                  الوحدة التأسيسية{' '}
                                  {
                                    module.sortOrder
                                  }
                                </span>

                                <h3
                                  dir="auto"
                                >
                                  {
                                    module.title
                                  }
                                </h3>

                                {module.description && (
                                  <p
                                    dir="auto"
                                  >
                                    {
                                      module.description
                                    }
                                  </p>
                                )}
                              </div>

                              <span className="student-foundations__lesson-count">
                                {
                                  lessons.length
                                }{' '}
                                دروس
                              </span>
                            </div>

                            {lessons.length >
                            0 ? (
                              <div className="student-foundations__lesson-grid">
                                {lessons.map(
                                  (
                                    lesson,
                                  ) => (
                                    <Link
                                      className="student-foundations__lesson-card"
                                      key={
                                        lesson.id
                                      }
                                      to={`/student/foundations/lessons/${lesson.id}`}
                                    >
                                      <span className="student-foundations__lesson-number">
                                        {
                                          lesson.sortOrder
                                        }
                                      </span>

                                      <div className="student-foundations__lesson-main">
                                        <h4
                                          dir="auto"
                                        >
                                          {
                                            lesson.title
                                          }
                                        </h4>

                                        {lesson.summary && (
                                          <p
                                            dir="auto"
                                          >
                                            {
                                              lesson.summary
                                            }
                                          </p>
                                        )}

                                        <div className="student-foundations__lesson-meta">
                                          <span>
                                            الدرس{' '}
                                            {
                                              lesson.sortOrder
                                            }
                                          </span>

                                          <span>
                                            ابدأ التعلّم ←
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="student-foundations__empty-module">
                                لا توجد دروس
                                منشورة في هذه
                                الوحدة بعد.
                              </p>
                            )}
                          </section>
                        )
                      },
                    )}
                  </div>
                ) : (
                  <p className="student-foundations__empty-module">
                    لا توجد وحدات منشورة
                    في هذا المستوى بعد.
                  </p>
                )}
              </article>
            )
          })
        ) : (
          <div className="student-foundations__state">
            <p>
              لا يوجد محتوى تأسيسي منشور
              حاليًا.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default StudentFoundationsPage