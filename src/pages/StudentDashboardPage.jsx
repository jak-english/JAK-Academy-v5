import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import logo from '../assets/logo.png'
import { supabase } from '../lib/supabase'
import {
  getStudentDashboard,
} from '../features/student/services/studentDashboardService'

import {
  getStudentStudyPlan,
  getStudentStudyIntelligence,
  getStudentGrammarPrioritiesV2,
} from '../features/student/services/studentStudyPlanService'

import {
  listAvailableStudentExams,
} from '../features/student/services/studentExamService'

import FocusTimer from '../features/student/components/FocusTimer'
import './StudentDashboardPage.css'

const sectionIcons = {
  vocabulary: 'Aa',
  grammar: 'G',
  reading: 'R',
  writing: 'W',
  notes: 'N',
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


function getFirstName(fullName) {
  const cleanName = fullName?.trim()

  if (!cleanName) {
    return 'طالب'
  }

  return cleanName.split(/\s+/)[0]
}

function StudentDashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [dashboardData, setDashboardData] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [isLoggingOut, setIsLoggingOut] =
    useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false)

  const [exams, setExams] = useState([])

  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('section') !== 'units') {
      return
    }

    const timer = setTimeout(() => {
      document.getElementById('student-course-title')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [searchParams])

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [
          data,
          availableExams,
          studyPlan,
          studyIntelligence,
          grammarPriorities,
        ] = await Promise.all([
          getStudentDashboard(),
          listAvailableStudentExams(),
          getStudentStudyPlan(),
          getStudentStudyIntelligence(),
          getStudentGrammarPrioritiesV2(),
        ])

        if (isMounted) {
          setDashboardData({
            ...data,
            studyPlan,
            studyIntelligence,
            grammarPriorities,
          })

          setExams(availableExams)
        }
      } catch (error) {
        console.error(
          'Student dashboard loading error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل لوحة الطالب. حاول مرة أخرى.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleLogout() {
    try {
      setIsLoggingOut(true)

      const { error } =
        await supabase.auth.signOut()

      if (error) {
        throw error
      }

      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error('Logout error:', error)
      setErrorMessage(
        'تعذر تسجيل الخروج. حاول مرة أخرى.',
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <main className="student-state">
        <div className="student-state__loader" />
        <h1>جارٍ تجهيز صفحتك</h1>
        <p>نجهّز لك رحلتك الدراسية...</p>
      </main>
    )
  }

  if (errorMessage && !dashboardData) {
    return (
      <main className="student-state">
        <div className="student-state__icon">!</div>

        <h1>تعذر فتح لوحة الطالب</h1>

        <p role="alert">
          {errorMessage}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </main>
    )
  }

  if (!dashboardData) {
    return null
  }

  const {
    profile,
    course,
    statistics,
    continueLearning,
    activeSession,
    units,
    studyPlan,
    studyIntelligence,
  } = dashboardData

  const studentName =
    profile?.fullName?.trim() ||
    'طالب'

  const firstName = getFirstName(studentName)

  const recommendedAction =
    studyIntelligence?.recommendedAction

  const continuityLesson =
    studyIntelligence?.continuity?.lesson

  const planRecommendedLesson =
    studyPlan?.recommendedLesson

  const dashboardTargetLessonId =
    continuityLesson?.id ||
    planRecommendedLesson?.id ||
    continueLearning?.lessonId ||
    null

  const dashboardVocabularySummary =
    planRecommendedLesson?.id ===
        dashboardTargetLessonId &&
      planRecommendedLesson?.section
        ?.sectionType === 'vocabulary'
      ? planRecommendedLesson
          ?.vocabularySummary || null
      : null

  const dashboardVocabularyGuidance =
    !dashboardVocabularySummary
      ? null
      : dashboardVocabularySummary.dueItems > 0
        ? `لديك ${dashboardVocabularySummary.dueItems} عناصر مستحقة للمراجعة. ابدأ بتثبيتها قبل إضافة المزيد.`
        : dashboardVocabularySummary.coveragePercent < 60
          ? 'أنت في مرحلة بناء التغطية. أكمل عناصر جديدة مع تثبيت ما بدأت به.'
          : (dashboardVocabularySummary.averageMasteryStarted ?? dashboardVocabularySummary.averageMastery ?? 0) < 70
            ? 'تغطيتك أصبحت جيدة. ركّز الآن على رفع الإتقان والاسترجاع من الذاكرة.'
            : dashboardVocabularySummary.masteredItems <
                dashboardVocabularySummary.totalItems
              ? 'أنت قريب من الإتقان. واصل المراجعة المتباعدة حتى تثبت جميع العناصر.'
              : 'وصلت عناصر هذا الدرس إلى مستوى إتقان قوي.'

  const dashboardVocabularyRetention =
    studyIntelligence?.vocabularyRetention || null

  const dashboardVocabularyRetentionSummary =
    !dashboardVocabularyRetention
      ? null
      : dashboardVocabularyRetention.state ===
          'fragile_due'
        ? `ذاكرة المفردات تحتاج تثبيتًا الآن: ${dashboardVocabularyRetention.dueItems || 0} مستحقة، منها ${dashboardVocabularyRetention.fragileDueItems || 0} هشة.`
        : dashboardVocabularyRetention.state ===
            'review_due'
          ? `لديك ${dashboardVocabularyRetention.dueItems || 0} مراجعات مفردات مستحقة الآن.`
          : dashboardVocabularyRetention.state ===
              'building'
            ? 'ذاكرة المفردات قيد التثبيت. التزم بموعد المراجعة القادم ولا تكرر الكلمات مبكرًا.'
            : dashboardVocabularyRetention.state ===
                'stable'
              ? 'ذاكرة المفردات مستقرة حاليًا. استمر بالمراجعات المجدولة.'
              : null

  const grammarJourney =
    studyPlan?.grammarJourney ?? null

  const grammarJourneyExamId =
    grammarJourney?.exam?.id ?? null

  const hasHighGrammarPriority =
    grammarJourney?.priorityLevel === 'high' &&
    Boolean(grammarJourneyExamId)

  const dashboardRecommendation =
    hasHighGrammarPriority
      ? {
          eyebrow: 'JAK GRAMMAR INTELLIGENCE',
          title:
            grammarJourney?.actionTitleAr ||
            'لديك قاعدة تحتاج انتباهك الآن',
          description:
            grammarJourney?.reasonAr ||
            'JAK حدد لك الخطوة الأنسب في القواعد الآن.',
          buttonLabel:
            grammarJourney?.recommendedAction === 'retest_now'
              ? 'ابدأ اختبار التثبيت'
              : grammarJourney?.journeyStage === 'corrective'
                ? 'ابدأ التدريب العلاجي'
                : 'ابدأ الإتقان الآن',
          action: () =>
            navigate(
              `/student/exams/${grammarJourneyExamId}`,
            ),
          isGrammarIntelligence: true,
          priorityScore:
            grammarJourney?.priorityScore || 0,
          examTitle:
            grammarJourney?.exam?.title || null,
        }
      : recommendedAction?.type === 'vocabulary_review'
      ? {
          eyebrow: 'حان وقت مراجعة المفردات',
          title: 'راجع مفرداتك الآن',
          description:
            dashboardVocabularyRetentionSummary ||
            dashboardVocabularyGuidance ||
            `لديك ${studyIntelligence?.vocabularyReview?.dueItems || 0} عناصر مفردات مستحقة للمراجعة الآن.`,
          buttonLabel: 'ابدأ مراجعة المفردات',
          action: () => {
            const lessonSlug =
              studyIntelligence?.vocabularyReview
                ?.lesson?.slug ||
              planRecommendedLesson?.slug ||
              continuityLesson?.slug ||
              continueLearning?.lessonSlug

            if (lessonSlug) {
              navigate(
                `/student/lessons/${lessonSlug}`,
              )
              return
            }

            navigate('/student/study-plan')
          },
        }
      : recommendedAction?.type === 'retry_mistakes'
        ? {
            eyebrow: 'JAK يقترح عليك الآن',
            title: 'راجع أخطاءك قبل أن تكمل',
            description:
              'لديك أخطاء حديثة تستحق المراجعة حتى لا تتكرر معك.',
            buttonLabel: 'راجع أخطاءك الآن',
            action: () =>
              navigate('/student/mistakes'),
          }
        : recommendedAction?.type === 'spaced_review'
          ? {
              eyebrow: 'حان وقت التثبيت',
              title: 'لديك مراجعة مستحقة اليوم',
              description:
                'هذه المراجعة ظهرت في الوقت المناسب لتثبيت المعلومة قبل أن تبدأ بالنسيان.',
              buttonLabel: 'ابدأ مراجعة اليوم',
              action: () =>
                navigate('/student/reviews'),
            }
          : recommendedAction?.type === 'review_weak_area'
            ? {
                eyebrow: 'JAK اكتشف نقطة تحتاج تقوية',
                title: `قوِّ ${
                  studyIntelligence?.weakArea
                    ?.sectionType ||
                  'مهارتك الأضعف'
                }`,
                description:
                  'نتائجك الأخيرة تشير إلى أن هذه المهارة تستحق تركيزًا إضافيًا.',
                buttonLabel: 'افتح خطتي الذكية',
                action: () =>
                  navigate('/student/study-plan'),
              }
            : recommendedAction?.type === 'continue_lesson'
              ? {
                  eyebrow: 'أكمل ما بدأت',
                  title:
                    continuityLesson?.title ||
                    continueLearning?.lessonTitle ||
                    'أكمل درسك الحالي',
                  description:
                    dashboardVocabularyGuidance ||
                    'إنهاء ما بدأت به الآن يحافظ على استمرارية تعلمك وتركيزك.',
                  buttonLabel: 'أكمل الدرس الآن',
                  action: () => {
                    const lessonSlug =
                      continuityLesson?.slug ||
                      continueLearning?.lessonSlug

                    if (lessonSlug) {
                      navigate(
                        `/student/lessons/${lessonSlug}`,
                      )
                      return
                    }

                    navigate('/student/study-plan')
                  },
                }
              : {
                  eyebrow: 'خطوتك الأفضل الآن',
                  title:
                    planRecommendedLesson?.title ||
                    continueLearning?.lessonTitle ||
                    'ابدأ خطتك الدراسية',
                  description:
                    'JAK رتّب لك الخطوة التالية بناءً على تقدمك الحالي.',
                  buttonLabel: 'ابدأ الآن',
                  action: () => {
                    const lessonSlug =
                      planRecommendedLesson?.slug ||
                      continueLearning?.lessonSlug

                    if (lessonSlug) {
                      navigate(
                        `/student/lessons/${lessonSlug}`,
                      )
                      return
                    }

                    navigate('/student/study-plan')
                  },
                }

  const focusLessonId = activeSession?.lessonId || continueLearning?.lessonId || null

  const examSummary = {
    available: exams.filter(
      (exam) => exam.action === 'start',
    ).length,
    inProgress: exams.filter(
      (exam) => exam.action === 'continue',
    ).length,
    completed: exams.filter(
      (exam) =>
        exam.action === 'result' ||
        exam.availability_state ===
          'attempt_limit_reached',
    ).length,
  }

  const examGroups = Object.values(
    exams.reduce((groups, exam) => {
      const unitKey =
        exam.unit_id ||
        `unassigned-${exam.exam_id}`

      if (!groups[unitKey]) {
        groups[unitKey] = {
          unitId: exam.unit_id || null,
          unitTitle:
            exam.unit_title || 'اختبارات إضافية',
          unitNumber:
            Number(exam.unit_number) || null,
          unitSortOrder:
            Number(exam.unit_sort_order) || 9999,
          exams: [],
        }
      }

      groups[unitKey].exams.push(exam)

      return groups
    }, {}),
  ).sort(
    (firstGroup, secondGroup) =>
      firstGroup.unitSortOrder -
        secondGroup.unitSortOrder ||
      (firstGroup.unitNumber || 9999) -
        (secondGroup.unitNumber || 9999),
  )

  const featuredExam =
    exams.find(
      (exam) => exam.action === 'continue',
    ) ||
    exams.find(
      (exam) => exam.action === 'start',
    ) ||
    exams[0] ||
    null

  return (
    <main
      className="student-dashboard"
      dir="ltr"
    >
      <div
        className="student-dashboard__background"
        aria-hidden="true"
      >
        <span className="student-dashboard__glow student-dashboard__glow--blue" />
        <span className="student-dashboard__glow student-dashboard__glow--gold" />
        <span className="student-dashboard__grid" />
      </div>

      <header className="student-navbar">
        <div className="student-navbar__inner">
          <button
            className="student-navbar__brand"
            type="button"
            onClick={() => navigate('/student')}
            aria-label="العودة إلى الصفحة الرئيسية"
          >
            <img
              src={logo}
              alt="JAK Academy"
            />
          </button>

          <nav
            className="student-navbar__links"
            aria-label="Student navigation"
          >
            <button
              className="is-active"
              type="button"
            >
              الرئيسية
            </button>

            <button type="button" onClick={() => document.getElementById("student-course-title")?.scrollIntoView({ behavior: "smooth", block: "start" })}>الوحدات</button>

            <button type="button" onClick={() => navigate("/student/study-plan")}>خطة الدراسة</button>

            <button type="button" onClick={() => navigate("/student/achievements")}>الإنجازات</button>

            <button
              type="button"
              onClick={() => navigate('/student/games')}
            >
              الألعاب
            </button>

              <button
                type="button"
                onClick={() => navigate("/student/foundations")}
              >
                الأساسيات
              </button>

            <button type="button" onClick={() => navigate("/student/profile")}>الملف الشخصي</button>
            <button type="button" onClick={() => navigate('/student/results')}>النتائج</button>
          </nav>

          <button
            className="student-navbar__menu-toggle"
            type="button"
            aria-label="فتح قائمة الطالب"
            aria-expanded={isMobileMenuOpen}
            onClick={() =>
              setIsMobileMenuOpen((current) => !current)
            }
          >
            <span />
            <span />
            <span />
          </button>

          <div className="student-navbar__account">
            <button
              type="button"
              className="student-navbar__profile"
              onClick={() => navigate('/student/profile')}
              aria-label="فتح الملف الشخصي"
            >
              <div className="student-navbar__avatar">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={studentName}
                  />
                ) : (
                  studentName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="student-navbar__identity">
                <strong>{studentName}</strong>
                <span>
                  {profile?.isPremium
                    ? 'طالب Premium'
                    : 'طالب مجاني'}
                </span>
              </div>
            </button>
            <button
              className="student-navbar__logout"
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut
                ? 'جارٍ تسجيل الخروج...'
                : 'تسجيل الخروج'}
            </button>
          </div>
        </div>
              {isMobileMenuOpen && (
          <nav
            className="student-mobile-menu"
            aria-label="قائمة تنقل الطالب"
          >
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student')
              }}
            >
              الرئيسية
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                document
                  .getElementById('student-course-title')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
              }}
            >
              الوحدات
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student/study-plan')
              }}
            >
              خطة الدراسة
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student/achievements')
              }}
            >
              الإنجازات
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student/games')
              }}
            >
              الألعاب
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student/foundations')
              }}
            >
              الأساسيات
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student/results')
              }}
            >
              النتائج
            </button>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false)
                navigate('/student/profile')
              }}
            >
              الملف الشخصي
            </button>

            <button
              className="student-mobile-menu__logout"
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
            </button>
          </nav>
        )}
      </header>

      <div className="student-dashboard__content">
        {errorMessage && (
          <div
            className="student-dashboard__notice"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <section
          className={[
            'student-hero',
            dashboardRecommendation.isGrammarIntelligence
              ? 'student-hero--grammar-intelligence'
              : '',
          ].filter(Boolean).join(' ')}
          dir="rtl"
        >
          <div className="student-hero__content">
            <span className="student-hero__eyebrow">
              <span />
              {dashboardRecommendation.eyebrow}
            </span>

            <div className="student-dashboard-welcome">
              أهلًا <bdi>{firstName}</bdi> 👋
            </div>

            <h1 className="student-dashboard-question">
              ماذا تدرس الآن؟
            </h1>

            <h2 className="student-dashboard-smart-title">
              {dashboardRecommendation.isGrammarIntelligence &&
              grammarJourney?.primaryErrorSignal ===
                'future_completion_vs_duration' ? (
                <>
                  راجع الفرق بين{' '}
                  <bdi>Future Perfect</bdi>
                  {' '}و{' '}
                  <bdi>Future Perfect Continuous</bdi>
                </>
              ) : (
                dashboardRecommendation.title
              )}
            </h2>

            <p>
              {dashboardRecommendation.description}
            </p>

            {dashboardVocabularySummary && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(105px, 1fr))',
                  gap: '10px',
                  marginTop: '18px',
                  marginBottom: '20px',
                  padding: '14px',
                  borderRadius: '18px',
                  border:
                    '1px solid rgba(45, 212, 191, 0.24)',
                  background:
                    'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(30,64,175,0.08))',
                }}
              >
                {[
                  {
                    label: 'بدأت',
                    value:
                      `${dashboardVocabularySummary.startedItems || 0}/${dashboardVocabularySummary.totalItems || 0}`,
                    featured: true,
                  },
                  {
                    label: 'التغطية',
                    value:
                      `${dashboardVocabularySummary.coveragePercent || 0}%`,
                  },
                  {
                    label: 'إتقان ما درست',
                    value:
                      `${dashboardVocabularySummary.averageMasteryStarted ?? dashboardVocabularySummary.averageMastery ?? 0}%`,
                  },
                  {
                    label: 'للمراجعة',
                    value:
                      dashboardVocabularySummary.dueItems || 0,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: '10px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      border: item.featured
                        ? '1px solid rgba(250,204,21,0.36)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: item.featured
                        ? 'rgba(250,204,21,0.10)'
                        : 'rgba(3,15,25,0.28)',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        opacity: 0.72,
                        marginBottom: '5px',
                      }}
                    >
                      {item.label}
                    </span>

                    <strong
                      style={{
                        display: 'block',
                        fontSize: item.featured
                          ? '21px'
                          : '18px',
                        color: item.featured
                          ? '#fde68a'
                          : 'inherit',
                      }}
                    >
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            <div className="student-dashboard-goal-row">
              <span>
                هدف اليوم:
                {' '}
                <strong>
                  {studyPlan?.dailyGoal?.studyMinutes || 45}
                  {' '}
                  دقيقة
                </strong>
              </span>

              <span>
                الدروس المستهدفة:
                {' '}
                <strong>
                  {studyPlan?.dailyGoal?.lessonCount || 2}
                </strong>
              </span>
            </div>

            <div className="student-hero__actions">
              <button
                className="student-button student-button--primary"
                type="button"
                onClick={
                  dashboardRecommendation.action
                }
              >
                {dashboardRecommendation.buttonLabel}
                <span aria-hidden="true">
                  ←
                </span>
              </button>

              <button
                className="student-button student-button--secondary"
                type="button"
                onClick={() =>
                  navigate('/student/study-plan')
                }
              >
                عرض خطتي كاملة
              </button>
            </div>
          </div>

          <div className="student-hero__membership">
            <div className="student-hero__membership-top">
              <span className="student-hero__membership-icon">
                {'\u2605'}
              </span>

              <span>
                {profile?.isPremium
                  ? 'طالب Premium'
                  : 'الخطة المجانية'}
              </span>
            </div>

            <strong>
              {course?.title || 'JAK Academy'}
            </strong>

            <p>
              خطتك اليومية تتغير تلقائيًا حسب تقدمك،
              أخطائك، والمراجعات المستحقة.
            </p>

            <small>
              إكمال الكورس:
              {' '}
              {statistics.overallCourseCompletionPercent || 0}%
            </small>
          </div>
        </section>

        <section
          className="student-statistics"
          aria-labelledby="student-statistics-title"
        >
          <div className="student-section-heading">
            <div>
              <span>أداؤك</span>

              <h2 id="student-statistics-title">
                تقدمك
              </h2>
            </div>

            <p>
              إحصائيات مباشرة من نشاطك الدراسي.
            </p>
          </div>

          <div className="student-overall-progress">
            <div className="student-overall-progress__top">
              <div>
                <span>إكمال الكورس</span>

                <strong>
                  {statistics.overallCourseCompletionPercent || 0}%
                </strong>
              </div>

              <p>
                {statistics.completedCourseLessons || 0} من{' '}
                {statistics.totalCourseLessons || 0} دروس مكتملة
              </p>
            </div>

            <div className="student-overall-progress__bar">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      statistics.overallCourseCompletionPercent || 0,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="student-statistics__grid">
            <article className="student-stat-card">
              <span className="student-stat-card__icon">
                {'\u25B6'}
              </span>

              <div>
                <small>الدروس التي بدأت بها</small>

                <strong>
                  {statistics.totalLessonsStarted}
                </strong>
              </div>
            </article>

            <article className="student-stat-card">
              <span className="student-stat-card__icon">
                &#10003;
              </span>

              <div>
                <small>الدروس المكتملة</small>

                <strong>
                  {statistics.completedLessons}
                </strong>
              </div>
            </article>

            <article className="student-stat-card">
              <span className="student-stat-card__icon">
                %
              </span>

              <div>
                <small>متوسط التقدم</small>

                <strong>
                  {
                    statistics.overallCourseCompletionPercent
                  }
                  %
                </strong>
              </div>
            </article>

            <article className="student-stat-card">
              <span className="student-stat-card__icon">
                &#9677;
              </span>

              <div>
                <small>وقت الدراسة</small>

                <strong>
                  {formatStudyTime(
                    statistics.totalStudySeconds,
                  )}
                </strong>
              </div>
            </article>

            <article className="student-stat-card">
              <span className="student-stat-card__icon">
                &#9889;
              </span>

              <div>
                <small>جلسات الدراسة</small>

                <strong>
                  {
                    statistics.completedStudySessions
                  }
                </strong>
              </div>
            </article>
          </div>
        </section>

        <section
          className="student-exams-section"
          aria-labelledby="student-exams-title"
        >
          <div className="student-exams-arena__header">
            <div className="student-exams-arena__heading">
              <span className="student-exams-arena__kicker">
                JAK EXAM ARENA
              </span>

              <h2 id="student-exams-title">
                مركز الاختبارات
              </h2>

              <p>
                اختبر مستواك، تعلّم من نتيجتك، وارجع أقوى في المحاولة التالية.
              </p>
            </div>

            <div className="student-exams-arena__stats">
              <div>
                <strong>{examSummary.available}</strong>
                <span>متاح</span>
              </div>

              <div>
                <strong>{examSummary.inProgress}</strong>
                <span>قيد التنفيذ</span>
              </div>

              <div>
                <strong>{examSummary.completed}</strong>
                <span>مكتمل</span>
              </div>
            </div>
          </div>

          {featuredExam && (
            <div className="student-exams-featured">
              <div className="student-exams-featured__signal">
                <span />
                الاختبار المقترح لك الآن
              </div>

              <div className="student-exams-featured__body">
                <div>
                  <small>
                    {featuredExam.action === 'continue'
                      ? 'لديك محاولة لم تكتمل بعد'
                      : featuredExam.action === 'start'
                        ? 'جاهز عندما تكون أنت جاهزًا'
                        : 'راجع أداءك السابق'}
                  </small>

                  <strong>
                    {featuredExam.title}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        'student-exams-grid',
                      )
                      ?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      })
                  }
                >
                  عرض الاختبار
                  <span aria-hidden="true">←</span>
                </button>
              </div>
            </div>
          )}

          {exams.length > 0 ? (
            <div
              id="student-exams-grid"
              className="student-exam-units"
            >
              {examGroups.map((group, groupIndex) => {
                const groupCompleted =
                  group.exams.filter(
                    (exam) =>
                      exam.action === 'result' ||
                      exam.availability_state ===
                        'attempt_limit_reached',
                  ).length

                const groupAvailable =
                  group.exams.filter(
                    (exam) => exam.action === 'start',
                  ).length

                const groupInProgress =
                  group.exams.filter(
                    (exam) =>
                      exam.action === 'continue',
                  ).length

                const shouldOpen =
                  group.exams.some(
                    (exam) =>
                      exam.exam_id ===
                      featuredExam?.exam_id,
                  ) || groupIndex === 0

                return (
                  <details
                    className="student-exam-unit"
                    key={
                      group.unitId ||
                      `exam-group-${groupIndex}`
                    }
                    open={shouldOpen}
                  >
                    <summary className="student-exam-unit__summary">
                      <div className="student-exam-unit__identity">
                        <span className="student-exam-unit__badge">
                          {group.unitNumber
                            ? `UNIT ${group.unitNumber}`
                            : 'EXAMS'}
                        </span>

                        <div>
                          <strong>
                            {group.unitTitle}
                          </strong>

                          <small>
                            {group.exams.length} اختبارات
                          </small>
                        </div>
                      </div>

                      <div className="student-exam-unit__stats">
                        <span>
                          <strong>
                            {groupAvailable}
                          </strong>
                          متاح
                        </span>

                        {groupInProgress > 0 && (
                          <span>
                            <strong>
                              {groupInProgress}
                            </strong>
                            قيد التنفيذ
                          </span>
                        )}

                        <span>
                          <strong>
                            {groupCompleted}
                          </strong>
                          مكتمل
                        </span>

                        <span
                          className="student-exam-unit__chevron"
                          aria-hidden="true"
                        >
                          ⌄
                        </span>
                      </div>
                    </summary>

                    <div className="student-exams-grid">
                      {group.exams.map((exam) => {
                const isResult =
                  exam.action === 'result'

                const isContinue =
                  exam.action === 'continue'

                const isStart =
                  exam.action === 'start'

                const isUnavailable =
                  exam.action === 'unavailable'

                const hasPreviousResult =
                  Boolean(exam.result_attempt_id)

                const isRetry =
                  isStart &&
                  Number(exam.attempts_used || 0) > 0

                const actionLabel =
                  isResult
                    ? 'عرض النتيجة'
                    : isContinue
                      ? 'أكمل الاختبار'
                      : isRetry
                        ? 'إعادة المحاولة'
                        : isStart
                          ? 'ابدأ الاختبار'
                          : 'غير متاح'

                const statusLabel =
                  isContinue
                    ? 'قيد التنفيذ'
                    : exam.availability_state ===
                        'not_started'
                      ? 'لم يبدأ بعد'
                      : exam.availability_state ===
                          'closed'
                        ? 'مغلق'
                        : exam.availability_state ===
                            'attempt_limit_reached'
                          ? 'مكتمل'
                          : isStart
                            ? isRetry
                              ? 'إعادة متاحة'
                              : 'متاح الآن'
                            : isResult
                              ? 'مكتمل'
                              : 'غير متاح'

                const examIcon =
                  isResult
                    ? '✓'
                    : isContinue
                      ? '◷'
                      : isRetry
                        ? '↻'
                        : isStart
                          ? '✦'
                          : '×'

                const examCardClassName = [
                  'student-exam-dashboard-card',
                  isResult
                    ? 'is-result'
                    : isContinue
                      ? 'is-continue'
                      : isRetry
                        ? 'is-retry'
                        : isStart
                          ? 'is-start'
                          : 'is-unavailable',
                ].join(' ')

                const examActionClassName = [
                  'student-exam-dashboard-card__action',
                  isResult
                    ? 'is-result'
                    : isContinue
                      ? 'is-continue'
                      : isRetry
                        ? 'is-retry'
                        : isStart
                          ? 'is-start'
                          : 'is-unavailable',
                ].join(' ')

                function openExam() {
                  if (isContinue) {
                    const activeAttemptId =
                      exam.active_attempt_id ||
                      exam.attempt_id

                    if (activeAttemptId) {
                      navigate(
                    `/student/exam-attempts/${activeAttemptId}`,
                      )
                    }

                    return
                  }

                  if (isResult) {
                    const resultAttemptId =
                      exam.result_attempt_id ||
                      exam.attempt_id

                    if (resultAttemptId) {
                      navigate(
                    `/student/exam-attempts/${resultAttemptId}`,
                      )
                    }

                    return
                  }

                  if (isStart) {
                    navigate(
                  `/student/exams/${exam.exam_id}`,
                    )
                  }
                }

                function openPreviousResult() {
                  if (!exam.result_attempt_id) {
                    return
                  }

                  navigate(
                  `/student/exam-attempts/${exam.result_attempt_id}`,
                  )
                }

                return (
                  <article
                    className={examCardClassName}
                    key={exam.exam_id}
                  >
                    <div className="student-exam-dashboard-card__top">
                      <span className="student-exam-dashboard-card__icon">
                        {examIcon}
                      </span>

                      <span
                        className={[
                          'student-exam-dashboard-card__status',
                          `student-exam-dashboard-card__status--${exam.action}`,
                        ].join(' ')}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3>
                      {exam.title}
                    </h3>

                    <p>
                      {exam.description ||
                        'اختبر فهمك وتابع تطور مستواك.'}
                    </p>

                    <div className="student-exam-dashboard-card__meta">
                      <span>
                        <strong>
                          {exam.question_count}
                        </strong>
                        أسئلة
                      </span>

                      <span>
                        <strong>
                          {exam.total_points}
                        </strong>
                        علامات
                      </span>

                      <span>
                        <strong>
                          {exam.duration_minutes || '\u2014'}
                        </strong>
                        دقيقة
                      </span>
                    </div>

                    {hasPreviousResult && (
                      <div className="student-exam-dashboard-card__result">
                        <span>
                          نتيجتك
                        </span>

                        <strong>
                          {exam.percentage ?? 0}%
                        </strong>

                        <small>
                          {exam.earned_points ?? 0}
                          {' / '}
                          {exam.total_points}
                          {' علامة'}
                        </small>
                      </div>
                    )}

                <button
                  className={examActionClassName}
                  type="button"
                  onClick={openExam}
                  disabled={isUnavailable}
                >
                  <span>
                    {actionLabel}
                  </span>

                  <span aria-hidden="true">
                    {'\u2192'}
                  </span>
                </button>

                {isRetry && hasPreviousResult && (
                  <button
                    className={examActionClassName}
                    type="button"
                    onClick={openPreviousResult}
                  >
                    <span>
                      عرض النتيجة السابقة
                    </span>

                    <span aria-hidden="true">
                      {'\u2192'}
                    </span>
                  </button>
                )}
              </article>
            )
          })}
                    </div>
                  </details>
                )
              })}
            </div>
          ) : (
            <div className="student-exams-empty">
              <span>✦</span>

              <h3>
                لا توجد اختبارات متاحة
              </h3>

              <p>
                ستظهر اختباراتك هنا تلقائيًا فور نشرها وإتاحتها لك.
              </p>
            </div>
          )}
        </section>
        <section className="student-today-plan-heading" dir="rtl">
          <div>
            <span>JAK SMART DAY</span>
            <h2>خطة اليوم</h2>
          </div>

          <p>
            ركّز على خطوة واحدة في كل مرة، وخلّي JAK يرتب لك الباقي.
          </p>
        </section>

        <div className="student-dashboard__main-grid">
          <section
            className="continue-card"
            aria-labelledby="continue-learning-title"
          >
            <div className="continue-card__heading">
              <div>
                <span>خطوتك الحالية</span>

                <h2 id="continue-learning-title">
                  {hasHighGrammarPriority
                    ? 'خطوتك الأهم الآن'
                    : 'أكمل دراستك'}
                </h2>
              </div>

              <span className="continue-card__badge">
                {hasHighGrammarPriority
                  ? 'أولوية عالية'
                  : continueLearning?.status === 'completed'
                    ? 'مكتمل'
                    : continueLearning?.status === 'in_progress'
                      ? 'قيد الدراسة'
                      : 'لم يبدأ'}
              </span>
            </div>

            {hasHighGrammarPriority ? (
              <>
                <div className="continue-card__lesson">
                  <span className="continue-card__lesson-icon">
                    G
                  </span>

                  <div>
                    <small>
                      Grammar
                      {' \u00b7 '}
                      JAK Intelligence
                    </small>

                    <h3>
                      {grammarJourney?.exam?.title ||
                        'مراجعة القواعد'}
                    </h3>

                    <p>
                      {grammarJourney?.reasonAr ||
                        'JAK حدد لك هذه الخطوة بناءً على أدائك الحالي.'}
                    </p>
                  </div>
                </div>


                <div className="continue-card__footer">
                  <span>
                    {grammarJourney?.actionTitleAr ||
                      'راجع هذه المهارة قبل الانتقال'}
                  </span>

                  <button
                    className="student-button student-button--primary"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/exams/${grammarJourneyExamId}`,
                      )
                    }
                  >
                    {grammarJourney?.recommendedAction ===
                    'retest_now'
                      ? 'ابدأ اختبار التثبيت'
                      : grammarJourney?.journeyStage ===
                          'corrective'
                        ? 'ابدأ التدريب العلاجي'
                        : 'ابدأ الإتقان'}

                    <span aria-hidden="true">
                      {'\u2192'}
                    </span>
                  </button>
                </div>
              </>
            ) : continueLearning ? (
              <>
                <div className="continue-card__lesson">
                  <span className="continue-card__lesson-icon">
                    Aa
                  </span>

                  <div>
                    <small>
                      {continueLearning.unitTitle}
                      {' \u00b7 '}
                      {
                        continueLearning.sectionTitle
                      }
                    </small>

                    <h3>
                      {
                        continueLearning.lessonTitle
                      }
                    </h3>

                    <p>
                      {
                        continueLearning.lessonSummary
                      }
                    </p>
                  </div>
                </div>

                <div className="continue-card__footer">
                  <span>
                    درست لمدة{' '}
                    {formatStudyTime(
                      continueLearning.totalStudySeconds,
                    )}
                  </span>

                  <button
                    className="student-button student-button--primary"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/student/lessons/${continueLearning.lessonSlug}`,
                      )
                    }
                  >
                    {continueLearning.status === 'completed'
                      ? 'راجع الدرس'
                      : 'أكمل الدرس'}

                    <span aria-hidden="true">{'\u2192'}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="continue-card__empty">
                <span>&#10022;</span>

                <h3>أول درس بانتظارك</h3>

                <p>
                  ابدأ أحد الدروس حتى يبدأ JAK بمتابعة تقدمك الدراسي.
                </p>
              </div>
            )}
          </section>

          <aside className="student-side-panel">
            <section className="student-focus-card">
              <div className="student-focus-card__icon">
                &#9677;
              </div>

              <span>جلسة تركيز</span>

              <strong>
                {activeSession
                  ? activeSession.status
                  : 'جاهز للتركيز؟'}
              </strong>

              <p>
                {activeSession
                  ? activeSession.lessonTitle ||
                    'جلسة دراسة عامة'
                  : '25 دقيقة من التركيز الحقيقي أفضل من ساعة مشتتة.'}
              </p>

              <button
  type="button"
  disabled={!focusLessonId}
  onClick={() =>
    setIsFocusTimerOpen(
      (currentValue) => !currentValue,
    )
  }
>
  {isFocusTimerOpen
    ? 'إغلاق المؤقت'
    : activeSession
      ? 'فتح المؤقت'
      : 'ابدأ جلسة التركيز'}
</button>

{isFocusTimerOpen && focusLessonId && (
  <div className="student-focus-card__timer">
    <FocusTimer
      lessonId={focusLessonId}
      initialPlannedSeconds={1500}
      onSessionFinished={async () => {
        const [
          refreshedDashboard,
          refreshedStudyPlan,
          refreshedStudyIntelligence,
          refreshedGrammarPriorities,
        ] = await Promise.all([
          getStudentDashboard(),
          getStudentStudyPlan(),
          getStudentStudyIntelligence(),
          getStudentGrammarPrioritiesV2(),
        ])

        setDashboardData({
          ...refreshedDashboard,
          studyPlan: refreshedStudyPlan,
          studyIntelligence:
            refreshedStudyIntelligence,
          grammarPriorities:
            refreshedGrammarPriorities,
        })
      }}
    />
  </div>
)}
            </section>

            <section className="student-quote-card" dir="rtl">
              <span>تذكير JAK</span>

              <blockquote>
                لا تدرس أكثر فقط؛ ادرس بذكاء، راجع في الوقت المناسب، وركّز على نقاط ضعفك.
              </blockquote>
            </section>
          </aside>
        </div>

        <section
          className="student-course"
          aria-labelledby="student-course-title"
        >
          <div className="student-course-path__header" dir="rtl">
            <div>
              <span className="student-course-path__kicker">
                JAK LEARNING PATH
              </span>

              <h2 id="student-course-title">
                مسارك الدراسي
              </h2>

              <p className="student-course-path__course-name">
                {course?.title ||
                  'الكورس الدراسي'}
              </p>
            </div>

            <div className="student-course-path__intro">
              <strong>
                تقدّم خطوة بخطوة
              </strong>

              <p>
                اختر الوحدة، أكمل دروسها، وتابع تقدمك من مكان واحد.
              </p>
            </div>
          </div>

          {units.length === 0 ? (
            <div className="student-course__empty">
              لا توجد وحدات منشورة ومتاحة حاليًا.
            </div>
          ) : (
            <div className="student-course__units">
              {units.map((unit) => (
                <article
                  className={[
                    'student-unit-card',
                    unit.isFree
                      ? 'student-unit-card--free'
                      : 'student-unit-card--premium',
                    unit.completionPercent >= 100
                      ? 'student-unit-card--completed'
                      : '',
                  ].join(' ')}
                  key={unit.id}
                >
                  <div className="student-unit-card__top">
                    <div className="student-unit-card__number">
                      <span>الوحدة</span>

                      <strong>
                        {String(
                          unit.unitNumber ||
                            unit.sortOrder,
                        ).padStart(2, '0')}
                      </strong>
                    </div>

                    <div className="student-unit-card__labels">
                      <span
                        className={
                          unit.isFree
                            ? 'is-free'
                            : 'is-premium'
                        }
                      >
                        {unit.isFree
                          ? 'مجاني'
                          : 'Premium'}
                      </span>

                      <strong>
                        {unit.completionPercent}%
                      </strong>
                    </div>
                  </div>

                  <h3>{unit.title}</h3>

                  <p>{unit.description}</p>

                  <div className="student-unit-card__progress-text">
                    <span>
                      {
                        unit.completedLessonCount
                      }{' '}
                      من {unit.lessonCount} دروس مكتملة
                    </span>

                    <span>
                      {unit.completionPercent}% إكمال
                    </span>
                  </div>

                  <div className="student-progress-bar">
                    <span
                      style={{
                        width: `${unit.completionPercent}%`,
                      }}
                    />
                  </div>

                  <div className="student-unit-card__sections">
                    {unit.sections.map(
                      (section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() =>
                            navigate(`/student/units/${unit.slug}?section=${section.id}`)
                          }
                        >
                          <span>
                            {sectionIcons[
                              section.sectionType
                            ] || '\u2022'}
                          </span>

                          {section.title}
                        </button>
                      ),
                    )}
                  </div>
                <button
                  className="student-unit-card__open"
                  type="button"
                  onClick={() =>
                    navigate(`/student/units/${unit.slug}`)
                  }
                >
                  <span>
                    فتح الوحدة
                  </span>

                  <span aria-hidden="true">
                    ←
                  </span>
                </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="student-footer">
          <div>
            <img
              src={logo}
              alt="JAK Academy"
            />

            <p>
              Learn smarter. Progress faster.
            </p>
          </div>

          <span>
            {'\u00A9'} 2026 JAK Academy
          </span>
        </footer>
      </div>
    </main>
  )
}

export default StudentDashboardPage




















