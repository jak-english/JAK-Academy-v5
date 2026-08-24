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

import LessonContentRenderer from '../features/student/components/LessonContentRenderer'
import GrammarLessonRenderer from '../features/student/components/GrammarLessonRenderer'
import VocabularyMasteryPanel from '../features/student/components/VocabularyMasteryPanel'
import VocabularyReferenceTables from '../features/student/components/VocabularyReferenceTables'
import { UNIT1_VOCABULARY_LESSON_ID } from '../features/student/constants/vocabularyConstants'
import FocusTimer from '../features/student/components/FocusTimer'
import ReadingQuestionTypesGuide from '../features/reading/ReadingQuestionTypesGuide'
import ReadingPassageLab from '../features/reading/ReadingPassageLab'
import Unit1WritingSkills from '../features/writing/Unit1WritingSkills'
import Unit1RemainingSkillsNotes from '../features/notes/Unit1RemainingSkillsNotes'
import {
  getStudentLesson,
  openStudentLesson,
  updateStudentLessonProgress,
} from '../features/student/services/studentLessonService'

import './StudentLessonPage.css'

const AUTO_SAVE_DELAY = 2500


const GRAMMAR_INTELLIGENCE_LESSON_ID =
  '7eab195c-4d5a-482f-83e3-379810624124'

function formatStudyTime(totalSeconds = 0) {
  const safeSeconds = Math.max(
    0,
    Number(totalSeconds) || 0,
  )

  const hours = Math.floor(
    safeSeconds / 3600,
  )

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

function getStatusLabel(status) {
  const labels = {
    not_started: 'لم يبدأ',
    in_progress: 'قيد الدراسة',
    completed: 'مكتمل',
  }

  return labels[status] || 'لم يبدأ'
}

function clampNumber(
  value,
  minimum,
  maximum,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  )
}

function calculateScrollPercent() {
  const documentElement =
    document.documentElement

  const scrollTop =
    window.scrollY ||
    documentElement.scrollTop ||
    0

  const scrollableHeight =
    documentElement.scrollHeight -
    window.innerHeight

  if (scrollableHeight <= 0) {
    return 100
  }

  return Math.round(
    clampNumber(
      (scrollTop / scrollableHeight) * 100,
      0,
      100,
    ),
  )
}

function getCurrentBlockIndex() {
  const blockElements = Array.from(
    document.querySelectorAll(
      '[data-lesson-block-index]',
    ),
  )

  if (blockElements.length === 0) {
    return 0
  }

  const readingLine =
    window.innerHeight * 0.55

  let currentIndex = 0

  blockElements.forEach((element) => {
    const elementTop =
      element.getBoundingClientRect().top

    if (elementTop <= readingLine) {
      const index = Number(
        element.dataset.lessonBlockIndex,
      )

      if (Number.isFinite(index)) {
        currentIndex = Math.max(
          currentIndex,
          index,
        )
      }
    }
  })

  return currentIndex
}

function restoreScrollPosition(
  lastPosition,
) {
  const savedScrollPercent = Number(
    lastPosition?.scrollPercent,
  )

  if (
    !Number.isFinite(savedScrollPercent) ||
    savedScrollPercent <= 0
  ) {
    return
  }

  const safeScrollPercent =
    clampNumber(
      savedScrollPercent,
      0,
      100,
    )

  const scrollableHeight =
    document.documentElement.scrollHeight -
    window.innerHeight

  if (scrollableHeight <= 0) {
    return
  }

  window.scrollTo({
    top:
      scrollableHeight *
      (safeScrollPercent / 100),

    behavior: 'auto',
  })
}

function StudentLessonPage() {
  const navigate = useNavigate()
  const { lessonSlug } = useParams()

  const [lessonData, setLessonData] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [isSaving, setIsSaving] =
    useState(false)

  const [saveStatus, setSaveStatus] =
    useState('saved')

  const lessonRef = useRef(null)

  const saveTimerRef = useRef(null)

  const lastSavedPositionRef = useRef({
    blockIndex: null,
    scrollPercent: null,
  })

  const isRestoringPositionRef =
    useRef(false)

  const lesson =
    lessonData?.lesson ?? null

  useEffect(() => {
    lessonRef.current = lesson
  }, [lesson])

  const saveReadingProgress =
    useCallback(
      async ({
        force = false,
        position = null,
      } = {}) => {
        const currentLesson =
          lessonRef.current

        if (!currentLesson?.id) {
          return
        }

        if (
          currentLesson.id ===
          UNIT1_VOCABULARY_LESSON_ID
        ) {
          return
        }

        const currentPosition =
          position || {
            blockIndex:
              getCurrentBlockIndex(),

            scrollPercent:
              calculateScrollPercent(),
          }

        const safeBlockIndex =
          Math.max(
            0,
            Number(
              currentPosition.blockIndex,
            ) || 0,
          )

        const safeScrollPercent =
          clampNumber(
            Number(
              currentPosition.scrollPercent,
            ) || 0,
            0,
            100,
          )

        const previousSavedPosition =
          lastSavedPositionRef.current

        const positionDidNotChange =
          previousSavedPosition.blockIndex ===
            safeBlockIndex &&
          previousSavedPosition
            .scrollPercent ===
            safeScrollPercent

        if (
          !force &&
          positionDidNotChange
        ) {
          return
        }

        const existingProgress =
          Number(
            currentLesson.progress
              ?.progressPercent,
          ) || 0

        const calculatedProgress =
          safeScrollPercent >= 100
            ? 99
            : safeScrollPercent

        const nextProgress =
          currentLesson.progress
            ?.status === 'completed'
            ? 100
            : Math.max(
                existingProgress,
                calculatedProgress,
              )

        try {
          setSaveStatus('saving')

          await updateStudentLessonProgress({
            lessonId: currentLesson.id,

            progressPercent:
              nextProgress,

            lastPosition: {
              blockIndex:
                safeBlockIndex,

              scrollPercent:
                safeScrollPercent,
            },
          })

          lastSavedPositionRef.current = {
            blockIndex:
              safeBlockIndex,

            scrollPercent:
              safeScrollPercent,
          }

          setLessonData(
            (currentData) => {
              if (!currentData?.lesson) {
                return currentData
              }

              const currentStatus =
                currentData.lesson.progress
                  ?.status

              const nextStatus =
                currentStatus ===
                'completed'
                  ? 'completed'
                  : nextProgress > 0
                    ? 'in_progress'
                    : 'not_started'

              return {
                ...currentData,

                lesson: {
                  ...currentData.lesson,

                  progress: {
                    ...currentData.lesson
                      .progress,

                    status:
                      nextStatus,

                    progressPercent:
                      currentStatus ===
                      'completed'
                        ? 100
                        : Math.max(
                            Number(
                              currentData
                                .lesson
                                .progress
                                ?.progressPercent,
                            ) || 0,

                            nextProgress,
                          ),

                    lastPosition: {
                      blockIndex:
                        safeBlockIndex,

                      scrollPercent:
                        safeScrollPercent,
                    },
                  },
                },
              }
            },
          )

          setSaveStatus('saved')
        } catch (error) {
          console.error(
            'Automatic lesson progress save error:',
            error,
          )

          setSaveStatus('error')
        }
      },
      [],
    )

  useEffect(() => {
    let isMounted = true

    async function loadLesson() {
      try {
        setIsLoading(true)
        setErrorMessage('')
        setSaveStatus('saved')

        const data =
          await getStudentLesson(
            lessonSlug,
          )

        if (!isMounted) {
          return
        }

        const loadedLesson =
          data?.lesson

        setLessonData(data)

        if (!loadedLesson?.id) {
          return
        }

        await openStudentLesson(
          loadedLesson.id,
          loadedLesson.progress
            ?.lastPosition || {},
        )

        const initialPosition = {
          blockIndex:
            Number(
              loadedLesson.progress
                ?.lastPosition
                ?.blockIndex,
            ) || 0,

          scrollPercent:
            Number(
              loadedLesson.progress
                ?.lastPosition
                ?.scrollPercent,
            ) || 0,
        }

        lastSavedPositionRef.current =
          initialPosition

        isRestoringPositionRef.current =
          true

        window.requestAnimationFrame(
          () => {
            window.requestAnimationFrame(
              () => {
                restoreScrollPosition(
                  loadedLesson.progress
                    ?.lastPosition || {},
                )

                window.setTimeout(
                  () => {
                    isRestoringPositionRef.current =
                      false
                  },
                  250,
                )
              },
            )
          },
        )
      } catch (error) {
        console.error(
          'Student lesson loading error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل الدرس.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLesson()

    return () => {
      isMounted = false

      if (saveTimerRef.current) {
        window.clearTimeout(
          saveTimerRef.current,
        )
      }
    }
  }, [lessonSlug])

  useEffect(() => {
    if (!lesson?.id || isLoading) {
      return undefined
    }

    function scheduleProgressSave() {
      if (
        isRestoringPositionRef.current
      ) {
        return
      }

      setSaveStatus('pending')

      if (saveTimerRef.current) {
        window.clearTimeout(
          saveTimerRef.current,
        )
      }

      saveTimerRef.current =
        window.setTimeout(
          () => {
            saveReadingProgress()
          },
          AUTO_SAVE_DELAY,
        )
    }

    function handlePageLeaving() {
      if (saveTimerRef.current) {
        window.clearTimeout(
          saveTimerRef.current,
        )
      }

      saveReadingProgress({
        force: true,
      })
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        'hidden'
      ) {
        handlePageLeaving()
      }
    }

    window.addEventListener(
      'scroll',
      scheduleProgressSave,
      {
        passive: true,
      },
    )

    window.addEventListener(
      'resize',
      scheduleProgressSave,
    )

    window.addEventListener(
      'pagehide',
      handlePageLeaving,
    )

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    return () => {
      window.removeEventListener(
        'scroll',
        scheduleProgressSave,
      )

      window.removeEventListener(
        'resize',
        scheduleProgressSave,
      )

      window.removeEventListener(
        'pagehide',
        handlePageLeaving,
      )

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )

      if (saveTimerRef.current) {
        window.clearTimeout(
          saveTimerRef.current,
        )
      }

      saveReadingProgress({
        force: true,
      })
    }
  }, [
    isLoading,
    lesson?.id,
    lessonSlug,
    saveReadingProgress,
  ])

  function handleVocabularyProgressChange(
    vocabularyProgress,
  ) {
    const nextProgress =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            vocabularyProgress
              ?.synced_progress_percent,
          ) || 0,
        ),
      )

    const nextStatus =
      vocabularyProgress?.lesson_status ||
      (nextProgress >= 100
        ? 'completed'
        : nextProgress > 0
          ? 'in_progress'
          : 'not_started')

    setLessonData((currentData) => {
      if (!currentData?.lesson) {
        return currentData
      }

      return {
        ...currentData,

        lesson: {
          ...currentData.lesson,

          progress: {
            ...currentData.lesson.progress,

            progressPercent:
              nextProgress,

            status:
              nextStatus,

            completedAt:
              vocabularyProgress
                ?.completed_at ??
              currentData.lesson.progress
                ?.completedAt ??
              null,
          },
        },
      }
    })
  }


  async function handleCompleteLesson() {
    if (!lesson?.id || isSaving) {
      return
    }

    try {
      setIsSaving(true)
      setSaveStatus('saving')
      setErrorMessage('')

      const blocks =
        Array.isArray(
          lesson.content?.blocks,
        )
          ? lesson.content.blocks
          : []

      const finalPosition = {
        blockIndex:
          Math.max(
            blocks.length - 1,
            0,
          ),

        scrollPercent: 100,
      }

      await updateStudentLessonProgress({
        lessonId: lesson.id,
        progressPercent: 100,
        lastPosition: finalPosition,
      })

      lastSavedPositionRef.current =
        finalPosition

      setLessonData(
        (currentData) => ({
          ...currentData,

          lesson: {
            ...currentData.lesson,

            progress: {
              ...currentData.lesson
                .progress,

              status: 'completed',
              progressPercent: 100,
              lastPosition:
                finalPosition,

              completedAt:
                currentData.lesson
                  .progress
                  .completedAt ||
                new Date().toISOString(),
            },
          },
        }),
      )

      setSaveStatus('saved')
    } catch (error) {
      console.error(
        'Complete lesson error:',
        error,
      )

      setSaveStatus('error')

      setErrorMessage(
        error.message ||
          'تعذر إكمال الدرس. حاول مرة أخرى.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleBackToUnit() {
    await saveReadingProgress({
      force: true,
    })

    navigate(
      `/student/units/${lesson.unit.slug}`,
    )
  }

  async function openLinkedLesson(
    linkedLesson,
  ) {
    if (!linkedLesson?.slug) {
      return
    }

    await saveReadingProgress({
      force: true,
    })

    navigate(
      `/student/lessons/${linkedLesson.slug}`,
    )
  }

  function getSaveStatusLabel() {
    const labels = {
      pending: 'بانتظار الحفظ…',
      saving: 'جارٍ حفظ التقدم…',
      saved: 'تم حفظ التقدم',
      error: 'تعذر الحفظ',
    }

    return (
      labels[saveStatus] ||
      'تم حفظ التقدم'
    )
  }

  function handleFocusSessionFinished(
    finishedSession,
  ) {
    const addedStudySeconds =
      Math.max(
        0,
        Number(
          finishedSession?.elapsedSeconds,
        ) || 0,
      )

    if (addedStudySeconds <= 0) {
      return
    }

    setLessonData((currentData) => {
      if (!currentData?.lesson) {
        return currentData
      }

      const currentStudySeconds =
        Number(
          currentData.lesson.progress
            ?.totalStudySeconds,
        ) || 0

      return {
        ...currentData,

        lesson: {
          ...currentData.lesson,

          progress: {
            ...currentData.lesson.progress,

            totalStudySeconds:
              currentStudySeconds +
              addedStudySeconds,
          },
        },
      }
    })
  }

  if (isLoading) {
    return (
      <main className="student-lesson-state">
        <div className="student-lesson-state__loader" />

        <h1>جارٍ تجهيز الدرس</h1>

        <p>
          نجهّز محتوى الدرس وتقدمك الدراسي...
        </p>
      </main>
    )
  }

  if (errorMessage && !lesson) {
    return (
      <main className="student-lesson-state">
        <div className="student-lesson-state__error">
          !
        </div>

        <h1>الدرس غير متاح</h1>

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

  if (!lesson) {
    return null
  }

  return (
    <main
      className="student-lesson-page"
      dir="rtl"
    >
      <header className="student-lesson-navbar">
        <div className="student-lesson-navbar__inner">
          <button
            className="student-lesson-navbar__brand"
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

          <div className="student-lesson-navbar__breadcrumbs">
            <button
              type="button"
              onClick={() =>
                navigate('/student')
              }
            >
              الرئيسية
            </button>

            <span>›</span>

            <button
              type="button"
              onClick={
                handleBackToUnit
              }
            >
              {lesson.unit.title}
            </button>

            <span>›</span>

            <strong>
              {lesson.section.title}
            </strong>
          </div>

          <button
            className="student-lesson-navbar__back"
            type="button"
            onClick={handleBackToUnit}
          >
            العودة إلى الوحدة →
          </button>
        </div>
      </header>

      <div className="student-lesson-page__content">
        {errorMessage && (
          <div
            className="student-lesson-page__notice"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <section className="student-lesson-hero">
          <div className="student-lesson-hero__content">
            <span>
              {lesson.unit.title}
              {' · '}
              {lesson.section.title}
            </span>

            <h1 dir="auto">{lesson.title}</h1>

            <p dir="auto">{lesson.summary}</p>

            <div className="student-lesson-hero__meta">
              <span>
                {lesson.estimatedMinutes} دقيقة
              </span>

              <span>
                {getStatusLabel(
                  lesson.progress.status,
                )}
              </span>

              <span>
                {formatStudyTime(
                  lesson.progress
                    .totalStudySeconds,
                )}{' '}
                دراسة
              </span>

              <span>
                {getSaveStatusLabel()}
              </span>
            </div>
          </div>

          <div className="student-lesson-hero__progress">
            <strong>
              {
                lesson.progress
                  .progressPercent
              }
              %
            </strong>

            <span>تقدمك في الدرس</span>

            <div className="student-lesson-progress-bar">
              <span
                style={{
                  width: `${
                    lesson.progress
                      .progressPercent
                  }%`,
                }}
              />
            </div>
          </div>
        </section>

        <section className="student-lesson-layout">
          <div>
            <article className="student-lesson-content-card">
              {lesson.id ===
              UNIT1_VOCABULARY_LESSON_ID ? (
                <VocabularyMasteryPanel
                  lessonId={lesson.id}
                  onProgressChange={
                    handleVocabularyProgressChange
                  }
                />
              ) : lesson.id ===
                GRAMMAR_INTELLIGENCE_LESSON_ID ? (
                <GrammarLessonRenderer
                  lessonId={lesson.id}
                  content={lesson.content}
                />
              ) : (
                <>
                  {lesson.section?.sectionType ===
                    'reading' && (
                    <>
                      <ReadingQuestionTypesGuide />
                      <ReadingPassageLab />
                    </>
                  )}

                  {lesson.section?.sectionType ===
                    'writing' &&
                    lesson.unit?.unitNumber === 1 && (
                      <Unit1WritingSkills />
                    )}
                  {lesson.section?.sectionType ===
                    'notes' &&
                    lesson.unit?.unitNumber === 1 && (
                      <Unit1RemainingSkillsNotes />
                    )}

                    {!(lesson.unit?.unitNumber === 1 && ['writing', 'notes'].includes(lesson.section?.sectionType)) && (
                      <LessonContentRenderer
                        content={lesson.content}
                      />
                    )}
                </>
              )}
            </article>

            {lesson.id ===
              UNIT1_VOCABULARY_LESSON_ID && (
                <VocabularyReferenceTables
                  lessonId={lesson.id}
                />
              )}
          </div>

          <aside className="student-lesson-sidebar">
            <section className="student-lesson-sidebar__card">
              <span>حالة الدرس</span>

              <strong>
                {getStatusLabel(
                  lesson.progress.status,
                )}
              </strong>

              <p>
                التقدم:{' '}
                {
                  lesson.progress
                    .progressPercent
                }
                %
              </p>

              {lesson.id ===
              UNIT1_VOCABULARY_LESSON_ID ? (
                <p
                  style={{
                    marginTop: '14px',
                    fontWeight: 700,
                    lineHeight: 1.8,
                  }}
                >
                  يكتمل هذا الدرس تلقائيًا عند
                  تحقيق شروط الإتقان.
                </p>
              ) : (
                <button
                  type="button"
                  disabled={
                    isSaving ||
                    lesson.progress.status ===
                      'completed'
                  }
                  onClick={handleCompleteLesson}
                >
                  {lesson.progress.status ===
                  'completed'
                    ? 'تم إكمال الدرس'
                    : isSaving
                      ? 'جارٍ الحفظ...'
                      : 'إكمال الدرس'}
                </button>
              )}
            </section>

            <section className="student-lesson-sidebar__card">
              <span>التنقل بين الدروس</span>

              <button
                type="button"
                disabled={
                  !lesson.previousLesson
                }
                onClick={() =>
                  openLinkedLesson(
                    lesson.previousLesson,
                  )
                }
              >
                الدرس السابق →
              </button>

              <button
                type="button"
                disabled={
                  !lesson.nextLesson
                }
                onClick={() =>
                  openLinkedLesson(
                    lesson.nextLesson,
                  )
                }
              >
                ← الدرس التالي
              </button>
            </section>

            <FocusTimer
              lessonId={lesson.id}
              onSessionFinished={
                handleFocusSessionFinished
              }
            />
          </aside>
        </section>
      </div>
    </main>
  )
}

export default StudentLessonPage
