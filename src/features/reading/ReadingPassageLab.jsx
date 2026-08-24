import { useMemo, useState } from 'react'

import {
  UNIT1_READING_PASSAGE,
} from './data/unit1ReadingPassage'

import { UNIT1_READING_FINAL_TEST } from './data/unit1ReadingFinalTest'

import './ReadingPassageLab.css'

const VIEW_MODE_GROUPS = Object.freeze([
  Object.freeze({
    id: 'learn',
    labelEn: 'LEARN',
    labelAr: 'افهم القطعة',
    modes: Object.freeze([
      Object.freeze({
        code: 'original',
        labelEn: 'Original',
        labelAr: 'النص الأصلي',
        icon: '📖',
      }),
      Object.freeze({
        code: 'assisted_reading',
        labelEn: 'Assisted Reading',
        labelAr: 'قراءة مساعدة',
        icon: '✨',
      }),
      Object.freeze({
        code: 'paragraph_explanation',
        labelEn: 'Explanation',
        labelAr: 'شرح الفقرة',
        icon: '🧠',
      }),
      Object.freeze({
        code: 'sentence_analysis',
        labelEn: 'Sentence by Sentence',
        labelAr: 'جملة بجملة',
        icon: '🧩',
      }),
    ]),
  }),

  Object.freeze({
    id: 'analyze',
    labelEn: 'ANALYZE',
    labelAr: 'حلّل القطعة',
    modes: Object.freeze([
      Object.freeze({
        code: 'main_idea',
        labelEn: 'Main Idea',
        labelAr: 'الفكرة الرئيسة',
        icon: '🎯',
      }),
      Object.freeze({
        code: 'key_words',
        labelEn: 'Key Words',
        labelAr: 'الكلمات المهمة',
        icon: '🔑',
      }),
      Object.freeze({
        code: 'references',
        labelEn: 'References',
        labelAr: 'الضمائر والمرجع',
        icon: '🔗',
      }),
      Object.freeze({
        code: 'evidence',
        labelEn: 'Evidence',
        labelAr: 'الجملة الدليلية',
        icon: '🔎',
      }),
    ]),
  }),

  Object.freeze({
    id: 'practice',
    labelEn: 'PRACTICE',
    labelAr: 'اختبر فهمك',
    modes: Object.freeze([
      Object.freeze({
        code: 'evidence_lock',
        labelEn: 'Evidence Lock',
        labelAr: 'اختر الدليل',
        icon: '🔒',
      }),
      Object.freeze({
        code: 'distractor_analyzer',
        labelEn: 'Distractor Analyzer',
        labelAr: 'حلّل الخيارات',
        icon: '🧪',
      }),
      Object.freeze({
        code: 'comprehensive_questions',
        labelEn: 'Full Test',
        labelAr: 'اختبار الفقرة',
        icon: '🏆',
      }),
      Object.freeze({
        code: 'passage_final_test',
        labelEn: 'Passage Final Test',
        labelAr: 'اختبار القطعة النهائي',
        icon: '🎓',
      }),
    ]),
  }),
])



function buildHighlightPattern(items) {
  const safeItems = items
    .filter(Boolean)
    .map((item) =>
      String(item).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      ),
    )
    .sort(
      (first, second) =>
        second.length - first.length,
    )

  if (!safeItems.length) {
    return null
  }

  return new RegExp(
    `\\b(${safeItems.join('|')})\\b`,
    'gi',
  )
}

function getReferenceItem(part, references) {
  return references.find(
    (item) =>
      item.expression.toLowerCase() ===
      String(part).toLowerCase(),
  )
}

function renderHighlightedText(
  text,
  mode,
  paragraph,
  activeSentenceId,
  selectedEvidenceId,
  evidenceChecked,
) {
  if (mode === 'evidence_lock') {
    if (!selectedEvidenceId) {
      return text
    }

    const selectedSentence =
      paragraph.learning.sentences.find(
        (sentence) =>
          sentence.id === selectedEvidenceId,
      )

    if (!selectedSentence) {
      return text
    }

    const pattern =
      buildHighlightPattern([
        selectedSentence.text,
      ])

    if (!pattern) return text

    return String(text)
      .split(pattern)
      .map((part, index) => {
        const isMatch =
          part.toLowerCase() ===
          selectedSentence.text.toLowerCase()

        return isMatch ? (
          <mark
            key={`${selectedSentence.id}-${index}`}
            className={
              evidenceChecked
                ? selectedEvidenceId ===
                  paragraph.learning.evidenceLock[0]
                    .correctSentenceId
                  ? 'reading-passage-lab__mark reading-passage-lab__mark--evidence-correct'
                  : 'reading-passage-lab__mark reading-passage-lab__mark--evidence-wrong'
                : 'reading-passage-lab__mark reading-passage-lab__mark--evidence-selected'
            }
          >
            {part}
          </mark>
        ) : (
          part
        )
      })
  }

  if (mode === 'assisted_reading') {
    const words =
      paragraph.learning.keyWords

    const expressions = words.map(
      (item) => item.word,
    )

    const pattern =
      buildHighlightPattern(expressions)

    if (!pattern) return text

    return String(text)
      .split(pattern)
      .map((part, index) => {
        const item = words.find(
          (wordItem) =>
            wordItem.word.toLowerCase() ===
            part.toLowerCase(),
        )

        if (!item) {
          return part
        }

        return (
          <span
            key={`${item.word}-${index}`}
            className="reading-passage-lab__assist-token"
          >
            <span
              className="reading-passage-lab__assist-meaning"
              dir="rtl"
            >
              {item.shortAr}
            </span>

            <mark className="reading-passage-lab__mark reading-passage-lab__mark--assisted">
              {part}
            </mark>
          </span>
        )
      })
  }

  if (mode === 'sentence_analysis') {
    const activeSentence =
      paragraph.learning.sentences.find(
        (sentence) =>
          sentence.id === activeSentenceId,
      )

    if (!activeSentence) return text

    const escapedSentence =
      String(activeSentence.text).replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      )

    const pattern = new RegExp(
      '(' + escapedSentence + ')',
      'gi',
    )

    return String(text)
      .split(pattern)
      .map((part, index) => {
        const isMatch =
          part.toLowerCase() ===
          activeSentence.text.toLowerCase()

        return isMatch ? (
          <mark
            key={`${activeSentence.id}-${index}`}
            className="reading-passage-lab__mark reading-passage-lab__mark--sentence"
          >
            {part}
          </mark>
        ) : (
          part
        )
      })
  }

  if (mode === 'key_words') {
    const words =
      paragraph.learning.keyWords.map(
        (item) => item.word,
      )

    const pattern =
      buildHighlightPattern(words)

    if (!pattern) return text

    return String(text)
      .split(pattern)
      .map((part, index) => {
        const isMatch = words.some(
          (word) =>
            word.toLowerCase() ===
            part.toLowerCase(),
        )

        return isMatch ? (
          <mark
            key={`${part}-${index}`}
            className="reading-passage-lab__mark reading-passage-lab__mark--keyword"
          >
            {part}
          </mark>
        ) : (
          part
        )
      })
  }

  if (mode === 'references') {
    const references =
      paragraph.learning.references

    const expressions = references.map(
      (item) => item.expression,
    )

    const pattern =
      buildHighlightPattern(expressions)

    if (!pattern) return text

    return String(text)
      .split(pattern)
      .map((part, index) => {
        const referenceItem =
          getReferenceItem(
            part,
            references,
          )

        if (!referenceItem) {
          return part
        }

        return (
          <span
            key={`${referenceItem.id}-${index}`}
            className="reading-passage-lab__reference-token"
          >
            <span
              className="reading-passage-lab__reference-meaning"
              dir="rtl"
            >
              {referenceItem.labelAr}
            </span>

            <mark className="reading-passage-lab__mark reading-passage-lab__mark--reference">
              {part}
            </mark>
          </span>
        )
      })
  }

  if (mode === 'evidence') {
    const evidenceSentences =
      paragraph.learning.evidence.map(
        (item) => item.sentence,
      )

    const pattern =
      buildHighlightPattern(
        evidenceSentences,
      )

    if (!pattern) return text

    return String(text)
      .split(pattern)
      .map((part, index) => {
        const isMatch =
          evidenceSentences.some(
            (sentence) =>
              sentence.toLowerCase() ===
              part.toLowerCase(),
          )

        return isMatch ? (
          <mark
            key={`${index}-evidence`}
            className="reading-passage-lab__mark reading-passage-lab__mark--evidence"
          >
            {part}
          </mark>
        ) : (
          part
        )
      })
  }

  return text
}

function ReadingPassageLab() {
  const [activeMode, setActiveMode] =
    useState('original')

  const [activeSentenceId, setActiveSentenceId] =
    useState('a-s1')

  const [selectedEvidenceId, setSelectedEvidenceId] =
    useState('')

  const [evidenceChecked, setEvidenceChecked] =
    useState(false)

  const [selectedDistractorOption, setSelectedDistractorOption] =
    useState('')

  const [distractorChecked, setDistractorChecked] =
    useState(false)

  const [comprehensiveAnswers, setComprehensiveAnswers] =
    useState({})

  const [comprehensiveChecked, setComprehensiveChecked] =
    useState({})

  const [activeComprehensiveQuestion, setActiveComprehensiveQuestion] =
    useState(0)

  const [finalTestAnswers, setFinalTestAnswers] =
    useState({})

  const [finalTestChecked, setFinalTestChecked] =
    useState({})

  const [activeFinalTestQuestion, setActiveFinalTestQuestion] =
    useState(0)
  const [activeParagraphIndex, setActiveParagraphIndex] =
    useState(0)

  const paragraph =
    UNIT1_READING_PASSAGE.paragraphs[
      activeParagraphIndex
    ]

  const renderedText = useMemo(
    () =>
      renderHighlightedText(
        paragraph.text,
        activeMode,
        paragraph,
        activeSentenceId,
        selectedEvidenceId,
        evidenceChecked,
      ),
    [
      activeMode,
      activeSentenceId,
      selectedEvidenceId,
      evidenceChecked,
      paragraph,
    ],
  )

  return (
    <section
      className="reading-passage-lab"
      dir="rtl"
    >
      <header className="reading-passage-lab__header">
        <div>
          <p className="reading-passage-lab__eyebrow">
            UNIT 1 · LESSON 5A
          </p>

          <h2 dir="ltr">
            {UNIT1_READING_PASSAGE.title}
          </h2>

          <p>
            Paragraph {paragraph.label} —{' '}
            {paragraph.title}
          </p>
        </div>

        <span className="reading-passage-lab__badge">
          PASSAGE LAB
        </span>
      </header>
      <div className="reading-passage-lab__paragraph-switcher">
        {UNIT1_READING_PASSAGE.paragraphs.map(
          (item, index) => (
            <button
              key={item.id}
              type="button"
              className={
                index === activeParagraphIndex
                  ? 'reading-passage-lab__paragraph-button reading-passage-lab__paragraph-button--active'
                  : 'reading-passage-lab__paragraph-button'
              }
              onClick={() => {
                setActiveParagraphIndex(index)

                setActiveSentenceId(
                  item.learning.sentences?.[0]?.id ||
                    '',
                )

                setSelectedEvidenceId('')
                setEvidenceChecked(false)

                setSelectedDistractorOption('')
                setDistractorChecked(false)

                setComprehensiveAnswers({})
                setComprehensiveChecked({})
                setActiveComprehensiveQuestion(0)

                setActiveMode('original')
              }}
            >
              <span className="reading-passage-lab__paragraph-icon">
                <b>{item.label}</b>
                <i aria-hidden="true">📖</i>
              </span>

              <span className="reading-passage-lab__paragraph-copy">
                <strong>
                  Paragraph {item.label}
                </strong>

                <small>
                  {item.title}
                </small>
              </span>
            </button>
          ),
        )}
      </div>

      <div className="reading-passage-lab__toolbar-shell">
        {VIEW_MODE_GROUPS.map((group) => (
          <section
            key={group.id}
            className={`reading-passage-lab__tool-group reading-passage-lab__tool-group--${group.id}`}
          >
            <div className="reading-passage-lab__tool-group-heading">
              <strong>{group.labelEn}</strong>
              <span>{group.labelAr}</span>
            </div>

            <div className="reading-passage-lab__tool-group-buttons">
              {group.modes.map((mode) => {
                const isActive =
                  mode.code === activeMode

                return (
                  <button
                    key={mode.code}
                    type="button"
                    className={
                      isActive
                        ? 'reading-passage-lab__premium-tab reading-passage-lab__premium-tab--active'
                        : 'reading-passage-lab__premium-tab'
                    }
                    onClick={() =>
                      setActiveMode(mode.code)
                    }
                  >
                    <span className="reading-passage-lab__premium-tab-icon">
                      {mode.icon}
                    </span>

                    <span className="reading-passage-lab__premium-tab-text">
                      <strong>
                        {mode.labelEn}
                      </strong>

                      <small>
                        {mode.labelAr}
                      </small>
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="reading-passage-lab__workspace">
        <article
          className="reading-passage-lab__passage"
          dir="ltr"
        >
          <div className="reading-passage-lab__paragraph-label">
            Paragraph {paragraph.label}
          </div>

          <p>
            {renderedText}
          </p>

          {activeMode === 'assisted_reading' && (
            <div
              className="reading-passage-lab__translation"
              dir="rtl"
            >
              <span>
                الترجمة العربية
              </span>

              <p>
                {paragraph.learning.translationAr}
              </p>
            </div>
          )}
        </article>

        <aside className="reading-passage-lab__analysis">
          {activeMode === 'original' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                اقرأ أولًا
              </span>

              <h3>
                افهم الفقرة قبل أن تبدأ بالأسئلة
              </h3>

              <p>
                اقرأ الفقرة مرة كاملة، ثم استخدم
                الأدوات في الأعلى لتكتشف الكلمات
                المهمة والمرجع والجملة الدليلية.
              </p>
            </>
          )}

          {activeMode === 'assisted_reading' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                ASSISTED READING
              </span>

              <h3>
                اقرأ وافهم بدون قاموس
              </h3>

              <p>
                المعنى العربي القصير يظهر فوق الكلمات والتعابير المهمة داخل النص، بينما تجد الترجمة الكاملة أسفل الفقرة.
              </p>

              <p>
                حاول أولًا قراءة الجملة الإنجليزية باستخدام المعاني المساعدة، ثم ارجع إلى الترجمة للتأكد من فهمك.
              </p>
            </>
          )}

          {activeMode === 'paragraph_explanation' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                PARAGRAPH EXPLANATION
              </span>

              <h3>
                شرح الفقرة
              </h3>

              <p>
                {paragraph.learning.explanationAr}
              </p>
            </>
          )}

          {activeMode === 'sentence_analysis' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                SENTENCE BY SENTENCE
              </span>

              <h3>
                افهم وظيفة كل جملة
              </h3>

              <div className="reading-passage-lab__sentence-list">
                {paragraph.learning.sentences.map(
                  (sentence, index) => {
                    const isActive =
                      sentence.id ===
                      activeSentenceId

                    return (
                      <button
                        key={sentence.id}
                        type="button"
                        className={
                          isActive
                            ? 'reading-passage-lab__sentence-button reading-passage-lab__sentence-button--active'
                            : 'reading-passage-lab__sentence-button'
                        }
                        onClick={() =>
                          setActiveSentenceId(
                            sentence.id,
                          )
                        }
                      >
                        <span>
                          Sentence {index + 1}
                        </span>

                        <strong>
                          {sentence.roleAr}
                        </strong>
                      </button>
                    )
                  },
                )}
              </div>

              {paragraph.learning.sentences
                .filter(
                  (sentence) =>
                    sentence.id ===
                    activeSentenceId,
                )
                .map((sentence) => (
                  <div
                    key={sentence.id}
                    className="reading-passage-lab__sentence-analysis"
                  >
                    <span>
                      {sentence.roleEn}
                    </span>

                    <h4>
                      الترجمة
                    </h4>

                    <p>
                      {sentence.translationAr}
                    </p>

                    <h4>
                      لماذا وضع الكاتب هذه الجملة هنا؟
                    </h4>

                    <p>
                      {sentence.explanationAr}
                    </p>
                  </div>
                ))}
            </>
          )}

          {activeMode === 'main_idea' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                MAIN IDEA
              </span>

              <h3>الفكرة الرئيسة</h3>

              <div className="reading-passage-lab__main-idea">
                <p dir="ltr">
                  {paragraph.learning.mainIdeaEn}
                </p>

                <p dir="rtl">
                  {paragraph.learning.mainIdeaAr}
                </p>
              </div>
            </>
          )}

          {activeMode === 'key_words' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                KEY WORDS
              </span>

              <h3>الكلمات المهمة</h3>

              <div className="reading-passage-lab__word-list">
                {paragraph.learning.keyWords.map(
                  (item) => (
                    <div key={item.word}>
                      <strong dir="ltr">
                        {item.word}
                      </strong>

                      <span>
                        {item.meaningAr}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </>
          )}

          {activeMode === 'references' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                REFERENCES
              </span>

              <h3>
                على ماذا تعود الكلمات؟
              </h3>

              <div className="reading-passage-lab__watch-out">
                <strong>⚠️ Watch Out</strong>

                <p>
                  ليس كل <span dir="ltr">that</span> يعود على اسم.
                  أحيانًا يكون فقط أداة ربط داخل الجملة.
                </p>

                <div className="reading-passage-lab__watch-out-examples">
                  <div>
                    <span dir="ltr">who</span>
                    <small>→ two scientists</small>
                  </div>

                  <div>
                    <span dir="ltr">both</span>
                    <small>→ two scientists</small>
                  </div>

                  <div>
                    <span dir="ltr">that</span>
                    <small>قد تكون أداة ربط وليست Reference</small>
                  </div>
                </div>
              </div>

              <div className="reading-passage-lab__reference-list">
                {paragraph.learning.references.map(
                  (item) => (
                    <div
                      key={item.id}
                    >
                      <div className="reading-passage-lab__reference-card-head">
                        <strong dir="ltr">
                          {item.expression}
                        </strong>

                        <small>
                          {item.labelAr}
                        </small>
                      </div>

                      <span className="reading-passage-lab__reference-type">
                        {item.type.replaceAll('_', ' ')}
                      </span>

                      <p>
                        {item.refersToAr}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </>
          )}

                    {activeMode === 'comprehensive_questions' && (
            <>
              {(() => {
                const questions =
                  paragraph.learning.comprehensiveQuestions

                const question =
                  questions[activeComprehensiveQuestion]

                const selected =
                  comprehensiveAnswers[question.id]

                const checked =
                  comprehensiveChecked[question.id]

                const isCorrect =
                  selected === question.correctOptionId

                const answeredCount =
                  questions.filter(
                    (item) =>
                      Boolean(
                        comprehensiveChecked[item.id],
                      ),
                  ).length

                const correctCount =
                  questions.filter(
                    (item) =>
                      comprehensiveChecked[item.id] &&
                      comprehensiveAnswers[item.id] ===
                        item.correctOptionId,
                  ).length

                const evidenceSentence =
                  paragraph.learning.sentences.find(
                    (sentence) =>
                      sentence.id ===
                      question.evidenceSentenceId,
                  )

                return (
                  <>
                    <span className="reading-passage-lab__analysis-label">
                      PARAGRAPH {paragraph.label} • FULL TEST
                    </span>

                    <h3>
                      Comprehensive Questions
                    </h3>

                    <div className="reading-passage-lab__full-test-progress">
                      {questions.map((item, index) => {
                        const itemChecked =
                          comprehensiveChecked[item.id]

                        const itemCorrect =
                          itemChecked &&
                          comprehensiveAnswers[item.id] ===
                            item.correctOptionId

                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={[
                              'reading-passage-lab__full-test-dot',
                              index === activeComprehensiveQuestion
                                ? 'reading-passage-lab__full-test-dot--active'
                                : '',
                              itemChecked
                                ? itemCorrect
                                  ? 'reading-passage-lab__full-test-dot--correct'
                                  : 'reading-passage-lab__full-test-dot--wrong'
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() =>
                              setActiveComprehensiveQuestion(index)
                            }
                          >
                            {index + 1}
                          </button>
                        )
                      })}
                    </div>

                    <div className="reading-passage-lab__full-test-card">
                      <div className="reading-passage-lab__full-test-meta">
                        <span>
                          Question {activeComprehensiveQuestion + 1}
                          {' / '}
                          {questions.length}
                        </span>

                        <strong>
                          {question.skillLabelEn}
                        </strong>

                        <small>
                          {question.skillLabelAr}
                        </small>
                      </div>

                      <h3 dir="ltr">
                        {question.question}
                      </h3>

                      <div className="reading-passage-lab__full-test-options">
                        {question.options.map((option) => {
                          const isSelected =
                            selected === option.id

                          const isAnswer =
                            option.id ===
                            question.correctOptionId

                          let className =
                            'reading-passage-lab__full-test-option'

                          if (isSelected) {
                            className +=
                              ' reading-passage-lab__full-test-option--selected'
                          }

                          if (checked && isAnswer) {
                            className +=
                              ' reading-passage-lab__full-test-option--correct'
                          }

                          if (
                            checked &&
                            isSelected &&
                            !isAnswer
                          ) {
                            className +=
                              ' reading-passage-lab__full-test-option--wrong'
                          }

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={className}
                              disabled={Boolean(checked)}
                              onClick={() =>
                                setComprehensiveAnswers(
                                  (current) => ({
                                    ...current,
                                    [question.id]: option.id,
                                  }),
                                )
                              }
                            >
                              <span>
                                {option.id.toUpperCase()}
                              </span>

                              <strong dir="ltr">
                                {option.text}
                              </strong>
                            </button>
                          )
                        })}
                      </div>

                      {!checked && (
                        <button
                          type="button"
                          className="reading-passage-lab__full-test-check"
                          disabled={!selected}
                          onClick={() =>
                            setComprehensiveChecked(
                              (current) => ({
                                ...current,
                                [question.id]: true,
                              }),
                            )
                          }
                        >
                          Check Answer
                        </button>
                      )}

                      {checked && (
                        <div
                          className={
                            isCorrect
                              ? 'reading-passage-lab__full-test-feedback reading-passage-lab__full-test-feedback--correct'
                              : 'reading-passage-lab__full-test-feedback reading-passage-lab__full-test-feedback--wrong'
                          }
                        >
                          <strong>
                            {isCorrect
                              ? '✓ Correct'
                              : '✕ Not quite'}
                          </strong>

                          <p>
                            {question.explanationAr}
                          </p>

                          {evidenceSentence && (
                            <div className="reading-passage-lab__full-test-evidence">
                              <span>
                                🔎 Evidence
                              </span>

                              <p dir="ltr">
                                {evidenceSentence.text}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {answeredCount === questions.length && (
                        <div className="reading-passage-lab__skill-summary">
                          <div className="reading-passage-lab__skill-summary-heading">
                            <div>
                              <span>
                                SKILL RESULTS
                              </span>

                              <small>
                                نتائج المهارات
                              </small>
                            </div>

                            <strong>
                              {correctCount}/{questions.length}
                            </strong>
                          </div>

                          {Object.values(
                            questions.reduce(
                              (results, item) => {
                                const key = item.skill

                                if (!results[key]) {
                                  results[key] = {
                                    key,
                                    labelEn:
                                      item.skillLabelEn,
                                    labelAr:
                                      item.skillLabelAr,
                                    correct: 0,
                                    total: 0,
                                  }
                                }

                                results[key].total += 1

                                if (
                                  comprehensiveChecked[
                                    item.id
                                  ] &&
                                  comprehensiveAnswers[
                                    item.id
                                  ] ===
                                    item.correctOptionId
                                ) {
                                  results[key].correct += 1
                                }

                                return results
                              },
                              {},
                            ),
                          ).map((result) => (
                            <div
                              key={result.key}
                              className="reading-passage-lab__skill-result"
                            >
                              <div>
                                <strong>
                                  {result.labelEn}
                                </strong>

                                <small>
                                  {result.labelAr}
                                </small>
                              </div>

                              <span>
                                {result.correct}/{result.total}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="reading-passage-lab__full-test-navigation">
                        <button
                          type="button"
                          disabled={
                            activeComprehensiveQuestion === 0
                          }
                          onClick={() =>
                            setActiveComprehensiveQuestion(
                              (current) =>
                                Math.max(0, current - 1),
                            )
                          }
                        >
                          Previous
                        </button>

                        <span>
                          {correctCount}/{answeredCount}
                        </span>

                        <button
                          type="button"
                          disabled={
                            activeComprehensiveQuestion ===
                            questions.length - 1
                          }
                          onClick={() =>
                            setActiveComprehensiveQuestion(
                              (current) =>
                                Math.min(
                                  questions.length - 1,
                                  current + 1,
                                ),
                            )
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )
              })()}
            </>
          )}
{activeMode === 'passage_final_test' && (
  <>
    {(() => {
      const questions = UNIT1_READING_FINAL_TEST.questions
      const question = questions[activeFinalTestQuestion]
      const selected = finalTestAnswers[question.id]
      const checked = finalTestChecked[question.id]
      const isCorrect = selected === question.correctOptionId
      const answeredCount = questions.filter(
        (item) => Boolean(finalTestChecked[item.id]),
      ).length
      const correctCount = questions.filter(
        (item) =>
          finalTestChecked[item.id] &&
          finalTestAnswers[item.id] === item.correctOptionId,
      ).length

      return (
        <>
          <span className="reading-passage-lab__analysis-label">
            PASSAGE FINAL TEST
          </span>

          <h3>{UNIT1_READING_FINAL_TEST.labelAr}</h3>

          <div className="reading-passage-lab__full-test-progress">
            {questions.map((item, index) => {
              const itemChecked = finalTestChecked[item.id]
              const itemCorrect =
                itemChecked &&
                finalTestAnswers[item.id] === item.correctOptionId

              return (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    'reading-passage-lab__full-test-dot',
                    index === activeFinalTestQuestion
                      ? 'reading-passage-lab__full-test-dot--active'
                      : '',
                    itemChecked
                      ? itemCorrect
                        ? 'reading-passage-lab__full-test-dot--correct'
                        : 'reading-passage-lab__full-test-dot--wrong'
                      : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setActiveFinalTestQuestion(index)}
                >
                  {index + 1}
                </button>
              )
            })}
          </div>

          <div className="reading-passage-lab__full-test-card">
            <div className="reading-passage-lab__full-test-meta">
              <span>
                Question {activeFinalTestQuestion + 1} / {questions.length}
              </span>
              <strong>{question.skillLabelEn}</strong>
              <small>{question.skillLabelAr}</small>
            </div>

            <h3 dir="ltr">{question.question}</h3>

            <div className="reading-passage-lab__full-test-options">
              {question.options.map((option) => {
                const isSelected = selected === option.id
                const isAnswer = option.id === question.correctOptionId
                let className = 'reading-passage-lab__full-test-option'

                if (isSelected) {
                  className += ' reading-passage-lab__full-test-option--selected'
                }
                if (checked && isAnswer) {
                  className += ' reading-passage-lab__full-test-option--correct'
                }
                if (checked && isSelected && !isAnswer) {
                  className += ' reading-passage-lab__full-test-option--wrong'
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={className}
                    disabled={Boolean(checked)}
                    onClick={() =>
                      setFinalTestAnswers((current) => ({
                        ...current,
                        [question.id]: option.id,
                      }))
                    }
                  >
                    <span>{option.id.toUpperCase()}</span>
                    <strong dir="ltr">{option.text}</strong>
                  </button>
                )
              })}
            </div>

            {!checked && (
              <button
                type="button"
                className="reading-passage-lab__full-test-check"
                disabled={!selected}
                onClick={() =>
                  setFinalTestChecked((current) => ({
                    ...current,
                    [question.id]: true,
                  }))
                }
              >
                Check Answer
              </button>
            )}

            {checked && (
              <div
                className={
                  isCorrect
                    ? 'reading-passage-lab__full-test-feedback reading-passage-lab__full-test-feedback--correct'
                    : 'reading-passage-lab__full-test-feedback reading-passage-lab__full-test-feedback--wrong'
                }
              >
                <strong>{isCorrect ? 'Correct' : 'Not quite'}</strong>
                <p>{question.explanationAr}</p>
              </div>
            )}

            <div className="reading-passage-lab__full-test-navigation">
              <button
                type="button"
                disabled={activeFinalTestQuestion === 0}
                onClick={() =>
                  setActiveFinalTestQuestion((current) =>
                    Math.max(0, current - 1),
                  )
                }
              >
                Previous
              </button>

              <span>{correctCount}/{answeredCount}</span>

              <button
                type="button"
                disabled={activeFinalTestQuestion === questions.length - 1}
                onClick={() =>
                  setActiveFinalTestQuestion((current) =>
                    Math.min(questions.length - 1, current + 1),
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </>
      )
    })()}
  </>
)}
{activeMode === 'distractor_analyzer' && (
            <>
              {(() => {
                const question =
                  paragraph.learning.distractorQuestions[0]

                const selectedOption =
                  question.options.find(
                    (option) =>
                      option.id ===
                      selectedDistractorOption,
                  )

                const isCorrect =
                  selectedDistractorOption ===
                  question.correctOptionId

                return (
                  <>
                    <span className="reading-passage-lab__analysis-label">
                      DISTRACTOR ANALYZER
                    </span>

                    <h3>
                      لماذا الصحيح صحيح والخطأ خطأ؟
                    </h3>

                    <div className="reading-passage-lab__distractor-question">
                      <strong dir="ltr">
                        {question.questionEn}
                      </strong>

                      <p>
                        {question.questionAr}
                      </p>
                    </div>

                    <div className="reading-passage-lab__evidence-hint">
                      <span>💡 Strategy</span>

                      <p>
                        {question.strategyAr}
                      </p>
                    </div>

                    <div className="reading-passage-lab__distractor-options">
                      {question.options.map(
                        (option) => {
                          const isSelected =
                            option.id ===
                            selectedDistractorOption

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={
                                isSelected
                                  ? 'reading-passage-lab__distractor-option reading-passage-lab__distractor-option--selected'
                                  : 'reading-passage-lab__distractor-option'
                              }
                              onClick={() => {
                                setSelectedDistractorOption(
                                  option.id,
                                )
                                setDistractorChecked(
                                  false,
                                )
                              }}
                            >
                              <span>
                                {option.id.toUpperCase()}
                              </span>

                              <strong dir="ltr">
                                {option.text}
                              </strong>
                            </button>
                          )
                        },
                      )}
                    </div>

                    <button
                      type="button"
                      className="reading-passage-lab__evidence-check"
                      disabled={
                        !selectedDistractorOption
                      }
                      onClick={() =>
                        setDistractorChecked(true)
                      }
                    >
                      حلّل إجابتي
                    </button>

                    {distractorChecked &&
                      selectedOption && (
                        <>
                          <div
                            className={
                              isCorrect
                                ? 'reading-passage-lab__evidence-feedback reading-passage-lab__evidence-feedback--correct'
                                : 'reading-passage-lab__evidence-feedback reading-passage-lab__evidence-feedback--wrong'
                            }
                          >
                            <strong>
                              {isCorrect
                                ? '✓ إجابة صحيحة'
                                : '✕ هذا مشتت'}
                            </strong>

                            <p>
                              {
                                selectedOption.explanationAr
                              }
                            </p>
                          </div>

                          <div className="reading-passage-lab__distractor-breakdown">
                            <span>
                              تحليل جميع الخيارات
                            </span>

                            {question.options.map(
                              (option) => (
                                <div
                                  key={
                                    option.id
                                  }
                                  className={
                                    option.verdict ===
                                    'correct'
                                      ? 'reading-passage-lab__distractor-row reading-passage-lab__distractor-row--correct'
                                      : 'reading-passage-lab__distractor-row'
                                  }
                                >
                                  <strong>
                                    {option.id.toUpperCase()}
                                  </strong>

                                  <div>
                                    <span>
                                      {
                                        option.labelAr
                                      }
                                    </span>

                                    <p>
                                      {
                                        option.explanationAr
                                      }
                                    </p>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </>
                      )}
                  </>
                )
              })()}
            </>
          )}

          {activeMode === 'evidence_lock' && (
            <>
              {(() => {
                const question =
                  paragraph.learning.evidenceLock[0]

                const isCorrect =
                  selectedEvidenceId ===
                  question.correctSentenceId

                return (
                  <>
                    <span className="reading-passage-lab__analysis-label">
                      EVIDENCE LOCK
                    </span>

                    <h3>
                      اختر الدليل بنفسك
                    </h3>

                    <div className="reading-passage-lab__evidence-question">
                      <strong dir="ltr">
                        {question.questionEn}
                      </strong>

                      <p>
                        {question.questionAr}
                      </p>
                    </div>

                    <div className="reading-passage-lab__evidence-hint">
                      <span>💡 Strategy</span>

                      <p>
                        {question.strategyAr}
                      </p>
                    </div>

                    <div className="reading-passage-lab__evidence-options">
                      {paragraph.learning.sentences.map(
                        (sentence, index) => {
                          const isSelected =
                            sentence.id ===
                            selectedEvidenceId

                          return (
                            <button
                              key={sentence.id}
                              type="button"
                              className={
                                isSelected
                                  ? 'reading-passage-lab__evidence-option reading-passage-lab__evidence-option--selected'
                                  : 'reading-passage-lab__evidence-option'
                              }
                              onClick={() => {
                                setSelectedEvidenceId(
                                  sentence.id,
                                )
                                setEvidenceChecked(
                                  false,
                                )
                              }}
                            >
                              <span>
                                {index + 1}
                              </span>

                              <small>
                                {sentence.roleAr}
                              </small>
                            </button>
                          )
                        },
                      )}
                    </div>

                    <button
                      type="button"
                      className="reading-passage-lab__evidence-check"
                      disabled={!selectedEvidenceId}
                      onClick={() =>
                        setEvidenceChecked(true)
                      }
                    >
                      تحقق من الدليل
                    </button>

                    {evidenceChecked && (
                      <div
                        className={
                          isCorrect
                            ? 'reading-passage-lab__evidence-feedback reading-passage-lab__evidence-feedback--correct'
                            : 'reading-passage-lab__evidence-feedback reading-passage-lab__evidence-feedback--wrong'
                        }
                      >
                        <strong>
                          {isCorrect
                            ? '✓ Evidence صحيح'
                            : '✕ حاول مرة أخرى'}
                        </strong>

                        <p>
                          {isCorrect
                            ? question.successAr
                            : question.retryAr}
                        </p>
                      </div>
                    )}
                  </>
                )
              })()}
            </>
          )}

          {activeMode === 'evidence' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                EVIDENCE
              </span>

              <h3>
                أين الجملة الدليلية؟
              </h3>

              <div className="reading-passage-lab__evidence-list">
                {paragraph.learning.evidence.map(
                  (item) => (
                    <div key={item.skill}>
                      <strong>
                        {item.skill ===
                        'main_idea'
                          ? 'Main Idea'
                          : "Writer's Purpose"}
                      </strong>

                      <p>
                        {item.reasonAr}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}

export default ReadingPassageLab
