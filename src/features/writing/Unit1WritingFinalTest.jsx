import { useMemo, useState } from 'react'

import './Unit1WritingFinalTest.css'

const QUESTIONS = [
  {
    prompt: 'Which sentence is the best introduction to a blog post about a past memory?',
    options: [
      'During these years, I learned many things.',
      'I was reminded of an unforgettable childhood memory when I found an old photo.',
      'This experience convinced me that family is important.',
      'At that time, we were living in a small town.',
    ],
    answer: 1,
    explanationAr:
      'المقدمة الأفضل تشرح لماذا بدأت تتحدث عن الذكرى، وهذا يطابق Introduction في Writing Box.',
  },
  {
    prompt: 'Which expression is used as a time linker in the Writing Box?',
    options: [
      'as a result',
      'in my opinion',
      'at that time',
      'for this reason',
    ],
    answer: 2,
    explanationAr:
      'at that time من الروابط الزمنية المذكورة في Writing Box لبيان متى حدثت الأشياء.',
  },
  {
    prompt: 'Which sentence best explains why a memory was significant?',
    options: [
      'This experience convinced me that small moments can stay with us forever.',
      'I was ten years old at the time.',
      'During these years, I often visited my grandparents.',
      'I was reminded of the day by an old notebook.',
    ],
    answer: 0,
    explanationAr:
      'Conclusion يوضح لماذا كانت الذكرى مهمة أو ماذا أقنعت الكاتب به.',
  },
  {
    prompt: 'What should normally come after introducing the memory?',
    options: [
      'Relate the past to the present',
      'Explain the significance',
      'Give the background',
      'Describe the final lesson',
    ],
    answer: 2,
    explanationAr:
      'بعد تقديم الذكرى يأتي إعطاء الخلفية: العمر، المكان والظروف.',
  },
  {
    prompt: 'Which stage focuses on what happened step by step?',
    options: [
      'Describe the main events',
      'Give the background',
      'Introduce the memory',
      'Relate the past to the present',
    ],
    answer: 0,
    explanationAr:
      'Describe the main events هي مرحلة سرد الأحداث الرئيسية بالترتيب.',
  },
  {
    prompt: 'Which stage connects an old memory with the writer’s life now?',
    options: [
      'Explain the significance',
      'Give the background',
      'Relate the past to the present',
      'Introduce the memory',
    ],
    answer: 2,
    explanationAr:
      'Relate the past to the present تربط التجربة القديمة بالحياة الحالية.',
  },
  {
    prompt: 'Choose the correct transformation: I didn’t realise what a bad idea it was. (FAILED)',
    options: [
      'I failed realising what a bad idea it was.',
      'I failed to realise what a bad idea it was.',
      'I was failed to realise what a bad idea it was.',
      'I failed realise what a bad idea it was.',
    ],
    answer: 1,
    explanationAr:
      'الصيغة الصحيحة هي fail to realise؛ بعد fail نستخدم to + infinitive.',
  },
  {
    prompt: 'Choose the correct transformation: I took him with me everywhere I went. (MATTER)',
    options: [
      'No matter where did I go, I took him with me.',
      'No matter where I went, I took him with me.',
      'No matter I went where, I took him with me.',
      'No matter where I was go, I took him with me.',
    ],
    answer: 1,
    explanationAr:
      'التعبير الصحيح هو no matter where، وبعده ترتيب الجملة العادي.',
  },
  {
    prompt: 'Choose the correct transformation: I had to wait for him. (CHOICE)',
    options: [
      'I had no choice but to wait for him.',
      'I had no choice to waiting for him.',
      'I had no choice but wait for him.',
      'I had not choice but to wait for him.',
    ],
    answer: 0,
    explanationAr:
      'التعبير الثابت هو have no choice but to + verb.',
  },
  {
    prompt: 'Choose the correct transformation: I was delighted when he agreed to come to the picnic. (TO)',
    options: [
      'Much for my delight, he agreed to come to the picnic.',
      'Much to my delighted, he agreed to come to the picnic.',
      'Much to my delight, he agreed to come to the picnic.',
      'Much in my delight, he agreed to come to the picnic.',
    ],
    answer: 2,
    explanationAr:
      'التعبير الصحيح هو Much to my delight.',
  },
  {
    prompt: 'Choose the correct transformation: I have no reason not to work today. (MIGHT)',
    options: [
      'I might as well to work today.',
      'I might well as work today.',
      'I might as well work today.',
      'I might as good work today.',
    ],
    answer: 2,
    explanationAr:
      'بعد might as well نستخدم الفعل بصيغته الأساسية بدون to.',
  },
  {
    prompt: 'Choose the correct transformation: I was really shocked by what you said. (CAME)',
    options: [
      'What you said came as shocked to me.',
      'What you said came as a shock to me.',
      'What you said came like a shock to me.',
      'What you said came a shock for me.',
    ],
    answer: 1,
    explanationAr:
      'التعبير الثابت هو come as a shock to someone.',
  },
  {
    prompt: 'Choose the correct transformation: I had no idea what was happening. (CLUE)',
    options: [
      'I had no clue what was happening.',
      'I had no clue what did happen.',
      'I had not clue what was happening.',
      'I had no clue what was happen.',
    ],
    answer: 0,
    explanationAr:
      'have no clue تعني have no idea، وبعدها نستخدم ترتيب الجملة العادي.',
  },
  {
    prompt: 'Choose the correct transformation: I had to watch my little brother carefully. (EYE)',
    options: [
      'I had to keep eye on my little brother.',
      'I had to keep an eye at my little brother.',
      'I had to keep the eye on my little brother.',
      'I had to keep an eye on my little brother.',
    ],
    answer: 3,
    explanationAr:
      'التعبير الثابت هو keep an eye on، ومعناه يراقب بعناية.',
  },
  {
    prompt: 'Which sequence best represents the blog structure in Exercise 2?',
    options: [
      'Background → Events → Introduction → Present → Significance',
      'Introduction → Background → Events → Significance → Present',
      'Events → Introduction → Background → Present → Significance',
      'Introduction → Events → Background → Present → Significance',
    ],
    answer: 1,
    explanationAr:
      'الترتيب المنطقي هو: تقديم الذكرى، الخلفية، الأحداث، أهمية الذكرى، ثم ربط الماضي بالحاضر.',
  },
]

function Unit1WritingFinalTest() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState({})
  const [showResult, setShowResult] = useState(false)

  const activeQuestion = QUESTIONS[activeIndex]
  const selected = answers[activeIndex]
  const isChecked = Boolean(checked[activeIndex])

  const score = useMemo(
    () =>
      QUESTIONS.reduce(
        (total, question, index) =>
          total + (answers[index] === question.answer ? 1 : 0),
        0,
      ),
    [answers],
  )

  function selectAnswer(optionIndex) {
    if (isChecked) return

    setAnswers((current) => ({
      ...current,
      [activeIndex]: optionIndex,
    }))
  }

  function checkAnswer() {
    if (selected === undefined) return

    setChecked((current) => ({
      ...current,
      [activeIndex]: true,
    }))
  }

  function nextQuestion() {
    if (activeIndex < QUESTIONS.length - 1) {
      setActiveIndex((current) => current + 1)
      return
    }

    setShowResult(true)
  }

  function restartTest() {
    setActiveIndex(0)
    setAnswers({})
    setChecked({})
    setShowResult(false)
  }

  if (showResult) {
    return (
      <article className="unit1-writing-final-test">
        <div className="unit1-writing-final-test__title">
          FINAL WRITING SKILLS TEST — UNIT 1
        </div>

        <div className="unit1-writing-final-test__result">
          <span>Your Score</span>
          <strong>
            {score} / {QUESTIONS.length}
          </strong>
          <p>
            {score >= 13
              ? 'Excellent — مستوى قوي جدًا في Writing Skills.'
              : score >= 10
                ? 'Very good — راجع الأخطاء البسيطة ثم أعد الاختبار.'
                : 'راجع Writing Box وExercise 2 وExercise 4 ثم حاول مرة أخرى.'}
          </p>

          <button type="button" onClick={restartTest}>
            Try Again
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="unit1-writing-final-test">
      <div className="unit1-writing-final-test__title">
        FINAL WRITING SKILLS TEST — UNIT 1
      </div>

      <div className="unit1-writing-final-test__meta">
        <span>Ministry-style Questions — أسئلة على نمط الوزارة</span>
        <strong>
          Question {activeIndex + 1} / {QUESTIONS.length}
        </strong>
      </div>

      <div className="unit1-writing-final-test__progress">
        <span
          style={{
            width: `${((activeIndex + 1) / QUESTIONS.length) * 100}%`,
          }}
        />
      </div>

      <section className="unit1-writing-final-test__question">
        <h3 dir="ltr">{activeQuestion.prompt}</h3>

        <div className="unit1-writing-final-test__options">
          {activeQuestion.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex
            const isCorrectOption =
              isChecked && optionIndex === activeQuestion.answer
            const isWrongSelected =
              isChecked &&
              isSelected &&
              optionIndex !== activeQuestion.answer

            const className = [
              'unit1-writing-final-test__option',
              isSelected
                ? 'unit1-writing-final-test__option--selected'
                : '',
              isCorrectOption
                ? 'unit1-writing-final-test__option--correct'
                : '',
              isWrongSelected
                ? 'unit1-writing-final-test__option--wrong'
                : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                type="button"
                className={className}
                key={option}
                disabled={isChecked}
                onClick={() => selectAnswer(optionIndex)}
              >
                <b>{String.fromCharCode(65 + optionIndex)}</b>
                <span dir="ltr">{option}</span>
              </button>
            )
          })}
        </div>

        {!isChecked ? (
          <button
            type="button"
            className="unit1-writing-final-test__check"
            disabled={selected === undefined}
            onClick={checkAnswer}
          >
            Check Answer
          </button>
        ) : (
          <>
            <div
              className={
                selected === activeQuestion.answer
                  ? 'unit1-writing-final-test__feedback unit1-writing-final-test__feedback--correct'
                  : 'unit1-writing-final-test__feedback unit1-writing-final-test__feedback--wrong'
              }
            >
              <strong>
                {selected === activeQuestion.answer
                  ? 'Correct'
                  : 'Incorrect'}
              </strong>
              <p>{activeQuestion.explanationAr}</p>
            </div>

            <button
              type="button"
              className="unit1-writing-final-test__next"
              onClick={nextQuestion}
            >
              {activeIndex === QUESTIONS.length - 1
                ? 'Show Result'
                : 'Next Question'}
            </button>
          </>
        )}
      </section>
    </article>
  )
}

export default Unit1WritingFinalTest
