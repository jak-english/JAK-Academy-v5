import {
  READING_QUESTION_TYPE_LIST,
} from './readingQuestionTypes'

import './ReadingQuestionTypesGuide.css'

function ReadingQuestionTypesGuide() {
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
            افهم نوع السؤال أولًا، ثم استخدم طريقة الحل
            المناسبة بدل البحث العشوائي داخل القطعة.
          </p>
        </div>

        <div className="reading-question-guide__rule">
          <strong>القاعدة الذهبية</strong>
          <span>
            اقرأ السؤال → حدّد نوعه → ابحث عن الدليل →
            استبعد الخيارات
          </span>
        </div>
      </div>

      <div className="reading-question-guide__grid">
        {READING_QUESTION_TYPE_LIST.map(
          (questionType, index) => (
            <article
              key={questionType.code}
              className="reading-question-guide__card"
            >
              <div className="reading-question-guide__number">
                {index + 1}
              </div>

              <div className="reading-question-guide__titles">
                <h3>
                  {questionType.labelEn}
                </h3>

                <p>
                  {questionType.labelAr}
                </p>
              </div>

              <p className="reading-question-guide__description">
                {questionType.descriptionAr}
              </p>

              <div className="reading-question-guide__signals">
                <span className="reading-question-guide__label">
                  كيف يأتي؟
                </span>

                <div className="reading-question-guide__chips">
                  {questionType.signals.map(
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
                <span>
                  طريقة الحل
                </span>

                <p>
                  {questionType.strategyAr}
                </p>
              </div>
            </article>
          ),
        )}
      </div>

      <div className="reading-question-guide__steps">
        <h3>
          خطوات الحل السريع
        </h3>

        <div className="reading-question-guide__steps-grid">
          <div>
            <strong>1</strong>
            <span>اقرأ السؤال أولًا</span>
          </div>

          <div>
            <strong>2</strong>
            <span>حدّد نوع السؤال</span>
          </div>

          <div>
            <strong>3</strong>
            <span>ارجع للجملة الدليلية</span>
          </div>

          <div>
            <strong>4</strong>
            <span>استبعد ما لا يدعمه النص</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ReadingQuestionTypesGuide