import { supabase } from '../../../lib/supabase'

function normalizeStudyPlanData(data) {
  return {
    today: {
      studySeconds: data?.today?.studySeconds ?? 0,
      completedLessons: data?.today?.completedLessons ?? 0,
    },

    dailyGoal: {
      studyMinutes: data?.dailyGoal?.studyMinutes ?? 45,
      lessonCount: data?.dailyGoal?.lessonCount ?? 2,
    },

    recommendedLesson:
      data?.recommendedLesson ?? null,

    upcomingLessons:
      Array.isArray(data?.upcomingLessons)
        ? data.upcomingLessons
        : [],

    generatedAt:
      data?.generatedAt ?? null,
  }
}


async function getStudentStudyIntelligence() {
  const { data, error } = await supabase.rpc(
    'get_student_study_intelligence',
  )

  if (error) {
    throw new Error(
      error.message ||
      'Study intelligence could not be loaded.',
    )
  }

  return data
}


async function getStudentUnresolvedMistakes() {
  const { data, error } = await supabase.rpc(
    'get_student_unresolved_mistakes',
  )

  if (error) {
    throw new Error(
      error.message ||
      'Student mistakes could not be loaded.',
    )
  }

  return {
    count: data?.count ?? 0,
    mistakes:
      Array.isArray(data?.mistakes)
        ? data.mistakes
        : [],
    generatedAt:
      data?.generatedAt ?? null,
  }
}

async function getStudentStudyPlan() {
  const { data, error } = await supabase.rpc(
    'get_student_study_plan',
  )

  if (error) {
    throw new Error(
      error.message ||
      'Study plan could not be loaded.',
    )
  }

  return normalizeStudyPlanData(data)
}


async function submitMistakeRetryAnswer(
  questionId,
  answerJson,
) {
  const cleanQuestionId =
    String(questionId || '').trim()

  if (!cleanQuestionId) {
    throw new Error(
      'Question id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'submit_mistake_retry_answer',
    {
      p_question_id: cleanQuestionId,
      p_answer_json: answerJson,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
      'Mistake retry could not be submitted.',
    )
  }

  return data
}

async function getStudentDueSpacedReviews() {
  const { data, error } = await supabase.rpc(
    'get_student_due_spaced_reviews',
  )

  if (error) {
    throw new Error(
      error.message ||
      'Due spaced reviews could not be loaded.',
    )
  }

  return {
    count:
      data?.count ?? 0,

    reviews:
      Array.isArray(data?.reviews)
        ? data.reviews
        : [],

    generatedAt:
      data?.generatedAt ?? null,
  }
}


async function submitSpacedReviewAnswer(
  questionId,
  answerJson,
) {
  const cleanQuestionId =
    String(questionId || '').trim()

  if (!cleanQuestionId) {
    throw new Error(
      'Question id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'submit_spaced_review_answer',
    {
      p_question_id: cleanQuestionId,
      p_answer_json: answerJson,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
      'Spaced review answer could not be submitted.',
    )
  }

  return data
}

export {
  getStudentStudyPlan,
  getStudentStudyIntelligence,
  getStudentUnresolvedMistakes,
  getStudentDueSpacedReviews,
  submitMistakeRetryAnswer,
  submitSpacedReviewAnswer,
}
