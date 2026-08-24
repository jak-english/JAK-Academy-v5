import { useMemo, useState } from 'react'

import './Unit1WritingSkills.css'
import Unit1WritingFinalTest from './Unit1WritingFinalTest'

const SKILLS = [
  {
    id: 'introduction',
    titleEn: 'Introduction',
    titleAr: 'المقدمة',
    explanationAr:
      'تبدأ المدونة بشرح سبب تذكّرك للذكرى أو سبب الحديث عنها.',
    bookExample: 'I was reminded of …',
    ministryPatternAr:
      'اختيار أفضل افتتاحية لمدونة تتحدث عن ذكرى من الماضي.',
    question: {
      prompt:
        'Which sentence is the best introduction to a blog post about a childhood memory?',
      options: [
        'I was reminded of a childhood memory when I found an old photo.',
        'During these years, many things happened.',
        'This experience convinced me that memories are important.',
        'At that time, I was ten years old.',
      ],
      answer: 0,
      explanationAr:
        'الإجابة A تبدأ بسبب تذكّر الذكرى، وهذا يطابق وظيفة Introduction في Writing Box.',
    },
  },
  {
    id: 'style',
    titleEn: 'Style',
    titleAr: 'الأسلوب',
    explanationAr:
      'استخدم روابط زمنية لتوضيح متى حدثت الأحداث في الماضي.',
    bookExample: 'at that time / during these years',
    ministryPatternAr:
      'اختيار رابط زمني مناسب يوضح توقيت الحدث داخل المدونة.',
    question: {
      prompt:
        'Which phrase is a time linker suitable for a blog post about the past?',
      options: [
        'at that time',
        'in my opinion',
        'as a result',
        'for this reason',
      ],
      answer: 0,
      explanationAr:
        'الإجابة A هي at that time، وهو رابط زمني ورد في Writing Box ويستخدم لتحديد وقت الحدث.',
    },
  },
  {
    id: 'conclusion',
    titleEn: 'Conclusion',
    titleAr: 'الخاتمة',
    explanationAr:
      'اختم المدونة بتوضيح لماذا كانت الذكرى مهمة بالنسبة لك.',
    bookExample: 'This experience convinced me that …',
    ministryPatternAr:
      'اختيار أفضل خاتمة توضّح أهمية التجربة أو أثرها.',
    question: {
      prompt:
        'Which sentence is the best conclusion to show why a memory was significant?',
      options: [
        'This experience convinced me that family moments are worth remembering.',
        'At that time, we were living in Amman.',
        'I was reminded of the event by an old photograph.',
        'During these years, I often visited my grandparents.',
      ],
      answer: 0,
      explanationAr:
        'الإجابة A توضّح أثر التجربة وأهميتها، وهذا هو دور Conclusion في Writing Box.',
    },
  },
]

const EXERCISE_4 = [
  {
    keyword: 'FAILED',
    first: "I didn’t realise what a bad idea it was.",
    options: [
      'I failed to realise what a bad idea it was.',
      'I failed realising what a bad idea it was.',
      'I failed realise what a bad idea it was.',
      'I was failed to realise what a bad idea it was.',
    ],
    answer: 0,
    hint: 'Think: fail + to-infinitive.',
    explanationAr:
      'الصياغة الصحيحة هي fail to realise. بعد fail نستخدم to + infinitive.',
  },
  {
    keyword: 'MATTER',
    first: 'I took him with me everywhere I went.',
    options: [
      'No matter where I went, I took him with me.',
      'No matter I went where, I took him with me.',
      'No matter where did I go, I took him with me.',
      'No matter where I was go, I took him with me.',
    ],
    answer: 0,
    hint: 'Think: no matter + where + subject + verb.',
    explanationAr:
      'No matter where تعني أينما / بغض النظر عن المكان، وبعدها نستخدم ترتيب الجملة العادي.',
  },
  {
    keyword: 'CHOICE',
    first: 'I had to wait for him.',
    options: [
      'I had no choice but to wait for him.',
      'I had no choice but wait for him.',
      'I had not choice but to wait for him.',
      'I had no choice to waiting for him.',
    ],
    answer: 0,
    hint: 'Think: have no choice but to + verb.',
    explanationAr:
      'التعبير الثابت هو have no choice but to + infinitive.',
  },
  {
    keyword: 'TO',
    first: 'I was delighted when he agreed to come to the picnic.',
    options: [
      'Much to my delight, he agreed to come to the picnic.',
      'Much for my delight, he agreed to come to the picnic.',
      'Much to my delighted, he agreed to come to the picnic.',
      'Much in my delight, he agreed to come to the picnic.',
    ],
    answer: 0,
    hint: 'Think: much to my + noun.',
    explanationAr:
      'التعبير الصحيح هو Much to my delight، وكلمة delight هنا اسم.',
  },
  {
    keyword: 'MIGHT',
    first: 'I have no reason not to work today.',
    options: [
      'I might as well work today.',
      'I might well as work today.',
      'I might as well to work today.',
      'I might as good work today.',
    ],
    answer: 0,
    hint: 'Think: might as well + base verb.',
    explanationAr:
      'بعد might as well نستخدم الفعل بصيغته الأساسية بدون to.',
  },
  {
    keyword: 'CAME',
    first: 'I was really shocked by what you said.',
    options: [
      'What you said came as a shock to me.',
      'What you said came like a shock to me.',
      'What you said came as shocked to me.',
      'What you said came a shock for me.',
    ],
    answer: 0,
    hint: 'Think: come as a shock + to someone.',
    explanationAr:
      'التعبير الثابت هو come as a shock to someone.',
  },
  {
    keyword: 'CLUE',
    first: 'I had no idea what was happening.',
    options: [
      'I had no clue what was happening.',
      'I had not clue what was happening.',
      'I had no clue what was happen.',
      'I had no clue what did happen.',
    ],
    answer: 0,
    hint: 'Think: have no clue + statement word order.',
    explanationAr:
      'have no clue تعني لا فكرة لدي، وبعدها نستخدم ترتيب الجملة العادي.',
  },
  {
    keyword: 'EYE',
    first: 'I had to watch my little brother carefully.',
    options: [
      'I had to keep an eye on my little brother.',
      'I had to keep eye on my little brother.',
      'I had to keep an eye at my little brother.',
      'I had to keep the eye on my little brother.',
    ],
    answer: 0,
    hint: 'Think: keep an eye on + person / thing.',
    explanationAr:
      'التعبير الثابت هو keep an eye on، ومعناه يراقب بعناية.',
  },
]

const BLOG_STRUCTURE = [
  {
    order: 1,
    labelEn: 'Introduce the memory',
    labelAr: 'قدّم الذكرى واشرح لماذا تتحدث عنها.',
    whyAr:
      'هذه هي نقطة البداية. القارئ يحتاج أن يعرف ما الذي أعاد الذكرى إلى ذهنك أو لماذا قررت الحديث عنها.',
    questionAr: 'ما السبب الذي جعلك تتذكر هذه الذكرى الآن؟',
  },
  {
    order: 2,
    labelEn: 'Give the background',
    labelAr: 'أعطِ خلفية عن العمر والمكان والظروف.',
    whyAr:
      'قبل أن تبدأ الأحداث، أعطِ القارئ السياق: كم كان عمرك؟ أين كنت؟ وما الظروف المحيطة بالموقف؟',
    questionAr: 'متى وأين حدثت الذكرى؟ وما الخلفية التي يحتاجها القارئ؟',
  },
  {
    order: 3,
    labelEn: 'Describe the main events',
    labelAr: 'صف الأحداث الرئيسية للذكرى.',
    whyAr:
      'هنا تبدأ القصة نفسها. رتب الأحداث بوضوح حتى يستطيع القارئ متابعة ما حدث خطوة بخطوة.',
    questionAr: 'ماذا حدث أولًا، ثم ماذا حدث بعد ذلك؟',
  },
  {
    order: 4,
    labelEn: 'Explain the significance',
    labelAr: 'اشرح لماذا ما زالت الذكرى مهمة.',
    whyAr:
      'بعد سرد الأحداث، وضّح لماذا بقيت هذه الذكرى مؤثرة أو مهمة بالنسبة لك.',
    questionAr: 'لماذا ما زالت هذه الذكرى مهمة بالنسبة لك؟',
  },
  {
    order: 5,
    labelEn: 'Relate the past to the present',
    labelAr: 'اربط أحداث الماضي بالحاضر.',
    whyAr:
      'في النهاية، بيّن كيف ترتبط هذه التجربة بحياتك الآن أو كيف ما زال أثرها مستمرًا حتى اليوم.',
    questionAr: 'كيف ترتبط هذه الذكرى بحياتك الحالية؟',
  },
]

function Unit1WritingSkills() {
  const [activeSkillIndex, setActiveSkillIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState({})
  const [exercise4State, setExercise4State] = useState({})

  const activeSkill = SKILLS[activeSkillIndex]
  const selectedAnswer = answers[activeSkill.id]
  const isChecked = Boolean(checked[activeSkill.id])

  const completedSkills = useMemo(
    () =>
      SKILLS.filter(
        (skill) =>
          checked[skill.id] &&
          answers[skill.id] === skill.question.answer,
      ).length,
    [answers, checked],
  )

  function selectAnswer(optionIndex) {
    if (isChecked) return

    setAnswers((current) => ({
      ...current,
      [activeSkill.id]: optionIndex,
    }))
  }

  function checkAnswer() {
    if (selectedAnswer === undefined) return

    setChecked((current) => ({
      ...current,
      [activeSkill.id]: true,
    }))
  }

  function goToSkill(index) {
    setActiveSkillIndex(
      Math.max(0, Math.min(SKILLS.length - 1, index)),
    )
  }

  const isCorrect =
    isChecked &&
    selectedAnswer === activeSkill.question.answer

  return (
    <section className="unit1-writing-skills">
      <header className="unit1-writing-skills__hero">
        <div>
          <span className="unit1-writing-skills__eyebrow">
            UNIT 1 · WRITING SKILLS
          </span>
          <h1>A blog post about the past</h1>
          <p>
            تعلم مهارات Writing Box الأساسية خطوة بخطوة، ثم طبّقها على
            أسئلة تحاكي نمط الامتحان الوزاري.
          </p>
        </div>

        <div className="unit1-writing-skills__progress-card">
          <strong>
            {completedSkills}/{SKILLS.length}
          </strong>
          <span>مهارات متقنة</span>
        </div>
      </header>

      <nav
        className="unit1-writing-skills__tabs"
        aria-label="Writing skills"
      >
        {SKILLS.map((skill, index) => {
          const skillCorrect =
            checked[skill.id] &&
            answers[skill.id] === skill.question.answer

          return (
            <button
              type="button"
              key={skill.id}
              className={
                index === activeSkillIndex
                  ? 'unit1-writing-skills__tab unit1-writing-skills__tab--active'
                  : 'unit1-writing-skills__tab'
              }
              onClick={() => goToSkill(index)}
            >
              <span>{index + 1}</span>
              <div>
                <strong>{skill.titleEn}</strong>
                <small>{skill.titleAr}</small>
              </div>
              {skillCorrect && (
                <b aria-label="Mastered">Done</b>
              )}
            </button>
          )
        })}
      </nav>

      <article className="unit1-writing-skills__lesson-card">
        <div className="unit1-writing-skills__lesson-heading">
          <div className="unit1-writing-skills__step-number">
            {activeSkillIndex + 1}
          </div>

          <div>
            <span>{activeSkill.titleAr}</span>
            <h2>{activeSkill.titleEn}</h2>
          </div>
        </div>

        <div className="unit1-writing-skills__learning-grid">
          <section className="unit1-writing-skills__learn-panel">
            <div className="unit1-writing-skills__explain-box">
              <span>الفكرة الأساسية</span>
              <p>{activeSkill.explanationAr}</p>
            </div>

            <div className="unit1-writing-skills__book-box">
              <span>From the Writing Box</span>
              <strong dir="ltr">
                {activeSkill.bookExample}
              </strong>
            </div>

            <div className="unit1-writing-skills__pattern">
              <span>كيف قد يأتي السؤال؟</span>
              <p>{activeSkill.ministryPatternAr}</p>
            </div>
          </section>

          <section className="unit1-writing-skills__practice-panel">
            <div className="unit1-writing-skills__question-label">
              Ministry-style Question
            </div>

            <h3 dir="ltr">
              {activeSkill.question.prompt}
            </h3>

            <div className="unit1-writing-skills__options">
              {activeSkill.question.options.map(
                (option, optionIndex) => {
                  const selected =
                    selectedAnswer === optionIndex
                  const correctOption =
                    isChecked &&
                    optionIndex ===
                      activeSkill.question.answer
                  const wrongSelected =
                    isChecked &&
                    selected &&
                    optionIndex !==
                      activeSkill.question.answer

                  const classes = [
                    'unit1-writing-skills__option',
                    selected
                      ? 'unit1-writing-skills__option--selected'
                      : '',
                    correctOption
                      ? 'unit1-writing-skills__option--correct'
                      : '',
                    wrongSelected
                      ? 'unit1-writing-skills__option--wrong'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <button
                      type="button"
                      className={classes}
                      key={option}
                      onClick={() =>
                        selectAnswer(optionIndex)
                      }
                    >
                      <b>
                        {String.fromCharCode(
                          65 + optionIndex,
                        )}
                      </b>
                      <span dir="ltr">{option}</span>
                    </button>
                  )
                },
              )}
            </div>

            {!isChecked ? (
              <button
                type="button"
                className="unit1-writing-skills__check"
                disabled={selectedAnswer === undefined}
                onClick={checkAnswer}
              >
                Check Answer
              </button>
            ) : (
              <div
                className={
                  isCorrect
                    ? 'unit1-writing-skills__feedback unit1-writing-skills__feedback--correct'
                    : 'unit1-writing-skills__feedback unit1-writing-skills__feedback--wrong'
                }
              >
                <strong>
                  {isCorrect ? 'Correct' : 'Not quite'}
                </strong>
                <p>{activeSkill.question.explanationAr}</p>
              </div>
            )}
          </section>
        </div>

        <div className="unit1-writing-skills__navigation">
          <button
            type="button"
            disabled={activeSkillIndex === 0}
            onClick={() =>
              goToSkill(activeSkillIndex - 1)
            }
          >
            Previous
          </button>

          <span>
            Skill {activeSkillIndex + 1} of {SKILLS.length}
          </span>

          <button
            type="button"
            disabled={
              activeSkillIndex === SKILLS.length - 1
            }
            onClick={() =>
              goToSkill(activeSkillIndex + 1)
            }
          >
            Next Skill
          </button>
        </div>
      </article>

      <article className="unit1-writing-skills__exercise4">
        <div className="unit1-writing-skills__structure-heading">
          <span>Exercise 4 — Sentence Transformation</span>
          <h2>إعادة صياغة الجمل</h2>
          <p>
            اختر التحويل الصحيح الذي يحافظ على معنى الجملة الأصلية ويستخدم
            الكلمة المطلوبة.
          </p>
        </div>

        <div className="unit1-writing-skills__exercise4-list">
          {EXERCISE_4.map((item, index) => {
            const state = exercise4State[item.keyword] || {}
            const selected = state.selected
            const checked = Boolean(state.checked)
            const showHint = Boolean(state.showHint)
            const correct = checked && selected === item.answer

            return (
              <section
                className="unit1-writing-skills__exercise4-item"
                key={item.keyword}
              >
                <div className="unit1-writing-skills__exercise4-question">
                  <span>{index + 1}</span>
                  <div>
                    <strong>{item.keyword}</strong>
                    <p dir="ltr">{item.first}</p>
                  </div>
                </div>

                <div className="unit1-writing-skills__exercise4-options">
                  {item.options.map((option, optionIndex) => {
                    const isSelected = selected === optionIndex
                    const isCorrectOption = checked && optionIndex === item.answer
                    const isWrongSelected =
                      checked && isSelected && optionIndex !== item.answer

                    const className = [
                      'unit1-writing-skills__exercise4-option',
                      isSelected
                        ? 'unit1-writing-skills__exercise4-option--selected'
                        : '',
                      isCorrectOption
                        ? 'unit1-writing-skills__exercise4-option--correct'
                        : '',
                      isWrongSelected
                        ? 'unit1-writing-skills__exercise4-option--wrong'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <button
                        type="button"
                        className={className}
                        key={option}
                        disabled={checked}
                        onClick={() =>
                          setExercise4State((current) => ({
                            ...current,
                            [item.keyword]: {
                              ...current[item.keyword],
                              selected: optionIndex,
                            },
                          }))
                        }
                      >
                        <b>{String.fromCharCode(65 + optionIndex)}</b>
                        <span dir="ltr">{option}</span>
                      </button>
                    )
                  })}
                </div>

                {!checked ? (
                  <div className="unit1-writing-skills__exercise4-actions">
                    <button
                      type="button"
                      className="unit1-writing-skills__check"
                      disabled={selected === undefined}
                      onClick={() =>
                        setExercise4State((current) => ({
                          ...current,
                          [item.keyword]: {
                            ...current[item.keyword],
                            checked: true,
                          },
                        }))
                      }
                    >
                      Check Answer
                    </button>

                    <button
                      type="button"
                      className="unit1-writing-skills__hint-button"
                      onClick={() =>
                        setExercise4State((current) => ({
                          ...current,
                          [item.keyword]: {
                            ...current[item.keyword],
                            showHint: true,
                          },
                        }))
                      }
                    >
                      Show Hint
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      correct
                        ? 'unit1-writing-skills__feedback unit1-writing-skills__feedback--correct'
                        : 'unit1-writing-skills__feedback unit1-writing-skills__feedback--wrong'
                    }
                  >
                    <strong>{correct ? 'Correct' : 'Try to notice the pattern'}</strong>
                    <p>{item.explanationAr}</p>
                  </div>
                )}

                {showHint && !checked && (
                  <div className="unit1-writing-skills__exercise4-hint">
                    <strong>Hint</strong>
                    <span dir="ltr">{item.hint}</span>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      </article>

      <article className="unit1-writing-skills__structure">
        <div className="unit1-writing-skills__structure-heading">
          <span>Exercise 2 — Blog Structure</span>
          <h2>كيف نبني المدونة خطوة بخطوة؟</h2>
          <p>
            لا تحفظ الترتيب فقط. افهم وظيفة كل فقرة ولماذا تأتي في هذا
            المكان.
          </p>
        </div>

        <div className="unit1-writing-skills__structure-flow">
          {BLOG_STRUCTURE.map((step) => (
            <details
              className="unit1-writing-skills__structure-card"
              key={step.order}
              open={step.order === 1}
            >
              <summary>
                <span>{step.order}</span>
                <div>
                  <strong dir="ltr">{step.labelEn}</strong>
                  <p>{step.labelAr}</p>
                </div>
              </summary>

              <div className="unit1-writing-skills__structure-body">
                <div>
                  <b>لماذا هذه الخطوة؟</b>
                  <p>{step.whyAr}</p>
                </div>

                <div className="unit1-writing-skills__structure-question">
                  <b>اسأل نفسك:</b>
                  <p>{step.questionAr}</p>
                </div>
              </div>
            </details>
          ))}
        </div>

        <div className="unit1-writing-skills__structure-rule">
          <strong dir="ltr">
            Introduce → Background → Events → Significance → Present
          </strong>
          <span>
            الفكرة تبدأ بسبب التذكّر، ثم الخلفية، ثم الأحداث، ثم أهميتها،
            وأخيرًا علاقتها بالحاضر.
          </span>
        </div>
      </article>
      <Unit1WritingFinalTest />

    </section>
  )
}

export default Unit1WritingSkills
