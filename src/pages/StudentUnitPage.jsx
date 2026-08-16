import { useEffect, useMemo, useState } from 'react'
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'

import logo from '../assets/logo.png'
import {
  getStudentUnit,
} from '../features/student/services/studentUnitService'

import './StudentUnitPage.css'

const sectionIcons = {
  vocabulary: 'Aa',
  grammar: 'G',
  reading: 'R',
  writing: 'W',
  notes: 'N',
}

const sectionLabels = {
  vocabulary: 'المعاني',
  grammar: 'القواعد',
  reading: 'القراءة',
  writing: 'الكتابة',
  notes: 'الملاحظات',
}

function getSectionLabel(sectionType, fallback = '') {
  return sectionLabels[sectionType] || fallback
}

function formatStudyTime(totalSeconds = 0) {
  const safeSeconds = Math.max(
    0,
    Number(totalSeconds) || 0,
  )

  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor(
    (safeSeconds % 3600) / 60,
  )

  if (hours === 0) {
    return `${minutes} دقيقة`
  }

  if (minutes === 0) {
    return `${hours} ساعة`
  }

  return `${hours} ساعة و${minutes} دقيقة`
}

function getLessonStatusLabel(status) {
  const labels = {
    not_started: 'لم يبدأ',
    in_progress: 'قيد الدراسة',
    completed: 'مكتمل',
  }

  return labels[status] || 'لم يبدأ'
}

function StudentUnitPage() {
  const navigate = useNavigate()
  const { unitSlug } = useParams()
const [searchParams] = useSearchParams()

  const [unitData, setUnitData] =
    useState(null)

  const [selectedSectionId, setSelectedSectionId] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadUnit() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const data =
          await getStudentUnit(unitSlug)

        if (!isMounted) {
          return
        }

        setUnitData(data)

        const sections =
          data?.unit?.sections || []

        const requestedSectionId =
          searchParams.get('section')

        const requestedSection =
          sections.find(
            (section) =>
              section.id === requestedSectionId,
          )

        const initialSection =
          requestedSection || sections[0]

        setSelectedSectionId(
          initialSection?.id ?? null,
        )
      } catch (error) {
        console.error(
          'Student unit loading error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل الوحدة.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadUnit()

    return () => {
      isMounted = false
    }
  }, [unitSlug, searchParams])

  const unit = unitData?.unit ?? null

  const selectedSection = useMemo(() => {
    if (!unit?.sections?.length) {
      return null
    }

    return (
      unit.sections.find(
        (section) =>
          section.id === selectedSectionId,
      ) || unit.sections[0]
    )
  }, [unit, selectedSectionId])

  function openLesson(lesson) {
    navigate(
      `/student/lessons/${lesson.slug}`,
    )
  }

  if (isLoading) {
    return (
      <main className="student-unit-state">
        <div className="student-unit-state__loader" />

        <h1>جارٍ تجهيز الوحدة</h1>

        <p>
          نجهّز الدروس وتقدمك الدراسي...
        </p>
      </main>
    )
  }

  if (errorMessage || !unit) {
    return (
      <main className="student-unit-state">
        <div className="student-unit-state__error">
          !
        </div>

        <h1>الوحدة غير متاحة</h1>

        <p role="alert">
          {errorMessage ||
            'لم يتم العثور على الوحدة المطلوبة.'}
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

  return (
    <main
      className="student-unit-page"
      dir="rtl"
    >
      <div
        className="student-unit-page__background"
        aria-hidden="true"
      >
        <span className="student-unit-page__glow student-unit-page__glow--blue" />
        <span className="student-unit-page__glow student-unit-page__glow--gold" />
        <span className="student-unit-page__grid" />
      </div>

      <header className="student-unit-navbar">
        <div className="student-unit-navbar__inner">
          <button
            className="student-unit-navbar__brand"
            type="button"
            onClick={() =>
              navigate('/student')
            }
          >
            <img
              src={logo}
              alt="JAK Academy"
            />
          </button>

          <div className="student-unit-navbar__breadcrumbs">
            <button
              type="button"
              onClick={() =>
                navigate('/student')
              }
            >
              الرئيسية
            </button>

            ›

            <strong>{unit.title}</strong>
          </div>

          <button
            className="student-unit-navbar__back"
            type="button"
            onClick={() =>
              navigate('/student')
            }
          >
            ←
          </button>
        </div>
      </header>

      <div className="student-unit-page__content">
        <section className="student-unit-hero">
          <div className="student-unit-hero__number">
            <span>الوحدة</span>

            <strong>
              {String(
                unit.unitNumber ||
                  unit.sortOrder,
              ).padStart(2, '0')}
            </strong>
          </div>

          <div className="student-unit-hero__content">
            <span>
              {unit.course.title}
            </span>

            <h1 dir="auto">{unit.title}</h1>

            <p dir="auto">{unit.description}</p>

            <div className="student-unit-hero__meta">
              <span>
                {unit.statistics.lessonCount}{' '}
                دروس
              </span>

              <span>
                {
                  unit.statistics
                    .completedLessonCount
                }{' '}
                مكتملة
              </span>

              <span>
                {
                  unit.statistics
                    .progressPercent
                }
                % تقدم
              </span>
            </div>
          </div>

          <div className="student-unit-hero__progress">
            <div>
              <strong>
                {
                  unit.statistics
                    .progressPercent
                }
                %
              </strong>

              <span>تقدم الوحدة</span>
            </div>

            <div className="student-unit-progress-bar">
              <span
                style={{
                  width: `${
                    unit.statistics
                      .progressPercent
                  }%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="student-unit-layout">
          <aside className="student-unit-sections">
            <div className="student-unit-sections__heading">
              <span>محتوى الوحدة</span>

              <h2>الأقسام</h2>
            </div>

            <div className="student-unit-sections__list">
              {unit.sections.map(
                (section) => (
                  <button
                    className={
                      selectedSection?.id ===
                      section.id
                        ? 'is-active'
                        : ''
                    }
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setSelectedSectionId(
                        section.id,
                      )
                    }
                  >
                    <span className="student-unit-sections__icon">
                      {sectionIcons[
                        section.sectionType
                      ] || '•'}
                    </span>

                    <span className="student-unit-sections__text">
                      <strong>
                        {getSectionLabel(
                          section.sectionType,
                          section.title,
                        )}
                      </strong>

                      <small>
                        {section.lessonCount}{' '}
                        دروس
                      </small>
                    </span>

                    <span className="student-unit-sections__percent">
                      {
                        section.progressPercent
                      }
                      %
                    </span>
                  </button>
                ),
              )}
            </div>
          </aside>

          <section className="student-unit-lessons">
            <div className="student-unit-lessons__heading">
              <div>
                <span>
                  {getSectionLabel(
                    selectedSection?.sectionType,
                    selectedSection?.sectionType,
                  )}
                </span>

                <h2>
                  {selectedSection?.title ||
                    'الدروس'}
                </h2>
              </div>

              <p>
                {
                  selectedSection
                    ?.completedLessonCount
                }{' '}
                من{' '}
                {
                  selectedSection
                    ?.lessonCount
                }{' '}
                دروس مكتملة
              </p>
            </div>

            {!selectedSection ||
            selectedSection.lessons.length ===
              0 ? (
              <div className="student-unit-lessons__empty">
                ✦

                <h3>
                  دروس جديدة قريبًا
                </h3>

                <p>
                  لا توجد دروس منشورة ومتاحة في هذا القسم حاليًا.
                </p>
              </div>
            ) : (
              <div className="student-unit-lessons__list">
                {selectedSection.lessons.map(
                  (lesson, index) => (
                    <article
                      className={[
                        'student-lesson-card',
                        `student-lesson-card--${lesson.status}`,
                      ].join(' ')}
                      key={lesson.id}
                    >
                      <div className="student-lesson-card__number">
                        <span>درس</span>

                        <strong>
                          {String(
                            index + 1,
                          ).padStart(2, '0')}
                        </strong>
                      </div>

                      <div className="student-lesson-card__content">
                        <div className="student-lesson-card__top">
                          <span
                            className={`student-lesson-card__status student-lesson-card__status--${lesson.status}`}
                          >
                            {getLessonStatusLabel(
                              lesson.status,
                            )}
                          </span>

                          <span>
                            {
                              lesson.estimatedMinutes
                            }{' '}
                            دقيقة
                          </span>
                        </div>

                        <h3 dir="auto">
                          {lesson.title}
                        </h3>

                        <p dir="auto">
                          {lesson.summary}
                        </p>

                        <div className="student-lesson-card__progress-heading">
                          <span>
                            تقدم الدرس
                          </span>

                          <strong>
                            {
                              lesson.progressPercent
                            }
                            %
                          </strong>
                        </div>

                        <div className="student-unit-progress-bar">
                          <span
                            style={{
                              width: `${lesson.progressPercent}%`,
                            }}
                          />
                        </div>

                        <div className="student-lesson-card__footer">
                          <span>
                            وقت الدراسة:{' '}
                            {formatStudyTime(
                              lesson.totalStudySeconds,
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              openLesson(lesson)
                            }
                          >
                            {lesson.status ===
                            'completed'
                              ? 'راجع الدرس'
                              : lesson.status ===
                                  'in_progress'
                                ? 'أكمل الدرس'
                                : 'ابدأ الدرس'}

                            <span
                              aria-hidden="true"
                            >
                →
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}

export default StudentUnitPage


