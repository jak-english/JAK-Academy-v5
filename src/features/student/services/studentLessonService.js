import { supabase } from '../../../lib/supabase'

function normalizeProgress(progress) {
  return {
    status: progress?.status || 'not_started',

    progressPercent:
      Number(progress?.progressPercent) || 0,

    lastPosition:
      progress?.lastPosition &&
      typeof progress.lastPosition === 'object'
        ? progress.lastPosition
        : {},

    firstOpenedAt:
      progress?.firstOpenedAt ?? null,

    lastOpenedAt:
      progress?.lastOpenedAt ?? null,

    completedAt:
      progress?.completedAt ?? null,

    totalStudySeconds:
      Number(progress?.totalStudySeconds) || 0,
  }
}

function normalizeLinkedLesson(lesson) {
  if (!lesson) {
    return null
  }

  return {
    id: lesson.id ?? null,
    title: lesson.title ?? '',
    slug: lesson.slug ?? '',
  }
}

function normalizeLessonData(data) {
  const lesson = data?.lesson ?? null

  if (!lesson) {
    return {
      lesson: null,
      generatedAt: data?.generatedAt ?? null,
    }
  }

  return {
    lesson: {
      id: lesson.id ?? null,
      title: lesson.title ?? '',
      slug: lesson.slug ?? '',
      summary: lesson.summary ?? '',

      content:
        lesson.content &&
        typeof lesson.content === 'object'
          ? lesson.content
          : {},

      estimatedMinutes:
        Number(lesson.estimatedMinutes) || 0,

      sortOrder:
        Number(lesson.sortOrder) || 0,

      section: {
        id: lesson.section?.id ?? null,
        title: lesson.section?.title ?? '',
        sectionType:
          lesson.section?.sectionType ?? '',
        sortOrder:
          Number(lesson.section?.sortOrder) || 0,
      },

      unit: {
        id: lesson.unit?.id ?? null,
        title: lesson.unit?.title ?? '',
        slug: lesson.unit?.slug ?? '',
        unitNumber:
          Number(lesson.unit?.unitNumber) || 0,
        unitType:
          lesson.unit?.unitType ?? 'standard',
        description:
          lesson.unit?.description ?? '',
        sortOrder:
          Number(lesson.unit?.sortOrder) || 0,
        isFree: Boolean(lesson.unit?.isFree),
      },

      course: {
        id: lesson.course?.id ?? null,
        title: lesson.course?.title ?? '',
        slug: lesson.course?.slug ?? '',
        subject: lesson.course?.subject ?? '',
        gradeLevel:
          lesson.course?.gradeLevel ?? '',
        cohort: lesson.course?.cohort ?? '',
      },

      progress: normalizeProgress(
        lesson.progress,
      ),

      previousLesson: normalizeLinkedLesson(
        lesson.previousLesson,
      ),

      nextLesson: normalizeLinkedLesson(
        lesson.nextLesson,
      ),
    },

    generatedAt: data?.generatedAt ?? null,
  }
}

async function getStudentLesson(lessonSlug) {
  const cleanLessonSlug =
    String(lessonSlug || '').trim()

  if (!cleanLessonSlug) {
    throw new Error(
      'Lesson slug is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'get_student_lesson',
    {
      target_lesson_slug: cleanLessonSlug,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The lesson could not be loaded.',
    )
  }

  return normalizeLessonData(data)
}

async function openStudentLesson(
  lessonId,
  lastPosition = {},
) {
  const { data, error } = await supabase.rpc(
    'open_lesson',
    {
      target_lesson_id: lessonId,
      new_last_position: lastPosition,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'The lesson could not be opened.',
    )
  }

  return data
}

async function updateStudentLessonProgress({
  lessonId,
  progressPercent,
  lastPosition = {},
}) {
  const { data, error } = await supabase.rpc(
    'update_lesson_progress',
    {
      target_lesson_id: lessonId,
      new_progress_percent: progressPercent,
      new_last_position: lastPosition,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Lesson progress could not be saved.',
    )
  }

  return data
}


async function getStudentVocabularySession(
  lessonId,
  limit = 10,
) {
  const cleanLessonId =
    String(lessonId || '').trim()

  if (!cleanLessonId) {
    throw new Error(
      'Lesson id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'get_student_vocabulary_session',
    {
      p_lesson_id: cleanLessonId,
      p_limit: limit,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Vocabulary session could not be loaded.',
    )
  }

  return data
}

async function submitStudentVocabularyAnswer({
  vocabularyItemId,
  questionType,
  answer = '',
  answerJson = {},
  responseTimeMs = null,
  confidence = null,
}) {
  const cleanItemId =
    String(vocabularyItemId || '').trim()

  const cleanQuestionType =
    String(questionType || '').trim()

  if (!cleanItemId) {
    throw new Error(
      'Vocabulary item id is required.',
    )
  }

  if (!cleanQuestionType) {
    throw new Error(
      'Question type is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'submit_vocabulary_answer_v5',
    {
      p_vocabulary_item_id: cleanItemId,
      p_question_type: cleanQuestionType,
      p_answer_json: {
        ...(
          answerJson &&
          typeof answerJson === 'object'
            ? answerJson
            : {}
        ),
        answer: String(answer ?? '').trim(),
      },
      p_response_time_ms:
        Number.isInteger(responseTimeMs)
          ? responseTimeMs
          : null,
      p_confidence:
        Number.isInteger(confidence)
          ? confidence
          : null,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Vocabulary answer could not be submitted.',
    )
  }

  return data
}

async function getStudentVocabularyLessonSummary(
  lessonId,
) {
  const cleanLessonId =
    String(lessonId || '').trim()

  if (!cleanLessonId) {
    throw new Error(
      'Lesson id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'get_student_vocabulary_lesson_summary_v2',
    {
      p_lesson_id: cleanLessonId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Vocabulary lesson summary could not be loaded.',
    )
  }

  return data
}


async function getStudentVocabularyCatalog(
  lessonId,
) {
  const cleanLessonId =
    String(lessonId || '').trim()

  if (!cleanLessonId) {
    throw new Error(
      'Lesson id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'get_student_vocabulary_catalog',
    {
      p_lesson_id: cleanLessonId,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Vocabulary catalog could not be loaded.',
    )
  }

  return data
}


export {
  getStudentLesson,
  openStudentLesson,
  updateStudentLessonProgress,
  getStudentVocabularySession,
  getStudentVocabularyLessonSummary,
  getStudentVocabularyCatalog,
  submitStudentVocabularyAnswer,
}