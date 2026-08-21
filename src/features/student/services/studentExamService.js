import { supabase } from '../../../lib/supabase'

function getRpcErrorMessage(
  error,
  fallbackMessage,
) {
  return (
    error?.message ||
    fallbackMessage
  )
}

async function startStudentExam(examId) {
  const cleanExamId =
    String(examId || '').trim()

  if (!cleanExamId) {
    throw new Error(
      'Exam id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'student_start_exam_attempt',
    {
      p_exam_id: cleanExamId,
    },
  )

  if (error) {
    throw new Error(
      getRpcErrorMessage(
        error,
        'The exam could not be started.',
      ),
    )
  }

  return data
}

async function getStudentExamAttempt(
  attemptId,
) {
  const cleanAttemptId =
    String(attemptId || '').trim()

  if (!cleanAttemptId) {
    throw new Error(
      'Attempt id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'student_get_exam_attempt',
    {
      p_attempt_id: cleanAttemptId,
    },
  )

  if (error) {
    throw new Error(
      getRpcErrorMessage(
        error,
        'The exam attempt could not be loaded.',
      ),
    )
  }

  return data
}

async function saveStudentExamAnswer({
  attemptId,
  attemptQuestionId,
  answerJson,
}) {
  const cleanAttemptId =
    String(attemptId || '').trim()

  const cleanAttemptQuestionId =
    String(attemptQuestionId || '').trim()

  if (
    !cleanAttemptId ||
    !cleanAttemptQuestionId
  ) {
    throw new Error(
      'Attempt and question are required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'student_save_exam_answer',
    {
      p_attempt_id: cleanAttemptId,
      p_attempt_question_id:
        cleanAttemptQuestionId,
      p_answer_json: answerJson,
    },
  )

  if (error) {
    throw new Error(
      getRpcErrorMessage(
        error,
        'The answer could not be saved.',
      ),
    )
  }

  return data
}

async function submitStudentExamAttempt(
  attemptId,
) {
  const cleanAttemptId =
    String(attemptId || '').trim()

  if (!cleanAttemptId) {
    throw new Error(
      'Attempt id is required.',
    )
  }

  const { data, error } = await supabase.rpc(
    'student_submit_exam_attempt_v3',
    {
      p_attempt_id: cleanAttemptId,
    },
  )

  if (error) {
    throw new Error(
      getRpcErrorMessage(
        error,
        'The exam could not be submitted.',
      ),
    )
  }

  return data
}


async function listAvailableStudentExams() {
  const { data, error } = await supabase.rpc(
    'student_list_available_exams',
  )

  if (error) {
    throw new Error(
      getRpcErrorMessage(
        error,
        'Available exams could not be loaded.',
      ),
    )
  }

  return Array.isArray(data)
    ? data
    : []
}

async function getStudentExamHistory() {
  const { data, error } = await supabase.rpc(
    'get_student_exam_history',
  )

  if (error) {
    throw new Error(
      getRpcErrorMessage(
        error,
        'Exam history could not be loaded.',
      ),
    )
  }

  return Array.isArray(data)
    ? data
    : []
}
export {
  getStudentExamHistory,
  getStudentExamAttempt,
  listAvailableStudentExams,
  saveStudentExamAnswer,
  startStudentExam,
  submitStudentExamAttempt,
}



