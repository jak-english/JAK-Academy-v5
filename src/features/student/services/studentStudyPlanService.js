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

    grammarJourney:
      data?.grammarJourney ?? null,

    studyPlanEngineVersion:
      data?.studyPlanEngineVersion ?? null,

    upcomingLessons:
      Array.isArray(data?.upcomingLessons)
        ? data.upcomingLessons
        : [],

    generatedAt:
      data?.generatedAt ?? null,
  }
}


async function getStudentGrammarPrioritiesV2() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw new Error(
      userError.message ||
        'Student identity could not be loaded.',
    )
  }

  if (!user?.id) {
    throw new Error(
      'Student authentication is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'get_student_grammar_priorities_v2',
    {
      p_student_id: user.id,
    },
  )

  if (error) {
    throw new Error(
      error.message ||
        'Grammar priorities could not be loaded.',
    )
  }

  return Array.isArray(data) ? data : []
}

async function getStudentStudyIntelligence() {
  const { data, error } = await supabase.rpc(
    'get_student_study_intelligence_v4',
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
    'get_student_study_plan_v4',
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
  getStudentGrammarPrioritiesV2,
  getStudentUnresolvedMistakes,
  getStudentDueSpacedReviews,
  submitMistakeRetryAnswer,
  submitSpacedReviewAnswer,
}
