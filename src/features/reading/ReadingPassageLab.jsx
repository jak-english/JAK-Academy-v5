import { useMemo, useState } from 'react'

import {
  UNIT1_READING_PASSAGE,
} from './data/unit1ReadingPassage'

import './ReadingPassageLab.css'

const VIEW_MODES = Object.freeze([
  Object.freeze({
    code: 'original',
    labelEn: 'Original',
    labelAr: 'النص الأصلي',
  }),
  Object.freeze({
    code: 'assisted_reading',
    labelEn: 'Assisted Reading',
    labelAr: 'قراءة مساعدة',
  }),
  Object.freeze({
    code: 'paragraph_explanation',
    labelEn: 'Paragraph Explanation',
    labelAr: 'شرح الفقرة',
  }),
  Object.freeze({
    code: 'main_idea',
    labelEn: 'Main Idea',
    labelAr: 'الفكرة الرئيسة',
  }),
  Object.freeze({
    code: 'key_words',
    labelEn: 'Key Words',
    labelAr: 'الكلمات المهمة',
  }),
  Object.freeze({
    code: 'references',
    labelEn: 'References',
    labelAr: 'الضمائر والمرجع',
  }),
  Object.freeze({
    code: 'evidence',
    labelEn: 'Evidence',
    labelAr: 'الجملة الدليلية',
  }),
])

function escapeRegExp(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function buildHighlightPattern(items) {
  const values = items
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)

  if (values.length === 0) {
    return null
  }

  return new RegExp(
    `(${values.map(escapeRegExp).join('|')})`,
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
) {
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

  const paragraph =
    UNIT1_READING_PASSAGE.paragraphs[0]

  const renderedText = useMemo(
    () =>
      renderHighlightedText(
        paragraph.text,
        activeMode,
        paragraph,
      ),
    [activeMode, paragraph],
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

      <div className="reading-passage-lab__toolbar">
        {VIEW_MODES.map((mode) => {
          const isActive =
            mode.code === activeMode

          return (
            <button
              key={mode.code}
              type="button"
              className={
                isActive
                  ? 'reading-passage-lab__tab reading-passage-lab__tab--active'
                  : 'reading-passage-lab__tab'
              }
              onClick={() =>
                setActiveMode(mode.code)
              }
            >
              <strong>
                {mode.labelEn}
              </strong>

              <small>
                {mode.labelAr}
              </small>
            </button>
          )
        })}
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
                الترجمة العربية
              </h3>

              <p>
                {paragraph.learning.translationAr}
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

          {activeMode === 'main_idea' && (
            <>
              <span className="reading-passage-lab__analysis-label">
                MAIN IDEA
              </span>

              <h3>الفكرة الرئيسة</h3>

              <p>
                {
                  paragraph.learning
                    .mainIdeaAr
                }
              </p>
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