import { useState } from 'react'

import './GrammarLessonRenderer.css'


function GrammarFunctionExplorer({
  item,
}) {
  const functions = Array.isArray(
    item?.functions,
  )
    ? item.functions
    : []

  const [activeIndex, setActiveIndex] =
    useState(0)

  const activeFunction =
    functions[activeIndex] || functions[0]

  const examples = Array.isArray(
    activeFunction?.examples,
  )
    ? activeFunction.examples
    : []

  const [exampleIndex, setExampleIndex] =
    useState(0)

  const activeExample =
    examples[exampleIndex] || examples[0]

  function chooseFunction(index) {
    setActiveIndex(index)
    setExampleIndex(0)
  }

  function showPreviousExample() {
    if (examples.length <= 1) {
      return
    }

    setExampleIndex((current) =>
      current === 0
        ? examples.length - 1
        : current - 1,
    )
  }

  function showNextExample() {
    if (examples.length <= 1) {
      return
    }

    setExampleIndex((current) =>
      current === examples.length - 1
        ? 0
        : current + 1,
    )
  }

  if (!activeFunction) {
    return null
  }

  return (
    <div className="grammar-explorer">
      <div className="grammar-explorer__tabs">
        {functions.map((fn, index) => (
          <button
            type="button"
            className={
              index === activeIndex
                ? 'grammar-explorer__tab grammar-explorer__tab--active'
                : 'grammar-explorer__tab'
            }
            key={`${item.title}-${index}`}
            onClick={() =>
              chooseFunction(index)
            }
          >
            <span>{index + 1}</span>
            {fn.label || `Function ${index + 1}`}
          </button>
        ))}
      </div>

      <div className="grammar-explorer__panel">
        <div className="grammar-explorer__function">
          <small>WHEN DO WE USE IT?</small>

          <strong>
            {activeFunction.en}
          </strong>

          {activeFunction.ar && (
            <p
              dir="rtl"
              lang="ar"
            >
              {activeFunction.ar}
            </p>
          )}
        </div>

        {activeFunction.signal && (
          <div className="grammar-explorer__clue">
            <small>KEY CLUE</small>
            <strong>
              {activeFunction.signal}
            </strong>
          </div>
        )}

        {activeExample && (
          <div className="grammar-explorer__example">
            <div className="grammar-explorer__example-head">
              <small>EXAMPLE</small>

              <span>
                {exampleIndex + 1} /{' '}
                {examples.length}
              </span>
            </div>

            <strong>
              {activeExample.en}
            </strong>

            {activeExample.ar && (
              <p
                dir="rtl"
                lang="ar"
              >
                {activeExample.ar}
              </p>
            )}

            {examples.length > 1 && (
              <div className="grammar-explorer__controls">
                <button
                  type="button"
                  onClick={
                    showPreviousExample
                  }
                >
                  ← Previous
                </button>

                <div className="grammar-explorer__dots">
                  {examples.map(
                    (_, index) => (
                      <button
                        type="button"
                        aria-label={`Example ${
                          index + 1
                        }`}
                        className={
                          index ===
                          exampleIndex
                            ? 'grammar-explorer__dot grammar-explorer__dot--active'
                            : 'grammar-explorer__dot'
                        }
                        key={index}
                        onClick={() =>
                          setExampleIndex(
                            index,
                          )
                        }
                      />
                    ),
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    showNextExample
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GrammarCompareLab({
  comparisons,
}) {
  const [activeIndex, setActiveIndex] =
    useState(0)

  const [showWhy, setShowWhy] =
    useState(false)

  const [challengeAnswer, setChallengeAnswer] =
    useState(null)

  const comparison =
    comparisons[activeIndex] ||
    comparisons[0]

  if (!comparison) {
    return null
  }

  function chooseComparison(index) {
    setActiveIndex(index)
    setShowWhy(false)
    setChallengeAnswer(null)
  }

  const leftTitle =
    comparison.leftTitle ||
    comparison.left?.label

  const leftExample =
    comparison.leftExample ||
    comparison.left?.example

  const leftExampleAr =
    comparison.leftExampleAr ||
    comparison.left?.exampleAr

  const leftFocus =
    comparison.leftFocus ||
    comparison.left?.focus

  const rightTitle =
    comparison.rightTitle ||
    comparison.right?.label

  const rightExample =
    comparison.rightExample ||
    comparison.right?.example

  const rightExampleAr =
    comparison.rightExampleAr ||
    comparison.right?.exampleAr

  const rightFocus =
    comparison.rightFocus ||
    comparison.right?.focus

  return (
    <section className="grammar-section">
      <div className="grammar-section__heading">
        <span>05</span>

        <div>
          <small>COMPARE</small>
          <h2>Compare Lab</h2>
        </div>
      </div>

      <div className="grammar-compare-lab">
        <div className="grammar-compare-lab__tabs">
          {comparisons.map(
            (item, index) => (
              <button
                type="button"
                key={
                  item.id ||
                  item.title ||
                  index
                }
                className={
                  index === activeIndex
                    ? 'grammar-compare-lab__tab grammar-compare-lab__tab--active'
                    : 'grammar-compare-lab__tab'
                }
                onClick={() =>
                  chooseComparison(index)
                }
              >
                <span>
                  {index + 1}
                </span>

                {item.title ||
                  `Comparison ${index + 1}`}
              </button>
            ),
          )}
        </div>

        <article className="grammar-compare-lab__stage">
          <div className="grammar-compare-lab__stage-head">
            <div>
              <small>COMPARE THE FOCUS</small>

              <h3>
                {comparison.title}
              </h3>
            </div>

            <span className="grammar-compare-lab__vs">
              VS
            </span>
          </div>

          {comparison.question && (
            <div className="grammar-compare-lab__question">
              <small>ASK YOURSELF</small>
              <strong>
                {comparison.question}
              </strong>
            </div>
          )}

          <div className="grammar-compare-lab__choices">
            <div className="grammar-compare-lab__choice grammar-compare-lab__choice--left">
              <span className="grammar-compare-lab__tense">
                {leftTitle}
              </span>

              <strong className="grammar-compare-lab__sentence">
                {leftExample}
              </strong>

              {leftExampleAr && (
                <p
                  className="grammar-compare-lab__arabic"
                  dir="rtl"
                  lang="ar"
                >
                  {leftExampleAr}
                </p>
              )}

              {showWhy && leftFocus && (
                <div className="grammar-compare-lab__focus">
                  <small>FOCUS</small>
                  <p>{leftFocus}</p>
                </div>
              )}
            </div>

            <div className="grammar-compare-lab__choice grammar-compare-lab__choice--right">
              <span className="grammar-compare-lab__tense">
                {rightTitle}
              </span>

              <strong className="grammar-compare-lab__sentence">
                {rightExample}
              </strong>

              {rightExampleAr && (
                <p
                  className="grammar-compare-lab__arabic"
                  dir="rtl"
                  lang="ar"
                >
                  {rightExampleAr}
                </p>
              )}

              {showWhy && rightFocus && (
                <div className="grammar-compare-lab__focus">
                  <small>FOCUS</small>
                  <p>{rightFocus}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grammar-compare-lab__footer">
            <button
              type="button"
              className="grammar-compare-lab__why"
              onClick={() =>
                setShowWhy(
                  (current) => !current,
                )
              }
            >
              {showWhy
                ? 'Hide Why'
                : 'Why?'}
            </button>

            {showWhy &&
              comparison.tip && (
                <div className="grammar-compare-lab__tip">
                  <small>JAK KEY</small>
                  <strong>
                    {comparison.tip}
                  </strong>
                </div>
              )}
          </div>

          <div className="grammar-compare-challenge">
            <div className="grammar-compare-challenge__head">
              <div>
                <small>QUICK CHALLENGE</small>
                <strong>
                  Which tense matches this focus?
                </strong>
              </div>

              <span>1 STEP</span>
            </div>

            <div className="grammar-compare-challenge__prompt">
              {activeIndex % 2 === 0
                ? rightFocus
                : leftFocus}
            </div>

            <div className="grammar-compare-challenge__answers">
              <button
                type="button"
                className={
                  challengeAnswer === 'left'
                    ? 'grammar-compare-challenge__answer grammar-compare-challenge__answer--selected'
                    : 'grammar-compare-challenge__answer'
                }
                onClick={() =>
                  setChallengeAnswer('left')
                }
              >
                {leftTitle}
              </button>

              <button
                type="button"
                className={
                  challengeAnswer === 'right'
                    ? 'grammar-compare-challenge__answer grammar-compare-challenge__answer--selected'
                    : 'grammar-compare-challenge__answer'
                }
                onClick={() =>
                  setChallengeAnswer('right')
                }
              >
                {rightTitle}
              </button>
            </div>

            {challengeAnswer && (
              <div
                className={
                  challengeAnswer ===
                  (activeIndex % 2 === 0
                    ? 'right'
                    : 'left')
                    ? 'grammar-compare-challenge__feedback grammar-compare-challenge__feedback--correct'
                    : 'grammar-compare-challenge__feedback grammar-compare-challenge__feedback--wrong'
                }
              >
                <strong>
                  {challengeAnswer ===
                  (activeIndex % 2 === 0
                    ? 'right'
                    : 'left')
                    ? 'Correct ✓'
                    : 'Not quite'}
                </strong>

                <p>
                  {challengeAnswer ===
                  (activeIndex % 2 === 0
                    ? 'right'
                    : 'left')
                    ? 'You matched the tense to the meaning, not just to a keyword.'
                    : `Look at the focus again. The better choice is ${
                        activeIndex % 2 === 0
                          ? rightTitle
                          : leftTitle
                      }.`
                  }
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

function GrammarTenseFamily({
  group,
}) {
  const items = Array.isArray(
    group?.items,
  )
    ? group.items
    : []

  const [activeIndex, setActiveIndex] =
    useState(0)

  const activeItem =
    items[activeIndex] || items[0]

  if (!activeItem) {
    return null
  }

  const theme =
    group.theme || 'continuous'

  return (
    <section className="grammar-section">
      <div className="grammar-section__heading">
        <span>
          {group.number || '02'}
        </span>

        <div>
          <small>
            {group.label || 'LEARN'}
          </small>

          <h2>{group.title}</h2>
        </div>
      </div>

      <div
        className={`grammar-family-tabs grammar-family-tabs--${theme}`}
      >
        {items.map((item, index) => (
          <button
            type="button"
            key={
              item.skillCode ||
              item.title ||
              index
            }
            className={
              index === activeIndex
                ? 'grammar-family-tabs__button grammar-family-tabs__button--active'
                : 'grammar-family-tabs__button'
            }
            onClick={() =>
              setActiveIndex(index)
            }
          >
            <span>
              {index + 1}
            </span>

            <strong>
              {item.timeline ||
                item.title}
            </strong>
          </button>
        ))}
      </div>

      <div className="grammar-tense-grid">
        <article
          className={`grammar-tense-card grammar-tense-card--${theme}`}
        >
          <div className="grammar-tense-card__top">
            <span>
              {activeItem.timeline ||
                'TENSE'}
            </span>

            <strong
              className={`grammar-tense-card__title grammar-tense-card__title--${theme}`}
            >
              {activeItem.title}
            </strong>
          </div>

          {activeItem.form && (
            <div className="grammar-formula">
              {activeItem.form}
            </div>
          )}

          {Array.isArray(
            activeItem.functions,
          ) &&
            activeItem.functions.length >
              0 && (
              <GrammarFunctionExplorer
                key={
                  activeItem.skillCode ||
                  activeItem.title
                }
                item={activeItem}
              />
            )}
        </article>
      </div>
    </section>
  )
}
function GrammarLessonRenderer({
  content,
}) {
  const grammar =
    content?.grammar &&
    typeof content.grammar === 'object'
      ? content.grammar
      : null

  if (!grammar) {
    return (
      <div className="grammar-lesson grammar-lesson--empty">
        <div className="grammar-lesson__empty-icon">
          G
        </div>

        <strong>
          Grammar Intelligence is being prepared
        </strong>

        <p>
          The lesson structure is ready. Official
          grammar content will appear here next.
        </p>
      </div>
    )
  }

  const tenseGroups = Array.isArray(
    grammar.tenseGroups,
  )
    ? grammar.tenseGroups
    : []

  const comparisons = Array.isArray(
    grammar.comparisons,
  )
    ? grammar.comparisons
    : []

  return (
    <div className="grammar-lesson">
      <section className="grammar-hero">
        <div className="grammar-hero__eyebrow">
          JAK GRAMMAR INTELLIGENCE
        </div>

        <h1>
          {grammar.title ||
            'Continuous & Perfect Tenses'}
        </h1>

        <p>
          {grammar.subtitle ||
            'Understand the timeline. Choose the tense. Master the contrast.'}
        </p>

        <div className="grammar-hero__path">
          <span>Explore</span>
          <span>Understand</span>
          <span>Compare</span>
          <span>Practise</span>
          <span>Master</span>
        </div>
      </section>

      <section className="grammar-section">
        <div className="grammar-section__heading">
          <span>01</span>

          <div>
            <small>SEE THE SYSTEM</small>
            <h2>Tense Map</h2>
          </div>
        </div>

        <div className="grammar-timeline">
          <article>
            <span>PAST</span>
            <strong>Before / In progress</strong>
          </article>

          <div className="grammar-timeline__line">
            <i />
          </div>

          <article>
            <span>NOW</span>
            <strong>Present connection</strong>
          </article>

          <div className="grammar-timeline__line">
            <i />
          </div>

          <article>
            <span>FUTURE</span>
            <strong>Expected / Completed</strong>
          </article>
        </div>
      </section>

      {tenseGroups.map((group) => (
        <GrammarTenseFamily
          key={group.id || group.title}
          group={group}
        />
      ))}
      {comparisons.length > 0 && (
        <GrammarCompareLab
          comparisons={comparisons}
        />
      )}

      <section className="grammar-thinking">
        <div>
          <span>THINK LIKE JAK</span>
          <h2>
            Don&apos;t guess the tense.
          </h2>

          <p>
            Ask the right questions before
            choosing the answer.
          </p>
        </div>

        <ol>
          <li>
            <span>1</span>
            <strong>
              Where is the time?
            </strong>
          </li>

          <li>
            <span>2</span>
            <strong>
              Activity or result?
            </strong>
          </li>

          <li>
            <span>3</span>
            <strong>
              Continuing or completed?
            </strong>
          </li>
        </ol>
      </section>
    </div>
  )
}

export default GrammarLessonRenderer