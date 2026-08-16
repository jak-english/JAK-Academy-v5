import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  cancelStudySession,
  finishStudySession,
  getActiveStudySession,
  pauseStudySession,
  resumeStudySession,
  startStudySession,
} from '../services/studentStudySessionService'

import './FocusTimer.css'

const DEFAULT_FOCUS_SECONDS = 25 * 60

function clampNumber(
  value,
  minimum,
  maximum,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  )
}

function formatTimer(totalSeconds) {
  const safeSeconds = Math.max(
    0,
    Math.floor(Number(totalSeconds) || 0),
  )

  const minutes = Math.floor(
    safeSeconds / 60,
  )

  const seconds = safeSeconds % 60

  return `${String(minutes).padStart(
    2,
    '0',
  )}:${String(seconds).padStart(2, '0')}`
}

function normalizeSessionStatus(status) {
  const cleanStatus = String(
    status || '',
  ).toLowerCase()

  if (
    cleanStatus === 'paused' ||
    cleanStatus === 'pause'
  ) {
    return 'paused'
  }

  if (
    cleanStatus === 'finished' ||
    cleanStatus === 'completed'
  ) {
    return 'finished'
  }

  if (
    cleanStatus === 'cancelled' ||
    cleanStatus === 'canceled'
  ) {
    return 'cancelled'
  }

  if (
    cleanStatus === 'active' ||
    cleanStatus === 'running' ||
    cleanStatus === 'in_progress'
  ) {
    return 'active'
  }

  return cleanStatus || 'idle'
}

function getTimerStatusLabel(status) {
  const labels = {
    idle: 'جاهز',
    active: 'قيد التركيز',
    paused: 'متوقف مؤقتًا',
    finished: 'مكتمل',
    cancelled: 'ملغي',
  }

  return labels[status] || 'جاهز'
}

function getTimestampSeconds(value) {
  if (!value) {
    return null
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return null
  }

  return Math.floor(timestamp / 1000)
}

function calculateRestoredElapsedSeconds(
  session,
) {
  const storedDuration = Math.max(
    0,
    Number(session?.elapsedSeconds) || 0,
  )

  const status = normalizeSessionStatus(
    session?.status,
  )

  const startedAtSeconds =
    getTimestampSeconds(session?.startedAt)

  if (!startedAtSeconds) {
    return storedDuration
  }

  const accumulatedPauseSeconds =
    Math.max(
      0,
      Number(
        session?.accumulatedPauseSeconds,
      ) || 0,
    )

  if (status === 'paused') {
    const pausedAtSeconds =
      getTimestampSeconds(session?.pausedAt)

    if (!pausedAtSeconds) {
      return storedDuration
    }

    const calculatedDuration = Math.max(
      0,
      pausedAtSeconds -
        startedAtSeconds -
        accumulatedPauseSeconds,
    )

    return Math.max(
      storedDuration,
      calculatedDuration,
    )
  }

  if (status === 'active') {
    const nowSeconds = Math.floor(
      Date.now() / 1000,
    )

    const calculatedDuration = Math.max(
      0,
      nowSeconds -
        startedAtSeconds -
        accumulatedPauseSeconds,
    )

    return Math.max(
      storedDuration,
      calculatedDuration,
    )
  }

  return storedDuration
}

function FocusTimer({
  lessonId,
  initialPlannedSeconds =
    DEFAULT_FOCUS_SECONDS,
  onSessionFinished,
}) {
  const safeInitialSeconds = useMemo(
    () =>
      Math.max(
        60,
        Number(initialPlannedSeconds) ||
          DEFAULT_FOCUS_SECONDS,
      ),
    [initialPlannedSeconds],
  )

  const [session, setSession] =
    useState(null)

  const [timerStatus, setTimerStatus] =
    useState('idle')

  const [plannedSeconds, setPlannedSeconds] =
    useState(safeInitialSeconds)

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0)

  const [isWorking, setIsWorking] =
    useState(false)

  const [isRestoring, setIsRestoring] =
    useState(true)

  const [errorMessage, setErrorMessage] =
    useState('')

  const intervalRef = useRef(null)

  const remainingSeconds = Math.max(
    0,
    plannedSeconds - elapsedSeconds,
  )

  const progressPercent =
    plannedSeconds > 0
      ? clampNumber(
          Math.round(
            (elapsedSeconds /
              plannedSeconds) *
              100,
          ),
          0,
          100,
        )
      : 0

  function stopLocalTimer() {
    if (intervalRef.current) {
      window.clearInterval(
        intervalRef.current,
      )

      intervalRef.current = null
    }
  }

  useEffect(() => {
    let isMounted = true

    async function restoreActiveSession() {
      if (!lessonId) {
        setIsRestoring(false)
        return
      }

      try {
        setIsRestoring(true)
        setErrorMessage('')

        const activeSession =
          await getActiveStudySession()

        if (!isMounted) {
          return
        }

        if (!activeSession?.id) {
          setSession(null)
          setTimerStatus('idle')
          setPlannedSeconds(
            safeInitialSeconds,
          )
          setElapsedSeconds(0)
          return
        }

        const restoredStatus =
          normalizeSessionStatus(
            activeSession.status,
          )

        const restoredPlannedSeconds =
          Math.max(
            60,
            Number(
              activeSession.plannedSeconds,
            ) || safeInitialSeconds,
          )

        const restoredElapsedSeconds =
          clampNumber(
            calculateRestoredElapsedSeconds(
              activeSession,
            ),
            0,
            restoredPlannedSeconds,
          )

        setSession(activeSession)

        setPlannedSeconds(
          restoredPlannedSeconds,
        )

        setElapsedSeconds(
          restoredElapsedSeconds,
        )

        setTimerStatus(
          restoredStatus === 'paused'
            ? 'paused'
            : 'active',
        )
      } catch (error) {
        console.error(
          'Restore focus timer error:',
          error,
        )

        if (isMounted) {
          setErrorMessage(
            error.message ||
              'تعذر استعادة جلسة التركيز الحالية.',
          )
        }
      } finally {
        if (isMounted) {
          setIsRestoring(false)
        }
      }
    }

    restoreActiveSession()

    return () => {
      isMounted = false
    }
  }, [lessonId, safeInitialSeconds])

  useEffect(() => {
    stopLocalTimer()

    if (
      timerStatus !== 'active' ||
      remainingSeconds <= 0 ||
      isRestoring
    ) {
      return undefined
    }

    intervalRef.current =
      window.setInterval(() => {
        setElapsedSeconds(
          (currentSeconds) =>
            Math.min(
              plannedSeconds,
              currentSeconds + 1,
            ),
        )
      }, 1000)

    return stopLocalTimer
  }, [
    isRestoring,
    plannedSeconds,
    remainingSeconds,
    timerStatus,
  ])

  useEffect(() => {
    if (
      remainingSeconds !== 0 ||
      timerStatus !== 'active' ||
      !session?.id ||
      isWorking ||
      isRestoring
    ) {
      return
    }

    async function finishExpiredTimer() {
      try {
        setIsWorking(true)
        setErrorMessage('')

        const finishedSession =
          await finishStudySession(
            session.id,
          )

        setSession(finishedSession)
        setTimerStatus('finished')

        if (
          typeof onSessionFinished ===
          'function'
        ) {
          onSessionFinished(
            finishedSession,
          )
        }
      } catch (error) {
        console.error(
          'Automatic timer finish error:',
          error,
        )

        setErrorMessage(
          error.message ||
            'تعذر إنهاء جلسة التركيز.',
        )
      } finally {
        setIsWorking(false)
      }
    }

    finishExpiredTimer()
  }, [
    isRestoring,
    isWorking,
    onSessionFinished,
    remainingSeconds,
    session?.id,
    timerStatus,
  ])

  useEffect(() => {
    return stopLocalTimer
  }, [])

  async function handleStart() {
    if (
      !lessonId ||
      isWorking ||
      isRestoring
    ) {
      return
    }

    try {
      setIsWorking(true)
      setErrorMessage('')

      const startedSession =
        await startStudySession({
          lessonId,
          sessionType: 'focus',
          plannedSeconds,
        })

      const returnedPlannedSeconds =
        Number(
          startedSession
            ?.plannedSeconds,
        ) || plannedSeconds

      const returnedElapsedSeconds =
        Number(
          startedSession
            ?.elapsedSeconds,
        ) || 0

      setSession(startedSession)

      setPlannedSeconds(
        returnedPlannedSeconds,
      )

      setElapsedSeconds(
        clampNumber(
          returnedElapsedSeconds,
          0,
          returnedPlannedSeconds,
        ),
      )

      setTimerStatus(
        normalizeSessionStatus(
          startedSession?.status,
        ) === 'paused'
          ? 'paused'
          : 'active',
      )
    } catch (error) {
      console.error(
        'Start focus timer error:',
        error,
      )

      setErrorMessage(
        error.message ||
          'تعذر بدء جلسة التركيز.',
      )
    } finally {
      setIsWorking(false)
    }
  }

  async function handlePause() {
    if (!session?.id || isWorking) {
      return
    }

    try {
      setIsWorking(true)
      setErrorMessage('')

      stopLocalTimer()

      const pausedSession =
        await pauseStudySession(
          session.id,
        )

      setSession(pausedSession)

      setElapsedSeconds(
        clampNumber(
          calculateRestoredElapsedSeconds(
            pausedSession,
          ),
          0,
          plannedSeconds,
        ),
      )

      setTimerStatus('paused')
    } catch (error) {
      console.error(
        'Pause focus timer error:',
        error,
      )

      setErrorMessage(
        error.message ||
          'تعذر إيقاف جلسة التركيز مؤقتًا.',
      )
    } finally {
      setIsWorking(false)
    }
  }

  async function handleResume() {
    if (!session?.id || isWorking) {
      return
    }

    try {
      setIsWorking(true)
      setErrorMessage('')

      const resumedSession =
        await resumeStudySession(
          session.id,
        )

      setSession(resumedSession)

      setElapsedSeconds(
        clampNumber(
          calculateRestoredElapsedSeconds(
            resumedSession,
          ),
          0,
          plannedSeconds,
        ),
      )

      setTimerStatus('active')
    } catch (error) {
      console.error(
        'Resume focus timer error:',
        error,
      )

      setErrorMessage(
        error.message ||
          'تعذر استكمال جلسة التركيز.',
      )
    } finally {
      setIsWorking(false)
    }
  }

  async function handleFinish() {
    if (!session?.id || isWorking) {
      return
    }

    try {
      setIsWorking(true)
      setErrorMessage('')

      stopLocalTimer()

      const finishedSession =
        await finishStudySession(
          session.id,
        )

      setSession(finishedSession)

      setElapsedSeconds(
        clampNumber(
          Number(
            finishedSession
              ?.elapsedSeconds,
          ) || elapsedSeconds,
          0,
          plannedSeconds,
        ),
      )

      setTimerStatus('finished')

      if (
        typeof onSessionFinished ===
        'function'
      ) {
        onSessionFinished(
          finishedSession,
        )
      }
    } catch (error) {
      console.error(
        'Finish focus timer error:',
        error,
      )

      setErrorMessage(
        error.message ||
          'تعذر إنهاء جلسة التركيز.',
      )
    } finally {
      setIsWorking(false)
    }
  }

  async function handleCancel() {
    if (!session?.id || isWorking) {
      return
    }

    try {
      setIsWorking(true)
      setErrorMessage('')

      stopLocalTimer()

      await cancelStudySession(
        session.id,
      )

      setSession(null)
      setTimerStatus('idle')
      setElapsedSeconds(0)
    } catch (error) {
      console.error(
        'Cancel focus timer error:',
        error,
      )

      setErrorMessage(
        error.message ||
          'تعذر إلغاء جلسة التركيز.',
      )
    } finally {
      setIsWorking(false)
    }
  }

  function handleReset() {
    stopLocalTimer()
    setSession(null)
    setTimerStatus('idle')
    setElapsedSeconds(0)
    setErrorMessage('')
  }

  function handleDurationChange(event) {
    if (timerStatus !== 'idle') {
      return
    }

    const selectedMinutes =
      Number(event.target.value) || 25

    setPlannedSeconds(
      selectedMinutes * 60,
    )
  }

  function renderMainAction() {
    if (isRestoring) {
      return (
        <button
          className="focus-timer__button focus-timer__button--primary"
          type="button"
          disabled
        >
          جارٍ استعادة الجلسة...
        </button>
      )
    }

    if (timerStatus === 'idle') {
      return (
        <button
          className="focus-timer__button focus-timer__button--primary"
          type="button"
          disabled={!lessonId || isWorking}
          onClick={handleStart}
        >
          {isWorking
            ? 'جارٍ البدء...'
            : 'ابدأ التركيز'}
        </button>
      )
    }

    if (timerStatus === 'active') {
      return (
        <button
          className="focus-timer__button focus-timer__button--primary"
          type="button"
          disabled={isWorking}
          onClick={handlePause}
        >
          {isWorking
            ? 'جارٍ الإيقاف...'
            : 'إيقاف مؤقت'}
        </button>
      )
    }

    if (timerStatus === 'paused') {
      return (
        <button
          className="focus-timer__button focus-timer__button--primary"
          type="button"
          disabled={isWorking}
          onClick={handleResume}
        >
          {isWorking
            ? 'جارٍ الاستكمال...'
            : 'استكمال الجلسة'}
        </button>
      )
    }

    return (
      <button
        className="focus-timer__button focus-timer__button--primary"
        type="button"
        onClick={handleReset}
      >
        ابدأ جلسة جديدة
      </button>
    )
  }

  return (
    <section className="focus-timer" dir="rtl">
      <div className="focus-timer__header">
        <div>
          <span>جلسة التركيز</span>
          <h2>ادرس بتركيز وهدف</h2>
        </div>

        <div
          className={`focus-timer__status focus-timer__status--${timerStatus}`}
        >
          {isRestoring
            ? 'جارٍ التحميل'
            : getTimerStatusLabel(
                timerStatus,
              )}
        </div>
      </div>

     <div className="focus-timer__clock">
  {timerStatus === 'finished'
    ? formatTimer(elapsedSeconds)
    : formatTimer(remainingSeconds)}
</div>

      <div className="focus-timer__progress">
        <span
          style={{
            width: `${progressPercent}%`,
          }}
        />
      </div>

      <div className="focus-timer__details">
        <span>
  تمت الدراسة {formatTimer(elapsedSeconds)}
</span>

        <span>
          مكتمل {progressPercent}%
        </span>
      </div>

      {timerStatus === 'idle' &&
        !isRestoring && (
          <label className="focus-timer__duration">
            <span>مدة الجلسة</span>

            <select
              value={plannedSeconds / 60}
              onChange={
                handleDurationChange
              }
            >
              <option value="15">
                15 دقيقة
              </option>

              <option value="25">
                25 دقيقة
              </option>

              <option value="45">
                45 دقيقة
              </option>

              <option value="60">
                60 دقيقة
              </option>
            </select>
          </label>
        )}

      {errorMessage && (
        <p
          className="focus-timer__error"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className="focus-timer__actions">
        {renderMainAction()}

        {!isRestoring &&
          (timerStatus === 'active' ||
            timerStatus === 'paused') && (
            <>
              <button
                className="focus-timer__button"
                type="button"
                disabled={isWorking}
                onClick={handleFinish}
              >
                إنهاء الجلسة
              </button>

              <button
                className="focus-timer__button focus-timer__button--danger"
                type="button"
                disabled={isWorking}
                onClick={handleCancel}
              >
                إلغاء الجلسة
              </button>
            </>
          )}
      </div>
    </section>
  )
}

export default FocusTimer

