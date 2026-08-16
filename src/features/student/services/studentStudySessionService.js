import { supabase } from '../../../lib/supabase'

function normalizeStudySession(session) {
  if (!session) {
    return null
  }

  return {
    id: session.id ?? null,

    studentId:
      session.student_id ??
      session.studentId ??
      null,

    lessonId:
      session.lesson_id ??
      session.lessonId ??
      null,

    sessionType:
      session.session_type ??
      session.sessionType ??
      'focus',

    status:
      session.status ??
      'active',

    plannedSeconds:
      Number(
        session.planned_seconds ??
          session.plannedSeconds,
      ) || 0,

    elapsedSeconds:
      Number(
        session.duration_seconds ??
          session.durationSeconds ??
          session.elapsed_seconds ??
          session.elapsedSeconds,
      ) || 0,

    accumulatedPauseSeconds:
      Number(
        session.accumulated_pause_seconds ??
          session.accumulatedPauseSeconds,
      ) || 0,

    startedAt:
      session.started_at ??
      session.startedAt ??
      null,

    pausedAt:
      session.paused_at ??
      session.pausedAt ??
      null,

    endedAt:
      session.ended_at ??
      session.endedAt ??
      session.finished_at ??
      session.finishedAt ??
      null,

    createdAt:
      session.created_at ??
      session.createdAt ??
      null,

    updatedAt:
      session.updated_at ??
      session.updatedAt ??
      null,

    raw: session,
  }
}

async function startStudySession({
  lessonId,
  sessionType = 'focus',
  plannedSeconds = 1500,
}) {
  if (!lessonId) {
    throw new Error(
      'Lesson ID is required to start a study session.',
    )
  }

  const safePlannedSeconds = Math.max(
    60,
    Number(plannedSeconds) || 1500,
  )

  const { data, error } = await supabase.rpc(
    'start_study_session',
    {
      target_lesson_id: lessonId,
      new_session_type: sessionType,
      new_planned_seconds:
        safePlannedSeconds,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The study session could not be started.',
    )
  }

  return normalizeStudySession(data)
}

async function pauseStudySession(sessionId) {
  if (!sessionId) {
    throw new Error(
      'Session ID is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'pause_study_session',
    {
      target_session_id: sessionId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The study session could not be paused.',
    )
  }

  return normalizeStudySession(data)
}

async function resumeStudySession(sessionId) {
  if (!sessionId) {
    throw new Error(
      'Session ID is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'resume_study_session',
    {
      target_session_id: sessionId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The study session could not be resumed.',
    )
  }

  return normalizeStudySession(data)
}

async function finishStudySession(sessionId) {
  if (!sessionId) {
    throw new Error(
      'Session ID is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'finish_study_session',
    {
      target_session_id: sessionId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The study session could not be finished.',
    )
  }

  return normalizeStudySession(data)
}

async function cancelStudySession(sessionId) {
  if (!sessionId) {
    throw new Error(
      'Session ID is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'cancel_study_session',
    {
      target_session_id: sessionId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The study session could not be cancelled.',
    )
  }

  return normalizeStudySession(data)
}
async function getActiveStudySession(
  lessonId = null,
) {
  const { data, error } = await supabase.rpc(
    'get_active_study_session',
    {
      target_lesson_id:
        lessonId || null,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The active study session could not be loaded.',
    )
  }

  const session =
    Array.isArray(data)
      ? data[0] || null
      : data || null

  return normalizeStudySession(session)
}
export {
  cancelStudySession,
  finishStudySession,
  getActiveStudySession,
  pauseStudySession,
  resumeStudySession,
  startStudySession,
}