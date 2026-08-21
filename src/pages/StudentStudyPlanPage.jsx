import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'

import {
  getStudentStudyPlan,
  getStudentStudyIntelligence,
} from '../features/student/services/studentStudyPlanService'

import './StudentStudyPlanPage.css'

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

  return `${hours} ساعة ${minutes} دقيقة`
}

function StudentStudyPlanPage() {
  const navigate = useNavigate()

  const [studyPlan, setStudyPlan] =
    useState(null)

  const [studyIntelligence, setStudyIntelligence] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadStudyPlan() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const [data, intelligence] =
          await Promise.all([
            getStudentStudyPlan(),
            getStudentStudyIntelligence(),
          ])










        if (isMounted) {
          setStudyPlan(data)
          setStudyIntelligence(intelligence)


        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل خطة الدراسة.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStudyPlan()

    return () => {
      isMounted = false
    }
  }, [])

  const studyGoalPercent = useMemo(() => {
    const goalSeconds =
      (studyPlan?.dailyGoal?.studyMinutes || 0) *
      60

    if (goalSeconds <= 0) {
      return 0
    }

    return Math.min(
      100,
      Math.round(
        ((studyPlan?.today?.studySeconds || 0) /
          goalSeconds) *
          100,
      ),
    )
  }, [studyPlan])

  const lessonGoalPercent = useMemo(() => {
    const goal =
      studyPlan?.dailyGoal?.lessonCount || 0

    if (goal <= 0) {
      return 0
    }

    return Math.min(
      100,
      Math.round(
        ((studyPlan?.today?.completedLessons || 0) /
          goal) *
          100,
      ),
    )
  }, [studyPlan])

  if (isLoading) {
    return (
      <main className="student-study-plan-page">
        <div className="student-study-plan-page__center">
          جارٍ تجهيز خطتك الذكية...
        </div>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main className="student-study-plan-page">
        <div className="student-study-plan-page__center">
          <div>
            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              حاول مرة أخرى
            </button>
          </div>
        </div>
      </main>
    )
  }

  const studyPlanRecommendedLesson =
    studyPlan?.recommendedLesson

  const upcomingLessons =
    studyPlan?.upcomingLessons || []

  const recommendedAction =
    studyIntelligence?.recommendedAction

  const continuityLesson =
    studyIntelligence?.continuity?.lesson

  const continuityLessonDetails =
    continuityLesson
      ? [
          studyPlanRecommendedLesson,
          ...upcomingLessons,
        ].find(
          (lesson) =>
            lesson?.id === continuityLesson.id,
        )
      : null

  const recommendedLesson =
    recommendedAction?.type === 'continue_lesson' &&
    continuityLesson
      ? {
          ...(continuityLessonDetails || {}),
          ...continuityLesson,
        }
      : studyPlanRecommendedLesson

  const vocabularySummary =
    recommendedLesson?.vocabularySummary || null

  const isVocabularyRecommendation =
    recommendedLesson?.section?.sectionType ===
      'vocabulary' &&
    vocabularySummary

  const vocabularyGuidance =
    !isVocabularyRecommendation
      ? null
      : vocabularySummary.dueItems > 0
        ? `لديك ${vocabularySummary.dueItems} عناصر حان وقت مراجعتها. ابدأ بها أولًا لتثبيت الذاكرة.`
        : vocabularySummary.coveragePercent < 60
          ? 'أنت الآن في مرحلة بناء التغطية. ركّز على إضافة عناصر جديدة مع تثبيت ما بدأت به.'
          : (vocabularySummary.averageMasteryStarted ?? vocabularySummary.averageMastery ?? 0) < 70
            ? 'تغطيتك جيدة، والخطوة الأهم الآن هي رفع مستوى الإتقان والاسترجاع.'
            : vocabularySummary.masteredItems <
                vocabularySummary.totalItems
              ? 'أنت قريب من مرحلة الإتقان. واصل المراجعة المتباعدة حتى تثبت جميع العناصر.'
              : 'أحسنت. جميع عناصر هذا الدرس وصلت إلى مستوى الإتقان المطلوب.'

  const vocabularyRetention =
    studyIntelligence?.vocabularyRetention || null

  const vocabularyDailyRecommendation =
    studyIntelligence?.vocabularyDailyRecommendation || null

  const vocabularyRetentionLabel =
    vocabularyRetention?.state === 'fragile_due'
      ? 'ذاكرة هشة — راجع الآن'
      : vocabularyRetention?.state === 'review_due'
        ? 'حان وقت المراجعة'
        : vocabularyRetention?.state === 'building'
          ? 'الذاكرة قيد التثبيت'
          : vocabularyRetention?.state === 'stable'
            ? 'ذاكرة مستقرة'
            : 'بيانات الذاكرة قيد البناء'

  const vocabularyNextReviewLabel =
    vocabularyRetention?.nextReviewAt
      ? new Date(
          vocabularyRetention.nextReviewAt,
        ).toLocaleString('ar-JO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null

  const retryMistakes =
    studyIntelligence?.retryMistakes

  const spacedReview =
    studyIntelligence?.spacedReview

  const weakArea =
    studyIntelligence?.weakArea

  const recommendationReason =
    recommendedAction?.type === 'vocabulary_review'
      ? vocabularyDailyRecommendation?.message ||
        `لديك ${studyIntelligence?.vocabularyReview?.dueItems || 0} عناصر مفردات حان وقت مراجعتها الآن. تثبيتها أولوية قبل إضافة مفردات جديدة.`
      : recommendedAction?.type === 'continue_lesson'
        ? 'لأنك بدأت هذا الدرس بالفعل، وإكماله الآن يحافظ على تركيزك ويمنع تشتيت التعلّم.'
        : recommendedAction?.type === 'retry_mistakes'
          ? `لديك ${retryMistakes?.questionCount || 0} خطأ حديثًا تحتاج إلى تثبيت قبل إضافة مادة جديدة.`
          : recommendedAction?.type === 'review_weak_area'
            ? `نتائجك الأخيرة تشير إلى أن ${weakArea?.sectionType || 'هذه المهارة'} تحتاج إلى مراجعة مركزة.`
            : 'هذه هي الخطوة الأنسب التالية حسب ترتيب مسارك الدراسي الحالي.'

  const recommendationBadge =
    recommendedAction?.type === 'vocabulary_review'
      ? 'راجع مفرداتك'
      : recommendedAction?.type === 'continue_lesson'
        ? 'أكمل ما بدأت'
        : recommendedAction?.type === 'retry_mistakes'
          ? 'راجع أخطاءك'
          : recommendedAction?.type === 'review_weak_area'
            ? 'قوِّ نقطة الضعف'
            : 'الخطوة التالية'

  const smartPlanSteps = []

  const smartScores =
    studyIntelligence?.scores || {}

  const nextDifferentLesson =
    upcomingLessons.find(
      (lesson) =>
        lesson.id !== recommendedLesson?.id,
    ) || null

  if (recommendedLesson) {
    const learningPriority =
      recommendedAction?.type === 'vocabulary_review'
        ? smartScores.vocabularyReview || 0
        : recommendedAction?.type === 'continue_lesson'
          ? smartScores.continuity || 0
          : smartScores.nextLesson || 25

    smartPlanSteps.push({
      id: `lesson-${recommendedLesson.id}`,
      type: 'learning',
      label: 'تعلّم',
      title:
        recommendedAction?.type === 'continue_lesson'
          ? `أكمل: ${recommendedLesson.title}`
          : recommendedLesson.title,
      description:
        recommendedAction?.type === 'continue_lesson'
          ? isVocabularyRecommendation
            ? `تابع هذا الدرس. وصلت تغطيتك إلى ${vocabularySummary.coveragePercent || 0}%، وإتقان ما درست إلى ${vocabularySummary.averageMasteryStarted ?? vocabularySummary.averageMastery ?? 0}%.`
            : `أنت قريب من إنهاء هذا الدرس بنسبة ${recommendedLesson.progressPercent || 0}%.`
          : 'هذه أفضل خطوة تعليمية لك الآن.',
      minutes:
        recommendedLesson.estimatedMinutes || 10,
      priorityScore: learningPriority,
      sequence: 1,
    })
  }

  if (retryMistakes?.available) {
    const mistakeMinutes = Math.min(
      15,
      Math.max(
        5,
        (retryMistakes.questionCount || 1) * 3,
      ),
    )

    smartPlanSteps.push({
      id: 'mistakes-review',
      type: 'mistakes',
      label: 'مراجعة',
      title:
        retryMistakes.questionCount === 1
          ? 'راجع خطأك الأخير'
          : `راجع ${retryMistakes.questionCount} خطأ حديثًا`,
      description:
        'معالجة الخطأ الآن تمنع تكراره لاحقًا وتثبّت الفكرة بشكل أفضل.',
      minutes: mistakeMinutes,
      priorityScore:
        smartScores.mistakes ??
        retryMistakes.score ??
        0,
      sequence: 2,
    })
  }

  if (spacedReview?.available) {
    const spacedReviewMinutes = Math.min(
      15,
      Math.max(
        5,
        (spacedReview.dueCount || 1) * 4,
      ),
    )

    smartPlanSteps.push({
      id: 'spaced-review',
      type: 'spaced-review',
      label: 'تثبيت',
      title:
        spacedReview.dueCount === 1
          ? 'راجع سؤالًا مستحقًا اليوم'
          : `راجع ${spacedReview.dueCount} أسئلة مستحقة اليوم`,
      description:
        'هذه المراجعة ظهرت في الوقت المناسب لتثبيت المعلومة قبل أن تبدأ بالنسيان.',
      minutes: spacedReviewMinutes,
      priorityScore:
        smartScores.spacedReview ??
        spacedReview.score ??
        0,
      sequence: 3,
      action: () =>
        navigate('/student/reviews'),
    })
  }
  if (weakArea?.available) {
    smartPlanSteps.push({
      id: `weak-${weakArea.sectionType}`,
      type: 'weakness',
      label: 'تقوية',
      title: `قوِّ ${weakArea.sectionType}`,
      description:
        `دقتك الحالية ${weakArea.accuracyPercent}% بناءً على ${weakArea.answeredCount} إجابات.`,
      minutes: 10,
      priorityScore:
        smartScores.weakness ??
        weakArea.score ??
        0,
      sequence: 4,
    })
  }

  if (nextDifferentLesson) {
    smartPlanSteps.push({
      id: `next-${nextDifferentLesson.id}`,
      type: 'next',
      label: 'تقدّم',
      title: `بعدها: ${nextDifferentLesson.title}`,
      description:
        'انتقل إلى هذه الخطوة بعد إنهاء الأولويات الأعلى.',
      minutes:
        nextDifferentLesson.estimatedMinutes || 10,
      priorityScore: Math.max(
        0,
        (smartScores.nextLesson || 25) - 1,
      ),
      sequence: 5,
    })
  }

  smartPlanSteps.sort(
    (firstStep, secondStep) => {
      const scoreDifference =
        (secondStep.priorityScore || 0) -
        (firstStep.priorityScore || 0)

      if (scoreDifference !== 0) {
        return scoreDifference
      }

      return (
        (firstStep.sequence || 0) -
        (secondStep.sequence || 0)
      )
    },
  )

  const smartPlanTotalMinutes =
    smartPlanSteps.reduce(
      (total, step) =>
        total + (step.minutes || 0),
      0,
    )

  return (
    <main className="student-study-plan-page">
      <div className="student-study-plan-page__background">
        <div className="student-study-plan-page__glow student-study-plan-page__glow--blue" />
        <div className="student-study-plan-page__glow student-study-plan-page__glow--gold" />
        <div className="student-study-plan-page__grid" />
      </div>

      <header className="student-study-plan-navbar">
        <div className="student-study-plan-navbar__inner">
          <button
            type="button"
            className="student-study-plan-navbar__brand"
            onClick={() =>
              navigate('/student')
            }
          >
            <img
              src={logo}
              alt="JAK Academy"
            />
          </button>

          <nav className="student-study-plan-navbar__links">
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
                navigate('/student')
              }
            >
              الوحدات
            </button>

            <button
              type="button"
              className="is-active"
            >
              خطة الدراسة
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/student/achievements')
              }
            >
              الإنجازات
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/student/results')
              }
            >
              النتائج
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/student/profile')
              }
            >
              الملف الشخصي
            </button>
          </nav>
        </div>
      </header>

      <div className="student-study-plan-page__content">
        <section className="student-study-plan-hero">
          <div>
            <p className="student-study-plan-hero__eyebrow">
              خطتك اليومية الذكية
            </p>

            <h1>
              ماذا تدرس الآن؟
            </h1>

            <p>
              رتّب وقتك، أكمل ما بدأت به،
              وانتقل للخطوة التالية بأذكى طريقة ممكنة.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/student')
            }
          >
            العودة إلى الرئيسية
          </button>
        </section>

        <section className="student-study-plan-stats">
          <article>
            <span>
              وقت الدراسة اليوم
            </span>

            <strong>
              {formatStudyTime(
                studyPlan?.today?.studySeconds,
              )}
            </strong>

            <small>
              الهدف اليومي:{' '}
              {studyPlan?.dailyGoal?.studyMinutes || 0}{' '}
              دقيقة
            </small>

            <div className="student-study-plan-progress">
              <div
                style={{
                  width: `${studyGoalPercent}%`,
                }}
              />
            </div>
          </article>

          <article>
            <span>
              الدروس المكتملة اليوم
            </span>

            <strong>
              {studyPlan?.today?.completedLessons || 0}
            </strong>

            <small>
              الهدف اليومي:{' '}
              {studyPlan?.dailyGoal?.lessonCount || 0}{' '}
              درس
            </small>

            <div className="student-study-plan-progress">
              <div
                style={{
                  width: `${lessonGoalPercent}%`,
                }}
              />
            </div>
          </article>
        </section>

        <section className="student-study-plan-section">
          <div className="student-study-plan-section__heading">
            <div>
              <span>
                توصية JAK الذكية
              </span>

              <h2>
                خطوتك الأذكى الآن
              </h2>
            </div>
          </div>

          {recommendedLesson ? (
            <article className="student-study-plan-recommended">
              <div className="student-study-plan-recommended__content">
                <span className="student-study-plan-recommended__meta">
                  {recommendedLesson.unit?.title}
                  {' • '}
                  {recommendedLesson.section?.title}
                </span>

                <div className="student-study-plan-recommended__badge">
                  {recommendationBadge}

                  {recommendedAction?.score != null && (
                    <small>
                      أولوية {recommendedAction.score}
                    </small>
                  )}
                </div>

                <h3>
                  {recommendedLesson.title}
                </h3>

                <p>
                  {isVocabularyRecommendation ? (
                    <>
                      التغطية{' '}
                      {vocabularySummary.coveragePercent || 0}%
                    </>
                  ) : (
                    <>
                      أنجزت{' '}
                      {recommendedLesson.progressPercent || 0}%
                    </>
                  )}
                  {' • '}
                  الوقت المتوقع{' '}
                  {recommendedLesson.estimatedMinutes || 0}{' '}
                  دقيقة
                </p>

                {isVocabularyRecommendation && (
                  <div
                    style={{
                      marginTop: '18px',
                      marginBottom: '18px',
                      padding: '16px',
                      borderRadius: '18px',
                      border:
                        '1px solid rgba(45, 212, 191, 0.24)',
                      background:
                        'linear-gradient(135deg, rgba(15,118,110,0.12), rgba(30,64,175,0.08))',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(105px, 1fr))',
                        gap: '10px',
                        marginBottom: '14px',
                      }}
                    >
                      {[
                        {
                          label: 'التغطية',
                          value:
                            `${vocabularySummary.coveragePercent || 0}%`,
                          featured: true,
                        },
                        {
                          label: 'بدأت',
                          value:
                            `${vocabularySummary.startedItems || 0}/${vocabularySummary.totalItems || 0}`,
                        },
                        {
                          label: 'إتقان ما درست',
                          value:
                            `${vocabularySummary.averageMasteryStarted ?? vocabularySummary.averageMastery ?? 0}%`,
                        },
                        {
                          label: 'متقنة',
                          value:
                            vocabularySummary.masteredItems || 0,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: '11px 10px',
                            borderRadius: '14px',
                            textAlign: 'center',
                            border: item.featured
                              ? '1px solid rgba(250,204,21,0.34)'
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
                                ? '22px'
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

                    {vocabularyRetention && (
                      <div
                        style={{
                          marginBottom: '14px',
                          padding: '14px',
                          borderRadius: '14px',
                          border:
                            '1px solid rgba(45, 212, 191, 0.18)',
                          background:
                            'rgba(3,15,25,0.24)',
                        }}
                      >
                        <strong
                          style={{
                            display: 'block',
                            marginBottom: '10px',
                          }}
                        >
                          ثبات الذاكرة: {vocabularyRetentionLabel}
                        </strong>

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns:
                              'repeat(auto-fit, minmax(110px, 1fr))',
                            gap: '8px',
                            marginBottom: '10px',
                          }}
                        >
                          <small>
                            مستحقة الآن:{' '}
                            <strong>
                              {vocabularyRetention.dueItems || 0}
                            </strong>
                          </small>

                          <small>
                            هشة:{' '}
                            <strong>
                              {vocabularyRetention.fragileDueItems || 0}
                            </strong>
                          </small>

                          <small>
                            ثبات الذاكرة:{' '}
                            <strong>
                              {vocabularyRetention.averageRetention || 0}%
                            </strong>
                          </small>

                          <small>
                            متوسط الثبات:{' '}
                            <strong>
                              {vocabularyRetention.averageStabilityDays || 0}
                              {' '}يوم
                            </strong>
                          </small>
                        </div>

                        <p
                          style={{
                            margin: 0,
                            lineHeight: 1.7,
                            fontSize: '13px',
                          }}
                        >
                          {vocabularyRetention.message}
                        </p>

                        {vocabularyRetention.dueItems === 0 &&
                          vocabularyNextReviewLabel && (
                          <small
                            style={{
                              display: 'block',
                              marginTop: '8px',
                              opacity: 0.72,
                            }}
                          >
                            المراجعة القادمة المجدولة:{' '}
                            {vocabularyNextReviewLabel}
                          </small>
                        )}
                      </div>
                    )}

                    {!vocabularyRetention && (
                      <p
                        style={{
                          margin: 0,
                          lineHeight: 1.8,
                          fontWeight: 700,
                        }}
                      >
                        {vocabularyGuidance}
                      </p>
                    )}
                  </div>
                )}

                <div className="student-study-plan-recommended__reason">
                  <span>
                    لماذا هذه الخطوة؟
                  </span>

                  <p>
                    {recommendationReason}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/student/lessons/${recommendedLesson.slug}`,
                  )
                }
              >
                ابدأ الآن
              </button>
            </article>
          ) : (
            <article className="student-study-plan-empty">
              <strong>
                أنجزت كل الدروس المتاحة حاليًا.
              </strong>

              <p>
                لا توجد دروس منشورة غير مكتملة في الوقت الحالي.
              </p>
            </article>
          )}
        </section>

        <section className="student-study-plan-section student-study-plan-today">
          <div className="student-study-plan-today__heading">
            <div>
              <span>
                خطة اليوم الذكية
              </span>

              <h2>
                يومك مرتب خطوة بخطوة
              </h2>

              <p>
                لا تشتت نفسك. نفّذ الخطوات بالترتيب،
                وسيعيد JAK ترتيب أولوياتك مع تقدمك.
              </p>
            </div>

            <div className="student-study-plan-today__summary">
              <strong>
                {smartPlanTotalMinutes}
              </strong>

              <span>
                دقيقة تقريبًا
              </span>

              <small>
                {smartPlanSteps.length} خطوات مركزة
              </small>
            </div>
          </div>

          {smartPlanSteps.length > 0 ? (
            <div className="student-study-plan-today__steps">
              {smartPlanSteps.map(
                (step, index) => {
                  const stepState =
                    index === 0
                      ? 'الآن'
                      : index === 1
                        ? 'التالي'
                        : 'لاحقًا'

                  return (
                    <article
                      key={step.id}
                      className={`student-study-plan-today__step ${
                        index === 0
                          ? 'is-now'
                          : ''
                      }`}
                    >
                      <div className="student-study-plan-today__number">
                        {index + 1}
                      </div>

                      <div className="student-study-plan-today__step-content">
                        <div className="student-study-plan-today__step-top">
                          <span className="student-study-plan-today__state">
                            {stepState}
                          </span>

                          <span className="student-study-plan-today__type">
                            {step.label}
                          </span>
                        </div>

                        <h3>
                          {step.title}
                        </h3>

                        <p>
                          {step.description}
                        </p>
                      </div>

                      <div className="student-study-plan-today__time">
                        <strong>
                          {step.minutes}
                        </strong>

                        <span>
                          دقيقة
                        </span>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          ) : (
            <div className="student-study-plan-empty">
              لا توجد مهام مطلوبة منك الآن.
            </div>
          )}
        </section>

        <section className="student-study-plan-section student-study-plan-insight">
          <div className="student-study-plan-section__heading">
            <div>
              <span>
                تحليل JAK
              </span>

              <h2>
                ماذا فهم النظام عن دراستك؟
              </h2>
            </div>
          </div>

          <div className="student-study-plan-insight__grid">
            <article>
              <span className="student-study-plan-insight__label">
                الأخطاء التي تحتاج انتباهًا
              </span>

              <strong>
                {retryMistakes?.questionCount || 0}
              </strong>

              <p>
                {retryMistakes?.available
                  ? 'يوجد لديك أسئلة أخطأت بها مؤخرًا وسيتم إدخالها تدريجيًا في خطة المراجعة.'
                  : 'لا توجد أخطاء معلّقة تحتاج إلى مراجعة الآن.'}
              </p>

              {retryMistakes?.available && (
                <button
                  type="button"
                  className="study-plan-mistakes-button"
                  onClick={() =>
                    navigate('/student/mistakes')
                  }
                >
                  راجع أخطاءك الآن
                </button>
              )}
            </article>

            <article>
              <span className="student-study-plan-insight__label">
                قراءة مستوى المهارة
              </span>

              {weakArea?.sectionType ? (
                <>
                  <strong>
                    {weakArea.sectionType}
                    {' '}
                    {weakArea.available
                      ? (weakArea.accuracyPercent != null
                        ? `${weakArea.accuracyPercent}%`
                        : '')
                      : '— قيد التقييم'}
                  </strong>

                  <p>
                    {weakArea.available
                      ? `هذه إشارة أولية مبنية على ${weakArea.answeredCount} إجابات.`
                      : `لدينا ${weakArea.answeredCount || 0} إجابات فقط حتى الآن، لذلك لن نحكم على مستواك قبل توفر بيانات كافية.`}
                  </p>
                </>
              ) : (
                <>
                  <strong>
                    ما زلنا نتعلم عنك
                  </strong>

                  <p>
                    أكمل بعض الاختبارات حتى يستطيع النظام اكتشاف نقاط القوة والضعف بدقة.
                  </p>
                </>
              )}
            </article>
          </div>
        </section>

        <section className="student-study-plan-section">
          <div className="student-study-plan-section__heading">
            <div>
              <span>
                القادم في خطتك
              </span>

              <h2>
                خطواتك التالية
              </h2>
            </div>
          </div>

          {upcomingLessons.length > 0 ? (
            <div className="student-study-plan-lessons">
              {upcomingLessons.map(
                (lesson, index) => (
                  <article
                    key={lesson.id}
                    className="student-study-plan-lesson-card"
                  >
                    <div className="student-study-plan-lesson-card__number">
                      {index + 1}
                    </div>

                    <div className="student-study-plan-lesson-card__content">
                      <span>
                        {lesson.unit?.title}
                        {' • '}
                        {lesson.section?.title}
                      </span>

                      <h3>
                        {lesson.title}
                      </h3>

                      <p>
                        {lesson.status === 'in_progress'
                          ? 'بدأت هذا الدرس'
                          : 'لم يبدأ بعد'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/student/lessons/${lesson.slug}`,
                        )
                      }
                    >
                      فتح الدرس
                    </button>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="student-study-plan-empty">
              لا توجد خطوات قادمة بعد.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default StudentStudyPlanPage
