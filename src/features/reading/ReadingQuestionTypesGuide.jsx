import { useState } from 'react'

import {
  READING_QUESTION_TYPE_LIST,
} from './readingQuestionTypes'

import './ReadingQuestionTypesGuide.css'

function ReadingQuestionTypesGuide() {
  const [activeCode, setActiveCode] = useState(
    READING_QUESTION_TYPE_LIST[0]?.code || '',
  )

  const activeIndex = Math.max(
    0,
    READING_QUESTION_TYPE_LIST.findIndex(
      (item) => item.code === activeCode,
    ),
  )

  const activeQuestionType =
    READING_QUESTION_TYPE_LIST[activeIndex] ||
    READING_QUESTION_TYPE_LIST[0]

  if (!activeQuestionType) {
    return null
  }

  return (
    <section
      className="reading-question-guide"
      dir="rtl"
    >
      <div className="reading-question-guide__hero">
        <div>
          <p className="reading-question-guide__eyebrow">
            READING MASTERY
          </p>

          <h2>
            كيف تأتي أسئلة الـ Reading في التوجيهي؟
          </h2>

          <p>
            لا تبحث عشوائيًا داخل القطعة. حدّد نوع السؤال
            أولًا، ثم استخدم الاستراتيجية المناسبة له.
          </p>
        </div>

        <div className="reading-question-guide__rule">
          <strong>القاعدة الذهبية</strong>

          <span>
            اقرأ السؤال ← حدّد نوعه ← ابحث عن الدليل ←
            استبعد الخيارات
          </span>
        </div>
      </div>

      <div className="reading-question-guide__workspace">
        <nav
          className="reading-question-guide__nav"
          aria-label="أنواع أسئلة القراءة"
        >
          <div className="reading-question-guide__nav-heading">
            <span>خريطة الأسئلة</span>
            <strong>
              {activeIndex + 1}/
              {READING_QUESTION_TYPE_LIST.length}
            </strong>
          </div>

          <div className="reading-question-guide__nav-list">
            {READING_QUESTION_TYPE_LIST.map(
              (questionType, index) => {
                const isActive =
                  questionType.code ===
                  activeQuestionType.code

                return (
                  <button
                    key={questionType.code}
                    type="button"
                    className={
                      isActive
                        ? 'reading-question-guide__nav-button reading-question-guide__nav-button--active'
                        : 'reading-question-guide__nav-button'
                    }
                    onClick={() =>
                      setActiveCode(questionType.code)
                    }
                  >
                    <span className="reading-question-guide__nav-number">
                      {index + 1}
                    </span>

                    <span className="reading-question-guide__nav-text">
                      <strong dir="ltr">
                        {questionType.labelEn}
                      </strong>

                      <small>
                        {questionType.labelAr}
                      </small>
                    </span>
                  </button>
                )
              },
            )}
          </div>
        </nav>

        <article className="reading-question-guide__panel">
          <div className="reading-question-guide__panel-top">
            <div className="reading-question-guide__panel-number">
              {activeIndex + 1}
            </div>

            <div>
              <p>QUESTION TYPE</p>

              <h3 dir="ltr">
                {activeQuestionType.labelEn}
              </h3>

              <h4>
                {activeQuestionType.labelAr}
              </h4>
            </div>
          </div>

          <div className="reading-question-guide__section">
            <span className="reading-question-guide__section-label">
              ما هذا السؤال؟
            </span>

            <p>
              {activeQuestionType.descriptionAr}
            </p>
          </div>

          <div className="reading-question-guide__section">
            <span className="reading-question-guide__section-label">
              كيف أعرفه في الامتحان؟
            </span>

            <div className="reading-question-guide__chips">
              {activeQuestionType.signals.map(
                (signal) => (
                  <span
                    key={signal}
                    className="reading-question-guide__chip"
                    dir="ltr"
                  >
                    {signal}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="reading-question-guide__strategy">
            <span>طريقة الحل</span>

            <p>
              {activeQuestionType.strategyAr}
            </p>
          </div>

          <div className="reading-question-guide__coming">
            <span>الخطوة القادمة</span>

            <strong>
              مثال وزاري + تحديد الجملة الدليلية + جرّب بنفسك
            </strong>
          </div>
        </article>
      </div>

      <div className="reading-question-guide__steps">
        <div>
          <strong>1</strong>
          <span>اقرأ السؤال</span>
        </div>

        <span>←</span>

        <div>
          <strong>2</strong>
          <span>حدّد نوعه</span>
        </div>

        <span>←</span>

        <div>
          <strong>3</strong>
          <span>حدد Evidence</span>
        </div>

        <span>←</span>

        <div>
          <strong>4</strong>
          <span>استبعد الخيارات</span>
        </div>
      </div>
    </section>
  )
}

export default ReadingQuestionTypesGuide