import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import LessonContentRenderer from '../features/student/components/LessonContentRenderer'
import { getStudentFoundationLesson } from '../features/student/services/studentFoundationsService'

import './StudentFoundationLessonPage.css'

function StudentFoundationLessonPage() {
  const { lessonId } = useParams()

  const [lesson, setLesson] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let isMounted = true

    async function loadLesson() {
      try {
        setLoading(true)
        setError('')

        const data =
          await getStudentFoundationLesson(
            lessonId,
          )

        if (isMounted) {
          setLesson(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              'تعذر تحميل هذا الدرس.',
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadLesson()

    return () => {
      isMounted = false
    }
  }, [lessonId])

  if (loading) {
    return (
      <main
        className="foundation-lesson"
        dir="rtl"
      >
        <div className="foundation-lesson__state">
          جارٍ تجهيز درس التأسيس...
        </div>
      </main>
    )
  }

  if (error || !lesson) {
    return (
      <main
        className="foundation-lesson"
        dir="rtl"
      >
        <div className="foundation-lesson__state foundation-lesson__state--error">
          <h2>
            تعذر فتح هذا الدرس
          </h2>

          <p>
            {error ||
              'الدرس غير موجود.'}
          </p>

          <Link to="/student/foundations">
            العودة إلى التأسيس
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main
      className="foundation-lesson"
      dir="rtl"
    >
      <section className="foundation-lesson__hero">
        <div className="foundation-lesson__hero-inner">
          <nav className="foundation-lesson__breadcrumb">
            <Link to="/student/foundations">
              التأسيس
            </Link>

            <span>/</span>

            <span dir="auto">
              {lesson.level?.title}
            </span>

            <span>/</span>

            <span dir="auto">
              {lesson.module?.title}
            </span>
          </nav>

          <div className="foundation-lesson__badge">
            JAK FOUNDATION LESSON
          </div>

          <h1 dir="auto">
            {lesson.title}
          </h1>

          {lesson.summary ? (
            <p
              className="foundation-lesson__summary"
              dir="auto"
            >
              {lesson.summary}
            </p>
          ) : null}

          <div className="foundation-lesson__meta">
            <div>
              <span className="foundation-lesson__meta-label">
                المستوى
              </span>

              <strong dir="auto">
                {lesson.level?.title}
              </strong>
            </div>

            <div>
              <span className="foundation-lesson__meta-label">
                الوحدة التأسيسية
              </span>

              <strong dir="auto">
                {lesson.module?.title}
              </strong>
            </div>

            <div>
              <span className="foundation-lesson__meta-label">
                المدة المتوقعة
              </span>

              <strong>
                {lesson.estimatedMinutes || 0}{' '}
                دقيقة
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="foundation-lesson__workspace">
        <aside className="foundation-lesson__side">
          <div className="foundation-lesson__side-card">
            <span className="foundation-lesson__side-kicker">
              JAK ACADEMY
            </span>

            <h2>
              افهمه. اسمعه. اقرأه.
            </h2>

            <p>
              تحرّك داخل الدرس بالترتيب.
              ركّز أولًا على الصوت، ثم تعرّف
              على النمط، وبعدها طبّقه أثناء
              القراءة.
            </p>

            <div className="foundation-lesson__steps">
              <div>
                <span>01</span>
                <p>
                  افهم الصوت
                </p>
              </div>

              <div>
                <span>02</span>
                <p>
                  تعرّف على النمط
                </p>
              </div>

              <div>
                <span>03</span>
                <p>
                  ادمج واقرأ
                </p>
              </div>

              <div>
                <span>04</span>
                <p>
                  راجع وتدرّب
                </p>
              </div>
            </div>

            <Link
              className="foundation-lesson__back"
              to="/student/foundations"
            >
              جميع دروس التأسيس
            </Link>
          </div>
        </aside>

        <article className="foundation-lesson__content">
          <div className="foundation-lesson__content-top">
            <span>
              محتوى الدرس
            </span>

            <strong dir="auto">
              {lesson.title}
            </strong>
          </div>

          <LessonContentRenderer
            content={lesson.contentJson}
          />
        </article>
      </section>
    </main>
  )
}

export default StudentFoundationLessonPage