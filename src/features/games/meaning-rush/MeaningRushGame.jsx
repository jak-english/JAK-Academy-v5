import { useEffect, useMemo, useRef, useState } from 'react'

import {
  getMeaningRushVocabularySession,
  submitStudentVocabularyAnswer,
} from '../../student/services/studentLessonService'

import {
  submitStudentGameResult,
} from '../services/studentGameService'

import { UNIT1_VOCABULARY_LESSON_ID } from '../../student/constants/vocabularyConstants'

import {
  buildMeaningRushRound,
  calculateMeaningRushPoints,
  getPlayableItems,
} from './meaningRushEngine'

import './MeaningRushGame.css'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const STAGE_SIZE = 10

function buildMeaningRushStages(items) {
  const stages = []

  for (
    let index = 0;
    index < items.length;
    index += STAGE_SIZE
  ) {
    stages.push(
      items.slice(index, index + STAGE_SIZE),
    )
  }

  if (
    stages.length > 1 &&
    stages[stages.length - 1].length < 4
  ) {
    const finalStage = stages.pop()

    stages[stages.length - 1] = [
      ...stages[stages.length - 1],
      ...finalStage,
    ]
  }

  return stages
}

function getSpeedLabel(responseTimeMs) {
  if (responseTimeMs <= 1500) {
    return 'LIGHTNING FAST ⚡'
  }

  if (responseTimeMs <= 3000) {
    return 'FAST 🔥'
  }

  return 'GOOD 👍'
}

function MeaningRushGame() {
  const [questions, setQuestions] = useState([])
  const [stages, setStages] = useState([])
  const [currentStageIndex, setCurrentStageIndex] =
    useState(0)
  const [isBossRound, setIsBossRound] =
    useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)

  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCorrectAnswers, setTotalCorrectAnswers] =
    useState(0)
  const [totalAnsweredQuestions, setTotalAnsweredQuestions] =
    useState(0)
  const [weakWordCount, setWeakWordCount] =
    useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const questionStartedAtRef = useRef(0)
  const recycledVocabularyIdsRef = useRef(new Set())
  const weakVocabularyIdsRef = useRef(new Set())
  const gameResultSavedRef = useRef(false)

  useEffect(() => {
    let isMounted = true

    async function loadGame() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const session =
          await getMeaningRushVocabularySession(
            UNIT1_VOCABULARY_LESSON_ID,
            200,
          )

        const playableItems =
          getPlayableItems(session, 200)

        const stageGroups =
          buildMeaningRushStages(playableItems)

        const firstStage =
          stageGroups[0] ?? []

        const round = buildMeaningRushRound(
          {
            ...session,
            items: firstStage,
          },
          firstStage.length,
        )

        if (!isMounted) {
          return
        }

        if (round.length < 4) {
          setErrorMessage(
            'لا توجد مفردات كافية لبدء اللعبة.',
          )
          return
        }

        setStages(stageGroups)
        setCurrentStageIndex(0)
        setQuestions(round)
        setCurrentIndex(0)
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر تحميل لعبة المعاني.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGame()

    return () => {
      isMounted = false
    }
  }, [])

  const currentQuestion =
    questions[currentIndex] ?? null

  useEffect(() => {
    if (!currentQuestion) {
      return
    }

    questionStartedAtRef.current =
      performance.now()
  }, [currentQuestion])

  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0
    }

    return Math.round(
      ((currentIndex + 1) / questions.length) *
        100,
    )
  }, [currentIndex, questions.length])

  const isFinished =
    questions.length > 0 &&
    currentIndex >= questions.length

  const currentStageNumber =
    currentStageIndex + 1

  const isLastStage =
    stages.length > 0 &&
    currentStageIndex === stages.length - 1

  useEffect(() => {
    const shouldSaveResult =
      isFinished &&
      (
        isBossRound ||
        (
          isLastStage &&
          weakWordCount < 4
        )
      )

    if (
      !shouldSaveResult ||
      gameResultSavedRef.current
    ) {
      return
    }

    gameResultSavedRef.current = true

    async function saveResult() {
      try {
        await submitStudentGameResult({
          gameKey: 'meaning_rush',
          score,
          bestStreak,
          correctAnswers: totalCorrectAnswers,
          totalAnswers: totalAnsweredQuestions,
          weakWordsCount: weakWordCount,
          bossCompleted: isBossRound,
        })
      } catch (error) {
        setErrorMessage(
          error.message ||
            'تعذر حفظ نتيجة اللعبة.',
        )
      }
    }

    saveResult()
  }, [
    bestStreak,
    isBossRound,
    isFinished,
    isLastStage,
    score,
    totalAnsweredQuestions,
    totalCorrectAnswers,
    weakWordCount,
  ])


  const isReverse =
    currentQuestion?.questionType ===
    'meaning_ar_en'

  const isDefinition =
    currentQuestion?.questionType ===
    'definition'

  async function handleAnswer(option, event) {
    if (
      !currentQuestion ||
      isSubmitting ||
      feedback
    ) {
      return
    }

    const responseTimeMs = Math.max(
      0,
      Math.round(
        event.timeStamp -
          questionStartedAtRef.current,
      ),
    )

    const isCorrect =
      option === currentQuestion.correctAnswer

    const nextStreak = isCorrect
      ? streak + 1
      : 0

    const points =
      calculateMeaningRushPoints({
        isCorrect,
        responseTimeMs,
        streak: nextStreak,
      })

    setSelectedAnswer(option)

    setFeedback({
      isCorrect,
      correctAnswer:
        currentQuestion.correctAnswer,
      points,
      responseTimeMs,
    })

    setTotalAnsweredQuestions(
      (value) => value + 1,
    )

    if (isCorrect) {
      setScore((value) => value + points)
      setCorrectCount((value) => value + 1)
      setTotalCorrectAnswers(
        (value) => value + 1,
      )
      setStreak(nextStreak)
      setBestStreak((value) =>
        Math.max(value, nextStreak),
      )
    } else {
      setStreak(0)

      const vocabularyItemId =
        currentQuestion.vocabularyItemId

      if (
        !weakVocabularyIdsRef.current.has(
          vocabularyItemId,
        )
      ) {
        weakVocabularyIdsRef.current.add(
          vocabularyItemId,
        )

        setWeakWordCount(
          (value) => value + 1,
        )
      }

      if (
        !recycledVocabularyIdsRef.current.has(
          vocabularyItemId,
        )
      ) {
        recycledVocabularyIdsRef.current.add(
          vocabularyItemId,
        )

        const retrySeed = Array.from(
          String(vocabularyItemId),
        ).reduce(
          (total, character) =>
            total + character.charCodeAt(0),
          0,
        )

        const retryDelay =
          2 + (retrySeed % 3)

        setQuestions((currentQuestions) => {
          const retryQuestion = {
            ...currentQuestion,
            id: `${currentQuestion.id}-retry`,
          }

          const insertAt = Math.min(
            currentIndex + retryDelay + 1,
            currentQuestions.length,
          )

          const nextQuestions = [
            ...currentQuestions,
          ]

          nextQuestions.splice(
            insertAt,
            0,
            retryQuestion,
          )

          return nextQuestions
        })
      }
    }

    try {
      setIsSubmitting(true)

      await submitStudentVocabularyAnswer({
        vocabularyItemId:
          currentQuestion.vocabularyItemId,
        questionType:
          currentQuestion.questionType,
        answer: option,
        answerJson: {
          source: 'meaning_rush',
        },
        responseTimeMs,
        confidence: null,
      })
    } catch (error) {
      setErrorMessage(
        error.message ||
          'تعذر حفظ نتيجة الإجابة.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (!feedback || isSubmitting) {
      return
    }

    setSelectedAnswer('')
    setFeedback(null)
    setCurrentIndex((value) => value + 1)
  }

  function handleNextStage() {
    if (!isFinished || isLastStage) {
      return
    }

    const nextStageIndex =
      currentStageIndex + 1

    const nextStageItems =
      stages[nextStageIndex] ?? []

    const nextRound =
      buildMeaningRushRound(
        {
          items: nextStageItems,
        },
        nextStageItems.length,
      )

    if (nextRound.length < 4) {
      setErrorMessage(
        'تعذر تجهيز المرحلة التالية.',
      )
      return
    }

    recycledVocabularyIdsRef.current =
      new Set()

    setCurrentStageIndex(nextStageIndex)
    setQuestions(nextRound)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setFeedback(null)
    setCorrectCount(0)
    setStreak(0)
  }

  function handleBossRound() {
    const weakIds =
      weakVocabularyIdsRef.current

    const bossItems = stages
      .flat()
      .filter((item) =>
        weakIds.has(item?.id),
      )

    if (bossItems.length < 4) {
      return
    }

    const bossQuestions =
      buildMeaningRushRound(
        {
          items: bossItems,
        },
        bossItems.length,
      )

    if (bossQuestions.length < 4) {
      setErrorMessage(
        'تعذر تجهيز Boss Round.',
      )
      return
    }

    recycledVocabularyIdsRef.current =
      new Set()

    setIsBossRound(true)
    setQuestions(bossQuestions)
    setCurrentIndex(0)
    setSelectedAnswer('')
    setFeedback(null)
    setCorrectCount(0)
    setStreak(0)
  }

  function handleRestart() {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <section className="meaning-rush__state">
        <div className="meaning-rush__loader">
          ⚡
        </div>
        <h2>Preparing your challenge...</h2>
      </section>
    )
  }

  if (errorMessage && questions.length === 0) {
    return (
      <section className="meaning-rush__state">
        <div className="meaning-rush__state-icon">
          ⚡
        </div>
        <h2>Meaning Rush</h2>
        <p>{errorMessage}</p>
      </section>
    )
  }

  if (isFinished) {
    const accuracy = Math.round(
      (correctCount / questions.length) * 100,
    )

    return (
      <section
        className={`meaning-rush meaning-rush--result${
          isBossRound ? ' meaning-rush--boss' : ''
        }`}
      >
        <div className="meaning-rush__shell">
          <div className="meaning-rush__result">
            <div className="meaning-rush__result-bolt">
              ⚡
            </div>

            <p className="meaning-rush__eyebrow">
              {isBossRound
                ? 'BOSS ROUND COMPLETE'
                : isLastStage
                  ? 'ALL STAGES COMPLETE'
                  : `STAGE ${currentStageNumber} COMPLETE`}
            </p>

            <h1>Meaning Rush</h1>

            <p className="meaning-rush__result-message">
              {isBossRound
                ? 'Weak words challenged. Great work!'
                : isLastStage && weakWordCount >= 4
                  ? `${weakWordCount} weak words are waiting for the Boss Round.`
                  : isLastStage
                    ? 'You completed every vocabulary stage!'
                    : `Stage ${currentStageNumber} cleared. Ready for the next one?`}
            </p>

            <div className="meaning-rush__result-score">
              <small>SCORE</small>
              <strong>{score}</strong>
            </div>

            <div className="meaning-rush__result-grid">
              <div>
                <span>🎯 Accuracy</span>
                <strong>{accuracy}%</strong>
              </div>

              <div>
                <span>🔥 Best streak</span>
                <strong>{bestStreak}</strong>
              </div>
            </div>

            <button
              className="meaning-rush__restart"
              type="button"
              onClick={
                isBossRound
                  ? handleRestart
                  : isLastStage &&
                      weakWordCount >= 4
                    ? handleBossRound
                    : isLastStage
                      ? handleRestart
                      : handleNextStage
              }
            >
              {isBossRound
                ? '⚡ Play again'
                : isLastStage &&
                    weakWordCount >= 4
                  ? '⚡ Boss Round'
                  : isLastStage
                    ? '⚡ Play again'
                    : '⚡ Next stage'}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`meaning-rush${
        isBossRound ? ' meaning-rush--boss' : ''
      }`}
    >
      <div className="meaning-rush__ambient meaning-rush__ambient--one" />
      <div className="meaning-rush__ambient meaning-rush__ambient--two" />

      <div className="meaning-rush__shell">
        <header className="meaning-rush__header">
          <div className="meaning-rush__brand">
            <div className="meaning-rush__bolt">
              ⚡
            </div>

            <div>
              <p className="meaning-rush__eyebrow">
                UNIT 1 · VOCABULARY
              </p>

              <h1 className="meaning-rush__title">
                Meaning Rush
              </h1>
            </div>
          </div>

          <div className="meaning-rush__hud">
            <div className="meaning-rush__hud-card">
              <span>⭐ SCORE</span>
              <strong>{score}</strong>
            </div>

            <div
              className={[
                'meaning-rush__hud-card',
                streak >= 3
                  ? 'meaning-rush__hud-card--hot'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span>🔥 STREAK</span>
              <strong>{streak}</strong>
            </div>
          </div>

          {isBossRound && (
            <div className="meaning-rush__boss-banner">
              <span>⚡ FINAL CHALLENGE</span>

              <strong>
                {weakWordCount} WEAK WORDS TO DEFEAT
              </strong>
            </div>
          )}

          <div className="meaning-rush__progress-meta">
            <span>
              {isBossRound
                ? 'BOSS ROUND'
                : `Stage ${currentStageNumber} / ${stages.length}`}
              {' · '}
              Beat the clock · Fast answers earn bonus points
            </span>

            <strong dir="ltr">
              {currentIndex + 1} / {questions.length}
            </strong>
          </div>

          <div
            className="meaning-rush__progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="meaning-rush__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div
            key={currentQuestion.id}
            className="meaning-rush__speed-track"
            aria-hidden="true"
          >
            <div className="meaning-rush__speed-fill" />
          </div>
        </header>

        <main className="meaning-rush__body">
          <div className="meaning-rush__question-label">
            <span>
              {isReverse
                ? 'AR → EN'
                : isDefinition
                  ? 'EN → EN'
                  : 'EN → AR'}
            </span>

            <p>
              {isReverse
                ? 'اختر الكلمة الإنجليزية'
                : isDefinition
                  ? 'اختر الكلمة المناسبة للتعريف'
                  : 'اختر المعنى الصحيح'}
            </p>
          </div>

          <div
            className={[
              'meaning-rush__prompt',
              feedback?.isCorrect
                ? 'meaning-rush__prompt--correct'
                : '',
              feedback && !feedback.isCorrect
                ? 'meaning-rush__prompt--wrong'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            dir={isReverse ? 'rtl' : 'ltr'}
          >
            <span className="meaning-rush__prompt-glow" />
            <h2>{currentQuestion.prompt}</h2>
          </div>

          <div className="meaning-rush__options">
            {currentQuestion.options.map(
              (option, optionIndex) => {
                const isSelected =
                  selectedAnswer === option

                const isCorrectOption =
                  feedback &&
                  option ===
                    currentQuestion.correctAnswer

                const isWrongSelected =
                  feedback &&
                  isSelected &&
                  !feedback.isCorrect

                return (
                  <button
                    key={option}
                    className={[
                      'meaning-rush__option',
                      isCorrectOption
                        ? 'meaning-rush__option--correct'
                        : '',
                      isWrongSelected
                        ? 'meaning-rush__option--wrong'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    type="button"
                    disabled={
                      Boolean(feedback) ||
                      isSubmitting
                    }
                    onClick={(event) =>
                      handleAnswer(option, event)
                    }
                  >
                    <span className="meaning-rush__option-letter">
                      {OPTION_LABELS[optionIndex]}
                    </span>

                    <span className="meaning-rush__option-text">
                      {option}
                    </span>

                    <span className="meaning-rush__option-status">
                      {isCorrectOption
                        ? '✓'
                        : isWrongSelected
                          ? '✕'
                          : '›'}
                    </span>
                  </button>
                )
              },
            )}
          </div>

          {feedback && (
            <div
              className={[
                'meaning-rush__feedback',
                feedback.isCorrect
                  ? 'meaning-rush__feedback--correct'
                  : 'meaning-rush__feedback--wrong',
              ].join(' ')}
            >
              {feedback.isCorrect && (
                <div className="meaning-rush__points-pop">
                  +{feedback.points}
                </div>
              )}

              <div>
                <p className="meaning-rush__feedback-kicker">
                  {feedback.isCorrect
                    ? getSpeedLabel(
                        feedback.responseTimeMs,
                      )
                    : 'KEEP GOING 💪'}
                </p>

                <h3>
                  {feedback.isCorrect
                    ? 'Correct!'
                    : `الصحيح: ${feedback.correctAnswer}`}
                </h3>

                <span>
                  ⏱{' '}
                  {(
                    feedback.responseTimeMs / 1000
                  ).toFixed(1)}
                  s
                </span>
              </div>

              <button
                className="meaning-rush__next"
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
              >
                {isSubmitting
                  ? 'Saving...'
                  : 'Next challenge →'}
              </button>
            </div>
          )}

          {errorMessage && (
            <p className="meaning-rush__error">
              {errorMessage}
            </p>
          )}
        </main>
      </div>
    </section>
  )
}

export default MeaningRushGame