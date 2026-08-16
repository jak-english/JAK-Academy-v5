import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useNavigate } from 'react-router-dom'

import logo from '../assets/logo.png'

import {
  getStudentAchievements,
} from '../features/student/services/studentAchievementsService'

import './StudentAchievementsPage.css'

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

function formatUnlockDate(value) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'ar-JO',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  ).format(new Date(value))
}

function StudentAchievementsPage() {
  const navigate = useNavigate()

  const [
    data,
    setData,
  ] = useState(null)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadAchievements() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const result =
          await getStudentAchievements()

        if (isMounted) {
          setData(result)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل الإنجازات.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAchievements()

    return () => {
      isMounted = false
    }
  }, [])

  const unlockedCount = useMemo(
    () =>
      data?.achievements?.filter(
        (item) => item.isUnlocked,
      ).length || 0,
    [data],
  )

  const totalAchievements =
    data?.achievements?.length || 0

  const unlockPercent =
    totalAchievements > 0
      ? Math.round(
          (unlockedCount /
            totalAchievements) *
            100,
        )
      : 0

  if (isLoading) {
    return (
      <main
        className="student-achievements-page"
        dir="rtl"
      >
        <div className="student-achievements-page__center">
          <div className="student-achievements-loader" />

          <strong>
            جارٍ تجهيز إنجازاتك
          </strong>

          <span>
            نجمع تقدمك ومحطاتك الدراسية...
          </span>
        </div>
      </main>
    )
  }

  if (errorMessage) {
    return (
      <main
        className="student-achievements-page"
        dir="rtl"
      >
        <div className="student-achievements-page__center">
          <div className="student-achievements-error">
            <span>!</span>

            <strong>
              تعذر تحميل الإنجازات
            </strong>

            <p>
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              المحاولة مرة أخرى
            </button>
          </div>
        </div>
      </main>
    )
  }

  const statistics =
    data?.statistics || {}

  const achievements =
    data?.achievements || []

  const courseProgress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          statistics.overallCourseProgress ||
            0,
        ),
      ),
    )

  return (
    <main
      className="student-achievements-page"
      dir="rtl"
    >
      <div className="student-achievements-page__background">
        <div className="student-achievements-page__glow student-achievements-page__glow--blue" />
        <div className="student-achievements-page__glow student-achievements-page__glow--gold" />
        <div className="student-achievements-page__grid" />
      </div>

      <header className="student-achievements-navbar">
        <div className="student-achievements-navbar__inner">
          <button
            type="button"
            className="student-achievements-navbar__brand"
            onClick={() =>
              navigate('/student')
            }
          >
            <img
              src={logo}
              alt="JAK Academy"
            />
          </button>

          <nav className="student-achievements-navbar__links">
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
              className="is-active"
            >
              الإنجازات
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  '/student/results',
                )
              }
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

      <div className="student-achievements-page__content">
        <section className="student-achievements-hero">
          <div className="student-achievements-hero__copy">
            <span className="student-achievements-hero__eyebrow">
              JAK ACHIEVEMENT HALL
            </span>

            <h1>
              كل خطوة تستحق أن تُحتسب
            </h1>

            <p>
              إنجازاتك ليست مجرد شارات؛
              إنها سجل حقيقي للدروس التي
              أكملتها، وتركيزك، والوقت الذي
              استثمرته في تطوير مستواك.
            </p>
          </div>

          <div className="student-achievements-hero__trophy">
            <span className="student-achievements-hero__trophy-icon">
              ★
            </span>

            <div>
              <span>
                إنجازات مفتوحة
              </span>

              <strong dir="ltr">
                {unlockedCount}
                <small>
                  /{totalAchievements}
                </small>
              </strong>
            </div>

            <div className="student-achievements-hero__progress">
              <span
                style={{
                  width:
                    `${unlockPercent}%`,
                }}
              />
            </div>

            <small>
              {unlockPercent}% من الإنجازات
            </small>
          </div>
        </section>

        <section className="student-achievements-summary">
          <article className="student-achievements-summary__primary">
            <span>
              الإنجازات المفتوحة
            </span>

            <strong dir="ltr">
              {unlockedCount}
              <small>
                /{totalAchievements}
              </small>
            </strong>

            <p>
              محطات حققتها بالفعل
            </p>
          </article>

          <article>
            <span>
              الدروس المكتملة
            </span>

            <strong>
              {
                statistics.completedLessons ||
                0
              }
            </strong>

            <p>
              درس تم إنجازه
            </p>
          </article>

          <article>
            <span>
              جلسات التركيز
            </span>

            <strong>
              {
                statistics.completedFocusSessions ||
                0
              }
            </strong>

            <p>
              جلسة مكتملة
            </p>
          </article>

          <article>
            <span>
              وقت الدراسة
            </span>

            <strong className="student-achievements-study-time">
              {formatStudyTime(
                statistics.totalStudySeconds,
              )}
            </strong>

            <p>
              وقت استثمرته في التعلم
            </p>
          </article>
        </section>

        <section className="student-achievements-progress">
          <div className="student-achievements-progress__heading">
            <div>
              <span>
                تقدمك في الكورس
              </span>

              <strong>
                استمر في بناء تقدمك
              </strong>
            </div>

            <strong dir="ltr">
              {courseProgress}%
            </strong>
          </div>

          <div className="student-achievements-progress__bar">
            <div
              style={{
                width:
                  `${courseProgress}%`,
              }}
            />
          </div>
        </section>

        <section className="student-achievements-section">
          <div className="student-achievements-section__heading">
            <div>
              <span>
                MILESTONES
              </span>

              <h2>
                قاعة الإنجازات
              </h2>
            </div>

            <p>
              افتح المزيد من الشارات كلما
              واصلت الدراسة والتقدم.
            </p>
          </div>

          {achievements.length > 0 ? (
            <div className="student-achievements-grid">
              {achievements.map(
                (
                  achievement,
                  index,
                ) => (
                  <article
                    key={
                      achievement.key
                    }
                    className={
                      achievement.isUnlocked
                        ? 'student-achievement-card is-unlocked'
                        : 'student-achievement-card is-locked'
                    }
                  >
                    <div className="student-achievement-card__number">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </div>

                    <div className="student-achievement-card__top">
                      <div className="student-achievement-card__icon">
                        {
                          achievement.icon
                        }
                      </div>

                      <div className="student-achievement-card__status">
                        <span />

                        {achievement.isUnlocked
                          ? 'تم فتح الإنجاز'
                          : 'لم يُفتح بعد'}
                      </div>
                    </div>

                    <div className="student-achievement-card__content">
                      <h3 dir="auto">
                        {
                          achievement.title
                        }
                      </h3>

                      <p dir="auto">
                        {
                          achievement.description
                        }
                      </p>
                    </div>

                    <footer className="student-achievement-card__footer">
                      {achievement.isUnlocked &&
                      achievement.unlockedAt ? (
                        <span>
                          تم فتحه في{' '}
                          {formatUnlockDate(
                            achievement.unlockedAt,
                          )}
                        </span>
                      ) : (
                        <span>
                          واصل الدراسة لفتح هذا الإنجاز
                        </span>
                      )}

                      <strong>
                        {achievement.isUnlocked
                          ? '✓'
                          : '◆'}
                      </strong>
                    </footer>
                  </article>
                ),
              )}
            </div>
          ) : (
            <div className="student-achievements-empty">
              لا توجد إنجازات متاحة حاليًا.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default StudentAchievementsPage