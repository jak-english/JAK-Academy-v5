import { supabase } from '../../../lib/supabase'

import {
  prepareAdminQuestionSave,
} from './questionSavePayload'

async function saveAdminQuestion(
  rawQuestion,
  questionId = null,
) {
  const { rpcPayload } =
    prepareAdminQuestionSave(
      rawQuestion,
      questionId,
    )

  const { data, error } = await supabase.rpc(
    'admin_save_question',
    rpcPayload,
  )

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export {
  prepareAdminQuestionSave,
  saveAdminQuestion,
}
